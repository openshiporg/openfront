
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  integer,
  json,
  text,
  timestamp,
  relationship,
  select,
  virtual,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";
import { graphql } from "@keystone-6/core";

export const Payment = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadPayments({ session }) ||
        permissions.canManagePayments({ session }),
      create: permissions.canManagePayments,
      update: permissions.canManagePayments,
      delete: permissions.canManagePayments,
    },
  },
  fields: {
    status: select({
      type: "enum",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Authorized", value: "authorized" },
        { label: "Captured", value: "captured" },
        { label: "Failed", value: "failed" },
        { label: "Canceled", value: "canceled" },
      ],
      defaultValue: "pending",
      validation: { isRequired: true },
      hooks: {
        beforeOperation: async ({ operation, resolvedData, item, context }) => {
          // Only proceed for updates where status is changing
          if (operation === "update" && resolvedData.status && item.status !== resolvedData.status) {
            const payment = await context.sudo().query.Payment.findOne({
              where: { id: item.id },
              query: `
                id
                amount
                data
                order {
                  id
                }
              `,
            });

            if (!payment?.order?.id) return resolvedData;

            let eventData = {
              ...resolvedData,
            };

            // If payment is captured, update order payment status and create capture record
            if (resolvedData.status === 'captured') {
              eventData = {
                ...eventData,
                capturedAt: new Date().toISOString(),
                order: {
                  update: {
                    where: { id: payment.order.id },
                    data: {
                      paymentStatus: 'captured',
                      events: {
                        create: {
                          type: 'PAYMENT_CAPTURED',
                          data: {
                            amount: payment.amount,
                            paymentId: item.id,
                          },
                        },
                      },
                    },
                  },
                },
              };

              // Create capture record
              await context.sudo().query.Capture.createOne({
                data: {
                  amount: payment.amount,
                  payment: { connect: { id: item.id } },
                  metadata: payment.data,
                  createdBy: 'system',
                },
              });
            }

            return eventData;
          }
          return resolvedData;
        },
      },
    }),
    amount: integer({
      validation: {
        isRequired: true,
      },
    }),
    currencyCode: text({
      validation: {
        isRequired: true,
      },
    }),
    amountRefunded: integer({
      defaultValue: 0,
      validation: {
        isRequired: true,
      },
    }),
    data: json(),
    capturedAt: timestamp(),
    canceledAt: timestamp(),
    metadata: json(),
    idempotencyKey: text(),
    cart: relationship({
      ref: "Cart.payment",
    }),
    paymentCollection: relationship({
      ref: "PaymentCollection.payments",
    }),
    swap: relationship({
      ref: "Swap.payment",
    }),
    currency: relationship({
      ref: "Currency.payments",
    }),
    order: relationship({
      ref: "Order.payments",
    }),
    captures: relationship({
      ref: "Capture.payment",
      many: true,
    }),
    refunds: relationship({
      ref: "Refund.payment",
      many: true,
    }),
    user: relationship({
      ref: "User.payments",
    }),
    paymentLink: virtual({
      field: graphql.field({
        type: graphql.String,
        resolve(item) {
          if (!item.data) return null;

          // For Stripe payments
          if (item.data.provider_id?.startsWith('pp_stripe_')) {
            const paymentIntentId = item.data.payment_intent_id;
            if (paymentIntentId) {
              return `https://dashboard.stripe.com/payments/${paymentIntentId}`;
            }
          }

          // For PayPal payments
          if (item.data.provider_id?.startsWith('pp_paypal_')) {
            const paypalOrderId = item.data.id;
            if (paypalOrderId) {
              return `https://www.paypal.com/activity/payment/${paypalOrderId}`;
            }
          }

          return null;
        }
      })
    }),
    ...trackingFields,
  },
});
