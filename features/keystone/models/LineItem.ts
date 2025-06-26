
import { graphql, group, list } from "@keystone-6/core";
import {
  checkbox,
  integer,
  json,
  relationship,
  virtual,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

// Add these helper functions at the top
const formatCurrency = (amount, currencyCode) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
};

const calculateFinalAmount = (amount, taxRate = 0, divisor = 100) => {
  return Math.round(amount * (1 + taxRate)) / divisor;
};

export const LineItem = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadOrders({ session }) ||
        permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders,
    },
  },
  hooks: {
    async afterOperation({ operation, item, context }) {
      if (operation === "create" || operation === "update") {
        const sudoContext = context.sudo();
        const lineItem = await sudoContext.query.LineItem.findOne({
          where: { id: item.id },
          query: "cart { id }",
        });

        if (lineItem?.cart?.id) {
          await sudoContext.query.Cart.updateOne({
            where: { id: lineItem.cart.id },
            data: {
              paymentCollection: {
                disconnect: true,
              },
            },
          });
        }
      }
    },
  },
  fields: {
    // Core fields
    quantity: integer({
      validation: { isRequired: true },
    }),
    metadata: json(),
    isReturn: checkbox(),
    isGiftcard: checkbox(),
    shouldMerge: checkbox({
      defaultValue: true,
    }),
    allowDiscounts: checkbox({
      defaultValue: true,
    }),
    hasShipping: checkbox(),

    // Relationships
    claimOrder: relationship({
      ref: "ClaimOrder.lineItems",
    }),
    cart: relationship({
      ref: "Cart.lineItems",
    }),
    swap: relationship({
      ref: "Swap.lineItems",
    }),
    productVariant: relationship({
      ref: "ProductVariant.lineItems",
    }),
    claimItems: relationship({
      ref: "ClaimItem.lineItem",
      many: true,
    }),
    lineItemAdjustments: relationship({
      ref: "LineItemAdjustment.lineItem",
      many: true,
    }),
    lineItemTaxLines: relationship({
      ref: "LineItemTaxLine.lineItem",
      many: true,
    }),
    returnItems: relationship({
      ref: "ReturnItem.lineItem",
      many: true,
    }),

    ...group({
      label: "Virtual Fields",
      description: "Virtual fields for line item",
      fields: {
        title: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const lineItem = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: "productVariant { product { title } }",
              });

              if (!lineItem?.productVariant?.product) {
                return "Product not found";
              }

              return lineItem.productVariant.product.title;
            },
          }),
        }),

        thumbnail: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const lineItem = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: "productVariant { product { thumbnail } }",
              });

              if (!lineItem?.productVariant?.product) {
                return null;
              }

              return lineItem.productVariant.product.thumbnail;
            },
          }),
        }),

        description: virtual({
          field: graphql.field({
            type: graphql.JSON,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const lineItem = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: "productVariant { product { description { document } } }",
              });

              if (!lineItem?.productVariant?.product) {
                return null;
              }

              return lineItem.productVariant.product.description.document;
            },
          }),
        }),

        originalPrice: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();

              const { cart } = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: `cart { region { id taxRate currency { code noDivisionCurrency } } }`,
              });

              if (!cart) {
                return "No cart associated";
              }

              const prices = await sudoContext.query.MoneyAmount.findMany({
                where: {
                  productVariant: {
                    lineItems: { some: { id: { equals: item.id } } },
                  },
                  region: { id: { equals: cart.region.id } },
                },
                query: `
                  calculatedPrice {
                    originalAmount
                    currencyCode
                  }
                `,
              });

              const price = prices[0]?.calculatedPrice;
              const currencyCode =
                cart?.region?.currency?.code || price?.currencyCode;
              if (!price || !currencyCode) {
                return "No price available";
              }

              const amount = price.originalAmount;
              const divisor = cart?.region?.currency?.noDivisionCurrency
                ? 1
                : 100;
              const finalAmount = Math.round(amount) / divisor;

              return formatCurrency(finalAmount, currencyCode);
            },
          }),
        }),

        unitPrice: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const { cart } = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: `
                  cart {
                    region {
                      id
                      currency {
                        code
                        noDivisionCurrency
                      }
                    }
                  }
                `,
              });

              if (!cart) {
                return "No cart associated";
              }

              const prices = await sudoContext.query.MoneyAmount.findMany({
                where: {
                  productVariant: {
                    lineItems: { some: { id: { equals: item.id } } },
                  },
                  region: { id: { equals: cart.region.id } },
                },
                query: `
                  calculatedPrice {
                    calculatedAmount
                    currencyCode
                  }
                `,
              });

              const price = prices[0]?.calculatedPrice;
              const currencyCode =
                cart?.region?.currency?.code || price?.currencyCode;
              if (!price || !currencyCode) {
                return "No price available";
              }

              const amount = price.calculatedAmount;
              const divisor = cart?.region?.currency?.noDivisionCurrency
                ? 1
                : 100;
              const finalAmount = Math.round(amount) / divisor;

              return formatCurrency(finalAmount, currencyCode);
            },
          }),
        }),

        total: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const { cart, quantity } =
                await sudoContext.query.LineItem.findOne({
                  where: { id: item.id },
                  query: `
                  quantity
                  cart {
                    region {
                      id
                      currency {
                        code
                        noDivisionCurrency
                      }
                    }
                  }
                `,
                });

              if (!cart) {
                return "No cart associated";
              }

              const prices = await sudoContext.query.MoneyAmount.findMany({
                where: {
                  productVariant: {
                    lineItems: { some: { id: { equals: item.id } } },
                  },
                  region: { id: { equals: cart.region.id } },
                },
                query: `
                  calculatedPrice {
                    calculatedAmount
                    currencyCode
                  }
                `,
              });

              const price = prices[0]?.calculatedPrice;
              const currencyCode =
                cart?.region?.currency?.code || price?.currencyCode;
              if (!price || !currencyCode) {
                return "No price available";
              }

              const amount = price.calculatedAmount;
              const divisor = cart?.region?.currency?.noDivisionCurrency
                ? 1
                : 100;
              const finalAmount = Math.round(amount * quantity) / divisor;

              return formatCurrency(finalAmount, currencyCode);
            },
          }),
        }),

        availableInRegion: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();

              const { cart } = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: `
                  cart { 
                    region { 
                      id 
                    }
                  }
                `,
              });

              if (!cart) {
                return "no_cart";
              }

              const prices = await sudoContext.query.MoneyAmount.findMany({
                where: {
                  productVariant: {
                    lineItems: { some: { id: { equals: item.id } } },
                  },
                  region: { id: { equals: cart.region.id } },
                },
                query: "id",
              });

              return prices.length > 0 ? "available" : "unavailable";
            },
          }),
        }),
        percentageOff: virtual({
          field: graphql.field({
            type: graphql.Int,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();

              const { cart, quantity } =
                await sudoContext.query.LineItem.findOne({
                  where: { id: item.id },
                  query: `cart { region { id } } quantity`,
                });
                
              if (!cart) {
                return 0;
              }

              const prices = await sudoContext.query.MoneyAmount.findMany({
                where: {
                  productVariant: {
                    lineItems: { some: { id: { equals: item.id } } },
                  },
                  region: { id: { equals: cart.region.id } },
                },
                query: `
                  id
                  amount
                  calculatedPrice {
                    calculatedAmount
                    originalAmount
                    currencyCode
                  }
                `,
              });

              const price = prices[0]?.calculatedPrice;
              if (!price) return 0;

              const originalAmount = price.originalAmount * quantity;
              const calculatedAmount = price.calculatedAmount * quantity;

              if (!originalAmount || originalAmount <= calculatedAmount)
                return 0;

              const diff = originalAmount - calculatedAmount;
              return Math.round((diff / originalAmount) * 100);
            },
          }),
        }),

        fulfillmentStatus: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const lineItem = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: `
                  quantity
                  fulfillmentItems {
                    quantity
                    fulfillment {
                      canceledAt
                    }
                  }
                `
              });

              if (!lineItem?.quantity) return "Unfulfilled";

              const fulfilledQuantity = lineItem.fulfillmentItems
                ?.filter(fi => !fi.fulfillment?.canceledAt)
                ?.reduce((sum, fi) => sum + (fi.quantity || 0), 0) || 0;

              if (fulfilledQuantity === 0) return "Unfulfilled";
              if (fulfilledQuantity === lineItem.quantity) return "Fulfilled";
              return `${fulfilledQuantity}/${lineItem.quantity} Partially Fulfilled`;
            },
          }),
        }),
      },
    }),
    ...trackingFields,
  },
});
