import { list, group, graphql } from '@keystone-6/core';
import { 
  text,
  integer,
  select,
  timestamp,
  relationship,
  json,
  virtual
} from '@keystone-6/core/fields';
import { trackingFields } from './trackingFields';
import { permissions } from '../access';

export const Invoice = list({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders,
    },
  },
  fields: {
    // Core invoice data
    user: relationship({
      ref: 'User.invoices',
      many: false,
      validation: { isRequired: true },
    }),
    
    invoiceNumber: text({
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),

    title: text({
      validation: { isRequired: true },
      defaultValue: 'Payment Invoice',
    }),

    description: text({
      ui: { displayMode: 'textarea' },
      defaultValue: 'Invoice for selected orders payment',
    }),

    // Financial fields (amounts in cents)
    totalAmount: integer({
      validation: { isRequired: true },
      defaultValue: 0,
    }),
    
    currency: relationship({
      ref: 'Currency.invoices',
      many: false,
      validation: { isRequired: true },
    }),

    // Status and dates
    status: select({
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Sent', value: 'sent' },
        { label: 'Paid', value: 'paid' },
        { label: 'Overdue', value: 'overdue' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'paid', // Most invoices will be immediately paid
      validation: { isRequired: true },
    }),
    
    dueDate: timestamp(),
    paidAt: timestamp({
      defaultValue: { kind: 'now' }, // Default to now since most are paid immediately
    }),
    
    // Metadata for payment details
    metadata: json({
      defaultValue: {},
    }),

    // Relationships
    account: relationship({
      ref: 'Account.invoices',
      many: false,
      validation: { isRequired: true },
    }),
    
    lineItems: relationship({
      ref: 'InvoiceLineItem.invoice',
      many: true,
    }),

    // Virtual computed fields
    ...group({
      label: 'Computed Fields',
      description: 'Auto-calculated fields for invoice display',
      fields: {
        formattedTotal: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const invoice = await context.sudo().query.Invoice.findOne({
                where: { id: item.id },
                query: `
                  totalAmount
                  currency {
                    code
                    symbol
                    noDivisionCurrency
                  }
                `,
              });

              if (!invoice?.currency) return '$0.00';

              const divisor = invoice.currency.noDivisionCurrency ? 1 : 100;
              const amount = (invoice.totalAmount || 0) / divisor;
              
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: invoice.currency.code,
              }).format(amount);
            },
          }),
        }),

        itemCount: virtual({
          field: graphql.field({
            type: graphql.Int,
            async resolve(item, args, context) {
              const invoice = await context.sudo().query.Invoice.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    id
                  }
                `,
              });

              return invoice?.lineItems?.length || 0;
            },
          }),
        }),
      },
    }),

    ...trackingFields,
  },
  hooks: {
    resolveInput({ operation, resolvedData }) {
      if (operation === 'create' && !resolvedData.invoiceNumber) {
        const timestamp = Date.now();
        resolvedData.invoiceNumber = `INV-${new Date().getFullYear()}-${String(timestamp).slice(-6)}`;
      }
      return resolvedData;
    },
  },
});