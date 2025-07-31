
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { select, integer, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const ShippingOptionRequirement = list({
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
    type: select({
      type: "enum",
      options: [
        {
          label: "Min Subtotal",
          value: "min_subtotal",
        },
        {
          label: "Max Subtotal",
          value: "max_subtotal",
        },
      ],
      validation: {
        isRequired: true,
      },
    }),
    amount: integer({
      validation: {
        isRequired: true,
      },
    }),
    shippingOption: relationship({
      ref: "ShippingOption.shippingOptionRequirements",
    }),
    ...trackingFields,
  },
});
