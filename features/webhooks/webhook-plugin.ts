import { BaseKeystoneTypeInfo, KeystoneConfig, KeystoneContext } from '@keystone-6/core/types';
import crypto from 'crypto';
import { webhookEnricherRegistry } from './enrichers';
import {
  nextWebhookAttempt,
  WEBHOOK_DELIVERY_MAX_ATTEMPTS,
  WEBHOOK_DELIVERY_TIMEOUT_MS,
  webhookDeliveryLease,
} from './delivery-policy';

// No more hardcoded URLs - we'll query from the database

type WebhookPayload = {
  listKey: string;
  operation: 'create' | 'update' | 'delete';
  item: any;
  originalItem?: any;
  context: KeystoneContext;
};

const WEBHOOK_INTERNAL_LISTS = new Set(['WebhookEndpoint', 'WebhookEvent']);

export function isWebhookInternalList(listKey: string): boolean {
  return WEBHOOK_INTERNAL_LISTS.has(listKey);
}

export function withWebhooks<TypeInfo extends BaseKeystoneTypeInfo>(
  config: KeystoneConfig<TypeInfo>
): KeystoneConfig<TypeInfo> {
  
  // Apply hooks to ALL lists automatically
  const enhancedLists = Object.fromEntries(
    Object.entries(config.lists || {}).map(([listKey, listConfig]) => {
      if (isWebhookInternalList(listKey)) return [listKey, listConfig];

      return [
        listKey,
        {
          ...listConfig,
          hooks: {
            ...listConfig.hooks,
            afterOperation: async (args: any) => {
              // Preserve the original lifecycle contract; business hook failures
              // are never swallowed by integration plumbing.
              const originalAfterOperation = listConfig.hooks?.afterOperation as any;
              if (typeof originalAfterOperation === 'function') {
                await originalAfterOperation(args);
              } else if (originalAfterOperation?.[args.operation]) {
                await originalAfterOperation[args.operation](args);
              }

              try {
                // Delivery intent is persisted before the network request.
                await triggerWebhook({
                  listKey,
                  operation: args.operation,
                  item: args.item,
                  originalItem: args.originalItem,
                  context: args.context.sudo()
                });
              } catch (error) {
                console.error(`Webhook enqueue failed for ${listKey}:`, error);
              }
            }
          }
        }
      ];
    })
  );

  return {
    ...config,
    lists: enhancedLists as any
  };
}

async function triggerWebhook({ listKey, operation, item, originalItem, context }: WebhookPayload) {
  // Defense in depth: internal delivery bookkeeping must never publish events,
  // including through wildcard subscriptions or manual triggers.
  if (isWebhookInternalList(listKey)) return;

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
        isActive: { equals: true },
        scope: { equals: 'STORE' },
      },
      query: 'id url secret events failureCount'
    });

    if (!webhooks || webhooks.length === 0) {
      return;
    }

    // Filter webhooks that are subscribed to this specific event
    const subscribedWebhooks = webhooks.filter(webhook => {
      if (!webhook.events || !Array.isArray(webhook.events)) {
        return false;
      }
      return webhook.events.includes(eventType) || webhook.events.includes('*');
    });

    if (subscribedWebhooks.length === 0) {
      return;
    }

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

async function deliverWebhook(
  webhook: any,
  eventType: string,
  payload: any,
  context: KeystoneContext,
  existingEvent?: any
) {
  let webhookEvent = existingEvent;
  try {
    if (!webhookEvent) {
      webhookEvent = await context.query.WebhookEvent.createOne({
        data: {
          eventType,
          resourceType: payload.listKey,
          resourceId: payload.data?.id || 'unknown',
          payload,
          endpoint: { connect: { id: webhook.id } },
          deliveryAttempts: 0,
          nextAttempt: webhookDeliveryLease(),
        },
        query: 'id deliveryAttempts'
      });
    }
    await context.query.WebhookEvent.updateOne({
      where: { id: webhookEvent.id },
      data: { deliveryAttempts: (webhookEvent.deliveryAttempts || 0) + 1, lastAttempt: new Date() },
    });

    // Create signature for verification
    if (!webhook.secret) {
      throw new Error('Webhook endpoint secret is required');
    }
    const secret = webhook.secret;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    // Log the webhook URL before delivery
    
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
      signal: AbortSignal.timeout(WEBHOOK_DELIVERY_TIMEOUT_MS),
    });

    // Update WebhookEvent with delivery status
    if (response.ok) {
      const responseBody = (await response.text()).slice(0, 64_000);
      await context.query.WebhookEvent.updateOne({
        where: { id: webhookEvent.id },
        data: {
          delivered: true,
          responseStatus: response.status,
          responseBody,
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

    } else {
      const errorText = (await response.text()).slice(0, 64_000);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

  } catch (error) {
    try {
      const attempts = Number(webhookEvent?.deliveryAttempts || 0) + 1;
      const nextAttempt = nextWebhookAttempt(attempts);
      await context.query.WebhookEvent.updateOne({
        where: { id: webhookEvent?.id },
        data: {
          delivered: false,
          responseStatus: 0,
          responseBody: error instanceof Error ? error.message : String(error),
          lastAttempt: new Date(),
          nextAttempt,
          ...(nextAttempt ? {} : { deadLetteredAt: new Date() }),
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

  // Check if we have an enricher registered for this entity type
  let enrichedData = item;
  if (webhookEnricherRegistry.has(listKey) && item?.id) {
    try {
      const enricher = webhookEnricherRegistry.get(listKey);
      if (enricher) {
        enrichedData = await enricher.enrich(item, context);
      }
    } catch (error) {
      console.error(`Error enriching webhook payload for ${listKey}:`, error);
      // Fall back to original item if enrichment fails
      enrichedData = item;
    }
  }

  switch (operation) {
    case 'create':
      return {
        ...basePayload,
        data: enrichedData || item,
      };
    
    case 'update':
      return {
        ...basePayload,
        data: enrichedData || item,
        previousData: originalItem,
        changes: getChangedFields(originalItem, enrichedData || item),
      };
    
    case 'delete':
      return {
        ...basePayload,
        data: originalItem,
      };
    
    default:
      return {
        ...basePayload,
        data: enrichedData || item,
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

export async function deliverWebhookEventsById(
  context: KeystoneContext,
  eventIds: string[]
) {
  const uniqueEventIds = [...new Set(eventIds.filter(Boolean))];
  for (const eventId of uniqueEventIds) {
    const event = await context.sudo().query.WebhookEvent.findOne({
      where: { id: eventId },
      query: `
        id eventType payload deliveryAttempts delivered
        endpoint { id url secret failureCount }
      `,
    });
    if (!event || event.delivered || !event.endpoint) continue;
    await deliverWebhook(
      event.endpoint,
      event.eventType,
      event.payload,
      context.sudo(),
      event
    );
  }
  return uniqueEventIds.length;
}

export async function retryPendingWebhookDeliveries(
  context: KeystoneContext,
  limit = 25
) {
  const boundedLimit = Math.max(1, Math.min(limit, 100));
  const sudo = context.sudo();
  const now = new Date();
  const candidates = await sudo.prisma.webhookEvent.findMany({
    where: {
      delivered: false,
      deadLetteredAt: null,
      nextAttempt: { lte: now },
      deliveryAttempts: { lt: WEBHOOK_DELIVERY_MAX_ATTEMPTS },
      endpointId: { not: null },
    },
    orderBy: { nextAttempt: 'asc' },
    take: boundedLimit,
    select: { id: true },
  });

  let claimed = 0;
  for (const candidate of candidates) {
    const claim = await sudo.prisma.webhookEvent.updateMany({
      where: {
        id: candidate.id,
        delivered: false,
        deadLetteredAt: null,
        nextAttempt: { lte: now },
        deliveryAttempts: { lt: WEBHOOK_DELIVERY_MAX_ATTEMPTS },
      },
      data: { nextAttempt: webhookDeliveryLease() },
    });
    if (claim.count !== 1) continue;

    const event = await sudo.query.WebhookEvent.findOne({
      where: { id: candidate.id },
      query: `
        id eventType payload deliveryAttempts
        endpoint { id url secret failureCount }
      `,
    });
    if (!event?.endpoint) continue;
    claimed += 1;
    await deliverWebhook(event.endpoint, event.eventType, event.payload, sudo, event);
  }
  return claimed;
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