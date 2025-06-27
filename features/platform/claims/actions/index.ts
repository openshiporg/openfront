'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

// Interface for claim data (exported for potential use in other files)
export interface Claim {
  id: string;
  title: string;
  [key: string]: unknown;
}

/**
 * Get list of claims
 */
export async function getClaims(
  where: Record<string, unknown> = {},
  take: number = 10,
  skip: number = 0,
  orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }],
  selectedFields: string = `
    id type createdAt updatedAt
  `
) {
  const query = `
    query GetClaims($where: ClaimOrderWhereInput, $take: Int!, $skip: Int!, $orderBy: [ClaimOrderOrderByInput!]) {
      items: claimOrders(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        ${selectedFields}
      }
      count: claimOrdersCount(where: $where)
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
    console.error('Error fetching claims:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch claims',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get filtered claims with search and pagination
 */
export async function getFilteredClaims(
  status?: string,
  search?: string,
  page: number = 1,
  pageSize: number = 10,
  sort?: string
) {
  // Build where clause
  const where: Record<string, any> = {};
  
  // Note: ClaimOrder doesn't have status field, so we skip status filtering
  
  // Search filtering - ClaimOrder only has type field that's searchable
  if (search?.trim()) {
    where.OR = [
      { type: { contains: search, mode: 'insensitive' } },
      // ClaimOrder has limited searchable fields
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
    const result = await getClaims(where, pageSize, skip, orderBy);
    return result;
  } catch (error: any) {
    console.error('Error in getFilteredClaims:', error);
    return {
      success: false,
      error: error.message || 'Failed to get filtered claims',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get a single claim by ID
 */
export async function getClaim(id: string) {
  const query = `
    query GetClaim($id: ID!) {
      claimOrder(where: { id: $id }) {
        id type createdAt updatedAt
      }
    }
  `;

  const response = await keystoneClient(query, { id });

  if (response.success) {
    if (!response.data.claimOrder) {
      return {
        success: false,
        error: 'Claim not found',
        data: null,
      };
    }

    return {
      success: true,
      data: response.data.claimOrder,
    };
  } else {
    console.error('Error fetching claim:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch claim',
      data: null,
    };
  }
}

/**
 * Get claim status counts for StatusTabs
 * Note: ClaimOrder doesn't have status field, so we only return total count
 */
export async function getClaimStatusCounts() {
  const query = `
    query GetClaimStatusCounts {
      all: claimOrdersCount
    }
  `;

  const response = await keystoneClient(query);

  if (response.success) {
    return {
      success: true,
      data: {
        all: response.data.all || 0,
      },
    };
  } else {
    console.error('Error fetching claim status counts:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch claim status counts',
      data: {
        all: 0,
      },
    };
  }
}

/**
 * Update claim - Note: ClaimOrder doesn't have status field
 * This function is kept for future use when other fields need updating
 */
export async function updateClaim(id: string, data: Record<string, any>) {
  const mutation = `
    mutation UpdateClaimOrder($id: ID!, $data: ClaimOrderUpdateInput!) {
      updateClaimOrder(where: { id: $id }, data: $data) {
        id
        type
      }
    }
  `;

  const response = await keystoneClient(mutation, {
    id,
    data,
  });

  if (response.success) {
    // Revalidate the claim page to reflect the changes
    revalidatePath(`/dashboard/platform/claims/${id}`);
    revalidatePath('/dashboard/platform/claims');

    return {
      success: true,
      data: response.data.updateClaimOrder,
    };
  } else {
    console.error('Error updating claim:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to update claim',
      data: null,
    };
  }
}
