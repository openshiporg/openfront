import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  checkbox,
  integer,
  json,
  text,
  relationship,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const ProductVariant = list({
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
    sku: text(),
    barcode: text(),
    ean: text(),
    upc: text(),
    inventoryQuantity: integer({
      validation: {
        isRequired: true,
      },
    }),
    allowBackorder: checkbox(),
    manageInventory: checkbox({
      defaultValue: true,
    }),
    hsCode: text(),
    originCountry: text(),
    midCode: text(),
    material: text(),
    weight: integer(),
    length: integer(),
    height: integer(),
    width: integer(),
    metadata: json(),
    variantRank: integer({
      defaultValue: 0,
    }),
    product: relationship({
      ref: "Product.productVariants",
    }),
    claimItems: relationship({
      ref: "ClaimItem.productVariant",
      many: true,
    }),
    lineItems: relationship({
      ref: "LineItem.productVariant",
      many: true,
    }),
    moneyAmounts: relationship({
      ref: "MoneyAmount.productVariant",
      many: true,
    }),
    productOptionValues: relationship({
      ref: "ProductOptionValue.productVariant",
      many: true,
    }),
    ...trackingFields,
  },
});
