"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';
import {
  getShippingOptions,
  getFulfillmentOptions,
  addShippingMethod,
  updateCartAddresses,
  calculateCartTaxes
} from '../data/shipping-client';
import { useCart } from './use-cart';

// Shipping query hooks
export function useShippingOptions(cartId?: string) {
  const { data: cart } = useCart();
  const activeCartId = cartId || cart?.id;

  return useQuery({
    queryKey: queryKeys.shipping.options(activeCartId || ''),
    queryFn: () => getShippingOptions(activeCartId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!activeCartId,
  });
}

export function useFulfillmentOptions(providerId: string) {
  return useQuery({
    queryKey: queryKeys.shipping.fulfillment(providerId),
    queryFn: () => getFulfillmentOptions(providerId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!providerId,
  });
}

// Shipping mutation hooks
export function useAddShippingMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addShippingMethod,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.active() });

      // Snapshot previous cart data
      const previousCart = queryClient.getQueryData(queryKeys.cart.active());

      // Optimistically update cart with shipping method
      if (previousCart) {
        queryClient.setQueryData(queryKeys.cart.active(), (old: any) => {
          if (!old) return old;
          
          return {
            ...old,
            shippingMethods: [
              {
                id: `temp-${Date.now()}`,
                shippingOption: {
                  id: variables.optionId,
                  name: 'Calculating...',
                  amount: 0
                },
                amount: 0
              }
            ],
            shippingTotal: 0, // Will be updated on success
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
      queryClient.invalidateQueries({ queryKey: queryKeys.shipping.all });
    },
  });
}

export function useUpdateCartAddresses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCartAddresses,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.active() });
      
      const previousCart = queryClient.getQueryData(queryKeys.cart.active());

      // Optimistically update cart addresses
      queryClient.setQueryData(queryKeys.cart.active(), (old: any) => {
        if (!old) return old;
        
        const updates: any = { ...old };
        
        if (variables.shippingAddress) {
          updates.shippingAddress = {
            firstName: variables.shippingAddress.firstName,
            lastName: variables.shippingAddress.lastName,
            company: variables.shippingAddress.company,
            address1: variables.shippingAddress.address1,
            address2: variables.shippingAddress.address2,
            city: variables.shippingAddress.city,
            province: variables.shippingAddress.province,
            postalCode: variables.shippingAddress.postalCode,
            phone: variables.shippingAddress.phone,
            country: {
              iso2: variables.shippingAddress.countryCode,
              displayName: variables.shippingAddress.countryCode.toUpperCase()
            }
          };
        }

        if (variables.billingAddress) {
          updates.billingAddress = {
            firstName: variables.billingAddress.firstName,
            lastName: variables.billingAddress.lastName,
            company: variables.billingAddress.company,
            address1: variables.billingAddress.address1,
            address2: variables.billingAddress.address2,
            city: variables.billingAddress.city,
            province: variables.billingAddress.province,
            postalCode: variables.billingAddress.postalCode,
            phone: variables.billingAddress.phone,
            country: {
              iso2: variables.billingAddress.countryCode,
              displayName: variables.billingAddress.countryCode.toUpperCase()
            }
          };
        }

        return updates;
      });

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart.active(), context.previousCart);
      }
    },
    onSuccess: () => {
      // Invalidate shipping options as they may change based on address
      queryClient.invalidateQueries({ queryKey: queryKeys.shipping.options });
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.active() });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.active() });
    },
  });
}

export function useCalculateCartTaxes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calculateCartTaxes,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.active() });
      
      const previousCart = queryClient.getQueryData(queryKeys.cart.active());

      // Optimistically update cart with calculating state
      queryClient.setQueryData(queryKeys.cart.active(), (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          taxTotal: 0, // Will be updated on success
          total: old.subtotal + old.shippingTotal, // Temporary calculation
          items: old.items?.map((item: any) => ({
            ...item,
            taxTotal: 0,
            taxLines: []
          })) || []
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

// Compound hook for checkout flow
export function useCheckoutFlow() {
  const addShippingMethod = useAddShippingMethod();
  const updateAddresses = useUpdateCartAddresses();
  const calculateTaxes = useCalculateCartTaxes();

  const updateShippingInfo = async (params: {
    shippingAddress?: any;
    billingAddress?: any;
    shippingOptionId?: string;
    calculateTax?: boolean;
  }) => {
    try {
      // Step 1: Update addresses
      if (params.shippingAddress || params.billingAddress) {
        await updateAddresses.mutateAsync({
          shippingAddress: params.shippingAddress,
          billingAddress: params.billingAddress,
        });
      }

      // Step 2: Add shipping method
      if (params.shippingOptionId) {
        await addShippingMethod.mutateAsync({
          optionId: params.shippingOptionId,
        });
      }

      // Step 3: Calculate taxes
      if (params.calculateTax) {
        await calculateTaxes.mutateAsync();
      }

      return { success: true };
    } catch (error) {
      console.error('Checkout flow error:', error);
      throw error;
    }
  };

  return {
    updateShippingInfo,
    isLoading: addShippingMethod.isPending || updateAddresses.isPending || calculateTaxes.isPending,
    error: addShippingMethod.error || updateAddresses.error || calculateTaxes.error,
  };
}