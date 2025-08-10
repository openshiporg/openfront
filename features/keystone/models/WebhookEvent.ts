import { list } from '@keystone-6/core';
import { text, json, checkbox, timestamp, integer, relationship } from '@keystone-6/core/fields';
import { permissions } from '../access';

export const WebhookEvent = list({
  access: {
    operation: {
      query: permissions.canReadWebhooks,
      create: permissions.canManageWebhooks, // Only system should create events
      update: permissions.canManageWebhooks, // Only system should update events
      delete: permissions.canManageWebhooks,
    },
  },
  ui: {
    hideCreate: () => true, // Events should only be created by the system
    hideDelete: args => !permissions.canManageWebhooks(args),
    listView: {
      initialColumns: ['eventType', 'resourceType', 'delivered', 'deliveryAttempts', 'createdAt'],
    },
  },
  fields: {
    eventType: text({ 
      validation: { isRequired: true },
      ui: { description: 'The type of event (e.g., "order.created")' }
    }),
    
    resourceId: text({ 
      validation: { isRequired: true },
      ui: { description: 'ID of the resource that triggered the event' }
    }),
    
    resourceType: text({ 
      validation: { isRequired: true },
      ui: { description: 'Type of resource (e.g., "Order", "Product")' }
    }),
    
    payload: json({
      ui: { 
        description: 'The event payload sent to the webhook',
        itemView: { fieldMode: 'read' }
      }
    }),
    
    deliveryAttempts: integer({ 
      defaultValue: 0,
      ui: { 
        itemView: { fieldMode: 'read' },
        description: 'Number of delivery attempts'
      }
    }),
    
    delivered: checkbox({ 
      defaultValue: false,
      ui: { 
        itemView: { fieldMode: 'read' },
        description: 'Whether the webhook was successfully delivered'
      }
    }),
    
    lastAttempt: timestamp({
      ui: { 
        itemView: { fieldMode: 'read' },
        description: 'Timestamp of the last delivery attempt'
      }
    }),
    
    nextAttempt: timestamp({
      ui: { 
        itemView: { fieldMode: 'read' },
        description: 'Timestamp for the next retry attempt'
      }
    }),
    
    responseStatus: integer({
      ui: { 
        itemView: { fieldMode: 'read' },
        description: 'HTTP status code from the last delivery attempt'
      }
    }),
    
    responseBody: text({
      ui: { 
        itemView: { fieldMode: 'read' },
        displayMode: 'textarea',
        description: 'Response body from the last delivery attempt'
      }
    }),
    
    endpoint: relationship({ 
      ref: 'WebhookEndpoint.webhookEvents',
      ui: { description: 'The webhook endpoint this event was sent to' }
    }),
    
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      ui: { itemView: { fieldMode: 'read' } }
    }),
  },
});