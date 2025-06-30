'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

export interface GiftCard {
  id: string;
  code: string;
  value: number;
  balance: number;
  isDisabled?: boolean;
  endsAt?: string;
  createdAt: string;
  updatedAt?: string;
  region?: {
    id: string;
    name: string;
    currency: { code: string; symbol: string };
  };
  order?: {
    id: string;
    displayId: string;
  };
  giftCardTransactions?: Array<{
    id: string;
    amount: number;
    createdAt: string;
    order?: {
      id: string;
      displayId: string;
      status: string;
      total: number;
      user: { name: string; email: string };
    };
  }>;
}

/**
 * Get list of gift cards with enhanced fields
 */
export async function getGiftCards(
  where: Record<string, unknown> = {},
  take: number = 10,
  skip: number = 0,
  orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }],
  selectedFields: string = `
    id code value balance isDisabled endsAt createdAt updatedAt
    region {
      id name
      currency { code symbol }
    }
    order {
      id displayId
    }
    giftCardTransactions {
      id amount createdAt
      order {
        id displayId status total
        user { name email }
      }
    }
  `
) {
  const query = `
    query GetGiftCards($where: GiftCardWhereInput, $take: Int!, $skip: Int!, $orderBy: [GiftCardOrderByInput!]) {
      items: giftCards(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        ${selectedFields}
      }
      count: giftCardsCount(where: $where)
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
    console.error('Error fetching gift cards:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch gift cards',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get filtered gift cards with search and pagination
 */
export async function getFilteredGiftCards(
  status?: string,
  search?: string,
  page: number = 1,
  pageSize: number = 10,
  sort?: string
) {
  const where: Record<string, any> = {};
  
  // Status filtering
  if (status && status !== 'all') {
    if (status === 'active') {
      where.isDisabled = { equals: false };
      where.balance = { gt: 0 };
    } else if (status === 'depleted') {
      where.balance = { equals: 0 };
    } else if (status === 'disabled') {
      where.isDisabled = { equals: true };
    } else if (status === 'expired') {
      where.endsAt = { lt: new Date().toISOString() };
    }
  }
  
  // Search filtering
  if (search?.trim()) {
    where.OR = [
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

  const skip = (page - 1) * pageSize;

  try {
    const result = await getGiftCards(where, pageSize, skip, orderBy);
    return result;
  } catch (error: any) {
    console.error('Error in getFilteredGiftCards:', error);
    return {
      success: false,
      error: error.message || 'Failed to get filtered gift cards',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get gift card status counts for StatusTabs
 */
export async function getGiftCardStatusCounts() {
  const query = `
    query GetGiftCardStatusCounts {
      active: giftCardsCount(where: { 
        AND: [
          { isDisabled: { equals: false } },
          { balance: { gt: 0 } }
        ]
      })
      depleted: giftCardsCount(where: { balance: { equals: 0 } })
      disabled: giftCardsCount(where: { isDisabled: { equals: true } })
      all: giftCardsCount
    }
  `;

  const response = await keystoneClient(query);

  if (response.success) {
    return {
      success: true,
      data: {
        all: response.data.all || 0,
        active: response.data.active || 0,
        depleted: response.data.depleted || 0,
        disabled: response.data.disabled || 0,
      },
    };
  } else {
    console.error('Error fetching gift card status counts:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch gift card status counts',
      data: {
        all: 0,
        active: 0,
        depleted: 0,
        disabled: 0,
      },
    };
  }
}