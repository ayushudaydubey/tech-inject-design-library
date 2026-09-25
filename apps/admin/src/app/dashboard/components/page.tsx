"use client";

import React from "react";
import Link from "next/link";
import { AdminLayout } from "../../../components/layout/AdminLayout";
import { ComponentTable } from "../../../components/components/ComponentTable";
import { useAdminComponents } from "../../../hooks/useComponents";
import { LoadingState } from "../../../components/common/LoadingState";
import { ErrorState } from "../../../components/common/ErrorState";

export default function AdminComponentsListPage() {
  const {
    data: components,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminComponents();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
              Component Management
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Create, inspect, validate, upload assets, and publish library components to the catalogue.
            </p>
          </div>

          <Link
            href="/dashboard/components/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-200 hover:bg-blue-100 text-zinc-900 font-medium text-xs transition-colors self-start sm:self-auto"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Component</span>
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <LoadingState type="table" title="Loading design library components..." />
        )}

        {/* Error */}
        {!isLoading && isError && (
          <ErrorState
            statusCode={error?.status}
            message={error?.message || "Failed to load components from the server."}
            onRetry={() => refetch()}
          />
        )}

        {/* Content */}
        {!isLoading && !isError && components && (
          <ComponentTable components={components} onRefresh={() => refetch()} />
        )}
      </div>
    </AdminLayout>
  );
}
