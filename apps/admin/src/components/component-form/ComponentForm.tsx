"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminComponent,
  CreateComponentInput,
  ComponentAccessType,
} from "../../types/component";
import { BasicInfoFields } from "./BasicInfoFields";
import { AccessTypeField } from "./AccessTypeField";
import { PropsFields } from "./PropsFields";
import { DependenciesFields } from "./DependenciesFields";
import { UsageFields } from "./UsageFields";
import { ApiError } from "../../lib/api";

export interface ComponentFormProps {
  initialData?: AdminComponent;
  onSubmit: (data: CreateComponentInput) => Promise<AdminComponent>;
  isSubmitting?: boolean;
  className?: string;
}

export const ComponentForm: React.FC<ComponentFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting = false,
  className = "",
}) => {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [version, setVersion] = useState(initialData?.version || "1.0.0");
  const [accessType, setAccessType] = useState<ComponentAccessType>(
    initialData?.accessType || "free"
  );
  const [propsDocumentation, setPropsDocumentation] = useState(
    initialData?.propsDocumentation || ""
  );
  const [usageDocumentation, setUsageDocumentation] = useState(
    initialData?.usageDocumentation || ""
  );
  const [declaredDependencies, setDeclaredDependencies] = useState<
    Record<string, string>
  >(initialData?.declaredDependencies || {});
  const [previewData, setPreviewData] = useState(
    initialData?.previewData || ""
  );
  const [agentPrompt, setAgentPrompt] = useState(
    initialData?.agentPrompt || ""
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Component name is required.");
      return;
    }
    if (!description.trim()) {
      setErrorMessage("Component description is required.");
      return;
    }
    if (!category.trim()) {
      setErrorMessage("Component category is required.");
      return;
    }

    const payload: CreateComponentInput = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim(),
      category: category.trim(),
      version: version.trim() || "1.0.0",
      accessType,
      propsDocumentation: propsDocumentation.trim(),
      usageDocumentation: usageDocumentation.trim(),
      declaredDependencies,
      previewData: previewData.trim(),
      agentPrompt: agentPrompt.trim(),
    };

    try {
      const saved = await onSubmit(payload);
      router.push(`/dashboard/components/${saved._id}`);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message || "Failed to save component draft.");
      } else {
        const errorObj = err as { message?: string };
        setErrorMessage(errorObj?.message || "An unexpected error occurred.");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-8 ${className}`}
    >
      {errorMessage && (
        <div
          className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5"
          role="alert"
        >
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>{errorMessage}</div>
        </div>
      )}

      {/* 1. Basic Metadata */}
      <BasicInfoFields
        name={name}
        slug={slug}
        description={description}
        category={category}
        version={version}
        disabled={isSubmitting}
        onChange={(fields) => {
          if (fields.name !== undefined) setName(fields.name);
          if (fields.slug !== undefined) setSlug(fields.slug);
          if (fields.description !== undefined) setDescription(fields.description);
          if (fields.category !== undefined) setCategory(fields.category);
          if (fields.version !== undefined) setVersion(fields.version);
        }}
      />

      {/* 2. Access Tier */}
      <AccessTypeField
        value={accessType}
        onChange={setAccessType}
        disabled={isSubmitting}
      />

      {/* 3. Declared Dependencies */}
      <DependenciesFields
        dependencies={declaredDependencies}
        onChange={setDeclaredDependencies}
        disabled={isSubmitting}
      />

      {/* 4. Props Documentation */}
      <PropsFields
        value={propsDocumentation}
        onChange={setPropsDocumentation}
        disabled={isSubmitting}
      />

      {/* 5. Usage Documentation */}
      <UsageFields
        value={usageDocumentation}
        componentName={name}
        onChange={setUsageDocumentation}
        disabled={isSubmitting}
      />

      {/* 6. Preview Data (JSON) & Agent Prompt */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Preview Fixture & AI Agent Prompt
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Preview Fixture Data (JSON format)
          </label>
          <textarea
            rows={4}
            value={previewData}
            onChange={(e) => setPreviewData(e.target.value)}
            placeholder={`{\n  "title": "Quarterly Revenue",\n  "value": "$428,500"\n}`}
            disabled={isSubmitting}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            AI Agent Prompt Override (Optional)
          </label>
          <textarea
            rows={3}
            value={agentPrompt}
            onChange={(e) => setAgentPrompt(e.target.value)}
            placeholder="Integrate this component into the layout. Connect the callbacks to your API mutations."
            disabled={isSubmitting}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 leading-relaxed"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting && (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          <span>
            {isSubmitting
              ? "Saving..."
              : initialData
              ? "Update Component"
              : "Save Component Draft"}
          </span>
        </button>
      </div>
    </form>
  );
};
