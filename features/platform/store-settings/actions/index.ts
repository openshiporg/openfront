'use server';

import { keystoneClient } from '@/features/dashboard/lib/keystoneClient';
import { revalidatePath } from 'next/cache';
import { normalizeStoreLogoColor } from '../lib/store-logo';
import { sanitizeStoreLogoSvg } from '@/features/keystone/utils/storeLogo';

export async function getStoreSettings() {
  const query = `
    query GetStore {
      stores(take: 1) {
        id
        name
        logoIcon
        logoColor
        homepageTitle
        homepageDescription
      }
    }
  `;

  const response = await keystoneClient(query);

  if (!response.success) {
    return { success: false, error: response.error };
  }

  return { success: true, data: response.data?.stores?.[0] || null };
}

export async function updateStoreSettings(storeId: string, data: {
  name?: string;
  logoIcon?: string;
  logoColor?: string;
  homepageTitle?: string;
  homepageDescription?: string;
}) {
  // Sanitize SVG before saving to prevent XSS attacks
  const sanitizedData = {
    ...data,
    logoIcon: data.logoIcon ? sanitizeStoreLogoSvg(data.logoIcon) : undefined,
    logoColor:
      data.logoColor === undefined ? undefined : normalizeStoreLogoColor(data.logoColor),
  };

  // If SVG sanitization failed (returned empty string), reject the update
  if (data.logoIcon && !sanitizedData.logoIcon) {
    return { success: false, error: 'Invalid SVG format' };
  }

  const mutation = `
    mutation UpdateStore($id: ID!, $data: StoreUpdateInput!) {
      updateStore(where: { id: $id }, data: $data) {
        id
        name
        logoIcon
        logoColor
        homepageTitle
        homepageDescription
      }
    }
  `;

  const response = await keystoneClient(mutation, { id: storeId, data: sanitizedData });

  if (!response.success) {
    return { success: false, error: response.error };
  }

  revalidatePath('/dashboard');

  return { success: true, data: response.data?.updateStore };
}
