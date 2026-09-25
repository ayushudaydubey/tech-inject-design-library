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
    <tr className="hover:bg-zinc-750/50 transition-colors">
      <td className="px-5 py-3">
        <div className="flex flex-col">
          <Link
            href={`/dashboard/components/${component._id}`}
            className="text-xs font-semibold text-zinc-100 hover:text-blue-200 transition-colors"
          >
            {component.name}
          </Link>
          <span className="font-mono text-[10px] text-zinc-400 mt-0.5">
            {component.slug}
          </span>
        </div>
      </td>

      <td className="px-5 py-3 text-xs text-zinc-300">
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-850 border border-zinc-700 text-zinc-300 text-[10px] font-medium">
          {component.category}
        </span>
      </td>

      <td className="px-5 py-3 font-mono text-[11px] text-zinc-400">
        v{component.version}
      </td>

      <td className="px-5 py-3">
        <ComponentStatusBadge status={component.status} />
      </td>

      <td className="px-5 py-3">
        <ComponentAccessBadge accessType={component.accessType} />
      </td>

      <td className="px-5 py-3 text-[11px] text-zinc-400 whitespace-nowrap">
        {formatDate(component.updatedAt)}
      </td>

      <td className="px-5 py-3 text-right">
        <ComponentActions component={component} onSuccess={onRefresh} />
      </td>
    </tr>
  );
};
