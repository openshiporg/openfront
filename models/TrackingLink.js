import { list } from "@keystone-6/core";
import {
  json,
  text,
  relationship,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const TrackingLink = list({
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
    url: text(),
    trackingNumber: text({
      validation: {
        isRequired: true,
      },
    }),
    metadata: json(),
    idempotencyKey: text(),
    fulfillment: relationship({
      ref: "Fulfillment.trackingLinks",
    }),
    ...trackingFields
  },
});
