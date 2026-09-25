import React from "react";

export interface LoadingStateProps {
  title?: string;
  description?: string;
  type?: "spinner" | "table" | "detail" | "cards";
  count?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = "Loading...",
  description,
  type = "spinner",
  count = 5,
  className = "",
}) => {
  if (type === "table") {
    return (
      <div
        className={`w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-850 animate-pulse ${className}`}
        role="status"
        aria-label="Loading table records"
      >
        <div className="h-10 bg-zinc-900 border-b border-zinc-800" />
        <div className="divide-y divide-zinc-800">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-3.5 w-36 bg-zinc-800 rounded" />
                <div className="h-3.5 w-20 bg-zinc-800/60 rounded" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-16 bg-zinc-800 rounded-full" />
                <div className="h-4 w-16 bg-zinc-800 rounded-full" />
                <div className="h-7 w-16 bg-zinc-800 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
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
        <div className="h-20 bg-zinc-850 border border-zinc-800 rounded-xl p-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-zinc-850 border border-zinc-800 rounded-xl" />
          <div className="h-96 bg-zinc-850 border border-zinc-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (type === "cards") {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse ${className}`}
        role="status"
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-zinc-800 bg-zinc-850 space-y-3"
          >
            <div className="h-3.5 w-24 bg-zinc-800 rounded" />
            <div className="h-7 w-16 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center ${className}`}
      role="status"
      aria-label={title}
    >
      <div className="relative w-8 h-8 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
        <div className="absolute inset-0 rounded-full border-2 border-blue-200 border-t-transparent animate-spin" />
      </div>
      <h3 className="text-sm font-medium text-zinc-200">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-xs text-zinc-500 max-w-sm">
          {description}
        </p>
      )}
    </div>
  );
};
