"use client";

import React, { useState, useMemo } from "react";
import { useAdminCustomers } from "../../hooks/useCustomers";
import { CustomerRow } from "./CustomerRow";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import { EmptyState } from "../common/EmptyState";

export function CustomerTable() {
  const { data: customers, isLoading, isError, error, refetch } = useAdminCustomers();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState<"ALL" | "PREMIUM" | "FREE">("ALL");

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    return customers.filter((customer) => {
      const matchesSearch =
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.name &&
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTier =
        filterTier === "ALL" ||
        (filterTier === "PREMIUM" && customer.isPremium) ||
        (filterTier === "FREE" && !customer.isPremium);

      return matchesSearch && matchesTier;
    });
  }, [customers, searchQuery, filterTier]);

  if (isLoading) {
    return <LoadingState type="table" title="Loading customer accounts..." />;
  }

  if (isError) {
    return (
      <ErrorState
        statusCode={error?.status}
        message={error?.message || "Failed to load customer list from the server."}
        onRetry={() => refetch()}
      />
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <EmptyState
        title="No customers found"
        description="There are currently no customer accounts registered in the database."
      />
    );
  }

  const premiumCount = customers.filter((c) => c.isPremium).length;
  const freeCount = customers.length - premiumCount;

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers by name or email..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterTier("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterTier === "ALL"
                ? "bg-zinc-700 text-white"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
            }`}
          >
            All ({customers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTier("PREMIUM")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterTier === "PREMIUM"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
            }`}
          >
            Premium ({premiumCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTier("FREE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterTier === "FREE"
                ? "bg-zinc-800 text-zinc-200 border border-zinc-700"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
            }`}
          >
            Free ({freeCount})
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl overflow-hidden shadow-sm backdrop-blur-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Current Tier</th>
                <th className="py-3 px-6">Created Date</th>
                <th className="py-3 px-6 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-zinc-500 text-sm">
                    No customers match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <CustomerRow
                    key={customer.id || customer._id || customer.email}
                    customer={customer}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
