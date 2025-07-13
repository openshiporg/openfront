/**
 * Shipping Options Actions
 * Manages shipping option data operations using buildWhereClause pattern
 */

'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

export interface ShippingOption {
  id: string;
  name: string;
  uniqueKey: string;
  priceType: 'flat_rate' | 'calculated' | 'free';
  amount?: number;
  isReturn: boolean;
  adminOnly: boolean;
  region?: {
    id: string;
    name: string;
    code: string;
    currency: {
      code: string;
      symbol: string;
    };
  };
  fulfillmentProvider?: {
    id: string;
    name: string;
    code: string;
  };
  shippingProfile?: {
    id: string;
    name: string;
  };
  calculatedAmount?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ShippingOptionResponse {
  success: boolean;
  data?: {
    items: ShippingOption[];
    count: number;
  };
  error?: string;
}

export interface ShippingOptionStatusCounts {
  all: number;
  active: number;
  inactive: number;
  return: number;
}

export interface ShippingOptionStatusCountsResponse {
  success: boolean;
  data?: ShippingOptionStatusCounts;
  error?: string;
}

/**
 * Get shipping options with filters using buildWhereClause pattern
 */
export async function getShippingOptions(
  where: Record<string, unknown> = {},
  take: number = 50,
  skip: number = 0,
  orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }],
  selectedFields: string = `
    id
    name
    uniqueKey
    priceType
    amount
    isReturn
    adminOnly
    region {
      id
      name
      code
      currency {
        code
        symbol
      }
    }
    fulfillmentProvider {
      id
      name
      code
    }
    shippingProfile {
      id
      name
    }
    calculatedAmount
    createdAt
    updatedAt
  `
): Promise<ShippingOptionResponse> {
  const query = `
    query GetShippingOptions($where: ShippingOptionWhereInput, $take: Int!, $skip: Int!, $orderBy: [ShippingOptionOrderByInput!]) {
      items: shippingOptions(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        ${selectedFields}
      }
      count: shippingOptionsCount(where: $where)
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
    console.error('Error fetching shipping options:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch shipping options',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get shipping option status counts for tabs
 */
export async function getShippingOptionStatusCounts(): Promise<ShippingOptionStatusCountsResponse> {
  const query = `
    query GetShippingOptionStatusCounts {
      active: shippingOptionsCount(where: { AND: [{ adminOnly: { equals: false } }, { isReturn: { equals: false } }] })
      return: shippingOptionsCount(where: { isReturn: { equals: true } })
      all: shippingOptionsCount
    }
  `;

  const response = await keystoneClient(query);

  if (response.success) {
    const allCount = response.data.all || 0;
    const activeCount = response.data.active || 0;
    const returnCount = response.data.return || 0;
    const inactiveCount = allCount - activeCount - returnCount;

    return {
      success: true,
      data: {
        all: allCount,
        active: activeCount,
        inactive: inactiveCount,
        return: returnCount,
      },
    };
  } else {
    console.error('Error fetching shipping option status counts:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch shipping option status counts',
      data: { all: 0, active: 0, inactive: 0, return: 0 },
    };
  }
}