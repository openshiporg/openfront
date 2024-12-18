import { list } from "@keystone-6/core";
import { json, text, relationship, checkbox } from "@keystone-6/core/fields";
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
      create: isSignedIn,
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
    company: text(),
    firstName: text(),
    lastName: text(),
    address1: text(),
    address2: text(),
    city: text(),
    countryCode: text(),
    province: text(),
    postalCode: text(),
    phone: text(),
    isBilling: checkbox({ defaultValue: false }),
    metadata: json(),
    country: relationship({
      ref: "Country.addresses",
      many: false,
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
});
