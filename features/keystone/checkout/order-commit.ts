import crypto from "node:crypto";
import {
  enqueueWebhookOutbox,
  subscribedWebhookEndpointIds,
} from "../../webhooks/outbox";
import { deliverWebhookEventsById } from "../../webhooks/webhook-plugin";

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

  const userId = cart.user?.id || cart.shippingAddress?.user?.id;
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

  const commit = await sudo.prisma.$transaction(async (tx: any) => {
    const existing = await tx.order.findFirst({ where: { cart: { id: cart.id } }, select: { id: true } });
    if (existing) return { orderId: existing.id, webhookEventIds: [] as string[] };

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
            data: { cartId: cart.id, isGuestOrder: !userId },
          },
        },
      },
    });
    await tx.cart.update({ where: { id: cart.id }, data: { orderId: order.id } });
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
        currency: { id: cart.region.currency.id, code: cart.region.currency.code },
        shippingAddress: cart.shippingAddress,
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
    return { orderId: order.id, webhookEventIds };
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

  return sudo.query.Order.findOne({
    where: { id: commit.orderId },
    query: `
      id status displayId secretKey subtotal total shipping discount tax paymentDetails
      shippingAddress { id firstName lastName company address1 address2 city province postalCode country { id iso2 } phone }
    `,
  });
}
