
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { json, text, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const CustomerGroup = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadUsers({ session }) ||
        permissions.canManageUsers({ session }),
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
    metadata: json(),
    users: relationship({
      ref: "User.customerGroups",
      many: true,
    }),
    discountConditions: relationship({
      ref: "DiscountCondition.customerGroups",
      many: true,
    }),
    priceLists: relationship({
      ref: "PriceList.customerGroups",
      many: true,
    }),
    ...trackingFields,
  },
});
