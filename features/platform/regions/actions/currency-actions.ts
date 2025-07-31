'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

export interface Currency {
  id: string;
  name: string;
  code: string;
  symbol: string;
  symbolNative: string;
  createdAt: string;
  regions: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

/**
 * Get list of currencies
 */
export async function getCurrencies(
  where: Record<string, unknown> = {},
  take: number = 10,
  skip: number = 0,
  orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }],
  selectedFields: string = `
    id name code symbol symbolNative createdAt
    regions {
      id name code
    }
  `
) {
  const query = `
    query GetCurrencies($where: CurrencyWhereInput, $take: Int!, $skip: Int!, $orderBy: [CurrencyOrderByInput!]) {
      items: currencies(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        ${selectedFields}
      }
      count: currenciesCount(where: $where)
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
    console.error('Error fetching currencies:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch currencies',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get filtered currencies with search and pagination
 */
export async function getFilteredCurrencies(
  status?: string,
  search?: string,
  page: number = 1,
  pageSize: number = 10,
  sort?: string
) {
  // Build where clause
  const where: Record<string, any> = {};
  
  // Status filtering - active vs unused (based on region usage)
  if (status && status !== 'all') {
    if (status === 'active') {
      where.regions = { some: {} }; // Has regions
    } else if (status === 'unused') {
      where.regions = { none: {} }; // No regions
    }
  }
  
  // Search filtering
  if (search?.trim()) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { symbol: { contains: search, mode: 'insensitive' } },
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
    const result = await getCurrencies(where, pageSize, skip, orderBy);
    return result;
  } catch (error: any) {
    console.error('Error in getFilteredCurrencies:', error);
    return {
      success: false,
      error: error.message || 'Failed to get filtered currencies',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get currency status counts for StatusTabs
 */
export async function getCurrencyStatusCounts() {
  const query = `
    query GetCurrencyStatusCounts {
      active: currenciesCount(where: { regions: { some: {} } })
      unused: currenciesCount(where: { regions: { none: {} } })
      all: currenciesCount
    }
  `;

  const response = await keystoneClient(query);

  if (response.success) {
    return {
      success: true,
      data: {
        all: response.data.all || 0,
        active: response.data.active || 0,
        unused: response.data.unused || 0,
      },
    };
  } else {
    console.error('Error fetching currency status counts:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch currency status counts',
      data: {
        all: 0,
        active: 0,
        unused: 0,
      },
    };
  }
}

/**
 * Create currency
 */
export async function createCurrency(data: {
  name: string;
  code: string;
  symbol: string;
  symbolNative: string;
}) {
  const mutation = `
    mutation CreateCurrency($data: CurrencyCreateInput!) {
      createCurrency(data: $data) {
        id name code symbol symbolNative
      }
    }
  `;

  const response = await keystoneClient(mutation, {
    data,
  });

  if (response.success) {
    revalidatePath('/dashboard/platform/regions');
    return {
      success: true,
      data: response.data.createCurrency,
    };
  } else {
    console.error('Error creating currency:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to create currency',
      data: null,
    };
  }
}