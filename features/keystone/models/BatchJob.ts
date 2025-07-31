
import { list } from '@keystone-6/core';
import { text, select, integer, timestamp, json, relationship } from '@keystone-6/core/fields';
import { trackingFields } from './trackingFields';
import { permissions } from '../access';

export const BatchJob = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadProducts({ session }) ||
        permissions.canManageProducts({ session }),
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts,
    },
  },
  fields: {
    type: select({
      type: 'enum',
      options: [
        { label: 'Product Import', value: 'PRODUCT_IMPORT' },
        { label: 'Order Export', value: 'ORDER_EXPORT' },
        { label: 'Inventory Update', value: 'INVENTORY_UPDATE' },
        { label: 'Price Update', value: 'PRICE_UPDATE' },
      ],
      validation: { isRequired: true },
    }),
    status: select({
      type: 'enum',
      options: [
        { label: 'Created', value: 'CREATED' },
        { label: 'Processing', value: 'PROCESSING' },
        { label: 'Completed', value: 'COMPLETED' },
        { label: 'Failed', value: 'FAILED' },
        { label: 'Canceled', value: 'CANCELED' },
      ],
      defaultValue: 'CREATED',
      validation: { isRequired: true },
    }),
    context: json({
      defaultValue: {},
    }),
    result: json({
      defaultValue: {},
    }),
    error: text(),
    progress: integer({
      defaultValue: 0,
      validation: {
        min: 0,
        max: 100,
      },
    }),
    createdBy: relationship({
      ref: "User.batchJobs",
      many: false,
    }),
    completedAt: timestamp(),
    ...trackingFields,
  },
}); 