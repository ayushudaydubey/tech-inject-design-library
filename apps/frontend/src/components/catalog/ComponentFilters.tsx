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
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            !selectedCategory
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
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
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Access Type Switcher (All / Free / Premium) */}
      {onSelectAccessType && (
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-1">
          <button
            type="button"
            onClick={() => onSelectAccessType("all")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedAccessType === "all"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onSelectAccessType("free")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
              selectedAccessType === "free"
                ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold"
                : "text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Free
          </button>
          <button
            type="button"
            onClick={() => onSelectAccessType("premium")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
              selectedAccessType === "premium"
                ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs font-semibold"
                : "text-slate-500 hover:text-amber-600 dark:hover:text-amber-400"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Premium
          </button>
        </div>
      )}
    </div>
  );
};
