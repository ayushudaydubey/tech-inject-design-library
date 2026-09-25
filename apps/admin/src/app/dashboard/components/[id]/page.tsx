"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminLayout } from "../../../../components/layout/AdminLayout";
import {
  useAdminComponent,
  useValidateDraft,
  usePublishComponent,
  useUnpublishComponent,
  useDeleteComponent,
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
  const router = useRouter();
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  const deleteMutation = useDeleteComponent();
  
  const handleDelete = async () => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await deleteMutation.mutateAsync(id);
      setShowDeleteConfirm(false);
      router.push('/dashboard/components');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setActionError(err.message || "Failed to delete component.");
      } else {
        setActionError("An unexpected error occurred while deleting.");
      }
    }
  };

  const isPublishReady =
    validationResult?.isValid === true && component?.status === "draft";

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Link
            href="/dashboard/components"
            className="hover:text-zinc-200 transition-colors"
          >
            Components
          </Link>
          <span>/</span>
          <span className="text-zinc-100 font-medium font-mono">
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
            className="p-3 rounded-md border border-red-500/30 bg-red-950/20 text-red-300 text-xs flex items-start gap-2.5"
            role="alert"
          >
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">{actionError}</div>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="text-red-400 hover:text-red-300"
            >
              &times;
            </button>
          </div>
        )}

        {actionSuccess && (
          <div
            className="p-3 rounded-md border border-green-500/30 bg-green-950/20 text-green-300 text-xs flex items-start gap-2.5"
            role="status"
          >
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" />
            </svg>
            <div className="flex-1">{actionSuccess}</div>
            <button
              type="button"
              onClick={() => setActionSuccess(null)}
              className="text-green-400 hover:text-green-300"
            >
              &times;
            </button>
          </div>
        )}

        {/* Component Detail Content */}
        {!isLoading && !isError && component && (
          <div className="space-y-6">
            {/* Header / Action Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-lg border border-zinc-700/60 bg-zinc-800 shadow-xs">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
                    {component.name}
                  </h1>
                  <span className="font-mono text-xs text-zinc-400 bg-zinc-850 px-2 py-0.5 rounded border border-zinc-700">
                    v{component.version}
                  </span>
                  <ComponentStatusBadge status={component.status} />
                  <ComponentAccessBadge accessType={component.accessType} />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                  <span>Category: <strong className="text-zinc-200 font-medium">{component.category}</strong></span>
                  <span>&bull;</span>
                  <span>Slug: <code className="font-mono text-zinc-300">{component.slug}</code></span>
                  <span>&bull;</span>
                  <span>Updated: {formatDate(component.updatedAt)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/dashboard/components/${id}/edit`}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-900 bg-blue-200 hover:bg-blue-100 rounded-md shadow-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit in Code Editor</span>
                </Link>

                <button
                  type="button"
                  onClick={handleValidate}
                  disabled={validateMutation.isPending}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-200 hover:text-zinc-100 hover:bg-zinc-700 rounded-md border border-zinc-700 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {validateMutation.isPending ? (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                        ? "Run validation and ensure all checks pass before publishing"
                        : "Publish component to public catalogue"
                    }
                    className="px-3.5 py-1.5 text-xs font-medium text-zinc-900 bg-green-300 hover:bg-green-200 rounded-md shadow-xs transition-colors inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Publish Component</span>
                  </button>
                )}

                {component.status === "published" && (
                  <button
                    type="button"
                    onClick={() => setShowUnpublishConfirm(true)}
                    disabled={unpublishMutation.isPending}
                    className="px-3.5 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-850 hover:bg-zinc-750 border border-zinc-700 rounded-md transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <span>Unpublish to Draft</span>
                  </button>
                )}
              </div>
            </div>

            {/* Description & Overview */}
            <div className="p-5 rounded-lg border border-zinc-700/60 bg-zinc-800 shadow-xs space-y-2">
              <h3 className="text-xs font-semibold text-zinc-100">
                Description
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
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

            {/* Complete Stored Component Package Overview */}
            <div className="p-5 rounded-lg border border-zinc-700/60 bg-zinc-800 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-700/60">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                    <span>Component Package Files</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-850 text-zinc-400 font-normal border border-zinc-700">
                      {(component.sourceFiles?.length || 0) + (component.supportingFiles?.length || 0) + (component.themeFiles?.length || 0)} file(s)
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    All source code, TypeScript declarations, and stylesheet tokens attached to this component package.
                  </p>
                </div>

                <Link
                  href={`/dashboard/components/${id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-200 hover:text-blue-100 bg-zinc-850 hover:bg-zinc-750 border border-zinc-700 rounded-md transition-colors self-start sm:self-auto"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Edit in Code Editor</span>
                </Link>
              </div>

              {/* Stored Files Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(component.sourceFiles || []).map((f, idx) => (
                  <div
                    key={`src-${idx}`}
                    className="p-3 rounded-md border border-zinc-700 bg-zinc-850 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-medium text-zinc-200 truncate">
                        {f.filename || f.path}
                      </span>
                      <span className="text-[10px] uppercase font-medium text-blue-200 bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded">
                        Main Source
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      {f.content ? `${Math.round(f.content.length / 1024 * 10) / 10} KB` : "0 KB"} &bull; {f.language || f.fileType}
                    </div>
                  </div>
                ))}

                {(component.supportingFiles || []).map((f, idx) => (
                  <div
                    key={`supp-${idx}`}
                    className="p-3 rounded-md border border-zinc-700 bg-zinc-850 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-medium text-zinc-200 truncate">
                        {f.filename || f.path}
                      </span>
                      <span className="text-[10px] uppercase font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded">
                        Supporting TS
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      {f.content ? `${Math.round(f.content.length / 1024 * 10) / 10} KB` : "0 KB"} &bull; {f.language || f.fileType}
                    </div>
                  </div>
                ))}

                {(component.themeFiles || []).map((f, idx) => (
                  <div
                    key={`theme-${idx}`}
                    className="p-3 rounded-md border border-zinc-700 bg-zinc-850 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-medium text-zinc-200 truncate">
                        {f.filename || f.path}
                      </span>
                      <span className="text-[10px] uppercase font-medium text-green-300 bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded">
                        Theme CSS
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      {f.content ? `${Math.round(f.content.length / 1024 * 10) / 10} KB` : "0 KB"} &bull; {f.language || f.fileType}
                    </div>
                  </div>
                ))}
              </div>

              {/* Optional Secondary Upload Dropdowns */}
              <details className="pt-2 text-xs text-zinc-400">
                <summary className="cursor-pointer hover:text-zinc-200 font-medium select-none">
                  Need to replace or upload files from disk? Click to expand manual file uploaders &darr;
                </summary>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-3">
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
              </details>
            </div>

            {/* Preview Fixture Data Upload & Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Declared Dependencies */}
              <div className="p-5 rounded-lg border border-zinc-700/60 bg-zinc-800 shadow-xs space-y-3">
                <h3 className="text-xs font-semibold text-zinc-100">
                  Declared NPM Dependencies
                </h3>
                {component.declaredDependencies &&
                Object.keys(component.declaredDependencies).length > 0 ? (
                  <div className="divide-y divide-zinc-700 rounded-md border border-zinc-700 bg-zinc-850 overflow-hidden">
                    {Object.entries(component.declaredDependencies).map(
                      ([pkg, ver]) => (
                        <div
                          key={pkg}
                          className="px-3.5 py-2 flex items-center justify-between text-xs font-mono"
                        >
                          <span className="text-zinc-200 font-normal">
                            {pkg}
                          </span>
                          <span className="text-zinc-400">
                            {ver}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic">
                    No external dependencies declared for this component.
                  </p>
                )}
              </div>

              {/* AI Agent Prompt Override */}
              <div className="p-5 rounded-lg border border-zinc-700/60 bg-zinc-800 shadow-xs space-y-3">
                <h3 className="text-xs font-semibold text-zinc-100">
                  AI Agent Prompt Instruction
                </h3>
                {component.agentPrompt ? (
                  <div className="p-3 rounded-md bg-zinc-850 border border-zinc-700 text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">
                    {component.agentPrompt}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic">
                    Standard automated installer agent prompt will be generated dynamically.
                  </p>
                )}
              </div>
            </div>

            {/* Danger Zone */}
            {component.status === "draft" && (
              <div className="p-5 rounded-lg border border-red-500/30 bg-red-950/15 shadow-xs space-y-3 mt-6">
                <div>
                  <h3 className="text-xs font-semibold text-red-300">
                    Danger Zone
                  </h3>
                  <p className="text-xs text-red-400 mt-1">
                    Permanently delete this draft component and its stored source, documentation, preview data, and related component data. This action cannot be undone.
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deleteMutation.isPending}
                    className="px-3.5 py-1.5 text-xs font-medium text-red-300 bg-red-950/30 hover:bg-red-900/40 rounded-md border border-red-500/30 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {deleteMutation.isPending ? (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    <span>{deleteMutation.isPending ? "Deleting..." : "Delete Draft"}</span>
                  </button>
                </div>
              </div>
            )}
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

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title={`Delete Draft?`}
          description={
            <div className="space-y-2">
              <p>This will permanently delete:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>component metadata</li>
                <li>source files</li>
                <li>supporting files</li>
                <li>preview data</li>
                <li>documentation</li>
                <li>dependencies</li>
                <li>AI agent prompt</li>
                <li>other persisted component data</li>
              </ul>
              <p className="pt-2 font-medium">This action cannot be undone.</p>
            </div>
          }
          confirmText="Delete Draft"
          cancelText="Cancel"
          variant="danger"
          isLoading={deleteMutation.isPending}
          onConfirm={handleDelete}
          onClose={() => setShowDeleteConfirm(false)}
        />
      </div>
    </AdminLayout>
  );
}
