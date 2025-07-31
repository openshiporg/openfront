
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  checkbox,
  integer,
  json,
  text,
  relationship,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const ReturnItem = list({
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
    quantity: integer({
      validation: {
        isRequired: true,
      },
    }),
    isRequested: checkbox({
      defaultValue: true,
    }),
    requestedQuantity: integer(),
    receivedQuantity: integer(),
    metadata: json(),
    note: text(),
    return: relationship({
      ref: "Return.returnItems",
    }),
    lineItem: relationship({
      ref: "LineItem.returnItems",
    }),
    returnReason: relationship({
      ref: "ReturnReason.returnItems",
    }),
    ...trackingFields
  },
});
