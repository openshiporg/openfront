import { list } from "@keystone-6/core";
import { integer, relationship, text, json } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const OrderLineItem = list({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders,
    },
  },
  fields: {
    quantity: integer({
      validation: { isRequired: true },
    }),
    title: text({
      validation: { isRequired: true },
    }),
    sku: text(),
    thumbnail: text(),
    metadata: json(),
    productData: json({
      description: "Snapshot of product data at time of order",
    }),
    variantData: json({
      description: "Snapshot of variant data at time of order",
    }),
    // Formatted values for display
    variantTitle: text(),
    formattedUnitPrice: text(),
    formattedTotal: text(),
    order: relationship({
      ref: "Order.lineItems",
    }),
    productVariant: relationship({
      ref: "ProductVariant",
      description: "Optional reference to product variant (may be deleted)",
    }),
    moneyAmount: relationship({
      ref: "OrderMoneyAmount.orderLineItem",
    }),
    originalLineItem: relationship({
      ref: "LineItem",
      description: "Reference to the original cart line item",
    }),
    fulfillmentItems: relationship({
      ref: "FulfillmentItem.lineItem",
      many: true,
    }),
    ...trackingFields,
  },
});