import { list, group, graphql } from '@keystone-6/core';
import { 
  text,
  integer,
  relationship,
  virtual,
  select
} from '@keystone-6/core/fields';
import { trackingFields } from './trackingFields';
import { permissions, isSignedIn } from '../access';

export const AccountLineItem = list({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders,
    },
  },
  fields: {
    // Core relationships
    account: relationship({
      ref: 'Account.lineItems',
      many: false,
      validation: { isRequired: true },
    }),
    
    order: relationship({
      ref: 'Order.accountLineItems',
      many: false,
      validation: { isRequired: true },
    }),

    region: relationship({
      ref: 'Region.accountLineItems',
      many: false,
    }),

    // Line item details
    description: text({
      validation: { isRequired: true },
      defaultValue: 'Order line item',
    }),
    
    amount: integer({
      validation: { isRequired: true },
      label: 'Amount (in cents)',
    }),
    
    orderDisplayId: text({
      validation: { isRequired: true },
      isIndexed: true,
    }),
    
    itemCount: integer({
      validation: { isRequired: true },
      defaultValue: 0,
    }),
    
    paymentStatus: select({
      options: [
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Paid', value: 'paid' },
      ],
      defaultValue: 'unpaid',
      validation: { isRequired: true },
    }),
    
    // Junction relationship to track which invoices paid this item
    invoiceLineItems: relationship({
      ref: 'InvoiceLineItem.accountLineItem',
      many: true,
    }),

    // Virtual computed fields
    ...group({
      label: 'Computed Fields',
      description: 'Auto-calculated fields for line item display',
      fields: {
        formattedAmount: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const lineItem = await context.sudo().query.AccountLineItem.findOne({
                where: { id: item.id },
                query: `
                  amount
                  account {
                    currency {
                      code
                      symbol
                      noDivisionCurrency
                    }
                  }
                `,
              });

              if (!lineItem?.account?.currency) return '$0.00';

              const divisor = lineItem.account.currency.noDivisionCurrency ? 1 : 100;
              const amount = (lineItem.amount || 0) / divisor;
              
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: lineItem.account.currency.code,
              }).format(amount);
            },
          }),
        }),

        orderDetails: virtual({
          field: graphql.field({
            type: graphql.JSON,
            async resolve(item, args, context) {
              const lineItem = await context.sudo().query.AccountLineItem.findOne({
                where: { id: item.id },
                query: `
                  order {
                    id
                    displayId
                    status
                    email
                    createdAt
                    total
                    subtotal
                    shipping
                    tax
                    lineItems {
                      id
                      title
                      quantity
                      sku
                      variantTitle
                      formattedUnitPrice
                      formattedTotal
                      thumbnail
                    }
                  }
                `,
              });

              return lineItem?.order || null;
            },
          }),
        }),

        paidAt: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              // Get paidAt from invoice through relationships:
              // AccountLineItem -> InvoiceLineItem -> Invoice -> paidAt
              try {
                const lineItem = await context.sudo().query.AccountLineItem.findOne({
                  where: { id: item.id },
                  query: `
                    paymentStatus
                    invoiceLineItems {
                      invoice {
                        paidAt
                        status
                      }
                    }
                  `,
                });

                // Only return paidAt if the account line item is actually paid
                if (lineItem?.paymentStatus !== 'paid') {
                  return null;
                }

                // Get the most recent paidAt from associated invoices
                const paidInvoices = lineItem?.invoiceLineItems
                  ?.map(ili => ili.invoice)
                  ?.filter(invoice => invoice?.status === 'paid' && invoice?.paidAt);

                if (paidInvoices && paidInvoices.length > 0) {
                  // Return the most recent paidAt date
                  const mostRecentPaidAt = paidInvoices
                    .map(inv => new Date(inv.paidAt))
                    .sort((a, b) => b.getTime() - a.getTime())[0];
                  
                  return mostRecentPaidAt.toISOString();
                }

                return null;
              } catch (error) {
                console.error('Error resolving AccountLineItem paidAt:', error);
                return null;
              }
            },
          }),
        }),
      },
    }),

    ...trackingFields,
  },
  
  hooks: {
    resolveInput: async ({ resolvedData, context, operation }) => {
      if (operation === 'create') {
        // Auto-populate description and amount from order if not provided
        if (resolvedData.order?.connect?.id && (!resolvedData.description || !resolvedData.amount)) {
          const order = await context.sudo().query.Order.findOne({
            where: { id: resolvedData.order.connect.id },
            query: `
              displayId
              rawTotal
              lineItems {
                id
              }
            `,
          });

          if (order) {
            return {
              ...resolvedData,
              description: resolvedData.description || `Order #${order.displayId} - ${order.lineItems?.length || 0} items`,
              amount: resolvedData.amount || order.rawTotal || 0,
              orderDisplayId: resolvedData.orderDisplayId || order.displayId,
              itemCount: resolvedData.itemCount || order.lineItems?.length || 0,
            };
          }
        }
      }
        
      return resolvedData;
    },
  },
});