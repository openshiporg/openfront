async function removeDiscountFromActiveCart(root, { cartId, code }, context) {
  const sudoContext = context.sudo();

  const discount = await sudoContext.query.Discount.findOne({
    where: { code },
    query: 'id'
  });

  if (!discount) {
    throw new Error(`No discount found with code: ${code}`);
  }

  return await sudoContext.db.Cart.updateOne({
    where: { id: cartId },
    data: {
      discounts: {
        disconnect: [{ id: discount.id }]
      }
    },
  });
}

export default removeDiscountFromActiveCart; 