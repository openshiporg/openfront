'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from '../../../dashboard/lib/keystoneClient';

interface CreateFulfillmentInput {
  orderId: string;
  lineItems: {
    lineItemId: string;
    quantity: number;
  }[];
  trackingNumber?: string;
  carrier?: string;
  noNotification?: boolean;
}

interface CreateLabelInput {
  orderId: string;
  providerId: string;
  rateId: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
    unit: 'in' | 'cm';
    weightUnit: 'oz' | 'lb' | 'kg';
  };
  lineItems: {
    lineItemId: string;
    quantity: number;
  }[];
}

// Helper function to generate tracking URLs
function getTrackingUrl(carrier: string, trackingNumber: string): string {
  switch (carrier?.toLowerCase()) {
    case 'ups':
      return `https://www.ups.com/track?tracknum=${trackingNumber}`;
    case 'usps':
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
    case 'fedex':
      return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
    case 'dhl':
      return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
    default:
      return '';
  }
}

export async function createManualFulfillment({
  orderId,
  lineItems,
  trackingNumber,
  carrier,
  noNotification,
  idempotencyKey,
}: {
  orderId: string;
  lineItems: { lineItemId: string; quantity: number }[];
  trackingNumber?: string;
  carrier?: string;
  noNotification?: boolean;
  idempotencyKey: string;
}) {
  const mutation = `
    mutation CreateOrderFulfillment(
      $orderId: ID!
      $lineItems: [LineItemInput!]!
      $trackingNumber: String
      $carrier: String
      $noNotification: Boolean
      $idempotencyKey: String!
    ) {
      createOrderFulfillment(
        orderId: $orderId
        lineItems: $lineItems
        trackingNumber: $trackingNumber
        carrier: $carrier
        noNotification: $noNotification
        idempotencyKey: $idempotencyKey
      ) {
        id
        fulfillmentItems { id quantity lineItem { id } }
        shippingLabels { id status trackingNumber trackingUrl carrier }
      }
    }
  `;

  const response = await keystoneClient(mutation, {
    orderId,
    lineItems,
    trackingNumber,
    carrier,
    noNotification: noNotification || false,
    idempotencyKey,
  });

  // Revalidate the path only on success
  if (response.success) {
    revalidatePath(`/platform/orders/${orderId}`);
    revalidatePath(`/platform/orders/${orderId}/fulfill`);
    revalidatePath(`/dashboard/platform/orders/${orderId}`);
  }

  return response;
}

export async function createProviderShippingLabel({
  orderId,
  providerId,
  rateId,
  dimensions,
  lineItems,
  idempotencyKey,
}: {
  orderId: string;
  providerId: string;
  rateId: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
    unit: 'in' | 'cm';
    weightUnit: 'oz' | 'lb' | 'kg';
  };
  lineItems: { lineItemId: string; quantity: number }[];
  idempotencyKey: string;
}) {
  const mutation = `
    mutation CreateProviderShippingLabel(
      $orderId: ID!
      $providerId: ID!
      $rateId: String!
      $dimensions: DimensionsInput
      $lineItems: [LineItemInput!]
      $idempotencyKey: String!
    ) {
      createProviderShippingLabel(
        orderId: $orderId
        providerId: $providerId
        rateId: $rateId
        dimensions: $dimensions
        lineItems: $lineItems
        idempotencyKey: $idempotencyKey
      ) {
        id
        status
        trackingNumber
        trackingUrl
        labelUrl
        data
      }
    }
  `;

  const response = await keystoneClient(mutation, {
    orderId,
    providerId,
    rateId,
    dimensions,
    lineItems,
    idempotencyKey,
  });

  // Revalidate the path only on success
  if (response.success) {
    revalidatePath(`/platform/orders/${orderId}`);
    revalidatePath(`/platform/orders/${orderId}/fulfill`);
  }

  return response;
}

/**
 * Cancel a fulfillment
 */
export async function cancelFulfillment(
  fulfillmentId: string,
  reason = 'operator_cancelled'
) {
  const mutation = `
    mutation CancelOrderFulfillment($fulfillmentId: ID!, $reason: String!) {
      cancelOrderFulfillment(fulfillmentId: $fulfillmentId, reason: $reason) {
        id
        canceledAt
      }
    }
  `;

  const response = await keystoneClient(mutation, { fulfillmentId, reason });

  if (response.success) {
    revalidatePath('/dashboard/platform/orders/[id]');
  }

  return response;
}