async function updateActiveCartLineItem(root, { cartId, lineId, quantity }, context) {
  const sudoContext = context.sudo();

  // First verify cart exists
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

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