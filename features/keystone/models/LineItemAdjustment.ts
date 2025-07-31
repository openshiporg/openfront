
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { integer, json, relationship, text } from "@keystone-6/core/fields";
import { permissions } from "../access";
// import { document } from "@keystone-6/fields-document";
import { trackingFields } from "./trackingFields";

export const LineItemAdjustment = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadOrders({ session }) ||
        permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders,
    },
  },
  fields: {
    description: text({
      validation: {
        isRequired: true,
      },
    }),
    amount: integer({
      validation: {
        isRequired: true,
      },
    }),
    metadata: json(),
    discount: relationship({
      ref: "Discount.lineItemAdjustments",
    }),
    lineItem: relationship({
      ref: "LineItem.lineItemAdjustments",
    }),
    ...trackingFields,
  },
});
