import { webhookDeliveryLease } from './delivery-policy';

export async function subscribedWebhookEndpointIds(
  context: any,
  eventType: string,
  userId?: string | null
): Promise<string[]> {
  const scopeFilters: any[] = [{ scope: { equals: 'STORE' } }];
  if (userId) {
    scopeFilters.push({
      scope: { equals: 'USER' },
      user: { id: { equals: userId } },
    });
  }

  const endpoints = await context.query.WebhookEndpoint.findMany({
    where: {
      isActive: { equals: true },
      OR: scopeFilters,
    },
    query: 'id events',
  });
  return endpoints
    .filter(
      (endpoint: any) =>
        Array.isArray(endpoint.events) &&
        (endpoint.events.includes(eventType) || endpoint.events.includes('*'))
    )
    .map((endpoint: any) => endpoint.id);
}

export async function enqueueWebhookOutbox(
  tx: any,
  endpointIds: string[],
  eventType: string,
  resourceType: string,
  resourceId: string,
  data: Record<string, unknown>
): Promise<string[]> {
  const payload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    listKey: resourceType,
    operation: eventType.split('.').pop(),
    data,
  };
  const eventIds: string[] = [];
  for (const endpointId of endpointIds) {
    const event = await tx.webhookEvent.create({
      data: {
        eventType,
        resourceType,
        resourceId,
        payload,
        endpointId,
        delivered: false,
        deliveryAttempts: 0,
        nextAttempt: webhookDeliveryLease(),
      },
      select: { id: true },
    });
    eventIds.push(event.id);
  }
  return eventIds;
}
