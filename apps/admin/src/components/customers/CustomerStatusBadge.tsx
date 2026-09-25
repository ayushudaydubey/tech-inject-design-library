import React from "react";

interface CustomerStatusBadgeProps {
  isPremium: boolean;
  className?: string;
}

export function CustomerStatusBadge({
  isPremium,
  className = "",
}: CustomerStatusBadgeProps) {
  if (isPremium) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-850 text-blue-200 border border-zinc-700/80 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-blue-200" />
        Premium
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-850 text-green-300 border border-zinc-700/80 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
      Free Tier
    </span>
  );
}
