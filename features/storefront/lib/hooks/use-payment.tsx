"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';
import {
  getPaymentSessions,
  createPaymentSessions,
  setPaymentSession,
  updatePaymentSession
} from '../data/payment-client';
import { useCart } from './use-cart';

// Payment query hooks
export function usePaymentSessions(cartId?: string) {
  const { data: cart } = useCart();
  const activeCartId = cartId || cart?.id;

  return useQuery({
    queryKey: queryKeys.payment.sessions(activeCartId || ''),
    queryFn: () => getPaymentSessions(activeCartId),
    staleTime: 1 * 60 * 1000, // 1 minute - payment data changes frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!activeCartId,
  });
}

// Payment mutation hooks
export function useCreatePaymentSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPaymentSessions,
    onSuccess: (data) => {
      if (data?.paymentSessions) {
        // Update payment sessions in cache
        queryClient.setQueryData(
          queryKeys.payment.sessions(data.id),
          data.paymentSessions
        );
      }
      // Invalidate cart to show updated payment info
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.active() });
    },
    onError: (error) => {
      console.error('Error creating payment sessions:', error);
    },
  });
}

export function useSetPaymentSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setPaymentSession,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      const cartQueryKey = queryKeys.cart.active();
      await queryClient.cancelQueries({ queryKey: cartQueryKey });

      // Snapshot previous data
      const previousCart = queryClient.getQueryData(cartQueryKey);

      // Optimistically update cart with selected payment session
      if (previousCart) {
        queryClient.setQueryData(cartQueryKey, (old: any) => {
          if (!old) return old;
          
          return {
            ...old,
            paymentSession: {
              id: `temp-${Date.now()}`,
              provider: {
                id: variables.providerId,
                name: 'Setting payment method...'
              },
              isSelected: true,
              status: 'pending'
            }
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
    onSuccess: (data) => {
      // Update cart data with new payment session
      if (data?.paymentSession) {
        queryClient.setQueryData(queryKeys.cart.active(), (old: any) => {
          if (!old) return old;
          return {
            ...old,
            paymentSession: data.paymentSession
          };
        });
      }
    },
    onSettled: () => {
      // Always refetch to get accurate data
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.active() });
      queryClient.invalidateQueries({ queryKey: queryKeys.payment.all });
    },
  });
}

export function useUpdatePaymentSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePaymentSession,
    onSuccess: () => {
      // Invalidate payment and cart queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.payment.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.active() });
    },
    onError: (error) => {
      console.error('Error updating payment session:', error);
    },
  });
}

// Compound hook for payment flow
export function usePaymentFlow() {
  const createSessions = useCreatePaymentSessions();
  const setSession = useSetPaymentSession();
  const updateSession = useUpdatePaymentSession();

  const initializePayment = async (params: {
    cartId?: string;
    providerId?: string;
    paymentData?: Record<string, any>;
  }) => {
    try {
      // Step 1: Create payment sessions
      const sessions = await createSessions.mutateAsync(params.cartId);
      
      // Step 2: Set payment provider if specified
      if (params.providerId && sessions?.id) {
        await setSession.mutateAsync({
          cartId: sessions.id,
          providerId: params.providerId,
        });
      }

      // Step 3: Update session data if provided
      if (params.paymentData && sessions?.paymentSessions) {
        const activeSession = sessions.paymentSessions.find(
          (session: any) => session.provider.id === params.providerId || session.isSelected
        );
        
        if (activeSession) {
          await updateSession.mutateAsync({
            sessionId: activeSession.id,
            data: params.paymentData,
          });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Payment flow error:', error);
      throw error;
    }
  };

  return {
    initializePayment,
    isLoading: createSessions.isPending || setSession.isPending || updateSession.isPending,
    error: createSessions.error || setSession.error || updateSession.error,
  };
}