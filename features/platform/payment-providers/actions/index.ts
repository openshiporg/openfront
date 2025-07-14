'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

// Interface for paymentprovider data (exported for potential use in other files)
export interface PaymentProvider {
  id: string;
  name: string;
  [key: string]: unknown;
}

/**
 * Get list of paymentproviders
 */
export async function getPaymentProviders(
  where: Record<string, unknown> = {},
  take: number = 10,
  skip: number = 0,
  orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }],
  selectedFields: string = `
    id
    name
    code
    isInstalled
    metadata
    regions {
      id
      name
      code
      currency {
        code
        symbol
      }
      countries {
        id
        name
        iso2
      }
    }
    createdAt
    updatedAt
  `
) {
  const query = `
    query GetPaymentProviders($where: PaymentProviderWhereInput, $take: Int!, $skip: Int!, $orderBy: [PaymentProviderOrderByInput!]) {
      items: paymentProviders(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        ${selectedFields}
      }
      count: paymentProvidersCount(where: $where)
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
    console.error('Error fetching paymentproviders:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch paymentproviders',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get filtered paymentproviders with search and pagination
 */
export async function getFilteredPaymentProviders(
  isInstalled?: boolean,
  search?: string,
  page: number = 1,
  pageSize: number = 10,
  sort?: string
) {
  // Build where clause
  const where: Record<string, any> = {};
  
  // Status filtering using isInstalled boolean
  if (isInstalled !== undefined) {
    where.isInstalled = { equals: isInstalled };
  }
  
  // Search filtering
  if (search?.trim()) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
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
    const result = await getPaymentProviders(where, pageSize, skip, orderBy);
    return result;
  } catch (error: any) {
    console.error('Error in getFilteredPaymentProviders:', error);
    return {
      success: false,
      error: error.message || 'Failed to get filtered paymentproviders',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get a single paymentprovider by ID
 */
export async function getPaymentProvider(id: string) {
  const query = `
    query GetPaymentProvider($id: ID!) {
      paymentprovider(where: { id: $id }) {
        id name code isInstalled metadata
      }
    }
  `;

  const response = await keystoneClient(query, { id });

  if (response.success) {
    if (!response.data.paymentprovider) {
      return {
        success: false,
        error: 'PaymentProvider not found',
        data: null,
      };
    }

    return {
      success: true,
      data: response.data.paymentprovider,
    };
  } else {
    console.error('Error fetching paymentprovider:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch paymentprovider',
      data: null,
    };
  }
}

/**
 * Get paymentprovider status counts for StatusTabs
 */
export async function getPaymentProviderStatusCounts() {
  const query = `
    query GetPaymentProviderStatusCounts {
      installed: paymentProvidersCount(where: { isInstalled: { equals: true } })
      notInstalled: paymentProvidersCount(where: { isInstalled: { equals: false } })
      all: paymentProvidersCount
    }
  `;

  const response = await keystoneClient(query);

  if (response.success) {
    return {
      success: true,
      data: {
        installed: response.data.installed || 0,
        notInstalled: response.data.notInstalled || 0,
        all: response.data.all || 0
      }
    };
  } else {
    console.error('Error fetching paymentprovider status counts:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch paymentprovider status counts',
      data: { installed: 0, notInstalled: 0, all: 0 }
    };
  }
}

/**
 * Get payment provider region counts for tabs
 */
export async function getPaymentProviderRegionCounts() {
  const query = `
    query GetPaymentProviderRegionCounts {
      all: paymentProvidersCount
      regions {
        id
        name
        paymentProvidersCount
      }
    }
  `;

  const response = await keystoneClient(query);

  if (response.success) {
    const allCount = response.data.all || 0;
    const regions = (response.data.regions || []).map((region: any) => ({
      id: region.id,
      name: region.name,
      count: region.paymentProvidersCount || 0,
    }));

    return {
      success: true,
      data: {
        all: allCount,
        regions,
      },
    };
  } else {
    console.error('Error fetching payment provider region counts:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch payment provider region counts',
      data: { all: 0, regions: [] },
    };
  }
}

/**
 * Create a new payment provider
 */
export interface CreatePaymentProviderInput {
  name: string;
  code: string;
  isInstalled?: boolean;
  createPaymentFunction?: string;
  capturePaymentFunction?: string;
  refundPaymentFunction?: string;
  getPaymentStatusFunction?: string;
  generatePaymentLinkFunction?: string;
  handleWebhookFunction?: string;
  metadata?: Record<string, any>;
  credentials?: Record<string, any>;
  regionIds?: string[];
}

export async function createPaymentProvider(input: CreatePaymentProviderInput) {
  const {
    name,
    code,
    isInstalled = true,
    createPaymentFunction,
    capturePaymentFunction,
    refundPaymentFunction,
    getPaymentStatusFunction,
    generatePaymentLinkFunction,
    handleWebhookFunction,
    metadata,
    credentials,
    regionIds
  } = input;

  const mutation = `
    mutation CreatePaymentProvider(
      $name: String!
      $code: String!
      $isInstalled: Boolean
      $createPaymentFunction: String
      $capturePaymentFunction: String
      $refundPaymentFunction: String
      $getPaymentStatusFunction: String
      $generatePaymentLinkFunction: String
      $handleWebhookFunction: String
      $metadata: JSON
      $credentials: JSON
      $regionIds: [ID!]
    ) {
      createPaymentProvider(data: {
        name: $name
        code: $code
        isInstalled: $isInstalled
        createPaymentFunction: $createPaymentFunction
        capturePaymentFunction: $capturePaymentFunction
        refundPaymentFunction: $refundPaymentFunction
        getPaymentStatusFunction: $getPaymentStatusFunction
        generatePaymentLinkFunction: $generatePaymentLinkFunction
        handleWebhookFunction: $handleWebhookFunction
        metadata: $metadata
        credentials: $credentials
        regions: $regionIds ? { connect: $regionIds } : null
      }) {
        id
        name
        code
        isInstalled
        metadata
        regions {
          id
          name
          code
        }
      }
    }
  `;

  const response = await keystoneClient(mutation, {
    name,
    code,
    isInstalled,
    createPaymentFunction,
    capturePaymentFunction,
    refundPaymentFunction,
    getPaymentStatusFunction,
    generatePaymentLinkFunction,
    handleWebhookFunction,
    metadata,
    credentials,
    regionIds: regionIds?.map(id => ({ id }))
  });

  if (response.success) {
    revalidatePath('/dashboard/platform/payment-providers');
  }

  return response;
}

/**
 * Update paymentprovider installed status
 */
export async function updatePaymentProviderStatus(id: string, isInstalled: boolean) {
  const mutation = `
    mutation UpdatePaymentProviderStatus($id: ID!, $data: PaymentProviderUpdateInput!) {
      updatePaymentProvider(where: { id: $id }, data: $data) {
        id
        isInstalled
      }
    }
  `;

  const response = await keystoneClient(mutation, {
    id,
    data: { isInstalled },
  });

  if (response.success) {
    // Revalidate the paymentprovider page to reflect the status change
    revalidatePath(`/dashboard/platform/payment-providers/${id}`);
    revalidatePath('/dashboard/platform/payment-providers');

    return {
      success: true,
      data: response.data.updatePaymentProvider,
    };
  } else {
    console.error('Error updating paymentprovider status:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to update paymentprovider status',
      data: null,
    };
  }
}
