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

        // Proper current balance calculated from unpaid line items (same logic as unpaidLineItemsByRegion)
        formattedCurrentBalance: virtual({
          field: graphql.field({
            type: graphql.String,
            async resolve(item, args, context) {
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  currency {
                    code
                    symbol
                    noDivisionCurrency
                  }
                `,
              });

              if (!account?.currency) return '$0.00';

              // Get all unpaid line items (same logic as unpaidLineItemsByRegion)
              const unpaidLineItems = await context.sudo().query.AccountLineItem.findMany({
                where: {
                  account: { id: { equals: item.id } },
                  paymentStatus: { equals: 'unpaid' }
                },
                query: `
                  amount
                  region {
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `
              });

              if (unpaidLineItems.length === 0) {
                return '$0.00';
              }

              // Sum all unpaid amounts in the account's currency
              let totalUnpaidAmount = 0;
              for (const lineItem of unpaidLineItems) {
                // For now, assume same currency. TODO: Add currency conversion if needed
                totalUnpaidAmount += (lineItem.amount || 0);
              }

              const divisor = account.currency.noDivisionCurrency ? 1 : 100;
              const balance = totalUnpaidAmount / divisor;
              
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: account.currency.code,
              }).format(balance);
            },
          }),
        }),

        unpaidLineItemsByRegion: virtual({
          field: graphql.field({
            type: graphql.JSON,
            async resolve(item, args, context) {
              // Get all unpaid line items with region information
              const unpaidLineItems = await context.sudo().query.AccountLineItem.findMany({
                where: {
                  account: { id: { equals: item.id } },
                  paymentStatus: { equals: 'unpaid' }
                },
                query: `
                  id
                  amount
                  description
                  orderDisplayId
                  itemCount
                  createdAt
                  formattedAmount
                  region {
                    id
                    name
                    currency {
                      id
                      code
                      symbol
                      noDivisionCurrency
                    }
                  }
                `,
                orderBy: { createdAt: 'desc' }
              });

              if (unpaidLineItems.length === 0) {
                return {
                  success: true,
                  regions: [],
                  totalRegions: 0,
                  totalUnpaidItems: 0,
                  message: 'No unpaid items found'
                };
              }

              // Group line items by region
              const lineItemsByRegion = unpaidLineItems.reduce((acc, item) => {
                const regionId = item.region.id;
                const regionName = item.region.name;
                const currency = item.region.currency;

                if (!acc[regionId]) {
                  acc[regionId] = {
                    region: {
                      id: regionId,
                      name: regionName,
                      currency: currency
                    },
                    lineItems: [],
                    totalAmount: 0,
                    itemCount: 0 // This will count unique orders
                  };
                }

                acc[regionId].lineItems.push({
                  id: item.id,
                  amount: item.amount,
                  description: item.description,
                  orderDisplayId: item.orderDisplayId,
                  itemCount: item.itemCount,
                  createdAt: item.createdAt,
                  formattedAmount: item.formattedAmount
                });

                acc[regionId].totalAmount += (item.amount || 0);
                acc[regionId].itemCount += 1; // Count orders (AccountLineItems), not products

                return acc;
              }, {});

              // Convert to array and add formatted totals
              const regionsWithLineItems = Object.values(lineItemsByRegion).map(regionData => {
                const divisor = regionData.region.currency.noDivisionCurrency ? 1 : 100;
                const formattedTotal = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: regionData.region.currency.code,
                }).format(regionData.totalAmount / divisor);

                return {
                  ...regionData,
                  formattedTotalAmount: formattedTotal
                };
              });

              // Sort regions by total amount descending
              regionsWithLineItems.sort((a, b) => b.totalAmount - a.totalAmount);

              return {
                success: true,
                regions: regionsWithLineItems,
                totalRegions: regionsWithLineItems.length,
                totalUnpaidItems: unpaidLineItems.length,
                message: `Found ${unpaidLineItems.length} unpaid orders across ${regionsWithLineItems.length} regions`
              };
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