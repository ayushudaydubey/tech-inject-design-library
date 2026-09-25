"use client";

import React from "react";

export interface ComponentFiltersProps {
  categories: string[];
  selectedCategory?: string;
  onSelectCategory: (category: string | undefined) => void;
  selectedAccessType?: "all" | "free" | "premium";
  onSelectAccessType?: (accessType: "all" | "free" | "premium") => void;
  className?: string;
}

export const ComponentFilters: React.FC<ComponentFiltersProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedAccessType = "all",
  onSelectAccessType,
  className = "",
}) => {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Component categories">
        <button
          type="button"
          onClick={() => onSelectCategory(undefined)}
          role="tab"
          aria-selected={!selectedCategory}
          className={`px-3 py-1.5 rounded-lg text-xs transition-colors border ${
            !selectedCategory
              ? "bg-zinc-800 text-blue-200 border-zinc-700 font-medium"
              : "bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border-zinc-800"
          }`}
        >
          All
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              role="tab"
              aria-selected={isSelected}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors border ${
                isSelected
                  ? "bg-zinc-800 text-blue-200 border-zinc-700 font-medium"
                  : "bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border-zinc-800"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Access Type Switcher (All / Free / Premium) */}
      {onSelectAccessType && (
        <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900 p-0.5">
          <button
            type="button"
            onClick={() => onSelectAccessType("all")}
            className={`px-3 py-1 rounded-md text-xs transition-colors ${
              selectedAccessType === "all"
                ? "bg-zinc-800 text-zinc-100 font-medium"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onSelectAccessType("free")}
            className={`px-3 py-1 rounded-md text-xs transition-colors flex items-center gap-1.5 ${
              selectedAccessType === "free"
                ? "bg-zinc-800 text-green-300 font-medium"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Free
          </button>
          <button
            type="button"
            onClick={() => onSelectAccessType("premium")}
            className={`px-3 py-1 rounded-md text-xs transition-colors flex items-center gap-1.5 ${
              selectedAccessType === "premium"
                ? "bg-zinc-800 text-blue-200 font-medium"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
            Premium
          </button>
        </div>
      )}
    </div>
  );
};
