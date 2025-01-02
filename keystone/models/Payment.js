import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  integer,
  json,
  text,
  timestamp,
  relationship,
  select,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

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
    ...trackingFields,
  },
});
