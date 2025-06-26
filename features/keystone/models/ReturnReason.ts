
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  json,
  text,
  relationship,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const ReturnReason = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadReturns({ session }) ||
        permissions.canManageReturns({ session }),
      create: permissions.canManageReturns,
      update: permissions.canManageReturns,
      delete: permissions.canManageReturns,
    },
  },
  fields: {
    value: text({
      isIndexed: "unique",
      validation: {
        isRequired: true,
      },
    }),
    label: text({
      validation: {
        isRequired: true,
      },
    }),
    description: text(),
    metadata: json(),
    parentReturnReason: relationship({
      ref: "ReturnReason",
    }),
    returnItems: relationship({
      ref: "ReturnItem.returnReason",
      many: true,
    }),
    ...trackingFields
  },
});
