
import { list } from "@keystone-6/core";
import { text, select, float, integer, relationship } from "@keystone-6/core/fields";
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
    type: select({
      type: 'enum',
      options: [
        { label: 'Fixed', value: 'fixed' },
        { label: 'Percentage', value: 'percentage' },
      ],
      validation: { isRequired: true },
    }),
    value: float({ validation: { isRequired: true } }),
    priority: integer({ defaultValue: 0 }),
    ruleAttribute: text({ validation: { isRequired: true } }),
    ruleValue: text({ validation: { isRequired: true } }),
    moneyAmounts: relationship({ ref: 'MoneyAmount.priceRules', many: true }),
    priceSet: relationship({ ref: 'PriceSet.priceRules' }),
    ...trackingFields,
  },
});
