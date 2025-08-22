import { KeystoneContext } from '@keystone-6/core/types';
import { WebhookEnricher } from '../types';

export abstract class BaseWebhookEnricher<T = any> implements WebhookEnricher<T> {
  abstract entityType: string;
  
  abstract enrich(item: T, context: KeystoneContext): Promise<T>;
  
  /**
   * Override this method to define which fields should be queried
   * for this entity type. This is used to build the GraphQL query.
   */
  protected abstract getQueryFields(): string;
  
  /**
   * Helper method to query the entity with enriched data
   */
  protected async queryEnrichedEntity(
    item: T & { id?: string }, 
    context: KeystoneContext
  ): Promise<T | null> {
    if (!item?.id) {
      return item;
    }

    try {
      const result = await context.query[this.entityType].findOne({
        where: { id: item.id },
        query: this.getQueryFields(),
      });
      
      return result || item;
    } catch (error) {
      console.error(`Error querying ${this.entityType} for webhook enrichment:`, error);
      return item;
    }
  }
}