import { graphql, list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  checkbox,
  json,
  select,
  text,
  relationship,
  virtual,
} from "@keystone-6/core/fields";
import { document } from "@keystone-6/fields-document";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

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
        if (permissions.canManageProducts({ session })) {
          return true;
        }
        return {
          status: {
            equals: "published",
          },
        };
      },
    },
  },
  fields: {
    title: text({
      validation: {
        isRequired: true,
      },
    }),
    description: document({
      formatting: true,
      links: true,
      dividers: true,
      layouts: [
        [1, 1],
        [1, 1, 1],
        [2, 1],
      ],
    }),
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
            query: "productImages(take: 1) { image { url } imagePath }",
          });
          return (
            product.productImages[0]?.image?.url ||
            product.productImages[0]?.imagePath ||
            null
          );
        },
      }),
    }),
    dimensionsRange: virtual({
      field: graphql.field({
        type: graphql.JSON,
        resolve: async (item, args, context) => {
          const product = await context.query.Product.findOne({
            where: { id: item.id },
            query: `
              productVariants {
                measurements {
                  value
                  unit
                  type
                }
              }
            `,
          });

          if (!product.productVariants?.length) return null;

          const dimensions = {
            weight: { min: null, max: null },
            length: { min: null, max: null },
            height: { min: null, max: null },
            width: { min: null, max: null },
          };

          product.productVariants.forEach((variant) => {
            variant.measurements?.forEach((measurement) => {
              const dim = measurement.type;
              if (
                dimensions[dim] &&
                measurement.value !== null &&
                measurement.value !== undefined
              ) {
                // TODO: Handle unit conversion if needed
                if (
                  dimensions[dim].min === null ||
                  measurement.value < dimensions[dim].min
                ) {
                  dimensions[dim].min = measurement.value;
                }
                if (
                  dimensions[dim].max === null ||
                  measurement.value > dimensions[dim].max
                ) {
                  dimensions[dim].max = measurement.value;
                }
              }
            });
          });

          return dimensions;
        },
      }),
    }),
    defaultDimensions: virtual({
      field: graphql.field({
        type: graphql.JSON,
        resolve: async (item, args, context) => {
          const product = await context.query.Product.findOne({
            where: { id: item.id },
            query: `
              productVariants(take: 1) {
                measurements {
                  value
                  unit
                  type
                }
              }
            `,
          });

          if (!product.productVariants?.[0]?.measurements) return null;

          const dimensions = {};
          product.productVariants[0].measurements.forEach((measurement) => {
            dimensions[measurement.type] = {
              value: measurement.value,
              unit: measurement.unit,
            };
          });

          return dimensions;
        },
      }),
    }),
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
      ui: {
        displayMode: "cards",
        cardFields: ["image", "altText", "imagePath"],
        inlineCreate: { fields: ["image", "altText", "imagePath"] },
        inlineEdit: { fields: ["image", "altText", "imagePath"] },
        inlineConnect: true,
        removeMode: "disconnect",
        linkToItem: false,
      },
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
  // hooks: {
  //   resolveInput: async ({
  //     resolvedData,
  //     existingItem,
  //     context,
  //     operation,
  //   }) => {
  //     if (!resolvedData.handle && resolvedData.title) {
  //       let baseHandle = resolvedData.title
  //         .toLowerCase()
  //         .replace(/[^a-z0-9]+/g, '-')
  //         .replace(/^-+|-+$/g, '');
  //       let handle = baseHandle;
  //       let counter = 1;
  //       while (await context.query.Product.findOne({ where: { handle } })) {
  //         handle = `${baseHandle}-${counter}`;
  //         counter++;
  //       }
  //       resolvedData.handle = handle;
  //     }
  //     return resolvedData;
  //   },
  // },
  ui: {
    labelField: "title",
  },
});
