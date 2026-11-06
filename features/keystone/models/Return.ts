
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
import { canTransition, RETURN_TRANSITIONS } from "../lib/state-machines";

export const Return = list({
  hooks: {
    validateInput: ({ operation, resolvedData, item, addValidationError }) => {
      if (operation !== "update" || !resolvedData.status || !item) return;
      if (!canTransition(RETURN_TRANSITIONS, item.status as string, resolvedData.status as string)) {
        addValidationError(`A ${item.status} return cannot become ${resolvedData.status}`);
      }
    },
  },
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadReturns({ session }) ||
        permissions.canManageReturns({ session }),
      create: permissions.canManageReturns,
      update: permissions.canManageReturns,
      delete: permissions.canManageReturns,
    },
  },
  fields: {
    status: select({
      type: "enum",
      options: [
        {
          label: "Requested",
          value: "requested",
        },
        {
          label: "Received",
          value: "received",
        },
        {
          label: "Requires Action",
          value: "requires_action",
        },
        {
          label: "Canceled",
          value: "canceled",
        },
      ],
      defaultValue: "requested",
      db: {
        isNullable: false,
      },
      validation: {
        isRequired: true,
      },
    }),
    shippingData: json(),
    refundAmount: integer({
      validation: {
        isRequired: true,
      },
    }),
    receivedAt: timestamp(),
    metadata: json(),
    idempotencyKey: text(),
    noNotification: checkbox(),
    claimOrder: relationship({
      ref: "ClaimOrder.return",
    }),
    swap: relationship({
      ref: "Swap.return",
    }),
    order: relationship({
      ref: "Order.returns",
    }),
    returnItems: relationship({
      ref: "ReturnItem.return",
      many: true,
    }),
    shippingMethod: relationship({
      ref: "ShippingMethod.return",
    }),
    ...trackingFields,
  },
});
