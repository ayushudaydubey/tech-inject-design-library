"use client";

import React, { useState, useMemo } from "react";
import { useComponents } from "../../hooks/useComponents";
import { ComponentSearch } from "../../components/catalog/ComponentSearch";
import { ComponentFilters } from "../../components/catalog/ComponentFilters";
import { ComponentGrid } from "../../components/catalog/ComponentGrid";
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

  const allCategories = useMemo(() => {
    return Array.from(
      new Set(components.map((c) => c.category).filter(Boolean))
    ).sort();
  }, [components]);

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
    <div className="px-5 sm:px-7 lg:px-8 py-6 w-full space-y-5">
      {/* Page Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-100">
            Component Catalogue
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Browse published React components with interactive previews, props documentation, and CLI install commands.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-700 self-start sm:self-auto flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span>
            {isLoading
              ? "Connecting..."
              : `${filteredComponents.length} component${
                  filteredComponents.length === 1 ? "" : "s"
                }`}
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="space-y-3">
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

      {/* Content Display */}
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
  );
}
