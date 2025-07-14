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

export interface ShippingOptionRegionCounts {
  all: number;
  regions: Array<{
    id: string;
    name: string;
    count: number;
  }>;
}

export interface ShippingOptionRegionCountsResponse {
  success: boolean;
  data?: ShippingOptionRegionCounts;
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
 * Get shipping option region counts for tabs
 */
export async function getShippingOptionRegionCounts(): Promise<ShippingOptionRegionCountsResponse> {
  const query = `
    query GetShippingOptionRegionCounts {
      all: shippingOptionsCount
      regions {
        id
        name
        shippingOptionsCount
      }
    }
  `;

  const response = await keystoneClient(query);

  if (response.success) {
    const allCount = response.data.all || 0;
    const regions = (response.data.regions || []).map((region: any) => ({
      id: region.id,
      name: region.name,
      count: region.shippingOptionsCount || 0,
    }));

    return {
      success: true,
      data: {
        all: allCount,
        regions,
      },
    };
  } else {
    console.error('Error fetching shipping option region counts:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch shipping option region counts',
      data: { all: 0, regions: [] },
    };
  }
}