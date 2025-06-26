
import { list } from '@keystone-6/core';
import { relationship, timestamp, select, json } from '@keystone-6/core/fields';
import { trackingFields } from './trackingFields';
import { permissions } from '../access';

export const OrderEvent = list({
  fields: {
    order: relationship({
      ref: 'Order.events',
      many: false,
    }),
    user: relationship({
      ref: 'User.orderEvents',
      many: false,
      hooks: {
        resolveInput({ operation, resolvedData, context }) {
          if (
            (operation === 'create' || operation === 'update') &&
            !resolvedData.user &&
            context.session?.itemId
          ) {
            return { connect: { id: context.session.itemId } };
          }
          return resolvedData.user;
        },
      },
    }),
    type: select({
      type: 'enum',
      options: [
        { label: 'Order Placed', value: 'ORDER_PLACED' },
        { label: 'Status Change', value: 'STATUS_CHANGE' },
        { label: 'Payment Status Change', value: 'PAYMENT_STATUS_CHANGE' },
        { label: 'Payment Captured', value: 'PAYMENT_CAPTURED' },
        { label: 'Fulfillment Status Change', value: 'FULFILLMENT_STATUS_CHANGE' },
        { label: 'Note Added', value: 'NOTE_ADDED' },
        { label: 'Email Sent', value: 'EMAIL_SENT' },
        { label: 'Tracking Number Added', value: 'TRACKING_NUMBER_ADDED' },
        { label: 'Return Requested', value: 'RETURN_REQUESTED' },
        { label: 'Refund Processed', value: 'REFUND_PROCESSED' },
      ],
      validation: { isRequired: true },
      defaultValue: 'STATUS_CHANGE',
    }),
    data: json({
      defaultValue: {},
    }),
    time: timestamp({
      defaultValue: { kind: 'now' },
    }),
    createdBy: relationship({
      ref: 'User',
      many: false,
      ui: {
        displayMode: 'select',
        labelField: 'email',
      },
      hooks: {
        resolveInput({ operation, resolvedData, context }) {
          if (
            (operation === 'create' || operation === 'update') &&
            !resolvedData.createdBy &&
            context.session?.itemId
          ) {
            return { connect: { id: context.session.itemId } };
          }
          return resolvedData.createdBy;
        },
      },
    }),
    ...trackingFields,
  },
  ui: {
    listView: {
      initialColumns: ['order', 'type', 'time', 'createdBy'],
      initialSort: { field: 'time', direction: 'DESC' },
    },
  },
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders,
    },
  },
}); 