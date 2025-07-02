'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

// Interface for user data (exported for potential use in other files)
export interface User {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  hasAccount: boolean;
  role?: {
    id: string;
    name: string;
  };
  orders?: Array<{
    id: string;
    displayId: string;
    email: string;
    total?: string;
    status: string;
    lineItems?: Array<{ id: string }>;
  }>;
  [key: string]: unknown;
}

/**
 * Get list of users
 */
export async function getUsers(
  where: Record<string, unknown> = {},
  take: number = 10,
  skip: number = 0,
  orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }],
  selectedFields: string = `
    id
    name
    email
    firstName
    lastName
    hasAccount
    role {
      id
      name
    }
    orders {
      id
      displayId
      email
      total
      status
      lineItems {
        id
      }
    }
    createdAt
    updatedAt
  `
) {
  const query = `
    query GetUsers($where: UserWhereInput, $take: Int!, $skip: Int!, $orderBy: [UserOrderByInput!]) {
      items: users(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        ${selectedFields}
      }
      count: usersCount(where: $where)
    }
  `;

  const response = await keystoneClient(query, {
    where,
    take,
    skip,
    orderBy,
  });

  if (response.success) {
    return {
      success: true,
      data: {
        items: response.data.items || [],
        count: response.data.count || 0,
      },
    };
  } else {
    console.error('Error fetching users:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch users',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get filtered users with search and pagination
 */
export async function getFilteredUsers(
  status?: string,
  search?: string,
  page: number = 1,
  pageSize: number = 10,
  sort?: string
) {
  // Build where clause
  const where: Record<string, any> = {};
  
  // Status filtering - map to hasAccount field
  if (status && status !== 'all') {
    if (status === 'has_account') {
      where.hasAccount = { equals: true };
    } else if (status === 'no_account') {
      where.hasAccount = { equals: false };
    }
  }
  
  // Search filtering (adjust fields as needed)
  if (search?.trim()) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      // Add more searchable fields as needed
    ];
  }

  // Build orderBy clause
  let orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }];
  if (sort) {
    if (sort.startsWith('-')) {
      const field = sort.substring(1);
      orderBy = [{ [field]: 'desc' }];
    } else {
      orderBy = [{ [sort]: 'asc' }];
    }
  }

  // Calculate pagination
  const skip = (page - 1) * pageSize;

  try {
    const result = await getUsers(where, pageSize, skip, orderBy);
    return result;
  } catch (error: any) {
    console.error('Error in getFilteredUsers:', error);
    return {
      success: false,
      error: error.message || 'Failed to get filtered users',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get a single user by ID
 */
export async function getUser(id: string) {
  const query = `
    query GetUser($id: ID!) {
      user(where: { id: $id }) {
        id
        name
        email
        firstName
        lastName
        hasAccount
        role {
          id
          name
        }
        orders {
          id
          displayId
          email
          total
          status
          lineItems {
            id
          }
        }
        createdAt
        updatedAt
      }
    }
  `;

  const response = await keystoneClient(query, { id });

  if (response.success) {
    if (!response.data.user) {
      return {
        success: false,
        error: 'User not found',
        data: null,
      };
    }

    return {
      success: true,
      data: response.data.user,
    };
  } else {
    console.error('Error fetching user:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch user',
      data: null,
    };
  }
}

/**
 * Get user status counts for StatusTabs
 */
export async function getUserStatusCounts() {
  const statusKeys = ["has_account","no_account"];
  
  const statusQueries = statusKeys.map(status => {
    if (status === 'has_account') {
      return `${status}: usersCount(where: { hasAccount: { equals: true } })`;
    } else if (status === 'no_account') {
      return `${status}: usersCount(where: { hasAccount: { equals: false } })`;
    }
    return `${status}: usersCount(where: { hasAccount: { equals: null } })`;
  }).join('\n      ');
  
  const query = `
    query GetUserStatusCounts {
      ${statusQueries}
      all: usersCount
    }
  `;

  const response = await keystoneClient(query);

  if (response.success) {
    const counts: Record<string, number> = {
      all: response.data.all || 0,
    };
    
    statusKeys.forEach(status => {
      counts[status] = response.data[status] || 0;
    });
    
    return {
      success: true,
      data: counts,
    };
  } else {
    console.error('Error fetching user status counts:', response.error);
    const emptyCounts: Record<string, number> = {
      all: 0,
    };
    
    statusKeys.forEach(status => {
      emptyCounts[status] = 0;
    });
    
    return {
      success: false,
      error: response.error || 'Failed to fetch user status counts',
      data: emptyCounts,
    };
  }
}

/**
 * Update user status
 */
export async function updateUserStatus(id: string, status: string) {
  const mutation = `
    mutation UpdateUserStatus($id: ID!, $data: UserUpdateInput!) {
      updateUser(where: { id: $id }, data: $data) {
        id
        hasAccount
      }
    }
  `;

  const response = await keystoneClient(mutation, {
    id,
    data: { hasAccount: status === 'has_account' },
  });

  if (response.success) {
    // Revalidate the user page to reflect the status change
    revalidatePath(`/dashboard/platform/users/${id}`);
    revalidatePath('/dashboard/platform/users');

    return {
      success: true,
      data: response.data.updateUser,
    };
  } else {
    console.error('Error updating user status:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to update user status',
      data: null,
    };
  }
}
