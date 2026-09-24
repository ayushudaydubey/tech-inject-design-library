import React from "react";
import Link from "next/link";
import { AdminComponent } from "../../types/component";
import { ComponentStatusBadge } from "../components/ComponentStatusBadge";
import { ComponentAccessBadge } from "../components/ComponentAccessBadge";
import { formatDate } from "../../lib/utils";

export interface RecentComponentsProps {
  components: AdminComponent[];
  className?: string;
}

export const RecentComponents: React.FC<RecentComponentsProps> = ({
  components,
  className = "",
}) => {
  const recent = components.slice(0, 5);

  if (recent.length === 0) {
    return (
      <div className={`p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center ${className}`}>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          No components created yet. Start by creating a component draft.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden ${className}`}
    >
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Recently Updated Components
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Latest drafts and published library items
          </p>
        </div>
        <Link
          href="/dashboard/components"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          View All &rarr;
        </Link>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {recent.map((comp) => (
          <div
            key={comp._id}
            className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/components/${comp._id}`}
                  className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {comp.name}
                </Link>
                <span className="text-[11px] font-mono text-slate-400">
                  v{comp.version}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{comp.category}</span>
                <span>&bull;</span>
                <span className="font-mono text-[11px]">{comp.slug}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <ComponentStatusBadge status={comp.status} />
              <ComponentAccessBadge accessType={comp.accessType} />
              <div className="hidden lg:block text-right text-[11px] text-slate-400 w-28">
                {formatDate(comp.updatedAt)}
              </div>
              <Link
                href={`/dashboard/components/${comp._id}`}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors"
              >
                Inspect
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
