
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { json, text, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const Store = list({
  access: {
    operation: {
      // Allow public read access
      query: () => true,
      create: permissions.canManageSalesChannels,
      update: permissions.canManageSalesChannels,
      delete: permissions.canManageSalesChannels,
    },
  },
  fields: {
    name: text({
      defaultValue: "Openfront Store",
      validation: {
        isRequired: true,
      },
    }),
    defaultCurrencyCode: text({
      defaultValue: "usd",
      validation: {
        isRequired: true,
      },
    }),
    metadata: json(),
    swapLinkTemplate: text(),
    paymentLinkTemplate: text(),
    inviteLinkTemplate: text(),
    // currency: relationship({
    //   ref: "Currency.stores",
    // }),
    currencies: relationship({
      ref: "Currency.stores",
      many: true,
    }),
    ...trackingFields,
  },
});
