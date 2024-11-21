async function updateActiveCart(root, { cartId, code, data }, context) {
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

  // Block any attempt to create new discounts/gift cards
  if (data?.discounts?.create || data?.giftCards?.create) {
    throw new Error("Creating new discounts or gift cards is not allowed");
  }

  // Handle code if provided (for discounts or gift cards)
  if (code) {
    // Try to find as discount first
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

    // If not a discount, try as gift card
    if (!discount) {
      const giftCard = await sudoContext.query.GiftCard.findOne({
        where: { code },
        query: `
          id
          code
          balance
          isDisabled
          endsAt
          region {
            id
          }
        `
      });

      if (giftCard) {
        // Validate gift card
        if (giftCard.isDisabled) {
          throw new Error(`Gift card ${code} is disabled`);
        }

        if (giftCard.balance <= 0) {
          throw new Error(`Gift card ${code} has no remaining balance`);
        }

        // Check expiration
        if (giftCard.endsAt && new Date(giftCard.endsAt) < new Date()) {
          throw new Error(`Gift card ${code} has expired`);
        }

        // Check region compatibility
        if (giftCard.region?.id !== existingCart.region?.id) {
          throw new Error(`Gift card ${code} is not valid in this region`);
        }

        // Check if gift card is already applied
        const existingGiftCard = await sudoContext.query.GiftCard.findOne({
          where: { 
            AND: [
              { code },
              { carts: { some: { id: { equals: cartId } } } }
            ]
          }
        });

        if (existingGiftCard) {
          throw new Error(`Gift card ${code} is already applied to this cart`);
        }

        // Connect gift card
        data = {
          ...data,
          giftCards: {
            connect: [{ id: giftCard.id }]
          }
        };
      } else {
        throw new Error(`No discount or gift card found with code: ${code}`);
      }
    } else {
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

      // Check discount conditions
      if (discount.discountRule?.discountConditions?.length) {
        for (const condition of discount.discountRule.discountConditions) {
          // Check product conditions
          if (condition.products?.length) {
            const cartProducts = await sudoContext.query.LineItem.findMany({
              where: { cart: { id: { equals: cartId } } },
              query: 'productVariant { product { id } }'
            });
            const productIds = cartProducts.map(item => item.productVariant.product.id);
            const hasValidProduct = productIds.some(id => 
              condition.products.some(p => p.id === id)
            );
            if (!hasValidProduct) {
              throw new Error(`Cart must contain specific products for discount ${code}`);
            }
          }

          // Check product category conditions
          if (condition.productCategories?.length) {
            const cartProducts = await sudoContext.query.LineItem.findMany({
              where: { cart: { id: { equals: cartId } } },
              query: 'productVariant { product { productCategories { id } } }'
            });
            const categoryIds = cartProducts.flatMap(item => 
              item.productVariant.product.productCategories.map(c => c.id)
            );
            const hasValidCategory = categoryIds.some(id =>
              condition.productCategories.some(c => c.id === id)
            );
            if (!hasValidCategory) {
              throw new Error(`Cart must contain products from specific categories for discount ${code}`);
            }
          }

          // Check customer group conditions
          if (condition.customerGroups?.length) {
            const cart = await sudoContext.query.Cart.findOne({
              where: { id: cartId },
              query: 'user { customerGroups { id } }'
            });

            if (!cart.user) {
              throw new Error(`Must be logged in to use discount ${code}`);
            }

            const hasValidGroup = cart.user.customerGroups?.some(g => 
              condition.customerGroups.some(cg => cg.id === g.id)
            );
            if (!hasValidGroup) {
              throw new Error(`Not eligible for discount ${code}`);
            }
          }
        }
      }

      // Get existing cart discounts
      const existingDiscounts = await sudoContext.query.Cart.findOne({
        where: { id: cartId },
        query: `
          discounts {
            id
            code
            stackable
          }
        `
      });

      // Check if cart has any discounts
      if (existingDiscounts?.discounts?.length > 0) {
        // Check if any existing discount is non-stackable
        const hasNonStackable = existingDiscounts.discounts.some(d => !d.stackable);
        if (hasNonStackable) {
          // If there's a non-stackable discount, replace it
          data = {
            ...data,
            discounts: {
              disconnect: existingDiscounts.discounts.map(d => ({ id: d.id })),
              connect: [{ id: discount.id }]
            }
          };
        } else if (!discount.stackable) {
          // If new discount is non-stackable, replace all existing
          data = {
            ...data,
            discounts: {
              disconnect: existingDiscounts.discounts.map(d => ({ id: d.id })),
              connect: [{ id: discount.id }]
            }
          };
        } else {
          // Both are stackable, add new one
          data = {
            ...data,
            discounts: {
              connect: [{ id: discount.id }]
            }
          };
        }
      } else {
        // No existing discounts, just connect new one
        data = {
          ...data,
          discounts: {
            connect: [{ id: discount.id }]
          }
        };
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

