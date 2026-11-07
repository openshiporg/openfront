import crypto from "node:crypto";
import { emailButton, emailHeading, emailLayout, emailPanel, emailParagraph } from "./email-layout";

/**
 * Gift cards (Shopify default): a shopper buys a fixed amount through Stripe Checkout and the card is
 * issued only after Stripe reports the session paid. The code is shown on the return page and emailed
 * to the recipient once. At checkout a code is a tender, not a discount: tax is unchanged and the card
 * pays first, the rest goes to the card. The balance is held when checkout starts (released if the
 * payment fails) and every movement is appended to the card's ledger in GiftCard.metadata.ledger, with
 * a GiftCardTransaction row per order. Staff can refund the remaining balance to the buyer's card, void
 * a card, or put an order's gift-card amount back on the card.
 */
export const GIFT_CARD_SOURCE = "openfront-gift-card";
export const GIFT_CARD_AMOUNTS = [2500, 5000, 7500, 10000, 15000, 20000];
export const GIFT_CARD_VALID_YEARS = 1;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LedgerEntry = {
  at: string;
  type: "issue" | "hold" | "release" | "return" | "refund" | "void";
  amount: number;
  balance: number;
  ref: string;
  note?: string;
};

export function ledgerOf(card: { metadata?: any }): LedgerEntry[] {
  return Array.isArray(card?.metadata?.ledger) ? card.metadata.ledger : [];
}

/** 12 hex characters in groups of four, derived from the paid checkout so a replay issues the same code. */
export function giftCodeFor(seed: string) {
  return crypto.createHash("sha256").update(`openfront-gift:${seed}`).digest("hex").slice(0, 12).toUpperCase().match(/.{4}/g)!.join("-");
}

export function normalizeGiftCode(code: string) {
  const raw = String(code || "").toUpperCase().replace(/[^0-9A-F]/g, "");
  return raw.length === 12 && /^[0-9A-F-\s]+$/.test(String(code || "").toUpperCase().trim()) ? raw.match(/.{4}/g)!.join("-") : "";
}

export function money(cents: number, currencyCode = "usd") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode.toUpperCase() }).format(cents / 100);
}

export function isUsable(card: { balance?: number | null; isDisabled?: boolean | null; endsAt?: string | Date | null }, now = new Date()) {
  return !card.isDisabled && (card.balance || 0) > 0 && (!card.endsAt || new Date(card.endsAt) > now);
}

/** Cards pay in the order they were added, each up to its balance, never more than the total. */
export function allocateGiftCards(
  cards: Array<{ id: string; balance?: number | null; isDisabled?: boolean | null; endsAt?: string | Date | null }>,
  total: number,
  now = new Date()
) {
  let remaining = Math.max(0, Math.round(total));
  const allocations: Array<{ id: string; amount: number }> = [];
  for (const card of cards || []) {
    if (!isUsable(card, now) || remaining <= 0) continue;
    const amount = Math.min(card.balance || 0, remaining);
    allocations.push({ id: card.id, amount });
    remaining -= amount;
  }
  return { allocations, applied: Math.max(0, Math.round(total)) - remaining, remaining };
}

/** Amount currently held for a checkout key: holds minus releases. */
export function heldFor(ledger: LedgerEntry[], ref: string) {
  return ledger.reduce((sum, row) => row.ref !== ref ? sum : row.type === "hold" ? sum + row.amount : row.type === "release" ? sum - row.amount : sum, 0);
}

export type PurchaseInput = {
  amount: number;
  purchaserName: string;
  purchaserEmail: string;
  recipientName?: string | null;
  recipientEmail?: string | null;
  message?: string | null;
};

export function validatePurchase(args: PurchaseInput) {
  if (!GIFT_CARD_AMOUNTS.includes(args.amount)) throw new Error("Choose one of the gift card amounts");
  const purchaserName = String(args.purchaserName || "").trim();
  const purchaserEmail = String(args.purchaserEmail || "").trim().toLowerCase();
  const recipientEmail = args.recipientEmail?.trim() ? args.recipientEmail.trim().toLowerCase() : purchaserEmail;
  const recipientName = String(args.recipientName || "").trim() || purchaserName;
  const message = String(args.message || "").trim();
  if (!purchaserName || purchaserName.length > 120 || recipientName.length > 120 || /[\r\n<>]/.test(purchaserName + recipientName)) throw new Error("Enter your name");
  if (!EMAIL.test(purchaserEmail) || !EMAIL.test(recipientEmail) || purchaserEmail.length > 254 || recipientEmail.length > 254) throw new Error("Enter a valid email address");
  if (message.length > 500) throw new Error("Keep the message under 500 characters");
  return { amount: args.amount, purchaserName, purchaserEmail, recipientName, recipientEmail, message };
}

function secret() {
  const value = process.env.SESSION_SECRET || "";
  if (value.length < 32) throw new Error("Gift cards are unavailable on this store");
  return value;
}

export function purchaseToken(ref: string) {
  return crypto.createHmac("sha256", secret()).update(`gift-card-purchase:${ref}`).digest("hex");
}

export function purchaseTokenOk(ref: string, token: string) {
  if (!/^[a-f0-9]{64}$/.test(token || "")) return false;
  const a = Buffer.from(purchaseToken(ref));
  const b = Buffer.from(token);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function giftCardEmail(input: { storeName: string; code: string; amount: number; currencyCode: string; purchaserName: string; purchaserEmail: string; recipientName: string; recipientEmail: string; message: string; endsAt: Date | null; shopUrl: string }) {
  const value = money(input.amount, input.currencyCode);
  const from = input.purchaserName && input.purchaserEmail !== input.recipientEmail ? input.purchaserName : "";
  const subject = from ? `${from} sent you a ${value} gift card for ${input.storeName}` : `Your ${value} gift card for ${input.storeName}`;
  const until = input.endsAt ? ` It's valid until ${input.endsAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.` : "";
  const lines = [
    ...(from ? [`Hi ${input.recipientName || "there"}, ${from} sent you a gift card.`] : []),
    ...(input.message ? [`"${input.message}"`] : []),
    `Gift card code: ${input.code}`,
    `Enter the code at checkout under "Add gift card or discount code".${until}`,
    input.shopUrl ? `Shop now: ${input.shopUrl}` : "",
  ].filter(Boolean);
  const html = emailLayout({
    storeName: input.storeName,
    preheader: `${value} gift card code inside.`,
    title: `${value} to spend at ${input.storeName}`,
    body: `${from ? emailParagraph(`Hi ${escapeHtml(input.recipientName || "there")}, ${escapeHtml(from)} sent you a gift card.`) : ""}
${input.message ? emailPanel(`<em>&ldquo;${escapeHtml(input.message)}&rdquo;</em>`) : ""}
${emailHeading("Your code")}
${emailPanel(`<span class="em-text" style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:22px;line-height:30px;letter-spacing:2px;font-weight:700;color:#18181b;">${escapeHtml(input.code)}</span>`, "center")}
${emailParagraph(`Enter the code at checkout under &ldquo;Add gift card or discount code&rdquo;.${escapeHtml(until)}`)}
${input.shopUrl ? emailButton("Start shopping", input.shopUrl) : ""}`,
  });
  return { subject, text: lines.join("\n\n"), html };
}

// ------------------------------------------------------------------ checkout holds

type Hold = { id: string; amount: number };

/**
 * Takes each allocation off its card before payment. Idempotent per checkout key: a card that already
 * holds the amount for this key is skipped. Throws when a card can no longer cover its share.
 */
export async function holdGiftCardBalances(prisma: any, allocations: Hold[], ref: string, now = new Date()) {
  if (!allocations?.length) return;
  await prisma.$transaction(async (tx: any) => {
    for (const { id, amount } of allocations) {
      if (!amount) continue;
      const card = await tx.giftCard.findUnique({ where: { id }, select: { id: true, balance: true, isDisabled: true, endsAt: true, metadata: true } });
      if (!card) throw new Error("Gift card not found");
      const ledger = ledgerOf(card);
      if (heldFor(ledger, ref) >= amount) continue;
      if (!isUsable(card, now) || card.balance < amount) throw new Error("A gift card balance changed. Review your order and try again.");
      const balance = card.balance - amount;
      const result = await tx.giftCard.updateMany({
        where: { id, balance: card.balance, isDisabled: false },
        data: { balance, metadata: { ...(card.metadata || {}), ledger: [...ledger, { at: now.toISOString(), type: "hold", amount, balance, ref }] } },
      });
      if (result.count !== 1) throw new Error("A gift card balance changed. Review your order and try again.");
    }
  });
}

/** Puts back whatever is still held for a checkout key (payment failed or checkout abandoned). */
export async function releaseGiftCardBalances(prisma: any, cardIds: string[], ref: string, now = new Date()) {
  if (!cardIds?.length) return;
  await prisma.$transaction(async (tx: any) => {
    for (const id of cardIds) {
      const card = await tx.giftCard.findUnique({ where: { id }, select: { id: true, balance: true, metadata: true } });
      if (!card) continue;
      const ledger = ledgerOf(card);
      const held = heldFor(ledger, ref);
      if (held <= 0) continue;
      const balance = card.balance + held;
      const result = await tx.giftCard.updateMany({
        where: { id, balance: card.balance },
        data: { balance, metadata: { ...(card.metadata || {}), ledger: [...ledger, { at: now.toISOString(), type: "release", amount: held, balance, ref }] } },
      });
      if (result.count !== 1) throw new Error("Gift card release raced; retry");
    }
  });
}

/** Records the redemption on the order: one GiftCardTransaction per card, created once. */
export async function linkGiftCardsToOrder(prisma: any, cardIds: string[], ref: string, orderId: string) {
  for (const id of cardIds || []) {
    const card = await prisma.giftCard.findUnique({ where: { id }, select: { metadata: true } });
    const held = heldFor(ledgerOf(card), ref);
    if (held <= 0) continue;
    const existing = await prisma.giftCardTransaction.findFirst({ where: { giftCardId: id, orderId } });
    if (existing) continue;
    await prisma.giftCardTransaction.create({ data: { amount: held, giftCardId: id, orderId } });
  }
}
