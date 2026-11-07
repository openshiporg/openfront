
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
  hooks: {
    // The balance is a ledger total: it moves only through checkout holds, returns, refunds and voids
    // (appendLedger / holdGiftCardBalances), never by a raw edit. A new card starts at its face value.
    resolveInput({ operation, resolvedData }) {
      if (operation === "create" && resolvedData.balance === undefined && typeof resolvedData.value === "number") {
        resolvedData.balance = resolvedData.value;
      }
      return resolvedData;
    },
    validateInput({ operation, resolvedData, item, addValidationError }) {
      if (operation === "create") {
        if (typeof resolvedData.value !== "number" || resolvedData.value <= 0) addValidationError("A gift card needs a value above zero.");
        else if (resolvedData.balance !== resolvedData.value) addValidationError("A new gift card starts with its full value as the balance.");
      }
      if (operation === "update" && item) {
        if (resolvedData.balance !== undefined && resolvedData.balance !== item.balance) {
          addValidationError("A gift card balance can't be edited. It changes only through orders, returns, refunds or voiding the card, so every change is on its ledger.");
        }
        if (resolvedData.value !== undefined && resolvedData.value !== item.value) {
          addValidationError("A gift card's value is fixed once it is issued.");
        }
      }
    },
    async afterOperation({ operation, item, context }) {
      if (operation === "create" || operation === "update") {
        const sudoContext = context.sudo();
        const giftCard = await sudoContext.query.GiftCard.findOne({
          where: { id: item.id },
          query: 'carts { id }'
        });
        
        if (giftCard?.carts?.length) {
          for (const cart of giftCard.carts) {
            await sudoContext.query.Cart.updateOne({
              where: { id: cart.id },
              data: {
                paymentCollection: {
                  disconnect: true
                }
              }
            });
          }
        }
      }
    }
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
