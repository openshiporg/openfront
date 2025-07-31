
import { list } from "@keystone-6/core";
import { text, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const RuleType = list({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts,
    },
  },
  fields: {
    name: text({ validation: { isRequired: true } }),
    ruleAttribute: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
    priceSets: relationship({ ref: 'PriceSet.ruleTypes', many: true }),
    ...trackingFields,
  },
});
