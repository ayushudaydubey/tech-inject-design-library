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
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 ${className}`}
        role="status"
        aria-label="Loading components"
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-zinc-700/60 bg-zinc-800 p-5 flex flex-col justify-between h-64"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="h-5 w-20 bg-zinc-700/70 rounded" />
                <div className="h-4 w-14 bg-zinc-700/50 rounded" />
              </div>
              <div className="h-5 w-2/3 bg-zinc-700/70 rounded mb-2.5" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-full bg-zinc-700/40 rounded" />
                <div className="h-3.5 w-4/5 bg-zinc-700/40 rounded" />
              </div>
            </div>
            <div className="pt-3.5 border-t border-zinc-700/50 flex items-center justify-between">
              <div className="h-3.5 w-16 bg-zinc-700/60 rounded" />
              <div className="h-8 w-20 bg-zinc-700/60 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "detail") {
    return (
      <div
        className={`space-y-6 animate-pulse ${className}`}
        role="status"
        aria-label="Loading component details"
      >
        <div className="border-b border-zinc-800 pb-6">
          <div className="h-4 w-28 bg-zinc-800 rounded mb-3" />
          <div className="h-8 w-80 bg-zinc-800 rounded mb-2.5" />
          <div className="h-4 w-1/2 bg-zinc-800/60 rounded" />
        </div>
        <div className="h-80 rounded-lg bg-zinc-850 border border-zinc-750" />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center p-10 text-center ${className}`}
      role="status"
      aria-label={title}
    >
      <div className="relative w-8 h-8 mb-3">
        <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
        <div className="absolute inset-0 rounded-full border-2 border-blue-200 border-t-transparent animate-spin" />
      </div>
      <h3 className="text-sm font-medium text-zinc-200">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-xs text-zinc-400 max-w-sm">
          {description}
        </p>
      )}
    </div>
  );
};
