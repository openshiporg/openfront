
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  json,
  integer,
  relationship,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const ShippingMethod = list({
  access: {
    operation: {
      // Allow public read access
      query: () => true,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders,
    },
  },
  hooks: {
    async afterOperation({ operation, item, context }) {
      if (operation === "create" || operation === "update") {
        const sudoContext = context.sudo();
        const shippingMethod = await sudoContext.query.ShippingMethod.findOne({
          where: { id: item.id },
          query: 'cart { id }'
        });
        
        if (shippingMethod?.cart?.id) {
          await sudoContext.query.Cart.updateOne({
            where: { id: shippingMethod.cart.id },
            data: {
              paymentCollection: {
                disconnect: true
              }
            }
          });
        }
      }
    }
  },
  fields: {
    price: integer({
      validation: {
        isRequired: true,
      },
    }),
    data: json(),
    return: relationship({
      ref: "Return.shippingMethod",
    }),
    order: relationship({
      ref: "Order.shippingMethods",
    }),
    claimOrder: relationship({
      ref: "ClaimOrder.shippingMethods",
    }),
    cart: relationship({
      ref: "Cart.shippingMethods",
    }),
    swap: relationship({
      ref: "Swap.shippingMethods",
    }),
    shippingOption: relationship({
      ref: "ShippingOption.shippingMethods",
    }),
    shippingMethodTaxLines: relationship({
      ref: "ShippingMethodTaxLine.shippingMethod",
      many: true,
    }),
    ...trackingFields
  },
});
