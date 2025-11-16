"use client";

import { gql } from "graphql-request";
import { openfrontClient } from "../config";

// Cart Queries
const CART_QUERY = gql`
  query GetCart($cartId: ID!) {
    activeCart(cartId: $cartId) {
      id
      email
      type
      status
      total
      subtotal
      taxTotal
      discountTotal
      giftCardTotal
      shippingTotal
      region {
        id
        name
        currencyCode
        countries {
          id
          iso2
          displayName
        }
      }
      lineItems {
        id
        quantity
        title
        unitPrice
        originalPrice
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
          prices {
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
        }
      }
      shippingAddress {
        id
        firstName
        lastName
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
      shippingMethods {
        id
        name
        price
        shippingOption {
          id
          name
          priceType
        }
      }
      paymentSessions {
        id
        status
        paymentProvider {
          id
          code
        }
      }
      discounts {
        id
        code
        discountRule {
          id
          type
          value
          allocation
        }
      }
      giftCards {
        id
        code
        balance
        region {
          id
          currencyCode
        }
      }
    }
  }
`;

const CREATE_CART_MUTATION = gql`
  mutation CreateCart($data: CartCreateInput!) {
    createCart(data: $data) {
      id
      region {
        id
        currencyCode
      }
    }
  }
`;

// Cart operations
export async function retrieveCart(cartId: string) {
  if (!cartId) return null;

  try {
    const { activeCart } = await openfrontClient.request(CART_QUERY, { cartId });
    return activeCart;
  } catch (error) {
    console.error('Error retrieving cart:', error);
    return null;
  }
}

export async function createCart(data: { regionId: string }) {
  try {
    const { createCart } = await openfrontClient.request(
      CREATE_CART_MUTATION,
      {
        data: {
          region: { connect: { id: data.regionId } }
        }
      }
    );
    return createCart;
  } catch (error) {
    console.error('Error creating cart:', error);
    throw error;
  }
}

export async function addToCart(params: {
  cartId: string;
  variantId: string;
  quantity: number;
}) {
  const ADD_TO_CART_MUTATION = gql`
    mutation AddToCart($cartId: ID!, $data: CartUpdateInput!) {
      updateActiveCart(cartId: $cartId, data: $data) {
        id
        lineItems {
          id
          quantity
          title
          unitPrice
          total
          productVariant {
            id
            title
            product {
              id
              title
              handle
              thumbnail
            }
          }
        }
      }
    }
  `;

  try {
    const { updateActiveCart } = await openfrontClient.request(
      ADD_TO_CART_MUTATION,
      {
        cartId: params.cartId,
        data: {
          lineItems: {
            create: [
              {
                productVariant: { connect: { id: params.variantId } },
                quantity: params.quantity,
              },
            ],
          },
        },
      }
    );
    return updateActiveCart;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

export async function updateLineItem(params: {
  cartId: string;
  lineId: string;
  quantity: number;
}) {
  const UPDATE_LINE_ITEM_MUTATION = gql`
    mutation UpdateLineItem($cartId: ID!, $lineId: ID!, $quantity: Int!) {
      updateActiveCartLineItem(
        cartId: $cartId
        lineId: $lineId
        quantity: $quantity
      ) {
        id
        lineItems {
          id
          quantity
          title
          unitPrice
          originalPrice
          total
          productVariant {
            id
            title
            product {
              id
              title
              handle
              thumbnail
            }
          }
        }
      }
    }
  `;

  try {
    const { updateActiveCartLineItem } = await openfrontClient.request(
      UPDATE_LINE_ITEM_MUTATION,
      {
        cartId: params.cartId,
        lineId: params.lineId,
        quantity: params.quantity,
      }
    );
    return updateActiveCartLineItem;
  } catch (error) {
    console.error('Error updating line item:', error);
    throw error;
  }
}

export async function removeLineItem(params: {
  cartId: string;
  lineId: string;
}) {
  const REMOVE_LINE_ITEM_MUTATION = gql`
    mutation RemoveLineItem($cartId: ID!, $data: CartUpdateInput!) {
      updateActiveCart(cartId: $cartId, data: $data) {
        id
        lineItems {
          id
          quantity
          title
          unitPrice
          total
        }
      }
    }
  `;

  try {
    const { updateActiveCart } = await openfrontClient.request(
      REMOVE_LINE_ITEM_MUTATION,
      {
        cartId: params.cartId,
        data: {
          lineItems: {
            disconnect: [{ id: params.lineId }],
          },
        },
      }
    );
    return updateActiveCart;
  } catch (error) {
    console.error('Error removing line item:', error);
    throw error;
  }
}

export async function applyDiscount(params: {
  cartId: string;
  code: string;
}) {
  const APPLY_DISCOUNT_MUTATION = gql`
    mutation ApplyDiscount($cartId: ID!, $code: String!) {
      addDiscountToActiveCart(cartId: $cartId, code: $code) {
        id
        discounts {
          id
          code
          discountRule {
            type
            value
          }
        }
        total
        subtotal
        discountTotal
      }
    }
  `;

  try {
    const { addDiscountToActiveCart } = await openfrontClient.request(
      APPLY_DISCOUNT_MUTATION,
      {
        cartId: params.cartId,
        code: params.code,
      }
    );
    return addDiscountToActiveCart;
  } catch (error) {
    console.error('Error applying discount:', error);
    throw error;
  }
}

export async function removeDiscount(params: {
  cartId: string;
  code: string;
}) {
  const REMOVE_DISCOUNT_MUTATION = gql`
    mutation RemoveDiscount($cartId: ID!, $code: String!) {
      removeDiscountFromActiveCart(cartId: $cartId, code: $code) {
        id
        discounts {
          id
          code
        }
        total
        subtotal
        discountTotal
      }
    }
  `;

  try {
    const { removeDiscountFromActiveCart } = await openfrontClient.request(
      REMOVE_DISCOUNT_MUTATION,
      {
        cartId: params.cartId,
        code: params.code,
      }
    );
    return removeDiscountFromActiveCart;
  } catch (error) {
    console.error('Error removing discount:', error);
    throw error;
  }
}

export async function setShippingMethod(params: {
  cartId: string;
  shippingMethodId: string;
}) {
  const SET_SHIPPING_METHOD_MUTATION = gql`
    mutation SetShippingMethod($cartId: ID!, $shippingMethodId: ID!) {
      addActiveCartShippingMethod(
        cartId: $cartId
        shippingMethodId: $shippingMethodId
      ) {
        id
        shippingMethods {
          id
          name
          price
          shippingOption {
            id
            name
          }
        }
        shippingTotal
        total
      }
    }
  `;

  try {
    const { addActiveCartShippingMethod } = await openfrontClient.request(
      SET_SHIPPING_METHOD_MUTATION,
      {
        cartId: params.cartId,
        shippingMethodId: params.shippingMethodId,
      }
    );
    return addActiveCartShippingMethod;
  } catch (error) {
    console.error('Error setting shipping method:', error);
    throw error;
  }
}

export async function placeOrder(cartId: string) {
  const COMPLETE_CART_MUTATION = gql`
    mutation CompleteCart($cartId: ID!) {
      completeActiveCart(cartId: $cartId) {
        id
        status
        total
        shippingAddress {
          country {
            iso2
          }
        }
        secretKey
      }
    }
  `;

  try {
    const { completeActiveCart } = await openfrontClient.request(
      COMPLETE_CART_MUTATION,
      { cartId }
    );
    return completeActiveCart;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
}
