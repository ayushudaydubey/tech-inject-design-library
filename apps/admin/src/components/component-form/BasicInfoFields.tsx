import React from "react";

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
      <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
        Basic Metadata
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Component Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Sales Metric Card"
            required
            disabled={disabled}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            URL Slug <span className="text-slate-400 font-normal">(optional, auto-derived)</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => onChange({ slug: e.target.value })}
            placeholder="sales-metric-card"
            disabled={disabled}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Category <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => onChange({ category: e.target.value })}
            placeholder="e.g. Analytics, CRM Pipeline, Forms"
            required
            disabled={disabled}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        {/* Version */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Version
          </label>
          <input
            type="text"
            value={version}
            onChange={(e) => onChange({ version: e.target.value })}
            placeholder="1.0.0"
            disabled={disabled}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Description <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Concise overview explaining the component's functionality, variants, and design role..."
          required
          disabled={disabled}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 leading-relaxed"
        />
      </div>
    </div>
  );
};
