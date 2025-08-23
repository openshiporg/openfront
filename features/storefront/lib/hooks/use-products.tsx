"use client";

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';
import { listProducts, getProductByHandle, getProductsByCategoryId } from '../data/products-client';

interface ProductListParams {
  categoryId?: string;
  collectionId?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  countryCode?: string;
}

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => listProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes for product listings
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useProduct(handle: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(handle),
    queryFn: () => getProductByHandle(handle),
    staleTime: 10 * 60 * 1000, // 10 minutes for individual products
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!handle,
  });
}

export function useProductsByCategory(categoryId: string, limit = 12) {
  return useQuery({
    queryKey: queryKeys.products.byCategory(categoryId),
    queryFn: () => getProductsByCategoryId(categoryId, limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: !!categoryId,
  });
}

export function useProductsByCollection(collectionId: string, limit = 12) {
  return useQuery({
    queryKey: queryKeys.products.byCollection(collectionId),
    queryFn: () => listProducts({ collectionId, limit }),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: !!collectionId,
  });
}

export function useSearchProducts(searchQuery: string, filters?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.products.search(searchQuery, filters),
    queryFn: () => listProducts({ 
      ...filters,
      // You'd implement search functionality in listProducts
      search: searchQuery 
    }),
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!searchQuery && searchQuery.length > 2,
  });
}

export function useRelatedProducts(productId: string, limit = 6) {
  return useQuery({
    queryKey: queryKeys.products.related(productId),
    queryFn: () => {
      // This would need to be implemented in your backend
      // For now, return empty array or fetch similar products
      return listProducts({ limit });
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!productId,
  });
}