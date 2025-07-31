
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  json,
  text,
  relationship,
  image,
  checkbox,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const SalesChannel = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadSalesChannels({ session }) ||
        permissions.canManageSalesChannels({ session }),
      create: permissions.canManageSalesChannels,
      update: permissions.canManageSalesChannels,
      delete: permissions.canManageSalesChannels,
    },
  },
  fields: {
    name: text(),
    description: text(),
    isDisabled: checkbox(),
    ...trackingFields
  },
});
