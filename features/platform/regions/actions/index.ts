'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

// Interface for region data (exported for potential use in other files)
export interface Region {
  id: string;
  name: string;
  code?: string;
  createdAt: string;
  updatedAt?: string;
  taxRate?: number;
  automaticTaxes?: boolean;
  currency?: {
    id: string;
    code: string;
    symbol: string;
    symbolNative: string;
  };
  countries?: Array<{
    id: string;
    iso2: string;
    displayName: string;
  }>;
  paymentProviders?: Array<{
    id: string;
    name: string;
    code: string;
    isInstalled: boolean;
  }>;
  [key: string]: unknown;
}

/**
 * Get list of regions
 */
export async function getRegions(
  where: Record<string, unknown> = {},
  take: number = 10,
  skip: number = 0,
  orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }],
  selectedFields: string = `
    id name code createdAt updatedAt taxRate automaticTaxes
    currency {
      id code symbol symbolNative
    }
    countries {
      id iso2 displayName
    }
    paymentProviders {
      id name code isInstalled
    }
  `
) {
  const query = `
    query GetRegions($where: RegionWhereInput, $take: Int!, $skip: Int!, $orderBy: [RegionOrderByInput!]) {
      items: regions(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        ${selectedFields}
      }
      count: regionsCount(where: $where)
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
    console.error('Error fetching regions:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch regions',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get filtered regions with search and pagination
 */
export async function getFilteredRegions(
  status?: string,
  search?: string,
  page: number = 1,
  pageSize: number = 10,
  sort?: string
) {
  // Build where clause
  const where: Record<string, any> = {};
  
  // Status filtering
  if (status && status !== 'all') {
    where.status = { equals: status };
  }
  
  // Search filtering (adjust fields as needed)
  if (search?.trim()) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
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
    const result = await getRegions(where, pageSize, skip, orderBy);
    return result;
  } catch (error: any) {
    console.error('Error in getFilteredRegions:', error);
    return {
      success: false,
      error: error.message || 'Failed to get filtered regions',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get a single region by ID
 */
export async function getRegion(id: string) {
  const query = `
    query GetRegion($id: ID!) {
      region(where: { id: $id }) {
        id name code createdAt taxRate automaticTaxes
        currency { id code symbol symbolNative }
        countries { id iso2 displayName }
        paymentProviders { id name code isInstalled }
      }
    }
  `;

  const response = await keystoneClient(query, { id });

  if (response.success) {
    if (!response.data.region) {
      return {
        success: false,
        error: 'Region not found',
        data: null,
      };
    }

    return {
      success: true,
      data: response.data.region,
    };
  } else {
    console.error('Error fetching region:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch region',
      data: null,
    };
  }
}

/**
 * Get region status counts for StatusTabs
 */
export async function getRegionStatusCounts() {
  const statusKeys = ["active","inactive"];
  
  const statusQueries = statusKeys.map(status => 
    `${status}: regionsCount(where: { status: { equals: ${status} } })`
  ).join('\n      ');
  
  const query = `
    query GetRegionStatusCounts {
      ${statusQueries}
      all: regionsCount
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
    console.error('Error fetching region status counts:', response.error);
    const emptyCounts: Record<string, number> = {
      all: 0,
    };
    
    statusKeys.forEach(status => {
      emptyCounts[status] = 0;
    });
    
    return {
      success: false,
      error: response.error || 'Failed to fetch region status counts',
      data: emptyCounts,
    };
  }
}

/**
 * Update region status
 */
export async function updateRegionStatus(id: string, status: string) {
  const mutation = `
    mutation UpdateRegionStatus($id: ID!, $data: RegionUpdateInput!) {
      updateRegion(where: { id: $id }, data: $data) {
        id
        status
      }
    }
  `;

  const response = await keystoneClient(mutation, {
    id,
    data: { status },
  });

  if (response.success) {
    // Revalidate the region page to reflect the status change
    revalidatePath(`/dashboard/platform/regions/${id}`);
    revalidatePath('/dashboard/platform/regions');

    return {
      success: true,
      data: response.data.updateRegion,
    };
  } else {
    console.error('Error updating region status:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to update region status',
      data: null,
    };
  }
}
