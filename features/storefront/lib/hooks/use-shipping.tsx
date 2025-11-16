"use client";

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';
import { getCartShippingOptions } from '../data/shipping';
import { useCart } from './use-cart';

// Note: In Next.js 16, shipping operations should be handled via Server Actions.
// Shipping-related Server Actions from cart.ts include:
// - setShippingMethod(shippingOptionId)
// - setAddresses(currentState, formData)
//
// To get shipping options, use the server-side function:
// - getCartShippingOptions(cartId) from shipping.ts
//
// Shipping query hook
export function useShippingOptions(cartId?: string) {
  const { data: cart } = useCart();
  const activeCartId = cartId || cart?.id;

  return useQuery({
    queryKey: queryKeys.shipping.options(activeCartId || ''),
    queryFn: () => getCartShippingOptions(activeCartId || ''),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!activeCartId,
  });
}

// Note: Shipping mutations (add shipping method, update addresses, etc.)
// should use Server Actions directly from cart.ts, not React Query mutations.
// Server Actions automatically handle revalidation via revalidateTag("cart").