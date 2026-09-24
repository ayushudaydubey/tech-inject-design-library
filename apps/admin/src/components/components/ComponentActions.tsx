"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminComponent } from "../../types/component";
import { usePublishComponent, useUnpublishComponent } from "../../hooks/useComponents";
import { ConfirmDialog } from "../common/ConfirmDialog";

export interface ComponentActionsProps {
  component: AdminComponent;
  onSuccess?: () => void;
  className?: string;
}

export const ComponentActions: React.FC<ComponentActionsProps> = ({
  component,
  onSuccess,
  className = "",
}) => {
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const publishMutation = usePublishComponent();
  const unpublishMutation = useUnpublishComponent();

  const handlePublish = async () => {
    setActionError(null);
    try {
      await publishMutation.mutateAsync(component._id);
      setPublishDialogOpen(false);
      onSuccess?.();
    } catch (err: unknown) {
      const errorObj = err as { message?: string; errors?: string[] };
      const msg = errorObj.errors ? errorObj.errors.join("; ") : errorObj.message || "Failed to publish component.";
      setActionError(msg);
    }
  };

  const handleUnpublish = async () => {
    setActionError(null);
    try {
      await unpublishMutation.mutateAsync(component._id);
      setUnpublishDialogOpen(false);
      onSuccess?.();
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setActionError(errorObj.message || "Failed to unpublish component.");
    }
  };

  const isPublished = component.status === "published";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {actionError && (
        <span className="text-[11px] text-rose-500 truncate max-w-xs" title={actionError}>
          {actionError}
        </span>
      )}

      {/* View Link */}
      <Link
        href={`/dashboard/components/${component._id}`}
        className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors"
      >
        View
      </Link>

      {/* Edit Link */}
      <Link
        href={`/dashboard/components/${component._id}/edit`}
        className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors"
      >
        Edit
      </Link>

      {/* Publish / Unpublish Action Button */}
      {isPublished ? (
        <button
          type="button"
          onClick={() => {
            setActionError(null);
            setUnpublishDialogOpen(true);
          }}
          disabled={unpublishMutation.isPending}
          className="px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-lg border border-amber-200 dark:border-amber-900/50 transition-colors disabled:opacity-50"
        >
          {unpublishMutation.isPending ? "Reverting..." : "Unpublish"}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setActionError(null);
            setPublishDialogOpen(true);
          }}
          disabled={publishMutation.isPending}
          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg border border-emerald-200 dark:border-emerald-800/80 transition-colors disabled:opacity-50"
        >
          {publishMutation.isPending ? "Publishing..." : "Publish"}
        </button>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={publishDialogOpen}
        title={`Publish Component "${component.name}"?`}
        description="Publishing will validate source files and make this component immediately discoverable and accessible in the public developer catalogue."
        confirmText="Publish to Catalogue"
        variant="primary"
        isLoading={publishMutation.isPending}
        onConfirm={handlePublish}
        onClose={() => setPublishDialogOpen(false)}
      />

      <ConfirmDialog
        isOpen={unpublishDialogOpen}
        title={`Unpublish Component "${component.name}"?`}
        description="Unpublishing will immediately remove this component from the public catalogue and revert its status to draft. Direct public API requests will return 404."
        confirmText="Revert to Draft"
        variant="warning"
        isLoading={unpublishMutation.isPending}
        onConfirm={handleUnpublish}
        onClose={() => setUnpublishDialogOpen(false)}
      />
    </div>
  );
};
