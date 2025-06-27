'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

// Interface for country data (exported for potential use in other files)
export interface Country {
  id: string;
  title: string;
  [key: string]: unknown;
}

/**
 * Get list of countries
 */
export async function getCountries(
  where: Record<string, unknown> = {},
  take: number = 10,
  skip: number = 0,
  orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }],
  selectedFields: string = `
    id name iso2 iso3 numCode displayName region { id name code } createdAt updatedAt
  `
) {
  const query = `
    query GetCountries($where: CountryWhereInput, $take: Int!, $skip: Int!, $orderBy: [CountryOrderByInput!]) {
      items: countries(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        ${selectedFields}
      }
      count: countriesCount(where: $where)
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
    console.error('Error fetching countries:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch countries',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get filtered countries with search and pagination
 */
export async function getFilteredCountries(
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
      { displayName: { contains: search, mode: 'insensitive' } },
      { iso2: { contains: search, mode: 'insensitive' } },
      { iso3: { contains: search, mode: 'insensitive' } }
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
    const result = await getCountries(where, pageSize, skip, orderBy);
    return result;
  } catch (error: any) {
    console.error('Error in getFilteredCountries:', error);
    return {
      success: false,
      error: error.message || 'Failed to get filtered countries',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get a single country by ID
 */
export async function getCountry(id: string) {
  const query = `
    query GetCountry($id: ID!) {
      country(where: { id: $id }) {
        id name iso2 iso3 numCode displayName region { id name code } createdAt updatedAt
      }
    }
  `;

  const response = await keystoneClient(query, { id });

  if (response.success) {
    if (!response.data.country) {
      return {
        success: false,
        error: 'Country not found',
        data: null,
      };
    }

    return {
      success: true,
      data: response.data.country,
    };
  } else {
    console.error('Error fetching country:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch country',
      data: null,
    };
  }
}

/**
 * Get country counts (no status field available)
 */
export async function getCountryStatusCounts() {
  const query = `
    query GetCountryStatusCounts {
      all: countriesCount
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
    console.error('Error fetching country counts:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch country counts',
      data: { all: 0 }
    };
  }
}

