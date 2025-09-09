"use client";

import { gql } from "graphql-request";
import { openfrontClient } from "./config";

// Consolidated data functions used by both server prefetch and client useQuery

export async function fetchProducts(params: { 
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

export async function fetchProductByHandle(handle: string) {
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

export async function fetchCart() {
  const CART_QUERY = gql`
    query GetCart {
      cart {
        id
        email
        createdAt
        updatedAt
        completedAt
        metadata
        region {
          id
          name
          currencyCode
          taxRate
        }
        items {
          id
          title
          description
          thumbnail
          quantity
          variant {
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
        }
        paymentSessions {
          id
          providerId
          isInitiated
          status
          data
        }
        customer {
          id
          email
          firstName
          lastName
          phone
        }
        shippingAddress {
          id
          firstName
          lastName
          address1
          address2
          city
          countryCode
          province
          postalCode
          phone
        }
        billingAddress {
          id
          firstName
          lastName
          address1
          address2
          city
          countryCode
          province
          postalCode
          phone
        }
      }
    }
  `;

  try {
    const { cart } = await openfrontClient.request(CART_QUERY);
    return cart;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
}

export async function fetchUser() {
  const USER_QUERY = gql`
    query GetUser {
      user {
        id
        email
        firstName
        lastName
        phone
        billingAddress {
          id
          firstName
          lastName
          address1
          address2
          city
          countryCode
          province
          postalCode
          phone
        }
        orders {
          id
          status
          fulfillmentStatus
          paymentStatus
          displayId
          createdAt
          items {
            id
            title
            description
            thumbnail
            quantity
            variant {
              id
              title
              prices {
                amount
                currency {
                  code
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const { user } = await openfrontClient.request(USER_QUERY);
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function fetchCollections() {
  const COLLECTIONS_QUERY = gql`
    query GetCollections {
      productCollections {
        id
        title
        handle
        metadata
        products {
          id
          title
          handle
          thumbnail
        }
      }
    }
  `;

  try {
    const { productCollections } = await openfrontClient.request(COLLECTIONS_QUERY);
    return productCollections || [];
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

export async function fetchCategories() {
  const CATEGORIES_QUERY = gql`
    query GetCategories {
      productCategories {
        id
        name
        handle
        description
        metadata
        products {
          id
          title
          handle
          thumbnail
        }
      }
    }
  `;

  try {
    const { productCategories } = await openfrontClient.request(CATEGORIES_QUERY);
    return productCategories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}