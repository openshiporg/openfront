
import { graphql, group, list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { integer, relationship, virtual } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

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
    amount: integer({
      validation: {
        isRequired: true,
      },
    }),
    compareAmount: integer(),
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
      ref: "PriceSet.prices",
    }),
    priceRules: relationship({
      ref: "PriceRule.moneyAmounts",
      many: true,
    }),

    ...group({
      label: "Virtual Fields",
      description: "Virtual fields for money amount",
      fields: {
        displayPrice: virtual({
          field: graphql.field({
            type: graphql.String,
            resolve: async (item, args, context) => {
              const { currency, amount } =
                await context.query.MoneyAmount.findOne({
                  where: { id: item.id },
                  query: "currency { symbol } amount",
                });
              return `${currency.symbol}${(amount / 100).toFixed(2)}`;
            },
          }),
        }),
        calculatedPrice: virtual({
          field: graphql.field({
            type: graphql.object()({
              name: "CalculatedPrice",
              fields: {
                calculatedAmount: graphql.field({ type: graphql.Int }),
                originalAmount: graphql.field({ type: graphql.Int }),
                currencyCode: graphql.field({ type: graphql.String }),
                moneyAmountId: graphql.field({ type: graphql.ID }),
                variantId: graphql.field({ type: graphql.ID }),
                priceListId: graphql.field({ type: graphql.ID }),
                priceListType: graphql.field({ type: graphql.String }),
              },
            }),
            resolve: async (item, args, context) => {
              const moneyAmount = await context.query.MoneyAmount.findOne({
                where: { id: item.id },
                query: `
                  id
                  amount
                  currency { code }
                  productVariant { id }
                  priceList { 
                    id 
                    type 
                    status
                    startsAt 
                    endsAt 
                  }
                  priceSet { 
                    id 
                    prices { 
                      id 
                      amount 
                      currency { code }
                      minQuantity
                      maxQuantity
                      priceList { 
                        id 
                        type 
                        status
                        startsAt 
                        endsAt 
                      }
                    }
                    priceRules {
                      id
                      type
                      value
                      priority
                      ruleAttribute
                      ruleValue
                    }
                  }
                `,
              });

              if (!moneyAmount) return null;

              const now = new Date();
              const currencyCode = moneyAmount.currency.code;
              let calculatedAmount = moneyAmount.amount;
              let originalAmount = moneyAmount.amount;
              let appliedPriceList = null;

              // Check if there's a valid price list
              if (moneyAmount.priceList) {
                const startDate = new Date(moneyAmount.priceList.startsAt);
                const endDate = new Date(moneyAmount.priceList.endsAt);
                if (
                  moneyAmount.priceList.status === "active" &&
                  (!startDate || startDate <= now) &&
                  (!endDate || endDate >= now)
                ) {
                  appliedPriceList = moneyAmount.priceList;
                }
              }

              // Apply price set logic if it exists
              if (moneyAmount.priceSet) {
                const validPrices = moneyAmount.priceSet.prices.filter(
                  (price) => {
                    if (price.currency.code !== currencyCode) return false;
                    if (price.priceList) {
                      const startDate = new Date(price.priceList.startsAt);
                      const endDate = new Date(price.priceList.endsAt);
                      return (
                        price.priceList.status === "active" &&
                        (!startDate || startDate <= now) &&
                        (!endDate || endDate >= now)
                      );
                    }
                    return true;
                  }
                );

                if (validPrices.length > 0) {
                  // Sort prices by amount (ascending)
                  validPrices.sort((a, b) => a.amount - b.amount);
                  calculatedAmount = validPrices[0].amount;
                  appliedPriceList = validPrices[0].priceList || null;
                }

                // Apply price rules
                if (
                  moneyAmount.priceSet.priceRules &&
                  moneyAmount.priceSet.priceRules.length > 0
                ) {
                  const sortedRules = moneyAmount.priceSet.priceRules.sort(
                    (a, b) => b.priority - a.priority
                  );
                  for (const rule of sortedRules) {
                    if (rule.type === "fixed") {
                      calculatedAmount = Math.min(calculatedAmount, rule.value);
                    } else if (rule.type === "percentage") {
                      const discountAmount = Math.round(
                        calculatedAmount * (rule.value / 100)
                      );
                      calculatedAmount -= discountAmount;
                    }
                  }
                }
              }

              return {
                calculatedAmount,
                originalAmount,
                currencyCode,
                moneyAmountId: moneyAmount.id,
                variantId: moneyAmount.productVariant?.id || null,
                priceListId: appliedPriceList?.id || null,
                priceListType: appliedPriceList?.type || null,
              };
            },
          }),
          ui: {
            query:
              "{ calculatedAmount originalAmount currencyCode moneyAmountId variantId priceListId priceListType }",
          },
        }),
      },
    }),
    ...trackingFields,
  },
  ui: {
    labelField: "displayPrice",
  },
});
