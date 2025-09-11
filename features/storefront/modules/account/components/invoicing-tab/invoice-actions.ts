"use server";

import { gql } from "graphql-request";
import { openfrontClient } from "@/features/storefront/lib/config";
import { getAuthHeaders } from "@/features/storefront/lib/data/cookies";

// This is EXACTLY like placeOrder but for invoices
export async function completeInvoicePayment(paymentSessionId: string) {
  const headers = await getAuthHeaders();
  
  try {
    const { completeInvoicePayment } = await openfrontClient.request(
      gql`
        mutation CompleteInvoicePayment($paymentSessionId: ID!) {
          completeInvoicePayment(paymentSessionId: $paymentSessionId) {
            id
            status
            success
            message
            error
          }
        }
      `,
      {
        paymentSessionId,
      },
      headers
    );

    if (completeInvoicePayment?.success) {
      return {
        success: true,
        message: completeInvoicePayment.message,
        invoice: completeInvoicePayment
      };
    }

    return completeInvoicePayment;
  } catch (error: any) {
    throw error;
  }
}

// Initiate invoice payment session (like initiatePaymentSession for cart)
export async function initiateInvoicePaymentSession(invoiceId: string, paymentProviderId: string) {
  const headers = await getAuthHeaders();
  
  try {
    const { initiateInvoicePaymentSession } = await openfrontClient.request(
      gql`
        mutation InitiateInvoicePaymentSession($invoiceId: ID!, $paymentProviderId: String!) {
          initiateInvoicePaymentSession(invoiceId: $invoiceId, paymentProviderId: $paymentProviderId) {
            id
            data
            amount
            isInitiated
          }
        }
      `,
      { invoiceId, paymentProviderId },
      headers
    );
    
    return initiateInvoicePaymentSession;
  } catch (error: any) {
    throw error;
  }
}

// Create invoice payment sessions (like createPaymentSessions for cart)
export async function createInvoicePaymentSessions(invoiceId: string) {
  const headers = await getAuthHeaders();
  
  try {
    const { createInvoicePaymentSessions } = await openfrontClient.request(
      gql`
        mutation CreateInvoicePaymentSessions($invoiceId: ID!) {
          createInvoicePaymentSessions(invoiceId: $invoiceId) {
            id
            paymentCollection {
              id
              paymentSessions {
                id
                isSelected
                isInitiated
                amount
                data
                paymentProvider {
                  id
                  code
                }
              }
            }
          }
        }
      `,
      { invoiceId },
      headers
    );
    
    return createInvoicePaymentSessions;
  } catch (error: any) {
    throw error;
  }
}

// Create invoice from line items (like createActiveCart for invoices)
export async function createInvoiceFromLineItems({
  accountId,
  regionId,
  lineItemIds,
  dueDate
}: {
  accountId: string
  regionId: string  
  lineItemIds: string[]
  dueDate?: string
}) {
  const headers = await getAuthHeaders();
  
  try {
    const { createInvoiceFromLineItems } = await openfrontClient.request(
      gql`
        mutation CreateInvoiceFromLineItems($accountId: ID!, $regionId: ID!, $lineItemIds: [ID!]!, $dueDate: String) {
          createInvoiceFromLineItems(accountId: $accountId, regionId: $regionId, lineItemIds: $lineItemIds, dueDate: $dueDate) {
            success
            invoiceId
            message
            error
          }
        }
      `,
      { accountId, regionId, lineItemIds, dueDate },
      headers
    );
    
    return createInvoiceFromLineItems;
  } catch (error: any) {
    throw error;
  }
}

// Set invoice payment session (like setPaymentSession for cart)
export async function setInvoicePaymentSession(invoiceId: string, providerId: string) {
  const headers = await getAuthHeaders();
  
  try {
    const { setInvoicePaymentSession } = await openfrontClient.request(
      gql`
        mutation SetInvoicePaymentSession($invoiceId: ID!, $providerId: ID!) {
          setInvoicePaymentSession(invoiceId: $invoiceId, providerId: $providerId) {
            id
            paymentCollection {
              id
              paymentSessions {
                id
                isSelected
                isInitiated
                amount
                data
                paymentProvider {
                  id
                  code
                }
              }
            }
          }
        }
      `,
      { invoiceId, providerId },
      headers
    );
    
    return setInvoicePaymentSession;
  } catch (error: any) {
    throw error;
  }
}

// Get invoice payment sessions (workaround for access control issues)
export async function getInvoicePaymentSessions(invoiceId: string) {
  const headers = await getAuthHeaders();
  
  try {
    const { getInvoicePaymentSessions } = await openfrontClient.request(
      gql`
        query GetInvoicePaymentSessions($invoiceId: ID!) {
          getInvoicePaymentSessions(invoiceId: $invoiceId) {
            id
            paymentProvider {
              id
              code
            }
            data
            isSelected
            isInitiated
          }
        }
      `,
      { invoiceId },
      headers
    );
    
    return getInvoicePaymentSessions;
  } catch (error: any) {
    return [];
  }
}

// Get unpaid line items by region (from backend mutation)
export async function getUnpaidLineItemsByRegion(accountId: string) {
  const headers = await getAuthHeaders();
  
  try {
    const { getUnpaidLineItemsByRegion } = await openfrontClient.request(
      gql`
        query GetUnpaidLineItemsByRegion($accountId: ID!) {
          getUnpaidLineItemsByRegion(accountId: $accountId) {
            success
            regions {
              region
              lineItems
              totalAmount
              formattedTotalAmount
              itemCount
            }
            totalRegions
            totalUnpaidItems
            message
          }
        }
      `,
      { accountId },
      headers
    );
    
    return getUnpaidLineItemsByRegion;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch unpaid line items'
    };
  }
}