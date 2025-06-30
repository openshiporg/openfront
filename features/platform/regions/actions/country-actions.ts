'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

export interface Country {
  id: string;
  displayName: string;
  name: string;
  iso2: string;
  iso3: string;
  numCode: number;
  createdAt: string;
  region?: {
    id: string;
    name: string;
    currency: { code: string; symbol: string };
  } | null;
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
    id displayName name iso2 iso3 numCode createdAt
    region {
      id name
      currency { code symbol }
    }
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
  status?: string,
  search?: string,
  page: number = 1,
  pageSize: number = 10,
  sort?: string
) {
  // Build where clause
  const where: Record<string, any> = {};
  
  // Status filtering - assigned vs unassigned to regions
  if (status && status !== 'all') {
    if (status === 'assigned') {
      where.region = { isNot: null };
    } else if (status === 'unassigned') {
      where.region = { equals: null };
    }
  }
  
  // Search filtering
  if (search?.trim()) {
    where.OR = [
      { displayName: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
      { iso2: { contains: search, mode: 'insensitive' } },
      { iso3: { contains: search, mode: 'insensitive' } },
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
 * Get country status counts for StatusTabs
 */
export async function getCountryStatusCounts() {
  const query = `
    query GetCountryStatusCounts {
      assigned: countriesCount(where: { region: { isNot: null } })
      unassigned: countriesCount(where: { region: { equals: null } })
      all: countriesCount
    }
  `;

  const response = await keystoneClient(query);

  if (response.success) {
    return {
      success: true,
      data: {
        all: response.data.all || 0,
        assigned: response.data.assigned || 0,
        unassigned: response.data.unassigned || 0,
      },
    };
  } else {
    console.error('Error fetching country status counts:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch country status counts',
      data: {
        all: 0,
        assigned: 0,
        unassigned: 0,
      },
    };
  }
}

/**
 * Create country
 */
export async function createCountry(data: {
  displayName: string;
  name: string;
  iso2: string;
  iso3: string;
  numCode: number;
  regionId?: string;
}) {
  const mutation = `
    mutation CreateCountry($data: CountryCreateInput!) {
      createCountry(data: $data) {
        id displayName name iso2 iso3 numCode
        region { id name }
      }
    }
  `;

  const countryData: any = {
    displayName: data.displayName,
    name: data.name,
    iso2: data.iso2,
    iso3: data.iso3,
    numCode: data.numCode,
  };

  if (data.regionId) {
    countryData.region = { connect: { id: data.regionId } };
  }

  const response = await keystoneClient(mutation, {
    data: countryData,
  });

  if (response.success) {
    revalidatePath('/dashboard/platform/regions');
    return {
      success: true,
      data: response.data.createCountry,
    };
  } else {
    console.error('Error creating country:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to create country',
      data: null,
    };
  }
}