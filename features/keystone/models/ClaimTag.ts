
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { json, text, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const ClaimTag = list({
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
    value: text({
      validation: {
        isRequired: true,
      },
    }),
    description: text(),
    metadata: json(),
    claimItems: relationship({
      ref: "ClaimItem.claimTags",
      many: true,
    }),
    ...trackingFields,
  },
});
