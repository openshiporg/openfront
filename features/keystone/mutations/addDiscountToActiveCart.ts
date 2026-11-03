import { shopperError } from "../lib/shopperError";
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

import { assertCartAccess } from "../security/cart-access";

async function addDiscountToActiveCart(root, { cartId, code }, context) {
  await assertCartAccess(context, cartId);
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
    throw shopperError(`Cannot apply discount to an empty cart`, "CART_EMPTY");
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
    throw shopperError(`Invalid discount code: ${code}`, "INVALID_DISCOUNT_CODE");
  }

  // Check if discount is already applied
  if (cart.discounts?.some(d => d.id === discount.id)) {
    throw shopperError(`Discount ${code} is already applied to this cart`, "DISCOUNT_ALREADY_APPLIED");
  }

  // Validate discount is enabled
  if (discount.isDisabled) {
    throw shopperError(`Discount ${code} is no longer available`, "DISCOUNT_UNAVAILABLE");
  }

  // Check date validity
  const now = new Date();
  if (discount.startsAt && new Date(discount.startsAt) > now) {
    throw shopperError(`Discount ${code} is not yet active`, "DISCOUNT_NOT_ACTIVE");
  }
  if (discount.endsAt && new Date(discount.endsAt) < now) {
    throw shopperError(`Discount ${code} has expired`, "DISCOUNT_EXPIRED");
  }

  // Check usage limits
  if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
    throw shopperError(`Discount ${code} has reached its usage limit`, "DISCOUNT_USAGE_LIMIT");
  }

  // Validate region eligibility (if discount has region restrictions)
  if (discount.regions && discount.regions.length > 0 && cart.region) {
    const isValidForRegion = discount.regions.some(r => r.id === cart.region.id);
    if (!isValidForRegion) {
      throw shopperError(`Discount ${code} is not available in your region`, "DISCOUNT_NOT_ELIGIBLE");
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
        throw shopperError(`Discount ${code} is not available for your customer group`, "DISCOUNT_NOT_ELIGIBLE");
      }
      if (condition.operator === 'not_in' && hasMatch) {
        throw shopperError(`Discount ${code} is not available for your customer group`, "DISCOUNT_NOT_ELIGIBLE");
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
      discounts: discountUpdate,
      paymentCollection: { disconnect: true },
    },
  });

  // Note: Usage count is incremented when the cart is completed (order placed),
  // not when discount is added to cart. This prevents counting abandoned carts.

  return updatedCart;
}

export default addDiscountToActiveCart;
