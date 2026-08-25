import { permissions } from '../access';
import { isCustomerTokenSession } from '../models/WebhookEndpoint';
import {
  normalizeWebhookEvents,
  normalizeWebhookRegistrationKey,
  normalizeWebhookUrl,
  requireWebhookScope,
  webhookSubscriptionKey,
} from '../../webhooks/subscriptions';

const CUSTOMER_WEBHOOK_EVENTS = new Set(['fulfillment.created']);

async function registerWebhookEndpoint(
  _root: unknown,
  {
    registrationKey: registrationKeyInput,
    url: urlInput,
    events: eventsInput,
    secret: secretInput,
    requiredScope: requiredScopeInput,
  }: {
    registrationKey: string;
    url: string;
    events: string[];
    secret: string;
    requiredScope?: string | null;
  },
  context: any
) {
  const session = context.session;
  const customerSession = isCustomerTokenSession(session);
  if (!session?.itemId || (!customerSession && !permissions.canManageWebhooks({ session }))) {
    throw new Error('Webhook management permission required');
  }

  const scope = customerSession ? 'USER' : 'STORE';
  requireWebhookScope(scope, requiredScopeInput);
  const ownerId = customerSession ? session.itemId : null;
  const registrationKey = normalizeWebhookRegistrationKey(registrationKeyInput);
  const subscriptionKey = webhookSubscriptionKey(scope, ownerId, registrationKey);
  const url = normalizeWebhookUrl(urlInput);
  const events = normalizeWebhookEvents(eventsInput);
  const secret = String(secretInput || '').trim();
  if (!secret) throw new Error('Webhook signing secret is required');
  if (customerSession && events.some((event) => !CUSTOMER_WEBHOOK_EVENTS.has(event))) {
    throw new Error('Customer tokens may subscribe only to fulfillment.created');
  }

  const sudo = context.sudo();
  const endpoint = await sudo.prisma.$transaction(async (tx: any) => {
    const saved = await tx.webhookEndpoint.upsert({
      where: { subscriptionKey },
      create: {
        registrationKey,
        subscriptionKey,
        url,
        events,
        scope,
        userId: session.itemId,
        isActive: true,
        secret,
        failureCount: 0,
      },
      update: {
        url,
        events,
        isActive: true,
        secret,
      },
      select: { id: true },
    });

    // Expanded-schema deployments preserve legacy subscriptions. Once their
    // logical replacement is registered, deactivate only same-owner legacy
    // rows so old and new code can overlap without duplicate deliveries.
    await tx.webhookEndpoint.updateMany({
      where: {
        id: { not: saved.id },
        scope,
        url,
        registrationKey: { startsWith: 'legacy:' },
        ...(scope === 'USER' ? { userId: session.itemId } : {}),
      },
      data: { isActive: false },
    });
    return saved;
  });

  return context.db.WebhookEndpoint.findOne({ where: { id: endpoint.id } });
}

export default registerWebhookEndpoint;
