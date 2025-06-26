
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { json, float, text, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const LineItemTaxLine = list({
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
    rate: float({
      validation: {
        isRequired: true,
      },
    }),
    name: text({
      validation: {
        isRequired: true,
      },
    }),
    code: text(),
    metadata: json(),
    lineItem: relationship({
      ref: "LineItem.lineItemTaxLines",
    }),
    ...trackingFields,
  },
});
