
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { relationship, text, integer, select } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const StockMovement = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadProducts({ session }) ||
        permissions.canManageProducts({ session }),
      create: () => false,
      update: () => false,
      delete: () => false,
    },
  },
  fields: {
    type: select({
      type: "enum",
      options: [
        { label: "Receive", value: "RECEIVE" },
        { label: "Remove", value: "REMOVE" },
      ],
      validation: { isRequired: true },
    }),
    quantity: integer({
      validation: { isRequired: true },
    }),
    reason: text(),
    note: text(),
    variant: relationship({
      ref: "ProductVariant.stockMovements",
      many: false,
    }),
    ...trackingFields,
  },

}); 