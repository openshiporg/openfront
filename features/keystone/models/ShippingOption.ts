
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  checkbox,
  integer,
  json,
  select,
  text,
  relationship,
  virtual,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";
import { graphql } from "@keystone-6/core";

// Helper function for currency formatting
function formatCurrency(amount, currencyCode = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}

export const ShippingOption = list({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders,
    },
  },
  fields: {
    name: text({
      validation: {
        isRequired: true,
      },
    }),
    uniqueKey: text({
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),
    priceType: select({
      type: "enum",
      options: [
        {
          label: "Flat Rate",
          value: "flat_rate",
        },
        {
          label: "Calculated",
          value: "calculated",
        },
        {
          label: "Free",
          value: "free",
        },
      ],
      validation: {
        isRequired: true,
      },
    }),
    amount: integer({
      validation: {
        isRequired: false,
      },
    }),
    isReturn: checkbox(),
    data: json(),
    metadata: json(),
    adminOnly: checkbox(),
    region: relationship({
      ref: "Region.shippingOptions",
    }),
    fulfillmentProvider: relationship({
      ref: "FulfillmentProvider.shippingOptions",
    }),
    shippingProfile: relationship({
      ref: "ShippingProfile.shippingOptions",
    }),
    customShippingOptions: relationship({
      ref: "CustomShippingOption.shippingOption",
      many: true,
    }),
    shippingMethods: relationship({
      ref: "ShippingMethod.shippingOption",
      many: true,
    }),
    shippingOptionRequirements: relationship({
      ref: "ShippingOptionRequirement.shippingOption",
      many: true,
    }),
    taxRates: relationship({
      ref: "TaxRate.shippingOptions",
      many: true,
    }),
    calculatedAmount: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item, args, context) {
          const sudoContext = context.sudo();

          const shippingOption = await sudoContext.query.ShippingOption.findOne({
            where: { id: item.id },
            query: `
              region {
                currency {
                  code
                  noDivisionCurrency
                }
              }
              amount
              taxRates {
                rate
              }
            `
          });

          if (!shippingOption?.amount) return null;

          const currencyCode = shippingOption.region?.currency?.code || "USD";
          const divisor = shippingOption.region?.currency?.noDivisionCurrency ? 1 : 100;

          const taxRate = shippingOption.taxRates?.[0]?.rate || 0;
          const amount = shippingOption.amount * (1 + taxRate);

          return formatCurrency(amount / divisor, currencyCode);
        }
      })
    }),
    isTaxInclusive: virtual({
      field: graphql.field({
        type: graphql.Boolean,
        resolve() {
          return true;
        }
      })
    }),
    ...trackingFields,
  },
});
