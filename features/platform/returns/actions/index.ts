'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

// Interface for return data (exported for potential use in other files)
export interface Return {
  id: string;
  title: string;
  [key: string]: unknown;
}

/**
 * Get list of returns
 */
export async function getReturns(
  where: Record<string, unknown> = {},
  take: number = 10,
  skip: number = 0,
  orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }],
  selectedFields: string = `
    id returnReason status order createdAt
  `
) {
  const query = `
    query GetReturns($where: ReturnWhereInput, $take: Int!, $skip: Int!, $orderBy: [ReturnOrderByInput!]) {
      items: returns(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        ${selectedFields}
      }
      count: returnsCount(where: $where)
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
    console.error('Error fetching returns:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch returns',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get filtered returns with search and pagination
 */
export async function getFilteredReturns(
  status?: string,
  search?: string,
  page: number = 1,
  pageSize: number = 10,
  sort?: string
) {
  // Build where clause
  const where: Record<string, any> = {};
  
  // Status filtering
  if (status && status !== 'all') {
    where.status = { equals: status };
  }
  
  // Search filtering (adjust fields as needed)
  if (search?.trim()) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      // Add more searchable fields as needed
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
    const result = await getReturns(where, pageSize, skip, orderBy);
    return result;
  } catch (error: any) {
    console.error('Error in getFilteredReturns:', error);
    return {
      success: false,
      error: error.message || 'Failed to get filtered returns',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get a single return by ID
 */
export async function getReturn(id: string) {
  const query = `
    query GetReturn($id: ID!) {
      return(where: { id: $id }) {
        id returnReason status order createdAt
      }
    }
  `;

  const response = await keystoneClient(query, { id });

  if (response.success) {
    if (!response.data.return) {
      return {
        success: false,
        error: 'Return not found',
        data: null,
      };
    }

    return {
      success: true,
      data: response.data.return,
    };
  } else {
    console.error('Error fetching return:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch return',
      data: null,
    };
  }
}

/**
 * Get return status counts for StatusTabs
 */
export async function getReturnStatusCounts() {
  const statusKeys = ["active","inactive"];
  
  const statusQueries = statusKeys.map(status => 
    `${status}: returnsCount(where: { status: { equals: ${status} } })`
  ).join('\n      ');
  
  const query = `
    query GetReturnStatusCounts {
      ${statusQueries}
      all: returnsCount
    }
  `;

  const response = await keystoneClient(query);

  if (response.success) {
    const counts: Record<string, number> = {
      all: response.data.all || 0,
    };
    
    statusKeys.forEach(status => {
      counts[status] = response.data[status] || 0;
    });
    
    return {
      success: true,
      data: counts,
    };
  } else {
    console.error('Error fetching return status counts:', response.error);
    const emptyCounts: Record<string, number> = {
      all: 0,
    };
    
    statusKeys.forEach(status => {
      emptyCounts[status] = 0;
    });
    
    return {
      success: false,
      error: response.error || 'Failed to fetch return status counts',
      data: emptyCounts,
    };
  }
}

/**
 * Update return status
 */
export async function updateReturnStatus(id: string, status: string) {
  const mutation = `
    mutation UpdateReturnStatus($id: ID!, $data: ReturnUpdateInput!) {
      updateReturn(where: { id: $id }, data: $data) {
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
    // Revalidate the return page to reflect the status change
    revalidatePath(`/dashboard/platform/returns/${id}`);
    revalidatePath('/dashboard/platform/returns');

    return {
      success: true,
      data: response.data.updateReturn,
    };
  } else {
    console.error('Error updating return status:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to update return status',
      data: null,
    };
  }
}
