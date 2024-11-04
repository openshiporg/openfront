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
          
          const cart = await sudoContext.query.Cart.findOne({
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

          if (!cart?.lineItems?.length) {
            return formatCurrency(0, cart?.region?.currency?.code || 'USD');
          }

          // Calculate subtotal from line items
          let subtotal = 0;
          for (const lineItem of cart.lineItems) {
            const prices = await sudoContext.query.MoneyAmount.findMany({
              where: { 
                productVariant: { 
                  lineItems: { some: { id: { equals: lineItem.id } } }
                },
                region: { id: { equals: cart.region.id } }  // Add region filter
              },
              query: 'calculatedPrice { calculatedAmount }'
            });
            
            const price = prices[0]?.calculatedPrice?.calculatedAmount || 0;
            subtotal += price * lineItem.quantity;
          }

          const currencyCode = cart.region?.currency?.code || 'USD';
          const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;

          return formatCurrency(subtotal / divisor, currencyCode);
        }
      })
    }),
    total: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item, args, context) {
          const sudoContext = context.sudo();
          
          // Get cart with related data
          const cart = await sudoContext.query.Cart.findOne({
            where: { id: item.id },
            query: `
              lineItems { id quantity }
              region { id }
              discounts { id }
              giftCards { id }
            `
          });

          if (!cart?.lineItems?.length) return formatCurrency(0, 'USD');

          // Get region details
          const region = await sudoContext.query.Region.findOne({
            where: { id: cart.region.id },
            query: 'taxRate currency { code noDivisionCurrency }'
          });

          // Calculate base total
          let total = 0;
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
            total += price * lineItem.quantity;
          }

          // Apply discounts
          if (cart.discounts?.length) {
            for (const discountRef of cart.discounts) {
              const discount = await sudoContext.query.Discount.findOne({
                where: { id: discountRef.id },
                query: 'value type'
              });

              if (discount.type === 'percentage') {
                total *= (1 - discount.value / 100);
              } else if (discount.type === 'fixed') {
                total = Math.max(0, total - discount.value);
              }
            }
          }

          // Apply gift cards
          if (cart.giftCards?.length) {
            for (const giftCardRef of cart.giftCards) {
              const giftCard = await sudoContext.query.GiftCard.findOne({
                where: { id: giftCardRef.id },
                query: 'balance'
              });
              total = Math.max(0, total - giftCard.balance);
            }
          }

          // Apply tax
          const taxRate = region?.taxRate || 0;
          total *= (1 + taxRate);

          const currencyCode = region?.currency?.code || 'USD';
          const divisor = region?.currency?.noDivisionCurrency ? 1 : 100;

          return formatCurrency(total / divisor, currencyCode);
        }
      })
    }),
    discount: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item, args, context) {
          const sudoContext = context.sudo();
          
          // Get cart with lineItems and discounts
          const cart = await sudoContext.query.Cart.findOne({
            where: { id: item.id },
            query: `
              lineItems { id quantity }
              region { id }
              discounts { id }
            `
          });

          if (!cart?.discounts?.length) return formatCurrency(0, 'USD');

          // Get region details
          const region = await sudoContext.query.Region.findOne({
            where: { id: cart.region.id },
            query: 'currency { code noDivisionCurrency }'
          });

          // Calculate base total
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

          // Calculate total discount
          let discountAmount = 0;
          for (const discountRef of cart.discounts) {
            const discount = await sudoContext.query.Discount.findOne({
              where: { id: discountRef.id },
              query: 'value type'
            });

            if (discount.type === 'percentage') {
              discountAmount += subtotal * (discount.value / 100);
            } else if (discount.type === 'fixed') {
              discountAmount += discount.value;
            }
          }

          const currencyCode = region?.currency?.code || 'USD';
          const divisor = region?.currency?.noDivisionCurrency ? 1 : 100;

          return formatCurrency(discountAmount / divisor, currencyCode);
        }
      })
    }),
    giftCardTotal: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item, args, context) {
          const sudoContext = context.sudo();
          
          // Get cart with giftCards
          const cart = await sudoContext.query.Cart.findOne({
            where: { id: item.id },
            query: `
              region { id }
              giftCards { id }
            `
          });

          if (!cart?.giftCards?.length) return formatCurrency(0, 'USD');

          // Get region details
          const region = await sudoContext.query.Region.findOne({
            where: { id: cart.region.id },
            query: 'currency { code noDivisionCurrency }'
          });

          // Sum up gift card balances
          let giftCardTotal = 0;
          for (const giftCardRef of cart.giftCards) {
            const giftCard = await sudoContext.query.GiftCard.findOne({
              where: { id: giftCardRef.id },
              query: 'balance'
            });
            giftCardTotal += giftCard.balance;
          }

          const currencyCode = region?.currency?.code || 'USD';
          const divisor = region?.currency?.noDivisionCurrency ? 1 : 100;

          return formatCurrency(giftCardTotal / divisor, currencyCode);
        }
      })
    }),
    tax: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item, args, context) {
          const sudoContext = context.sudo();
          
          // Get cart with all needed relations
          const cart = await sudoContext.query.Cart.findOne({
            where: { id: item.id },
            query: `
              lineItems { id quantity }
              region { id }
              discounts { id }
              giftCards { id }
            `
          });

          if (!cart?.lineItems?.length) return formatCurrency(0, 'USD');

          // Get region details
          const region = await sudoContext.query.Region.findOne({
            where: { id: cart.region.id },
            query: 'taxRate currency { code noDivisionCurrency }'
          });

          // Calculate base total
          let total = 0;
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
            total += price * lineItem.quantity;
          }

          // Apply discounts before tax calculation
          if (cart.discounts?.length) {
            for (const discountRef of cart.discounts) {
              const discount = await sudoContext.query.Discount.findOne({
                where: { id: discountRef.id },
                query: 'value type'
              });

              if (discount.type === 'percentage') {
                total *= (1 - discount.value / 100);
              } else if (discount.type === 'fixed') {
                total = Math.max(0, total - discount.value);
              }
            }
          }

          // Apply gift cards before tax calculation
          if (cart.giftCards?.length) {
            for (const giftCardRef of cart.giftCards) {
              const giftCard = await sudoContext.query.GiftCard.findOne({
                where: { id: giftCardRef.id },
                query: 'balance'
              });
              total = Math.max(0, total - giftCard.balance);
            }
          }

          // Calculate tax amount
          const taxRate = region?.taxRate || 0;
          const taxAmount = total * taxRate;

          const currencyCode = region?.currency?.code || 'USD';
          const divisor = region?.currency?.noDivisionCurrency ? 1 : 100;

          return formatCurrency(taxAmount / divisor, currencyCode);
        }
      })
    }),
    shipping: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item, args, context) {
          const sudoContext = context.sudo();
          
          // Get cart with region and type
          const cart = await sudoContext.query.Cart.findOne({
            where: { id: item.id },
            query: `
              type
              region { 
                id 
                currency { 
                  code 
                  noDivisionCurrency 
                }
              }
            `
          });

          if (!cart?.region) return formatCurrency(0, 'USD');

          // Get all shipping options for this region
          const shippingOptions = await sudoContext.query.ShippingOption.findMany({
            where: {
              region: { id: { equals: cart.region.id } },
              isReturn: { equals: cart.type === 'claim' || cart.type === 'swap' }
            },
            query: `
              id
              amount
              priceType
              shippingOptionRequirements {
                type
                amount
              }
              customShippingOptions {
                price
                cart {
                  id
                }
              }
            `
          });

          if (!shippingOptions?.length) return formatCurrency(0, 'USD');

          // Get cart subtotal for requirement checks
          let subtotal = 0;
          const cartWithItems = await sudoContext.query.Cart.findOne({
            where: { id: item.id },
            query: 'lineItems { id quantity }'
          });

          if (cartWithItems?.lineItems?.length) {
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
          }

          // Filter and find cheapest valid shipping option
          let validOptions = shippingOptions.filter(option => {
            // Check requirements
            const meetsRequirements = option.shippingOptionRequirements.every(requirement => {
              if (requirement.type === 'min_subtotal') {
                return subtotal >= requirement.amount;
              }
              if (requirement.type === 'max_subtotal') {
                return subtotal <= requirement.amount;
              }
              return true;
            });

            return meetsRequirements;
          });

          if (!validOptions.length) {
            return formatCurrency(0, cart.region.currency.code);
          }

          // Find custom shipping option for this cart if any
          const customOption = validOptions
            .flatMap(opt => opt.customShippingOptions)
            .find(custom => custom?.cart?.id === item.id);

          if (customOption) {
            // Get tax lines for custom shipping
            const taxLines = await sudoContext.query.ShippingMethodTaxLine.findMany({
              where: {
                shippingMethod: {
                  cart: { id: { equals: item.id } },
                  shippingOption: { id: { equals: customOption.shippingOption.id } }
                }
              },
              query: 'rate'
            });

            const amount = customOption.price;
            const taxMultiplier = taxLines.reduce((sum, tax) => sum + tax.rate, 0);
            const finalAmount = amount * (1 + taxMultiplier);
            const divisor = cart.region.currency.noDivisionCurrency ? 1 : 100;

            return formatCurrency(finalAmount / divisor, cart.region.currency.code);
          }

          // Get cheapest standard option
          const cheapestOption = validOptions.reduce((cheapest, current) => {
            if (current.priceType === 'calculated') {
              return cheapest;
            }

            if (!cheapest || current.amount < cheapest.amount) {
              return current;
            }
            return cheapest;
          }, null);

          if (!cheapestOption) {
            return formatCurrency(0, cart.region.currency.code);
          }

          // Get tax lines for the shipping option
          const taxLines = await sudoContext.query.ShippingMethodTaxLine.findMany({
            where: {
              shippingMethod: {
                cart: { id: { equals: item.id } },
                shippingOption: { id: { equals: cheapestOption.id } }
              }
            },
            query: 'rate'
          });

          const amount = cheapestOption.amount;
          const taxMultiplier = taxLines.reduce((sum, tax) => sum + tax.rate, 0);
          const finalAmount = amount * (1 + taxMultiplier);
          const divisor = cart.region.currency.noDivisionCurrency ? 1 : 100;

          return formatCurrency(finalAmount / divisor, cart.region.currency.code);
        }
      })
    }),
    ...trackingFields,
  },
});
