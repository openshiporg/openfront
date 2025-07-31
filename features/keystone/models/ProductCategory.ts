
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { json, text, relationship, checkbox } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const ProductCategory = list({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts,
    },
    filter: {
      query: ({ session }) => {
        // Admin users can see all categories
        if (permissions.canManageProducts({ session })) {
          return true;
        }
        // Non-admin users can only see active categories
        return {
          isActive: {
            equals: true
          }
        };
      }
    }
  },
  fields: {
    title: text({
      validation: {
        isRequired: true,
      },
    }),
    handle: text({ 
      isIndexed: "unique",
      validation: {
        isRequired: true,
      },
    }),
    metadata: json(),
    isInternal: checkbox({
      defaultValue: false,
    }),
    isActive: checkbox({
      defaultValue: true,
    }),
    discountConditions: relationship({
      ref: "DiscountCondition.productCategories",
      many: true,
    }),
    products: relationship({
      ref: "Product.productCategories",
      many: true,
    }),
    parentCategory: relationship({
      ref: "ProductCategory.categoryChildren",
      many: false,
    }),
    categoryChildren: relationship({
      ref: "ProductCategory.parentCategory",
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
        while (await context.query.ProductCategory.findOne({ where: { handle } })) {
          handle = `${baseHandle}-${counter}`;
          counter++;
        }
        resolvedData.handle = handle;
      }
      return resolvedData;
    },
  },
});
