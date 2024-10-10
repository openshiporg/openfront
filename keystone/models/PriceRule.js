import { list } from "@keystone-6/core";
import { text, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const PriceRule = list({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts,
    },
  },
  fields: {
    attribute: text({ validation: { isRequired: true } }),
    value: text({ validation: { isRequired: true } }),
    moneyAmounts: relationship({ ref: 'MoneyAmount.priceRules', many: true }),
    priceSets: relationship({ ref: 'PriceSet.priceRules', many: true }),
    ...trackingFields,
  },
});