import { list, group, graphql } from '@keystone-6/core';
import { 
  relationship,
  virtual
} from '@keystone-6/core/fields';
import { trackingFields } from './trackingFields';
import { permissions } from '../access';

export const InvoiceLineItem = list({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders,
    },
  },
  fields: {
    // Junction table relationships
    invoice: relationship({
      ref: 'Invoice.lineItems',
      many: false,
      validation: { isRequired: true },
    }),
    
    accountLineItem: relationship({
      ref: 'AccountLineItem.invoiceLineItems',
      many: false,
      validation: { isRequired: true },
    }),

    // Virtual computed fields
    ...group({
      label: 'Computed Fields',
      description: 'Auto-calculated fields from related account line item',
      fields: {
        orderDisplayId: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const invoiceLineItem = await context.sudo().query.InvoiceLineItem.findOne({
                where: { id: item.id },
                query: `
                  accountLineItem {
                    orderDisplayId
                  }
                `,
              });

              return invoiceLineItem?.accountLineItem?.orderDisplayId || '';
            },
          }),
        }),

        formattedAmount: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const invoiceLineItem = await context.sudo().query.InvoiceLineItem.findOne({
                where: { id: item.id },
                query: `
                  accountLineItem {
                    formattedAmount
                  }
                `,
              });

              return invoiceLineItem?.accountLineItem?.formattedAmount || '$0.00';
            },
          }),
        }),

        orderDetails: virtual({
          field: graphql.field({
            type: graphql.JSON,
            async resolve(item, args, context) {
              const invoiceLineItem = await context.sudo().query.InvoiceLineItem.findOne({
                where: { id: item.id },
                query: `
                  accountLineItem {
                    orderDetails
                  }
                `,
              });

              return invoiceLineItem?.accountLineItem?.orderDetails || null;
            },
          }),
        }),
      },
    }),

    ...trackingFields,
  },
});