import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { json, text, relationship, checkbox } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const ProductCategory = list({
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
    title: text({
      validation: {
        isRequired: true,
      },
    }),
    handle: text(),
    metadata: json(),
    isInternal: checkbox(),
    isActive: checkbox(),
    discountConditions: relationship({
      ref: "DiscountCondition.productCategories",
      many: true,
    }),
    products: relationship({
      ref: "Product.productCategories",
      many: true,
    }),
    ...trackingFields,
  },
});
