
import { list } from "@keystone-6/core";
import { relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const PriceSet = list({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts,
    },
  },
  fields: {
    prices: relationship({ ref: 'MoneyAmount.priceSet', many: true }),
    priceRules: relationship({ ref: 'PriceRule.priceSet', many: true }),
    ruleTypes: relationship({ ref: 'RuleType.priceSets', many: true }),
    ...trackingFields,
  },
});
