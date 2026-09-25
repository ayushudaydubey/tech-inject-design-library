import React from "react";
import { CategorySelect } from "./CategorySelect";

export interface BasicInfoFieldsProps {
  name: string;
  slug: string;
  description: string;
  category: string;
  version: string;
  onChange: (fields: Partial<{
    name: string;
    slug: string;
    description: string;
    category: string;
    version: string;
  }>) => void;
  disabled?: boolean;
}

export const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({
  name,
  slug,
  description,
  category,
  version,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-100 border-b border-zinc-800 pb-2">
        Basic Metadata
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">
            Component Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Sales Metric Card"
            required
            disabled={disabled}
            className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 disabled:opacity-50 transition-colors"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">
            URL Slug <span className="text-zinc-500 font-normal">(optional, auto-derived)</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => onChange({ slug: e.target.value })}
            placeholder="sales-metric-card"
            disabled={disabled}
            className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-xs text-zinc-100 font-mono placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 disabled:opacity-50 transition-colors"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">
            Category <span className="text-rose-400">*</span>
          </label>
          <CategorySelect
            value={category}
            onChange={(val) => onChange({ category: val })}
            required
            disabled={disabled}
          />
        </div>

        {/* Version */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">
            Version
          </label>
          <input
            type="text"
            value={version}
            onChange={(e) => onChange({ version: e.target.value })}
            placeholder="1.0.0"
            disabled={disabled}
            className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-xs text-zinc-100 font-mono placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 disabled:opacity-50 transition-colors"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-zinc-300 mb-1">
          Description <span className="text-rose-400">*</span>
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Concise overview explaining the component's functionality, variants, and design role..."
          required
          disabled={disabled}
          className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 disabled:opacity-50 leading-relaxed transition-colors"
        />
      </div>
    </div>
  );
};
