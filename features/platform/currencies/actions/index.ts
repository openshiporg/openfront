'use server';

import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

// Interface for currency data (exported for potential use in other files)
export interface Currency {
  id: string;
  title: string;
  [key: string]: unknown;
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
    id name code symbol symbolNative noDivisionCurrency createdAt updatedAt
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
  search?: string,
  page: number = 1,
  pageSize: number = 10,
  sort?: string
) {
  // Build where clause
  const where: Record<string, any> = {};
  
  // Search filtering
  if (search?.trim()) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { symbol: { contains: search, mode: 'insensitive' } }
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
 * Get a single currency by ID
 */
export async function getCurrency(id: string) {
  const query = `
    query GetCurrency($id: ID!) {
      currency(where: { id: $id }) {
        id name code symbol symbolNative noDivisionCurrency createdAt updatedAt
      }
    }
  `;

  const response = await keystoneClient(query, { id });

  if (response.success) {
    if (!response.data.currency) {
      return {
        success: false,
        error: 'Currency not found',
        data: null,
      };
    }

    return {
      success: true,
      data: response.data.currency,
    };
  } else {
    console.error('Error fetching currency:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch currency',
      data: null,
    };
  }
}

/**
 * Get currency counts (no status field available)
 */
export async function getCurrencyStatusCounts() {
  const query = `
    query GetCurrencyStatusCounts {
      all: currenciesCount
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
    console.error('Error fetching currency counts:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch currency counts',
      data: { all: 0 }
    };
  }
}

