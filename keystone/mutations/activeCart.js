async function activeCart(root, { cartId }, context) {
  if (!cartId) {
    throw new Error("Cart ID is required");
  }

  const sudoContext = context.sudo();

  // Get cart with sudo
  const cart = await sudoContext.db.Cart.findOne({
    where: { id: cartId },
  });

  if (!cart) {
    return { cart: null, lineItems: [] };
  }

  // Get line items separately with sudo
  const lineItems = await sudoContext.db.LineItem.findMany({
    where: { cart: { id: { equals: cartId } } },
  });

  // Return cart and lineItems separately
  return {
    cart,
    lineItems
  };
}

export default activeCart;
