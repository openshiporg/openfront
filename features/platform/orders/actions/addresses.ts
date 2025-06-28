'use server';

import { keystoneClient } from '../../../dashboard/lib/keystoneClient';

export async function getCurrentUser() {
  const query = `
    query GetCurrentUser {
      authenticatedItem {
        ... on User {
          id
          name
          email
        }
      }
    }
  `;

  const response = await keystoneClient(query);
  return response;
}

export async function getAddresses(userId: string, limit: number = 10, skip: number = 0) {
  const query = `
    query GetUserAddresses($userId: ID!, $take: Int!, $skip: Int!) {
      addresses(
        where: { user: { id: { equals: $userId } } }
        take: $take
        skip: $skip
      ) {
        id
        company
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
          name
        }
      }
      addressesCount(where: { user: { id: { equals: $userId } } })
    }
  `;

  const response = await keystoneClient(query, {
    userId,
    take: limit,
    skip
  });

  return response;
}

export async function getCountries() {
  const query = `
    query GetCountries {
      countries(orderBy: { name: asc }) {
        id
        name
        iso2
      }
    }
  `;

  const response = await keystoneClient(query);
  return response;
}

export async function createAddress(input: {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  postalCode: string;
  phone?: string;
  country: string;
}) {
  const { country, ...rest } = input;

  const mutation = `
    mutation CreateAddress($data: AddressCreateInput!) {
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
          name
        }
      }
    }
  `;

  // Get the current user
  const currentUserResponse = await getCurrentUser();
  if (!currentUserResponse.success) {
    console.error('Failed to get current user:', currentUserResponse.error);
    return { success: false, error: currentUserResponse.error };
  }

  const currentUser = currentUserResponse.data.authenticatedItem;
  if (!currentUser?.id) {
    console.error('Authenticated user has no ID.');
    return { success: false, error: 'Authenticated user has no ID' };
  }

  const response = await keystoneClient(mutation, {
    data: {
      ...rest,
      user: { connect: { id: currentUser.id } },
      country: { connect: { id: country } }
    }
  });

  return response;
}

/**
 * Create a new address for a specific customer
 */
export async function createCustomerAddress(
  customerId: string,
  addressData: {
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
  }
) {
  const query = `
    mutation CreateAddress($data: AddressCreateInput!) {
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
          iso2
          name
        }
      }
    }
  `;

  const response = await keystoneClient(query, {
    data: {
      ...addressData,
      user: { connect: { id: customerId } },
      country: { connect: { iso2: addressData.countryCode } }
    }
  });
  
  return response;
} 