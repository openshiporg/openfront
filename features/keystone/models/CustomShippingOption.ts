
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { integer, json, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const CustomShippingOption = list({
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
    price: integer({
      validation: {
        isRequired: true,
      },
    }),
    metadata: json(),
    shippingOption: relationship({
      ref: "ShippingOption.customShippingOptions",
    }),
    cart: relationship({
      ref: "Cart.customShippingOptions",
    }),
    ...trackingFields,
  },
});
