
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { relationship, text, integer, timestamp, select } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const StockMovement = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadProducts({ session }) ||
        permissions.canManageProducts({ session }),
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts,
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
    createdAt: timestamp({
      defaultValue: { kind: "now" },
    }),
    ...trackingFields,
  },
  hooks: {
    resolveInput: async ({ resolvedData, context }) => {
      const { quantity, type, variant } = resolvedData;
      
      if (variant?.connect?.id && quantity) {
        const variantData = await context.query.ProductVariant.findOne({
          where: { id: variant.connect.id },
          query: 'inventoryQuantity',
        });

        if (variantData) {
          await context.query.ProductVariant.updateOne({
            where: { id: variant.connect.id },
            data: {
              inventoryQuantity: type === "RECEIVE" 
                ? variantData.inventoryQuantity + quantity
                : variantData.inventoryQuantity - quantity,
            },
          });
        }
      }

      return resolvedData;
    },
  },
}); 