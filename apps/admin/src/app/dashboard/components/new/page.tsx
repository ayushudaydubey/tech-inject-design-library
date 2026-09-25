"use client";

import React from "react";
import Link from "next/link";
import { AdminLayout } from "../../../../components/layout/AdminLayout";
import { ComponentForm } from "../../../../components/component-form/ComponentForm";
import { useCreateDraft } from "../../../../hooks/useComponents";
import { CreateComponentInput } from "../../../../types/component";

export default function AdminNewComponentPage() {
  const createDraftMutation = useCreateDraft();

  const handleCreateDraft = async (data: CreateComponentInput) => {
    return await createDraftMutation.mutateAsync(data);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Link
            href="/dashboard/components"
            className="hover:text-zinc-200 transition-colors"
          >
            Components
          </Link>
          <span>/</span>
          <span className="text-zinc-100 font-medium">
            New Component Draft
          </span>
        </div>

        {/* Page Title */}
        <div className="pb-4 border-b border-zinc-800">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
            Create Component Draft
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Define metadata, props, dependencies, and preview fixtures. The component will be saved as a draft and kept private until validated and published.
          </p>
        </div>

        {/* Form Container */}
        <ComponentForm
          onSubmit={handleCreateDraft}
          isSubmitting={createDraftMutation.isPending}
        />
      </div>
    </AdminLayout>
  );
}
