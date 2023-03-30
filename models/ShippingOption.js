import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  checkbox,
  integer,
  json,
  select,
  text,
  relationship,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const ShippingOption = list({
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
    priceType: select({
      type: "enum",
      options: [
        {
          label: "Flat Rate",
          value: "flat_rate",
        },
        {
          label: "Calculated",
          value: "calculated",
        },
      ],
      validation: {
        isRequired: true,
      },
    }),
    amount: integer({
      validation: {
        isRequired: false,
      },
    }),
    isReturn: checkbox(),
    data: json(),
    metadata: json(),
    adminOnly: checkbox(),
    region: relationship({
      ref: "Region.shippingOptions",
    }),
    fulfillmentProvider: relationship({
      ref: "FulfillmentProvider.shippingOptions",
    }),
    shippingProfile: relationship({
      ref: "ShippingProfile.shippingOptions",
    }),
    customShippingOptions: relationship({
      ref: "CustomShippingOption.shippingOption",
      many: true,
    }),
    shippingMethods: relationship({
      ref: "ShippingMethod.shippingOption",
      many: true,
    }),
    shippingOptionRequirements: relationship({
      ref: "ShippingOptionRequirement.shippingOption",
      many: true,
    }),
    taxRates: relationship({
      ref: "TaxRate.shippingOptions",
      many: true,
    }),
    ...trackingFields,
  },
});
