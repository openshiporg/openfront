
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
      create: () => false,
      update: () => false,
      delete: () => false,
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
          const data = item.data as Record<string, any>;

          // For Stripe payments
          if (data.provider_id?.startsWith('pp_stripe_')) {
            const paymentIntentId = data.payment_intent_id;
            if (paymentIntentId) {
              return `https://dashboard.stripe.com/payments/${paymentIntentId}`;
            }
          }

          // For PayPal payments
          if (data.provider_id?.startsWith('pp_paypal_')) {
            const paypalOrderId = data.id;
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
