
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  integer,
  json,
  select,
  text,
  relationship,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const Refund = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadReturns({ session }) ||
        permissions.canManageReturns({ session }),
      create: () => false,
      update: () => false,
      delete: () => false,
    },
  },
  fields: {
    amount: integer({
      validation: {
        isRequired: true,
      },
    }),
    note: text(),
    reason: select({
      type: "enum",
      options: [
        {
          label: "Discount",
          value: "discount",
        },
        {
          label: "Return",
          value: "return",
        },
        {
          label: "Swap",
          value: "swap",
        },
        {
          label: "Claim",
          value: "claim",
        },
        {
          label: "Other",
          value: "other",
        },
      ],
      validation: {
        isRequired: true,
      },
    }),
    metadata: json(),
    idempotencyKey: text(),
    payment: relationship({
      ref: "Payment.refunds",
    }),
    ...trackingFields,
  },
});
