import { graphql, list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { integer, relationship, virtual } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";
import { calculatePrices } from "../../storefront/lib/data/pricing/calculatePrices";

export const MoneyAmount = list({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts,
    },
  },
  fields: {
    displayPrice: virtual({
      field: graphql.field({
        type: graphql.String,
        resolve: async (item, args, context) => {
          const { currency, amount } = await context.query.MoneyAmount.findOne({
            where: { id: item.id },
            query: 'currency { symbol } amount',
          });
          return `${currency.symbol}${(amount / 100).toFixed(2)}`;
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
    priceSet: relationship({
      ref: 'PriceSet.prices',
    }),
    priceRules: relationship({
      ref: 'PriceRule.moneyAmounts',
      many: true,
    }),
    calculatedPrice: virtual({
      field: graphql.field({
        type: graphql.JSON,
        async resolve(item, args, context) {
          const moneyAmount = await context.query.MoneyAmount.findOne({
            where: { id: item.id },
            query: `
              id
              currency { code }
              priceSet { id }
            `,
          });

          if (!moneyAmount || !moneyAmount.priceSet) return null;

          const calculatedPrices = await calculatePrices(
            [moneyAmount.priceSet.id], 
            moneyAmount.currency.code, 
            1, 
            context.sudo()
          );

          return calculatedPrices.find(price => price.id === moneyAmount.id)?.calculatedPrice || null;
        },
      }),
    }),
    ...trackingFields,
  },
  ui: {
    labelField: "displayPrice",
  },
});
