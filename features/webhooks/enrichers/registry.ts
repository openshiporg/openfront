import { WebhookEnricher, EnricherRegistry } from '../types';

class WebhookEnricherRegistry implements EnricherRegistry {
  private enrichers = new Map<string, WebhookEnricher>();

  register<T>(entityType: string, enricher: WebhookEnricher<T>): void {
    this.enrichers.set(entityType, enricher);
  }

  get(entityType: string): WebhookEnricher | undefined {
    return this.enrichers.get(entityType);
  }

  has(entityType: string): boolean {
    return this.enrichers.has(entityType);
  }

  /**
   * Get all registered entity types
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.enrichers.keys());
  }
}

// Singleton instance
export const webhookEnricherRegistry = new WebhookEnricherRegistry();

// Helper function to register enrichers
export function registerWebhookEnricher<T>(enricher: WebhookEnricher<T>): void {
  webhookEnricherRegistry.register(enricher.entityType, enricher);
}