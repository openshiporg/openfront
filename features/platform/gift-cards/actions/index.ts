'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

// Interface for giftcard data (exported for potential use in other files)
export interface GiftCard {
  id: string;
  code: string;
  value: number;
  balance: number;
  isDisabled: boolean;
  endsAt?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  order?: {
    id: string;
    displayId: string;
    total: string;
    user?: {
      id: string;
      name: string;
      email: string;
    };
  };
  giftCardTransactions?: Array<{
    id: string;
    amount: number;
    createdAt: string;
    order?: {
      id: string;
      displayId: string;
      total: string;
    };
  }>;
  region?: {
    id: string;
    name: string;
    currency?: {
      code: string;
      symbol: string;
      name: string;
    };
  };
}

/**
 * Get list of giftcards
 */
export async function getGiftCards(
  where: Record<string, unknown> = {},
  take: number = 10,
  skip: number = 0,
  orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }],
  selectedFields: string = `
    id
    code
    value
    balance
    isDisabled
    endsAt
    metadata
    createdAt
    updatedAt
    order {
      id
      displayId
      total
      user {
        id
        name
        email
      }
    }
    giftCardTransactions {
      id
      amount
      createdAt
      order {
        id
        displayId
        total
      }
    }
    region {
      id
      name
      currency {
        code
        symbol
        name
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
    console.error('Error fetching giftcards:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch giftcards',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get filtered giftcards with search and pagination
 */
export async function getFilteredGiftCards(
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
    const result = await getGiftCards(where, pageSize, skip, orderBy);
    return result;
  } catch (error: any) {
    console.error('Error in getFilteredGiftCards:', error);
    return {
      success: false,
      error: error.message || 'Failed to get filtered giftcards',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get a single giftcard by ID
 */
export async function getGiftCard(id: string) {
  const query = `
    query GetGiftCard($id: ID!) {
      giftcard(where: { id: $id }) {
        id code value balance isDisabled endsAt createdAt updatedAt
      }
    }
  `;

  const response = await keystoneClient(query, { id });

  if (response.success) {
    if (!response.data.giftcard) {
      return {
        success: false,
        error: 'GiftCard not found',
        data: null,
      };
    }

    return {
      success: true,
      data: response.data.giftcard,
    };
  } else {
    console.error('Error fetching giftcard:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch giftcard',
      data: null,
    };
  }
}

/**
 * Get giftcard status counts for StatusTabs
 */
export async function getGiftCardStatusCounts() {
  const query = `
    query GetGiftCardStatusCounts {
      active: giftCardsCount(where: { isDisabled: { equals: false } })
      disabled: giftCardsCount(where: { isDisabled: { equals: true } })
      all: giftCardsCount
    }
  `;

  const response = await keystoneClient(query);

  if (response.success) {
    return {
      success: true,
      data: {
        active: response.data.active || 0,
        disabled: response.data.disabled || 0,
        all: response.data.all || 0
      }
    };
  } else {
    console.error('Error fetching giftcard status counts:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch giftcard status counts',
      data: { active: 0, disabled: 0, all: 0 }
    };
  }
}

/**
 * Update giftcard disabled status
 */
export async function updateGiftCardStatus(id: string, isDisabled: boolean) {
  const mutation = `
    mutation UpdateGiftCardStatus($id: ID!, $data: GiftCardUpdateInput!) {
      updateGiftCard(where: { id: $id }, data: $data) {
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
    // Revalidate the giftcard page to reflect the status change
    revalidatePath(`/dashboard/platform/gift-cards/${id}`);
    revalidatePath('/dashboard/platform/gift-cards');

    return {
      success: true,
      data: response.data.updateGiftCard,
    };
  } else {
    console.error('Error updating giftcard status:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to update giftcard status',
      data: null,
    };
  }
}
