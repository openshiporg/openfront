import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  checkbox,
  integer,
  json,
  select,
  text,
  timestamp,
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
    isSelected: checkbox({
      defaultValue: false,
    }),
    isInitiated: checkbox({
      defaultValue: false,
    }),
    amount: integer({
      validation: { isRequired: true },
    }),
    status: select({
      type: "enum",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Processing", value: "processing" },
        { label: "Authorized", value: "authorized" },
        { label: "Requires more", value: "requires_more" },
        { label: "Error", value: "error" },
        { label: "Canceled", value: "canceled" },
      ],
      defaultValue: "pending",
      validation: { isRequired: true },
    }),
    data: json({
      defaultValue: {},
    }),
    idempotencyKey: text({
      isIndexed: true,
    }),
    paymentCollection: relationship({
      ref: "PaymentCollection.paymentSessions",
    }),
    paymentProvider: relationship({
      ref: "PaymentProvider.paymentSessions",
      validation: { isRequired: true },
    }),
    paymentAuthorizedAt: timestamp(),
    ...trackingFields,
  },
});
