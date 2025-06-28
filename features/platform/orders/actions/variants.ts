'use server';

import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

/**
 * Search product variants for order creation
 */
export async function searchProductVariants(
  search: string = '',
  take: number = 50
) {
  const query = search ? `
    query SearchVariants($search: String!, $take: Int!) {
      productVariants(
        where: {
          OR: [
            { title: { contains: $search, mode: insensitive } }
            { sku: { contains: $search, mode: insensitive } }
            { product: { title: { contains: $search, mode: insensitive } } }
          ]
        }
        take: $take
        orderBy: { createdAt: desc }
      ) {
        id
        title
        sku
        product {
          id
          title
          thumbnail
        }
        prices {
          id
          amount
          currency {
            code
          }
          calculatedPrice {
            calculatedAmount
            originalAmount
            currencyCode
          }
        }
        inventory {
          quantity
        }
      }
    }
  ` : `
    query GetVariants($take: Int!) {
      productVariants(
        take: $take
        orderBy: { createdAt: desc }
      ) {
        id
        title
        sku
        product {
          id
          title
          thumbnail
        }
        prices {
          id
          amount
          currency {
            code
          }
          calculatedPrice {
            calculatedAmount
            originalAmount
            currencyCode
          }
        }
        inventory {
          quantity
        }
      }
    }
  `;

  const variables = search ? { search, take } : { take };
  const response = await keystoneClient(query, variables);
  
  return response;
} 