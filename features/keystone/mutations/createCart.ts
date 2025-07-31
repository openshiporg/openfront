async function createCart(root, { regionId }, context) {
  const sudoContext = context.sudo()
  
  const newCart = await sudoContext.db.Cart.createOne({
    data: {
      type: "default",
      ...(regionId && {
        region: { connect: { id: regionId } }
      }),
      ...(context.session?.itemId && {
        user: { connect: { id: context.session.itemId } }
      })
    }
  })

  return newCart;
}

export default createCart; 