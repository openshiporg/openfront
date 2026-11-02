import {
  enqueueWebhookOutbox,
  subscribedWebhookEndpointIds,
} from "../../webhooks/outbox";

// Shared by transitionOrderStatus and refundOrderPayment (restock on full refund).
// Cancelling returns stock exactly once per order line: a StockMovement keyed by
// (variant, reason "order_cancellation", note "order:<id>") is the idempotent marker.
export async function applyOrderStatusTransition(
  sudo: any,
  { orderId, status, reason, userId }: { orderId: string; status: "canceled" | "archived"; reason: string; userId: string }
): Promise<{ changed: boolean }> {
  const endpointIds = await subscribedWebhookEndpointIds(sudo, `order.${status}`);
  return sudo.prisma.$transaction(async (tx: any) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        payments: {
          select: { amount: true, amountRefunded: true, refunds: { select: { amount: true } } },
        },
        fulfillments: { where: { canceledAt: null }, select: { id: true } },
        accountLineItems: {
          select: {
            id: true,
            accountId: true,
            amount: true,
            paymentStatus: true,
            invoiceLineItems: { select: { id: true } },
          },
        },
        discounts: { select: { id: true } },
        lineItems: {
          select: {
            quantity: true,
            productVariant: {
              select: { id: true, manageInventory: true },
            },
          },
        },
      },
    });
    if (!order) throw new Error("Order not found");
    if (order.status === status) return { changed: false };

    if (status === "archived") {
      if (order.status !== "completed") throw new Error("Only completed orders can be archived");
    } else {
      if (!["pending", "completed", "requires_action"].includes(order.status)) {
        throw new Error("Order cannot be canceled from its current state");
      }
      if (order.fulfillments.length) throw new Error("Cancel active fulfillments before canceling the order");
      if (
        order.payments.some(
          (payment: any) =>
            payment.refunds.reduce((sum: number, refund: any) => sum + refund.amount, 0) < payment.amount
        )
      ) {
        throw new Error("Captured payments must be fully refunded before cancellation");
      }
      for (const line of order.lineItems) {
        if (!line.productVariant?.manageInventory) continue;
        const alreadyReceived = await tx.stockMovement.findFirst({
          where: { variantId: line.productVariant.id, reason: "order_cancellation", note: `order:${orderId}` },
          select: { id: true },
        });
        if (alreadyReceived) continue;
        await tx.productVariant.update({
          where: { id: line.productVariant.id },
          data: { inventoryQuantity: { increment: line.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            type: "RECEIVE",
            quantity: line.quantity,
            reason: "order_cancellation",
            note: `order:${orderId}`,
            variantId: line.productVariant.id,
          },
        });
      }
      if (
        order.accountLineItems.some(
          (item: any) => item.paymentStatus !== "unpaid" || item.invoiceLineItems.length
        )
      ) {
        throw new Error("Invoiced account orders require an approved credit-note workflow");
      }
      for (const item of order.accountLineItems) {
        await tx.accountLineItem.update({
          where: { id: item.id },
          data: { paymentStatus: "canceled" },
        });
        if (item.accountId) {
          const adjustedAccount = await tx.account.updateMany({
            where: { id: item.accountId, totalAmount: { gte: item.amount } },
            data: { totalAmount: { decrement: item.amount } },
          });
          if (adjustedAccount.count !== 1) {
            throw new Error("Account balance is inconsistent; cancellation stopped");
          }
        }
      }
      for (const discount of order.discounts) {
        await tx.discount.updateMany({
          where: { id: discount.id, usageCount: { gt: 0 } },
          data: { usageCount: { decrement: 1 } },
        });
      }
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === "canceled" ? { canceledAt: new Date() } : {}),
      },
    });
    await tx.orderEvent.create({
      data: {
        orderId,
        type: "STATUS_CHANGE",
        data: { previousStatus: order.status, newStatus: status, reason: reason.trim() },
        userId: userId,
        createdById: userId,
      },
    });
    await enqueueWebhookOutbox(
      tx,
      endpointIds,
      `order.${status}`,
      "Order",
      orderId,
      { id: orderId, previousStatus: order.status, status, reason: reason.trim() }
    );
    return { changed: true };
  }, { isolationLevel: "Serializable" });
}
