'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

// Interface for discount data (exported for potential use in other files)
export interface Discount {
  id: string;
  code: string;
  [key: string]: unknown;
}

/**
 * Get list of discounts
 */
export async function getDiscounts(
  where: Record<string, unknown> = {},
  take: number = 10,
  skip: number = 0,
  orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }],
  selectedFields: string = `
    id code isDynamic isDisabled stackable startsAt endsAt usageLimit usageCount validDuration createdAt updatedAt
  `
) {
  const query = `
    query GetDiscounts($where: DiscountWhereInput, $take: Int!, $skip: Int!, $orderBy: [DiscountOrderByInput!]) {
      items: discounts(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        ${selectedFields}
      }
      count: discountsCount(where: $where)
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
    console.error('Error fetching discounts:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch discounts',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get filtered discounts with search and pagination
 */
export async function getFilteredDiscounts(
  isDisabled?: boolean,
  search?: string,
  page: number = 1,
  pageSize: number = 10,
  sort?: string
) {
  // Build where clause
  const where: Record<string, any> = {};
  
  // Status filtering using isDisabled boolean
  if (isDisabled !== undefined) {
    where.isDisabled = { equals: isDisabled };
  }
  
  // Search filtering
  if (search?.trim()) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } }
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
    const result = await getDiscounts(where, pageSize, skip, orderBy);
    return result;
  } catch (error: any) {
    console.error('Error in getFilteredDiscounts:', error);
    return {
      success: false,
      error: error.message || 'Failed to get filtered discounts',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get a single discount by ID
 */
export async function getDiscount(id: string) {
  const query = `
    query GetDiscount($id: ID!) {
      discount(where: { id: $id }) {
        id code isDynamic isDisabled stackable startsAt endsAt usageLimit usageCount validDuration createdAt updatedAt
      }
    }
  `;

  const response = await keystoneClient(query, { id });

  if (response.success) {
    if (!response.data.discount) {
      return {
        success: false,
        error: 'Discount not found',
        data: null,
      };
    }

    return {
      success: true,
      data: response.data.discount,
    };
  } else {
    console.error('Error fetching discount:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch discount',
      data: null,
    };
  }
}

/**
 * Get discount status counts for StatusTabs
 */
export async function getDiscountStatusCounts() {
  const query = `
    query GetDiscountStatusCounts {
      enabled: discountsCount(where: { isDisabled: { equals: false } })
      disabled: discountsCount(where: { isDisabled: { equals: true } })
      all: discountsCount
    }
  `;

  const response = await keystoneClient(query);

  if (response.success) {
    return {
      success: true,
      data: {
        enabled: response.data.enabled || 0,
        disabled: response.data.disabled || 0,
        all: response.data.all || 0
      }
    };
  } else {
    console.error('Error fetching discount status counts:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch discount status counts',
      data: { enabled: 0, disabled: 0, all: 0 }
    };
  }
}

/**
 * Update discount disabled status
 */
export async function updateDiscountStatus(id: string, isDisabled: boolean) {
  const mutation = `
    mutation UpdateDiscountStatus($id: ID!, $data: DiscountUpdateInput!) {
      updateDiscount(where: { id: $id }, data: $data) {
        id
        isDisabled
      }
    }
  `;

  const response = await keystoneClient(mutation, {
    id,
    data: { isDisabled },
  });

  if (response.success) {
    // Revalidate the discount page to reflect the status change
    revalidatePath(`/dashboard/platform/discounts/${id}`);
    revalidatePath('/dashboard/platform/discounts');

    return {
      success: true,
      data: response.data.updateDiscount,
    };
  } else {
    console.error('Error updating discount status:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to update discount status',
      data: null,
    };
  }
}
