import { KeystoneContext } from '@keystone-6/core/types';
import { BaseWebhookEnricher } from './base-enricher';

interface OrderItem {
  id: string;
  [key: string]: any;
}

export class OrderWebhookEnricher extends BaseWebhookEnricher<OrderItem> {
  entityType = 'Order';

  async enrich(item: OrderItem, context: KeystoneContext): Promise<OrderItem> {
    const enrichedItem = await this.queryEnrichedEntity(item, context);
    return enrichedItem || item;
  }

  protected getQueryFields(): string {
    return `
      id
      displayId
      email
      status
      rawTotal
      total
      subtotal
      shipping
      discount
      tax
      canceledAt
      metadata
      idempotencyKey
      noNotification
      externalId
      currency {
        id
        code
        symbol
        noDivisionCurrency
      }
      shippingAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        phone
        country {
          id
          iso2
          displayName
        }
      }
      billingAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        phone
        country {
          id
          iso2
          displayName
        }
      }
      lineItems {
        id
        title
        quantity
        sku
        variantTitle
        thumbnail
        formattedUnitPrice
        formattedTotal
        moneyAmount {
          amount
          originalAmount
        }
        productVariant {
          id
          title
          sku
          product {
            id
            title
            handle
            thumbnail
            productImages {
              image {
                url
              }
              imagePath
            }
          }
        }
        productData
        variantData
      }
      createdAt
      updatedAt
    `;
  }
}