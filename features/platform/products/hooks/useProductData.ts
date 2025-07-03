'use client';

import useSWR from 'swr';
import { getProduct, getRegions } from '../actions';

/**
 * SWR hook for fetching product details
 */
export function useProductData(productId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    productId ? [`product-details`, productId] : null,
    async () => {
      if (!productId) return null;
      const response = await getProduct(productId);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    product: data,
    loading: isLoading,
    error,
    refetch: mutate,
  };
}

/**
 * SWR hook for fetching regions
 */
export function useRegions() {
  const { data, error, isLoading } = useSWR(
    'regions',
    async () => {
      const response = await getRegions();
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  );

  return {
    regions: data?.regions || [],
    loading: isLoading,
    error,
  };
}