"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "../../../../components/layout/AdminLayout";
import {
  useAdminComponent,
  useValidateDraft,
  usePublishComponent,
  useUnpublishComponent,
} from "../../../../hooks/useComponents";
import { ComponentStatusBadge } from "../../../../components/components/ComponentStatusBadge";
import { ComponentAccessBadge } from "../../../../components/components/ComponentAccessBadge";
import { DraftPreview } from "../../../../components/component-preview/DraftPreview";
import { ValidationResult } from "../../../../components/component-preview/ValidationResult";
import { PreviewData } from "../../../../components/component-preview/PreviewData";
import { SourceFileUpload } from "../../../../components/uploads/SourceFileUpload";
import { SupportingFilesUpload } from "../../../../components/uploads/SupportingFilesUpload";
import { PreviewDataUpload } from "../../../../components/uploads/PreviewDataUpload";
import { ConfirmDialog } from "../../../../components/common/ConfirmDialog";
import { LoadingState } from "../../../../components/common/LoadingState";
import { ErrorState } from "../../../../components/common/ErrorState";
import { formatDate } from "../../../../lib/utils";
import { ValidationResult as IValidationResult } from "../../../../types/component";
import { ApiError } from "../../../../lib/api";

export default function AdminComponentDetailPage({
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

  const validateMutation = useValidateDraft();
  const publishMutation = usePublishComponent();
  const unpublishMutation = useUnpublishComponent();

  const [validationResult, setValidationResult] =
    useState<IValidationResult | null>(null);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleValidate = async () => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await validateMutation.mutateAsync(id);
      setValidationResult(res);
      if (res.isValid) {
        setActionSuccess("Validation passed! The component is ready to publish.");
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else {
        setActionError("Failed to validate component draft.");
      }
    }
  };

  const handlePublish = async () => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await publishMutation.mutateAsync(id);
      setShowPublishConfirm(false);
      setActionSuccess("Component published successfully to the public catalogue!");
      refetch();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setActionError(err.message || "Failed to publish component.");
      } else {
        setActionError("An unexpected error occurred while publishing.");
      }
    }
  };

  const handleUnpublish = async () => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await unpublishMutation.mutateAsync(id);
      setShowUnpublishConfirm(false);
      setActionSuccess("Component unpublished and reverted to draft status.");
      refetch();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setActionError(err.message || "Failed to unpublish component.");
      } else {
        setActionError("An unexpected error occurred while unpublishing.");
      }
    }
  };

  const isPublishReady =
    validationResult?.isValid ||
    (component?.status === "draft" &&
      component.sourceFiles &&
      component.sourceFiles.length > 0);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/dashboard/components"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Components
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium font-mono">
            {component?.slug || id}
          </span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <LoadingState
            type="detail"
            title="Loading component details and files..."
          />
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <ErrorState
            statusCode={error?.status}
            message={error?.message || "Failed to load component details."}
            onRetry={() => refetch()}
          />
        )}

        {/* Action Banner Alerts */}
        {actionError && (
          <div
            className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5"
            role="alert"
          >
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">{actionError}</div>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="text-rose-500 hover:text-rose-700"
            >
              &times;
            </button>
          </div>
        )}

        {actionSuccess && (
          <div
            className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5"
            role="status"
          >
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div className="flex-1">{actionSuccess}</div>
            <button
              type="button"
              onClick={() => setActionSuccess(null)}
              className="text-emerald-500 hover:text-emerald-700"
            >
              &times;
            </button>
          </div>
        )}

        {/* Component Detail Content */}
        {!isLoading && !isError && component && (
          <div className="space-y-8">
            {/* Header / Action Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {component.name}
                  </h1>
                  <span className="font-mono text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    v{component.version}
                  </span>
                  <ComponentStatusBadge status={component.status} />
                  <ComponentAccessBadge accessType={component.accessType} />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>Category: <strong className="text-slate-700 dark:text-slate-200">{component.category}</strong></span>
                  <span>&bull;</span>
                  <span>Slug: <code className="font-mono text-slate-600 dark:text-slate-300">{component.slug}</code></span>
                  <span>&bull;</span>
                  <span>Updated: {formatDate(component.updatedAt)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href={`/dashboard/components/${id}/edit`}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors inline-flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Metadata</span>
                </Link>

                <button
                  type="button"
                  onClick={handleValidate}
                  disabled={validateMutation.isPending}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {validateMutation.isPending ? (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span>Validate Draft</span>
                </button>

                {component.status === "draft" && (
                  <button
                    type="button"
                    onClick={() => setShowPublishConfirm(true)}
                    disabled={publishMutation.isPending || !isPublishReady}
                    title={
                      !isPublishReady
                        ? "Upload at least one source file or run validation before publishing"
                        : "Publish to public catalogue"
                    }
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Publish Component</span>
                  </button>
                )}

                {component.status === "published" && (
                  <button
                    type="button"
                    onClick={() => setShowUnpublishConfirm(true)}
                    disabled={unpublishMutation.isPending}
                    className="px-4 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 rounded-lg transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <span>Unpublish to Draft</span>
                  </button>
                )}
              </div>
            </div>

            {/* Description & Overview */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Description
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {component.description}
              </p>
            </div>

            {/* Validation Panel */}
            <ValidationResult
              result={validationResult}
              isValidating={validateMutation.isPending}
              onValidate={handleValidate}
            />

            {/* Visual Sandbox Preview */}
            <DraftPreview component={component} />

            {/* Upload Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SourceFileUpload
                componentId={id}
                sourceFiles={component.sourceFiles}
                onUploadSuccess={() => {
                  refetch();
                  setActionSuccess("Source file uploaded successfully.");
                }}
              />

              <SupportingFilesUpload
                componentId={id}
                supportingFiles={component.supportingFiles}
                themeFiles={component.themeFiles}
                onUploadSuccess={() => {
                  refetch();
                  setActionSuccess("Supporting bundle files uploaded successfully.");
                }}
              />
            </div>

            {/* Preview Fixture Data Upload & Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PreviewDataUpload
                componentId={id}
                currentPreviewData={component.previewData}
                onUpdateSuccess={() => {
                  refetch();
                  setActionSuccess("Preview data fixture saved.");
                }}
              />

              <PreviewData previewData={component.previewData} />
            </div>

            {/* Props & Dependencies Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Declared Dependencies */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Declared NPM Dependencies
                </h3>
                {component.declaredDependencies &&
                Object.keys(component.declaredDependencies).length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 overflow-hidden">
                    {Object.entries(component.declaredDependencies).map(
                      ([pkg, ver]) => (
                        <div
                          key={pkg}
                          className="px-3.5 py-2 flex items-center justify-between text-xs font-mono"
                        >
                          <span className="text-slate-800 dark:text-slate-200">
                            {pkg}
                          </span>
                          <span className="text-slate-500 font-semibold">
                            {ver}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No external dependencies declared for this component.
                  </p>
                )}
              </div>

              {/* AI Agent Prompt Override */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  AI Agent Prompt Instruction
                </h3>
                {component.agentPrompt ? (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                    {component.agentPrompt}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Standard automated installer agent prompt will be generated dynamically.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialogs */}
        <ConfirmDialog
          isOpen={showPublishConfirm}
          title={`Publish "${component?.name}" to Public Catalogue?`}
          description="Publishing will make this component immediately visible and installable in the public catalogue. Ensure that source code and dependencies are valid."
          confirmText="Publish to Catalogue"
          cancelText="Cancel"
          variant="primary"
          isLoading={publishMutation.isPending}
          onConfirm={handlePublish}
          onClose={() => setShowPublishConfirm(false)}
        />

        <ConfirmDialog
          isOpen={showUnpublishConfirm}
          title={`Unpublish "${component?.name}"?`}
          description="This will immediately hide this component from the public catalogue and prevent new downloads. The component will remain in your admin console as a draft."
          confirmText="Unpublish Component"
          cancelText="Cancel"
          variant="warning"
          isLoading={unpublishMutation.isPending}
          onConfirm={handleUnpublish}
          onClose={() => setShowUnpublishConfirm(false)}
        />
      </div>
    </AdminLayout>
  );
}
