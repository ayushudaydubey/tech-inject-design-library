"use client";

import React, { useState, useMemo } from "react";
import { useComponents } from "../../hooks/useComponents";
import { ComponentSearch } from "../../components/catalog/ComponentSearch";
import { ComponentFilters } from "../../components/catalog/ComponentFilters";
import { ComponentGrid } from "../../components/catalog/ComponentGrid";
import { Sidebar } from "../../components/layout/Sidebar";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";

export default function ComponentsCataloguePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [selectedAccessType, setSelectedAccessType] = useState<
    "all" | "free" | "premium"
  >("all");

  // Query published components from backend via TanStack Query
  const {
    data: components = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useComponents({
    category: selectedCategory,
    search: searchTerm.trim() !== "" ? searchTerm.trim() : undefined,
  });

  // Extract unique categories across published components
  const allCategories = useMemo(() => {
    return Array.from(
      new Set(components.map((c) => c.category).filter(Boolean))
    ).sort();
  }, [components]);

  // Client-side access tier filtering on published data
  const filteredComponents = useMemo(() => {
    if (selectedAccessType === "all") return components;
    return components.filter((c) => c.accessType === selectedAccessType);
  }, [components, selectedAccessType]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory(undefined);
    setSelectedAccessType("all");
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row">
      {/* Desktop Navigation Sidebar */}
      <Sidebar
        components={components}
        currentCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        className="hidden lg:block"
      />

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Page Title & Intro */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Component Catalogue
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Browse published, production-ready React components with interactive previews and install commands.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              {isLoading
                ? "Connecting to backend..."
                : `${filteredComponents.length} published component${
                    filteredComponents.length === 1 ? "" : "s"
                  }`}
            </span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <ComponentSearch
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search components by name or description..."
            />
          </div>

          <ComponentFilters
            categories={allCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedAccessType={selectedAccessType}
            onSelectAccessType={setSelectedAccessType}
          />
        </div>

        {/* Content Display: Loading / Error / Grid */}
        {isLoading ? (
          <LoadingState type="cards" count={6} />
        ) : isError ? (
          <ErrorState
            statusCode={error?.status}
            message={error?.userFriendlyMessage || error?.message}
            onRetry={() => refetch()}
          />
        ) : (
          <ComponentGrid
            components={filteredComponents}
            onResetFilters={
              searchTerm || selectedCategory || selectedAccessType !== "all"
                ? handleResetFilters
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
