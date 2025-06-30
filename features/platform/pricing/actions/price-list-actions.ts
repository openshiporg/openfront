'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

export interface PriceList {
  id: string;
  name: string;
  description?: string;
  type: 'sale' | 'override';
  status: 'active' | 'draft';
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt?: string;
  customerGroups?: Array<{
    id: string;
    name: string;
  }>;
  moneyAmounts?: Array<{
    id: string;
    amount: number;
    compareAmount?: number;
    minQuantity?: number;
    maxQuantity?: number;
    currency: { code: string; symbol: string };
    productVariant: {
      id: string;
      title: string;
      sku?: string;
      product: {
        id: string;
        title: string;
        thumbnail?: string;
      };
    };
  }>;
}

/**
 * Get list of price lists with enhanced fields
 */
export async function getPriceLists(
  where: Record<string, unknown> = {},
  take: number = 10,
  skip: number = 0,
  orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }],
  selectedFields: string = `
    id name description type status startsAt endsAt createdAt updatedAt
    customerGroups {
      id name
    }
    moneyAmounts {
      id amount compareAmount minQuantity maxQuantity
      currency { code symbol }
      productVariant {
        id title sku
        product {
          id title thumbnail
        }
      }
    }
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
    console.error('Error fetching price lists:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch price lists',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get filtered price lists with search and pagination
 */
export async function getFilteredPriceLists(
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
      where.status = { equals: 'active' };
    } else if (status === 'draft') {
      where.status = { equals: 'draft' };
    } else if (status === 'scheduled') {
      where.AND = [
        { startsAt: { gt: new Date().toISOString() } },
        { status: { equals: 'active' } }
      ];
    } else if (status === 'expired') {
      where.endsAt = { lt: new Date().toISOString() };
    }
  }
  
  // Search filtering
  if (search?.trim()) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
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
    const result = await getPriceLists(where, pageSize, skip, orderBy);
    return result;
  } catch (error: any) {
    console.error('Error in getFilteredPriceLists:', error);
    return {
      success: false,
      error: error.message || 'Failed to get filtered price lists',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get price list status counts for StatusTabs
 */
export async function getPriceListStatusCounts() {
  const now = new Date().toISOString();
  
  const query = `
    query GetPriceListStatusCounts {
      active: priceListsCount(where: { status: { equals: "active" } })
      draft: priceListsCount(where: { status: { equals: "draft" } })
      scheduled: priceListsCount(where: { 
        AND: [
          { startsAt: { gt: "${now}" } },
          { status: { equals: "active" } }
        ]
      })
      expired: priceListsCount(where: { endsAt: { lt: "${now}" } })
      all: priceListsCount
    }
  `;

  const response = await keystoneClient(query);

  if (response.success) {
    return {
      success: true,
      data: {
        all: response.data.all || 0,
        active: response.data.active || 0,
        draft: response.data.draft || 0,
        scheduled: response.data.scheduled || 0,
        expired: response.data.expired || 0,
      },
    };
  } else {
    console.error('Error fetching price list status counts:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch price list status counts',
      data: {
        all: 0,
        active: 0,
        draft: 0,
        scheduled: 0,
        expired: 0,
      },
    };
  }
}