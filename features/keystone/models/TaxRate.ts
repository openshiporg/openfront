
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  json,
  float,
  text,
  relationship,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const TaxRate = list({
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
    rate: float(),
    code: text(),
    name: text({
      validation: {
        isRequired: true,
      },
    }),
    metadata: json(),
    products: relationship({
      ref: "Product.taxRates",
      many: true,
    }),
    productTypes: relationship({
      ref: "ProductType.taxRates",
      many: true,
    }),
    region: relationship({
      ref: "Region.taxRates",
    }),
    shippingOptions: relationship({
      ref: "ShippingOption.taxRates",
      many: true,
    }),
    ...trackingFields
  },
});
