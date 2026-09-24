import React from "react";
import { ComponentStatus } from "../../types/component";

export interface ComponentStatusBadgeProps {
  status: ComponentStatus;
  className?: string;
}

export const ComponentStatusBadge: React.FC<ComponentStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const isPublished = status === "published";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
        isPublished
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80"
          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
      } ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isPublished ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      <span>{status}</span>
    </span>
  );
};
