import { list, group, graphql } from '@keystone-6/core';
import { 
  text,
  integer,
  select,
  timestamp,
  relationship,
  checkbox,
  json,
  virtual
} from '@keystone-6/core/fields';
import { trackingFields } from './trackingFields';
import { permissions, rules, isSignedIn } from '../access';

export const Account = list({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders,
    },
  },
  fields: {
    // Core account data
    user: relationship({
      ref: 'User.accounts',
      many: false,
      validation: { isRequired: true },
    }),
    
    accountNumber: text({
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),

    title: text({
      validation: { isRequired: true },
      defaultValue: 'Business Account',
    }),

    description: text({
      ui: { displayMode: 'textarea' },
      defaultValue: 'Running business account for automated orders placed through API integration',
    }),

    // Financial fields (amounts in cents)
    totalAmount: integer({
      defaultValue: 0,
    }),
    
    paidAmount: integer({
      defaultValue: 0,
    }),
    
    creditLimit: integer({
      validation: { isRequired: true },
      defaultValue: 100000, // $1000 default
    }),
    
    currency: relationship({
      ref: 'Currency.accounts',
      many: false,
      validation: { isRequired: true },
    }),

    // Status and dates
    status: select({
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Not Approved', value: 'not_approved' },
        { label: 'Paid', value: 'paid' },
        { label: 'Overdue', value: 'overdue' },
      ],
      defaultValue: 'active',
      validation: { isRequired: true },
    }),
    
    dueDate: timestamp(),
    paidAt: timestamp(),
    suspendedAt: timestamp(),
    notApprovedAt: timestamp(),
    
    // Account type
    accountType: select({
      options: [
        { label: 'Business', value: 'business' },
        { label: 'Personal', value: 'personal' },
      ],
      defaultValue: 'business',
      validation: { isRequired: true },
    }),
    
    // Metadata for additional context
    metadata: json({
      defaultValue: {},
    }),

    // Relationships
    orders: relationship({
      ref: 'Order.account',
      many: true,
    }),
    
    lineItems: relationship({
      ref: 'AccountLineItem.account',
      many: true,
    }),
    
    invoices: relationship({
      ref: 'Invoice.account',
      many: true,
    }),

    // Virtual computed fields
    ...group({
      label: 'Computed Fields',
      description: 'Auto-calculated fields for account display',
      fields: {
        balanceDue: virtual({
          field: graphql.field({
            type: graphql.Int,
            resolve(item) {
              return (item.totalAmount || 0) - (item.paidAmount || 0);
            },
          }),
        }),

        formattedTotal: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const account = await context.sudo().query.Account.findOne({
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

              if (!account?.currency) return '$0.00';

              const divisor = account.currency.noDivisionCurrency ? 1 : 100;
              const amount = (account.totalAmount || 0) / divisor;
              
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: account.currency.code,
              }).format(amount);
            },
          }),
        }),

        formattedBalance: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  totalAmount
                  paidAmount
                  currency {
                    code
                    symbol
                    noDivisionCurrency
                  }
                `,
              });

              if (!account?.currency) return '$0.00';

              const divisor = account.currency.noDivisionCurrency ? 1 : 100;
              const balance = ((account.totalAmount || 0) - (account.paidAmount || 0)) / divisor;
              
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: account.currency.code,
              }).format(balance);
            },
          }),
        }),

        formattedCreditLimit: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  creditLimit
                  currency {
                    code
                    symbol
                    noDivisionCurrency
                  }
                `,
              });

              if (!account?.currency) return '$0.00';

              const divisor = account.currency.noDivisionCurrency ? 1 : 100;
              const limit = (account.creditLimit || 0) / divisor;
              
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: account.currency.code,
              }).format(limit);
            },
          }),
        }),

        availableCredit: virtual({
          field: graphql.field({
            type: graphql.Int,
            resolve(item) {
              const used = (item.totalAmount || 0) - (item.paidAmount || 0);
              return Math.max(0, (item.creditLimit || 0) - used);
            },
          }),
        }),

        formattedAvailableCredit: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  totalAmount
                  paidAmount
                  creditLimit
                  currency {
                    code
                    symbol
                    noDivisionCurrency
                  }
                `,
              });

              if (!account?.currency) return '$0.00';

              const divisor = account.currency.noDivisionCurrency ? 1 : 100;
              const used = ((account.totalAmount || 0) - (account.paidAmount || 0)) / divisor;
              const available = Math.max(0, ((account.creditLimit || 0) / divisor) - used);
              
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: account.currency.code,
              }).format(available);
            },
          }),
        }),

        // New currency-aware fields for multi-region support
        totalOwedInAccountCurrency: virtual({
          field: graphql.field({
            type: graphql.Int,
            async resolve(item, args, context) {
              const convertCurrency = (await import('../utils/currencyConversion')).default;
              
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  currency { code }
                `
              });

              if (!account?.currency?.code) return 0;

              const unpaidItems = await context.sudo().query.AccountLineItem.findMany({
                where: { 
                  account: { id: { equals: item.id } },
                  paymentStatus: { equals: 'unpaid' }
                },
                query: `
                  amount
                  region {
                    currency { code }
                  }
                `
              });
              
              let totalInAccountCurrency = 0;
              for (const lineItem of unpaidItems) {
                if (lineItem.region?.currency?.code) {
                  const converted = await convertCurrency(
                    lineItem.amount || 0,
                    lineItem.region.currency.code,
                    account.currency.code
                  );
                  totalInAccountCurrency += converted;
                }
              }
              return totalInAccountCurrency;
            },
          }),
        }),

        availableCreditInAccountCurrency: virtual({
          field: graphql.field({
            type: graphql.Int,
            async resolve(item, args, context) {
              const convertCurrency = (await import('../utils/currencyConversion')).default;
              
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  creditLimit
                  currency { code }
                `
              });

              if (!account?.currency?.code) return 0;

              const unpaidItems = await context.sudo().query.AccountLineItem.findMany({
                where: { 
                  account: { id: { equals: item.id } },
                  paymentStatus: { equals: 'unpaid' }
                },
                query: `
                  amount
                  region {
                    currency { code }
                  }
                `
              });
              
              let totalOwedInAccountCurrency = 0;
              for (const lineItem of unpaidItems) {
                if (lineItem.region?.currency?.code) {
                  const converted = await convertCurrency(
                    lineItem.amount || 0,
                    lineItem.region.currency.code,
                    account.currency.code
                  );
                  totalOwedInAccountCurrency += converted;
                }
              }

              const creditLimit = account.creditLimit || 0;
              return Math.max(0, creditLimit - totalOwedInAccountCurrency);
            },
          }),
        }),

        formattedTotalOwedInAccountCurrency: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const { formatCurrencyAmount } = await import('../utils/currencyConversion');
              
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  currency { code }
                  totalOwedInAccountCurrency
                `
              });

              if (!account?.currency?.code) return '$0.00';

              return formatCurrencyAmount(
                account.totalOwedInAccountCurrency || 0,
                account.currency.code
              );
            },
          }),
        }),

        formattedAvailableCreditInAccountCurrency: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const { formatCurrencyAmount } = await import('../utils/currencyConversion');
              
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  currency { code }
                  availableCreditInAccountCurrency
                `
              });

              if (!account?.currency?.code) return '$0.00';

              return formatCurrencyAmount(
                account.availableCreditInAccountCurrency || 0,
                account.currency.code
              );
            },
          }),
        }),
      },
    }),

    ...trackingFields,
  },
  hooks: {
    resolveInput({ operation, resolvedData }) {
      if (operation === 'create' && !resolvedData.accountNumber) {
        const timestamp = Date.now();
        resolvedData.accountNumber = `ACC-${new Date().getFullYear()}-${String(timestamp).slice(-6)}`;
      }
      return resolvedData;
    },
  },
});