import { permissions } from "../access";
import { applyOrderStatusTransition } from "../utils/orderStatusTransition";

async function transitionOrderStatus(
  root: any,
  { orderId, status, reason }: { orderId: string; status: string; reason: string },
  context: any
) {
  if (!permissions.canManageOrders({ session: context.session })) throw new Error("Access denied");
  if (!reason?.trim()) throw new Error("Transition reason is required");
  if (!["canceled", "archived"].includes(status)) {
    throw new Error("Order status is controlled by payment and fulfillment commands");
  }
  const sudo = context.sudo();
  await applyOrderStatusTransition(sudo, { orderId, status: status as "canceled" | "archived", reason, userId: context.session.itemId });

  return sudo.query.Order.findOne({
    where: { id: orderId },
    query: "id status canceledAt displayId",
  });
}

export default transitionOrderStatus;
