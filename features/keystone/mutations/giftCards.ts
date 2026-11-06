import crypto from "node:crypto";
import Stripe from "stripe";
import { permissions } from "../access";
import { shopperError } from "../lib/shopperError";
import { assertCartAccess } from "../security/cart-access";
import { checkoutKey } from "../checkout/recovery";
import {
  GIFT_CARD_AMOUNTS,
  GIFT_CARD_SOURCE,
  GIFT_CARD_VALID_YEARS,
  giftCardEmail,
  giftCodeFor,
  heldFor,
  ledgerOf,
  money,
  normalizeGiftCode,
  purchaseToken,
  purchaseTokenOk,
  releaseGiftCardBalances,
  validatePurchase,
  type LedgerEntry,
} from "../lib/gift-cards";

const CHECKOUT_MINUTES = 30;
const PURCHASE_PATH = "giftCardPurchase";

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Gift cards are unavailable right now");
  return new Stripe(key);
}

function storeLink() {
  return (process.env.SMTP_STORE_LINK || "").replace(/\/$/, "");
}

async function storeName(prisma: any) {
  const store = await prisma.store.findFirst({ select: { name: true } });
  return store?.name || "our store";
}

async function regionFor(prisma: any, countryCode: string) {
  const code = String(countryCode || "").toLowerCase();
  if (!/^[a-z]{2}$/.test(code)) throw new Error("Choose a country");
  const region = await prisma.region.findFirst({
    where: { countries: { some: { iso2: code } } },
    select: { id: true, currency: { select: { code: true } } },
  });
  if (!region?.currency?.code) throw new Error("Gift cards aren't sold in this country");
  return { id: region.id, currencyCode: region.currency.code.toLowerCase() };
}

// -------------------------------------------------------------------- storefront

export async function giftCardOptions(_root: unknown, { countryCode }: { countryCode: string }, context: any) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || (process.env.SESSION_SECRET || "").length < 32) throw new Error("off");
    const region = await regionFor(context.sudo().prisma, countryCode);
    return { online: true, amounts: GIFT_CARD_AMOUNTS, currencyCode: region.currencyCode };
  } catch {
    return { online: false, amounts: [], currencyCode: null };
  }
}

/** Opens Stripe Checkout for a gift card; the card itself is created only once Stripe reports it paid. */
export async function startGiftCardPurchase(
  _root: unknown,
  args: { countryCode: string; amount: number; purchaserName: string; purchaserEmail: string; recipientName?: string | null; recipientEmail?: string | null; message?: string | null },
  context: any
) {
  const order = (() => {
    try { return validatePurchase(args); } catch (error: any) { throw shopperError(error.message, "INVALID_GIFT_CARD_ORDER"); }
  })();
  const prisma = context.sudo().prisma;
  const region = await regionFor(prisma, args.countryCode);
  const since = new Date(Date.now() - 15 * 60_000);
  const recent = await prisma.idempotencyKey.count({
    where: { requestPath: PURCHASE_PATH, createdAt: { gte: since }, requestParams: { path: ["purchaserEmail"], equals: order.purchaserEmail } },
  });
  if (recent >= 5) throw shopperError("Too many gift card orders. Try again in 15 minutes.", "RATE_LIMITED");

  const attempt = await prisma.idempotencyKey.create({
    data: {
      idempotencyKey: `gift-card-purchase:${crypto.randomUUID()}`,
      requestMethod: "POST",
      requestPath: PURCHASE_PATH,
      requestParams: { ...order, countryCode: args.countryCode.toLowerCase(), regionId: region.id, currencyCode: region.currencyCode },
      recoveryPoint: "started",
    },
  });
  const ref = attempt.id;
  const base = storeLink();
  if (!base) throw new Error("Gift cards are unavailable right now");
  const back = `${base}/${args.countryCode.toLowerCase()}/gift-cards/order?ref=${encodeURIComponent(ref)}&token=${purchaseToken(ref)}`;
  try {
    const name = await storeName(prisma);
    const session = await stripeClient().checkout.sessions.create({
      mode: "payment",
      customer_email: order.purchaserEmail,
      line_items: [{
        quantity: 1,
        price_data: { currency: region.currencyCode, unit_amount: order.amount, product_data: { name: `${name} gift card · ${money(order.amount, region.currencyCode)}`.slice(0, 200) } },
      }],
      metadata: { source: GIFT_CARD_SOURCE, ref },
      payment_intent_data: { metadata: { source: GIFT_CARD_SOURCE, ref } },
      success_url: back,
      cancel_url: `${back}&result=cancelled`,
      expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_MINUTES * 60 + 60,
    }, { idempotencyKey: `gift-card-checkout:${ref}` });
    await prisma.idempotencyKey.update({
      where: { id: ref },
      data: { recoveryPoint: "checkout_open", responseBody: { checkoutSessionId: session.id } },
    });
    if (!session.url) throw new Error("No checkout URL");
    return { checkoutUrl: session.url };
  } catch (error) {
    await prisma.idempotencyKey.update({
      where: { id: ref },
      data: { recoveryPoint: "failed", responseBody: { error: error instanceof Error ? error.message.slice(0, 500) : "Checkout failed" } },
    });
    throw shopperError("Online gift cards are unavailable right now. Try again in a moment.", "GIFT_CARD_CHECKOUT_FAILED");
  }
}

/** Issues the card exactly once for a paid checkout and emails the code. */
export async function fulfillGiftCardPurchase(prisma: any, ref: string, deps: { stripe?: any; send?: (m: any) => Promise<any> } = {}) {
  const attempt = await prisma.idempotencyKey.findUnique({ where: { id: ref } });
  if (!attempt || attempt.requestPath !== PURCHASE_PATH) throw new Error("Gift card order not found");
  if (attempt.recoveryPoint === "completed") return attempt;
  const sessionId = attempt.responseBody?.checkoutSessionId;
  if (!sessionId) return attempt;
  const session: any = await (deps.stripe || stripeClient()).checkout.sessions.retrieve(sessionId);
  const order = attempt.requestParams || {};
  if (session?.metadata?.source !== GIFT_CARD_SOURCE || session?.metadata?.ref !== ref) throw new Error("Checkout does not belong to this gift card order");
  if (session.amount_total !== order.amount || String(session.currency).toLowerCase() !== order.currencyCode) throw new Error("Gift card amount does not match the checkout");
  if (session.status === "expired") {
    await prisma.idempotencyKey.updateMany({ where: { id: ref, recoveryPoint: "checkout_open" }, data: { recoveryPoint: "expired" } });
    return { ...attempt, recoveryPoint: "expired" };
  }
  if (session.status !== "complete" || session.payment_status !== "paid") return attempt;
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || "";
  if (!paymentIntentId) throw new Error("Paid checkout has no payment reference");

  const issued = await prisma.$transaction(async (tx: any) => {
    const claimed = await tx.idempotencyKey.updateMany({
      where: { id: ref, recoveryPoint: "checkout_open" },
      data: { recoveryPoint: "issuing", lockedAt: new Date() },
    });
    if (claimed.count !== 1) return null;
    const now = new Date();
    const endsAt = new Date(now);
    endsAt.setFullYear(endsAt.getFullYear() + GIFT_CARD_VALID_YEARS);
    const code = giftCodeFor(paymentIntentId);
    const ledger: LedgerEntry[] = [{ at: now.toISOString(), type: "issue", amount: order.amount, balance: order.amount, ref: paymentIntentId }];
    const card = await tx.giftCard.create({
      data: {
        code, value: order.amount, balance: order.amount, endsAt, regionId: order.regionId,
        metadata: {
          source: GIFT_CARD_SOURCE, purchaseRef: ref, paymentIntentId, currencyCode: order.currencyCode, countryCode: order.countryCode,
          purchaserName: order.purchaserName, purchaserEmail: order.purchaserEmail, recipientName: order.recipientName,
          recipientEmail: order.recipientEmail, message: order.message, ledger,
        },
      },
    });
    await tx.idempotencyKey.update({
      where: { id: ref },
      data: { recoveryPoint: "completed", lockedAt: null, responseBody: { checkoutSessionId: sessionId, paymentIntentId, giftCardId: card.id } },
    });
    return card;
  });
  if (issued) await emailGiftCard(prisma, issued.id, deps.send);
  return prisma.idempotencyKey.findUnique({ where: { id: ref } });
}

/** The code goes to the recipient once (claimed via metadata.emailedAt); a failed send is unclaimed so staff can resend. */
export async function emailGiftCard(prisma: any, giftCardId: string, send?: (m: any) => Promise<any>) {
  try {
    if (!send && (!process.env.SMTP_HOST || !process.env.SMTP_FROM)) return false;
    const card = await prisma.giftCard.findUnique({ where: { id: giftCardId } });
    const meta = card?.metadata || {};
    if (!card || meta.emailedAt || !meta.recipientEmail) return false;
    const claimed = await prisma.giftCard.updateMany({
      where: { id: giftCardId, updatedAt: card.updatedAt },
      data: { metadata: { ...meta, emailedAt: new Date().toISOString() } },
    });
    if (claimed.count !== 1) return false;
    const mail = giftCardEmail({
      storeName: await storeName(prisma), code: card.code, amount: card.value, currencyCode: meta.currencyCode || "usd",
      purchaserName: meta.purchaserName || "", purchaserEmail: meta.purchaserEmail || "", recipientName: meta.recipientName || "",
      recipientEmail: meta.recipientEmail, message: meta.message || "", endsAt: card.endsAt,
      shopUrl: storeLink() ? `${storeLink()}/${meta.countryCode || "us"}/store` : "",
    });
    const sender = send || (await import("../lib/mail")).sendStoreEmail;
    await sender({ to: meta.recipientEmail, subject: mail.subject, html: mail.html, text: mail.text });
    return true;
  } catch (error) {
    console.error("Gift card email failed:", error instanceof Error ? error.message : "unknown");
    try {
      const card = await prisma.giftCard.findUnique({ where: { id: giftCardId } });
      if (card?.metadata?.emailedAt) {
        const { emailedAt, ...rest } = card.metadata;
        await prisma.giftCard.update({ where: { id: giftCardId }, data: { metadata: rest } });
      }
    } catch { /* bookkeeping only */ }
    return false;
  }
}

/** The buyer's return page; the signed ref proves the order is theirs. */
export async function confirmGiftCardPurchase(_root: unknown, { ref, token }: { ref: string; token: string }, context: any) {
  if (!ref || ref.length > 100 || !purchaseTokenOk(ref, token)) throw shopperError("We couldn't find that gift card order", "NOT_FOUND");
  const prisma = context.sudo().prisma;
  let attempt = await prisma.idempotencyKey.findUnique({ where: { id: ref } });
  if (!attempt || attempt.requestPath !== PURCHASE_PATH) throw shopperError("We couldn't find that gift card order", "NOT_FOUND");
  if (attempt.recoveryPoint === "checkout_open") {
    try { attempt = await fulfillGiftCardPurchase(prisma, ref); } catch { /* shown as still confirming */ }
  }
  const order = attempt.requestParams || {};
  const card = attempt.responseBody?.giftCardId ? await prisma.giftCard.findUnique({ where: { id: attempt.responseBody.giftCardId } }) : null;
  return {
    status: card ? (card.isDisabled ? "voided" : "active") : ["expired", "failed"].includes(attempt.recoveryPoint) ? "cancelled" : "pending",
    amount: order.amount || 0,
    currencyCode: order.currencyCode || "usd",
    recipientName: order.recipientName || null,
    recipientEmail: order.recipientEmail || null,
    code: card && !card.isDisabled ? card.code : null,
    endsAt: card?.endsAt ? new Date(card.endsAt).toISOString() : null,
  };
}

/** Stripe webhook entry: a paid gift-card checkout issues the card even if the buyer never returns. */
export async function handleGiftCardCheckoutEvent(prisma: any, resource: any) {
  if (resource?.object !== "checkout.session" || resource?.metadata?.source !== GIFT_CARD_SOURCE || !resource.metadata.ref) return false;
  await fulfillGiftCardPurchase(prisma, String(resource.metadata.ref));
  return true;
}

// -------------------------------------------------------------- checkout tender

const cartCardsSelect = { id: true, code: true, balance: true, isDisabled: true, endsAt: true, regionId: true, metadata: true };

export async function applyGiftCardToActiveCart(_root: unknown, { cartId, code }: { cartId: string; code: string }, context: any) {
  await assertCartAccess(context, cartId);
  const normalized = normalizeGiftCode(code);
  if (!normalized) throw shopperError("Enter the 12-character gift card code", "GIFT_CARD_INVALID");
  const prisma = context.sudo().prisma;
  const cart = await prisma.cart.findUnique({ where: { id: cartId }, select: { id: true, regionId: true, orderId: true, giftCards: { select: { id: true } } } });
  if (!cart || cart.orderId) throw shopperError("This cart can't be changed", "CART_COMPLETED");
  const card = await prisma.giftCard.findUnique({ where: { code: normalized }, select: cartCardsSelect });
  if (!card) throw shopperError("That gift card code wasn't found", "GIFT_CARD_INVALID");
  if (card.isDisabled) throw shopperError("This gift card is no longer active", "GIFT_CARD_INVALID");
  if (card.endsAt && new Date(card.endsAt) <= new Date()) throw shopperError("This gift card has expired", "GIFT_CARD_INVALID");
  if (card.balance + Math.max(0, heldFor(ledgerOf(card), checkoutKey(cartId))) <= 0) throw shopperError("This gift card has no balance left", "GIFT_CARD_INVALID");
  if (card.regionId && cart.regionId && card.regionId !== cart.regionId) throw shopperError("This gift card is for a different currency", "GIFT_CARD_INVALID");
  if (cart.giftCards.some((c: any) => c.id === card.id)) return { id: cartId };
  if (cart.giftCards.length >= 5) throw shopperError("Use up to 5 gift cards per order", "GIFT_CARD_LIMIT");
  await context.sudo().db.Cart.updateOne({
    where: { id: cartId },
    data: { giftCards: { connect: [{ id: card.id }] }, paymentCollection: { disconnect: true } },
  });
  return { id: cartId };
}

export async function removeGiftCardFromActiveCart(_root: unknown, { cartId, code }: { cartId: string; code: string }, context: any) {
  await assertCartAccess(context, cartId);
  const normalized = normalizeGiftCode(code);
  const prisma = context.sudo().prisma;
  const cart = await prisma.cart.findUnique({ where: { id: cartId }, select: { orderId: true, giftCards: { select: { id: true, code: true } } } });
  if (!cart || cart.orderId) throw shopperError("This cart can't be changed", "CART_COMPLETED");
  const card = cart.giftCards.find((c: any) => c.code === normalized);
  if (!card) return { id: cartId };
  const attempt = await prisma.idempotencyKey.findUnique({ where: { idempotencyKey: checkoutKey(cartId) }, select: { recoveryPoint: true } });
  if (attempt && ["payment_unknown", "payment_confirmed", "order_created"].includes(attempt.recoveryPoint)) {
    throw shopperError("Your payment is being confirmed. Refresh in a moment.", "CHECKOUT_IN_PROGRESS");
  }
  // A balance held by an earlier, unfinished payment attempt goes back to the card first.
  await releaseGiftCardBalances(prisma, [card.id], checkoutKey(cartId));
  await context.sudo().db.Cart.updateOne({
    where: { id: cartId },
    data: { giftCards: { disconnect: [{ id: card.id }] }, paymentCollection: { disconnect: true } },
  });
  return { id: cartId };
}

// ------------------------------------------------------------------------ staff

function assertStaff(context: any) {
  if (!permissions.canManageGiftCards({ session: context.session })) throw new Error("Access denied");
}

async function appendLedger(tx: any, card: any, entry: Omit<LedgerEntry, "at">, data: Record<string, unknown> = {}) {
  const ledger = ledgerOf(card);
  const updated = await tx.giftCard.updateMany({
    where: { id: card.id, balance: card.balance },
    data: { ...data, balance: entry.balance, metadata: { ...(card.metadata || {}), ledger: [...ledger, { ...entry, at: new Date().toISOString() }] } },
  });
  if (updated.count !== 1) throw new Error("The gift card balance changed. Reload and try again.");
}

/**
 * Refunds the remaining balance to the buyer's card (Shopify: a purchased gift card is refundable
 * while it has a balance). The card is zeroed and disabled first so it can't be spent meanwhile.
 */
export async function refundGiftCard(_root: unknown, { giftCardId, reason }: { giftCardId: string; reason: string }, context: any) {
  assertStaff(context);
  const note = String(reason || "").trim().slice(0, 300);
  if (!note) throw new Error("Give a reason for the refund");
  const prisma = context.sudo().prisma;
  const card = await prisma.giftCard.findUnique({ where: { id: giftCardId } });
  if (!card) throw new Error("Gift card not found");
  const meta = card.metadata || {};
  if (!meta.paymentIntentId) throw new Error("This gift card wasn't bought online, so there is no card payment to refund");
  const ref = `gift-card-refund:${card.id}`;
  let amount = ledgerOf(card).find((row) => row.ref === ref)?.amount;
  if (amount === undefined) {
    if (card.balance <= 0) throw new Error("This gift card has no balance left to refund");
    amount = card.balance;
    await prisma.$transaction(async (tx: any) => {
      await appendLedger(tx, card, { type: "refund", amount: amount!, balance: 0, ref, note }, { isDisabled: true });
    });
  }
  const refund = await stripeClient().refunds.create(
    { payment_intent: meta.paymentIntentId, amount, metadata: { source: GIFT_CARD_SOURCE, giftCardId: card.id } },
    { idempotencyKey: ref }
  );
  const fresh = await prisma.giftCard.findUnique({ where: { id: card.id } });
  await prisma.giftCard.update({
    where: { id: card.id },
    data: { metadata: { ...(fresh.metadata || {}), refundId: refund.id, refundedAt: new Date().toISOString(), refundedAmount: amount } },
  });
  return { id: card.id, refunded: amount, status: refund.status };
}

/** Voids a card without a refund (lost, fraud, or issued by mistake). */
export async function voidGiftCard(_root: unknown, { giftCardId, reason }: { giftCardId: string; reason: string }, context: any) {
  assertStaff(context);
  const note = String(reason || "").trim().slice(0, 300);
  if (!note) throw new Error("Give a reason for voiding the card");
  const prisma = context.sudo().prisma;
  const card = await prisma.giftCard.findUnique({ where: { id: giftCardId } });
  if (!card) throw new Error("Gift card not found");
  if (card.isDisabled) return { id: card.id };
  await prisma.$transaction(async (tx: any) => {
    await appendLedger(tx, card, { type: "void", amount: card.balance, balance: 0, ref: `gift-card-void:${card.id}`, note }, { isDisabled: true });
  });
  return { id: card.id };
}

/** Puts an order's gift-card payment back on the card (the store-credit side of an order refund). */
export async function returnGiftCardPayment(_root: unknown, { orderId, giftCardId, amount, reason }: { orderId: string; giftCardId: string; amount: number; reason: string }, context: any) {
  if (!permissions.canManageOrders({ session: context.session }) && !permissions.canManageGiftCards({ session: context.session })) throw new Error("Access denied");
  const note = String(reason || "").trim().slice(0, 300);
  if (!note) throw new Error("Give a reason");
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Enter an amount");
  const prisma = context.sudo().prisma;
  return prisma.$transaction(async (tx: any) => {
    const used = await tx.giftCardTransaction.findMany({ where: { orderId, giftCardId }, select: { amount: true } });
    const paid = used.reduce((sum: number, row: any) => sum + row.amount, 0);
    const card = await tx.giftCard.findUnique({ where: { id: giftCardId } });
    if (!card || !paid) throw new Error("This gift card didn't pay for this order");
    const returned = ledgerOf(card).filter((row) => row.type === "return" && row.ref === `order:${orderId}`).reduce((s, r) => s + r.amount, 0);
    if (returned + amount > paid) throw new Error(`Only ${money(paid - returned, card.metadata?.currencyCode || "usd")} of this order was paid by the card`);
    const balance = card.balance + amount;
    await appendLedger(tx, card, { type: "return", amount, balance, ref: `order:${orderId}`, note });
    await tx.orderEvent.create({
      data: { orderId, type: "REFUND_PROCESSED", data: { giftCardId, amount, tender: "gift_card" }, userId: context.session?.itemId || null },
    });
    return { id: card.id, balance };
  });
}

export const giftCardTypeDefs = `
  type GiftCardOptions { online: Boolean!, amounts: [Int!]!, currencyCode: String }
  type GiftCardCheckout { checkoutUrl: String! }
  type GiftCardPurchase { status: String!, amount: Int!, currencyCode: String!, recipientName: String, recipientEmail: String, code: String, endsAt: String }
`;
export const giftCardQueryDefs = `
    giftCardOptions(countryCode: String!): GiftCardOptions!
`;
export const giftCardMutationDefs = `
    startGiftCardPurchase(countryCode: String!, amount: Int!, purchaserName: String!, purchaserEmail: String!, recipientName: String, recipientEmail: String, message: String): GiftCardCheckout!
    confirmGiftCardPurchase(ref: ID!, token: String!): GiftCardPurchase!
    applyGiftCardToActiveCart(cartId: ID!, code: String!): JSON!
    removeGiftCardFromActiveCart(cartId: ID!, code: String!): JSON!
    refundGiftCard(giftCardId: ID!, reason: String!): JSON!
    voidGiftCard(giftCardId: ID!, reason: String!): JSON!
    returnGiftCardPayment(orderId: ID!, giftCardId: ID!, amount: Int!, reason: String!): JSON!
`;
