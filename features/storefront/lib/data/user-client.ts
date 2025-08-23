"use client";

import { gql } from "graphql-request";
import { openfrontClient } from "../config";

// User queries
const CURRENT_USER_QUERY = gql`
  query GetCurrentUser {
    authenticatedItem {
      ... on User {
        id
        name
        email
        hasAccount
        phone
        createdAt
        updatedAt
        addresses {
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
      }
    }
  }
`;

const USER_ORDERS_QUERY = gql`
  query GetUserOrders {
    orders(orderBy: { createdAt: desc }) {
      id
      displayId
      status
      total
      subtotal
      taxTotal
      shippingTotal
      createdAt
      updatedAt
      items {
        id
        title
        quantity
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
      shippingAddress {
        firstName
        lastName
        address1
        city
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
          id
          name
        }
      }
    }
  }
`;

const USER_ADDRESSES_QUERY = gql`
  query GetUserAddresses {
    authenticatedItem {
      ... on User {
        addresses {
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
      }
    }
  }
`;

// Authentication mutations
const LOGIN_MUTATION = gql`
  mutation LoginUser($email: String!, $password: String!) {
    authenticateUserWithPassword(email: $email, password: $password) {
      ... on UserAuthenticationWithPasswordSuccess {
        sessionToken
        item {
          id
          name
          email
          hasAccount
          phone
        }
      }
      ... on UserAuthenticationWithPasswordFailure {
        message
        __typename
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation RegisterUser($data: UserCreateInput!) {
    createUser(data: $data) {
      id
      name
      email
      hasAccount
    }
  }
`;

const LOGOUT_MUTATION = gql`
  mutation LogoutUser {
    endSession
  }
`;

const ADD_ADDRESS_MUTATION = gql`
  mutation AddAddress($data: AddressCreateInput!) {
    createAddress(data: $data) {
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
  }
`;

const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($id: ID!, $data: UserUpdateInput!) {
    updateUser(where: { id: $id }, data: $data) {
      id
      name
      email
      phone
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

const setAuthToken = (token: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `keystonejs-session=${token}; path=/; max-age=${60 * 60 * 24 * 30}; HttpOnly=false; SameSite=Lax`;
};

const removeAuthToken = () => {
  if (typeof window === 'undefined') return;
  document.cookie = 'keystonejs-session=; path=/; max-age=-1';
};

// User operations
export async function getCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const { authenticatedItem } = await openfrontClient.request(
      CURRENT_USER_QUERY,
      {},
      {
        authorization: `Bearer ${token}`
      }
    );
    return authenticatedItem;
  } catch (error) {
    console.error('Error fetching current user:', error);
    // Clear invalid token
    removeAuthToken();
    return null;
  }
}

export async function loginUser(credentials: {
  email: string;
  password: string;
}) {
  try {
    const { authenticateUserWithPassword } = await openfrontClient.request(
      LOGIN_MUTATION,
      credentials
    );

    if (authenticateUserWithPassword.__typename === "UserAuthenticationWithPasswordFailure") {
      throw new Error(authenticateUserWithPassword.message);
    }

    // Store the session token
    if (authenticateUserWithPassword.sessionToken) {
      setAuthToken(authenticateUserWithPassword.sessionToken);
    }

    return authenticateUserWithPassword.item;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function registerUser(userData: {
  name: string;
  email: string;
  password: string;
  hasAccount?: boolean;
}) {
  try {
    const { createUser } = await openfrontClient.request(
      REGISTER_MUTATION,
      {
        data: {
          ...userData,
          hasAccount: userData.hasAccount ?? true,
        }
      }
    );

    // After registration, automatically log them in
    const loginResult = await loginUser({
      email: userData.email,
      password: userData.password,
    });

    return loginResult;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

export async function logoutUser() {
  const token = getAuthToken();
  if (!token) return;

  try {
    await openfrontClient.request(
      LOGOUT_MUTATION,
      {},
      {
        authorization: `Bearer ${token}`
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always remove the token, even if the server request fails
    removeAuthToken();
  }
}

export async function getUserOrders() {
  const token = getAuthToken();
  if (!token) throw new Error('User not authenticated');

  try {
    const { orders } = await openfrontClient.request(
      USER_ORDERS_QUERY,
      {},
      {
        authorization: `Bearer ${token}`
      }
    );
    return orders;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
}

export async function getUserAddresses() {
  const token = getAuthToken();
  if (!token) throw new Error('User not authenticated');

  try {
    const { authenticatedItem } = await openfrontClient.request(
      USER_ADDRESSES_QUERY,
      {},
      {
        authorization: `Bearer ${token}`
      }
    );
    return authenticatedItem?.addresses || [];
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    throw error;
  }
}

export async function addUserAddress(addressData: {
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
}) {
  const token = getAuthToken();
  if (!token) throw new Error('User not authenticated');

  try {
    // Get current user to connect address
    const user = await getCurrentUser();
    if (!user) throw new Error('User not found');

    const { createAddress } = await openfrontClient.request(
      ADD_ADDRESS_MUTATION,
      {
        data: {
          ...addressData,
          country: { connect: { iso2: addressData.countryCode } },
          user: { connect: { id: user.id } },
        }
      },
      {
        authorization: `Bearer ${token}`
      }
    );
    return createAddress;
  } catch (error) {
    console.error('Error adding address:', error);
    throw error;
  }
}

export async function updateUserProfile(profileData: {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
}) {
  const token = getAuthToken();
  if (!token) throw new Error('User not authenticated');

  try {
    const { updateUser } = await openfrontClient.request(
      UPDATE_PROFILE_MUTATION,
      {
        id: profileData.id,
        data: {
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
        }
      },
      {
        authorization: `Bearer ${token}`
      }
    );
    return updateUser;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}