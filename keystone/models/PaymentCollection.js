import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  integer,
  json,
  select,
  relationship,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const PaymentCollection = list({
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
        { label: "Not paid", value: "not_paid" },
        { label: "Pending", value: "pending" },
        { label: "Partially paid", value: "partially_paid" },
        { label: "Paid", value: "paid" },
        { label: "Canceled", value: "canceled" },
      ],
      defaultValue: "not_paid",
      validation: { isRequired: true },
    }),
    description: select({
      type: "enum",
      options: [
        { label: "Default", value: "default" },
        { label: "Refund", value: "refund" },
      ],
      defaultValue: "default",
    }),
    amount: integer({
      validation: { isRequired: true },
    }),
    authorizedAmount: integer({
      defaultValue: 0,
    }),
    refundedAmount: integer({
      defaultValue: 0,
    }),
    metadata: json(),
    paymentSessions: relationship({
      ref: "PaymentSession.paymentCollection",
      many: true,
    }),
    payments: relationship({
      ref: "Payment.paymentCollection",
      many: true,
    }),
    cart: relationship({
      ref: "Cart.paymentCollection",
    }),
    ...trackingFields,
  },
}); 