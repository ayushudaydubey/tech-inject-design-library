"use client";

import React, { use } from "react";
import Link from "next/link";
import { AdminLayout } from "../../../../../components/layout/AdminLayout";
import { ComponentForm } from "../../../../../components/component-form/ComponentForm";
import {
  useAdminComponent,
  useUpdateDraft,
} from "../../../../../hooks/useComponents";
import { CreateComponentInput } from "../../../../../types/component";
import { LoadingState } from "../../../../../components/common/LoadingState";
import { ErrorState } from "../../../../../components/common/ErrorState";

export default function AdminComponentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    data: component,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminComponent(id);

  const updateMutation = useUpdateDraft();

  const handleUpdate = async (data: CreateComponentInput) => {
    return await updateMutation.mutateAsync({
      id,
      input: data,
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/dashboard/components"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Components
          </Link>
          <span>/</span>
          <Link
            href={`/dashboard/components/${id}`}
            className="hover:text-slate-900 dark:hover:text-white transition-colors font-mono"
          >
            {component?.name || id}
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium">Edit</span>
        </div>

        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Edit Component: {component?.name || "..."}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Update component specifications, props documentation, dependencies, and configuration.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <LoadingState type="detail" title="Fetching component specifications..." />
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <ErrorState
            statusCode={error?.status}
            message={error?.message || "Failed to load component for editing."}
            onRetry={() => refetch()}
          />
        )}

        {/* Form */}
        {!isLoading && !isError && component && (
          <ComponentForm
            initialData={component}
            onSubmit={handleUpdate}
            isSubmitting={updateMutation.isPending}
          />
        )}
      </div>
    </AdminLayout>
  );
}
