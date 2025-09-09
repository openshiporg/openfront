import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';
import { fetchProducts, fetchCart, fetchUser, fetchCollections, fetchCategories } from '../lib/data';

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

  // Prefetch products
  if (prefetchProducts) {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.products.list(prefetchProducts),
      queryFn: () => fetchProducts(prefetchProducts),
    });
  }

  // Prefetch user data
  if (prefetchUser) {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.user.profile(),
      queryFn: () => fetchUser(),
    });
  }

  // Prefetch cart
  if (prefetchCart) {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.cart.active(),
      queryFn: () => fetchCart(),
    });
  }

  // Prefetch collections
  if (prefetchCollections) {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.collections.list(),
      queryFn: () => fetchCollections(),
    });
  }

  // Prefetch categories
  if (prefetchCategories) {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.categories.list(),
      queryFn: () => fetchCategories(),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}