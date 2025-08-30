
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  checkbox,
  json,
  float,
  text,
  relationship,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const Region = list({
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
    code: text({
      isIndexed: "unique",
      validation: {
        isRequired: true,
      },
    }),
    name: text({
      validation: {
        isRequired: true,
      },
    }),
    taxRate: float({
      validation: {
        isRequired: true,
      },
    }),
    taxCode: text(),
    metadata: json(),
    giftCardsTaxable: checkbox({
      defaultValue: true,
    }),
    automaticTaxes: checkbox({
      defaultValue: true,
    }),
    currency: relationship({
      ref: "Currency.regions",
    }),
    carts: relationship({
      ref: "Cart.region",
      many: true,
    }),
    countries: relationship({
      ref: "Country.region",
      many: true,
    }),
    discounts: relationship({
      ref: "Discount.regions",
      many: true,
    }),
    giftCards: relationship({
      ref: "GiftCard.region",
      many: true,
    }),
    moneyAmounts: relationship({
      ref: "MoneyAmount.region",
      many: true,
    }),
    orders: relationship({
      ref: "Order.region",
      many: true,
    }),
    taxProvider: relationship({
      ref: "TaxProvider.regions",
    }),
    fulfillmentProviders: relationship({
      ref: "FulfillmentProvider.regions",
      many: true,
    }),
    paymentProviders: relationship({
      ref: "PaymentProvider.regions",
      many: true,
    }),
    shippingOptions: relationship({
      ref: "ShippingOption.region",
      many: true,
    }),
    taxRates: relationship({
      ref: "TaxRate.region",
      many: true,
    }),
    shippingProviders: relationship({
      ref: "ShippingProvider.regions",
      many: true,
    }),
    accountLineItems: relationship({
      ref: "AccountLineItem.region",
      many: true,
    }),
    ...trackingFields
  },
});
