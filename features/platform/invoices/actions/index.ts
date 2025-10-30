'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

// Interface for account data (exported for potential use in other files)
export interface Account {
  id: string;
  accountNumber: string;
  title: string;
  description?: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  creditLimit: number;
  balanceDue: number;
  formattedTotal: string;
  formattedCurrentBalance: string;
  formattedCreditLimit: string;
  availableCredit: number;
  currency: {
    id: string;
    code: string;
    symbol: string;
  };
  dueDate?: string;
  paidAt?: string;
  suspendedAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  orders: Array<{
    id: string;
    displayId: string;
    total: string;
  }>;
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/**
 * Get list of accounts
 */
export async function getInvoices(
  where: Record<string, unknown> = {},
  take: number = 10,
  skip: number = 0,
  orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }],
  selectedFields: string = `
    id
    accountNumber
    title
    description
    status
    totalAmount
    paidAmount
    creditLimit
    balanceDue
    formattedTotal
    formattedCurrentBalance
    formattedCreditLimit
    availableCredit
    currency {
      id
      code
      symbol
    }
    dueDate
    paidAt
    suspendedAt
    user {
      id
      name
      email
    }
    orders {
      id
      displayId
      total
    }
    createdAt
    updatedAt
  `
) {
  const query = `
    query GetAccounts($where: AccountWhereInput, $take: Int!, $skip: Int!, $orderBy: [AccountOrderByInput!]) {
      items: accounts(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        ${selectedFields}
      }
      count: accountsCount(where: $where)
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
    console.error('Error fetching accounts:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch accounts',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get filtered accounts with search and pagination
 */
export async function getFilteredInvoices(
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
      { accountNumber: { contains: search, mode: 'insensitive' } },
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
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
    const result = await getInvoices(where, pageSize, skip, orderBy);
    return result;
  } catch (error: any) {
    console.error('Error in getFilteredInvoices:', error);
    return {
      success: false,
      error: error.message || 'Failed to get filtered accounts',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get a single account by ID
 */
export async function getInvoice(id: string) {
  const query = `
    query GetAccount($id: ID!) {
      account(where: { id: $id }) {
        id
        accountNumber
        title
        description
        status
        totalAmount
        paidAmount
        creditLimit
        balanceDue
        formattedTotal
        formattedCurrentBalance
        formattedCreditLimit
        availableCredit
        currency {
          id
          code
          symbol
        }
        dueDate
        paidAt
        suspendedAt
        user {
          id
          name
          email
        }
        orders {
          id
          displayId
          total
        }
        createdAt
        updatedAt
      }
    }
  `;

  const response = await keystoneClient(query, { id });

  if (response.success) {
    if (!response.data.account) {
      return {
        success: false,
        error: 'Account not found',
        data: null,
      };
    }

    return {
      success: true,
      data: response.data.account,
    };
  } else {
    console.error('Error fetching account:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch account',
      data: null,
    };
  }
}

/**
 * Get account status counts for StatusTabs
 */
export async function getInvoiceStatusCounts() {
  const statusKeys = ["active", "suspended", "not_approved", "paid", "overdue"];
  
  const statusQueries = statusKeys.map(status => {
    return `${status}: accountsCount(where: { status: { equals: "${status}" } })`;
  }).join('\n      ');
  
  const query = `
    query GetAccountStatusCounts {
      ${statusQueries}
      all: accountsCount
    }
  `;

  const response = await keystoneClient(query);

  if (response.success) {
    const counts: Record<string, number> = {
      all: response.data.all || 0,
      active: response.data.active || 0,
      suspended: response.data.suspended || 0,
      not_approved: response.data.not_approved || 0,
      paid: response.data.paid || 0,
      overdue: response.data.overdue || 0,
    };
    
    return {
      success: true,
      data: counts,
    };
  } else {
    console.error('Error fetching account status counts:', response.error);
    const emptyCounts: Record<string, number> = {
      all: 0,
      active: 0,
      suspended: 0,
      not_approved: 0,
      paid: 0,
      overdue: 0,
    };
    
    return {
      success: false,
      error: response.error || 'Failed to fetch account status counts',
      data: emptyCounts,
    };
  }
}

/**
 * Update account status
 */
export async function updateInvoiceStatus(id: string, status: string) {
  const mutation = `
    mutation UpdateAccountStatus($id: ID!, $data: AccountUpdateInput!) {
      updateAccount(where: { id: $id }, data: $data) {
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
    // Revalidate the account page to reflect the status change
    revalidatePath(`/dashboard/platform/invoices/${id}`);
    revalidatePath('/dashboard/platform/invoices');

    return {
      success: true,
      data: response.data.updateAccount,
    };
  } else {
    console.error('Error updating account status:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to update account status',
      data: null,
    };
  }
}