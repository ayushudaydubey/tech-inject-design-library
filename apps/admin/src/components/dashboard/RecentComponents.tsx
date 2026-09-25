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
      <div className={`p-6 rounded-lg border border-zinc-700/60 bg-zinc-800 text-center ${className}`}>
        <p className="text-xs text-zinc-400">
          No components created yet. Start by creating a component draft.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-zinc-700/60 bg-zinc-800 shadow-xs overflow-hidden ${className}`}
    >
      <div className="px-5 py-3.5 border-b border-zinc-700/60 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-zinc-100">
            Recently Updated Components
          </h3>
          <p className="text-[11px] text-zinc-400">
            Latest drafts and published library items
          </p>
        </div>
        <Link
          href="/dashboard/components"
          className="text-xs font-medium text-blue-200 hover:text-blue-100"
        >
          View All &rarr;
        </Link>
      </div>

      <div className="divide-y divide-zinc-700/50">
        {recent.map((comp) => (
          <div
            key={comp._id}
            className="p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-750/50 transition-colors"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/components/${comp._id}`}
                  className="text-xs font-semibold text-zinc-100 hover:text-blue-200 transition-colors"
                >
                  {comp.name}
                </Link>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-850 px-1 py-0.2 rounded border border-zinc-700">
                  v{comp.version}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span>{comp.category}</span>
                <span>&bull;</span>
                <span className="font-mono text-[10px]">{comp.slug}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-center">
              <ComponentStatusBadge status={comp.status} />
              <ComponentAccessBadge accessType={comp.accessType} />
              <div className="hidden lg:block text-right text-[11px] text-zinc-400 w-28">
                {formatDate(comp.updatedAt)}
              </div>
              <Link
                href={`/dashboard/components/${comp._id}`}
                className="px-2.5 py-1 text-xs font-medium text-zinc-200 hover:text-zinc-100 hover:bg-zinc-700 rounded-md border border-zinc-700 transition-colors"
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
