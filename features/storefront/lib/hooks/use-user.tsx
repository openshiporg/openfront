"use client";

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';
import { fetchUser } from '../data';

// Note: In Next.js 16, user authentication mutations (login, register, logout)
// should be handled via Server Actions directly, not through React Query.
// Server Actions from user.ts: login(), signUp(), signOut()
// These are already "use server" functions and should be called directly from forms.

// User authentication hooks - query only
export function useUser() {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: fetchUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Don't retry failed auth requests
  });
}