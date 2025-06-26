
import { list } from "@keystone-6/core";
import { integer, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const FulfillmentItem = list({
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
  fields: {
    quantity: integer({
      validation: {
        isRequired: true,
      },
    }),

    fulfillment: relationship({
      ref: "Fulfillment.fulfillmentItems",
      many: false,
      validation: { isRequired: true },
    }),

    lineItem: relationship({
      ref: "OrderLineItem.fulfillmentItems",
      many: false,
      validation: { isRequired: true },
    }),

    ...trackingFields,
  },
});
