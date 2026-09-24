"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminCustomers,
  grantCustomerPremium,
  revokeCustomerPremium,
  ApiError,
} from "../lib/api";
import { Customer } from "../types/customer";

export const adminCustomerKeys = {
  all: ["admin", "customers"] as const,
  list: () => ["admin", "customers", "list"] as const,
  detail: (id: string) => ["admin", "customers", "detail", id] as const,
};

/**
 * Hook to retrieve customer accounts for premium administration
 */
export function useAdminCustomers() {
  return useQuery<Customer[], ApiError>({
    queryKey: adminCustomerKeys.list(),
    queryFn: () => fetchAdminCustomers(),
  });
}

/**
 * Mutation hook to grant premium access to a customer
 */
export function useGrantPremium() {
  const queryClient = useQueryClient();

  return useMutation<Customer, ApiError, string>({
    mutationFn: (id: string) => grantCustomerPremium(id),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({
        queryKey: adminCustomerKeys.detail(customer.id),
      });
      queryClient.invalidateQueries({ queryKey: adminCustomerKeys.list() });
    },
  });
}

/**
 * Mutation hook to revoke premium access from a customer
 */
export function useRevokePremium() {
  const queryClient = useQueryClient();

  return useMutation<Customer, ApiError, string>({
    mutationFn: (id: string) => revokeCustomerPremium(id),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({
        queryKey: adminCustomerKeys.detail(customer.id),
      });
      queryClient.invalidateQueries({ queryKey: adminCustomerKeys.list() });
    },
  });
}
