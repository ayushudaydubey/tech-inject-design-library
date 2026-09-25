"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useAdminComponents } from "../../hooks/useComponents";

// Standard curated system categories
const DEFAULT_CATEGORIES = [
  "Actions",
  "Forms",
  "Data Display",
  "Feedback",
  "Navigation",
  "Overlay",
  "Analytics",
  "CRM Pipeline",
  "Layout",
  "Media",
  "Typography",
];

export interface CategorySelectProps {
  value: string;
  onChange: (category: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onChange,
  disabled = false,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  // Fetch all existing components to dynamically extract all existing categories in use
  const { data: components = [] } = useAdminComponents();

  // Compute category list with component counts
  const { categoryList, categoryCounts } = useMemo(() => {
    const counts: Record<string, number> = {};

    // Count categories from existing DB components
    components.forEach((comp) => {
      const cat = (comp.category || "").trim();
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });

    // Merge default categories
    DEFAULT_CATEGORIES.forEach((cat) => {
      if (!(cat in counts)) {
        counts[cat] = 0;
      }
    });

    // Include the currently selected value if any
    if (value && value.trim() && !(value.trim() in counts)) {
      counts[value.trim()] = 0;
    }

    // Sort categories: items with higher count / standard ones first, then alphabetical
    const sorted = Object.keys(counts).sort((a, b) => {
      // If one has components and the other doesn't
      if (counts[a] > 0 && counts[b] === 0) return -1;
      if (counts[b] > 0 && counts[a] === 0) return 1;
      return a.localeCompare(b);
    });

    return {
      categoryList: sorted,
      categoryCounts: counts,
    };
  }, [components, value]);

  // Filtered categories based on search query
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categoryList;
    return categoryList.filter((cat) => cat.toLowerCase().includes(query));
  }, [categoryList, searchQuery]);

  // Check if search query exact matches any existing category
  const hasExactMatch = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return false;
    return categoryList.some((cat) => cat.toLowerCase() === query);
  }, [categoryList, searchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setIsCustomMode(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && !isCustomMode && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, isCustomMode]);

  // Focus custom input when entering custom mode
  useEffect(() => {
    if (isCustomMode && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [isCustomMode]);

  const handleSelect = (categoryName: string) => {
    onChange(categoryName);
    setIsOpen(false);
    setIsCustomMode(false);
    setSearchQuery("");
  };

  const handleAddCustomCategory = () => {
    const trimmed = customInput.trim();
    if (trimmed) {
      onChange(trimmed);
      setCustomInput("");
      setIsCustomMode(false);
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  const handleCreateFromSearch = () => {
    const trimmed = searchQuery.trim();
    if (trimmed) {
      onChange(trimmed);
      setSearchQuery("");
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Hidden input for HTML form validation if required */}
      <input
        type="text"
        value={value}
        onChange={() => {}}
        required={required}
        tabIndex={-1}
        className="sr-only"
        aria-hidden="true"
      />

      {/* Main Select Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            setIsCustomMode(false);
            setSearchQuery("");
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs text-left transition-all ${
          isOpen
            ? "border-blue-200/50 ring-1 ring-blue-200/20 bg-zinc-800"
            : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <svg
            className="w-4 h-4 text-zinc-400 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>

          {value ? (
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-medium text-zinc-100 truncate">
                {value}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950/60 text-blue-200 border border-blue-800/60 font-medium">
                Category
              </span>
            </div>
          ) : (
            <span className="text-zinc-500">
              Select or create category...
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 text-zinc-400">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onChange("");
                }
              }}
              title="Clear category"
              className="p-0.5 hover:text-zinc-200 rounded hover:bg-zinc-700"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          )}
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-blue-200" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-zinc-900 rounded-xl border border-zinc-750 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {!isCustomMode ? (
            <div className="bg-zinc-900">
              {/* Search Filter Header */}
              <div className="p-2 border-b border-zinc-800 bg-zinc-950">
                <div className="relative">
                  <svg
                    className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
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
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (searchQuery.trim()) {
                          if (filteredCategories.length > 0) {
                            handleSelect(filteredCategories[0]);
                          } else {
                            handleCreateFromSearch();
                          }
                        }
                      } else if (e.key === "Escape") {
                        setIsOpen(false);
                      }
                    }}
                    placeholder="Search or type new category..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* Dynamic Categories List */}
              <div
                className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 bg-zinc-900"
                role="listbox"
              >
                {/* If user typed something not matching any existing category, offer to create it */}
                {searchQuery.trim() && !hasExactMatch && (
                  <button
                    type="button"
                    onClick={handleCreateFromSearch}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg font-medium text-blue-200 bg-zinc-800 hover:bg-zinc-750 transition-colors border border-dashed border-zinc-700 text-left mb-1"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="p-0.5 rounded bg-blue-200 text-zinc-900">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </span>
                      <span className="truncate">
                        Create category: <strong className="font-semibold text-zinc-100">"{searchQuery.trim()}"</strong>
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-normal">Enter ↵</span>
                  </button>
                )}

                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => {
                    const isSelected = value.toLowerCase() === cat.toLowerCase();
                    const count = categoryCounts[cat] || 0;

                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleSelect(cat)}
                        role="option"
                        aria-selected={isSelected}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors text-left ${
                          isSelected
                            ? "bg-zinc-800 text-blue-200 font-medium"
                            : "text-zinc-300 hover:bg-zinc-800"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected
                                ? "bg-blue-200"
                                : "bg-zinc-600"
                            }`}
                          />
                          <span className="truncate">{cat}</span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {count > 0 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                              {count} {count === 1 ? "comp" : "comps"}
                            </span>
                          )}
                          {isSelected && (
                            <svg
                              className="w-4 h-4 text-blue-200"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : !searchQuery.trim() ? (
                  <div className="px-3 py-4 text-center text-xs text-zinc-500">
                    No categories found
                  </div>
                ) : null}
              </div>

              {/* Footer: Create Custom Category Button */}
              <div className="p-2 border-t border-zinc-800 bg-zinc-950">
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomMode(true);
                    setCustomInput(searchQuery.trim());
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium text-zinc-300 hover:text-blue-200 bg-zinc-800 border border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add New Category</span>
                </button>
              </div>
            </div>
          ) : (
            /* Custom Category Creation Mode */
            <div className="p-3 space-y-3 bg-zinc-900">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-semibold text-zinc-100">
                  Add New Category
                </span>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="text-zinc-400 hover:text-zinc-200 text-xs"
                >
                  Back to list
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Category Name
                </label>
                <input
                  ref={customInputRef}
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomCategory();
                    } else if (e.key === "Escape") {
                      setIsCustomMode(false);
                    }
                  }}
                  placeholder="e.g. Authentication, Billing, Dashboard"
                  className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
                />
                <p className="mt-1 text-[10px] text-zinc-500">
                  This new category will appear in the catalogue sidebar once published.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!customInput.trim()}
                  onClick={handleAddCustomCategory}
                  className="px-3 py-1.5 text-xs font-medium bg-blue-200 hover:bg-blue-100 text-zinc-900 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add &amp; Select
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
