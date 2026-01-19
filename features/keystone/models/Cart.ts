
import { graphql, group, list } from "@keystone-6/core";
import { allOperations, allowAll, denyAll } from "@keystone-6/core/access";
import {
  json,
  select,
  text,
  timestamp,
  relationship,
  virtual,
  checkbox,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

const formatCurrency = (amount, currencyCode) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
};

// Shared calculation functions
async function calculateCartSubtotal(cart, context) {
  const sudoContext = context.sudo();

  if (!cart?.lineItems?.length) return 0;

  let subtotal = 0;
  for (const lineItem of cart.lineItems) {
    const prices = await sudoContext.query.MoneyAmount.findMany({
      where: {
        productVariant: { id: { equals: lineItem.productVariant.id } },
        region: { id: { equals: cart.region.id } },
        currency: { code: { equals: cart.region?.currency?.code } },
      },
      query: "calculatedPrice { calculatedAmount }",
    });

    const price = prices[0]?.calculatedPrice?.calculatedAmount || 0;
    subtotal += price * lineItem.quantity;
  }

  return subtotal;
}

/**
 * Calculate total discount amount for a cart
 * 
 * Based on Medusa's discount flow:
 * 1. For each discount on the cart
 * 2. For each line item, validate if the product matches the discount conditions
 * 3. Only apply discount to line items that pass validation
 * 
 * Handles three discount types:
 * - percentage: X% off
 * - fixed: $X off
 * - free_shipping: waive shipping costs
 * 
 * And two allocation modes:
 * - total: apply discount proportionally across eligible items
 * - item: apply fixed amount per eligible item
 */
async function calculateCartDiscount(cart, context) {
  const sudoContext = context.sudo();

  if (!cart?.discounts?.length) return 0;

  let totalDiscountAmount = 0;

  for (const discount of cart.discounts) {
    if (!discount.discountRule?.type) continue;

    const { type, value, allocation } = discount.discountRule;
    const conditions = discount.discountRule.discountConditions || [];
    const currencyMultiplier = cart.region?.currency?.noDivisionCurrency ? 1 : 100;

    // Filter line items to only those that pass all product-related conditions
    const eligibleLineItems = [];
    
    for (const lineItem of (cart.lineItems || [])) {
      // Check if product is discountable
      if (lineItem.productVariant?.product?.discountable === false) {
        continue;
      }

      const product = lineItem.productVariant?.product;
      if (!product) continue;

      // Validate this product against all discount conditions
      const isEligible = validateProductAgainstConditions(product, conditions);
      
      if (isEligible) {
        eligibleLineItems.push(lineItem);
      }
    }

    // If no items are eligible, skip this discount
    if (eligibleLineItems.length === 0 && type !== 'free_shipping') {
      continue;
    }

    // Calculate subtotal for eligible items only
    let eligibleSubtotal = 0;
    for (const lineItem of eligibleLineItems) {
      const prices = await sudoContext.query.MoneyAmount.findMany({
        where: {
          productVariant: { id: { equals: lineItem.productVariant.id } },
          region: { id: { equals: cart.region?.id } },
          currency: { code: { equals: cart.region?.currency?.code } },
        },
        query: "calculatedPrice { calculatedAmount }",
      });
      const price = prices[0]?.calculatedPrice?.calculatedAmount || 0;
      eligibleSubtotal += price * lineItem.quantity;
    }

    switch (type) {
      case "percentage":
        // Apply percentage to eligible subtotal
        totalDiscountAmount += eligibleSubtotal * (value / 100);
        break;
      case "fixed":
        if (allocation === 'item') {
          // For item allocation, apply fixed amount per eligible item
          const eligibleQuantity = eligibleLineItems.reduce((sum, li) => sum + li.quantity, 0);
          totalDiscountAmount += (value * currencyMultiplier) * eligibleQuantity;
        } else {
          // For total allocation, apply fixed amount once (proportionally to eligible items)
          totalDiscountAmount += value * currencyMultiplier;
        }
        break;
      case "free_shipping":
        totalDiscountAmount +=
          cart.shippingMethods?.reduce(
            (total, method) => total + (method.price || 0),
            0
          ) || 0;
        break;
    }
  }

  // Ensure discount doesn't exceed subtotal (can't have negative totals)
  const subtotal = await calculateCartSubtotal(cart, context);
  return Math.min(totalDiscountAmount, subtotal);
}

/**
 * Validate if a product matches all product-related discount conditions
 * 
 * Condition types checked:
 * - products: specific product IDs
 * - product_types: product type IDs
 * - product_collections: collection IDs
 * - product_tags: tag IDs
 * 
 * Note: customer_groups conditions are validated at cart level in addDiscountToActiveCart
 */
function validateProductAgainstConditions(product, conditions) {
  // If no conditions, discount applies to all products
  const productConditions = conditions.filter(c => 
    c.type === 'products' || 
    c.type === 'product_types' || 
    c.type === 'product_collections' || 
    c.type === 'product_tags'
  );

  if (productConditions.length === 0) {
    return true;
  }

  // All product conditions must pass (AND logic)
  for (const condition of productConditions) {
    const { type, operator } = condition;
    
    let conditionEntityIds = [];
    let productEntityIds = [];

    switch (type) {
      case 'products':
        conditionEntityIds = condition.products?.map(p => p.id) || [];
        productEntityIds = [product.id];
        break;
      case 'product_types':
        conditionEntityIds = condition.productTypes?.map(t => t.id) || [];
        productEntityIds = product.productType ? [product.productType.id] : [];
        break;
      case 'product_collections':
        conditionEntityIds = condition.productCollections?.map(c => c.id) || [];
        productEntityIds = product.productCollections?.map(c => c.id) || [];
        break;
      case 'product_tags':
        conditionEntityIds = condition.productTags?.map(t => t.id) || [];
        productEntityIds = product.productTags?.map(t => t.id) || [];
        break;
      default:
        continue;
    }

    // Skip if condition has no entities defined
    if (conditionEntityIds.length === 0) {
      continue;
    }

    const hasMatch = productEntityIds.some(id => conditionEntityIds.includes(id));

    if (operator === 'in' && !hasMatch) {
      // Product must be IN the condition set but isn't
      return false;
    }
    if (operator === 'not_in' && hasMatch) {
      // Product must NOT be in the condition set but is
      return false;
    }
  }

  return true;
}

async function calculateCartShipping(cart) {
  if (!cart?.shippingMethods?.length) return 0;
  return cart.shippingMethods.reduce(
    (total, method) => total + (method.price || 0),
    0
  );
}

async function calculateCartTax(cart, context) {
  const subtotal = await calculateCartSubtotal(cart, context);
  const discount = await calculateCartDiscount(cart, context);
  const taxableAmount = subtotal - discount;
  return taxableAmount * (cart.region?.taxRate || 0);
}

async function calculateCartTotal(cart, context) {
  const [subtotal, discount, shipping, tax] = await Promise.all([
    calculateCartSubtotal(cart, context),
    calculateCartDiscount(cart, context),
    calculateCartShipping(cart),
    calculateCartTax(cart, context),
  ]);

  return subtotal - discount + shipping + tax;
}

async function findCheapestShippingOption(regionId, context) {
  const sudoContext = context.sudo();
  const shippingOptions = await sudoContext.query.ShippingOption.findMany({
    where: {
      region: { id: { equals: regionId } },
      isReturn: { equals: false },
    },
    query: `
      id
      amount
      name
    `,
    orderBy: { amount: "asc" },
  });

  return shippingOptions[0];
}

export const Cart = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadOrders({ session }) ||
        permissions.canManageOrders({ session }),
      create: () => true,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders,
    },

    filter: {
      query: ({ session }) => {
        if (!session) return false;
        if (permissions.canManageOrders({ session })) return true;
        return { user: { id: { equals: session.itemId } } };
      },
      update: ({ session }) => {
        if (!session) return false;
        if (permissions.canManageOrders({ session })) return true;
        return { user: { id: { equals: session.itemId } } };
      },
    },
  },
  hooks: {
    async beforeOperation({ operation, resolvedData, context, item }) {
      const sudoContext = context.sudo();

      // Handle user connection on create if user is authenticated
      if (operation === 'create' && context.session?.itemId) {
        resolvedData.user = { connect: { id: context.session.itemId } };
      }

      // Handle region changes and shipping methods
      if ((operation === 'create' && resolvedData.region) || 
          (operation === 'update' && resolvedData.region && item?.region?.id !== resolvedData.region.connect?.id)) {
        
        const regionId = operation === 'create' ? resolvedData.region.connect.id : resolvedData.region.connect.id;

        // Find cheapest shipping option for new region
        const cheapestOption = await findCheapestShippingOption(regionId, context);

        if (operation === 'create') {
          // For new carts, add the shipping method directly in the create
          if (cheapestOption) {
            resolvedData.shippingMethods = {
              create: [{
                shippingOption: { connect: { id: cheapestOption.id } },
                price: cheapestOption.amount,
                data: { name: cheapestOption.name }
              }]
            };
          }
        } else {
          // For updates, we need to handle existing shipping methods
          if (item.shippingMethods?.length) {
            // Delete existing shipping methods
            await Promise.all(
              item.shippingMethods.map(method => 
                sudoContext.db.ShippingMethod.deleteOne({
                  where: { id: method.id }
                })
              )
            );
          }

          // Add new shipping method
          if (cheapestOption) {
            await sudoContext.db.ShippingMethod.createOne({
              data: {
                cart: { connect: { id: item.id } },
                shippingOption: { connect: { id: cheapestOption.id } },
                price: cheapestOption.amount,
                data: { name: cheapestOption.name }
              }
            });
          }

          // Disconnect payment collection on region change
          resolvedData.paymentCollection = { disconnect: true };
        }
      }
    },
  },
  fields: {
    email: text(),
    type: select({
      type: "enum",
      options: [
        { label: "Default", value: "default" },
        { label: "Swap", value: "swap" },
        { label: "Draft Order", value: "draft_order" },
        { label: "Payment Link", value: "payment_link" },
        { label: "Claim", value: "claim" },
      ],
      defaultValue: "default",
      validation: { isRequired: true },
    }),
    metadata: json(),
    idempotencyKey: text(),
    context: json(),
    paymentAuthorizedAt: timestamp(),
    abandonedEmailSent: checkbox({ defaultValue: false }), // Track if abandoned cart email was sent
    user: relationship({
      ref: "User.carts",
      many: false,
      hooks: {
        resolveInput({ operation, resolvedData, context }) {
          if (
            (operation === "create" || operation === "update") &&
            !resolvedData.user &&
            context.session?.itemId
          ) {
            return { connect: { id: context.session.itemId } };
          }
          return resolvedData.user;
        },
      },
    }),
    // Regular fields
    region: relationship({
      ref: "Region.carts",
    }),
    addresses: relationship({
      ref: "Address.cart",
      many: true,
    }),
    discounts: relationship({
      ref: "Discount.carts",
      many: true,
    }),
    giftCards: relationship({
      ref: "GiftCard.carts",
      many: true,
    }),
    draftOrder: relationship({
      ref: "DraftOrder.cart",
    }),
    order: relationship({
      ref: "Order.cart",
    }),
    lineItems: relationship({
      ref: "LineItem.cart",
      many: true,
    }),
    customShippingOptions: relationship({
      ref: "CustomShippingOption.cart",
      many: true,
    }),
    swap: relationship({
      ref: "Swap.cart",
    }),
    shippingMethods: relationship({
      ref: "ShippingMethod.cart",
      many: true,
    }),
    payment: relationship({
      ref: "Payment.cart",
    }),
    paymentCollection: relationship({
      ref: "PaymentCollection.cart",
    }),
    billingAddress: relationship({
      ref: "Address.cartsUsingAsBillingAddress",
      many: false,
    }),
    shippingAddress: relationship({
      ref: "Address.cartsUsingAsShippingAddress",
      many: false,
    }),

    ...group({
      label: "Virtual Fields",
      description: "Calculated fields for cart display and totals",
      fields: {
        abandonedFor: virtual({
          field: graphql.field({
            type: graphql.Int,
            resolve(item) {
              if (!item.updatedAt) return 0;
              const lastActivity = new Date(item.updatedAt).getTime();
              return Math.floor((Date.now() - lastActivity) / (1000 * 60)); // Returns minutes since last activity
            },
          }),
        }),
        status: virtual({
          field: graphql.field({
            type: graphql.enum({
              name: "CartStatus",
              values: graphql.enumValues(["ACTIVE", "COMPLETED"]),
            }),
            resolve(item) {
              return item.order ? "COMPLETED" : "ACTIVE";
            },
          }),
        }),
        isActive: virtual({
          field: graphql.field({
            type: graphql.Boolean,
            resolve(item) {
              return !item.order;
            },
          }),
        }),
        subtotal: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();

              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  lineItems { 
                    id 
                    quantity
                    productVariant {
                      id
                    }
                  } 
                  region { 
                    id
                    currency { 
                      code 
                      noDivisionCurrency 
                    }
                  }
                `,
              });

              if (!cart) return null;

              const subtotal = await calculateCartSubtotal(cart, context);
              const currencyCode = cart.region?.currency?.code || "USD";
              const divisor = cart.region?.currency?.noDivisionCurrency
                ? 1
                : 100;

              return formatCurrency(subtotal / divisor, currencyCode);
            },
          }),
        }),
        total: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();

              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                  lineItems {
                    id
                    quantity
                    productVariant {
                      id
                      product {
                        id
                        discountable
                        productType { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                      allocation
                      discountConditions {
                        id
                        type
                        operator
                        products { id }
                        productTypes { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  shippingMethods {
                    price
                  }
                `,
              });

              const total = await calculateCartTotal(cart, context);
              const currencyCode = cart.region?.currency?.code || "USD";
              const divisor = cart.region?.currency?.noDivisionCurrency
                ? 1
                : 100;

              return formatCurrency(total / divisor, currencyCode);
            },
          }),
        }),
        rawTotal: virtual({
          field: graphql.field({
            type: graphql.Int,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();

              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                  lineItems {
                    id
                    quantity
                    productVariant {
                      id
                      product {
                        id
                        discountable
                        productType { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                      allocation
                      discountConditions {
                        id
                        type
                        operator
                        products { id }
                        productTypes { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  shippingMethods {
                    price
                  }
                `,
              });

              if (!cart) return 0;

              return Math.round(await calculateCartTotal(cart, context));
            },
          }),
        }),
        rawSubtotal: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();

              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  lineItems { 
                    id 
                    quantity
                    productVariant {
                      id
                      title
                      product {
                        title
                      }
                    }
                  } 
                  region { 
                    id
                    currency { 
                      code 
                      noDivisionCurrency 
                    }
                  }
                `,
              });

              if (!cart?.lineItems?.length) return "No items in cart";

              let subtotal = 0;
              const breakdown = [];

              for (const lineItem of cart.lineItems) {
                const prices = await sudoContext.query.MoneyAmount.findMany({
                  where: {
                    productVariant: { id: { equals: lineItem.productVariant.id } },
                    region: { id: { equals: cart.region.id } },
                    currency: { code: { equals: cart.region?.currency?.code } },
                  },
                  query: "id region { id } currency { code } calculatedPrice { calculatedAmount }",
                });


                const price = prices[0]?.calculatedPrice?.calculatedAmount || 0;
                const itemTotal = price * lineItem.quantity;
                subtotal += itemTotal;

                const title = `${lineItem.productVariant.product?.title} - ${lineItem.productVariant.title}`;
                breakdown.push(`${title}: ${price} × ${lineItem.quantity} = ${itemTotal}`);
              }

              return `Total: ${subtotal}\nBreakdown:\n${breakdown.join('\n')}`;
            },
          }),
        }),
        rawTotalBreakdown: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();

              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                  lineItems {
                    id
                    quantity
                    productVariant {
                      id
                      product {
                        id
                        discountable
                        productType { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                      allocation
                      discountConditions {
                        id
                        type
                        operator
                        products { id }
                        productTypes { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  shippingMethods {
                    price
                  }
                `,
              });

              if (!cart) return "Cart not found";

              const subtotal = await calculateCartSubtotal(cart, context);
              const discount = await calculateCartDiscount(cart, context);
              const shipping = await calculateCartShipping(cart);
              const tax = await calculateCartTax(cart, context);
              const total = subtotal - discount + shipping + tax;

              return `subtotal(${subtotal}) - discount(${discount}) + shipping(${shipping}) + tax(${tax}) = ${total}`;
            },
          }),
        }),
        discount: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();

              // Get cart with items and discounts
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  lineItems { 
                    id 
                    quantity 
                    productVariant {
                      id
                      product {
                        id
                        discountable
                        productType { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                      allocation
                      discountConditions {
                        id
                        type
                        operator
                        products { id }
                        productTypes { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  region {
                    id
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                  shippingMethods {
                    price
                    shippingOption {
                      id
                      name
                    }
                  }
                `,
              });

              if (!cart?.discounts?.length) {
                return null;
              }

              // First get subtotal for percentage calculations
              let subtotal = 0;
              for (const lineItem of cart.lineItems || []) {
                const prices = await sudoContext.query.MoneyAmount.findMany({
                  where: {
                    productVariant: {
                      id: { equals: lineItem.productVariant.id },
                    },
                    region: { id: { equals: cart.region.id } },
                    currency: { code: { equals: cart.region?.currency?.code } },
                  },
                  query: "calculatedPrice { calculatedAmount }",
                });

                const price = prices[0]?.calculatedPrice?.calculatedAmount || 0;
                subtotal += price * lineItem.quantity;
              }

              // Calculate total discount amount
              let totalDiscountAmount = 0;
              for (const discount of cart.discounts) {
                // Skip if no discount rule or type
                if (!discount.discountRule?.type) continue;

                switch (discount.discountRule.type) {
                  case "percentage":
                    totalDiscountAmount +=
                      subtotal * (discount.discountRule.value / 100);
                    break;
                  case "fixed":
                    totalDiscountAmount +=
                      discount.discountRule.value *
                      (cart.region?.currency?.noDivisionCurrency ? 1 : 100);
                    break;
                  case "free_shipping":
                    // Add shipping amount to discount
                    totalDiscountAmount +=
                      cart.shippingMethods?.reduce(
                        (total, method) => total + (method.price || 0),
                        0
                      ) || 0;
                    break;
                }
              }

              if (totalDiscountAmount === 0) return null;

              const currencyCode = cart.region?.currency?.code || "USD";
              const divisor = cart.region?.currency?.noDivisionCurrency
                ? 1
                : 100;

              return formatCurrency(
                totalDiscountAmount / divisor,
                currencyCode
              );
            },
          }),
        }),
        giftCardTotal: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();

              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  giftCards {
                    id
                    balance
                    value
                  }
                  region {
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `,
              });

              if (!cart?.giftCards?.length) {
                return null;
              }

              const total = cart.giftCards.reduce((sum, card) => {
                // Use the lower of balance or value
                const usableAmount = Math.min(
                  card.balance,
                  card.value || card.balance
                );
                return sum + usableAmount;
              }, 0);

              if (total === 0) return null;

              const currencyCode = cart.region?.currency?.code || "USD";
              const divisor = cart.region?.currency?.noDivisionCurrency
                ? 1
                : 100;

              return formatCurrency(total / divisor, currencyCode);
            },
          }),
        }),
        tax: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();

              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                  lineItems {
                    id
                    quantity
                    productVariant {
                      id
                      product {
                        id
                        discountable
                        productType { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                      allocation
                      discountConditions {
                        id
                        type
                        operator
                        products { id }
                        productTypes { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                `,
              });

              const tax = await calculateCartTax(cart, context);
              const currencyCode = cart.region?.currency?.code || "USD";
              const divisor = cart.region?.currency?.noDivisionCurrency
                ? 1
                : 100;

              return formatCurrency(tax / divisor, currencyCode);
            },
          }),
        }),
        shipping: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();

              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  shippingMethods {
                    price
                  }
                  region {
                    id
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `,
              });

              // If cart has shipping methods, use their sum
              if (cart?.shippingMethods?.length > 0) {
                const shipping = await calculateCartShipping(cart);
                const currencyCode = cart.region?.currency?.code || "USD";
                const divisor = cart.region?.currency?.noDivisionCurrency
                  ? 1
                  : 100;
                return shipping > 0
                  ? formatCurrency(shipping / divisor, currencyCode)
                  : null;
              }

              // If no shipping methods, find the cheapest available option
              if (cart?.region?.id) {
                const shippingOptions =
                  await sudoContext.query.ShippingOption.findMany({
                    where: {
                      region: { id: { equals: cart.region.id } },
                      isReturn: { equals: false },
                    },
                    query: `
                    amount
                    priceType
                    calculatedAmount
                  `,
                    orderBy: { amount: "asc" },
                  });

                if (shippingOptions?.length > 0) {
                  const currencyCode = cart.region?.currency?.code || "USD";
                  const divisor = cart.region?.currency?.noDivisionCurrency
                    ? 1
                    : 100;
                  return formatCurrency(
                    shippingOptions[0].amount / divisor,
                    currencyCode
                  );
                }
              }

              // Return null if no options available
              return null;
            },
          }),
        }),
        cheapestShipping: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();

              // First check if cart has actual shipping methods
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  shippingMethods {
                    price
                  }
                  region {
                    id
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `,
              });

              // If cart has shipping methods, use their sum
              if (cart?.shippingMethods?.length > 0) {
                const shippingAmount = cart.shippingMethods.reduce(
                  (total, method) => total + (method.price || 0),
                  0
                );
                const currencyCode = cart.region?.currency?.code || "USD";
                const divisor = cart.region?.currency?.noDivisionCurrency
                  ? 1
                  : 100;

                return formatCurrency(shippingAmount / divisor, currencyCode);
              }

              // If no shipping methods, find the cheapest available option
              if (cart?.region?.id) {
                const shippingOptions =
                  await sudoContext.query.ShippingOption.findMany({
                    where: {
                      region: { id: { equals: cart.region.id } },
                      isReturn: { equals: false },
                    },
                    query: `
                    amount
                    priceType
                    calculatedAmount
                  `,
                    orderBy: { amount: "asc" },
                  });

                if (shippingOptions?.length > 0) {
                  const currencyCode = cart.region?.currency?.code || "USD";
                  const divisor = cart.region?.currency?.noDivisionCurrency
                    ? 1
                    : 100;
                  return formatCurrency(
                    shippingOptions[0].amount / divisor,
                    currencyCode
                  );
                }
              }

              // Return null if no options available
              return null;
            },
          }),
        }),
        discountsById: virtual({
          field: graphql.field({
            type: graphql.JSON,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();

              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  lineItems { 
                    id 
                    quantity 
                    productVariant {
                      id
                      product {
                        id
                        discountable
                        productType { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                      allocation
                      discountConditions {
                        id
                        type
                        operator
                        products { id }
                        productTypes { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  region {
                    id
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                  shippingMethods {
                    price
                    shippingOption {
                      id
                      name
                    }
                  }
                `,
              });

              if (!cart?.discounts?.length) {
                return {};
              }

              const currencyCode = cart.region?.currency?.code || "USD";
              const divisor = cart.region?.currency?.noDivisionCurrency
                ? 1
                : 100;

              // Calculate subtotal for percentage calculations
              let subtotal = 0;
              for (const lineItem of cart.lineItems || []) {
                const prices = await sudoContext.query.MoneyAmount.findMany({
                  where: {
                    productVariant: {
                      id: { equals: lineItem.productVariant.id },
                    },
                    region: { id: { equals: cart.region.id } },
                    currency: { code: { equals: currencyCode } },
                  },
                  query: "calculatedPrice { calculatedAmount }",
                });

                const price = prices[0]?.calculatedPrice?.calculatedAmount || 0;
                subtotal += price * lineItem.quantity;
              }

              // Calculate amounts for all discounts
              const discountAmounts = {};
              for (const discount of cart.discounts) {
                // Skip if no discount rule or type
                if (!discount.discountRule?.type) continue;

                let amount = 0;

                switch (discount.discountRule.type) {
                  case "percentage":
                    amount = subtotal * (discount.discountRule.value / 100);
                    break;
                  case "fixed":
                    amount =
                      discount.discountRule.value *
                      (cart.region?.currency?.noDivisionCurrency ? 1 : 100);
                    break;
                  case "free_shipping":
                    amount =
                      cart.shippingMethods?.reduce(
                        (total, method) => total + (method.price || 0),
                        0
                      ) || 0;
                    break;
                }

                if (amount > 0) {
                  discountAmounts[discount.id] = formatCurrency(
                    amount / divisor,
                    currencyCode
                  );
                }
              }

              return discountAmounts;
            },
          }),
        }),
        checkoutStep: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();

              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  id
                  email
                  billingAddress { id }
                  shippingAddress { id }
                  shippingMethods {
                    id
                  }
                  paymentCollection {
                    id
                    paymentSessions {
                      id
                      isSelected
                    }
                  }
                  lineItems {
                    id
                  }
                `,
              });

              // No cart or no items
              if (!cart || !cart.lineItems?.length) return "cart";

              // No addresses - check both billing and shipping
              if (!cart.billingAddress?.id || !cart.shippingAddress?.id)
                return "address";

              // No shipping method
              if (!cart.shippingMethods?.length) return "delivery";

              // No payment collection or no selected payment session
              if (
                !cart.paymentCollection?.id ||
                !cart.paymentCollection?.paymentSessions?.some(
                  (s) => s.isSelected
                )
              ) {
                return "payment";
              }

              // All steps completed
              return "review";
            },
          }),
        }),
      },
    }),
    ...trackingFields,
  },
});
