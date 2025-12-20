import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';
import { fetchProducts, fetchCart, fetchUser, fetchCollections, fetchCategories } from '../lib/data';
import QueryProvider from '../lib/providers/query-client-provider';

interface StorefrontServerProps {
  children: React.ReactNode;
  prefetchProducts?: {
    categoryId?: string;
    collectionId?: string;
    limit?: number;
  };
  prefetchUser?: boolean;
  prefetchCart?: boolean;
  prefetchCollections?: boolean;
  prefetchCategories?: boolean;
}

export default async function StorefrontServer({
  children,
  prefetchProducts = { limit: 12 },
  prefetchUser = true,
  prefetchCart = true,
  prefetchCollections = true,
  prefetchCategories = true,
}: StorefrontServerProps) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute - prevent immediate refetching on client
        gcTime: 10 * 60 * 1000, // 10 minutes
      },
    },
  });

  // Prefetch all data in parallel for faster initial load
  const prefetchPromises: Promise<void>[] = [];

  if (prefetchProducts) {
    prefetchPromises.push(
      queryClient.prefetchQuery({
        queryKey: queryKeys.products.list(prefetchProducts),
        queryFn: () => fetchProducts(prefetchProducts),
      })
    );
  }

  if (prefetchUser) {
    prefetchPromises.push(
      queryClient.prefetchQuery({
        queryKey: queryKeys.user.profile(),
        queryFn: () => fetchUser(),
      })
    );
  }

  if (prefetchCart) {
    prefetchPromises.push(
      queryClient.prefetchQuery({
        queryKey: queryKeys.cart.active(),
        queryFn: () => fetchCart(),
      })
    );
  }

  if (prefetchCollections) {
    prefetchPromises.push(
      queryClient.prefetchQuery({
        queryKey: queryKeys.collections.list(),
        queryFn: () => fetchCollections(),
      })
    );
  }

  if (prefetchCategories) {
    prefetchPromises.push(
      queryClient.prefetchQuery({
        queryKey: queryKeys.categories.list(),
        queryFn: () => fetchCategories(),
      })
    );
  }

  // Wait for all prefetches to complete in parallel
  await Promise.all(prefetchPromises);

  return (
    <QueryProvider>
      <HydrationBoundary state={dehydrate(queryClient)}>
        {children}
      </HydrationBoundary>
    </QueryProvider>
  );
}
