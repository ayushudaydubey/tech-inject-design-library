"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useComponents } from "../../hooks/useComponents";
import { ComponentSummary } from "../../types/component";

export interface SidebarProps {
  components?: ComponentSummary[];
  className?: string;
  onItemClick?: () => void;
}

const PREFERRED_CATEGORY_ORDER = [
  "Actions",
  "Forms",
  "Data Display",
  "Feedback",
  "Navigation",
  "Overlay",
  "Premium/Data",
  "CRM / Data",
  "CRM",
];

const DEFAULT_OPEN_CATEGORIES = new Set(["Actions", "Forms", "Data Display"]);

export const Sidebar: React.FC<SidebarProps> = ({
  components: passedComponents,
  className = "",
  onItemClick,
}) => {
  const pathname = usePathname();

  const { data: apiComponents = [], isLoading } = useComponents();
  const components =
    passedComponents && passedComponents.length > 0
      ? passedComponents
      : apiComponents;

  const [sidebarSearch, setSidebarSearch] = useState("");
  const [userToggled, setUserToggled] = useState<Record<string, boolean>>({});

  const groupedComponents = useMemo(() => {
    const groups: Record<string, ComponentSummary[]> = {};

    components.forEach((comp) => {
      if (comp.status && comp.status !== "published") return;

      const cat = (comp.category || "General").trim();
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(comp);
    });

    Object.keys(groups).forEach((cat) => {
      groups[cat].sort((a, b) => a.name.localeCompare(b.name));
    });

    return groups;
  }, [components]);

  const sortedCategories = useMemo(() => {
    const existingCats = Object.keys(groupedComponents);

    return existingCats.sort((a, b) => {
      const idxA = PREFERRED_CATEGORY_ORDER.indexOf(a);
      const idxB = PREFERRED_CATEGORY_ORDER.indexOf(b);

      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [groupedComponents]);

  const filteredGroups = useMemo(() => {
    const query = sidebarSearch.trim().toLowerCase();
    if (!query) return groupedComponents;

    const result: Record<string, ComponentSummary[]> = {};
    Object.entries(groupedComponents).forEach(([cat, items]) => {
      const matchingItems = items.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.slug.toLowerCase().includes(query) ||
          (c.description && c.description.toLowerCase().includes(query))
      );
      if (matchingItems.length > 0) {
        result[cat] = matchingItems;
      }
    });
    return result;
  }, [groupedComponents, sidebarSearch]);

  const isCategoryOpen = (category: string, items: ComponentSummary[]) => {
    if (sidebarSearch.trim() && items.length > 0) {
      return true;
    }
    if (category in userToggled) {
      return userToggled[category];
    }
    const containsActive = items.some(
      (item) => pathname === `/components/${item.slug}`
    );
    if (containsActive) {
      return true;
    }
    return DEFAULT_OPEN_CATEGORIES.has(category);
  };

  const toggleCategory = (category: string, currentState: boolean) => {
    setUserToggled((prev) => ({
      ...prev,
      [category]: !currentState,
    }));
  };

  const isOverviewActive =
    pathname === "/components" || pathname === "/components/";

  return (
    <aside
      className={`w-full h-full flex-shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-950 px-3 py-2.5 select-none ${className}`}
      aria-label="Component Documentation Navigation"
    >
      {/* Sidebar Header & Compact Search */}
      <div className="space-y-2 pb-2.5 border-b border-zinc-800">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Components
          </span>
          <span className="text-[10px] font-mono font-medium text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded border border-zinc-700">
            {components.length}
          </span>
        </div>

        {/* Compact Quick Search */}
        <div className="relative">
          <input
            type="text"
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
            placeholder="Quick search..."
            aria-label="Quick search components"
            className="w-full pl-7 pr-6 py-1 h-8 text-xs bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-200/50 transition-colors"
          />
          <svg
            className="w-3.5 h-3.5 text-zinc-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {sidebarSearch && (
            <button
              type="button"
              onClick={() => setSidebarSearch("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 p-0.5"
              aria-label="Clear quick search"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav
        className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-1 text-xs focus:outline-none"
        tabIndex={0}
        aria-label="Catalogue Navigation Items"
      >
        {/* Overview Item */}
        <div className="mb-1.5 pb-1.5 border-b border-zinc-800">
          <Link
            href="/components"
            onClick={onItemClick}
            aria-current={isOverviewActive ? "page" : undefined}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
              isOverviewActive
                ? "bg-zinc-800 text-blue-200 font-medium"
                : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={isOverviewActive ? "text-blue-200" : "text-zinc-400"}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </span>
              <span>Overview</span>
            </div>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                isOverviewActive
                  ? "bg-blue-200/10 text-blue-200 border-blue-200/20"
                  : "bg-zinc-800 text-zinc-500 border-zinc-700"
              }`}
            >
              ALL
            </span>
          </Link>
        </div>

        {/* Loading Skeletons */}
        {isLoading && components.length === 0 && (
          <div className="space-y-2 px-1 py-1.5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="space-y-1 animate-pulse">
                <div className="h-3.5 bg-zinc-800 rounded w-2/3" />
                <div className="pl-2 space-y-1">
                  <div className="h-3 bg-zinc-800/60 rounded w-4/5" />
                  <div className="h-3 bg-zinc-800/60 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Categories Accordion Groups */}
        {sortedCategories.map((category) => {
          const items = filteredGroups[category] || [];
          if (items.length === 0 && sidebarSearch.trim()) return null;

          const isOpen = isCategoryOpen(category, items);
          const categorySlug = category
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-");
          const panelId = `sidebar-cat-panel-${categorySlug}`;
          const headerId = `sidebar-cat-header-${categorySlug}`;

          return (
            <div key={category} className="space-y-0.5">
              {/* Category Accordion Header Button */}
              <button
                type="button"
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleCategory(category, isOpen)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-200/50"
              >
                <span className="truncate">{category}</span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {items.length}
                  </span>
                  <svg
                    className={`w-3 h-3 text-zinc-500 transition-transform duration-200 ${
                      isOpen ? "rotate-90" : "rotate-0"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>

              {/* Collapsible Component Items List */}
              {isOpen && (
                <ul
                  id={panelId}
                  role="region"
                  aria-labelledby={headerId}
                  className="space-y-0.5 pl-2 border-l border-zinc-800 ml-3 my-0.5"
                >
                  {items.map((comp) => {
                    const isCurrent = pathname === `/components/${comp.slug}`;
                    const isPremium = comp.accessType === "premium";

                    return (
                      <li key={comp.id || comp.slug}>
                        <Link
                          href={`/components/${comp.slug}`}
                          onClick={onItemClick}
                          aria-current={isCurrent ? "page" : undefined}
                          className={`group flex items-center justify-between px-2 py-1 rounded-md text-xs transition-colors ${
                            isCurrent
                              ? "bg-zinc-800 text-blue-200 font-medium border-l-2 border-blue-200 pl-1.5"
                              : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                          }`}
                        >
                          <span className="truncate pr-1">{comp.name}</span>
                          {isPremium && (
                            <span className="ml-auto flex-shrink-0 text-[9px] font-medium text-amber-300 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                              PRO
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

        {sidebarSearch.trim() && Object.keys(filteredGroups).length === 0 && (
          <div className="py-3 text-center text-xs text-zinc-500">
            No components match &quot;{sidebarSearch}&quot;
          </div>
        )}
      </nav>

      {/* Sidebar Footer */}
      <div className="pt-2 border-t border-zinc-800">
        <Link
          href="/get-started"
          onClick={onItemClick}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
        >
          <svg
            className="w-3.5 h-3.5 text-blue-200 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="truncate">CLI & Setup Guide</span>
        </Link>
      </div>
    </aside>
  );
};
