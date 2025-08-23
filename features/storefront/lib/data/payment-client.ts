"use client";

import { gql } from "graphql-request";
import { openfrontClient } from "../config";

// Payment queries
const PAYMENT_SESSIONS_QUERY = gql`
  query GetPaymentSessions($cartId: ID!) {
    paymentSessions(where: { cart: { id: { equals: $cartId } } }) {
      id
      amount
      currency {
        code
      }
      provider {
        id
        name
      }
      isSelected
      data
      status
    }
  }
`;

// Payment mutations
const CREATE_PAYMENT_SESSIONS_MUTATION = gql`
  mutation CreatePaymentSessions($cartId: ID!) {
    createPaymentSessions(cartId: $cartId) {
      id
      paymentSessions {
        id
        amount
        currency {
          code
        }
        provider {
          id
          name
        }
        isSelected
        data
        status
      }
    }
  }
`;

const SET_PAYMENT_SESSION_MUTATION = gql`
  mutation SetPaymentSession($cartId: ID!, $providerId: ID!) {
    setPaymentSession(cartId: $cartId, providerId: $providerId) {
      id
      paymentSession {
        id
        amount
        currency {
          code
        }
        provider {
          id
          name
        }
        isSelected
        data
        status
      }
    }
  }
`;

const UPDATE_PAYMENT_SESSION_MUTATION = gql`
  mutation UpdatePaymentSession($sessionId: ID!, $data: Json!) {
    updatePaymentSession(sessionId: $sessionId, data: $data) {
      id
      amount
      currency {
        code
      }
      provider {
        id
        name
      }
      isSelected
      data
      status
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

// Payment operations
export async function getPaymentSessions(cartId?: string) {
  const id = cartId || getCartId();
  if (!id) throw new Error('Cart ID is required');

  try {
    const { paymentSessions } = await openfrontClient.request(
      PAYMENT_SESSIONS_QUERY,
      { cartId: id }
    );
    return paymentSessions;
  } catch (error) {
    console.error('Error fetching payment sessions:', error);
    throw error;
  }
}

export async function createPaymentSessions(cartId?: string) {
  const id = cartId || getCartId();
  if (!id) throw new Error('Cart ID is required');

  try {
    const { createPaymentSessions } = await openfrontClient.request(
      CREATE_PAYMENT_SESSIONS_MUTATION,
      { cartId: id }
    );
    return createPaymentSessions;
  } catch (error) {
    console.error('Error creating payment sessions:', error);
    throw error;
  }
}

export async function setPaymentSession(params: {
  cartId?: string;
  providerId: string;
}) {
  const cartId = params.cartId || getCartId();
  if (!cartId) throw new Error('Cart ID is required');

  try {
    const { setPaymentSession } = await openfrontClient.request(
      SET_PAYMENT_SESSION_MUTATION,
      {
        cartId,
        providerId: params.providerId,
      }
    );
    return setPaymentSession;
  } catch (error) {
    console.error('Error setting payment session:', error);
    throw error;
  }
}

export async function updatePaymentSession(params: {
  sessionId: string;
  data: Record<string, any>;
}) {
  try {
    const { updatePaymentSession } = await openfrontClient.request(
      UPDATE_PAYMENT_SESSION_MUTATION,
      {
        sessionId: params.sessionId,
        data: params.data,
      }
    );
    return updatePaymentSession;
  } catch (error) {
    console.error('Error updating payment session:', error);
    throw error;
  }
}