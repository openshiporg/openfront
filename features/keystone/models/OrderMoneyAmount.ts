
import { list } from "@keystone-6/core";
import { integer, relationship, json } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const OrderMoneyAmount = list({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders,
    },
  },
  fields: {
    amount: integer({
      validation: { isRequired: true },
    }),
    originalAmount: integer({
      validation: { isRequired: true },
    }),
    priceData: json({
      description: "Snapshot of complete price data including rules, lists, etc.",
    }),
    metadata: json(),
    orderLineItem: relationship({
      ref: "OrderLineItem.moneyAmount",
    }),
    currency: relationship({
      ref: "Currency",
    }),
    region: relationship({
      ref: "Region",
    }),
    ...trackingFields,
  },
});