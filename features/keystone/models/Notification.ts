
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { json, text, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const Notification = list({
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
    eventName: text(),
    resourceType: text({
      validation: {
        isRequired: true,
      },
    }),
    resourceId: text({
      validation: {
        isRequired: true,
      },
    }),
    to: text({
      validation: {
        isRequired: true,
      },
    }),
    data: json(),
    parentId: text(),
    notificationProvider: relationship({
      ref: "NotificationProvider.notifications",
    }),
    user: relationship({
      ref: "User.notifications",
    }),
    otherNotifications: relationship({
      ref: "Notification",
      many: true,
    }),
    ...trackingFields,
  },
});
