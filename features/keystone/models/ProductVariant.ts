
import { graphql, list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  checkbox,
  integer,
  json,
  text,
  relationship,
  virtual,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const ProductVariant = list({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts,
    },
  },
  hooks: {
    // Stock below zero is a backorder; it is only legal when the variant allows backorders.
    // Checkout reservations and adjustInventory already decrement conditionally; this covers raw
    // sets (dashboard, Openship sync) and switching backorders off while stock is negative.
    validateInput({ operation, resolvedData, item, addValidationError }) {
      const quantity = resolvedData.inventoryQuantity !== undefined ? resolvedData.inventoryQuantity : item?.inventoryQuantity;
      const backorder = resolvedData.allowBackorder !== undefined ? resolvedData.allowBackorder : item?.allowBackorder;
      const touched = operation === "create" || resolvedData.inventoryQuantity !== undefined || resolvedData.allowBackorder !== undefined;
      if (touched && typeof quantity === "number" && quantity < 0 && !backorder) {
        addValidationError(
          resolvedData.allowBackorder === false && resolvedData.inventoryQuantity === undefined
            ? `This variant is ${Math.abs(quantity)} on backorder. Restock it before turning backorders off.`
            : "Stock can't go below zero unless backorders are allowed for this variant."
        );
      }
    },
  },
  fields: {
    fullTitle: virtual({
      field: graphql.field({
        type: graphql.String,
        resolve: async (item, args, context) => {
          const { product } = await context.query.ProductVariant.findOne({
            where: { id: item.id.toString() },
            query: "product { title }",
          });
          return `${product?.title ? `${product.title} - ` : ""}${item.title}`;
        },
      }),
    }),
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
    prices: relationship({
      ref: "MoneyAmount.productVariant",
      many: true,
    }),
    productOptionValues: relationship({
      ref: "ProductOptionValue.productVariants",
      many: true,
    }),
    location: relationship({
      ref: "Location.variants",
    }),
    stockMovements: relationship({
      ref: "StockMovement.variant",
      many: true,
    }),
    measurements: relationship({
      ref: "Measurement.productVariant",
      many: true,
    }),
    primaryImage: relationship({
      ref: "ProductImage.productVariants",
      many: false,
    }),
    ...trackingFields,
  },
  ui: {
    labelField: "fullTitle",
  },
});