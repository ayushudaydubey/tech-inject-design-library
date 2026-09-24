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
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
        isPremium
          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80"
          : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80"
      } ${className}`}
    >
      {isPremium ? (
        <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
      )}
      <span className="capitalize">{accessType}</span>
    </span>
  );
};
