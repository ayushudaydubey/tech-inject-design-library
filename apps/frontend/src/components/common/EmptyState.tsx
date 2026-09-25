import React from "react";
import Link from "next/link";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  actionHref?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No components found",
  description = "No matching published components were returned from the catalogue API.",
  actionText,
  onAction,
  actionHref,
  icon,
  className = "",
}) => {
  return (
    <div
      className={`rounded-lg border border-dashed border-zinc-700/80 bg-zinc-900/40 p-10 text-center max-w-md mx-auto ${className}`}
    >
      <div className="mx-auto w-10 h-10 rounded-md bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3 border border-zinc-750">
        {icon || (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )}
      </div>

      <h3 className="text-sm font-semibold text-zinc-100">
        {title}
      </h3>
      <p className="mt-1 text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>

      {(onAction || actionHref) && actionText && (
        <div className="mt-5">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md transition-colors"
            >
              {actionText}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-blue-200/50"
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
