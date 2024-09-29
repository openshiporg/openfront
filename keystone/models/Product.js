import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  checkbox,
  integer,
  json,
  select,
  text,
  relationship,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const Product = list({
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
    description: text(),
    handle: text(),
    subtitle: text(),
    isGiftcard: checkbox(),
    thumbnail: text(),
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
    productCollection: relationship({
      ref: "ProductCollection.products",
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
});
