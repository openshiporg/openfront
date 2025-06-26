async function addActiveCartShippingMethod(root, { cartId, shippingMethodId }, context) {
  const sudoContext = context.sudo();

  // Get cart and shipping option
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      region {
        id
      }
      shippingMethods {
        id
      }
    `
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  // Delete existing shipping methods
  if (cart.shippingMethods?.length > 0) {
    await Promise.all(
      cart.shippingMethods.map(method => 
        sudoContext.db.ShippingMethod.deleteOne({
          where: { id: method.id }
        })
      )
    );
  }

  // Get shipping option
  const shippingOption = await sudoContext.query.ShippingOption.findOne({
    where: { id: shippingMethodId },
    query: `
      id
      amount
      name
    `
  });

  if (!shippingOption) {
    throw new Error("Shipping option not found");
  }

  // Create shipping method
  await sudoContext.db.ShippingMethod.createOne({
    data: {
      cart: { connect: { id: cartId } },
      shippingOption: { connect: { id: shippingOption.id } },
      price: shippingOption.amount,
      data: {
        name: shippingOption.name
      }
    }
  });

  return await sudoContext.db.Cart.findOne({
    where: { id: cartId }
  });
}

export default addActiveCartShippingMethod; 