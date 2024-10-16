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
                ruleTypes {
                  id
                  ruleAttribute
                }
              }
            `,
          });

          if (!moneyAmount || !moneyAmount.priceSet) return null;

          const now = new Date();
          const quantity = 1; // Default quantity, adjust as needed
          const currencyCode = moneyAmount.currency.code;

          // Filter and sort valid prices
          const validPrices = moneyAmount.priceSet.prices.filter(price => {
            if (price.currency.code !== currencyCode) return false;
            if (price.minQuantity && quantity < price.minQuantity) return false;
            if (price.maxQuantity && quantity > price.maxQuantity) return false;
            if (!price.priceList) return true;
            if (price.priceList.status !== 'active') return false;
            const startDate = new Date(price.priceList.startsAt);
            const endDate = new Date(price.priceList.endsAt);
            return (!startDate || startDate <= now) && (!endDate || endDate >= now);
          });

          // Sort prices (keep existing sorting logic)

          const calculatedPrice = validPrices[0] || moneyAmount;
          const originalPrice = validPrices.find(p => !p.priceList) || moneyAmount;

          // Apply price rules
          let calculatedAmount = calculatedPrice.amount;
          if (moneyAmount.priceSet.priceRules && moneyAmount.priceSet.priceRules.length > 0) {
            // Sort rules by priority (highest first)
            const sortedRules = moneyAmount.priceSet.priceRules.sort((a, b) => b.priority - a.priority);

            for (const rule of sortedRules) {
              // Check if the rule is applicable based on rule_attribute and rule_value
              // This is a simplified check and may need to be adjusted based on your specific requirements
              const isApplicable = true; // Replace with actual logic to check rule applicability

              if (isApplicable) {
                if (rule.type === 'fixed') {
                  calculatedAmount = Math.min(calculatedAmount, rule.value);
                } else if (rule.type === 'percentage') {
                  const discountAmount = Math.round(calculatedAmount * (rule.value / 100));
                  calculatedAmount -= discountAmount;
                }
              }
            }
          }

          return {
            calculatedAmount: calculatedAmount,
            originalAmount: originalPrice.amount,
            currencyCode: currencyCode,
            calculatedPrice: {
              moneyAmountId: calculatedPrice.id,
              variantId: moneyAmount.productVariant?.id || null,
              priceListId: calculatedPrice.priceList?.id || null,
              priceListType: calculatedPrice.priceList?.type || null,
            },
            originalPrice: {
              moneyAmountId: originalPrice.id,
              variantId: moneyAmount.productVariant?.id || null,
              priceListId: originalPrice.priceList?.id || null,
              priceListType: originalPrice.priceList?.type || null,
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
