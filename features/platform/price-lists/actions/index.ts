'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

// Interface for pricelist data (exported for potential use in other files)
export interface PriceList {
  id: string;
  name: string;
  [key: string]: unknown;
}

/**
 * Get list of pricelists
 */
export async function getPriceLists(
  where: Record<string, unknown> = {},
  take: number = 10,
  skip: number = 0,
  orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }],
  selectedFields: string = `
    id name description type status startsAt endsAt createdAt updatedAt
  `
) {
  const query = `
    query GetPriceLists($where: PriceListWhereInput, $take: Int!, $skip: Int!, $orderBy: [PriceListOrderByInput!]) {
      items: priceLists(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        ${selectedFields}
      }
      count: priceListsCount(where: $where)
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
    console.error('Error fetching pricelists:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch pricelists',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get filtered pricelists with search and pagination
 */
export async function getFilteredPriceLists(
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
  
  // Search filtering
  if (search?.trim()) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
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
    const result = await getPriceLists(where, pageSize, skip, orderBy);
    return result;
  } catch (error: any) {
    console.error('Error in getFilteredPriceLists:', error);
    return {
      success: false,
      error: error.message || 'Failed to get filtered pricelists',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get a single pricelist by ID
 */
export async function getPriceList(id: string) {
  const query = `
    query GetPriceList($id: ID!) {
      pricelist(where: { id: $id }) {
        id name description type status startsAt endsAt createdAt updatedAt
      }
    }
  `;

  const response = await keystoneClient(query, { id });

  if (response.success) {
    if (!response.data.pricelist) {
      return {
        success: false,
        error: 'PriceList not found',
        data: null,
      };
    }

    return {
      success: true,
      data: response.data.pricelist,
    };
  } else {
    console.error('Error fetching pricelist:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch pricelist',
      data: null,
    };
  }
}

/**
 * Get pricelist status counts for StatusTabs
 */
export async function getPriceListStatusCounts() {
  const query = `
    query GetPriceListStatusCounts {
      active: priceListsCount(where: { status: { equals: active } })
      draft: priceListsCount(where: { status: { equals: draft } })
      all: priceListsCount
    }
  `;

  const response = await keystoneClient(query);

  if (response.success) {
    return {
      success: true,
      data: {
        active: response.data.active || 0,
        draft: response.data.draft || 0,
        all: response.data.all || 0
      }
    };
  } else {
    console.error('Error fetching pricelist status counts:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch pricelist status counts',
      data: { active: 0, draft: 0, all: 0 }
    };
  }
}

/**
 * Update pricelist status
 */
export async function updatePriceListStatus(id: string, status: string) {
  const mutation = `
    mutation UpdatePriceListStatus($id: ID!, $data: PriceListUpdateInput!) {
      updatePriceList(where: { id: $id }, data: $data) {
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
    // Revalidate the pricelist page to reflect the status change
    revalidatePath(`/dashboard/platform/price-lists/${id}`);
    revalidatePath('/dashboard/platform/price-lists');

    return {
      success: true,
      data: response.data.updatePriceList,
    };
  } else {
    console.error('Error updating pricelist status:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to update pricelist status',
      data: null,
    };
  }
}
