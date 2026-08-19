import { permissions } from "../access";
import {
  enqueueWebhookOutbox,
  subscribedWebhookEndpointIds,
} from "../../webhooks/outbox";
import { reconcileOrderFulfillmentStatus } from "../orders/order-lifecycle";

async function cancelOrderFulfillment(
  root: any,
  { fulfillmentId, reason }: { fulfillmentId: string; reason: string },
  context: any
) {
  if (!permissions.canManageFulfillments({ session: context.session })) {
    throw new Error("Access denied");
  }
  if (!reason?.trim()) throw new Error("Cancellation reason is required");
  const sudo = context.sudo();
  const endpointIds = await subscribedWebhookEndpointIds(sudo, "fulfillment.canceled");
  const result = await sudo.prisma.$transaction(async (tx: any) => {
    const current = await tx.fulfillment.findUnique({
      where: { id: fulfillmentId },
      select: {
        id: true,
        orderId: true,
        canceledAt: true,
        metadata: true,
        shippingLabels: { select: { id: true, metadata: true, providerId: true } },
      },
    });
    if (!current) throw new Error("Fulfillment not found");
    if (current.canceledAt) return current;
    if (
      current.shippingLabels.some(
        (label: any) =>
          label.providerId && label.metadata?.cancellation?.status !== "confirmed"
      )
    ) {
      throw new Error("Cancel the purchased shipping label before canceling fulfillment");
    }
    const canceled = await tx.fulfillment.update({
      where: { id: fulfillmentId },
      data: {
        canceledAt: new Date(),
        metadata: {
          ...(current.metadata as Record<string, unknown> || {}),
          cancellationReason: reason.trim(),
          canceledById: context.session.itemId,
        },
      },
    });
    await enqueueWebhookOutbox(
      tx,
      endpointIds,
      "fulfillment.canceled",
      "Fulfillment",
      fulfillmentId,
      { id: fulfillmentId, orderId: current.orderId, reason: reason.trim() }
    );
    await tx.orderEvent.create({
      data: {
        orderId: current.orderId,
        type: "FULFILLMENT_STATUS_CHANGE",
        data: { fulfillmentId, action: "canceled", reason: reason.trim() },
        userId: context.session.itemId,
        createdById: context.session.itemId,
      },
    });
    await reconcileOrderFulfillmentStatus(tx, current.orderId, {
      reason: "fulfillment_canceled",
      actorId: context.session.itemId,
    });
    return canceled;
  });
  return { id: result.id, canceledAt: result.canceledAt };
}

export default cancelOrderFulfillment;
