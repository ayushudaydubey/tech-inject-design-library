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
    <div className={`flex items-center justify-end gap-1.5 ${className}`}>
      {actionError && (
        <span className="text-[11px] text-red-400 truncate max-w-xs" title={actionError}>
          {actionError}
        </span>
      )}

      {/* View Link */}
      <Link
        href={`/dashboard/components/${component._id}`}
        className="px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700 rounded-md border border-zinc-700 transition-colors"
      >
        View
      </Link>

      {/* Edit Link */}
      <Link
        href={`/dashboard/components/${component._id}/edit`}
        className="px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700 rounded-md border border-zinc-700 transition-colors"
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
          className="px-2.5 py-1 text-xs font-medium text-zinc-300 bg-zinc-850 hover:bg-zinc-750 rounded-md border border-zinc-700 transition-colors disabled:opacity-50"
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
          className="px-2.5 py-1 text-xs font-medium text-green-300 bg-zinc-850 hover:bg-zinc-750 rounded-md border border-zinc-700 transition-colors disabled:opacity-50"
        >
          {publishMutation.isPending ? "Publishing..." : "Publish"}
        </button>
      )}

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
