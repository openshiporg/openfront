'use server';

import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

/**
 * Search products with variants for order creation
 */
export async function searchProductsWithVariants(
  search: string = '',
  take: number = 10
) {
  const query = search ? `
    query SearchProducts($search: String!, $take: Int!) {
      products(
        where: {
          OR: [
            { title: { contains: $search, mode: insensitive } }
            { productVariants: { some: { title: { contains: $search, mode: insensitive } } } }
            { productVariants: { some: { sku: { contains: $search, mode: insensitive } } } }
          ]
        }
        take: $take
        orderBy: { createdAt: desc }
      ) {
        id
        title
        thumbnail
        productVariants {
          id
          title
          sku
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
        }
      }
    }
  ` : `
    query GetProducts($take: Int!) {
      products(
        take: $take
        orderBy: { createdAt: desc }
      ) {
        id
        title
        thumbnail
        productVariants {
          id
          title
          sku
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
        }
      }
    }
  `;

  const variables = search ? { search, take } : { take };
  const response = await keystoneClient(query, variables);
  
  return response;
} 