/**
 * addDiscountToActiveCart - Apply a discount code to a cart
 * 
 * Based on Medusa's discount flow:
 * 1. Validate discount exists and is active (not disabled, within date range, usage limit)
 * 2. Validate customer eligibility (customer group conditions)
 * 3. Validate region eligibility
 * 4. Handle stackability rules with existing cart discounts
 * 
 * Note: Product-level validation (which items get the discount) happens in calculateCartDiscount
 */

async function addDiscountToActiveCart(root, { cartId, code }, context) {
  const sudoContext = context.sudo();

  // Get cart with customer and region info for eligibility validation
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      region {
        id
      }
      user {
        id
        customerGroups {
          id
        }
      }
      lineItems {
        id
      }
      discounts {
        id
        code
        stackable
      }
    `
  });

  if (!cart) {
    throw new Error(`Cart not found`);
  }

  if (!cart.lineItems || cart.lineItems.length === 0) {
    throw new Error(`Cannot apply discount to an empty cart`);
  }

  // Find the discount with full details
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
      regions {
        id
      }
      discountRule {
        id
        type
        value
        allocation
        discountConditions {
          id
          type
          operator
          customerGroups {
            id
          }
        }
      }
    `
  });

  if (!discount) {
    throw new Error(`Invalid discount code: ${code}`);
  }

  // Check if discount is already applied
  if (cart.discounts?.some(d => d.id === discount.id)) {
    throw new Error(`Discount ${code} is already applied to this cart`);
  }

  // Validate discount is enabled
  if (discount.isDisabled) {
    throw new Error(`Discount ${code} is no longer available`);
  }

  // Check date validity
  const now = new Date();
  if (discount.startsAt && new Date(discount.startsAt) > now) {
    throw new Error(`Discount ${code} is not yet active`);
  }
  if (discount.endsAt && new Date(discount.endsAt) < now) {
    throw new Error(`Discount ${code} has expired`);
  }

  // Check usage limits
  if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
    throw new Error(`Discount ${code} has reached its usage limit`);
  }

  // Validate region eligibility (if discount has region restrictions)
  if (discount.regions && discount.regions.length > 0 && cart.region) {
    const isValidForRegion = discount.regions.some(r => r.id === cart.region.id);
    if (!isValidForRegion) {
      throw new Error(`Discount ${code} is not available in your region`);
    }
  }

  // Validate customer group eligibility
  // This is cart-level validation - does the customer qualify to use this discount?
  if (discount.discountRule?.discountConditions) {
    const customerGroupConditions = discount.discountRule.discountConditions.filter(
      c => c.type === 'customer_groups'
    );

    for (const condition of customerGroupConditions) {
      const conditionGroupIds = condition.customerGroups?.map(g => g.id) || [];
      const customerGroupIds = cart.user?.customerGroups?.map(g => g.id) || [];

      if (conditionGroupIds.length === 0) continue;

      const hasMatch = customerGroupIds.some(id => conditionGroupIds.includes(id));

      if (condition.operator === 'in' && !hasMatch) {
        throw new Error(`Discount ${code} is not available for your customer group`);
      }
      if (condition.operator === 'not_in' && hasMatch) {
        throw new Error(`Discount ${code} is not available for your customer group`);
      }
    }
  }

  // Handle stackability rules
  let discountUpdate;
  
  if (cart.discounts && cart.discounts.length > 0) {
    const hasNonStackable = cart.discounts.some(d => !d.stackable);
    
    if (hasNonStackable) {
      // Replace non-stackable discount with new one
      discountUpdate = {
        disconnect: cart.discounts.map(d => ({ id: d.id })),
        connect: [{ id: discount.id }]
      };
    } else if (!discount.stackable) {
      // New discount is non-stackable, replace all existing
      discountUpdate = {
        disconnect: cart.discounts.map(d => ({ id: d.id })),
        connect: [{ id: discount.id }]
      };
    } else {
      // Both are stackable, add new one
      discountUpdate = {
        connect: [{ id: discount.id }]
      };
    }
  } else {
    discountUpdate = {
      connect: [{ id: discount.id }]
    };
  }

  // Update cart with discount
  const updatedCart = await sudoContext.db.Cart.updateOne({
    where: { id: cartId },
    data: {
      discounts: discountUpdate
    },
  });

  // Note: Usage count is incremented when the cart is completed (order placed),
  // not when discount is added to cart. This prevents counting abandoned carts.

  return updatedCart;
}

export default addDiscountToActiveCart;
