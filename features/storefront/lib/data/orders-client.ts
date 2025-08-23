"use client";

import { gql } from "graphql-request";
import { openfrontClient } from "../config";

// Order queries
const ORDER_BY_ID_QUERY = gql`
  query GetOrderById($id: ID!) {
    order(where: { id: $id }) {
      id
      displayId
      status
      total
      subtotal
      taxTotal
      shippingTotal
      discountTotal
      currency {
        code
        symbol
      }
      createdAt
      updatedAt
      items {
        id
        title
        description
        thumbnail
        quantity
        unitPrice
        total
        productVariant {
          id
          title
          sku
          barcode
          product {
            id
            title
            handle
            thumbnail
          }
          options {
            id
            value
            option {
              id
              title
            }
          }
        }
      }
      shippingAddress {
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
      fulfillments {
        id
        status
        trackingNumbers
        shippedAt
        provider {
          id
          name
        }
        items {
          id
          quantity
          orderItem {
            id
            productVariant {
              product {
                title
              }
            }
          }
        }
      }
      payments {
        id
        amount
        currency {
          code
        }
        status
        provider {
          id
          name
        }
        data
        createdAt
      }
      discounts {
        id
        code
        rule {
          id
          type
          value
          description
        }
      }
    }
  }
`;

const ORDER_BY_DISPLAY_ID_QUERY = gql`
  query GetOrderByDisplayId($displayId: String!) {
    orders(where: { displayId: { equals: $displayId } }, take: 1) {
      id
      displayId
      status
      total
      subtotal
      taxTotal
      shippingTotal
      discountTotal
      currency {
        code
        symbol
      }
      createdAt
      updatedAt
      items {
        id
        title
        description
        thumbnail
        quantity
        unitPrice
        total
        productVariant {
          id
          title
          sku
          product {
            id
            title
            handle
            thumbnail
          }
        }
      }
      shippingAddress {
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
          displayName
        }
      }
      fulfillments {
        id
        status
        trackingNumbers
        shippedAt
        provider {
          name
        }
      }
      payments {
        id
        amount
        currency {
          code
        }
        status
        provider {
          name
        }
        createdAt
      }
    }
  }
`;

// Order mutations
const COMPLETE_CART_MUTATION = gql`
  mutation CompleteCart($cartId: ID!) {
    completeCart(id: $cartId) {
      type
      ... on Order {
        id
        displayId
        status
        total
        subtotal
        taxTotal
        shippingTotal
        currency {
          code
          symbol
        }
        createdAt
        items {
          id
          title
          quantity
          unitPrice
          total
        }
        shippingAddress {
          firstName
          lastName
          address1
          city
          country {
            displayName
          }
        }
      }
      ... on Cart {
        id
        completedAt
      }
    }
  }
`;

// Helper to get auth token from cookies
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('keystonejs-session='))
    ?.split('=')[1];
  return token || null;
};

// Helper to get cart ID from cookies
const getCartId = (): string | null => {
  if (typeof window === 'undefined') return null;
  const cartId = document.cookie
    .split('; ')
    .find(row => row.startsWith('_openfront_cart_id='))
    ?.split('=')[1];
  return cartId || null;
};

// Order operations
export async function getOrderById(orderId: string) {
  try {
    const { order } = await openfrontClient.request(
      ORDER_BY_ID_QUERY,
      { id: orderId }
    );
    return order;
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    throw error;
  }
}

export async function getOrderByDisplayId(displayId: string) {
  try {
    const { orders } = await openfrontClient.request(
      ORDER_BY_DISPLAY_ID_QUERY,
      { displayId }
    );
    return orders?.[0] || null;
  } catch (error) {
    console.error('Error fetching order by display ID:', error);
    throw error;
  }
}

export async function completeCart(cartId?: string) {
  const id = cartId || getCartId();
  if (!id) throw new Error('Cart ID is required');

  const token = getAuthToken();
  const headers = token ? { authorization: `Bearer ${token}` } : {};

  try {
    const { completeCart } = await openfrontClient.request(
      COMPLETE_CART_MUTATION,
      { cartId: id },
      headers
    );
    return completeCart;
  } catch (error) {
    console.error('Error completing cart:', error);
    throw error;
  }
}