"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  getStoredToken,
  clearStoredToken,
  ApiError,
} from "../lib/api";
import { User, LoginCredentials, AuthResponseData } from "../types/auth";
import { componentKeys } from "./useComponents";

export const authKeys = {
  all: ["auth"] as const,
  me: ["auth", "me"] as const,
};

/**
 * Hook to retrieve current authenticated customer from server
 */
export function useCurrentUser() {
  const query = useQuery<User | null, ApiError>({
    queryKey: authKeys.me,
    queryFn: async () => {
      const token = getStoredToken();
      if (!token) return null;
      try {
        return await fetchCurrentUser();
      } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          clearStoredToken();
          return null;
        }
        throw err;
      }
    },
    // Avoid infinite background polling, but keep updated
    staleTime: 30 * 1000,
    retry: false,
  });

  const user = query.data ?? null;
  const isAuthenticated = Boolean(user);
  const isPremium = Boolean(user?.isPremium || user?.role === "admin");
  const isAdmin = user?.role === "admin";

  return {
    ...query,
    user,
    isAuthenticated,
    isPremium,
    isAdmin,
  };
}

/**
 * Mutation hook for logging in
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<AuthResponseData, ApiError, LoginCredentials>({
    mutationFn: (credentials: LoginCredentials) => loginUser(credentials),
    onSuccess: (data) => {
      // Store user in cache
      queryClient.setQueryData(authKeys.me, data.user);
      // Invalidate component queries so newly unlocked premium content is refetched
      queryClient.invalidateQueries({ queryKey: componentKeys.all });
    },
  });
}

/**
 * Mutation hook for logging out
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, void>({
    mutationFn: () => logoutUser(),
    onSuccess: () => {
      // Clear token from memory/storage
      clearStoredToken();
      // Set me query to null
      queryClient.setQueryData(authKeys.me, null);
      // CRITICAL SECURITY RULE: Clear all queries to prevent caching protected source for subsequent users
      queryClient.clear();
      // Re-fetch public component catalogue in guest state
      queryClient.invalidateQueries({ queryKey: componentKeys.all });
    },
  });
}
