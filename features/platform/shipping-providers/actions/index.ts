'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

// Interface for shipping provider data (exported for potential use in other files)
export interface ShippingProvider {
  id: string;
  name: string;
  isActive?: boolean;
  accessToken?: string;
  metadata?: any;
  [key: string]: unknown;
}

/**
 * Get list of shippingproviders
 */
export async function getShippingProviders(
  where: Record<string, unknown> = {},
  take: number = 10,
  skip: number = 0,
  orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }],
  selectedFields: string = `
    id
    name
    isActive
    accessToken
    metadata
    regions {
      id
      name
      code
      currency {
        code
        symbol
      }
      countries {
        id
        name
        iso2
      }
    }
    createdAt
    updatedAt
  `
) {
  const query = `
    query GetShippingProviders($where: ShippingProviderWhereInput, $take: Int!, $skip: Int!, $orderBy: [ShippingProviderOrderByInput!]) {
      items: shippingProviders(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        ${selectedFields}
      }
      count: shippingProvidersCount(where: $where)
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
    console.error('Error fetching shippingproviders:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch shippingproviders',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get filtered shippingproviders with search and pagination
 */
export async function getFilteredShippingProviders(
  status?: string,
  search?: string,
  page: number = 1,
  pageSize: number = 10,
  sort?: string
) {
  // Build where clause
  const where: Record<string, any> = {};
  
  // Status filtering - map to isActive field
  if (status && status !== 'all') {
    if (status === 'active') {
      where.isActive = { equals: true };
    } else if (status === 'inactive') {
      where.isActive = { equals: false };
    }
  }
  
  // Search filtering (adjust fields as needed)
  if (search?.trim()) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
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
    const result = await getShippingProviders(where, pageSize, skip, orderBy);
    return result;
  } catch (error: any) {
    console.error('Error in getFilteredShippingProviders:', error);
    return {
      success: false,
      error: error.message || 'Failed to get filtered shippingproviders',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get a single shippingprovider by ID
 */
export async function getShippingProvider(id: string) {
  const query = `
    query GetShippingProvider($id: ID!) {
      shippingProvider(where: { id: $id }) {
        id
        name
        isActive
        accessToken
        metadata
        createdAt
        updatedAt
      }
    }
  `;

  const response = await keystoneClient(query, { id });

  if (response.success) {
    if (!response.data.shippingProvider) {
      return {
        success: false,
        error: 'ShippingProvider not found',
        data: null,
      };
    }

    return {
      success: true,
      data: response.data.shippingProvider,
    };
  } else {
    console.error('Error fetching shippingprovider:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch shippingprovider',
      data: null,
    };
  }
}

/**
 * Get shippingprovider status counts for StatusTabs
 */
export async function getShippingProviderStatusCounts() {
  const statusKeys = ["active","inactive"];
  
  const statusQueries = statusKeys.map(status => {
    if (status === 'active') {
      return `${status}: shippingProvidersCount(where: { isActive: { equals: true } })`;
    } else if (status === 'inactive') {
      return `${status}: shippingProvidersCount(where: { isActive: { equals: false } })`;
    }
    return `${status}: shippingProvidersCount(where: { isActive: { equals: null } })`;
  }).join('\n      ');
  
  const query = `
    query GetShippingProviderStatusCounts {
      ${statusQueries}
      all: shippingProvidersCount
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
    console.error('Error fetching shippingprovider status counts:', response.error);
    const emptyCounts: Record<string, number> = {
      all: 0,
    };
    
    statusKeys.forEach(status => {
      emptyCounts[status] = 0;
    });
    
    return {
      success: false,
      error: response.error || 'Failed to fetch shippingprovider status counts',
      data: emptyCounts,
    };
  }
}

/**
 * Get shipping provider region counts for tabs
 */
export async function getShippingProviderRegionCounts() {
  const query = `
    query GetShippingProviderRegionCounts {
      all: shippingProvidersCount
      regions {
        id
        name
        shippingProvidersCount
      }
    }
  `;

  const response = await keystoneClient(query);

  if (response.success) {
    const allCount = response.data.all || 0;
    const regions = (response.data.regions || []).map((region: any) => ({
      id: region.id,
      name: region.name,
      count: region.shippingProvidersCount || 0,
    }));

    return {
      success: true,
      data: {
        all: allCount,
        regions,
      },
    };
  } else {
    console.error('Error fetching shipping provider region counts:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch shipping provider region counts',
      data: { all: 0, regions: [] },
    };
  }
}

/**
 * Create a new shipping provider
 */
export interface CreateShippingProviderInput {
  name: string;
  accessToken?: string;
  fromAddressId?: string | null;
  createLabelFunction?: string;
  getRatesFunction?: string;
  validateAddressFunction?: string;
  trackShipmentFunction?: string;
  cancelLabelFunction?: string;
  metadata?: Record<string, any>;
  regionIds?: string[];
}

export async function createShippingProvider(input: CreateShippingProviderInput) {
  const {
    name,
    accessToken,
    fromAddressId,
    createLabelFunction,
    getRatesFunction,
    validateAddressFunction,
    trackShipmentFunction,
    cancelLabelFunction,
    metadata,
    regionIds
  } = input;

  const mutation = `
    mutation CreateShippingProvider(
      $name: String!
      $accessToken: String
      $fromAddressId: ID
      $createLabelFunction: String
      $getRatesFunction: String
      $validateAddressFunction: String
      $trackShipmentFunction: String
      $cancelLabelFunction: String
      $metadata: JSON
      $regionIds: [RegionWhereUniqueInput!]
    ) {
      createShippingProvider(data: {
        name: $name
        accessToken: $accessToken
        fromAddress: $fromAddressId ? { connect: { id: $fromAddressId } } : null
        isActive: true
        createLabelFunction: $createLabelFunction
        getRatesFunction: $getRatesFunction
        validateAddressFunction: $validateAddressFunction
        trackShipmentFunction: $trackShipmentFunction
        cancelLabelFunction: $cancelLabelFunction
        metadata: $metadata
        regions: { connect: $regionIds }
      }) {
        id
        name
        isActive
        accessToken
        metadata
        fromAddress {
          id
          firstName
          lastName
          company
          address1
          city
          province
          postalCode
          country {
            iso2
          }
        }
        regions {
          id
          name
          code
        }
      }
    }
  `;

  // Transform regionIds to the format expected by GraphQL
  const regionConnections = regionIds && regionIds.length > 0 
    ? regionIds.map(id => ({ id }))
    : []

  const response = await keystoneClient(mutation, {
    name,
    accessToken,
    fromAddressId,
    createLabelFunction,
    getRatesFunction,
    validateAddressFunction,
    trackShipmentFunction,
    cancelLabelFunction,
    metadata,
    regionIds: regionConnections
  });

  if (response.success) {
    revalidatePath('/dashboard/platform/shipping-providers');
  }

  return response;
}

/**
 * Update shippingprovider status
 */
export async function updateShippingProviderStatus(id: string, status: string) {
  const mutation = `
    mutation UpdateShippingProviderStatus($id: ID!, $data: ShippingProviderUpdateInput!) {
      updateShippingProvider(where: { id: $id }, data: $data) {
        id
        isActive
      }
    }
  `;

  const response = await keystoneClient(mutation, {
    id,
    data: { isActive: status === 'active' },
  });

  if (response.success) {
    // Revalidate the shippingprovider page to reflect the status change
    revalidatePath(`/dashboard/platform/shipping-providers/${id}`);
    revalidatePath('/dashboard/platform/shipping-providers');

    return {
      success: true,
      data: response.data.updateShippingProvider,
    };
  } else {
    console.error('Error updating shippingprovider status:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to update shippingprovider status',
      data: null,
    };
  }
}
