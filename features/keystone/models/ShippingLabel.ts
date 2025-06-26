
import { list } from "@keystone-6/core";
import {
  text,
  relationship,
  json,
  select,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const ShippingLabel = list({
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
    status: select({
      type: "enum",
      options: [
        { label: "Created", value: "created" },
        { label: "Purchased", value: "purchased" },
        { label: "Failed", value: "failed" },
      ],
      validation: { isRequired: true },
      defaultValue: "created",
    }),

    // Label information
    labelUrl: text(),
    carrier: text(),
    service: text(),
    rate: json(),

    // Tracking information
    trackingNumber: text(),
    trackingUrl: text(),

    // Relationships
    order: relationship({
      ref: "Order.shippingLabels",
      many: false,
    }),

    provider: relationship({
      ref: "ShippingProvider.labels",
      many: false,
    }),

    fulfillment: relationship({
      ref: "Fulfillment.shippingLabels",
      many: false,
    }),

    // Additional data
    data: json(),
    metadata: json(),

    ...trackingFields,
  },

  hooks: {
    resolveInput: ({ resolvedData }) => {
      // If carrier and tracking number are provided but no tracking URL, generate default URL
      if (resolvedData.carrier && resolvedData.trackingNumber && !resolvedData.trackingUrl) {
        const carrier = resolvedData.carrier.toLowerCase();
        resolvedData.trackingUrl = 
          carrier === "ups"
            ? `https://www.ups.com/track?tracknum=${resolvedData.trackingNumber}`
            : carrier === "usps"
              ? `https://tools.usps.com/go/TrackConfirmAction?tLabels=${resolvedData.trackingNumber}`
              : carrier === "fedex"
                ? `https://www.fedex.com/fedextrack/?trknbr=${resolvedData.trackingNumber}`
                : carrier === "dhl"
                  ? `https://www.dhl.com/en/express/tracking.html?AWB=${resolvedData.trackingNumber}`
                  : undefined;
      }
      return resolvedData;
    }
  }
});
