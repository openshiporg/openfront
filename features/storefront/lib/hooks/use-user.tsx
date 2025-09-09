"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';
import { fetchUser } from '../data';
import {
  loginUser,
  registerUser,
  logoutUser,
  getUserOrders,
  getUserAddresses,
  addUserAddress,
  updateUserProfile
} from '../data/user-client';

// User authentication hooks
export function useUser() {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: fetchUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Don't retry failed auth requests
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (userData) => {
      // Update user data in cache
      queryClient.setQueryData(queryKeys.user.profile(), userData);
      // Invalidate cart to fetch user's cart
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: registerUser,
    onSuccess: (userData) => {
      // Update user data in cache
      queryClient.setQueryData(queryKeys.user.profile(), userData);
      // Invalidate cart to fetch user's cart
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
    onError: (error) => {
      console.error('Registration error:', error);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear all user-related data
      queryClient.removeQueries({ queryKey: queryKeys.user.all });
      queryClient.removeQueries({ queryKey: queryKeys.cart.all });
      // You might want to redirect or show a success message
    },
    onError: (error) => {
      console.error('Logout error:', error);
    },
  });
}

// User data hooks
export function useUserOrders() {
  const { data: user } = useUser();
  
  return useQuery({
    queryKey: queryKeys.user.orders(),
    queryFn: getUserOrders,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!user, // Only fetch if user is logged in
  });
}

export function useUserAddresses() {
  const { data: user } = useUser();
  
  return useQuery({
    queryKey: queryKeys.user.addresses(),
    queryFn: getUserAddresses,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!user, // Only fetch if user is logged in
  });
}

// User mutation hooks
export function useAddAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addUserAddress,
    onSuccess: () => {
      // Invalidate addresses to refetch updated list
      queryClient.invalidateQueries({ queryKey: queryKeys.user.addresses() });
    },
    onError: (error) => {
      console.error('Error adding address:', error);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (updatedUser) => {
      // Update user data in cache
      queryClient.setQueryData(queryKeys.user.profile(), updatedUser);
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
    },
  });
}