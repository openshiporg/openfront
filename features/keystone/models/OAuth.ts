
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { json, text } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const OAuth = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadApps({ session }) ||
        permissions.canManageApps({ session }),
      create: permissions.canManageApps,
      update: permissions.canManageApps,
      delete: permissions.canManageApps,
    },
  },
  fields: {
    displayName: text({
      validation: {
        isRequired: true,
      },
    }),
    applicationName: text({
      isIndexed: "unique",
      validation: {
        isRequired: true,
      },
    }),
    installUrl: text(),
    uninstallUrl: text(),
    data: json(),
    ...trackingFields,
  },
});
