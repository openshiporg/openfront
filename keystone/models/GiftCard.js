import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  integer,
  text,
  checkbox,
  json,
  timestamp,
  relationship,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const GiftCard = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadGiftCards({ session }) ||
        permissions.canManageGiftCards({ session }),
      create: permissions.canManageGiftCards,
      update: permissions.canManageGiftCards,
      delete: permissions.canManageGiftCards,
    },
  },
  fields: {
    code: text({
      validation: {
        isRequired: true,
      },
      isIndexed: 'unique',
    }),
    value: integer({
      validation: {
        isRequired: true,
      },
    }),
    balance: integer({
      validation: {
        isRequired: true,
      },
    }),
    isDisabled: checkbox(),
    endsAt: timestamp(),
    metadata: json(),
    order: relationship({
      ref: "Order.giftCards",
    }),
    carts: relationship({
      ref: "Cart.giftCards",
      many: true,
    }),
    giftCardTransactions: relationship({
      ref: "GiftCardTransaction.giftCard",
      many: true,
    }),
    region: relationship({
      ref: "Region.giftCards",
    }),
    ...trackingFields,
  },
});
