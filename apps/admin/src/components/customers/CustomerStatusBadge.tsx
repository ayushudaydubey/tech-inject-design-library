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
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Premium
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/60 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
      Free Tier
    </span>
  );
}
