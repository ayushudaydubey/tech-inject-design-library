"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminSession,
  adminLogin,
  adminLogout,
  getStoredAdminToken,
  clearStoredAdminToken,
  ApiError,
} from "../lib/api";
import { User, LoginCredentials, AuthResponseData } from "../types/auth";

export const adminAuthKeys = {
  all: ["admin", "auth"] as const,
  me: ["admin", "auth", "me"] as const,
};

/**
 * Hook to retrieve and verify current administrator session from the backend
 */
export function useAdminSession() {
  const hasToken = typeof window !== "undefined" ? Boolean(getStoredAdminToken()) : false;

  return useQuery<User | null, ApiError>({
    queryKey: adminAuthKeys.me,
    queryFn: async () => {
      try {
        const user = await fetchAdminSession();
        // Server-side source of truth: must have admin role
        if (user.role !== "admin") {
          clearStoredAdminToken();
          throw new ApiError(403, "Forbidden. Administrator credentials required.");
        }
        return user;
      } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          clearStoredAdminToken();
          return null;
        }
        throw err;
      }
    },
    enabled: hasToken,
    staleTime: 60 * 1000,
    retry: false,
  });
}

/**
 * Mutation hook for administrator login
 */
export function useAdminLogin() {
  const queryClient = useQueryClient();

  return useMutation<AuthResponseData, ApiError, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      const result = await adminLogin(credentials);
      if (result.user.role !== "admin") {
        clearStoredAdminToken();
        throw new ApiError(403, "Access denied. Account is not an administrator.");
      }
      return result;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(adminAuthKeys.me, data.user);
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

/**
 * Mutation hook for administrator logout
 */
export function useAdminLogout() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, void>({
    mutationFn: () => adminLogout(),
    onSuccess: () => {
      clearStoredAdminToken();
      queryClient.setQueryData(adminAuthKeys.me, null);
      queryClient.clear();
    },
  });
}
