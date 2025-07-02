'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

// Interface for productcategory data (exported for potential use in other files)
export interface ProductCategory {
  id: string;
  title: string;
  [key: string]: unknown;
}

/**
 * Get list of productcategories
 */
export async function getProductCategories(
  where: Record<string, unknown> = {},
  take: number = 10,
  skip: number = 0,
  orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }],
  selectedFields: string = `
    id title handle isInternal isActive parentCategory { id title } createdAt updatedAt
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
    query GetProductCategories($where: ProductCategoryWhereInput, $take: Int!, $skip: Int!, $orderBy: [ProductCategoryOrderByInput!]) {
      items: productCategories(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        ${selectedFields}
      }
      count: productCategoriesCount(where: $where)
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
    console.error('Error fetching productcategories:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch productcategories',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get filtered productcategories with search and pagination
 */
export async function getFilteredProductCategories(
  isActive?: boolean,
  search?: string,
  page: number = 1,
  pageSize: number = 10,
  sort?: string
) {
  // Build where clause
  const where: Record<string, any> = {};
  
  // Status filtering using isActive boolean
  if (isActive !== undefined) {
    where.isActive = { equals: isActive };
  }
  
  // Search filtering
  if (search?.trim()) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { handle: { contains: search, mode: 'insensitive' } }
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
    const result = await getProductCategories(where, pageSize, skip, orderBy);
    return result;
  } catch (error: any) {
    console.error('Error in getFilteredProductCategories:', error);
    return {
      success: false,
      error: error.message || 'Failed to get filtered productcategories',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get a single productcategory by ID
 */
export async function getProductCategory(id: string) {
  const query = `
    query GetProductCategory($id: ID!) {
      productcategory(where: { id: $id }) {
        id title handle isInternal isActive parentCategory { id title } createdAt updatedAt
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
    if (!response.data.productcategory) {
      return {
        success: false,
        error: 'ProductCategory not found',
        data: null,
      };
    }

    return {
      success: true,
      data: response.data.productcategory,
    };
  } else {
    console.error('Error fetching productcategory:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch productcategory',
      data: null,
    };
  }
}

/**
 * Get productcategory status counts for StatusTabs
 */
export async function getProductCategoryStatusCounts() {
  const query = `
    query GetProductCategoryStatusCounts {
      active: productCategoriesCount(where: { isActive: { equals: true } })
      inactive: productCategoriesCount(where: { isActive: { equals: false } })
      all: productCategoriesCount
    }
  `;

  const response = await keystoneClient(query);

  if (response.success) {
    return {
      success: true,
      data: {
        active: response.data.active || 0,
        inactive: response.data.inactive || 0,
        all: response.data.all || 0
      }
    };
  } else {
    console.error('Error fetching productcategory status counts:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch productcategory status counts',
      data: { active: 0, inactive: 0, all: 0 }
    };
  }
}

/**
 * Update productcategory active status
 */
export async function updateProductCategoryStatus(id: string, isActive: boolean) {
  const mutation = `
    mutation UpdateProductCategoryStatus($id: ID!, $data: ProductCategoryUpdateInput!) {
      updateProductCategory(where: { id: $id }, data: $data) {
        id
        isActive
      }
    }
  `;

  const response = await keystoneClient(mutation, {
    id,
    data: { isActive },
  });

  if (response.success) {
    // Revalidate the productcategory page to reflect the status change
    revalidatePath(`/dashboard/platform/product-categories/${id}`);
    revalidatePath('/dashboard/platform/product-categories');

    return {
      success: true,
      data: response.data.updateProductCategory,
    };
  } else {
    console.error('Error updating productcategory status:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to update productcategory status',
      data: null,
    };
  }
}
