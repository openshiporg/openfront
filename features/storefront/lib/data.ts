import { gql } from "graphql-request";
import { openfrontClient } from "./config";
import { getCartId, getAuthHeaders } from "./data/cookies";

// Simplified data functions for server-side prefetching

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
          }
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

export async function fetchCart() {
  try {
    const cartId = await getCartId();
    if (!cartId) return null;

    const CART_QUERY = gql`
      query GetCart($cartId: ID!) {
        activeCart(cartId: $cartId)
      }
    `;

    const { activeCart } = await openfrontClient.request(
      CART_QUERY,
      { cartId },
      {}
    );

    return activeCart;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
}

export async function fetchUser() {
  try {
    const headers = await getAuthHeaders();
    const { authenticatedItem } = await openfrontClient.request(
      gql`
        query GetAuthenticatedItem {
          authenticatedItem {
            ... on User {
              id
              email
              firstName
              lastName
              phone
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
                country {
                  id
                  iso2
                  name
                }
                phone
              }
            }
          }
        }
      `,
      {},
      headers
    );
    return authenticatedItem;
  } catch (error) {
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
        title
        handle
        isActive
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
