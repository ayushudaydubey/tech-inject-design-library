"use client";

import React, { useState, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "../../lib/api";

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data stays fresh for 1 minute before refetching on component remount
        staleTime: 60 * 1000,
        // Cached data is garbage collected after 5 minutes of disuse
        gcTime: 5 * 60 * 1000,
        // Disable aggressive refetching on window refocus to preserve developer preview focus
        refetchOnWindowFocus: false,
        // Intelligent retry strategy: immediately fail on 401, 403, 404 (do not waste network cycles)
        retry: (failureCount, error) => {
          if (error instanceof ApiError) {
            if ([401, 403, 404].includes(error.status)) {
              return false;
            }
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server: always create a new QueryClient per request to prevent cross-request leakage
    return createQueryClient();
  } else {
    // Browser: create once and persist across re-renders
    if (!browserQueryClient) {
      browserQueryClient = createQueryClient();
    }
    return browserQueryClient;
  }
}

export interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Client component state ensures QueryClient is instantiated once per browser session
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export default QueryProvider;
