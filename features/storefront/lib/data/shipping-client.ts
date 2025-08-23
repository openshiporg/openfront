"use client";

import { gql } from "graphql-request";
import { openfrontClient } from "../config";

// Shipping queries
const SHIPPING_OPTIONS_QUERY = gql`
  query GetShippingOptions($cartId: ID!) {
    shippingOptions(where: { cart: { id: { equals: $cartId } } }) {
      id
      name
      amount
      data
      metadata
      provider {
        id
        name
      }
      priceType
      requirements {
        id
        type
        amount
      }
    }
  }
`;

const FULFILLMENT_OPTIONS_QUERY = gql`
  query GetFulfillmentOptions($providerId: ID!) {
    fulfillmentOptions(where: { provider: { id: { equals: $providerId } } }) {
      id
      providerId
      metadata
    }
  }
`;

// Shipping mutations
const ADD_SHIPPING_METHOD_MUTATION = gql`
  mutation AddShippingMethod($cartId: ID!, $optionId: ID!) {
    addShippingMethodToCart(cartId: $cartId, optionId: $optionId) {
      id
      shippingMethods {
        id
        shippingOption {
          id
          name
          amount
          provider {
            id
            name
          }
        }
        amount
        data
      }
      shippingTotal
      total
    }
  }
`;

const UPDATE_CART_ADDRESSES_MUTATION = gql`
  mutation UpdateCartAddresses(
    $cartId: ID!
    $shippingAddress: AddressInput
    $billingAddress: AddressInput
  ) {
    updateCart(
      where: { id: $cartId }
      data: {
        shippingAddress: $shippingAddress
        billingAddress: $billingAddress
      }
    ) {
      id
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
      shippingMethods {
        id
        shippingOption {
          id
          name
          amount
        }
        amount
      }
      shippingTotal
      total
    }
  }
`;

const CALCULATE_CART_TAXES_MUTATION = gql`
  mutation CalculateCartTaxes($cartId: ID!) {
    calculateTaxes(cartId: $cartId) {
      id
      taxTotal
      total
      items {
        id
        taxTotal
        total
        taxLines {
          id
          rate
          name
          code
          metadata
        }
      }
    }
  }
`;

// Helper to get cart ID from cookies
const getCartId = (): string | null => {
  if (typeof window === 'undefined') return null;
  const cartId = document.cookie
    .split('; ')
    .find(row => row.startsWith('_openfront_cart_id='))
    ?.split('=')[1];
  return cartId || null;
};

// Shipping operations
export async function getShippingOptions(cartId?: string) {
  const id = cartId || getCartId();
  if (!id) throw new Error('Cart ID is required');

  try {
    const { shippingOptions } = await openfrontClient.request(
      SHIPPING_OPTIONS_QUERY,
      { cartId: id }
    );
    return shippingOptions;
  } catch (error) {
    console.error('Error fetching shipping options:', error);
    throw error;
  }
}

export async function getFulfillmentOptions(providerId: string) {
  try {
    const { fulfillmentOptions } = await openfrontClient.request(
      FULFILLMENT_OPTIONS_QUERY,
      { providerId }
    );
    return fulfillmentOptions;
  } catch (error) {
    console.error('Error fetching fulfillment options:', error);
    throw error;
  }
}

export async function addShippingMethod(params: {
  cartId?: string;
  optionId: string;
}) {
  const cartId = params.cartId || getCartId();
  if (!cartId) throw new Error('Cart ID is required');

  try {
    const { addShippingMethodToCart } = await openfrontClient.request(
      ADD_SHIPPING_METHOD_MUTATION,
      {
        cartId,
        optionId: params.optionId,
      }
    );
    return addShippingMethodToCart;
  } catch (error) {
    console.error('Error adding shipping method:', error);
    throw error;
  }
}

export async function updateCartAddresses(params: {
  cartId?: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    province?: string;
    postalCode: string;
    phone?: string;
    countryCode: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    province?: string;
    postalCode: string;
    phone?: string;
    countryCode: string;
  };
}) {
  const cartId = params.cartId || getCartId();
  if (!cartId) throw new Error('Cart ID is required');

  const formatAddress = (address?: any) => {
    if (!address) return undefined;
    return {
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company,
      address1: address.address1,
      address2: address.address2,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      phone: address.phone,
      country: { connect: { iso2: address.countryCode } },
    };
  };

  try {
    const { updateCart } = await openfrontClient.request(
      UPDATE_CART_ADDRESSES_MUTATION,
      {
        cartId,
        shippingAddress: formatAddress(params.shippingAddress),
        billingAddress: formatAddress(params.billingAddress),
      }
    );
    return updateCart;
  } catch (error) {
    console.error('Error updating cart addresses:', error);
    throw error;
  }
}

export async function calculateCartTaxes(cartId?: string) {
  const id = cartId || getCartId();
  if (!id) throw new Error('Cart ID is required');

  try {
    const { calculateTaxes } = await openfrontClient.request(
      CALCULATE_CART_TAXES_MUTATION,
      { cartId: id }
    );
    return calculateTaxes;
  } catch (error) {
    console.error('Error calculating taxes:', error);
    throw error;
  }
}