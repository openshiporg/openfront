
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { checkbox, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const NotificationProvider = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadUsers({ session }) ||
        permissions.canManageUsers({ session }),
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers,
    },
  },
  fields: {
    isInstalled: checkbox({
      defaultValue: true,
    }),
    notifications: relationship({
      ref: "Notification.notificationProvider",
      many: true,
    }),
    ...trackingFields,
  },
});
