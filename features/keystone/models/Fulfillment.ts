
import { list } from "@keystone-6/core";
import {
  checkbox,
  json,
  text,
  timestamp,
  relationship,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const Fulfillment = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadFulfillments({ session }) ||
        permissions.canManageFulfillments({ session }),
      create: permissions.canManageFulfillments,
      update: permissions.canManageFulfillments,
      delete: permissions.canManageFulfillments,
    },
  },

  hooks: {
    beforeDelete: async ({ context, item }) => {
      // Delete all related records when a fulfillment is deleted
      await context.db.FulfillmentItem.deleteMany({
        where: { fulfillment: { id: item.id } },
      });
      await context.db.ShippingLabel.deleteMany({
        where: { fulfillment: { id: item.id } },
      });
    },
  },

  fields: {
    // Status fields
    shippedAt: timestamp(),
    canceledAt: timestamp(),

    // Data fields
    data: json(),
    metadata: json(),
    idempotencyKey: text(),
    noNotification: checkbox({
      defaultValue: false,
    }),

    // Relationships
    order: relationship({
      ref: "Order.fulfillments",
      many: false,
      validation: { isRequired: true },
      hooks: {
        validateInput: async ({ context, operation, resolvedData, addValidationError }) => {
          if (operation === "create") {
            // Get fulfillment items whether they are being created or connected
            const fulfillmentItems = resolvedData.fulfillmentItems?.create || resolvedData.fulfillmentItems?.connect;
            if (!fulfillmentItems?.length) {
              addValidationError("No items to fulfill");
              return;
            }

            // Query order's line items and existing fulfillments
            const order = await context.query.Order.findOne({
              where: { id: resolvedData.order.connect.id },
              query: `
                lineItems {
                  id
                  quantity
                }
                fulfillments {
                  canceledAt
                  fulfillmentItems {
                    quantity
                    lineItem {
                      id
                    }
                  }
                }
              `
            });
            
            if (!order?.lineItems) {
              addValidationError('Order not found or has no line items');
              return;
            }

            // Calculate unfulfilled quantities
            const unfulfilledQuantities = {};
            order.lineItems.forEach(item => {
              unfulfilledQuantities[item.id] = item.quantity;
            });

            // Subtract quantities from existing fulfillments
            order.fulfillments?.forEach(fulfillment => {
              if (!fulfillment.canceledAt) {
                fulfillment.fulfillmentItems?.forEach(item => {
                  unfulfilledQuantities[item.lineItem.id] -= item.quantity;
                });
              }
            });

            // For connect operations, we need to query the FulfillmentItems to get their quantities
            let itemsToValidate = fulfillmentItems;
            if (resolvedData.fulfillmentItems?.connect) {
              const connectedItems = await context.query.FulfillmentItem.findMany({
                where: { id: { in: fulfillmentItems.map(item => item.id) } },
                query: 'quantity lineItem { id }'
              });
              itemsToValidate = connectedItems;
            }

            // Check each item's quantity
            for (const item of itemsToValidate) {
              const lineItemId = resolvedData.fulfillmentItems?.create 
                ? item.lineItem.connect.id 
                : item.lineItem.id;
              const quantity = resolvedData.fulfillmentItems?.create
                ? item.quantity
                : item.quantity;

              const availableQuantity = unfulfilledQuantities[lineItemId] || 0;
              if (availableQuantity <= 0) {
                addValidationError(`Line item ${lineItemId} has no unfulfilled quantity`);
                return;
              }
              if (quantity > availableQuantity) {
                addValidationError(`Cannot fulfill more than ${availableQuantity} items for ${lineItemId}`);
                return;
              }
            }
          }
        },
      },
    }),
    claimOrder: relationship({
      ref: "ClaimOrder.fulfillments",
      many: false,
    }),
    swap: relationship({
      ref: "Swap.fulfillments",
      many: false,
    }),
    fulfillmentProvider: relationship({
      ref: "FulfillmentProvider.fulfillments",
      many: false,
      validation: { isRequired: true },
    }),
    fulfillmentItems: relationship({
      ref: "FulfillmentItem.fulfillment",
      many: true,
    }),
    shippingLabels: relationship({
      ref: "ShippingLabel.fulfillment",
      many: true,
    }),

    ...trackingFields,
  },
});
