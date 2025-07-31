import { type Lists } from ".keystone/types";
import { list, graphql } from "@keystone-6/core";
import { json, text, relationship, checkbox, virtual } from "@keystone-6/core/fields";
import { permissions, isSignedIn } from "../access";
import { trackingFields } from "./trackingFields";

const canManageAddresses = ({ session }) => {
  if (!isSignedIn({ session })) {
    return false;
  }
  if (permissions.canManageUsers({ session })) {
    return true;
  }
  // Users can manage addresses where they are the owner
  return { user: { id: { equals: session?.itemId } } };
};

export const Address = list({
  access: {
    operation: {
      create: () => true,
      query: isSignedIn,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers,
    },
    filter: {
      query: canManageAddresses,
      update: canManageAddresses,
      delete: canManageAddresses,
    }
  },
  fields: {
    label: virtual({
      field: graphql.field({
        type: graphql.String,
        resolve(item) {
          const parts = [];
          
          // Company or Name
          if (item.company) {
            parts.push(item.company);
          }
          if (item.firstName || item.lastName) {
            parts.push(`${item.firstName || ''} ${item.lastName || ''}`.trim());
          }
          
          // Address lines
          if (item.address1) {
            parts.push(item.address1);
          }
          if (item.address2) {
            parts.push(item.address2);
          }
          
          // City, Province Postal
          const cityProvince = [];
          if (item.city) cityProvince.push(item.city);
          if (item.province) cityProvince.push(item.province);
          if (cityProvince.length > 0) {
            parts.push(cityProvince.join(', ') + (item.postalCode ? ` ${item.postalCode}` : ''));
          } else if (item.postalCode) {
            parts.push(item.postalCode);
          }
          
          return parts.join(' • ');
        }
      }),
    }),
    company: text(),
    firstName: text(),
    lastName: text(),
    address1: text(),
    address2: text(),
    city: text(),
    province: text(),
    postalCode: text(),
    phone: text(),
    isBilling: checkbox({ defaultValue: false }),
    metadata: json(),
    country: relationship({
      ref: "Country.addresses",
      many: false,
      validation: { isRequired: true }
    }),
    user: relationship({
      ref: "User.addresses",
      many: false,
      hooks: {
        resolveInput({ operation, resolvedData, context }) {
          if (
            (operation === "create" || operation === "update") &&
            !resolvedData.user &&
            context.session?.itemId
          ) {
            return { connect: { id: context.session.itemId } };
          }
          return resolvedData.user;
        },
      },
    }),
    shippingProviders: relationship({
      ref: 'ShippingProvider.fromAddress',
      many: true,
    }),
    cart: relationship({
      ref: "Cart.addresses",
      many: false,
    }),
    claimOrders: relationship({
      ref: "ClaimOrder.address",
      many: true,
    }),
    ordersUsingAsBillingAddress: relationship({
      ref: "Order.billingAddress",
      many: true,
    }),
    ordersUsingAsShippingAddress: relationship({
      ref: "Order.shippingAddress",
      many: true,
    }),
    cartsUsingAsBillingAddress: relationship({
      ref: 'Cart.billingAddress',
      many: true,
    }),
    cartsUsingAsShippingAddress: relationship({
      ref: 'Cart.shippingAddress',
      many: true,
    }),
    swaps: relationship({
      ref: "Swap.address",
      many: true,
    }),
    ...trackingFields,
  },
  ui: {
    labelField: 'label',
  },
});
