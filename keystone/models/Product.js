import { graphql, list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  checkbox,
  integer,
  json,
  select,
  text,
  relationship,
  virtual,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";
import slugify from 'slugify';

export const Product = list({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts,
    },
    filter: {
      query: ({ session }) => {
        // Admin users can see all products
        if (permissions.canManageProducts({ session })) {
          return true;
        }
        // Non-admin users can only see published products
        return {
          status: {
            equals: 'published'
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
    description: text(),
    handle: text({
      isIndexed: "unique",
    }),
    subtitle: text(),
    isGiftcard: checkbox(),
    thumbnail: virtual({
      field: graphql.field({
        type: graphql.String,
        resolve: async (item, args, context) => {
          const product = await context.query.Product.findOne({
            where: { id: item.id },
            query: 'productImages(take: 1) { image { url } }',
          });
          return product.productImages[0]?.image?.url || null;
        },
      }),
    }),
    weight: integer(),
    length: integer(),
    height: integer(),
    width: integer(),
    hsCode: text(),
    originCountry: text(),
    midCode: text(),
    material: text(),
    metadata: json(),
    discountable: checkbox({
      defaultValue: true,
    }),
    status: select({
      type: "enum",
      options: [
        {
          label: "Draft",
          value: "draft",
        },
        {
          label: "Proposed",
          value: "proposed",
        },
        {
          label: "Published",
          value: "published",
        },
        {
          label: "Rejected",
          value: "rejected",
        },
      ],
      defaultValue: "draft",
      validation: {
        isRequired: true,
      },
    }),
    externalId: text(),
    productCollections: relationship({
      ref: "ProductCollection.products",
      many: true,
    }),
    productCategories: relationship({
      ref: "ProductCategory.products",
      many: true,
    }),
    shippingProfile: relationship({
      ref: "ShippingProfile.products",
    }),
    productType: relationship({
      ref: "ProductType.products",
    }),
    discountConditions: relationship({
      ref: "DiscountCondition.products",
      many: true,
    }),
    discountRules: relationship({
      ref: "DiscountRule.products",
      many: true,
    }),
    productImages: relationship({
      ref: "ProductImage.products",
      many: true,
    }),
    productOptions: relationship({
      ref: "ProductOption.product",
      many: true,
    }),
    productTags: relationship({
      ref: "ProductTag.products",
      many: true,
    }),
    taxRates: relationship({
      ref: "TaxRate.products",
      many: true,
    }),
    productVariants: relationship({
      ref: "ProductVariant.product",
      many: true,
    }),
    ...trackingFields,
  },
  hooks: {
    resolveInput: async ({ resolvedData, existingItem, context, operation }) => {
      if (!resolvedData.handle && resolvedData.title) {
        let baseHandle = slugify(resolvedData.title, { lower: true });
        let handle = baseHandle;
        let counter = 1;
        while (await context.query.Product.findOne({ where: { handle } })) {
          handle = `${baseHandle}-${counter}`;
          counter++;
        }
        resolvedData.handle = handle;
      }
      return resolvedData;
    },
  },
  ui: {
    labelField: "title",
  },
});
