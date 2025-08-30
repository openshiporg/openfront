import { list, graphql, group } from '@keystone-6/core';
import { denyAll } from '@keystone-6/core/access';
import {
  json,
  password,
  select,
  text,
  relationship,
  checkbox,
  virtual,
  timestamp,
} from '@keystone-6/core/fields';
import { isSignedIn, permissions, rules } from '../access';
import { trackingFields } from './trackingFields';

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
    email: text({ isIndexed: 'unique', validation: { isRequired: true } }),
    password: password({
      validation: {
        length: { min: 10, max: 1000 },
        isRequired: true,
        rejectCommon: true,
      },
    }),
    role: relationship({
      ref: 'Role.assignedTo',
      access: {
        create: permissions.canManageUsers,
        update: permissions.canManageUsers,
      },
      ui: {
        itemView: {
          fieldMode: (args) =>
            permissions.canManageUsers(args) ? 'edit' : 'read',
        },
      },
    }),

    apiKeys: relationship({ ref: 'ApiKey.user', many: true }),

    phone: text(),
    hasAccount: checkbox(),
    addresses: relationship({
      ref: 'Address.user',
      many: true,
    }),
    orders: relationship({
      ref: 'Order.user',
      many: true,
    }),
    orderEvents: relationship({
      ref: 'OrderEvent.user',
      many: true,
    }),
    carts: relationship({
      ref: 'Cart.user',
      many: true,
    }),
    customerGroups: relationship({
      ref: 'CustomerGroup.users',
      many: true,
    }),
    notifications: relationship({
      ref: 'Notification.user',
      many: true,
    }),
    payments: relationship({
      ref: 'Payment.user',
      many: true,
    }),
    batchJobs: relationship({
      ref: 'BatchJob.createdBy',
      many: true,
    }),
    team: relationship({
      ref: 'Team.members',
      many: false,
    }),
    teamLead: relationship({
      ref: 'Team.leader',
      many: true,
    }),
    userField: relationship({
      ref: 'UserField.user',
      many: false,
    }),
    onboardingStatus: select({
      options: [
        { label: 'Not Started', value: 'not_started' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Dismissed', value: 'dismissed' },
      ],
      defaultValue: 'not_started',
    }),

    // Account system fields
    accounts: relationship({
      ref: 'Account.user',
      many: true,
    }),
    invoices: relationship({
      ref: 'Invoice.user',
      many: true,
    }),
    businessAccountRequest: relationship({
      ref: 'BusinessAccountRequest.user', 
      many: false,
    }),
    customerToken: text({
      ui: { 
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' }
      },
      db: {
        isNullable: true,
      },
    }),
    tokenGeneratedAt: timestamp(),
    ...group({
      label: 'Virtual Fields',
      description: 'Calculated fields for user display and cart status',
      fields: {
        firstName: virtual({
          field: graphql.field({
            type: graphql.String,
            resolve(item) {
              if (!item.name) return '';

              // Split on spaces and get first part
              const parts = item.name.trim().split(/\s+/);
              return parts[0] || '';
            },
          }),
        }),
        lastName: virtual({
          field: graphql.field({
            type: graphql.String,
            resolve(item) {
              if (!item.name) return '';

              // Split on spaces
              const parts = item.name.trim().split(/\s+/);

              if (parts.length === 1) return ''; // Only first name

              // Handle middle names/initials:
              // If second to last part is a single letter (initial), include it in lastName
              if (parts.length > 2 && parts[parts.length - 2].length === 1) {
                return parts.slice(-2).join(' ');
              }

              // Otherwise return last part
              return parts[parts.length - 1];
            },
          }),
        }),
        activeCartId: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              // Use sudo context to bypass access control for this check
              const sudoContext = context.sudo();

              // Find the most recently updated cart that is:
              // 1. Owned by this user
              // 2. Has no associated order
              // 3. Is of type 'default'
              const activeCarts = await sudoContext.query.Cart.findMany({
                where: {
                  user: { id: { equals: item.id } },
                  order: null,
                  type: { equals: 'default' },
                },
                orderBy: { updatedAt: 'desc' },
                take: 1,
                query: `
                  id
                  lineItems {
                    id
                  }
                `,
              });

              // Only return the cart ID if it has line items
              const cart = activeCarts[0];
              if (cart && cart.lineItems?.length > 0) {
                return cart.id;
              }

              return null;
            },
          }),
        }),
        billingAddress: virtual({
          field: (lists) =>
            graphql.field({
              type: lists.Address.types.output,
              async resolve(item, args, context) {
                const address = await context.db.Address.findMany({
                  where: {
                    user: { id: { equals: item.id } },
                    isBilling: { equals: true },
                  },
                  take: 1,
                });

                if (!address.length) return null;

                return address[0];
              },
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
                country {
                  id
                  iso2
                }
                phone
            }`,
          },
        }),
      },
    }),
    ...trackingFields,
  },
});
