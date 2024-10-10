import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  json,
  password,
  select,
  text,
  relationship,
  checkbox
} from "@keystone-6/core/fields";
import { isSignedIn, permissions, rules } from "../access";
import { trackingFields } from "./trackingFields";

const canManageUsers = ({ session }) => {
  if (!isSignedIn({ session })) {
    return false;
  }
  if (permissions.canManageUsers({ session })) {
    return true;
  }
  return { id: { equals: session?.itemId } };
};

export const User = list({
  access: {
    operation: {
      create: () => true,
      query: permissions.canManageUsers,
      // only people with the permission can delete themselves!
      // You can't delete yourself
      delete: permissions.canManageUsers,
    },
    filter: {
      query: canManageUsers,
      update: canManageUsers,
    },
  },
  ui: {
    // hide the backend UI from regular users
    hideCreate: (args) => !permissions.canManageUsers(args),
    hideDelete: (args) => !permissions.canManageUsers(args),
  },
  fields: {
    name: text({ validation: { isRequired: true } }),
    email: text({ isIndexed: "unique", validation: { isRequired: true } }),
    password: password(),
    role: relationship({
      ref: "Role.assignedTo",
      access: {
        create: permissions.canManageUsers,
        update: permissions.canManageUsers,
      },
      ui: {
        itemView: {
          fieldMode: (args) =>
            permissions.canManageUsers(args) ? "edit" : "read",
        },
      },
    }),
    apiKeys: relationship({ ref: "ApiKey.user", many: true }),
    metadata: json(),
    firstName: text(),
    lastName: text(),
    billingAddress: text(),
    phone: text(),
    hasAccount: checkbox(),
    addresses: relationship({
      ref: "Address.user",
      many: true,
    }),
    orders: relationship({
      ref: "Order.user",
      many: true,
    }),
    carts: relationship({
      ref: "Cart.user",
      many: true,
    }),
    customerGroups: relationship({
      ref: "CustomerGroup.users",
      many: true,
    }),
    notifications: relationship({
      ref: "Notification.user",
      many: true,
    }),
    ...trackingFields,
  },
});
