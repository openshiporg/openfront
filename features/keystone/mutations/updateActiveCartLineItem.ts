import { assertLineItemBelongsToCart } from "../security/cart-access";

async function updateActiveCartLineItem(root, { cartId, lineId, quantity }, context) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive integer");
  }
  await assertLineItemBelongsToCart(context, cartId, lineId);
  const sudoContext = context.sudo();

  // Update line item quantity
  const updatedLineItem = await sudoContext.query.LineItem.updateOne({
    where: { id: lineId },
    data: { quantity }
  });

  // Return the updated cart with all its data
  return await sudoContext.db.Cart.findOne({
    where: { id: cartId }
  });
}

export default updateActiveCartLineItem; 