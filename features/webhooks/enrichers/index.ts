// Export enricher classes and registry
export { BaseWebhookEnricher } from './base-enricher';
export { OrderWebhookEnricher } from './order-enricher';
export { webhookEnricherRegistry, registerWebhookEnricher } from './registry';

// Auto-register all enrichers
import { OrderWebhookEnricher } from './order-enricher';
import { registerWebhookEnricher } from './registry';

// Register Order enricher
registerWebhookEnricher(new OrderWebhookEnricher());

// Export types
export type { WebhookEnricher, WebhookPayload, EnricherRegistry } from '../types';