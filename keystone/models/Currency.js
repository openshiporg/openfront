import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { text, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const Currency = list({
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
      isIndexed: "unique",
      validation: {
        isRequired: true,
      },
    }),
    symbol: text({
      validation: {
        isRequired: true,
      },
    }),
    symbolNative: text({
      validation: {
        isRequired: true,
      },
    }),
    name: text({
      validation: {
        isRequired: true,
      },
    }),
    moneyAmounts: relationship({
      ref: "MoneyAmount.currency",
      many: true,
    }),
    orders: relationship({
      ref: "Order.currency",
      many: true,
    }),
    payments: relationship({
      ref: "Payment.currency",
      many: true,
    }),
    regions: relationship({
      ref: "Region.currency",
      many: true,
    }),
    stores: relationship({
      ref: "Store.currencies",
      many: true,
    }),
    ...trackingFields,
    // stores: relationship({
    //   ref: "Store.currencies",
    //   many: true,
    // }),
  },
});
