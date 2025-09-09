"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';
import { fetchCart } from '../data';
import {
  createCart,
  addToCart,
  updateLineItem,
  removeLineItem,
  applyDiscount,
  removeDiscount,
  setShippingMethod,
  placeOrder
} from '../data/cart-client';

// Cookie helpers - these should be moved to a utilities file
const getCartId = (): string | null => {
  if (typeof window === 'undefined') return null;
  const cartId = document.cookie
    .split('; ')
    .find(row => row.startsWith('_openfront_cart_id='))
    ?.split('=')[1];
  return cartId || null;
};

const setCartId = (cartId: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `_openfront_cart_id=${cartId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
};

const removeCartId = () => {
  if (typeof window === 'undefined') return;
  document.cookie = '_openfront_cart_id=; path=/; max-age=-1';
};

// Cart query hooks
export function useCart() {
  return useQuery({
    queryKey: queryKeys.cart.active(),
    queryFn: () => fetchCart(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch cart when window gains focus
  });
}

export function useCreateCart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCart,
    onSuccess: (newCart) => {
      if (newCart?.id) {
        setCartId(newCart.id);
        queryClient.setQueryData(queryKeys.cart.active(), newCart);
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      }
    },
    onError: (error) => {
      console.error('Error creating cart:', error);
    },
  });
}

// Cart mutation hooks with optimistic updates
export function useAddToCart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addToCart,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.active() });

      // Snapshot previous cart data
      const previousCart = queryClient.getQueryData(queryKeys.cart.active());

      // Optimistically update cart (simplified - in real app you'd need product data)
      if (previousCart) {
        queryClient.setQueryData(queryKeys.cart.active(), (old: any) => {
          if (!old) return old;
          
          return {
            ...old,
            lineItems: [
              ...(old.lineItems || []),
              {
                id: `temp-${Date.now()}`,
                quantity: variables.quantity,
                productVariant: {
                  id: variables.variantId,
                  title: 'Adding...',
                  product: { title: 'Adding to cart...' }
                },
                unitPrice: 0,
                total: 0,
              }
            ]
          };
        });
      }

      return { previousCart };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart.active(), context.previousCart);
      }
    },
    onSettled: () => {
      // Always refetch to get accurate data
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.active() });
    },
  });
}

export function useUpdateLineItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateLineItem,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.active() });
      
      const previousCart = queryClient.getQueryData(queryKeys.cart.active());

      // Optimistically update the line item
      queryClient.setQueryData(queryKeys.cart.active(), (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          lineItems: old.lineItems?.map((item: any) => 
            item.id === variables.lineId 
              ? { ...item, quantity: variables.quantity }
              : item
          ) || []
        };
      });

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart.active(), context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.active() });
    },
  });
}

export function useRemoveLineItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: removeLineItem,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.active() });
      
      const previousCart = queryClient.getQueryData(queryKeys.cart.active());

      // Optimistically remove the line item
      queryClient.setQueryData(queryKeys.cart.active(), (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          lineItems: old.lineItems?.filter((item: any) => item.id !== variables.lineId) || []
        };
      });

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart.active(), context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.active() });
    },
  });
}

export function useApplyDiscount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: applyDiscount,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.active() });
      
      const previousCart = queryClient.getQueryData(queryKeys.cart.active());

      // Optimistically add discount
      queryClient.setQueryData(queryKeys.cart.active(), (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          discounts: [
            ...(old.discounts || []),
            {
              id: `temp-${Date.now()}`,
              code: variables.code,
              discountRule: { type: 'percentage', value: 0 }
            }
          ]
        };
      });

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart.active(), context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.active() });
    },
  });
}

export function useRemoveDiscount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: removeDiscount,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.active() });
      
      const previousCart = queryClient.getQueryData(queryKeys.cart.active());

      // Optimistically remove discount
      queryClient.setQueryData(queryKeys.cart.active(), (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          discounts: old.discounts?.filter((discount: any) => discount.code !== variables.code) || []
        };
      });

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart.active(), context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.active() });
    },
  });
}

export function useSetShippingMethod() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: setShippingMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.active() });
      // Also invalidate shipping-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.shipping.all });
    },
    onError: (error) => {
      console.error('Error setting shipping method:', error);
    },
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: placeOrder,
    onSuccess: (order) => {
      // Clear cart data on successful order
      removeCartId();
      queryClient.removeQueries({ queryKey: queryKeys.cart.active() });
      // Invalidate user orders to show new order
      queryClient.invalidateQueries({ queryKey: queryKeys.user.orders() });
      
      return order;
    },
    onError: (error) => {
      console.error('Error placing order:', error);
    },
  });
}