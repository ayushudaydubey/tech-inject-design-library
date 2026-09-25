import React from "react";
import { ComponentAccessType } from "../../types/component";

export interface ComponentAccessBadgeProps {
  accessType: ComponentAccessType;
  className?: string;
}

export const ComponentAccessBadge: React.FC<ComponentAccessBadgeProps> = ({
  accessType,
  className = "",
}) => {
  const isPremium = accessType === "premium";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium ${
        isPremium
          ? "bg-zinc-850 text-blue-200 border border-zinc-700/80"
          : "bg-zinc-850 text-green-300 border border-zinc-700/80"
      } ${className}`}
    >
      {isPremium ? (
        <svg className="w-2.5 h-2.5 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
      )}
      <span className="capitalize">{accessType}</span>
    </span>
  );
};
