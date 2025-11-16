"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache configuration optimized for e-commerce
            staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh
            gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection
            refetchOnWindowFocus: false, // Don't refetch on focus (better UX)
            refetchOnMount: 'always', // Always refetch on mount for data freshness
            refetchOnReconnect: 'always', // Refetch when coming back online
            retry: (failureCount, error) => {
              // Don't retry auth errors (401, 403)
              if (error && typeof error === 'object' && 'status' in error) {
                const status = (error as any).status;
                if (status === 401 || status === 403) return false;
              }
              // Retry other errors up to 2 times
              return failureCount < 2;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Mutation configuration
            retry: (failureCount, error) => {
              // Don't retry client errors (4xx)
              if (error && typeof error === 'object' && 'status' in error) {
                const status = (error as any).status;
                if (status >= 400 && status < 500) return false;
              }
              // Retry server errors (5xx) once
              return failureCount < 1;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
        // Global error handler for debugging
        logger: {
          log: console.log,
          warn: console.warn,
          error: (error) => {
            console.error('React Query Error:', error);
            // You could integrate with error reporting service here
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
