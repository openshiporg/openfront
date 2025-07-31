async function updateActiveCart(root, { cartId, data }, context) {
  const sudoContext = context.sudo();

  // First verify this cart exists
  const existingCart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      lineItems {
        id
        quantity
        productVariant {
          id
        }
      }
    `
  });

  if (!existingCart) {
    throw new Error("Cart not found");
  }

  // Handle duplicate line items if we're adding new ones
  if (data?.lineItems?.create?.length) {
    for (const newItem of data.lineItems.create) {
      const variantId = newItem.productVariant.connect.id;
      const existingLineItem = existingCart.lineItems?.find(
        item => item.productVariant.id === variantId
      );

      if (existingLineItem) {
        // Update existing line item using graphql.raw
        await context.graphql.raw({
          query: `
            mutation UpdateActiveCartLineItem($cartId: ID!, $lineId: ID!, $quantity: Int!) {
              updateActiveCartLineItem(cartId: $cartId, lineId: $lineId, quantity: $quantity) {
                id
              }
            }
          `,
          variables: {
            cartId,
            lineId: existingLineItem.id,
            quantity: existingLineItem.quantity + newItem.quantity
          }
        });
        // Remove the create operation since we handled it
        delete data.lineItems;
      }
    }
  }

  // Update cart with modified data
  return await sudoContext.db.Cart.updateOne({
    where: { id: cartId },
    data,
  });
}

export default updateActiveCart;

