
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { json, text, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const ProductCollection = list({
  access: {
    operation: {
      // Allow public read access
      query: () => true,
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
    handle: text({
      isIndexed: 'unique',
      validation: {
        isRequired: true,
      },
    }),
    metadata: json(),
    discountConditions: relationship({
      ref: "DiscountCondition.productCollections",
      many: true,
    }),
    products: relationship({
      ref: "Product.productCollections",
      many: true,
    }),
    ...trackingFields,
  },
  hooks: {
    resolveInput: async ({ resolvedData, existingItem, context, operation }) => {
      // Auto-generate handle from title if not provided
      if (!resolvedData.handle && resolvedData.title) {
        let baseHandle = resolvedData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        let handle = baseHandle;
        let counter = 1;
        while (await context.query.ProductCollection.findOne({ where: { handle } })) {
          handle = `${baseHandle}-${counter}`;
          counter++;
        }
        resolvedData.handle = handle;
      }
      return resolvedData;
    },
  },
});
