import { list } from '@keystone-6/core';
import {
  checkbox,
  integer,
  json,
  relationship,
  select,
  text,
  timestamp,
} from '@keystone-6/core/fields';
import crypto from 'node:crypto';
import { permissions } from '../access';
import {
  normalizeWebhookEvents,
  normalizeWebhookRegistrationKey,
  normalizeWebhookUrl,
  webhookSubscriptionKey,
} from '../../webhooks/subscriptions';

const CUSTOMER_WEBHOOK_EVENTS = new Set(['fulfillment.created']);

export function isCustomerTokenSession(session: any): boolean {
  return Boolean(session?.customerToken && session?.itemId);
}

export function customerEndpointFilter(session: any) {
  return {
    scope: { equals: 'USER' },
    user: { id: { equals: session.itemId } },
  };
}

function canReadEndpoints({ session }: any): boolean {
  return permissions.canReadWebhooks({ session }) || isCustomerTokenSession(session);
}

function canManageEndpoints({ session }: any): boolean {
  return permissions.canManageWebhooks({ session }) || isCustomerTokenSession(session);
}

function readEndpointFilter({ session }: any) {
  if (permissions.canReadWebhooks({ session })) return true;
  return isCustomerTokenSession(session) ? customerEndpointFilter(session) : false;
}

function manageEndpointFilter({ session }: any) {
  if (permissions.canManageWebhooks({ session })) return true;
  return isCustomerTokenSession(session) ? customerEndpointFilter(session) : false;
}

export function validateCustomerEndpoint(
  urlValue: unknown,
  eventsValue: unknown,
  addValidationError: (message: string) => void
) {
  try {
    normalizeWebhookUrl(urlValue);
  } catch (error) {
    addValidationError(error instanceof Error ? error.message : 'Invalid webhook URL');
  }

  let events: string[] = [];
  try {
    events = normalizeWebhookEvents(eventsValue);
  } catch (error) {
    addValidationError(error instanceof Error ? error.message : 'Invalid webhook events');
  }
  if (events.some((event) => !CUSTOMER_WEBHOOK_EVENTS.has(event))) {
    addValidationError('Customer tokens may subscribe only to fulfillment.created');
  }
}

export const WebhookEndpoint = list({
  access: {
    operation: {
      query: canReadEndpoints,
      create: canManageEndpoints,
      update: canManageEndpoints,
      delete: canManageEndpoints,
    },
    filter: {
      query: readEndpointFilter,
      update: manageEndpointFilter,
      delete: manageEndpointFilter,
    },
  },
  hooks: {
    resolveInput: {
      create: ({ context, resolvedData }) => {
        if (!context.session?.itemId) return resolvedData;
        const scope = isCustomerTokenSession(context.session) ? 'USER' : 'STORE';
        const registrationKey = normalizeWebhookRegistrationKey(
          resolvedData.registrationKey || `manual:${crypto.randomUUID()}`
        );
        return {
          ...resolvedData,
          url: normalizeWebhookUrl(resolvedData.url),
          events: normalizeWebhookEvents(resolvedData.events),
          registrationKey,
          subscriptionKey: webhookSubscriptionKey(
            scope,
            scope === 'USER' ? context.session.itemId : null,
            registrationKey
          ),
          scope,
          user: { connect: { id: context.session.itemId } },
        };
      },
      update: ({ context, resolvedData }) => ({
        ...resolvedData,
        ...(resolvedData.url !== undefined ? { url: normalizeWebhookUrl(resolvedData.url) } : {}),
        ...(resolvedData.events !== undefined
          ? { events: normalizeWebhookEvents(resolvedData.events) }
          : {}),
        ...(isCustomerTokenSession(context.session)
          ? { scope: 'USER', user: { connect: { id: context.session.itemId } } }
          : {}),
      }),
    },
    validateInput: async ({ context, resolvedData, item, addValidationError }) => {
      if (!isCustomerTokenSession(context.session)) return;
      validateCustomerEndpoint(
        resolvedData.url ?? item?.url,
        resolvedData.events ?? item?.events,
        addValidationError
      );
    },
  },
  ui: {
    hideCreate: (args) => !permissions.canManageWebhooks(args),
    hideDelete: (args) => !permissions.canManageWebhooks(args),
    listView: {
      initialColumns: ['url', 'scope', 'isActive', 'events', 'lastTriggered', 'failureCount'],
    },
  },
  fields: {
    url: text({
      validation: { isRequired: true },
      ui: { description: 'The URL where webhook events will be sent' },
    }),
    registrationKey: text({
      db: { isNullable: true },
      access: { read: () => false, create: () => false, update: () => false },
      ui: { itemView: { fieldMode: 'hidden' }, listView: { fieldMode: 'hidden' } },
    }),
    subscriptionKey: text({
      db: { isNullable: true },
      isIndexed: 'unique',
      access: { read: () => false, create: () => false, update: () => false },
      ui: { itemView: { fieldMode: 'hidden' }, listView: { fieldMode: 'hidden' } },
    }),
    events: json({
      defaultValue: [],
      ui: {
        description: 'Events to subscribe to, e.g. ["order.created", "fulfillment.created"]',
      },
    }),
    scope: select({
      options: [
        { label: 'Store', value: 'STORE' },
        { label: 'User', value: 'USER' },
      ],
      defaultValue: 'STORE',
      validation: { isRequired: true },
      access: { create: () => false, update: () => false },
      ui: { itemView: { fieldMode: 'read' } },
    }),
    user: relationship({
      ref: 'User.webhookEndpoints',
      access: { create: () => false, update: () => false },
      ui: { itemView: { fieldMode: 'read' } },
    }),
    isActive: checkbox({
      defaultValue: true,
      ui: { description: 'Whether this webhook endpoint is currently active' },
    }),
    secret: text({
      access: { read: () => false },
      ui: {
        itemView: { fieldMode: 'hidden' },
        description: 'Secret key for webhook signature verification (auto-generated)',
      },
      hooks: {
        resolveInput: ({ resolvedData, operation }) => {
          if (operation === 'create' && !resolvedData.secret) {
            return crypto.randomBytes(32).toString('hex');
          }
          return resolvedData.secret;
        },
      },
    }),
    lastTriggered: timestamp({
      ui: {
        itemView: { fieldMode: 'read' },
        description: 'Last time this webhook was triggered',
      },
    }),
    failureCount: integer({
      defaultValue: 0,
      ui: {
        itemView: { fieldMode: 'read' },
        description: 'Number of consecutive delivery failures',
      },
    }),
    webhookEvents: relationship({
      ref: 'WebhookEvent.endpoint',
      many: true,
      ui: {
        displayMode: 'count',
        description: 'Events sent to this endpoint',
      },
    }),
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      ui: { itemView: { fieldMode: 'read' } },
    }),
    updatedAt: timestamp({
      db: { updatedAt: true },
      ui: { itemView: { fieldMode: 'read' } },
    }),
  },
});
