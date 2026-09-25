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
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-lg border border-zinc-700/60 bg-zinc-800 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zinc-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by component name, slug, or category..."
            className="w-full pl-8 pr-7 py-1.5 rounded-md border border-zinc-700 bg-zinc-900 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-200/50"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-2 flex items-center text-zinc-400 hover:text-zinc-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center rounded-md border border-zinc-700 bg-zinc-900 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-zinc-800 text-zinc-100 shadow-xs border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All Status
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("draft")}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                statusFilter === "draft"
                  ? "bg-zinc-800 text-zinc-100 shadow-xs border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Drafts
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("published")}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                statusFilter === "published"
                  ? "bg-zinc-800 text-green-300 shadow-xs border border-zinc-700"
                  : "text-zinc-400 hover:text-green-300"
              }`}
            >
              Published
            </button>
          </div>

          {/* Access Filter */}
          <div className="flex items-center rounded-md border border-zinc-700 bg-zinc-900 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setAccessFilter("all")}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                accessFilter === "all"
                  ? "bg-zinc-800 text-zinc-100 shadow-xs border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All Tiers
            </button>
            <button
              type="button"
              onClick={() => setAccessFilter("free")}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                accessFilter === "free"
                  ? "bg-zinc-800 text-green-300 shadow-xs border border-zinc-700"
                  : "text-zinc-400 hover:text-green-300"
              }`}
            >
              Free
            </button>
            <button
              type="button"
              onClick={() => setAccessFilter("premium")}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                accessFilter === "premium"
                  ? "bg-zinc-800 text-blue-200 shadow-xs border border-zinc-700"
                  : "text-zinc-400 hover:text-blue-200"
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
        <div className="rounded-lg border border-zinc-700/60 bg-zinc-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-850 border-b border-zinc-700 text-zinc-400 uppercase tracking-wider font-medium text-[11px]">
                <tr>
                  <th className="px-5 py-3">Component</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Version</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Tier</th>
                  <th className="px-5 py-3">Updated</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700/50">
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
