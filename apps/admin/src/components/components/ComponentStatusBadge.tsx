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
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
        isPublished
          ? "bg-zinc-850 text-green-300 border border-zinc-700/80"
          : "bg-zinc-850 text-zinc-400 border border-zinc-700/80"
      } ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isPublished ? "bg-green-400" : "bg-zinc-500"
        }`}
      />
      <span>{status}</span>
    </span>
  );
};
