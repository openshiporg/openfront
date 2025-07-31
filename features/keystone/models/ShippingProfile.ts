
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  json,
  select,
  text,
  relationship,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const ShippingProfile = list({
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
    name: text({
      validation: {
        isRequired: true,
      },
    }),
    type: select({
      type: "enum",
      options: [
        {
          label: "Default",
          value: "default",
        },
        {
          label: "Gift Card",
          value: "gift_card",
        },
        {
          label: "Custom",
          value: "custom",
        },
      ],
      validation: {
        isRequired: true,
      },
    }),
    metadata: json(),
    products: relationship({
      ref: "Product.shippingProfile",
      many: true,
    }),
    shippingOptions: relationship({
      ref: "ShippingOption.shippingProfile",
      many: true,
    }),
    ...trackingFields
  },
});
