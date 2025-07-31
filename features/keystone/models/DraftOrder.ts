
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

export const DraftOrder = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadOrders({ session }) ||
        permissions.canManageOrders({ session }),
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
          label: "Open",
          value: "open",
        },
        {
          label: "Completed",
          value: "completed",
        },
      ],
      defaultValue: "open",
      validation: {
        isRequired: true,
      },
    }),
    displayId: integer({
      validation: {
        isRequired: true,
      },
    }),
    canceledAt: timestamp(),
    completedAt: timestamp(),
    metadata: json(),
    idempotencyKey: text(),
    noNotificationOrder: checkbox(),
    cart: relationship({
      ref: "Cart.draftOrder",
    }),
    order: relationship({
      ref: "Order.draftOrder",
    }),
    ...trackingFields,
  },
});
