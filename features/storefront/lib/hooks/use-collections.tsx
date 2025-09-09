"use client";

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';
import { fetchCollections, fetchCategories } from '../data';

export function useCollections() {
  return useQuery({
    queryKey: queryKeys.collections.list(),
    queryFn: fetchCollections,
    staleTime: 10 * 60 * 1000, // 10 minutes - collections don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}