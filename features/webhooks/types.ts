import { KeystoneContext } from '@keystone-6/core/types';

export interface WebhookEnricher<T = any> {
  entityType: string;
  enrich(item: T, context: KeystoneContext): Promise<T>;
}

export interface WebhookPayload {
  event: string;
  timestamp: string;
  listKey: string;
  operation: string;
  data: any;
  previousData?: any;
  changes?: Record<string, { from: any; to: any }>;
}

export interface EnricherRegistry {
  register<T>(entityType: string, enricher: WebhookEnricher<T>): void;
  get(entityType: string): WebhookEnricher | undefined;
  has(entityType: string): boolean;
}