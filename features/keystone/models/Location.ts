
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { text, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const Location = list({
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
    name: text({
      validation: { isRequired: true },
    }),
    description: text(),
    address: text(),
    variants: relationship({
      ref: "ProductVariant.location",
      many: true,
    }),
    ...trackingFields,
  },
  hooks: {
    validateInput: async ({ resolvedData, addValidationError }) => {
      const { name } = resolvedData;
      if (name && name.length < 2) {
        addValidationError('Location name must be at least 2 characters long');
      }
    },
  },
}); 