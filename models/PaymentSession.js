import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  checkbox,
  json,
  select,
  text,
  relationship,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const PaymentSession = list({
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
    isSelected: checkbox(),
    status: select({
      type: "enum",
      options: [
        {
          label: "Authorized",
          value: "authorized",
        },
        {
          label: "Pending",
          value: "pending",
        },
        {
          label: "Requires More",
          value: "requires_more",
        },
        {
          label: "Error",
          value: "error",
        },
        {
          label: "Canceled",
          value: "canceled",
        },
      ],
      validation: {
        isRequired: true,
      },
    }),
    data: json(),
    idempotencyKey: text(),
    cart: relationship({
      ref: "Cart.paymentSessions",
    }),
    paymentProvider: relationship({
      ref: "PaymentProvider.paymentSessions",
    }),
    ...trackingFields,
  },
});
