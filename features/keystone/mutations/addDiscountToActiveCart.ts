async function addDiscountToActiveCart(root, { cartId, code }, context) {
  const sudoContext = context.sudo();

  // Try to find as discount
  const discount = await sudoContext.query.Discount.findOne({
    where: { code },
    query: `
      id
      code
      isDynamic
      isDisabled
      stackable
      startsAt
      endsAt
      usageLimit
      usageCount
      discountRule {
        id
        type
        value
        allocation
        discountConditions {
          id
          type
          operator
          products {
            id
          }
          productCategories {
            id
          }
          customerGroups {
            id
          }
        }
      }
    `
  });

  if (!discount) {
    throw new Error(`No discount found with code: ${code}`);
  }

  // Validate discount
  if (discount.isDisabled) {
    throw new Error(`Discount ${code} is disabled`);
  }

  // Check dates
  const now = new Date();
  if (discount.startsAt && new Date(discount.startsAt) > now) {
    throw new Error(`Discount ${code} has not started yet`);
  }
  if (discount.endsAt && new Date(discount.endsAt) < now) {
    throw new Error(`Discount ${code} has expired`);
  }

  // Check usage limits
  if (discount.usageLimit) {
    if (discount.usageCount >= discount.usageLimit) {
      throw new Error(`Discount ${code} usage limit reached`);
    }
    // Increment usage count
    await sudoContext.db.Discount.updateOne({
      where: { id: discount.id },
      data: { usageCount: discount.usageCount + 1 }
    });
  }

  // Get existing cart discounts
  const existingCart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      discounts {
        id
        code
        stackable
      }
    `
  });

  let discountUpdate;
  
  // Check if cart has any discounts
  if (existingCart?.discounts?.length > 0) {
    // Check if any existing discount is non-stackable
    const hasNonStackable = existingCart.discounts.some(d => !d.stackable);
    if (hasNonStackable) {
      // If there's a non-stackable discount, replace it
      discountUpdate = {
        disconnect: existingCart.discounts.map(d => ({ id: d.id })),
        connect: [{ id: discount.id }]
      };
    } else if (!discount.stackable) {
      // If new discount is non-stackable, replace all existing
      discountUpdate = {
        disconnect: existingCart.discounts.map(d => ({ id: d.id })),
        connect: [{ id: discount.id }]
      };
    } else {
      // Both are stackable, add new one
      discountUpdate = {
        connect: [{ id: discount.id }]
      };
    }
  } else {
    // No existing discounts, just connect new one
    discountUpdate = {
      connect: [{ id: discount.id }]
    };
  }

  // Update cart with discount
  return await sudoContext.db.Cart.updateOne({
    where: { id: cartId },
    data: {
      discounts: discountUpdate
    },
  });
}

export default addDiscountToActiveCart; 