import { graphql, list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  checkbox,
  integer,
  json,
  float,
  select,
  text,
  timestamp,
  relationship,
  virtual,
} from "@keystone-6/core/fields";
import { trackingFields } from "./trackingFields";
import { permissions } from "../access";

const formatCurrency = (amount, currencyCode) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
};

export const Order = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadOrders({ session }) ||
        permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders,
    },
  },
  fields: {
    status: select({
      type: "enum",
      options: [
        {
          label: "Pending",
          value: "pending",
        },
        {
          label: "Completed",
          value: "completed",
        },
        {
          label: "Archived",
          value: "archived",
        },
        {
          label: "Canceled",
          value: "canceled",
        },
        {
          label: "Requires Action",
          value: "requires_action",
        },
      ],
      defaultValue: "pending",
      validation: {
        isRequired: true,
      },
    }),
    fulfillmentStatus: select({
      type: "enum",
      options: [
        {
          label: "Not Fulfilled",
          value: "not_fulfilled",
        },
        {
          label: "Partially Fulfilled",
          value: "partially_fulfilled",
        },
        {
          label: "Fulfilled",
          value: "fulfilled",
        },
        {
          label: "Partially Shipped",
          value: "partially_shipped",
        },
        {
          label: "Shipped",
          value: "shipped",
        },
        {
          label: "Partially Returned",
          value: "partially_returned",
        },
        {
          label: "Returned",
          value: "returned",
        },
        {
          label: "Canceled",
          value: "canceled",
        },
        {
          label: "Requires Action",
          value: "requires_action",
        },
      ],
      defaultValue: "not_fulfilled",
      validation: {
        isRequired: true,
      },
    }),
    paymentStatus: select({
      type: "enum",
      options: [
        {
          label: "Not Paid",
          value: "not_paid",
        },
        {
          label: "Awaiting",
          value: "awaiting",
        },
        {
          label: "Captured",
          value: "captured",
        },
        {
          label: "Partially Refunded",
          value: "partially_refunded",
        },
        {
          label: "Refunded",
          value: "refunded",
        },
        {
          label: "Canceled",
          value: "canceled",
        },
        {
          label: "Requires Action",
          value: "requires_action",
        },
      ],
      defaultValue: "not_paid",
      validation: {
        isRequired: true,
      },
    }),
    displayId: integer({
      validation: {
        isRequired: true,
      },
    }),
    email: text({
      validation: {
        isRequired: true,
      },
    }),
    taxRate: float(),
    canceledAt: timestamp(),
    metadata: json(),
    idempotencyKey: text(),
    noNotification: checkbox(),
    externalId: text(),
    shippingAddress: relationship({
      ref: "Address.ordersUsingAsShippingAddress",
      many: false,
    }),
    billingAddress: relationship({
      ref: "Address.ordersUsingAsBillingAddress",
      many: false,
    }),
    currency: relationship({
      ref: "Currency.orders",
    }),
    draftOrder: relationship({
      ref: "DraftOrder.order",
    }),
    cart: relationship({
      ref: "Cart.order",
    }),
    user: relationship({
      ref: "User.orders",
    }),
    region: relationship({
      ref: "Region.orders",
    }),
    claimOrders: relationship({
      ref: "ClaimOrder.order",
      many: true,
    }),
    fulfillments: relationship({
      ref: "Fulfillment.order",
      many: true,
    }),
    giftCards: relationship({
      ref: "GiftCard.order",
      many: true,
    }),
    giftCardTransactions: relationship({
      ref: "GiftCardTransaction.order",
      many: true,
    }),
    lineItems: relationship({
      ref: "LineItem.order",
      many: true,
    }),
    discounts: relationship({
      ref: "Discount.orders",
      many: true,
    }),
    payments: relationship({
      ref: "Payment.order",
      many: true,
    }),
    returns: relationship({
      ref: "Return.order",
      many: true,
    }),
    shippingMethods: relationship({
      ref: "ShippingMethod.order",
      many: true,
    }),
    swaps: relationship({
      ref: "Swap.order",
      many: true,
    }),
    ...trackingFields,

    total: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item, args, context) {
          const sudoContext = context.sudo();
          
          const order = await sudoContext.query.Order.findOne({
            where: { id: item.id },
            query: `
              lineItems {
                id
                quantity
                unitPrice
              }
              discounts {
                id
                discountRule {
                  type
                  value
                }
              }
              currency {
                code
                noDivisionCurrency
              }
              taxRate
              shippingMethods {
                price
              }
            `
          });

          if (!order?.lineItems?.length) return null;

          // Calculate subtotal
          const subtotal = order.lineItems.reduce((sum, item) => 
            sum + (item.unitPrice * item.quantity), 0);

          // Calculate discounts
          let discountAmount = 0;
          if (order.discounts?.length) {
            for (const discount of order.discounts) {
              if (discount.discountRule.type === 'percentage') {
                discountAmount += subtotal * (discount.discountRule.value / 100);
              } else if (discount.discountRule.type === 'fixed') {
                discountAmount += discount.discountRule.value;
              }
            }
          }

          // Add shipping
          const shipping = order.shippingMethods?.reduce((sum, method) => 
            sum + (method.price || 0), 0) || 0;

          // Calculate tax on discounted amount
          const taxableAmount = subtotal - discountAmount + shipping;
          const tax = taxableAmount * (order.taxRate || 0);

          // Calculate final total
          const total = taxableAmount + tax;

          const currencyCode = order.currency?.code || 'USD';
          const divisor = order.currency?.noDivisionCurrency ? 1 : 100;

          // Format currency inline
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode
          }).format(total / divisor);
        }
      })
    }),
  },
});
