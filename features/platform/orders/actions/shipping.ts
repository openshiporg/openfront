'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from '../../../dashboard/lib/keystoneClient';

export interface CreateShippingProviderInput {
  name: string;
  accessToken: string;
  fromAddressId: string;
  createLabelFunction?: string;
  getRatesFunction?: string;
  validateAddressFunction?: string;
  trackShipmentFunction?: string;
  cancelLabelFunction?: string;
  metadata?: Record<string, any>;
}

export async function getShippingProviders() {
  const query = `
    query GetShippingProviders {
      shippingProviders(orderBy: [
        { isActive: desc },
        { name: asc }
      ]) {
        id
        name
        isActive
        accessToken
        fromAddress {
          id
          firstName
          lastName
          company
          address1
          address2
          city
          province
          postalCode
          country {
            iso2
          }
          phone
        }
      }
    }
  `;

  const response = await keystoneClient(query);
  return response;
}

export async function createShippingProvider(input: CreateShippingProviderInput) {
  const {
    name,
    accessToken,
    fromAddressId,
    createLabelFunction,
    getRatesFunction,
    validateAddressFunction,
    trackShipmentFunction,
    cancelLabelFunction,
    metadata
  } = input;

  const mutation = `
    mutation CreateShippingProvider(
      $name: String!
      $accessToken: String!
      $fromAddressId: ID!
      $createLabelFunction: String
      $getRatesFunction: String
      $validateAddressFunction: String
      $trackShipmentFunction: String
      $cancelLabelFunction: String
      $metadata: JSON
    ) {
      createShippingProvider(data: {
        name: $name
        accessToken: $accessToken
        fromAddress: { connect: { id: $fromAddressId } }
        isActive: true
        createLabelFunction: $createLabelFunction
        getRatesFunction: $getRatesFunction
        validateAddressFunction: $validateAddressFunction
        trackShipmentFunction: $trackShipmentFunction
        cancelLabelFunction: $cancelLabelFunction
        metadata: $metadata
      }) {
        id
        name
        isActive
        metadata
      }
    }
  `;

  const response = await keystoneClient(mutation, {
    name,
    accessToken,
    fromAddressId,
    createLabelFunction,
    getRatesFunction,
    validateAddressFunction,
    trackShipmentFunction,
    cancelLabelFunction,
    metadata
  });

  // Revalidate the path only on success
  if (response.success) {
    revalidatePath('/dashboard/platform/orders/[id]');
  }

  return response;
}

export async function deleteProvider(providerId: string) {
  const mutation = `
    mutation DeleteProvider($id: ID!) {
      deleteShippingProvider(where: { id: $id }) {
        id
      }
    }
  `;

  const response = await keystoneClient(mutation, { id: providerId });

  // Revalidate the path only on success
  if (response.success) {
    revalidatePath('/dashboard/platform/orders/[id]');
  }

  return response;
}

export async function getRatesForOrder(orderId: string, providerId: string, dimensions: any) {
  const mutation = `
    mutation GetRatesForOrder(
      $orderId: ID!
      $providerId: ID!
      $dimensions: DimensionsInput
    ) {
      getRatesForOrder(
        orderId: $orderId
        providerId: $providerId
        dimensions: $dimensions
      ) {
        id
        provider
        service
        carrier
        price
        estimatedDays
      }
    }
  `;

  const response = await keystoneClient(mutation, {
    orderId,
    providerId,
    dimensions
  });

  return response;
}

/**
 * Toggle shipping provider active status
 */
export async function toggleProvider(providerId: string) {
  const mutation = `
    mutation ToggleProvider($id: ID!) {
      updateShippingProvider(
        where: { id: $id }
        data: {
          isActive: { set: false }
        }
      ) {
        id
        isActive
      }
    }
  `;

  const response = await keystoneClient(mutation, { id: providerId });

  // Revalidate the path only on success
  if (response.success) {
    revalidatePath('/dashboard/platform/orders/[id]');
  }

  return response;
}