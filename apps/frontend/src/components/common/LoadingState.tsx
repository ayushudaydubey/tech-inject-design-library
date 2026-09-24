import React from "react";

export interface LoadingStateProps {
  title?: string;
  description?: string;
  type?: "spinner" | "cards" | "detail";
  count?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = "Loading components...",
  description,
  type = "spinner",
  count = 6,
  className = "",
}) => {
  if (type === "cards") {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
        role="status"
        aria-label="Loading components"
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between h-72 shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
              </div>
              <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/60 rounded" />
                <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800/60 rounded" />
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "detail") {
    return (
      <div
        className={`space-y-8 animate-pulse ${className}`}
        role="status"
        aria-label="Loading component details"
      >
        <div className="border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-full mb-4" />
          <div className="h-10 w-96 bg-slate-200 dark:bg-slate-800 rounded mb-3" />
          <div className="h-5 w-2/3 bg-slate-100 dark:bg-slate-800/60 rounded" />
        </div>
        <div className="h-96 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center ${className}`}
      role="status"
      aria-label={title}
    >
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800" />
        <div className="absolute inset-0 rounded-full border-4 border-slate-900 dark:border-white border-t-transparent animate-spin" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          {description}
        </p>
      )}
    </div>
  );
};
