import React from "react";
import Link from "next/link";
import { AdminComponent } from "../../types/component";
import { ComponentStatusBadge } from "./ComponentStatusBadge";
import { ComponentAccessBadge } from "./ComponentAccessBadge";
import { ComponentActions } from "./ComponentActions";
import { formatDate } from "../../lib/utils";

export interface ComponentRowProps {
  component: AdminComponent;
  onRefresh?: () => void;
}

export const ComponentRow: React.FC<ComponentRowProps> = ({
  component,
  onRefresh,
}) => {
  return (
    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <Link
            href={`/dashboard/components/${component._id}`}
            className="text-xs font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {component.name}
          </Link>
          <span className="font-mono text-[11px] text-slate-400 mt-0.5">
            {component.slug}
          </span>
        </div>
      </td>

      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
          {component.category}
        </span>
      </td>

      <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
        v{component.version}
      </td>

      <td className="px-6 py-4">
        <ComponentStatusBadge status={component.status} />
      </td>

      <td className="px-6 py-4">
        <ComponentAccessBadge accessType={component.accessType} />
      </td>

      <td className="px-6 py-4 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
        {formatDate(component.updatedAt)}
      </td>

      <td className="px-6 py-4 text-right">
        <ComponentActions component={component} onSuccess={onRefresh} />
      </td>
    </tr>
  );
};
