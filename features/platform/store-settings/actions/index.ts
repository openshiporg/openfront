'use server';

import { keystoneClient } from '@/features/dashboard/lib/keystoneClient';
import { revalidatePath } from 'next/cache';

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

  const response = await keystoneClient(mutation, { id: storeId, data });

  if (!response.success) {
    return { success: false, error: response.error };
  }

  revalidatePath('/');
  revalidatePath('/dashboard');

  return { success: true, data: response.data?.updateStore };
}
