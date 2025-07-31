
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  integer,
  json,
  select,
  text,
  relationship,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const DiscountRule = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadOrders({ session }) ||
        permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders,
    }
  },
  fields: {
    description: text(),
    type: select({
      type: "enum",
      options: [
        {
          label: "Fixed",
          value: "fixed",
        },
        {
          label: "Percentage",
          value: "percentage",
        },
        {
          label: "Free Shipping",
          value: "free_shipping",
        },
      ],
      validation: {
        isRequired: true,
      },
    }),
    value: integer({
      validation: {
        isRequired: true,
      },
    }),
    allocation: select({
      type: "enum",
      options: [
        {
          label: "Total",
          value: "total",
        },
        {
          label: "Item",
          value: "item",
        },
      ],
    }),
    metadata: json(),
    discounts: relationship({
      ref: "Discount.discountRule",
      many: true,
    }),
    discountConditions: relationship({
      ref: "DiscountCondition.discountRule",
      many: true,
    }),
    products: relationship({
      ref: "Product.discountRules",
      many: true,
    }),
    ...trackingFields,
  },
});
