"use server";
import { gql } from "graphql-request";
import { openfrontClient } from "../config";
import { getAuthHeaders } from "./cookies";
import { cache } from "react";

export async function getUser() {
  try {
    const headers = getAuthHeaders();
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
                countryCode
                phone
              }
              addresses(orderBy: [{ isBilling: desc }]) {
                id
                firstName
                lastName
                company
                address1
                address2
                city
                province
                postalCode
                countryCode
                phone
                isBilling
              }
            }
          }
        }
      `,
      {},
      headers
    );
    return { authenticatedItem };
  } catch (error) {
    return { authenticatedItem: null };
  }
}

export async function authenticate({ email, password }) {
  const headers = getAuthHeaders();
  const { authenticateUserWithPassword } = await openfrontClient.request(
    gql`
      mutation Authenticate($email: String!, $password: String!) {
        authenticateUserWithPassword(email: $email, password: $password) {
          ... on UserAuthenticationWithPasswordSuccess {
            item {
              id
            }
          }
          ... on UserAuthenticationWithPasswordFailure {
            message
          }
        }
      }
    `,
    { email, password },
    headers
  );

  if (
    authenticateUserWithPassword.__typename ===
    "UserAuthenticationWithPasswordFailure"
  ) {
    throw new Error(authenticateUserWithPassword.message);
  }

  return true;
}

export const getUserWithOrders = cache(async function () {
  const headers = getAuthHeaders();
  const { authenticatedItem } = await openfrontClient.request(
    gql`
      query GetUserAndOrders {
        authenticatedItem {
          ... on User {
            id
            email
            firstName
            lastName
            phone
            billingAddress {
              firstName
              lastName
              company
              address1
              address2
              city
              province
              postalCode
              countryCode
              phone
            }
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
              countryCode
              phone
            }
            orders {
              id
              total
              status
              createdAt
              displayId
              shippingAddress {
                firstName
                lastName
                address1
                city
                postalCode
                countryCode
              }
              paymentStatus
              fulfillmentStatus
              lineItems {
                id
                title
                quantity
                unitPrice
                total
              }
            }
          }
        }
      }
    `,
    {},
    headers
  );

  return authenticatedItem;
});

export async function createCustomer(data) {
  const headers = getAuthHeaders();
  const { createUser } = await openfrontClient.request(
    gql`
      mutation CreateUser($data: UserCreateInput!) {
        createUser(data: $data) {
          id
        }
      }
    `,
    {
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
    },
    headers
  );

  return createUser;
}

export async function updateCustomer(data) {
  const headers = getAuthHeaders();
  const { updateUser } = await openfrontClient.request(
    gql`
      mutation UpdateUser($data: UserUpdateInput!) {
        updateUser(data: $data) {
          id
        }
      }
    `,
    {
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
    },
    headers
  );

  return updateUser;
}

export async function addShippingAddress(data) {
  const headers = getAuthHeaders();
  const { addShippingAddress } = await openfrontClient.request(
    gql`
      mutation AddShippingAddress($data: ShippingAddressCreateInput!) {
        addShippingAddress(data: $data) {
          id
        }
      }
    `,
    {
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        countryCode: data.countryCode,
        phone: data.phone,
      },
    },
    headers
  );

  return addShippingAddress;
}

export async function updateShippingAddress(addressId, data) {
  const headers = getAuthHeaders();
  const { updateShippingAddress } = await openfrontClient.request(
    gql`
      mutation UpdateShippingAddress(
        $addressId: ID!
        $data: ShippingAddressUpdateInput!
      ) {
        updateShippingAddress(addressId: $addressId, data: $data) {
          id
        }
      }
    `,
    {
      addressId,
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        countryCode: data.countryCode,
        phone: data.phone,
      },
    },
    headers
  );

  return updateShippingAddress;
}

export async function deleteShippingAddress(addressId) {
  const headers = getAuthHeaders();
  const { deleteShippingAddress } = await openfrontClient.request(
    gql`
      mutation DeleteShippingAddress($addressId: ID!) {
        deleteShippingAddress(addressId: $addressId) {
          id
        }
      }
    `,
    {
      addressId,
    },
    headers
  );

  return deleteShippingAddress;
}

export const getUserAddresses = cache(async function () {
  const headers = getAuthHeaders();
  const { authenticatedItem } = await openfrontClient.request(
    gql`
      query GetUserAddresses {
        authenticatedItem {
          ... on User {
            id
            email
            firstName
            lastName
            phone
            billingAddress {
              firstName
              lastName
              company
              address1
              address2
              city
              province
              postalCode
              countryCode
              phone
            }
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
              countryCode
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
});
