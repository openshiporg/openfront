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
} from "@keystone-6/core/fields";
import { trackingFields } from "./trackingFields";
import { permissions } from "../access";

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
    fulfillmentStatus: select({
      type: "enum",
      options: [
        {
          label: "Not Fulfilled",
          value: "not_fulfilled",
        },
        {
          label: "Partially Fulfilled",
          value: "partially_fulfilled",
        },
        {
          label: "Fulfilled",
          value: "fulfilled",
        },
        {
          label: "Partially Shipped",
          value: "partially_shipped",
        },
        {
          label: "Shipped",
          value: "shipped",
        },
        {
          label: "Partially Returned",
          value: "partially_returned",
        },
        {
          label: "Returned",
          value: "returned",
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
      defaultValue: "not_fulfilled",
      validation: {
        isRequired: true,
      },
      hooks: {
        beforeOperation: ({ operation, resolvedData, item, fieldKey }) => {
          if (
            operation === "update" &&
            resolvedData[fieldKey] &&
            item[fieldKey] !== resolvedData[fieldKey]
          ) {
            return {
              ...resolvedData,
              events: {
                create: {
                  type: "FULFILLMENT_STATUS_CHANGE",
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
    paymentStatus: select({
      type: "enum",
      options: [
        {
          label: "Not Paid",
          value: "not_paid",
        },
        {
          label: "Awaiting",
          value: "awaiting",
        },
        {
          label: "Captured",
          value: "captured",
        },
        {
          label: "Partially Refunded",
          value: "partially_refunded",
        },
        {
          label: "Refunded",
          value: "refunded",
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
      defaultValue: "not_paid",
      validation: {
        isRequired: true,
      },
      hooks: {
        beforeOperation: ({ operation, resolvedData, item, fieldKey }) => {
          if (
            operation === "update" &&
            resolvedData[fieldKey] &&
            item[fieldKey] !== resolvedData[fieldKey]
          ) {
            return {
              ...resolvedData,
              events: {
                create: {
                  type: "PAYMENT_STATUS_CHANGE",
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
            // Query the fulfillment to get tracking links
            const fulfillment = await context.sudo().query.Fulfillment.findOne({
              where: { id: resolvedData.connect.id },
              query: `
                trackingLinks {
                  trackingNumber
                  url
                }
              `,
            });

            if (fulfillment?.trackingLinks?.length) {
              return {
                ...resolvedData,
                events: {
                  create: {
                    type: "TRACKING_NUMBER_ADDED",
                    data: {
                      trackingLinks: fulfillment.trackingLinks.map((link) => ({
                        number: link.trackingNumber,
                        url: link.url,
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
      ref: "LineItem.order",
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
        beforeOperation: async ({ operation, resolvedData, context }) => {
          if (
            (operation === "create" || operation === "update") &&
            resolvedData?.connect
          ) {
            // Query the payment to check if it's a refund
            const payment = await context.sudo().query.Payment.findOne({
              where: { id: resolvedData.connect.id },
              query: "status amount",
            });

            if (payment?.status === "refunded") {
              return {
                ...resolvedData,
                events: {
                  create: {
                    type: "REFUND_PROCESSED",
                    data: {
                      paymentId: resolvedData.connect.id,
                      amount: payment.amount,
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
    ...trackingFields,

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
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: "cart { subtotal }",
              });
              return order.cart?.subtotal;
            },
          }),
        }),

        shipping: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: "cart { shipping }",
              });
              return order.cart?.shipping;
            },
          }),
        }),

        tax: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: "cart { tax }",
              });
              return order.cart?.tax;
            },
          }),
        }),

        discount: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: "cart { discount }",
              });
              return order.cart?.discount;
            },
          }),
        }),

        total: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: "cart { total }",
              });
              return order.cart?.total;
            },
          }),
        }),

        rawTotal: virtual({
          field: graphql.field({
            type: graphql.Int,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: "cart { rawTotal }",
              });
              return order.cart?.rawTotal || 0;
            },
          }),
        }),
      },
    }),

    events: relationship({
      ref: "OrderEvent.order",
      many: true,
    }),
  },
});
