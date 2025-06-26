
import { graphql, group, list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  checkbox,
  integer,
  json,
  float,
  select,
  text,
  timestamp,
  relationship,
  virtual,
  textarea,
} from "@keystone-6/core/fields";
import { trackingFields } from "./trackingFields";
import { permissions } from "../access";

// Add these helper functions at the top
const formatCurrency = (amount, currencyCode) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
};

export const Order = list({
  access: {
    operation: {
      query: permissions.canManageOrders, // Allow public access for order confirmation
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders,
    },
  },
  fields: {
    status: select({
      type: "enum",
      options: [
        {
          label: "Pending",
          value: "pending",
        },
        {
          label: "Completed",
          value: "completed",
        },
        {
          label: "Archived",
          value: "archived",
        },
        {
          label: "Canceled",
          value: "canceled",
        },
        {
          label: "Requires Action",
          value: "requires_action",
        },
      ],
      defaultValue: "pending",
      validation: {
        isRequired: true,
      },
      hooks: {
        beforeOperation: ({ operation, resolvedData, item, fieldKey }) => {
          // Only proceed for updates where status is changing
          if (
            operation === "update" &&
            resolvedData[fieldKey] &&
            item[fieldKey] !== resolvedData[fieldKey]
          ) {
            return {
              ...resolvedData,
              events: {
                create: {
                  type: "STATUS_CHANGE",
                  data: {
                    newStatus: resolvedData[fieldKey],
                    previousStatus: item[fieldKey],
                  },
                },
              },
            };
          }
          return resolvedData;
        },
      },
    }),
    displayId: integer({
      validation: {
        isRequired: true,
      },
    }),
    email: text({
      validation: {
        isRequired: true,
      },
    }),
    taxRate: float(),
    canceledAt: timestamp(),
    metadata: json(),
    idempotencyKey: text(),
    noNotification: checkbox(),
    externalId: text(),
    shippingAddress: relationship({
      ref: "Address.ordersUsingAsShippingAddress",
      many: false,
    }),
    billingAddress: relationship({
      ref: "Address.ordersUsingAsBillingAddress",
      many: false,
    }),
    currency: relationship({
      ref: "Currency.orders",
    }),
    draftOrder: relationship({
      ref: "DraftOrder.order",
    }),
    cart: relationship({
      ref: "Cart.order",
    }),
    user: relationship({
      ref: "User.orders",
    }),
    region: relationship({
      ref: "Region.orders",
    }),
    claimOrders: relationship({
      ref: "ClaimOrder.order",
      many: true,
    }),
    fulfillments: relationship({
      ref: "Fulfillment.order",
      many: true,
      hooks: {
        beforeOperation: async ({ operation, resolvedData, item, context }) => {
          if (
            (operation === "create" || operation === "update") &&
            resolvedData?.connect
          ) {
            // Query the fulfillment to get shipping labels
            const fulfillment = await context.sudo().query.Fulfillment.findOne({
              where: { id: resolvedData.connect.id },
              query: `
                shippingLabels {
                  trackingNumber
                  trackingUrl
                  carrier
                }
              `,
            });

            if (fulfillment?.shippingLabels?.length) {
              return {
                ...resolvedData,
                events: {
                  create: {
                    type: "TRACKING_NUMBER_ADDED",
                    data: {
                      shippingLabels: fulfillment.shippingLabels.map((label) => ({
                        number: label.trackingNumber,
                        url: label.trackingUrl,
                        carrier: label.carrier,
                      })),
                      fulfillmentId: resolvedData.connect.id,
                    },
                  },
                },
              };
            }
          }
          return resolvedData;
        },
      },
    }),
    giftCards: relationship({
      ref: "GiftCard.order",
      many: true,
    }),
    giftCardTransactions: relationship({
      ref: "GiftCardTransaction.order",
      many: true,
    }),
    lineItems: relationship({
      ref: "OrderLineItem.order",
      many: true,
    }),
    discounts: relationship({
      ref: "Discount.orders",
      many: true,
    }),
    payments: relationship({
      ref: "Payment.order",
      many: true,
      hooks: {
        beforeOperation: async ({ operation, resolvedData, item, context }) => {
          if ((operation === "create" || operation === "update") && resolvedData?.connect) {
            // Query the payment to check its status
            const payment = await context.sudo().query.Payment.findOne({
              where: { id: resolvedData.connect.id },
              query: "status amount data",
            });

            if (!payment) return resolvedData;

            let eventData = {
              ...resolvedData,
              events: {
                create: {
                  type: payment.status === 'refunded' ? "REFUND_PROCESSED" : 
                        payment.status === 'captured' ? "PAYMENT_CAPTURED" : 
                        "PAYMENT_STATUS_UPDATED",
                  data: {
                    paymentId: resolvedData.connect.id,
                    amount: payment.amount,
                    status: payment.status,
                    provider: payment.data?.provider,
                  },
                },
              },
            };

            return eventData;
          }
          return resolvedData;
        },
      },
    }),
    returns: relationship({
      ref: "Return.order",
      many: true,
      hooks: {
        beforeOperation: ({ operation, resolvedData }) => {
          if (
            operation === "create" ||
            (operation === "update" && resolvedData?.connect)
          ) {
            return {
              ...resolvedData,
              events: {
                create: {
                  type: "RETURN_REQUESTED",
                  data: {
                    returnId: resolvedData.connect.id,
                  },
                },
              },
            };
          }
          return resolvedData;
        },
      },
    }),
    shippingMethods: relationship({
      ref: "ShippingMethod.order",
      many: true,
    }),
    swaps: relationship({
      ref: "Swap.order",
      many: true,
    }),
    secretKey: text({
      hooks: {
        resolveInput: ({ operation }) => {
          // Only generate secretKey on creation
          if (operation === "create") {
            const randomBytes = require("crypto").randomBytes(32);
            return randomBytes.toString("hex");
          }
          // Don't allow updates to secretKey
          return undefined;
        },
      },
    }),

    ...group({
      label: "Virtual Fields",
      description: "Calculated fields for order display and totals",
      fields: {
        subtotal: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const order = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems { 
                    id 
                    quantity
                    title
                    sku
                    thumbnail
                    variantTitle
                    variantData
                    productData
                    moneyAmount {
                      amount
                      originalAmount
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

              if (!order?.lineItems?.length) return "0";

              let subtotal = 0;
              for (const lineItem of order.lineItems) {
                const amount = lineItem.moneyAmount?.amount || 0;
                subtotal += amount * lineItem.quantity;
              }

              const currencyCode = order.region?.currency?.code || "USD";
              const divisor = order.region?.currency?.noDivisionCurrency ? 1 : 100;

              return formatCurrency(subtotal / divisor, currencyCode);
            },
          }),
        }),

        shipping: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const order = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  shippingMethods {
                    price
                  }
                  region {
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `,
              });

              if (!order?.shippingMethods?.length) return "0";

              const total = order.shippingMethods.reduce(
                (sum, method) => sum + (method.price || 0),
                0
              );

              const currencyCode = order.region?.currency?.code || "USD";
              const divisor = order.region?.currency?.noDivisionCurrency ? 1 : 100;

              return formatCurrency(total / divisor, currencyCode);
            },
          }),
        }),

        discount: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const order = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    id
                    quantity
                    title
                    sku
                    thumbnail
                    variantTitle
                    variantData
                    productData
                    moneyAmount {
                      amount
                      originalAmount
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                    }
                  }
                  shippingMethods {
                    price
                  }
                  region {
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `,
              });

              if (!order?.discounts?.length) return null;

              // Calculate subtotal for percentage discounts
              let subtotal = 0;
              for (const lineItem of order.lineItems || []) {
                const amount = lineItem.moneyAmount?.amount || 0;
                subtotal += amount * lineItem.quantity;
              }

              // Calculate total discount amount
              let totalDiscountAmount = 0;
              for (const discount of order.discounts) {
                if (!discount.discountRule?.type) continue;

                switch (discount.discountRule.type) {
                  case "percentage":
                    totalDiscountAmount += subtotal * (discount.discountRule.value / 100);
                    break;
                  case "fixed":
                    totalDiscountAmount += discount.discountRule.value * 
                      (order.region?.currency?.noDivisionCurrency ? 1 : 100);
                    break;
                  case "free_shipping":
                    totalDiscountAmount += order.shippingMethods?.reduce(
                      (total, method) => total + (method.price || 0),
                      0
                    ) || 0;
                    break;
                }
              }

              if (totalDiscountAmount === 0) return null;

              const currencyCode = order.region?.currency?.code || "USD";
              const divisor = order.region?.currency?.noDivisionCurrency ? 1 : 100;

              return formatCurrency(totalDiscountAmount / divisor, currencyCode);
            },
          }),
        }),

        tax: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const order = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    id
                    quantity
                    title
                    sku
                    thumbnail
                    variantTitle
                    variantData
                    productData
                    moneyAmount {
                      amount
                      originalAmount
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                    }
                  }
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `,
              });

              // Calculate subtotal
              let subtotal = 0;
              for (const lineItem of order.lineItems || []) {
                const amount = lineItem.moneyAmount?.amount || 0;
                subtotal += amount * lineItem.quantity;
              }

              // Calculate discount
              let totalDiscountAmount = 0;
              for (const discount of order.discounts || []) {
                if (!discount.discountRule?.type) continue;

                switch (discount.discountRule.type) {
                  case "percentage":
                    totalDiscountAmount += subtotal * (discount.discountRule.value / 100);
                    break;
                  case "fixed":
                    totalDiscountAmount += discount.discountRule.value * 
                      (order.region?.currency?.noDivisionCurrency ? 1 : 100);
                    break;
                }
              }

              const taxableAmount = subtotal - totalDiscountAmount;
              const tax = taxableAmount * (order.region?.taxRate || 0);

              const currencyCode = order.region?.currency?.code || "USD";
              const divisor = order.region?.currency?.noDivisionCurrency ? 1 : 100;

              return formatCurrency(tax / divisor, currencyCode);
            },
          }),
        }),

        total: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const order = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    id
                    quantity
                    title
                    sku
                    thumbnail
                    variantTitle
                    variantData
                    productData
                    moneyAmount {
                      amount
                      originalAmount
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                    }
                  }
                  shippingMethods {
                    price
                  }
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `,
              });

              // Calculate subtotal
              let subtotal = 0;
              for (const lineItem of order.lineItems || []) {
                const amount = lineItem.moneyAmount?.amount || 0;
                subtotal += amount * lineItem.quantity;
              }

              // Calculate discount
              let totalDiscountAmount = 0;
              for (const discount of order.discounts || []) {
                if (!discount.discountRule?.type) continue;

                switch (discount.discountRule.type) {
                  case "percentage":
                    totalDiscountAmount += subtotal * (discount.discountRule.value / 100);
                    break;
                  case "fixed":
                    totalDiscountAmount += discount.discountRule.value * 
                      (order.region?.currency?.noDivisionCurrency ? 1 : 100);
                    break;
                  case "free_shipping":
                    totalDiscountAmount += order.shippingMethods?.reduce(
                      (total, method) => total + (method.price || 0),
                      0
                    ) || 0;
                    break;
                }
              }

              // Calculate shipping
              const shipping = order.shippingMethods?.reduce(
                (sum, method) => sum + (method.price || 0),
                0
              ) || 0;

              // Calculate tax
              const taxableAmount = subtotal - totalDiscountAmount;
              const tax = taxableAmount * (order.region?.taxRate || 0);

              // Calculate total
              const total = subtotal - totalDiscountAmount + shipping + tax;

              const currencyCode = order.region?.currency?.code || "USD";
              const divisor = order.region?.currency?.noDivisionCurrency ? 1 : 100;

              return formatCurrency(total / divisor, currencyCode);
            },
          }),
        }),

        rawTotal: virtual({
          field: graphql.field({
            type: graphql.Int,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const order = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    id
                    quantity
                    title
                    sku
                    thumbnail
                    variantTitle
                    variantData
                    productData
                    moneyAmount {
                      amount
                      originalAmount
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                    }
                  }
                  shippingMethods {
                    price
                  }
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `,
              });

              // Calculate subtotal
              let subtotal = 0;
              for (const lineItem of order.lineItems || []) {
                const amount = lineItem.moneyAmount?.amount || 0;
                subtotal += amount * lineItem.quantity;
              }

              // Calculate discount
              let totalDiscountAmount = 0;
              for (const discount of order.discounts || []) {
                if (!discount.discountRule?.type) continue;

                switch (discount.discountRule.type) {
                  case "percentage":
                    totalDiscountAmount += subtotal * (discount.discountRule.value / 100);
                    break;
                  case "fixed":
                    totalDiscountAmount += discount.discountRule.value * 
                      (order.region?.currency?.noDivisionCurrency ? 1 : 100);
                    break;
                  case "free_shipping":
                    totalDiscountAmount += order.shippingMethods?.reduce(
                      (total, method) => total + (method.price || 0),
                      0
                    ) || 0;
                    break;
                }
              }

              // Calculate shipping
              const shipping = order.shippingMethods?.reduce(
                (sum, method) => sum + (method.price || 0),
                0
              ) || 0;

              // Calculate tax
              const taxableAmount = subtotal - totalDiscountAmount;
              const tax = taxableAmount * (order.region?.taxRate || 0);

              // Calculate total
              return Math.round(subtotal - totalDiscountAmount + shipping + tax);
            },
          }),
        }),
        fulfillmentDetails: virtual({
          field: graphql.field({
            type: graphql.JSON,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  fulfillments {
                    id
                    createdAt
                    canceledAt
                    shippingLabels {
                      id
                      trackingNumber
                      trackingUrl
                      carrier
                      labelUrl
                    }
                    fulfillmentItems {
                      id
                      quantity
                      lineItem {
                        id
                        title
                        thumbnail
                        quantity
                        formattedUnitPrice
                        formattedTotal
                        sku
                        variantTitle
                        productData
                        variantData
                      }
                    }
                  }
                `,
              });

              return order.fulfillments?.map(fulfillment => ({
                id: fulfillment.id,
                createdAt: fulfillment.createdAt,
                canceledAt: fulfillment.canceledAt,
                shippingLabels: fulfillment.shippingLabels?.map(label => ({
                  id: label.id,
                  trackingNumber: label.trackingNumber,
                  url: label.trackingUrl,
                  carrier: label.carrier,
                  labelUrl: label.labelUrl
                })) || [],
                items: fulfillment.fulfillmentItems?.map(fi => ({
                  id: fi.id,
                  quantity: fi.quantity,
                  lineItem: {
                    id: fi.lineItem.id,
                    title: fi.lineItem.title,
                    thumbnail: fi.lineItem.thumbnail,
                    sku: fi.lineItem.sku,
                    variantTitle: fi.lineItem.variantTitle,
                    formattedUnitPrice: fi.lineItem.formattedUnitPrice,
                    formattedTotal: fi.lineItem.formattedTotal,
                    productData: fi.lineItem.productData,
                    variantData: fi.lineItem.variantData
                  }
                })) || []
              })) || [];
            },
          }),
        }),

        unfulfilled: virtual({
          field: graphql.field({
            type: graphql.JSON,
            async resolve(item, args, context) {
              // First get the order with line items and active fulfillments
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    id
                    title
                    thumbnail
                    quantity
                    formattedUnitPrice
                    formattedTotal
                    sku
                    variantTitle
                    productData
                    variantData
                    moneyAmount {
                      amount
                      originalAmount
                    }
                  }
                  fulfillments {
                    canceledAt
                    fulfillmentItems {
                      quantity
                      lineItem {
                        id
                      }
                    }
                  }
                `,
              });

              // Calculate fulfilled quantities per line item from active fulfillments
              const fulfilledQuantities = {};
              order.fulfillments
                ?.filter(f => !f.canceledAt)
                ?.forEach(fulfillment => {
                  fulfillment.fulfillmentItems?.forEach(fi => {
                    const lineItemId = fi.lineItem.id;
                    fulfilledQuantities[lineItemId] = (fulfilledQuantities[lineItemId] || 0) + fi.quantity;
                  });
                });

              // Map line items with their fulfillment status
              const result = order.lineItems?.map(lineItem => {
                const fulfilledQuantity = fulfilledQuantities[lineItem.id] || 0;
                const remainingQuantity = lineItem.quantity - fulfilledQuantity;

                return {
                  id: lineItem.id,
                  title: lineItem.title,
                  thumbnail: lineItem.thumbnail,
                  sku: lineItem.sku,
                  quantity: remainingQuantity,
                  totalQuantity: lineItem.quantity,
                  fulfilledQuantity,
                  formattedUnitPrice: lineItem.formattedUnitPrice,
                  formattedTotal: lineItem.formattedTotal,
                  variantTitle: lineItem.variantTitle,
                  productData: lineItem.productData,
                  variantData: lineItem.variantData,
                  moneyAmount: lineItem.moneyAmount
                };
              }).filter(item => item.quantity > 0) || [];

              return result;
            },
          }),
        }),

        fulfillmentStatus: virtual({
          field: graphql.field({
            type: graphql.JSON,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    quantity
                  }
                  fulfillments {
                    canceledAt
                    shippingLabels {
                      id
                    }
                    fulfillmentItems {
                      quantity
                    }
                  }
                `,
              });

              const totalQuantity = order.lineItems.reduce((sum, item) => sum + item.quantity, 0);
              const activeFulfillments = order.fulfillments.filter(f => !f.canceledAt);
              
              const fulfilledQuantity = activeFulfillments.reduce((sum, f) => 
                sum + f.fulfillmentItems.reduce((itemSum, fi) => itemSum + fi.quantity, 0), 0
              );

              const shippedQuantity = activeFulfillments
                .filter(f => f.shippingLabels?.length > 0)
                .reduce((sum, f) => 
                  sum + f.fulfillmentItems.reduce((itemSum, fi) => itemSum + fi.quantity, 0), 0
                );

              return {
                totalQuantity,
                fulfilledQuantity, 
                shippedQuantity,
                remainingQuantity: totalQuantity - fulfilledQuantity,
                status: fulfilledQuantity === 0 ? 'not_fulfilled' :
                        fulfilledQuantity === totalQuantity ? 'fulfilled' :
                        'partially_fulfilled',
                shippingStatus: shippedQuantity === 0 ? 'not_shipped' :
                               shippedQuantity === totalQuantity ? 'shipped' :
                               'partially_shipped'
              };
            },
          }),
        }),
        paymentDetails: virtual({
          field: graphql.field({
            type: graphql.JSON,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  payments {
                    id
                    amount
                    status
                    data
                    createdAt
                    paymentCollection {
                      paymentSessions {
                        id
                        amount
                        isSelected
                        paymentProvider {
                          name
                        }
                      }
                    }
                  }
                  currency {
                    code
                    symbol
                  }
                `
              });
    
              if (!order?.payments?.length) return null;
    
              return order.payments.map(payment => ({
                id: payment.id,
                amount: payment.amount,
                formattedAmount: order.currency ? 
                  `${order.currency.symbol}${(payment.amount / 100).toFixed(2)}` :
                  `${(payment.amount / 100).toFixed(2)}`,
                status: payment.status,
                createdAt: payment.createdAt,
                provider: payment.data?.provider,
                cardLast4: payment.data?.cardLast4,
                paymentSession: payment.paymentCollection?.paymentSessions?.find(s => s.isSelected)
              }));
            }
          })
        }),
    
        totalPaid: virtual({
          field: graphql.field({
            type: graphql.Int,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  payments {
                    amount
                    status
                  }
                `
              });
    
              // Sum up amounts from captured payments only
              return order.payments?.reduce((total, payment) => {
                if (payment.status === 'captured') {
                  return total + payment.amount;
                }
                return total;
              }, 0) || 0;
            }
          })
        }),
    
        formattedTotalPaid: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  payments {
                    amount
                    status
                  }
                  currency {
                    code
                    symbol
                  }
                `
              });
    
              const totalPaid = order.payments?.reduce((total, payment) => {
                if (payment.status === 'captured') {
                  return total + payment.amount;
                }
                return total;
              }, 0) || 0;
    
              if (!order.currency) return `${(totalPaid / 100).toFixed(2)}`;
    
              return `${order.currency.symbol}${(totalPaid / 100).toFixed(2)}`;
            }
          })
        }),
      },
    }),

    events: relationship({
      ref: "OrderEvent.order",
      many: true,
    }),

    note: text({
      label: 'Note',
    }),
    shippingLabels: relationship({
      ref: "ShippingLabel.order",
      many: true,
    }),
    ...trackingFields,



  },
});

