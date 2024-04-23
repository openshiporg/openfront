import { graphql, list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { integer, relationship, virtual } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const MoneyAmount = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadProducts({ session }) ||
        permissions.canManageProducts({ session }),
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts,
    },
  },
  fields: {
    displayPrice: virtual({
      field: graphql.field({
        type: graphql.String,
        // resolve: (item) => `${item.title}`,
        resolve: async (item, args, context) => {
          const { currency } = await context.query.MoneyAmount.findOne({
            where: { id: item.id.toString() },
            query: "currency { symbol }",
          });
          return `${currency.symbol}${(item.amount / 100).toFixed(2)}`;
        },
      }),
    }),
    amount: integer({
      validation: {
        isRequired: true,
      },
    }),
    minQuantity: integer(),
    maxQuantity: integer(),
    productVariant: relationship({
      ref: "ProductVariant.prices",
    }),
    region: relationship({
      ref: "Region.moneyAmounts",
    }),
    currency: relationship({
      ref: "Currency.moneyAmounts",
    }),
    priceList: relationship({
      ref: "PriceList.moneyAmounts",
    }),
    ...trackingFields,
  },
  ui: {
    labelField: "displayPrice",
  },
});
