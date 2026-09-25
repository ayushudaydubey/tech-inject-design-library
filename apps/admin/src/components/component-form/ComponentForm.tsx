"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AdminComponent,
  CreateComponentInput,
  ComponentAccessType,
  ComponentFile,
  ValidationResult,
} from "../../types/component";
import { BasicInfoFields } from "./BasicInfoFields";
import { AccessTypeField } from "./AccessTypeField";
import { PropsFields } from "./PropsFields";
import { DependenciesFields } from "./DependenciesFields";
import { UsageFields } from "./UsageFields";
import { PreviewExamplesEditor } from "./PreviewExamplesEditor";
import {
  SourceCodeEditor,
  SourceCodeEditorHandle,
  ValidationPanel,
  EditorFileState,
  analyzeDependencies,
  REACT_TSX_TEMPLATE,
} from "../component-editor";
import {
  ApiError,
  validateComponentDraft,
  validateComponentPayload,
} from "../../lib/api";

function toPascalCase(str: string): string {
  if (!str || !str.trim()) return "Component";
  const cleaned = str.replace(/[^a-zA-Z0-9\s-_]/g, "");
  const words = cleaned.split(/[\s-_]+/).filter(Boolean);
  if (words.length === 0) return "Component";
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}

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

  // Basic Form States
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

  // Initial source files preparation from initialData
  const initialFilesList = useMemo(() => {
    const combined: ComponentFile[] = [];
    const seen = new Set<string>();

    const add = (f?: ComponentFile) => {
      if (!f) return;
      const key = (f.path || f.filename || "").toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        combined.push({
          filename: f.filename || f.path || "Component.tsx",
          path: f.path || f.filename || "Component.tsx",
          content: f.content || "",
          fileType: f.fileType || "tsx",
          language: f.language,
        });
      }
    };

    (initialData?.sourceFiles || []).forEach(add);
    (initialData?.supportingFiles || []).forEach(add);
    (initialData?.themeFiles || []).forEach(add);

    if (combined.length === 0) {
      const defaultName = initialData?.name ? `${toPascalCase(initialData.name)}.tsx` : "Component.tsx";
      combined.push({
        filename: defaultName,
        path: defaultName,
        content: REACT_TSX_TEMPLATE,
        fileType: "tsx",
        language: "typescriptreact",
      });
    }

    return combined;
  }, [initialData]);

  const [editorFiles, setEditorFiles] = useState<ComponentFile[]>(initialFilesList);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-sync initial filename when component name changes for a new draft
  const handleNameChange = (newName: string) => {
    setName(newName);
    setHasUnsavedChanges(true);

    if (!initialData) {
      const pascal = toPascalCase(newName);
      const targetFilename = `${pascal}.tsx`;
      setEditorFiles((prev) => {
        if (
          prev.length === 1 &&
          (prev[0].filename === "Component.tsx" || prev[0].filename.endsWith(".tsx"))
        ) {
          const oldFile = prev[0];
          return [
            {
              ...oldFile,
              filename: targetFilename,
              path: targetFilename,
              fileType: "tsx",
              language: "typescriptreact",
            },
          ];
        }
        return prev;
      });
    }
  };

  // Validation State
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const editorRef = useRef<SourceCodeEditorHandle>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Warn on browser leave if unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Real-time dependency analysis
  const undeclaredDependencies = useMemo(() => {
    return analyzeDependencies(editorFiles, declaredDependencies);
  }, [editorFiles, declaredDependencies]);

  // Navigate to error in editor and scroll into view
  const handleNavigateToError = useCallback((filename: string, line?: number) => {
    if (editorContainerRef.current) {
      editorContainerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setTimeout(() => {
      editorRef.current?.navigateToFileAndLine(filename, line || 1, 1);
    }, 150);
  }, []);

  // Split and categorize editor files into source, supporting, and theme
  const getCategorizedFiles = useCallback(() => {
    const sourceFiles: ComponentFile[] = [];
    const supportingFiles: ComponentFile[] = [];
    const themeFiles: ComponentFile[] = [];

    for (const f of editorFiles) {
      const rawPath = (f.path || f.filename || "").trim();
      const ext = rawPath.split(".").pop()?.toLowerCase() || f.fileType || "tsx";
      const fileObj: ComponentFile = {
        filename: rawPath,
        path: rawPath,
        content: f.content || "",
        fileType: ext,
        language: f.language,
      };

      if (ext === "css" || ext === "scss") {
        themeFiles.push(fileObj);
      } else if (
        rawPath.endsWith(".utils.ts") ||
        rawPath.endsWith(".types.ts") ||
        rawPath === "types.ts"
      ) {
        supportingFiles.push(fileObj);
      } else {
        sourceFiles.push(fileObj);
      }
    }

    return { sourceFiles, supportingFiles, themeFiles };
  }, [editorFiles]);

  // Build current draft payload
  const buildPayload = useCallback((): CreateComponentInput => {
    const { sourceFiles, supportingFiles, themeFiles } = getCategorizedFiles();

    return {
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
      sourceFiles,
      supportingFiles,
      themeFiles,
      agentPrompt: agentPrompt.trim(),
    };
  }, [
    name,
    slug,
    description,
    category,
    version,
    accessType,
    propsDocumentation,
    usageDocumentation,
    declaredDependencies,
    previewData,
    agentPrompt,
    getCategorizedFiles,
  ]);

  // Run Backend Validation
  const handleRunValidation = async () => {
    setIsValidating(true);
    setErrorMessage(null);

    const payload = buildPayload();

    try {
      let res: ValidationResult;
      if (initialData?._id) {
        res = await validateComponentDraft(initialData._id, payload);
      } else {
        res = await validateComponentPayload(payload);
      }
      setValidationResult(res);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message || "Validation failed.");
      } else {
        const errorObj = err as { message?: string };
        setErrorMessage(errorObj?.message || "An unexpected error occurred during validation.");
      }
    } finally {
      setIsValidating(false);
    }
  };

  // Handle Form Submit (Save Draft / Update)
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

    const payload = buildPayload();

    try {
      const saved = await onSubmit(payload);
      setHasUnsavedChanges(false);
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
      className={`rounded-lg border border-zinc-700/60 bg-zinc-800 p-6 shadow-xs space-y-6 ${className}`}
    >
      {errorMessage && (
        <div
          className="p-3 rounded-md border border-red-500/30 bg-red-950/20 text-red-300 text-xs flex items-start gap-2.5"
          role="alert"
        >
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-300 ml-2"
          >
            &times;
          </button>
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
          setHasUnsavedChanges(true);
          if (fields.name !== undefined) handleNameChange(fields.name);
          if (fields.slug !== undefined) setSlug(fields.slug);
          if (fields.description !== undefined) setDescription(fields.description);
          if (fields.category !== undefined) setCategory(fields.category);
          if (fields.version !== undefined) setVersion(fields.version);
        }}
      />

      {/* 2. Access Tier */}
      <AccessTypeField
        value={accessType}
        onChange={(val) => {
          setHasUnsavedChanges(true);
          setAccessType(val);
        }}
        disabled={isSubmitting}
      />

      {/* 3. Declared Dependencies */}
      <DependenciesFields
        dependencies={declaredDependencies}
        onChange={(deps) => {
          setHasUnsavedChanges(true);
          setDeclaredDependencies(deps);
        }}
        editorFiles={editorFiles}
        disabled={isSubmitting}
      />

      {/* 4. Props Documentation */}
      <PropsFields
        value={propsDocumentation}
        onChange={(val) => {
          setHasUnsavedChanges(true);
          setPropsDocumentation(val);
        }}
        disabled={isSubmitting}
      />

      {/* 5. Usage Documentation */}
      <UsageFields
        value={usageDocumentation}
        componentName={name}
        onChange={(val) => {
          setHasUnsavedChanges(true);
          setUsageDocumentation(val);
        }}
        disabled={isSubmitting}
      />

      {/* 6. Source Files (Inline Monaco Code Editor) */}
      <div ref={editorContainerRef} className="pt-4 border-t border-zinc-700/60">
        <SourceCodeEditor
          ref={editorRef}
          initialFiles={initialFilesList}
          hasUnsavedChanges={hasUnsavedChanges}
          onChangeFiles={(updated) => {
            setHasUnsavedChanges(true);
            setEditorFiles(
              updated.map((u) => ({
                filename: u.filename,
                path: u.path,
                content: u.content,
                fileType: u.fileType,
                language: u.language,
              }))
            );
          }}
        />
      </div>

      {/* 7. Preview Fixture & AI Agent Prompt */}
      <div className="space-y-4 pt-4 border-t border-zinc-700/60">
        <h3 className="text-xs font-semibold text-zinc-100">
          Preview Fixture & AI Agent Prompt
        </h3>

        <PreviewExamplesEditor
          value={previewData}
          onChange={(val) => {
            setHasUnsavedChanges(true);
            setPreviewData(val);
          }}
          disabled={isSubmitting}
        />

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">
            AI Agent Prompt Override (Optional)
          </label>
          <textarea
            rows={3}
            value={agentPrompt}
            onChange={(e) => {
              setHasUnsavedChanges(true);
              setAgentPrompt(e.target.value);
            }}
            placeholder="Integrate this component into the layout. Connect the callbacks to your API mutations."
            disabled={isSubmitting}
            className="w-full px-3 py-2 rounded-md border border-zinc-700 bg-zinc-900 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-200/50 disabled:opacity-50 leading-relaxed"
          />
        </div>
      </div>

      {/* 8. Code & Publishing Readiness Validation Panel */}
      <div className="pt-4 border-t border-zinc-700/60">
        <ValidationPanel
          result={validationResult}
          isValidating={isValidating}
          onRunValidation={handleRunValidation}
          undeclaredDependencies={undeclaredDependencies}
          onNavigateToError={handleNavigateToError}
        />
      </div>

      {/* 9. Form Actions */}
      <div className="pt-5 border-t border-zinc-700/60 flex items-center justify-between">
        <div className="text-xs text-zinc-400 font-sans">
          {hasUnsavedChanges ? (
            <span className="text-blue-200 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-200 animate-pulse"></span>
              <span>You have unsaved changes in metadata or code.</span>
            </span>
          ) : (
            <span className="text-zinc-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
              <span>All changes saved to database.</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700 rounded-md border border-zinc-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-zinc-900 bg-blue-200 hover:bg-blue-100 rounded-md shadow-xs transition-colors focus:outline-none focus:ring-1 focus:ring-blue-200/50 disabled:opacity-50 cursor-pointer"
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
      </div>
    </form>
  );
};
