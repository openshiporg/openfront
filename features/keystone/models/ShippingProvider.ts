
import { list } from "@keystone-6/core";
import { text, json, checkbox, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const ShippingProvider = list({
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
      validation: { isRequired: true },
    }),

    isActive: checkbox({
      defaultValue: false,
    }),

    accessToken: text({
      validation: { isRequired: true },
      ui: {
        itemView: { fieldMode: "hidden" },
      },
    }),

    // Adapter function fields
    createLabelFunction: text({
      validation: { isRequired: true },
      ui: {
        description: "Either an adapter name (e.g. 'shippo') or an HTTP endpoint that will be called with the order data",
      }
    }),

    getRatesFunction: text({
      validation: { isRequired: true },
      ui: {
        description: "Either an adapter name (e.g. 'shippo') or an HTTP endpoint that will be called with the order data",
      }
    }),

    validateAddressFunction: text({
      validation: { isRequired: true },
      ui: {
        description: "Either an adapter name (e.g. 'shippo') or an HTTP endpoint that will be called with the address data",
      }
    }),

    trackShipmentFunction: text({
      validation: { isRequired: true },
      ui: {
        description: "Either an adapter name (e.g. 'shippo') or an HTTP endpoint that will be called with the tracking number",
      }
    }),

    cancelLabelFunction: text({
      validation: { isRequired: true },
      ui: {
        description: "Either an adapter name (e.g. 'shippo') or an HTTP endpoint that will be called with the label ID",
      }
    }),

    metadata: json(),

    // Relationships
    regions: relationship({
      ref: "Region.shippingProviders",
      many: true,
    }),

    labels: relationship({
      ref: "ShippingLabel.provider",
      many: true,
    }),

    fulfillmentProvider: relationship({
      ref: "FulfillmentProvider.shippingProviders",
      many: false,
    }),

    fromAddress: relationship({
      ref: 'Address.shippingProviders',
      many: false,
      // ui: {
      //   displayMode: 'cards',
      //   cardFields: ['company', 'address1', 'city', 'province', 'country'],
      //   inlineCreate: { fields: ['company', 'firstName', 'lastName', 'address1', 'address2', 'city', 'province', 'postalCode', 'country', 'phone'] },
      //   inlineEdit: { fields: ['company', 'firstName', 'lastName', 'address1', 'address2', 'city', 'province', 'postalCode', 'country', 'phone'] },
      //   inlineConnect: true,
      // },
    }),

    ...trackingFields,
  },
});
