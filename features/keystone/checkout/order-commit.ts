import crypto from "node:crypto";
import {
  enqueueWebhookOutbox,
  subscribedWebhookEndpointIds,
} from "../../webhooks/outbox";
import { deliverWebhookEventsById } from "../../webhooks/webhook-plugin";

// Checkout writes the order through Prisma, so Keystone hooks (and the Order webhook
// enricher) never run for it: order.created is built here and must carry everything
// receivers such as Openship read, including the full shipping address.
const WEBHOOK_ADDRESS_SELECT = {
  id: true, firstName: true, lastName: true, company: true, address1: true, address2: true,
  city: true, province: true, postalCode: true, phone: true,
  country: { select: { id: true, iso2: true } },
};

// Guest checkout (storefront/lib/data/cart.ts) creates a NEW customer record with
// hasAccount:false, after the cart exists, and signs it in so cart.user and
// shippingAddress.user both point at it. That record is a guest: the order must be
// flagged guest, carry a secret-key link and not be linked to the user. Registered
// customers are hasAccount:true, or (legacy rows) were created before this cart.
export function resolveOrderCustomer(cart: any): { userId: string | undefined; isGuest: boolean } {
  const customer = cart.user || cart.shippingAddress?.user;
  if (!customer?.id) return { userId: undefined, isGuest: true };
  const createdAt = customer.createdAt ? new Date(customer.createdAt).getTime() : NaN;
  const cartCreatedAt = cart.createdAt ? new Date(cart.createdAt).getTime() : NaN;
  const isGuest =
    customer.hasAccount === false && Number.isFinite(createdAt) && Number.isFinite(cartCreatedAt) &&
    createdAt >= cartCreatedAt;
  return { userId: isGuest ? undefined : customer.id, isGuest };
}

const CONFIRMATION_PENDING = "pending_delivery";

async function deliverOrderConfirmation(sudo: any, orderId: string) {
  const notification = await sudo.prisma.notification.findFirst({
    where: { eventName: "ORDER_CONFIRMATION", resourceType: "Order", resourceId: orderId },
    select: { id: true, data: true },
  });
  if (!notification) return;
  const mark = (status: string, extra: Record<string, unknown> = {}) =>
    sudo.prisma.notification.update({
      where: { id: notification.id },
      data: { data: { ...(notification.data || {}), orderId, status, ...extra } },
    });
  // Claim the row atomically; a replay or concurrent completion finds it already claimed.
  const claim = await sudo.prisma.notification.updateMany({
    where: { id: notification.id, data: { path: ["status"], equals: CONFIRMATION_PENDING } },
    data: { data: { ...(notification.data || {}), orderId, status: "sending" } },
  });
  if (claim.count !== 1) return;
  try {
    if (!process.env.SMTP_HOST) {
      console.warn("Order confirmation email skipped: SMTP is not configured", orderId);
      await mark("skipped_not_configured");
      return;
    }
    const order = await sudo.query.Order.findOne({
      where: { id: orderId },
      query: `
        id displayId email secretKey subtotal shipping discount tax total
        lineItems { id title variantTitle sku quantity formattedUnitPrice formattedTotal }
        shippingAddress { firstName lastName company address1 address2 city province postalCode phone country { iso2 displayName } }
      `,
    });
    // Loaded lazily: lib/mail imports the keystone index, which imports this module.
    const { sendOrderConfirmationEmail } = await import("../lib/mail");
    const result = await sendOrderConfirmationEmail(order);
    if (result?.sent) await mark("sent", { sentAt: new Date().toISOString(), ...(result.messageId ? { messageId: result.messageId } : {}) });
    else await mark("failed", { error: result?.error || "send_failed" });
  } catch (error) {
    console.error("Order confirmation email failed:", error instanceof Error ? error.message : "Unknown error");
    try {
      await mark("failed", { error: error instanceof Error ? error.message : "send_failed" });
    } catch {
      // The order is already committed; status bookkeeping must never surface.
    }
  }
}

export async function createOrderFromCartAtomically(cart: any, sudo: any) {
  const prepared: Array<{ line: any; price: any; thumbnail: any }> = [];
  for (const line of cart.lineItems) {
    const prices = await sudo.query.MoneyAmount.findMany({
      where: {
        productVariant: { id: { equals: line.productVariant.id } },
        region: { id: { equals: cart.region.id } },
        currency: { code: { equals: cart.region.currency.code } },
      },
      take: 1,
      query: "id calculatedPrice { calculatedAmount originalAmount currencyCode }",
    });
    const price = prices[0]?.calculatedPrice;
    if (!price) throw new Error(`No valid price for variant ${line.productVariant.id}`);
    const thumbnail = line.productVariant.primaryImage
      ? line.productVariant.primaryImage.image?.url || line.productVariant.primaryImage.imagePath
      : line.productVariant.product.thumbnail;
    prepared.push({ line, price, thumbnail });
  }

  const { userId, isGuest } = resolveOrderCustomer(cart);
  const orderWebhookEndpointIds = await subscribedWebhookEndpointIds(
    sudo,
    'order.created',
    userId
  );
  const secretKey = userId ? "" : crypto.randomBytes(32).toString("hex");
  const commercialSnapshot = {
    currency: cart.region.currency.code,
    tax: {
      rate: cart.region.taxRate || 0,
      regionId: cart.region.id,
      destinationCountry: cart.shippingAddress?.country?.iso2 || null,
    },
    acceptedAt: new Date().toISOString(),
  };
  // Formatted totals as the Order shows them; never worth failing checkout over.
  const webhookTotals = orderWebhookEndpointIds.length
    ? await sudo.query.Cart.findOne({ where: { id: cart.id }, query: "subtotal shipping discount tax total" }).catch(() => null)
    : null;

  const commit = await sudo.prisma.$transaction(async (tx: any) => {
    const existing = await tx.order.findFirst({ where: { cart: { id: cart.id } }, select: { id: true } });
    if (existing) return { orderId: existing.id, webhookEventIds: [] as string[], created: false };

    const lineItemIds = [];
    const webhookLineItems: any[] = [];
    for (const { line, price, thumbnail } of prepared) {
      const money = await tx.orderMoneyAmount.create({
        data: {
          amount: price.calculatedAmount,
          originalAmount: price.originalAmount,
          currencyId: cart.region.currency.id,
          regionId: cart.region.id,
          priceData: {
            prices: line.productVariant.prices,
            currencyCode: cart.region.currency.code,
            regionId: cart.region.id,
            taxRate: cart.region.taxRate,
          },
          metadata: line.metadata,
        },
      });
      const item = await tx.orderLineItem.create({
        data: {
          quantity: line.quantity,
          title: line.productVariant.product.title,
          sku: line.productVariant.sku,
          metadata: line.metadata,
          productData: {
            id: line.productVariant.product.id,
            title: line.productVariant.product.title,
            thumbnail,
            description: line.productVariant.product.description,
            metadata: line.productVariant.product.metadata,
          },
          variantData: {
            id: line.productVariant.id,
            sku: line.productVariant.sku,
            title: line.productVariant.title,
            measurements: line.productVariant.measurements || [],
          },
          variantTitle: line.productVariant.title,
          formattedUnitPrice: line.unitPrice,
          formattedTotal: line.total,
          productVariantId: line.productVariant.id,
          originalLineItemId: line.id,
          moneyAmountId: money.id,
        },
      });
      lineItemIds.push(item.id);
      webhookLineItems.push({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        sku: item.sku,
        thumbnail,
        moneyAmount: {
          amount: price.calculatedAmount,
          originalAmount: price.originalAmount,
        },
        productVariant: {
          id: line.productVariant.id,
          title: line.productVariant.title,
          sku: line.productVariant.sku,
          product: {
            id: line.productVariant.product.id,
            title: line.productVariant.product.title,
            thumbnail,
          },
        },
      });
    }

    const order = await tx.order.create({
      data: {
        cart: { connect: { id: cart.id } },
        email: cart.email,
        userId,
        regionId: cart.region.id,
        currencyId: cart.region.currency.id,
        billingAddressId: cart.billingAddress.id,
        shippingAddressId: cart.shippingAddress.id,
        discounts: { connect: (cart.discounts || []).map((item: any) => ({ id: item.id })) },
        shippingMethods: { connect: (cart.shippingMethods || []).map((item: any) => ({ id: item.id })) },
        lineItems: { connect: lineItemIds.map((id) => ({ id })) },
        status: "pending",
        displayId: Math.floor(Date.now() / 1000),
        taxRate: cart.region.taxRate || 0,
        metadata: { ...(cart.metadata || {}), commercialSnapshot },
        secretKey,
        events: {
          create: {
            type: "ORDER_PLACED",
            data: { cartId: cart.id, isGuestOrder: isGuest },
          },
        },
      },
    });
    await tx.cart.update({ where: { id: cart.id }, data: { orderId: order.id } });
    const webhookAddress = (id: string) => orderWebhookEndpointIds.length ? tx.address.findUnique({ where: { id }, select: WEBHOOK_ADDRESS_SELECT }) : null;
    const shippingAddress = await webhookAddress(cart.shippingAddress.id);
    const billingAddress = await webhookAddress(cart.billingAddress.id);
    const webhookEventIds = await enqueueWebhookOutbox(
      tx,
      orderWebhookEndpointIds,
      "order.created",
      "Order",
      order.id,
      {
        id: order.id,
        cartId: cart.id,
        displayId: order.displayId,
        email: order.email,
        status: order.status,
        rawTotal: cart.rawTotal,
        subtotal: webhookTotals?.subtotal ?? null,
        shipping: webhookTotals?.shipping ?? null,
        discount: webhookTotals?.discount ?? null,
        tax: webhookTotals?.tax ?? null,
        total: webhookTotals?.total ?? null,
        currency: { id: cart.region.currency.id, code: cart.region.currency.code },
        shippingAddress,
        billingAddress,
        lineItems: webhookLineItems,
      }
    );
    if (cart.email) {
      await tx.notification.create({
        data: {
          eventName: "ORDER_CONFIRMATION",
          resourceType: "Order",
          resourceId: order.id,
          to: cart.email,
          userId: userId || null,
          data: { orderId: order.id, status: "pending_delivery" },
        },
      });
    }
    return { orderId: order.id, webhookEventIds, created: true };
  });

  if (commit.webhookEventIds.length) {
    try {
      await deliverWebhookEventsById(sudo, commit.webhookEventIds);
    } catch (error) {
      console.error(
        "Immediate order webhook delivery failed:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  if (commit.created) await deliverOrderConfirmation(sudo, commit.orderId);

  return sudo.query.Order.findOne({
    where: { id: commit.orderId },
    query: `
      id status displayId secretKey subtotal total shipping discount tax paymentDetails
      shippingAddress { id firstName lastName company address1 address2 city province postalCode country { id iso2 } phone }
    `,
  });
}
