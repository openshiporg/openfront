import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { checkbox, relationship, text } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const FulfillmentProvider = list({
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
    code: text({
      isIndexed: "unique",
      validation: {
        isRequired: true,
      },
    }),
    isInstalled: checkbox({
      defaultValue: true,
    }),
    fulfillments: relationship({
      ref: "Fulfillment.fulfillmentProvider",
      many: true,
    }),
    regions: relationship({
      ref: "Region.fulfillmentProviders",
      many: true,
    }),
    shippingOptions: relationship({
      ref: "ShippingOption.fulfillmentProvider",
      many: true,
    }),
    ...trackingFields
  },
});
