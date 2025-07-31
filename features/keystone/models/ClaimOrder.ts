
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

export const ClaimOrder = list({
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
    paymentStatus: select({
      type: "enum",
      options: [
        {
          label: "Na",
          value: "na",
        },
        {
          label: "Not Refunded",
          value: "not_refunded",
        },
        {
          label: "Refunded",
          value: "refunded",
        },
      ],
      defaultValue: "na",
      validation: {
        isRequired: true,
      },
    }),
    fulfillmentStatus: select({
      type: "enum",
      options: [
        {
          label: "Not Fulfilled",
          value: "not_fulfilled",
        },
        {
          label: "Partially Fulfilled",
          value: "partially_fulfilled",
        },
        {
          label: "Fulfilled",
          value: "fulfilled",
        },
        {
          label: "Partially Shipped",
          value: "partially_shipped",
        },
        {
          label: "Shipped",
          value: "shipped",
        },
        {
          label: "Partially Returned",
          value: "partially_returned",
        },
        {
          label: "Returned",
          value: "returned",
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
      defaultValue: "not_fulfilled",
      validation: {
        isRequired: true,
      },
    }),
    type: select({
      type: "enum",
      options: [
        {
          label: "Refund",
          value: "refund",
        },
        {
          label: "Replace",
          value: "replace",
        },
      ],
      validation: {
        isRequired: true,
      },
    }),
    refundAmount: integer(),
    canceledAt: timestamp(),
    metadata: json(),
    idempotencyKey: text(),
    noNotification: checkbox(),
    address: relationship({
      ref: "Address.claimOrders",
    }),
    order: relationship({
      ref: "Order.claimOrders",
    }),
    claimItems: relationship({
      ref: "ClaimItem.claimOrder",
      many: true,
    }),
    fulfillments: relationship({
      ref: "Fulfillment.claimOrder",
      many: true,
    }),
    lineItems: relationship({
      ref: "LineItem.claimOrder",
      many: true,
    }),
    return: relationship({
      ref: "Return.claimOrder",
    }),
    shippingMethods: relationship({
      ref: "ShippingMethod.claimOrder",
      many: true,
    }),
    ...trackingFields,
  },
});
