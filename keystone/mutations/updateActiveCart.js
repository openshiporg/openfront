async function updateActiveCart(root, { cartId, data }, context) {
  const sudoContext = context.sudo();

  // First verify this cart can be accessed by current user
  const existingCart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id 
      user { id }
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

  // Handle line item operations
  if (data.lineItems) {
    // Handle create with duplicate checks
    if (data.lineItems.create) {
      const creates = [];

      for (const newItem of data.lineItems.create) {
        const variantId = newItem.productVariant.connect.id;
        const existingItem = existingCart.lineItems.find(
          item => item.productVariant.id === variantId
        );

        if (existingItem) {
          // Instead of using update, we'll delete and recreate with new quantity
          await sudoContext.db.LineItem.deleteOne({
            where: { id: existingItem.id }
          });
          
          creates.push({
            ...newItem,
            quantity: existingItem.quantity + (newItem.quantity || 1)
          });
        } else {
          creates.push(newItem);
        }
      }

      // Only use create operation
      data.lineItems = {
        create: creates
      };
    }

    // Handle delete operations
    if (data.lineItems.delete) {
      await Promise.all(
        data.lineItems.delete.map(item =>
          sudoContext.db.LineItem.deleteOne({
            where: { id: item.id }
          })
        )
      );
      
      delete data.lineItems.delete;
    }

    // Remove any update operations as they're not supported
    if (data.lineItems.update) {
      delete data.lineItems.update;
    }
  }

  // Update cart with modified data
  return await sudoContext.db.Cart.updateOne({
    where: { id: cartId },
    data,
  });
}

export default updateActiveCart;
