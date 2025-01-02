import { graphql, list } from "@keystone-6/core";
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
      query: () => true, // Allow public access for order confirmation
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
    }),
    returns: relationship({
      ref: "Return.order",
      many: true,
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
          if (operation === 'create') {
            const randomBytes = require('crypto').randomBytes(32);
            return randomBytes.toString('hex');
          }
          // Don't allow updates to secretKey
          return undefined;
        },
      },
    }),

    // Virtual fields that reference Cart's calculations
    subtotal: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item, args, context) {
          const order = await context.sudo().query.Order.findOne({
            where: { id: item.id },
            query: 'cart { subtotal }'
          });
          return order.cart?.subtotal;
        }
      })
    }),

    shipping: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item, args, context) {
          const order = await context.sudo().query.Order.findOne({
            where: { id: item.id },
            query: 'cart { shipping }'
          });
          return order.cart?.shipping;
        }
      })
    }),

    tax: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item, args, context) {
          const order = await context.sudo().query.Order.findOne({
            where: { id: item.id },
            query: 'cart { tax }'
          });
          return order.cart?.tax;
        }
      })
    }),

    discount: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item, args, context) {
          const order = await context.sudo().query.Order.findOne({
            where: { id: item.id },
            query: 'cart { discount }'
          });
          return order.cart?.discount;
        }
      })
    }),

    total: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item, args, context) {
          const order = await context.sudo().query.Order.findOne({
            where: { id: item.id },
            query: 'cart { total }'
          });
          return order.cart?.total;
        }
      })
    }),

    rawTotal: virtual({
      field: graphql.field({
        type: graphql.Int,
        async resolve(item, args, context) {
          const order = await context.sudo().query.Order.findOne({
            where: { id: item.id },
            query: 'cart { rawTotal }'
          });
          return order.cart?.rawTotal || 0;
        }
      })
    }),
    // fulfillmentStatus: virtual({
    //   field: graphql.field({
    //     type: graphql.String,
    //     async resolve(item, args, context) {
    //       const order = await context.sudo().query.Order.findOne({
    //         where: { id: item.id },
    //         query: `
    //           lineItems {
    //             id
    //             quantity
    //           }
    //           fulfillments {
    //             id
    //             fulfillmentItems {
    //               quantity
    //             }
    //           }
    //           returns {
    //             id
    //             returnItems {
    //               quantity
    //             }
    //           }
    //         `
    //       });

    //       if (!order) return 'not_fulfilled';

    //       // Calculate total quantities
    //       const totalQuantity = order.lineItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    //       const fulfilledQuantity = order.fulfillments?.reduce((sum, fulfillment) => 
    //         sum + (fulfillment.fulfillmentItems?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0) || 0;
    //       const returnedQuantity = order.returns?.reduce((sum, ret) => 
    //         sum + (ret.returnItems?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0) || 0;

    //       // Return the actual fulfillmentStatus enum values
    //       if (returnedQuantity === totalQuantity) return 'returned';
    //       if (returnedQuantity > 0) return 'partially_returned';
    //       if (fulfilledQuantity === 0) return 'not_fulfilled';
    //       if (fulfilledQuantity === totalQuantity) return 'fulfilled';
    //       if (fulfilledQuantity > 0) return 'partially_fulfilled';

    //       return 'not_fulfilled';
    //     }
    //   })
    // }),

    // paymentStatus: virtual({
    //   field: graphql.field({
    //     type: graphql.String,
    //     async resolve(item, args, context) {
    //       const order = await context.sudo().query.Order.findOne({
    //         where: { id: item.id },
    //         query: `
    //           rawTotal
    //           payments {
    //             id
    //             status
    //             amount
    //           }
    //           refunds: payments(where: { status: { equals: canceled } }) {
    //             id
    //             amount
    //           }
    //         `
    //       });

    //       if (!order) return 'pending';

    //       const totalAmount = order.rawTotal || 0;
    //       const capturedAmount = order.payments?.reduce((sum, payment) => 
    //         payment.status === 'captured' ? sum + payment.amount : sum, 0) || 0;
    //       const refundedAmount = order.refunds?.reduce((sum, refund) => sum + refund.amount, 0) || 0;

    //       // Return the actual PaymentStatusType enum values
    //       if (refundedAmount === totalAmount) return 'canceled';
    //       if (capturedAmount === totalAmount) return 'captured';
    //       if (order.payments?.some(p => p.status === 'authorized')) return 'authorized';
    //       if (order.payments?.some(p => p.status === 'failed')) return 'failed';
          
    //       return 'pending';
    //     }
    //   })
    // }),
  },
});
