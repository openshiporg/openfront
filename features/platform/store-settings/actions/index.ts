'use server';

import { keystoneClient } from '@/features/dashboard/lib/keystoneClient';
import { revalidatePath } from 'next/cache';
import { optimize } from 'svgo';

function sanitizeSvg(svg: string): string {
  try {
    const result = optimize(svg, {
      plugins: [
        'preset-default',
        // Remove script elements
        'removeScripts',
        // Remove event handlers like onclick, onload, etc.
        {
          name: 'removeAttrs',
          params: {
            attrs: ['on*', 'onclick', 'onload', 'onerror', 'onmouseover'],
          },
        },
      ],
    });
    return result.data;
  } catch {
    // If SVGO fails to parse, return empty string to prevent malicious input
    return '';
  }
}

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
    logoIcon: data.logoIcon ? sanitizeSvg(data.logoIcon) : undefined,
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

  revalidatePath('/');
  revalidatePath('/dashboard');

  return { success: true, data: response.data?.updateStore };
}
