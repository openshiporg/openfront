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
}: {
  orderId: string;
  lineItems: { lineItemId: string; quantity: number }[];
  trackingNumber?: string;
  carrier?: string;
  noNotification?: boolean;
}) {
  // Build the shippingLabels create input if we have tracking info
  const shippingLabelsInput = trackingNumber && carrier ? {
    create: [{
      status: "purchased",
      carrier: carrier,
      trackingNumber: trackingNumber,
      trackingUrl: getTrackingUrl(carrier, trackingNumber),
      metadata: {
        source: "admin"
      }
    }]
  } : undefined;

  const mutation = `
    mutation CreateFulfillment($data: FulfillmentCreateInput!) {
      createFulfillment(data: $data) {
        id
        shippingLabels {
          id
          status
          trackingNumber
          trackingUrl
          labelUrl
          carrier
          data
        }
      }
    }
  `;

  // Build the data object
  const data: any = {
    order: { connect: { id: orderId } },
    fulfillmentItems: {
      create: lineItems.map(({ lineItemId, quantity }) => ({
        lineItem: { connect: { id: lineItemId } },
        quantity: quantity
      }))
    },
    noNotification: noNotification || false,
    metadata: {
      source: "admin",
      createdBy: "admin"
    }
  };

  // Only add shippingLabels if we have the input
  if (shippingLabelsInput) {
    data.shippingLabels = shippingLabelsInput;
  }

  const response = await keystoneClient(mutation, { data });

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
}) {
  const mutation = `
    mutation CreateProviderShippingLabel(
      $orderId: ID!
      $providerId: ID!
      $rateId: String!
      $dimensions: DimensionsInput
      $lineItems: [LineItemInput!]
    ) {
      createProviderShippingLabel(
        orderId: $orderId
        providerId: $providerId
        rateId: $rateId
        dimensions: $dimensions
        lineItems: $lineItems
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
    lineItems
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
export async function cancelFulfillment(fulfillmentId: string) {
  const mutation = `
    mutation CancelFulfillment($id: ID!, $data: FulfillmentUpdateInput!) {
      updateFulfillment(
        where: { id: $id }
        data: $data
      ) {
        id
        canceledAt
      }
    }
  `;

  const response = await keystoneClient(mutation, { 
    id: fulfillmentId,
    data: {
      canceledAt: new Date().toISOString()
    }
  });

  if (response.success) {
    revalidatePath('/dashboard/platform/orders/[id]');
  }

  return response;
}