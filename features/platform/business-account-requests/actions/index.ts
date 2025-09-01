'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

// Interface for business account request data
export interface BusinessAccountRequest {
  id: string;
  businessName: string;
  businessType: string;
  monthlyOrderVolume: string;
  requestedCreditLimit: number;
  formattedRequestedCredit: string;
  businessDescription: string;
  status: string;
  statusLabel: string;
  submittedAt: string;
  reviewNotes?: string;
  approvedCreditLimit?: number;
  formattedApprovedCredit?: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

/**
 * Get business account requests with filtering, pagination, and sorting
 */
export async function getBusinessAccountRequests(
  where: any = {},
  take: number = 50,
  skip: number = 0,
  orderBy: any = { createdAt: 'desc' }
) {
  try {
    const query = `
      query GetBusinessAccountRequests($where: BusinessAccountRequestWhereInput, $take: Int, $skip: Int, $orderBy: [BusinessAccountRequestOrderByInput!]) {
        businessAccountRequests(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
          id
          businessName
          businessType
          monthlyOrderVolume
          requestedCreditLimit
          formattedRequestedCredit
          businessDescription
          status
          statusLabel
          submittedAt
          reviewNotes
          approvedCreditLimit
          formattedApprovedCredit
          user {
            id
            name
            email
          }
        }
        businessAccountRequestsCount(where: $where)
      }
    `;

    const variables = {
      where,
      take,
      skip,
      orderBy
    };

    const result = await keystoneClient(query, variables);

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return {
        success: false,
        error: result.errors[0]?.message || 'Unknown GraphQL error',
        data: { items: [], count: 0 }
      };
    }

    return {
      success: true,
      data: {
        items: result.data?.businessAccountRequests || [],
        count: result.data?.businessAccountRequestsCount || 0
      }
    };
  } catch (error: any) {
    console.error('Error in getBusinessAccountRequests:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch business account requests',
      data: { items: [], count: 0 }
    };
  }
}

/**
 * Get business account request status counts for tabs
 */
export async function getBusinessAccountRequestStatusCounts() {
  try {
    const query = `
      query GetBusinessAccountRequestStatusCounts {
        businessAccountRequestsCount
        pendingCount: businessAccountRequestsCount(where: { status: { equals: "pending" } })
        approvedCount: businessAccountRequestsCount(where: { status: { equals: "approved" } })
        notApprovedCount: businessAccountRequestsCount(where: { status: { equals: "not_approved" } })
        requiresInfoCount: businessAccountRequestsCount(where: { status: { equals: "requires_info" } })
      }
    `;

    const result = await keystoneClient(query, {});

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return {
        success: false,
        error: result.errors[0]?.message || 'Unknown GraphQL error',
        data: { all: 0, pending: 0, approved: 0, not_approved: 0, requires_info: 0 }
      };
    }

    const data = result.data;
    return {
      success: true,
      data: {
        all: data?.businessAccountRequestsCount || 0,
        pending: data?.pendingCount || 0,
        approved: data?.approvedCount || 0,
        not_approved: data?.notApprovedCount || 0,
        requires_info: data?.requiresInfoCount || 0
      }
    };
  } catch (error: any) {
    console.error('Error in getBusinessAccountRequestStatusCounts:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch business account request status counts',
      data: { all: 0, pending: 0, approved: 0, not_approved: 0, requires_info: 0 }
    };
  }
}

/**
 * Update business account request status (approve/reject)
 */
export async function updateBusinessAccountRequestStatus(
  id: string,
  status: 'approved' | 'rejected',
  reviewNotes?: string,
  approvedCreditLimit?: number
) {
  try {
    const query = `
      mutation UpdateBusinessAccountRequestStatus($where: BusinessAccountRequestWhereUniqueInput!, $data: BusinessAccountRequestUpdateInput!) {
        updateBusinessAccountRequest(where: $where, data: $data) {
          id
          status
          reviewNotes
          approvedCreditLimit
          formattedApprovedCredit
        }
      }
    `;

    const variables = {
      where: { id },
      data: {
        status,
        reviewNotes,
        ...(approvedCreditLimit && { approvedCreditLimit })
      }
    };

    const result = await keystoneClient(query, variables);

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return {
        success: false,
        error: result.errors[0]?.message || 'Unknown GraphQL error'
      };
    }

    // Revalidate the business account requests list page
    revalidatePath('/platform/business-account-requests');

    return {
      success: true,
      data: result.data?.updateBusinessAccountRequest
    };
  } catch (error: any) {
    console.error('Error in updateBusinessAccountRequestStatus:', error);
    return {
      success: false,
      error: error.message || 'Failed to update business account request status'
    };
  }
}

/**
 * Delete business account request
 */
export async function deleteBusinessAccountRequest(id: string) {
  try {
    const query = `
      mutation DeleteBusinessAccountRequest($where: BusinessAccountRequestWhereUniqueInput!) {
        deleteBusinessAccountRequest(where: $where) {
          id
        }
      }
    `;

    const variables = {
      where: { id }
    };

    const result = await keystoneClient(query, variables);

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return {
        success: false,
        error: result.errors[0]?.message || 'Unknown GraphQL error'
      };
    }

    // Revalidate the business account requests list page
    revalidatePath('/platform/business-account-requests');

    return {
      success: true,
      data: result.data?.deleteBusinessAccountRequest
    };
  } catch (error: any) {
    console.error('Error in deleteBusinessAccountRequest:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete business account request'
    };
  }
}