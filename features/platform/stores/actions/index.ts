'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

// Interface for store data (exported for potential use in other files)
export interface Store {
  id: string;
  name: string;
  [key: string]: unknown;
}

/**
 * Get list of stores
 */
export async function getStores(
  where: Record<string, unknown> = {},
  take: number = 10,
  skip: number = 0,
  orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }],
  selectedFields: string = `
    id name defaultCurrencyCode metadata createdAt updatedAt
  `
) {
  const query = `
    query GetStores($where: StoreWhereInput, $take: Int!, $skip: Int!, $orderBy: [StoreOrderByInput!]) {
      items: stores(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        ${selectedFields}
      }
      count: storesCount(where: $where)
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
    console.error('Error fetching stores:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch stores',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get filtered stores with search and pagination
 */
export async function getFilteredStores(
  search?: string,
  page: number = 1,
  pageSize: number = 10,
  sort?: string | string[]
) {
  // Build where clause
  const where: Record<string, any> = {};
  
  // Search filtering
  if (search?.trim()) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Build orderBy clause
  let orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }];
  if (sort) {
    const sortString = Array.isArray(sort) ? sort[0] : sort;
    if (sortString && typeof sortString === 'string') {
      if (sortString.startsWith('-')) {
        const field = sortString.substring(1);
        orderBy = [{ [field]: 'desc' }];
      } else {
        orderBy = [{ [sortString]: 'asc' }];
      }
    }
  }

  // Calculate pagination
  const skip = (page - 1) * pageSize;

  try {
    const result = await getStores(where, pageSize, skip, orderBy);
    return result;
  } catch (error: any) {
    console.error('Error in getFilteredStores:', error);
    return {
      success: false,
      error: error.message || 'Failed to get filtered stores',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get a single store by ID
 */
export async function getStore(id: string) {
  const query = `
    query GetStore($id: ID!) {
      store(where: { id: $id }) {
        id name defaultCurrencyCode metadata createdAt updatedAt
      }
    }
  `;

  const response = await keystoneClient(query, { id });

  if (response.success) {
    if (!response.data.store) {
      return {
        success: false,
        error: 'Store not found',
        data: null,
      };
    }

    return {
      success: true,
      data: response.data.store,
    };
  } else {
    console.error('Error fetching store:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch store',
      data: null,
    };
  }
}

/**
 * Get store counts (no status field available)
 */
export async function getStoreStatusCounts() {
  const query = `
    query GetStoreStatusCounts {
      all: storesCount
    }
  `;

  const response = await keystoneClient(query);

  if (response.success) {
    return {
      success: true,
      data: {
        all: response.data.all || 0
      }
    };
  } else {
    console.error('Error fetching store counts:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch store counts',
      data: { all: 0 }
    };
  }
}

