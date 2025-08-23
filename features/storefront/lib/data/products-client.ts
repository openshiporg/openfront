"use client";

import { gql } from "graphql-request";
import { openfrontClient } from "../config";

export async function listProducts(params: { 
  categoryId?: string; 
  collectionId?: string; 
  limit?: number;
  offset?: number;
} = {}) {
  const { categoryId, collectionId, limit = 12, offset = 0 } = params;

  const PRODUCTS_QUERY = gql`
    query GetProducts($take: Int!, $skip: Int!, $where: ProductWhereInput) {
      products(take: $take, skip: $skip, where: $where, orderBy: { createdAt: desc }) {
        id
        title
        handle
        description
        thumbnail
        status
        productVariants {
          id
          title
          prices {
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
        productCollections {
          id
          title
        }
        productCategories {
          id
          name
        }
      }
      productsCount(where: $where)
    }
  `;

  let whereClause: any = {};
  
  if (categoryId) {
    whereClause.productCategories = {
      some: { id: { equals: categoryId } }
    };
  }
  
  if (collectionId) {
    whereClause.productCollections = {
      some: { id: { equals: collectionId } }
    };
  }

  try {
    const { products, productsCount } = await openfrontClient.request(
      PRODUCTS_QUERY,
      {
        take: limit,
        skip: offset,
        where: whereClause
      }
    );

    return {
      products: products || [],
      count: productsCount || 0
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [], count: 0 };
  }
}

export async function getProductByHandle(handle: string) {
  const PRODUCT_QUERY = gql`
    query GetProduct($where: ProductWhereUniqueInput!) {
      product(where: $where) {
        id
        title
        handle
        description
        thumbnail
        images {
          id
          url
          alt
        }
        status
        weight
        length
        height
        width
        hsCode
        originCountry
        midCode
        material
        metadata
        productVariants {
          id
          title
          sku
          inventory {
            inventoryItems {
              id
              quantity
            }
          }
          prices {
            id
            amount
            currency {
              code
              symbol
            }
            calculatedPrice {
              calculatedAmount
              originalAmount
              currencyCode
            }
          }
          options {
            id
            value
            optionValue {
              value
              metadata
              option {
                title
              }
            }
          }
        }
        productOptions {
          id
          title
          values {
            id
            value
            metadata
          }
        }
        productCollections {
          id
          title
          handle
        }
        productCategories {
          id
          name
          handle
        }
      }
    }
  `;

  try {
    const { product } = await openfrontClient.request(
      PRODUCT_QUERY,
      {
        where: { handle }
      }
    );

    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function getProductsByCategoryId(categoryId: string, limit = 12) {
  return listProducts({ categoryId, limit });
}