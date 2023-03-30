import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { json, text, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const ProductOptionValue = list({
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
    value: text({
      validation: {
        isRequired: true,
      },
    }),
    metadata: json(),
    productVariant: relationship({
      ref: "ProductVariant.productOptionValues",
    }),
    productOption: relationship({
      ref: "ProductOption.productOptionValues",
    }),
    ...trackingFields,
  },
});
