
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  checkbox,
  integer,
  json,
  select,
  text,
  timestamp,
  relationship,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const Swap = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadOrders({ session }) ||
        permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders,
    },
  },
  fields: {
    fulfillmentStatus: select({
      type: "enum",
      options: [
        {
          label: "Not Fulfilled",
          value: "not_fulfilled",
        },
        {
          label: "Fulfilled",
          value: "fulfilled",
        },
        {
          label: "Shipped",
          value: "shipped",
        },
        {
          label: "Partially Shipped",
          value: "partially_shipped",
        },
        {
          label: "Canceled",
          value: "canceled",
        },
        {
          label: "Requires Action",
          value: "requires_action",
        },
      ],
      validation: {
        isRequired: true,
      },
    }),
    paymentStatus: select({
      type: "enum",
      options: [
        {
          label: "Not Paid",
          value: "not_paid",
        },
        {
          label: "Awaiting",
          value: "awaiting",
        },
        {
          label: "Captured",
          value: "captured",
        },
        {
          label: "Confirmed",
          value: "confirmed",
        },
        {
          label: "Canceled",
          value: "canceled",
        },
        {
          label: "Difference Refunded",
          value: "difference_refunded",
        },
        {
          label: "Partially Refunded",
          value: "partially_refunded",
        },
        {
          label: "Refunded",
          value: "refunded",
        },
        {
          label: "Requires Action",
          value: "requires_action",
        },
      ],
      validation: {
        isRequired: true,
      },
    }),
    differenceDue: integer(),
    confirmedAt: timestamp(),
    metadata: json(),
    idempotencyKey: text(),
    noNotification: checkbox(),
    canceledAt: timestamp(),
    allowBackorder: checkbox(),
    cart: relationship({
      ref: "Cart.swap",
    }),
    order: relationship({
      ref: "Order.swaps",
    }),
    address: relationship({
      ref: "Address.swaps",
    }),
    lineItems: relationship({
      ref: "LineItem.swap",
      many: true,
    }),
    fulfillments: relationship({
      ref: "Fulfillment.swap",
      many: true,
    }),
    payment: relationship({
      ref: "Payment.swap",
    }),
    return: relationship({
      ref: "Return.swap",
    }),
    shippingMethods: relationship({
      ref: "ShippingMethod.swap",
      many: true,
    }),
    ...trackingFields,
  },
});
