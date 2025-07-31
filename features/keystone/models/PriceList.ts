
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { select, text, timestamp, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const PriceList = list({
  access: {
    operation: {
      // Allow public read access
      query: () => true,
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers,
    },
  },
  fields: {
    name: text({
      validation: {
        isRequired: true,
      },
    }),
    description: text({
      validation: {
        isRequired: true,
      },
    }),
    type: select({
      type: "enum",
      options: [
        {
          label: "Sale",
          value: "sale",
        },
        {
          label: "Override",
          value: "override",
        },
      ],
      defaultValue: "sale",
      validation: {
        isRequired: true,
      },
    }),
    status: select({
      type: "enum",
      options: [
        {
          label: "Active",
          value: "active",
        },
        {
          label: "Draft",
          value: "draft",
        },
      ],
      defaultValue: "draft",
      validation: {
        isRequired: true,
      },
    }),
    startsAt: timestamp(),
    endsAt: timestamp(),
    moneyAmounts: relationship({
      ref: "MoneyAmount.priceList",
      many: true,
    }),
    customerGroups: relationship({
      ref: "CustomerGroup.priceLists",
      many: true,
    }),
    ...trackingFields,
  },
});
