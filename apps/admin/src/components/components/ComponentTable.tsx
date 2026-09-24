"use client";

import React, { useState, useMemo } from "react";
import { AdminComponent } from "../../types/component";
import { ComponentRow } from "./ComponentRow";
import { EmptyState } from "../common/EmptyState";

export interface ComponentTableProps {
  components: AdminComponent[];
  onRefresh?: () => void;
  className?: string;
}

export const ComponentTable: React.FC<ComponentTableProps> = ({
  components,
  onRefresh,
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [accessFilter, setAccessFilter] = useState<"all" | "free" | "premium">("all");

  const filtered = useMemo(() => {
    return components.filter((comp) => {
      // Search check
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase();
        const matchesName = comp.name.toLowerCase().includes(query);
        const matchesSlug = comp.slug.toLowerCase().includes(query);
        const matchesCategory = comp.category.toLowerCase().includes(query);
        if (!matchesName && !matchesSlug && !matchesCategory) return false;
      }

      // Status check
      if (statusFilter !== "all" && comp.status !== statusFilter) {
        return false;
      }

      // Access type check
      if (accessFilter !== "all" && comp.accessType !== accessFilter) {
        return false;
      }

      return true;
    });
  }, [components, searchTerm, statusFilter, accessFilter]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setAccessFilter("all");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by component name, slug, or category..."
            className="w-full pl-9 pr-8 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All Status
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("draft")}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                statusFilter === "draft"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Drafts
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("published")}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                statusFilter === "published"
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              Published
            </button>
          </div>

          {/* Access Filter */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setAccessFilter("all")}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                accessFilter === "all"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All Tiers
            </button>
            <button
              type="button"
              onClick={() => setAccessFilter("free")}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                accessFilter === "free"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              Free
            </button>
            <button
              type="button"
              onClick={() => setAccessFilter("premium")}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                accessFilter === "premium"
                  ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-amber-600 dark:hover:text-amber-400"
              }`}
            >
              Premium
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No components match criteria"
          description="Adjust your search terms or reset the filters to view library items."
          actionText="Reset Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Component</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Version</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Tier</th>
                  <th className="px-6 py-3.5">Updated</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((component) => (
                  <ComponentRow
                    key={component._id}
                    component={component}
                    onRefresh={onRefresh}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
