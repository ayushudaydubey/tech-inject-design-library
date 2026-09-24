"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentSummary } from "../../types/component";

export interface SidebarProps {
  components?: ComponentSummary[];
  currentCategory?: string;
  onSelectCategory?: (category: string | undefined) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  components = [],
  currentCategory,
  onSelectCategory,
  className = "",
}) => {
  const pathname = usePathname();

  // Extract unique published categories dynamically from components
  const categories = Array.from(
    new Set(components.map((c) => c.category).filter(Boolean))
  ).sort();

  return (
    <aside
      className={`w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 p-6 space-y-8 bg-white/50 dark:bg-slate-950/50 ${className}`}
      aria-label="Component Navigation Sidebar"
    >
      {/* Category filter links */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
          Categories
        </h3>
        <ul className="space-y-1 text-sm font-medium">
          <li>
            {onSelectCategory ? (
              <button
                type="button"
                onClick={() => onSelectCategory(undefined)}
                className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                  !currentCategory
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <span>All Categories</span>
                <span className="text-xs text-slate-400">{components.length}</span>
              </button>
            ) : (
              <Link
                href="/components"
                className="block px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                All Components
              </Link>
            )}
          </li>

          {categories.map((cat) => {
            const count = components.filter((c) => c.category === cat).length;
            const isSelected = currentCategory === cat;

            return (
              <li key={cat}>
                {onSelectCategory ? (
                  <button
                    type="button"
                    onClick={() => onSelectCategory(cat)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="text-xs text-slate-400">{count}</span>
                  </button>
                ) : (
                  <Link
                    href={`/components?category=${encodeURIComponent(cat)}`}
                    className="block px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    {cat}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Component quick list if available */}
      {components.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
            Components
          </h3>
          <ul className="space-y-1 text-sm">
            {components.map((comp) => {
              const isCurrent = pathname === `/components/${comp.slug}`;
              return (
                <li key={comp.id}>
                  <Link
                    href={`/components/${comp.slug}`}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center justify-between group ${
                      isCurrent
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span className="truncate">{comp.name}</span>
                    {comp.accessType === "premium" && (
                      <span className="ml-2 flex-shrink-0 text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-900/60">
                        PRO
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Getting Started shortcut */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <Link
          href="/get-started"
          className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>CLI & Setup Guide</span>
        </Link>
      </div>
    </aside>
  );
};
