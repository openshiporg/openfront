"use server";

import { gql } from "graphql-request";
import { openfrontClient } from "../config";
import { cache } from "react";
import { getAuthHeaders } from "./cookies";

const CUSTOMER_BUSINESS_ACCOUNT_QUERY = gql`
  query GetCustomerAccounts {
    getCustomerAccounts
  }
`;

const BUSINESS_ACCOUNT_REQUEST_QUERY = gql`
  query GetBusinessAccountRequest($customerId: ID!) {
    businessAccountRequests(where: { user: { id: { equals: $customerId } } }, take: 1) {
      id
      status
      businessName
      businessType
      monthlyOrderVolume
      requestedCreditLimit
      businessDescription
      formattedRequestedCredit
      businessTypeLabel
      volumeLabel
      statusLabel
      submittedAt
      reviewedAt
      reviewNotes
    }
  }
`;

const CUSTOMER_ORDERS_QUERY = gql`
  query GetCustomerOrders {
    getCustomerOrders
  }
`;

const CUSTOMER_PAID_INVOICES_QUERY = gql`
  query GetCustomerPaidInvoices($limit: Int, $offset: Int) {
    getCustomerPaidInvoices(limit: $limit, offset: $offset)
  }
`;

const CREATE_BUSINESS_ACCOUNT_REQUEST_MUTATION = gql`
  mutation CreateBusinessAccountRequest(
    $customerId: ID!
    $businessName: String!
    $businessType: String!
    $monthlyOrderVolume: String!
    $requestedCreditLimit: Int!
    $businessDescription: String!
  ) {
    createBusinessAccountRequest(
      data: {
        user: { connect: { id: $customerId } }
        businessName: $businessName
        businessType: $businessType
        monthlyOrderVolume: $monthlyOrderVolume
        requestedCreditLimit: $requestedCreditLimit
        businessDescription: $businessDescription
        status: "pending"
      }
    ) {
      id
      status
      businessName
      businessType
      formattedRequestedCredit
      submittedAt
    }
  }
`;

export const getCustomerBusinessAccount = cache(async function (customerId: string) {
  const headers = await getAuthHeaders();
  
  try {
    const { getCustomerAccounts } = await openfrontClient.request(
      CUSTOMER_BUSINESS_ACCOUNT_QUERY,
      {},
      headers
    );
    return getCustomerAccounts?.[0] || null;
  } catch (error) {
    console.error('Error fetching customer business account:', error);
    throw error;
  }
});

export const getBusinessAccountRequest = cache(async function (customerId: string) {
  const headers = await getAuthHeaders();
  
  try {
    const { businessAccountRequests } = await openfrontClient.request(
      BUSINESS_ACCOUNT_REQUEST_QUERY,
      { customerId },
      headers
    );
    return businessAccountRequests?.[0] || null;
  } catch (error) {
    console.error('Error fetching business account request:', error);
    throw error;
  }
});

export const getCustomerOrdersForAccount = cache(async function (customerId: string) {
  const headers = await getAuthHeaders();
  
  try {
    const { getCustomerOrders } = await openfrontClient.request(
      CUSTOMER_ORDERS_QUERY,
      {},
      headers
    );
    return getCustomerOrders || [];
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    throw error;
  }
});

export async function createBusinessAccountRequest(formData: {
  customerId: string;
  businessName: string;
  businessEmail: string;
  businessPhone?: string;
  businessAddress?: string;
  taxId?: string;
}) {
  const headers = await getAuthHeaders();
  
  try {
    const { createBusinessAccountRequest } = await openfrontClient.request(
      CREATE_BUSINESS_ACCOUNT_REQUEST_MUTATION,
      formData,
      headers
    );
    return createBusinessAccountRequest;
  } catch (error) {
    console.error('Error creating business account request:', error);
    throw error;
  }
}

// Server actions for form handling
export async function submitBusinessAccountRequest(prevState: any, formData: FormData) {
  try {
    const headers = await getAuthHeaders();
    
    const { createBusinessAccountRequest } = await openfrontClient.request(
      CREATE_BUSINESS_ACCOUNT_REQUEST_MUTATION,
      {
        customerId: formData.get('customerId') as string,
        businessName: formData.get('businessName') as string,
        businessType: formData.get('businessType') as string,
        monthlyOrderVolume: formData.get('monthlyOrderVolume') as string,
        requestedCreditLimit: parseInt(formData.get('requestedCreditLimit') as string) || 100000,
        businessDescription: formData.get('businessDescription') as string,
      },
      headers
    );
    
    return {
      success: true,
      message: 'Business account request submitted successfully',
      data: createBusinessAccountRequest
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to submit business account request'
    };
  }
}

export async function updateWebhookUrl(prevState: any, formData: FormData) {
  console.log('SERVER ACTION updateWebhookUrl called!');
  try {
    const headers = await getAuthHeaders();
    const webhookUrl = formData.get('webhookUrl') as string;
    
    console.log('Updating webhook URL:', { webhookUrl: webhookUrl.trim(), headers });
    
    const result = await openfrontClient.request(
      gql`
        mutation UpdateUserWebhookUrl($data: UserUpdateProfileInput!) {
          updateActiveUser(data: $data) {
            id
            orderWebhookUrl
          }
        }
      `,
      {
        data: { orderWebhookUrl: webhookUrl.trim() }
      },
      headers
    );
    
    console.log('GraphQL result:', result);
    
    if (!result || !result.updateActiveUser) {
      throw new Error('No response from updateActiveUser mutation');
    }
    
    return {
      success: true,
      message: 'Webhook URL updated successfully'
    };
  } catch (error: any) {
    console.error('Error updating webhook URL:', error);
    return {
      success: false,
      error: error.message || 'Failed to update webhook URL'
    };
  }
}

export async function regenerateCustomerToken(prevState: any, formData: FormData) {
  try {
    const headers = await getAuthHeaders();
    
    const { regenerateCustomerToken } = await openfrontClient.request(
      gql`
        mutation RegenerateCustomerToken {
          regenerateCustomerToken {
            success
            token
          }
        }
      `,
      {},
      headers
    );
    
    return {
      success: regenerateCustomerToken.success,
      token: regenerateCustomerToken.token,
      message: regenerateCustomerToken.success ? 'Token regenerated successfully' : 'Failed to regenerate token'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to regenerate token'
    };
  }
}

export const getCustomerPaidInvoices = cache(async function (limit: number = 10, offset: number = 0) {
  const headers = await getAuthHeaders();
  
  try {
    const { getCustomerPaidInvoices } = await openfrontClient.request(
      CUSTOMER_PAID_INVOICES_QUERY,
      { limit, offset },
      headers
    );
    return getCustomerPaidInvoices || [];
  } catch (error) {
    console.error('Error fetching customer paid invoices:', error);
    throw error;
  }
});