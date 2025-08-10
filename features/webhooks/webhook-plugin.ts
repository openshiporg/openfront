import { BaseListTypeInfo, KeystoneConfig, KeystoneContext } from '@keystone-6/core/types';
import crypto from 'crypto';

// No more hardcoded URLs - we'll query from the database

type WebhookPayload = {
  listKey: string;
  operation: 'create' | 'update' | 'delete';
  item: any;
  originalItem?: any;
  context: KeystoneContext;
};

// Queue for batching webhooks
let webhookQueue: WebhookPayload[] = [];
let batchTimer: NodeJS.Timeout | null = null;

export function withWebhooks<TypeInfo extends BaseListTypeInfo>(
  config: KeystoneConfig<TypeInfo>
): KeystoneConfig<TypeInfo> {
  
  // Apply hooks to ALL lists automatically
  const enhancedLists = Object.fromEntries(
    Object.entries(config.lists || {}).map(([listKey, listConfig]) => [
      listKey,
      {
        ...listConfig,
        hooks: {
          ...listConfig.hooks,
          afterOperation: async (args) => {
            console.log(`🚀 WEBHOOK DEBUG: afterOperation triggered for ${listKey}.${args.operation}`);
            console.log(`🚀 Item ID: ${args.item?.id}`);
            
            try {
              // Call original hook if it exists
              if (listConfig.hooks?.afterOperation) {
                console.log(`🔗 Calling original hook for ${listKey}`);
                await listConfig.hooks.afterOperation(args);
              }
            } catch (error) {
              console.error(`❌ Original hook failed for ${listKey}:`, error);
              // Continue to webhooks even if original fails
            }
            
            try {
              console.log(`📡 Queueing webhook for ${listKey}.${args.operation}`);
              // Trigger webhook for this operation
              await queueWebhook({
                listKey,
                operation: args.operation,
                item: args.item,
                originalItem: args.originalItem,
                context: args.context.sudo()
              });
            } catch (error) {
              // Log but don't throw - webhooks shouldn't break operations
              console.error(`❌ Webhook failed for ${listKey}:`, error);
            }
          }
        }
      }
    ])
  );

  return {
    ...config,
    lists: enhancedLists as any
  };
}

async function queueWebhook(payload: WebhookPayload) {
  console.log(`📥 WEBHOOK DEBUG: Queued webhook for ${payload.listKey}.${payload.operation}`);
  webhookQueue.push(payload);
  
  // Batch webhooks every 100ms for performance
  if (!batchTimer) {
    console.log(`⏰ WEBHOOK DEBUG: Starting batch timer`);
    batchTimer = setTimeout(processBatch, 100);
  }
}

async function processBatch() {
  const batch = [...webhookQueue];
  webhookQueue = [];
  batchTimer = null;

  console.log(`🔄 WEBHOOK DEBUG: Processing batch of ${batch.length} webhooks`);

  if (batch.length === 0) {
    console.log(`⚠️ WEBHOOK DEBUG: Empty batch, nothing to process`);
    return;
  }

  for (const webhook of batch) {
    console.log(`🎯 WEBHOOK DEBUG: Processing ${webhook.listKey}.${webhook.operation}`);
    await triggerWebhook(webhook);
  }
}

async function triggerWebhook({ listKey, operation, item, originalItem, context }: WebhookPayload) {
  try {
    // Convert operation to standard webhook format
    const operationMap = {
      'create': 'created',
      'update': 'updated', 
      'delete': 'deleted'
    };
    const webhookOperation = operationMap[operation] || operation;
    const eventType = `${listKey.toLowerCase()}.${webhookOperation}`;
    
    // 1. Query active webhooks (can't filter by JSON events array in GraphQL)
    const webhooks = await context.query.WebhookEndpoint.findMany({
      where: {
        isActive: { equals: true }
      },
      query: 'id url secret events failureCount'
    });

    if (!webhooks || webhooks.length === 0) {
      console.log(`No active webhooks found for event ${eventType}`);
      return;
    }

    console.log(`Found ${webhooks.length} active webhook(s), checking subscriptions for event ${eventType}`);
    webhooks.forEach(webhook => {
      console.log(`Webhook ${webhook.id}: URL=${webhook.url}, Events=${JSON.stringify(webhook.events)}`);
    });

    // Filter webhooks that are subscribed to this specific event
    const subscribedWebhooks = webhooks.filter(webhook => {
      if (!webhook.events || !Array.isArray(webhook.events)) {
        console.log(`Webhook ${webhook.id} has invalid events array:`, webhook.events);
        return false;
      }
      const isSubscribed = webhook.events.includes(eventType) || webhook.events.includes('*');
      console.log(`Webhook ${webhook.id} subscribed to ${eventType}? ${isSubscribed}`);
      return isSubscribed;
    });

    if (subscribedWebhooks.length === 0) {
      console.log(`No webhooks subscribed to event ${eventType}`);
      return;
    }

    console.log(`Found ${subscribedWebhooks.length} webhook(s) for event ${eventType}`);

    // 2. Format the payload once
    const payload = await formatPayload(listKey, operation, item, originalItem, context);

    // 3. Create WebhookEvent records and deliver webhooks
    for (const webhook of subscribedWebhooks) {
      await deliverWebhook(webhook, eventType, payload, context);
    }

  } catch (error) {
    console.error('Webhook trigger error:', error);
  }
}

async function deliverWebhook(webhook: any, eventType: string, payload: any, context: KeystoneContext) {
  try {
    // Create WebhookEvent record for tracking
    const webhookEvent = await context.query.WebhookEvent.createOne({
      data: {
        eventType,
        resourceType: payload.listKey,
        resourceId: payload.data?.id || 'unknown',
        payload,
        endpoint: { connect: { id: webhook.id } },
        deliveryAttempts: 1,
        nextAttempt: new Date(),
      },
      query: 'id'
    });

    // Create signature for verification
    const secret = webhook.secret || 'default-secret';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    // Log the webhook URL before delivery
    console.log(`🎯 WEBHOOK URL: Attempting to deliver to ${webhook.url}`);
    console.log(`🎯 WEBHOOK PAYLOAD:`, JSON.stringify(payload, null, 2));
    
    // Deliver the webhook
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-OpenFront-Webhook-Signature': `sha256=${signature}`,
        'X-OpenFront-Topic': eventType,
        'X-OpenFront-ListKey': payload.listKey,
        'X-OpenFront-Operation': payload.operation,
        'X-OpenFront-Delivery-ID': webhookEvent.id,
      },
      body: JSON.stringify(payload),
    });

    // Update WebhookEvent with delivery status
    if (response.ok) {
      await context.query.WebhookEvent.updateOne({
        where: { id: webhookEvent.id },
        data: {
          delivered: true,
          responseStatus: response.status,
          responseBody: await response.text(),
          lastAttempt: new Date(),
        }
      });

      // Reset failure count on webhook endpoint if it was failing
      if (webhook.failureCount > 0) {
        await context.query.WebhookEndpoint.updateOne({
          where: { id: webhook.id },
          data: {
            failureCount: 0,
            lastTriggered: new Date(),
          }
        });
      } else {
        await context.query.WebhookEndpoint.updateOne({
          where: { id: webhook.id },
          data: { lastTriggered: new Date() }
        });
      }

      console.log(`✅ Webhook delivered successfully: ${webhook.url} (${response.status})`);
    } else {
      const errorText = await response.text();
      console.error(`❌ Webhook failed with status ${response.status} to URL: ${webhook.url}`);
      console.error(`❌ Response body: ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

  } catch (error) {
    console.error(`❌ Webhook delivery failed: ${webhook.url}`, error);

    // Update WebhookEvent with failure
    try {
      await context.query.WebhookEvent.updateOne({
        where: { id: webhookEvent?.id },
        data: {
          delivered: false,
          responseStatus: error.status || 0,
          responseBody: error.message,
          lastAttempt: new Date(),
          // Schedule retry (exponential backoff)
          nextAttempt: new Date(Date.now() + Math.pow(2, 1) * 60000), // 2 minutes for first retry
        }
      });

      // Increment failure count on webhook endpoint
      await context.query.WebhookEndpoint.updateOne({
        where: { id: webhook.id },
        data: {
          failureCount: (webhook.failureCount || 0) + 1,
        }
      });
    } catch (updateError) {
      console.error('Failed to update webhook event after delivery failure:', updateError);
    }
  }
}

async function formatPayload(
  listKey: string, 
  operation: string, 
  item: any, 
  originalItem: any,
  context: KeystoneContext
): Promise<any> {
  // Format the payload based on the operation
  const basePayload = {
    event: `${listKey.toLowerCase()}.${operation}`,
    timestamp: new Date().toISOString(),
    listKey,
    operation,
  };

  switch (operation) {
    case 'create':
      return {
        ...basePayload,
        data: item,
      };
    
    case 'update':
      return {
        ...basePayload,
        data: item,
        previousData: originalItem,
        changes: getChangedFields(originalItem, item),
      };
    
    case 'delete':
      return {
        ...basePayload,
        data: originalItem,
      };
    
    default:
      return {
        ...basePayload,
        data: item,
      };
  }
}

function getChangedFields(original: any, updated: any): Record<string, { from: any; to: any }> {
  if (!original || !updated) return {};
  
  const changes: Record<string, { from: any; to: any }> = {};
  
  for (const key in updated) {
    if (original[key] !== updated[key]) {
      changes[key] = {
        from: original[key],
        to: updated[key],
      };
    }
  }
  
  return changes;
}

// Export utility to manually trigger webhooks if needed
export async function manualTriggerWebhook(
  context: KeystoneContext,
  listKey: string,
  operation: 'create' | 'update' | 'delete',
  item: any,
  originalItem?: any
) {
  await triggerWebhook({
    listKey,
    operation,
    item,
    originalItem,
    context: context.sudo(),
  });
}