type OrderLifecycleOptions = {
  reason: string;
  actorId?: string | null;
  paymentRecovered?: boolean;
};

/**
 * Recompute the operational order status from active fulfillment quantities.
 * Payment capture is deliberately not a completion signal.
 */
export async function reconcileOrderFulfillmentStatus(
  tx: any,
  orderId: string,
  { reason, actorId = null, paymentRecovered = false }: OrderLifecycleOptions
): Promise<{ previousStatus: string; status: string; fullyFulfilled: boolean }> {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    select: {
      status: true,
      lineItems: { select: { id: true, quantity: true } },
      fulfillments: {
        where: { canceledAt: null },
        select: {
          fulfillmentItems: { select: { lineItemId: true, quantity: true } },
        },
      },
    },
  });
  if (!order) throw new Error("Order not found");

  const fulfilledByLine = new Map<string, number>();
  for (const fulfillment of order.fulfillments) {
    for (const item of fulfillment.fulfillmentItems) {
      if (!item.lineItemId) continue;
      fulfilledByLine.set(
        item.lineItemId,
        (fulfilledByLine.get(item.lineItemId) || 0) + item.quantity
      );
    }
  }
  const fullyFulfilled =
    order.lineItems.length > 0 &&
    order.lineItems.every(
      (line: any) => (fulfilledByLine.get(line.id) || 0) >= line.quantity
    );

  let status = order.status;
  if (!["canceled", "archived"].includes(order.status)) {
    if (fullyFulfilled) {
      status = "completed";
    } else if (order.status === "completed" || (paymentRecovered && order.status === "requires_action")) {
      status = "pending";
    }
  }

  if (status !== order.status) {
    await tx.order.update({ where: { id: orderId }, data: { status } });
    await tx.orderEvent.create({
      data: {
        orderId,
        type: "STATUS_CHANGE",
        data: {
          previousStatus: order.status,
          newStatus: status,
          reason,
          projection: "active_fulfillment_quantities",
        },
        ...(actorId ? { userId: actorId, createdById: actorId } : {}),
      },
    });
  }

  return { previousStatus: order.status, status, fullyFulfilled };
}
