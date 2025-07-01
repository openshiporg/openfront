'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

export interface Discount {
  id: string;
  code: string;
  isDynamic?: boolean;
  isDisabled?: boolean;
  stackable?: boolean;
  startsAt?: string;
  endsAt?: string;
  usageLimit?: number;
  usageCount?: number;
  validDuration?: number;
  createdAt: string;
  updatedAt?: string;
  discountRule?: {
    id: string;
    type: 'percentage' | 'fixed' | 'free_shipping';
    value: number;
    description?: string;
    allocation?: 'total' | 'item';
  };
  orders?: Array<{
    id: string;
    displayId: string;
    createdAt: string;
    status: string;
    total: number;
    currency: { code: string; symbol: string };
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

/**
 * Get list of discounts with enhanced fields
 */
export async function getDiscounts(
  where: Record<string, unknown> = {},
  take: number = 10,
  skip: number = 0,
  orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }],
  selectedFields: string = `
    id code isDynamic isDisabled stackable startsAt endsAt usageLimit usageCount validDuration createdAt updatedAt
    discountRule {
      id type value description allocation
    }
    orders {
      id displayId createdAt status total
      currency { code symbol }
      user { id name email }
    }
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
  status?: string,
  search?: string,
  page: number = 1,
  pageSize: number = 10,
  sort?: string
) {
  const where: Record<string, any> = {};
  
  // Status filtering - using correct boolean values from Dasher7
  if (status && status !== 'all') {
    if (status === 'active') {
      where.isDisabled = { equals: false };
    } else if (status === 'disabled') {
      where.isDisabled = { equals: true };
    }
  }
  
  // Search filtering
  if (search?.trim()) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { discountRule: { description: { contains: search, mode: 'insensitive' } } },
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
 * Get discount status counts for StatusTabs - matching Dasher7 pattern
 */
export async function getDiscountStatusCounts() {
  const query = `
    query GetDiscountStatusCounts {
      active: discountsCount(where: { isDisabled: { equals: false } })
      disabled: discountsCount(where: { isDisabled: { equals: true } })
      all: discountsCount
    }
  `;

  const response = await keystoneClient(query);

  if (response.success) {
    return {
      success: true,
      data: {
        all: response.data.all || 0,
        active: response.data.active || 0,
        disabled: response.data.disabled || 0,
      },
    };
  } else {
    console.error('Error fetching discount status counts:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch discount status counts',
      data: {
        all: 0,
        active: 0,
        disabled: 0,
      },
    };
  }
}