import { list } from "@keystone-6/core";
import { json, text, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const Address = list({
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
    metadata: json(),
    country: relationship({
      ref: "Country.addresses",
      many: false,
    }),
    customer: relationship({
      ref: "Customer.addresses",
      many: false,
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
    swaps: relationship({
      ref: "Swap.address",
      many: true,
    }),
    ...trackingFields,
  },
});
