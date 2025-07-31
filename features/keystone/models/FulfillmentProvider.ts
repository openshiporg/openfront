
import { list } from "@keystone-6/core";
import { checkbox, json, relationship, text } from "@keystone-6/core/fields";
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
    name: text({
      validation: { isRequired: true },
    }),

    code: text({
      isIndexed: "unique",
      validation: {
        isRequired: true,
        match: {
          regex: /^fp_[a-zA-Z0-9-_]+$/,
          explanation: 'Code must start with "fp_" followed by letters, numbers, hyphens or underscores',
        },
      },
    }),

    isInstalled: checkbox({
      defaultValue: true,
    }),

    credentials: json({
      ui: {
        itemView: { fieldMode: "hidden" },
      },
    }),

    metadata: json(),

    // Relationships
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

    shippingProviders: relationship({
      ref: "ShippingProvider.fulfillmentProvider",
      many: true,
    }),

    ...trackingFields
  },
});
