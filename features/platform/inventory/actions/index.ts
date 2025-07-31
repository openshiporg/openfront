'use server';

import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

export interface InventoryItem {
  id: string;
  sku: string;
  location: string;
  quantity: number;
  reservedQuantity: number;
  incomingQuantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'backordered';
  product?: {
    id: string;
    title: string;
    thumbnail?: string;
  };
  variant?: {
    id: string;
    title: string;
    sku: string;
  };
  createdAt: string;
  updatedAt: string;
}

export async function getInventory(
  where = {},
  take = 10,
  skip = 0,
  orderBy = [{ createdAt: 'desc' }]
) {
  const query = `
    query GetInventory($where: InventoryItemWhereInput, $take: Int!, $skip: Int!, $orderBy: [InventoryItemOrderByInput!]) {
      items: inventoryItems(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        id
        sku
        location
        quantity
        reservedQuantity
        incomingQuantity
        status
        product {
          id
          title
          thumbnail
        }
        variant {
          id
          title
          sku
        }
        createdAt
        updatedAt
      }
      count: inventoryItemsCount(where: $where)
    }
  `;

  const response = await keystoneClient(query, { where, take, skip, orderBy });
  
  if (response.success) {
    return {
      success: true,
      data: {
        items: response.data.items || [],
        count: response.data.count || 0
      }
    };
  } else {
    return {
      success: false,
      error: response.error,
      data: { items: [], count: 0 }
    };
  }
}

export async function getFilteredInventory(
  searchParams: any,
  pageSize: number = 10
) {
  const page = parseInt(searchParams.page || '1');
  const search = searchParams.search || '';
  const sortBy = searchParams.sortBy || 'createdAt';
  const status = searchParams['!status_matches'];
  
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // Build where clause
  let where: any = {};

  // Add search conditions
  if (search) {
    where.OR = [
      { sku: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
      { product: { title: { contains: search, mode: 'insensitive' } } },
      { variant: { title: { contains: search, mode: 'insensitive' } } }
    ];
  }

  // Add status filter
  if (status) {
    try {
      const statusArray = JSON.parse(status);
      if (statusArray.length > 0) {
        where.status = { in: statusArray };
      }
    } catch (e) {
      console.error('Failed to parse status filter:', e);
    }
  }

  // Build orderBy
  const orderBy = sortBy.startsWith('-') 
    ? [{ [sortBy.slice(1)]: 'desc' }]
    : [{ [sortBy]: 'asc' }];

  return getInventory(where, take, skip, orderBy);
}

export async function getInventoryStatusCounts() {
  const query = `
    query GetInventoryStatusCounts {
      all: inventoryItemsCount
      inStock: inventoryItemsCount(where: { status: { equals: in_stock } })
      lowStock: inventoryItemsCount(where: { status: { equals: low_stock } })
      outOfStock: inventoryItemsCount(where: { status: { equals: out_of_stock } })
      backordered: inventoryItemsCount(where: { status: { equals: backordered } })
    }
  `;

  const response = await keystoneClient(query, {});
  
  if (response.success) {
    return {
      all: response.data.all || 0,
      in_stock: response.data.inStock || 0,
      low_stock: response.data.lowStock || 0,
      out_of_stock: response.data.outOfStock || 0,
      backordered: response.data.backordered || 0
    };
  } else {
    return null;
  }
}