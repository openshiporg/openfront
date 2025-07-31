'use server';

import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

/**
 * Search customers for order creation
 */
export async function searchCustomers(
  search: string = '',
  take: number = 50
) {
  const query = search ? `
    query GetCustomers($search: String!, $take: Int!) {
      users(
        where: {
          OR: [
            { firstName: { contains: $search, mode: insensitive } }
            { lastName: { contains: $search, mode: insensitive } }
            { email: { contains: $search, mode: insensitive } }
          ]
        }
        take: $take
        orderBy: { createdAt: desc }
      ) {
        id
        firstName
        lastName
        email
        phone
        addresses {
          id
          firstName
          lastName
          address1
          address2
          city
          province
          postalCode
          phone
          company
          country {
            iso2
            name
          }
        }
      }
    }
  ` : `
    query GetCustomers($take: Int!) {
      users(
        take: $take
        orderBy: { createdAt: desc }
      ) {
        id
        firstName
        lastName
        email
        phone
        addresses {
          id
          firstName
          lastName
          address1
          address2
          city
          province
          postalCode
          phone
          company
          country {
            iso2
            name
          }
        }
      }
    }
  `;

  const variables = search ? { search, take } : { take };
  const response = await keystoneClient(query, variables);
  
  return response;
}
/**
 * Get a single customer by ID
 */
export async function getCustomer(id: string) {
  const query = `
    query GetCustomer($id: ID!) {
      user(where: { id: $id }) {
        id
        firstName
        lastName
        email
        phone
        addresses {
          id
          firstName
          lastName
          address1
          address2
          city
          province
          postalCode
          phone
          company
          country {
            iso2
            name
          }
        }
      }
    }
  `;

  const response = await keystoneClient(query, { id });
  
  if (response.success) {
    return { success: true, data: response.data.user };
  }
  return response;
} 