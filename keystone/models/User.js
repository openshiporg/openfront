import { list, graphql } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  json,
  password,
  select,
  text,
  relationship,
  checkbox,
  virtual,
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
      query: isSignedIn,
      update: permissions.canManageUsers,
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
    name: text({
      validation: { isRequired: true },
    }),
    firstName: virtual({
      field: graphql.field({
        type: graphql.String,
        resolve(item) {
          if (!item.name) return "";

          // Split on spaces and get first part
          const parts = item.name.trim().split(/\s+/);
          return parts[0] || "";
        },
      }),
    }),
    lastName: virtual({
      field: graphql.field({
        type: graphql.String,
        resolve(item) {
          if (!item.name) return "";

          // Split on spaces
          const parts = item.name.trim().split(/\s+/);

          if (parts.length === 1) return ""; // Only first name

          // Handle middle names/initials:
          // If second to last part is a single letter (initial), include it in lastName
          if (parts.length > 2 && parts[parts.length - 2].length === 1) {
            return parts.slice(-2).join(" ");
          }

          // Otherwise return last part
          return parts[parts.length - 1];
        },
      }),
    }),
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
    billingAddress: virtual({
      field: (lists) =>
        graphql.field({
          type: lists.Address.types.output,
          async resolve(item, args, context) {
            const address = await context.query.Address.findMany({
              where: {
                user: { id: { equals: item.id } },
                isBilling: { equals: true }
              },
              take: 1
            });

            if (!address.length) return null;

            return {
              firstName: address[0].firstName,
              lastName: address[0].lastName,
              company: address[0].company,
              address1: address[0].address1,
              address2: address[0].address2,
              city: address[0].city,
              province: address[0].province,
              postalCode: address[0].postalCode,
              countryCode: address[0].countryCode,
              phone: address[0].phone
            };
          }
        }),
      ui: {
        query: `{
            firstName
            lastName
            company
            address1
            address2
            city
            province
            postalCode
            countryCode
            phone
        }`
      }
    }),
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
