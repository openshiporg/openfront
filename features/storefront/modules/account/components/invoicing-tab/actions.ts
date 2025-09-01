"use server";

import { gql } from "graphql-request";
import { openfrontClient } from "@/features/storefront/lib/config";
import { getAuthHeaders } from "@/features/storefront/lib/data/cookies";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const CREATE_INVOICE_FROM_LINE_ITEMS_MUTATION = gql`
  mutation CreateInvoiceFromLineItems($accountId: ID!, $regionId: ID!, $lineItemIds: [ID!]!) {
    createInvoiceFromLineItems(accountId: $accountId, regionId: $regionId, lineItemIds: $lineItemIds) {
      success
      invoice {
        id
        invoiceNumber
        totalAmount
        formattedTotal
      }
      message
      error
    }
  }
`;

const PAY_INVOICE_MUTATION = gql`
  mutation PayInvoice($invoiceId: ID!, $paymentData: PaymentInput!) {
    payInvoice(invoiceId: $invoiceId, paymentData: $paymentData) {
      success
      message
      error
    }
  }
`;

const GET_UNPAID_LINE_ITEMS_BY_REGION_QUERY = gql`
  query GetUnpaidLineItemsByRegion($accountId: ID!) {
    getUnpaidLineItemsByRegion(accountId: $accountId) {
      success
      totalRegions
      totalUnpaidItems
      message
    }
  }
`;

export async function createPaymentIntent({
  businessAccountId,
  regionId,
  amount,
  currency = 'usd'
}: {
  businessAccountId: string
  regionId: string
  amount: number
  currency?: string
}) {
  const headers = await getAuthHeaders();
  
  try {
    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        businessAccountId,
        regionId,
        type: 'business_account_payment'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };

  } catch (error: any) {
    console.error('Error creating payment intent:', {
      businessAccountId,
      regionId,
      amount,
      currency,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return {
      success: false,
      error: error.message || 'Failed to create payment intent'
    };
  }
}

export async function confirmPayment({
  paymentIntentId,
  businessAccountId,
  regionId
}: {
  paymentIntentId: string
  businessAccountId: string
  regionId: string
}) {
  const headers = await getAuthHeaders();
  
  try {
    // Verify payment was successful
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return {
        success: false,
        error: 'Payment was not successful'
      };
    }

    // Get unpaid line items for this region
    const { getUnpaidLineItemsByRegion } = await openfrontClient.request(
      GET_UNPAID_LINE_ITEMS_BY_REGION_QUERY,
      {
        accountId: businessAccountId
      },
      headers
    );

    if (!getUnpaidLineItemsByRegion.success || !getUnpaidLineItemsByRegion.regions.length) {
      return {
        success: false,
        error: 'No unpaid line items found'
      };
    }

    // Find the specific region
    const targetRegion = getUnpaidLineItemsByRegion.regions.find((r: any) => r.region.id === regionId);
    
    if (!targetRegion || !targetRegion.lineItems.length) {
      return {
        success: false,
        error: 'No unpaid line items found for this region'
      };
    }

    const lineItemIds = targetRegion.lineItems.map((item: any) => item.id);

    // Create invoice from line items
    const { createInvoiceFromLineItems } = await openfrontClient.request(
      CREATE_INVOICE_FROM_LINE_ITEMS_MUTATION,
      {
        accountId: businessAccountId,
        regionId: regionId,
        lineItemIds: lineItemIds
      },
      headers
    );

    if (!createInvoiceFromLineItems.success) {
      return {
        success: false,
        error: createInvoiceFromLineItems.error || 'Failed to create invoice'
      };
    }

    const invoice = createInvoiceFromLineItems.invoice;

    // Mark invoice as paid with Stripe payment
    const { payInvoice } = await openfrontClient.request(
      PAY_INVOICE_MUTATION,
      {
        invoiceId: invoice.id,
        paymentData: {
          paymentMethod: 'stripe',
          data: {
            paymentIntentId: paymentIntentId,
            paymentType: 'region_payment',
            regionId: regionId,
            stripePaymentId: paymentIntent.id,
            amount: paymentIntent.amount / 100, // Convert back from cents
            currency: paymentIntent.currency,
            processedAt: new Date().toISOString(),
          }
        }
      },
      headers
    );

    if (!payInvoice.success) {
      return {
        success: false,
        error: payInvoice.error || 'Payment processing failed'
      };
    }

    return {
      success: true,
      message: `Payment of ${invoice.formattedTotal} processed successfully`,
      paymentIntent
    };

  } catch (error: any) {
    console.error('Error confirming payment:', {
      paymentIntentId,
      businessAccountId,
      regionId,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return {
      success: false,
      error: error.message || 'Failed to confirm payment'
    };
  }
}

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
    console.error('Error fetching unpaid line items:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch unpaid line items'
    };
  }
}

export async function payBusinessAccountInvoice({
  businessAccountId,
  regionId,
  paymentData
}: {
  businessAccountId: string
  regionId: string
  paymentData: {
    cardNumber: string
    expiryDate: string
    cvc: string
    nameOnCard: string
    couponCode?: string
  }
}) {
  const headers = await getAuthHeaders();
  
  try {
    // First, get the unpaid line items for this region
    const { getUnpaidLineItemsByRegion } = await openfrontClient.request(
      GET_UNPAID_LINE_ITEMS_BY_REGION_QUERY,
      {
        accountId: businessAccountId,
        regionId: regionId
      },
      headers
    );

    if (!getUnpaidLineItemsByRegion.success || !getUnpaidLineItemsByRegion.lineItems.length) {
      return {
        success: false,
        error: getUnpaidLineItemsByRegion.error || 'No unpaid line items found for this region'
      };
    }

    const lineItemIds = getUnpaidLineItemsByRegion.lineItems.map((item: any) => item.id);

    // Create invoice from line items
    const { createInvoiceFromLineItems } = await openfrontClient.request(
      CREATE_INVOICE_FROM_LINE_ITEMS_MUTATION,
      {
        accountId: businessAccountId,
        regionId: regionId,
        lineItemIds: lineItemIds
      },
      headers
    );

    if (!createInvoiceFromLineItems.success) {
      return {
        success: false,
        error: createInvoiceFromLineItems.error || 'Failed to create invoice'
      };
    }

    const invoice = createInvoiceFromLineItems.invoice;

    // Process payment with Stripe (for now, using manual payment)
    // TODO: Integrate with actual Stripe Elements and payment confirmation
    const { payInvoice } = await openfrontClient.request(
      PAY_INVOICE_MUTATION,
      {
        invoiceId: invoice.id,
        paymentData: {
          paymentMethod: 'stripe',
          data: {
            paymentType: 'region_payment',
            regionId: regionId,
            nameOnCard: paymentData.nameOnCard,
            cardLast4: paymentData.cardNumber.slice(-4),
            processedAt: new Date().toISOString(),
            // In production, this would include Stripe payment intent ID
            mockPayment: true
          }
        }
      },
      headers
    );

    if (!payInvoice.success) {
      return {
        success: false,
        error: payInvoice.error || 'Payment processing failed'
      };
    }

    return {
      success: true,
      message: `Payment of ${invoice.formattedTotal} processed successfully`
    };

  } catch (error: any) {
    console.error('Error processing business account payment:', {
      businessAccountId,
      regionId,
      paymentData: {
        nameOnCard: paymentData.nameOnCard,
        cardLast4: paymentData.cardNumber?.slice(-4)
      },
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return {
      success: false,
      error: error.message || 'Failed to process payment'
    };
  }
}