'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

// Interface for collection data (exported for potential use in other files)
export interface Collection {
  id: string;
  title: string;
  handle: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  products?: Product[];
}

export interface Product {
  id: string;
  title: string;
  status: string;
  thumbnail?: string;
  productVariants?: { id: string }[];
}

/**
 * Get list of collections
 */
export async function getCollections(
  where: Record<string, unknown> = {},
  take: number = 10,
  skip: number = 0,
  orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }],
  selectedFields: string = `
    id
    title
    handle
    metadata
    createdAt
    updatedAt
    products {
      id
      title
      status
      thumbnail
      productVariants {
        id
      }
    }
  `
) {
  const query = `
    query GetCollections($where: ProductCollectionWhereInput, $take: Int!, $skip: Int!, $orderBy: [ProductCollectionOrderByInput!]) {
      items: productCollections(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        ${selectedFields}
      }
      count: productCollectionsCount(where: $where)
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
    console.error('Error fetching collections:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch collections',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get filtered collections with search and pagination (matching Dasher7 approach)
 */
export async function getFilteredCollections(
  search?: string,
  page: number = 1,
  pageSize: number = 10,
  sort?: { field: string; direction: string }
) {
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  let whereClauses: any[] = [];
  if (search) {
    whereClauses.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { handle: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  const where = whereClauses.length > 0 ? { AND: whereClauses } : {};
  const orderBy = sort ? { [sort.field]: sort.direction.toLowerCase() } : { createdAt: 'desc' };

  const query = `
    query GetFilteredCollections(
      $where: ProductCollectionWhereInput
      $take: Int
      $skip: Int
      $orderBy: [ProductCollectionOrderByInput!]
    ) {
      items: productCollections(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        id
        title
        handle
        metadata
        createdAt
        updatedAt
        products {
          id
          title
          status
          thumbnail
          productVariants {
            id
          }
        }
      }
      count: productCollectionsCount(where: $where)
    }
  `;

  const variables = { where, take, skip, orderBy: [orderBy] };
  
  return keystoneClient(query, variables);
}

/**
 * Get a single collection by ID
 */
export async function getCollection(id: string) {
  const query = `
    query GetCollection($id: ID!) {
      productCollection(where: { id: $id }) {
        id
        title
        handle
        metadata
        createdAt
        updatedAt
        products {
          id
          title
          status
          thumbnail
          productVariants {
            id
          }
        }
      }
    }
  `;

  const response = await keystoneClient(query, { id });

  if (response.success) {
    if (!response.data.productCollection) {
      return {
        success: false,
        error: 'Collection not found',
        data: null,
      };
    }

    return {
      success: true,
      data: response.data.productCollection,
    };
  } else {
    console.error('Error fetching collection:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch collection',
      data: null,
    };
  }
}

/**
 * Get collection status counts for StatusTabs (collections don't have status, only total count)
 */
export async function getCollectionStatusCounts() {
  const query = `
    query GetCollectionStatusCounts {
      all: productCollectionsCount
    }
  `;

  return keystoneClient(query);
}

/**
 * Update collection status
 */
export async function updateCollectionStatus(id: string, status: string) {
  const mutation = `
    mutation UpdateCollectionStatus($id: ID!, $data: ProductCollectionUpdateInput!) {
      updateProductCollection(where: { id: $id }, data: $data) {
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
    // Revalidate the collection page to reflect the status change
    revalidatePath(`/dashboard/platform/product-collections/${id}`);
    revalidatePath('/dashboard/platform/product-collections');

    return {
      success: true,
      data: response.data.updateProductCollection,
    };
  } else {
    console.error('Error updating collection status:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to update collection status',
      data: null,
    };
  }
}
