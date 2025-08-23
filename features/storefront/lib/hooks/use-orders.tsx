"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';
import {
  getOrderById,
  getOrderByDisplayId,
  completeCart
} from '../data/orders-client';

// Order query hooks
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => getOrderById(orderId),
    staleTime: 5 * 60 * 1000, // 5 minutes - orders don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!orderId,
  });
}

export function useOrderByDisplayId(displayId: string) {
  return useQuery({
    queryKey: queryKeys.orders.byDisplayId(displayId),
    queryFn: () => getOrderByDisplayId(displayId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!displayId,
  });
}

// Order mutation hooks
export function useCompleteCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeCart,
    onMutate: async () => {
      // Cancel outgoing refetches for cart
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.active() });

      // Snapshot previous cart data
      const previousCart = queryClient.getQueryData(queryKeys.cart.active());

      // Optimistically update cart status
      if (previousCart) {
        queryClient.setQueryData(queryKeys.cart.active(), (old: any) => {
          if (!old) return old;
          
          return {
            ...old,
            status: 'completing',
            completedAt: new Date().toISOString()
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
    onSuccess: (completedOrder) => {
      // Clear cart data on successful order completion
      queryClient.removeQueries({ queryKey: queryKeys.cart.active() });
      
      // Add the new order to cache if it's an Order type
      if (completedOrder?.type === 'Order' && completedOrder.id) {
        queryClient.setQueryData(
          queryKeys.orders.detail(completedOrder.id),
          completedOrder
        );
        
        if (completedOrder.displayId) {
          queryClient.setQueryData(
            queryKeys.orders.byDisplayId(completedOrder.displayId),
            completedOrder
          );
        }
      }
      
      // Invalidate user orders to show new order
      queryClient.invalidateQueries({ queryKey: queryKeys.user.orders() });
      
      // Clear payment sessions and shipping options
      queryClient.removeQueries({ queryKey: queryKeys.payment.all });
      queryClient.removeQueries({ queryKey: queryKeys.shipping.all });
      
      return completedOrder;
    },
    onError: (error) => {
      console.error('Error completing cart:', error);
    },
  });
}

// Compound hook for checkout completion flow
export function useCheckoutCompletion() {
  const completeCartMutation = useCompleteCart();

  const completeCheckout = async (cartId?: string) => {
    try {
      const result = await completeCartMutation.mutateAsync(cartId);
      
      if (result?.type === 'Order') {
        return {
          success: true,
          order: result,
          type: 'order' as const
        };
      } else {
        return {
          success: true,
          cart: result,
          type: 'cart' as const
        };
      }
    } catch (error) {
      console.error('Checkout completion error:', error);
      throw error;
    }
  };

  return {
    completeCheckout,
    isLoading: completeCartMutation.isPending,
    error: completeCartMutation.error,
  };
}