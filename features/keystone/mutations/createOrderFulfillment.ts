import crypto from "node:crypto";
import { permissions } from "../access";
import {
  enqueueWebhookOutbox,
  subscribedWebhookEndpointIds,
} from "../../webhooks/outbox";
import { deliverWebhookEventsById } from "../../webhooks/webhook-plugin";
import { reconcileOrderFulfillmentStatus } from "../orders/order-lifecycle";

function trackingUrl(carrier: string, number: string) {
  const value = encodeURIComponent(number);
  switch (carrier.toLowerCase()) {
    case "ups": return `https://www.ups.com/track?tracknum=${value}`;
    case "usps": return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${value}`;
    case "fedex": return `https://www.fedex.com/fedextrack/?trknbr=${value}`;
    case "dhl": return `https://www.dhl.com/en/express/tracking.html?AWB=${value}`;
    default: return "";
  }
}

async function createOrderFulfillment(
  root: any,
  {
    orderId,
    lineItems,
    trackingNumber,
    carrier,
    noNotification = false,
    idempotencyKey,
    deferWebhookDelivery = false,
    suppressWebhookEnqueue = false,
    deferLifecycleProjection = false,
  }: any,
  context: any
) {
  if (!permissions.canManageFulfillments({ session: context.session })) {
    throw new Error("Access denied");
  }
  if (!Array.isArray(lineItems) || !lineItems.length) throw new Error("Line items are required");
  const requested = new Map<string, number>();
  for (const item of lineItems) {
    if (!item?.lineItemId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error("Fulfillment quantities must be positive integers");
    }
    requested.set(item.lineItemId, (requested.get(item.lineItemId) || 0) + item.quantity);
  }
  if (Boolean(trackingNumber) !== Boolean(carrier)) {
    throw new Error("Carrier and tracking number must be provided together");
  }
  const normalized = [...requested.entries()].sort(([a], [b]) => a.localeCompare(b));
  if (!idempotencyKey?.trim()) throw new Error("Fulfillment idempotency key is required");
  const normalizedIdempotencyKey = idempotencyKey.trim();
  const isIntegrationTrackingRelay = normalizedIdempotencyKey.startsWith("openship-tracking:");
  const businessKey = `fulfillment:${orderId}:${crypto
    .createHash("sha256")
    .update(normalizedIdempotencyKey)
    .digest("hex")}`;

  const sudo = context.sudo();
  const orderIdentity = await sudo.query.Order.findOne({
    where: { id: orderId },
    query: 'id user { id }',
  });
  if (!orderIdentity) throw new Error('Order not found');
  const fulfillmentWebhookEndpointIds = await subscribedWebhookEndpointIds(
    sudo,
    'fulfillment.created',
    orderIdentity.user?.id
  );
  const fulfillmentResult = await sudo.prisma.$transaction(async (tx: any) => {
    const existing = await tx.fulfillment.findFirst({
      where: { idempotencyKey: businessKey, canceledAt: null },
      select: { id: true },
    });
    if (existing) return { fulfillmentId: existing.id, webhookEventIds: [] as string[] };
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });
    if (!order || !["pending", "completed"].includes(order.status)) {
      throw new Error("Order is not fulfillable");
    }
    const orderLines = await tx.orderLineItem.findMany({
      where: { orderId, id: { in: normalized.map(([id]) => id) } },
      select: { id: true, quantity: true, metadata: true },
    });
    if (orderLines.length !== normalized.length) throw new Error("Order line item not found");
    const fulfilled = await tx.fulfillmentItem.groupBy({
      by: ["lineItemId"],
      where: { lineItemId: { in: normalized.map(([id]) => id) }, fulfillment: { canceledAt: null } },
      _sum: { quantity: true },
    });
    const fulfilledByLine = new Map<string, number>(
      fulfilled.map(
        (item: any) => [item.lineItemId, item._sum.quantity || 0] as [string, number]
      )
    );
    for (const line of orderLines) {
      const quantity = requested.get(line.id)!;
      if (quantity > line.quantity - (fulfilledByLine.get(line.id) || 0)) {
        throw new Error(`Fulfillment exceeds remaining quantity for line ${line.id}`);
      }
    }
    const orderLinesById = new Map<string, any>(
      orderLines.map((line: any): [string, any] => [line.id, line])
    );
    const webhookLineItems = normalized.map(([lineItemId, quantity]) => {
      const metadata = orderLinesById.get(lineItemId)?.metadata as any;
      const cartItemId = String(metadata?.openshipCartItemId || '').trim();
      return {
        lineItemId,
        quantity,
        ...(cartItemId ? { cartItemId } : {}),
      };
    });
    const fulfillmentProvider = await tx.fulfillmentProvider.findUnique({
      where: { code: "fp_manual" },
      select: { id: true },
    });
    if (!fulfillmentProvider) throw new Error("Manual fulfillment provider is not configured");
    const fulfillment = await tx.fulfillment.create({
      data: {
        orderId,
        fulfillmentProviderId: fulfillmentProvider.id,
        idempotencyKey: businessKey,
        noNotification,
        metadata: {
          source: isIntegrationTrackingRelay ? "openship-tracking-relay" : "operator-command",
          createdById: context.session.itemId,
        },
        fulfillmentItems: {
          create: normalized.map(([lineItemId, quantity]) => ({
            quantity,
            lineItem: { connect: { id: lineItemId } },
          })),
        },
        ...(trackingNumber && carrier ? {
          shippingLabels: {
            create: {
              status: "created",
              carrier,
              trackingNumber,
              trackingUrl: trackingUrl(carrier, trackingNumber),
              order: { connect: { id: orderId } },
              metadata: { source: "operator-command" },
            },
          },
        } : {}),
      },
    });
    // A fulfillment created only to relay supplier tracking back to the source
    // shop must not be published to the supplier webhook again.
    const webhookEventIds = isIntegrationTrackingRelay || suppressWebhookEnqueue
      ? []
      : await enqueueWebhookOutbox(
          tx,
          fulfillmentWebhookEndpointIds,
          "fulfillment.created",
          "Fulfillment",
          fulfillment.id,
          {
            id: fulfillment.id,
            orderId,
            order: { id: orderId },
            lineItems: webhookLineItems,
            trackingNumber: trackingNumber || null,
            trackingCompany: carrier || null,
          }
        );
    if (!noNotification) {
      await tx.notification.create({
        data: {
          eventName: "FULFILLMENT_CREATED",
          resourceType: "Fulfillment",
          resourceId: fulfillment.id,
          to: "notification-operations",
          data: { orderId, fulfillmentId: fulfillment.id, status: "pending_delivery" },
        },
      });
    }
    await tx.orderEvent.create({
      data: {
        orderId,
        type: "FULFILLMENT_STATUS_CHANGE",
        data: {
          fulfillmentId: fulfillment.id,
          action: "created",
          lineItems: normalized,
          trackingNumber: trackingNumber || null,
          carrier: carrier || null,
        },
        userId: context.session.itemId,
        createdById: context.session.itemId,
      },
    });
    if (!deferLifecycleProjection) {
      await reconcileOrderFulfillmentStatus(tx, orderId, {
        reason: "fulfillment_created",
        actorId: context.session.itemId,
      });
    }
    return { fulfillmentId: fulfillment.id, webhookEventIds };
  }, { isolationLevel: "Serializable" });

  // Fast path: immediately attempt only the events created by this command.
  // Failed events remain durable for a future scheduled retry worker.
  // TODO(operations): schedule leased retries with backoff, dead-lettering, and alerts.
  if (!deferWebhookDelivery && fulfillmentResult.webhookEventIds.length) {
    try {
      await deliverWebhookEventsById(sudo, fulfillmentResult.webhookEventIds);
    } catch (error) {
      console.error(
        "Immediate fulfillment webhook delivery failed:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  return sudo.query.Fulfillment.findOne({
    where: { id: fulfillmentResult.fulfillmentId },
    query: "id idempotencyKey fulfillmentItems { id quantity lineItem { id } } shippingLabels { id status trackingNumber trackingUrl carrier }",
  });
}

export default createOrderFulfillment;
