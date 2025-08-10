import { list } from '@keystone-6/core';
import { text, json, checkbox, timestamp, integer, relationship } from '@keystone-6/core/fields';
import { permissions } from '../access';
import crypto from 'crypto';

export const WebhookEndpoint = list({
  access: {
    operation: {
      query: permissions.canReadWebhooks,
      create: permissions.canManageWebhooks,
      update: permissions.canManageWebhooks,
      delete: permissions.canManageWebhooks,
    },
  },
  ui: {
    hideCreate: args => !permissions.canManageWebhooks(args),
    hideDelete: args => !permissions.canManageWebhooks(args),
    listView: {
      initialColumns: ['url', 'isActive', 'events', 'lastTriggered', 'failureCount'],
    },
  },
  fields: {
    url: text({ 
      validation: { isRequired: true },
      ui: { description: 'The URL where webhook events will be sent' }
    }),
    
    events: json({ 
      defaultValue: [],
      ui: { 
        description: 'Events to subscribe to, e.g., ["order.created", "product.updated", "cart.completed"]' 
      }
    }),
    
    isActive: checkbox({ 
      defaultValue: true,
      ui: { description: 'Whether this webhook endpoint is currently active' }
    }),
    
    secret: text({ 
      ui: { 
        itemView: { fieldMode: 'hidden' },
        description: 'Secret key for webhook signature verification (auto-generated)'
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
        description: 'Last time this webhook was triggered'
      }
    }),
    
    failureCount: integer({ 
      defaultValue: 0,
      ui: { 
        itemView: { fieldMode: 'read' },
        description: 'Number of consecutive delivery failures'
      }
    }),
    
    // Removed user relationship - webhooks are system-wide based on permissions

    webhookEvents: relationship({
      ref: 'WebhookEvent.endpoint',
      many: true,
      ui: { 
        displayMode: 'count',
        description: 'Events sent to this endpoint'
      }
    }),
    
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      ui: { itemView: { fieldMode: 'read' } }
    }),
    
    updatedAt: timestamp({
      db: { updatedAt: true },
      ui: { itemView: { fieldMode: 'read' } }
    }),
  },
});