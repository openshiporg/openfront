import { graphql, list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { integer, relationship, virtual } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const MoneyAmount = list({
  access: {
    operation: {
      // Allow public read access
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
    calculatedPrice: virtual({
      field: graphql.field({
        type: graphql.JSON,
        resolve: async (item, args, context) => {
          const now = new Date();

          const { priceList, currency } = await context.query.MoneyAmount.findOne({
            where: { id: item.id },
            query: `
              priceList {
                id
                type
                status
                startsAt
                endsAt
              }
              currency {
                code
              }
            `,
          });

          const isPriceListValid =
            !priceList ||
            (priceList.status === "active" &&
              (!priceList.startsAt || new Date(priceList.startsAt) <= now) &&
              (!priceList.endsAt || new Date(priceList.endsAt) >= now));

          if (!isPriceListValid) {
            return null;
          }

          return {
            id: item.id,
            isCalculatedPricePriceList: !!priceList,
            isCalculatedPriceTaxInclusive: false, // Assuming tax is not included, adjust if needed
            calculatedAmount: item.amount,
            rawCalculatedAmount: item,
            isOriginalPricePriceList: false,
            isOriginalPriceTaxInclusive: false, // Assuming tax is not included, adjust if needed
            originalAmount: item.amount,
            rawOriginalAmount: item,
            currencyCode: currency.code,
            calculatedPrice: {
              id: item.id,
              priceListId: priceList?.id || null,
              priceListType: priceList?.type || null,
              minQuantity: item.minQuantity || null,
              maxQuantity: item.maxQuantity || null,
            },
            originalPrice: {
              id: item.id,
              priceListId: null,
              priceListType: null,
              minQuantity: item.minQuantity || null,
              maxQuantity: item.maxQuantity || null,
            },
          };
        },
      }),
    }),
    ...trackingFields,
  },
  ui: {
    labelField: "displayPrice",
  },
});
