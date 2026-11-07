
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
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),
    isDynamic: checkbox(),
    isDisabled: checkbox(),
    stackable: checkbox({
      defaultValue: false,
    }),
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
  hooks: {
    validateInput({ resolvedData, item, addValidationError }) {
      const startsAt = resolvedData.startsAt ?? item?.startsAt;
      const endsAt = resolvedData.endsAt !== undefined ? resolvedData.endsAt : item?.endsAt;
      if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
        addValidationError("A discount has to end after it starts.");
      }
      const usageLimit = resolvedData.usageLimit !== undefined ? resolvedData.usageLimit : item?.usageLimit;
      if (typeof usageLimit === "number" && usageLimit < 0) addValidationError("A usage limit can't be negative.");
      if (typeof resolvedData.usageCount === "number" && resolvedData.usageCount < 0) addValidationError("The usage count can't be negative.");
    },
    async afterOperation({ operation, item, context }) {
      if (operation === "create" || operation === "update") {
        const sudoContext = context.sudo();
        const discount = await sudoContext.query.Discount.findOne({
          where: { id: item.id },
          query: 'carts { id }'
        });
        
        if (discount?.carts?.length) {
          for (const cart of discount.carts) {
            await sudoContext.query.Cart.updateOne({
              where: { id: cart.id },
              data: {
                paymentCollection: {
                  disconnect: true
                }
              }
            });
          }
        }
      }
    }
  },
});
