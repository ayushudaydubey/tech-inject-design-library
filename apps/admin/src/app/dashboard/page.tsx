"use client";

import React from "react";
import Link from "next/link";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { DashboardStats } from "../../components/dashboard/DashboardStats";
import { RecentComponents } from "../../components/dashboard/RecentComponents";
import { useAdminComponents } from "../../hooks/useComponents";
import { useAdminCustomers } from "../../hooks/useCustomers";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";

export default function AdminDashboardPage() {
  const {
    data: components,
    isLoading: componentsLoading,
    isError: componentsError,
    error: compErr,
    refetch: refetchComponents,
  } = useAdminComponents();

  const {
    data: customers,
    isLoading: customersLoading,
    isError: customersError,
    error: custErr,
    refetch: refetchCustomers,
  } = useAdminCustomers();

  const isLoading = componentsLoading || customersLoading;
  const isError = componentsError || customersError;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header with Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Admin Dashboard Overview
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Manage design library components, publication lifecycle, and customer access permissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/components/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Component</span>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-12">
            <LoadingState type="cards" title="Loading administrative metrics..." />
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <ErrorState
            statusCode={compErr?.status || custErr?.status}
            message={
              compErr?.message ||
              custErr?.message ||
              "Failed to load administrative overview statistics."
            }
            onRetry={() => {
              refetchComponents();
              refetchCustomers();
            }}
          />
        )}

        {/* Content */}
        {!isLoading && !isError && components && customers && (
          <div className="space-y-8">
            <DashboardStats components={components} customers={customers} />

            <div className="grid grid-cols-1 gap-8">
              <RecentComponents components={components} />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
