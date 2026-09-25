import React from "react";
import Link from "next/link";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No records found",
  description = "No items match your active filters or backend criteria.",
  actionText,
  actionHref,
  onAction,
  icon,
  className = "",
}) => {
  return (
    <div
      className={`rounded-xl border border-dashed border-zinc-800 bg-zinc-850/40 p-10 text-center max-w-lg mx-auto ${className}`}
    >
      <div className="mx-auto w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-400 mb-3">
        {icon || (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        )}
      </div>

      <h3 className="text-sm font-semibold text-zinc-100">
        {title}
      </h3>
      <p className="mt-1 text-xs text-zinc-400 max-w-sm mx-auto">
        {description}
      </p>

      {(actionText && (actionHref || onAction)) && (
        <div className="mt-5">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-medium text-zinc-900 bg-blue-200 hover:bg-blue-100 rounded-lg transition-colors"
            >
              {actionText}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-medium text-zinc-900 bg-blue-200 hover:bg-blue-100 rounded-lg transition-colors"
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
