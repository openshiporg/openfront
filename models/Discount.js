import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  checkbox,
  integer,
  json,
  text,
  timestamp,
  relationship,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const Discount = list({
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
    code: text({
      validation: {
        isRequired: true,
      },
    }),
    isDynamic: checkbox(),
    isDisabled: checkbox(),
    startsAt: timestamp({
      defaultValue: { kind: "now" },
      validation: {
        isRequired: true,
      },
    }),
    endsAt: timestamp({
      validation: {
        isRequired: false,
      },
    }),
    metadata: json(),
    usageLimit: integer(),
    usageCount: integer({
      defaultValue: 0,
      validation: {
        isRequired: true,
      },
    }),
    validDuration: text(),
    discountRule: relationship({
      ref: "DiscountRule.discounts",
    }),
    carts: relationship({
      ref: "Cart.discounts",
      many: true,
    }),
    lineItemAdjustments: relationship({
      ref: "LineItemAdjustment.discount",
      many: true,
    }),
    regions: relationship({
      ref: "Region.discounts",
      many: true,
    }),
    orders: relationship({
      ref: "Order.discounts",
      many: true,
    }),
    ...trackingFields,
  },
});
