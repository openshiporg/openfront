import { graphql, list } from "@keystone-6/core";
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
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
};

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
    async afterOperation({ operation, item, context }) {
      // Run for both create and update operations
      if (operation === 'create' || operation === 'update') {
        const sudoContext = context.sudo();
        
        // Get cart with all needed data
        const cart = await sudoContext.query.Cart.findOne({
          where: { id: item.id },
          query: `
            subtotal
            region {
              id
              shippingOptions {
                id
                name
                priceType
                amount
                isReturn
                adminOnly
                shippingOptionRequirements {
                  id
                  type
                  amount
                }
                shippingProfile {
                  id
                  type
                }
                fulfillmentProvider {
                  id
                }
                taxRates {
                  id
                  rate
                }
              }
            }
            shippingMethods {
              id
              price
              shippingOption {
                id
                shippingOptionRequirements {
                  type
                  amount
                }
              }
            }
          `
        });

        // Get valid shipping options based on current cart state
        const validShippingOptions = cart.region.shippingOptions.filter(option => {
          // Skip admin-only and return shipping options
          if (option.adminOnly || option.isReturn) return false;

          // Check shipping profile type
          if (option.shippingProfile?.type === 'gift_card') return false;

          // Check requirements against current cart state
          if (option.shippingOptionRequirements?.length) {
            for (const req of option.shippingOptionRequirements) {
              // Convert amounts to same currency unit
              const cartSubtotal = cart.subtotal / 100; // Assuming stored in cents
              const reqAmount = req.amount / 100;

              if (req.type === 'min_subtotal' && cartSubtotal < reqAmount) return false;
              if (req.type === 'max_subtotal' && cartSubtotal > reqAmount) return false;
            }
          }

          return true;
        });

        // Get cheapest valid option
        const cheapestOption = validShippingOptions.reduce((min, curr) => {
          const currAmount = curr.priceType === 'flat_rate' ? curr.amount : 0;
          const minAmount = min?.priceType === 'flat_rate' ? min.amount : 0;
          return (!min || currAmount < minAmount) ? curr : min;
        }, null);

        // Check if current shipping method is still valid
        const currentMethod = cart.shippingMethods?.[0];
        const needsNewMethod = !currentMethod || 
          !validShippingOptions.some(opt => opt.id === currentMethod.shippingOption.id);

        // Update shipping method if needed
        if (cheapestOption && needsNewMethod) {
          // Remove existing shipping method if any
          if (currentMethod) {
            await sudoContext.db.ShippingMethod.deleteOne({
              where: { id: currentMethod.id }
            });
          }

          // Create new shipping method with tax lines
          const shippingMethod = await sudoContext.db.ShippingMethod.createOne({
            data: {
              cart: { connect: { id: item.id } },
              shippingOption: { connect: { id: cheapestOption.id } },
              price: cheapestOption.amount,
              data: {
                name: cheapestOption.name
              }
            }
          });

          // Create tax lines if needed
          if (cheapestOption.taxRates?.length) {
            await Promise.all(cheapestOption.taxRates.map(tax => 
              sudoContext.db.ShippingMethodTaxLine.createOne({
                data: {
                  shippingMethod: { connect: { id: shippingMethod.id } },
                  rate: tax.rate,
                  name: `Shipping Tax ${tax.rate * 100}%`,
                  code: `shipping_tax_${tax.rate}`
                }
              })
            ));
          }
        }
      }
    }
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
    user: relationship({
      ref: "User.carts",
      many: false,
      hooks: {
        resolveInput({ operation, resolvedData, context }) {
          if ((operation === 'create' || operation === 'update') && 
              !resolvedData.user && 
              context.session?.itemId) {
            return { connect: { id: context.session.itemId } };
          }
          return resolvedData.user;
        },
      },
    }),
    // Virtual field for cart status
    status: virtual({
      field: graphql.field({
        type: graphql.enum({
          name: 'CartStatus',
          values: graphql.enumValues(['ACTIVE', 'COMPLETED']),
        }),
        resolve(item) {
          return item.order ? 'COMPLETED' : 'ACTIVE';
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
    paymentSessions: relationship({
      ref: "PaymentSession.cart",
      many: true,
    }),
    subtotal: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item, args, context) {
          const sudoContext = context.sudo();
          
          const cartWithItems = await sudoContext.query.Cart.findOne({
            where: { id: item.id },
            query: `
              lineItems { 
                id 
                quantity 
              } 
              region { 
                id 
                currency { 
                  code 
                  noDivisionCurrency 
                }
              }
            `
          });

          if (!cartWithItems?.lineItems?.length) {
            return null; // Return null instead of "0" if no items
          }

          let subtotal = 0;
          for (const lineItem of cartWithItems.lineItems) {
            const prices = await sudoContext.query.MoneyAmount.findMany({
              where: { 
                productVariant: { 
                  lineItems: { some: { id: { equals: lineItem.id } } }
                }
              },
              query: 'calculatedPrice { calculatedAmount }'
            });
            
            const price = prices[0]?.calculatedPrice?.calculatedAmount || 0;
            subtotal += price * lineItem.quantity;
          }

          const currencyCode = cartWithItems.region?.currency?.code || 'USD';
          const divisor = cartWithItems.region?.currency?.noDivisionCurrency ? 1 : 100;

          return formatCurrency(subtotal / divisor, currencyCode);
        }
      })
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
              }
              discounts {
                id
                discountRule {
                  type
                  value
                }
              }
              giftCards {
                id
                balance
              }
              shippingMethods {
                price
              }
            `
          });

          if (!cart?.lineItems?.length) return null;

          // 1. Get subtotal
          let subtotal = 0;
          for (const lineItem of cart.lineItems) {
            const prices = await sudoContext.query.MoneyAmount.findMany({
              where: { 
                productVariant: { 
                  lineItems: { some: { id: { equals: lineItem.id } } }
                }
              },
              query: 'calculatedPrice { calculatedAmount }'
            });
            
            const price = prices[0]?.calculatedPrice?.calculatedAmount || 0;
            subtotal += price * lineItem.quantity;
          }

          // 2. Calculate discount
          let discountAmount = 0;
          if (cart.discounts?.length) {
            for (const discount of cart.discounts) {
              if (discount.discountRule.type === 'percentage') {
                discountAmount += subtotal * (discount.discountRule.value / 100);
              } else if (discount.discountRule.type === 'fixed') {
                discountAmount += discount.discountRule.value;
              }
            }
          }

          // 3. Calculate tax on discounted amount
          const taxableAmount = subtotal - discountAmount;
          const tax = taxableAmount * (cart.region.taxRate || 0);

          // 4. Add shipping
          const shipping = cart.shippingMethods?.[0]?.price || 0;

          // 5. Calculate final total - NOW INCLUDING SHIPPING
          const total = subtotal - discountAmount + tax + shipping;

          const currencyCode = cart.region?.currency?.code || 'USD';
          const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;

          return formatCurrency(total / divisor, currencyCode);
        }
      })
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
              }
              discounts {
                id
                discountRule {
                  type
                  value
                  allocation
                }
              }
              region {
                currency {
                  code
                  noDivisionCurrency
                }
              }
            `
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
                  lineItems: { some: { id: { equals: lineItem.id } } }
                }
              },
              query: 'calculatedPrice { calculatedAmount }'
            });
            
            const price = prices[0]?.calculatedPrice?.calculatedAmount || 0;
            subtotal += price * lineItem.quantity;
          }

          // Calculate discount amount
          let discountAmount = 0;
          for (const discount of cart.discounts) {
            if (discount.discountRule.type === 'percentage') {
              discountAmount += subtotal * (discount.discountRule.value / 100);
            } else if (discount.discountRule.type === 'fixed') {
              discountAmount += discount.discountRule.value;
            }
          }

          if (discountAmount === 0) return null;

          const currencyCode = cart.region?.currency?.code || 'USD';
          const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;

          return formatCurrency(discountAmount / divisor, currencyCode);
        }
      })
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
            `
          });

          if (!cart?.giftCards?.length) {
            return null;
          }

          const total = cart.giftCards.reduce((sum, card) => {
            // Use the lower of balance or value
            const usableAmount = Math.min(card.balance, card.value || card.balance);
            return sum + usableAmount;
          }, 0);

          if (total === 0) return null;

          const currencyCode = cart.region?.currency?.code || 'USD';
          const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;

          return formatCurrency(total / divisor, currencyCode);
        }
      })
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
              }
              discounts {
                id
                discountRule {
                  type
                  value
                }
              }
            `
          });

          if (!cart?.lineItems?.length) return null;

          // 1. Calculate subtotal first
          let subtotal = 0;
          for (const lineItem of cart.lineItems) {
            const prices = await sudoContext.query.MoneyAmount.findMany({
              where: { 
                productVariant: { 
                  lineItems: { some: { id: { equals: lineItem.id } } }
                }
              },
              query: 'calculatedPrice { calculatedAmount }'
            });
            
            const price = prices[0]?.calculatedPrice?.calculatedAmount || 0;
            subtotal += price * lineItem.quantity;
          }

          // 2. Calculate discount amount
          let discountAmount = 0;
          if (cart.discounts?.length) {
            for (const discount of cart.discounts) {
              if (discount.discountRule.type === 'percentage') {
                discountAmount += subtotal * (discount.discountRule.value / 100);
              } else if (discount.discountRule.type === 'fixed') {
                discountAmount += discount.discountRule.value;
              }
            }
          }

          // 3. Calculate tax on discounted amount
          const taxableAmount = subtotal - discountAmount;
          const taxAmount = taxableAmount * (cart.region.taxRate || 0);
          
          const currencyCode = cart.region?.currency?.code || 'USD';
          const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;

          return formatCurrency(taxAmount / divisor, currencyCode);
        }
      })
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
                shippingOption {
                  id
                  name
                }
              }
              region {
                currency {
                  code
                  noDivisionCurrency
                }
              }
            `
          });

          // Sum up all shipping method prices
          const shippingAmount = cart.shippingMethods?.reduce((total, method) => 
            total + (method.price || 0), 0) || 0;
          
          const currencyCode = cart.region?.currency?.code || 'USD';
          const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;

          return formatCurrency(shippingAmount / divisor, currencyCode);
        }
      })
    }),
    ...trackingFields,
  },
});
