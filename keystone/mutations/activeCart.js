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
    return { 
      cart: null, 
      lineItems: [],
      giftCards: [],
      discounts: []
    };
  }

  // Get all related data with sudo context
  const [lineItems, giftCards, discounts] = await Promise.all([
    sudoContext.db.LineItem.findMany({
      where: { cart: { id: { equals: cartId } } },
    }),
    sudoContext.db.GiftCard.findMany({
      where: { carts: { some: { id: { equals: cartId } } } },
    }),
    sudoContext.db.Discount.findMany({
      where: { carts: { some: { id: { equals: cartId } } } },
      query: `
        id
        code
        isDynamic
        isDisabled
        discountRule {
          id
          type
          value
          allocation
        }
      `
    })
  ]);

  // Return all data separately
  return {
    cart,
    lineItems,
    giftCards,
    discounts
  };
}

export default activeCart;
