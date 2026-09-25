"use client";

import React, { useState } from "react";
import { useUpdateDraft } from "../../hooks/useComponents";
import { UploadProgress } from "./UploadProgress";
import { ApiError } from "../../lib/api";

export interface PreviewDataUploadProps {
  componentId: string;
  currentPreviewData?: string;
  onUpdateSuccess?: () => void;
  className?: string;
}

export const PreviewDataUpload: React.FC<PreviewDataUploadProps> = ({
  componentId,
  currentPreviewData = "",
  onUpdateSuccess,
  className = "",
}) => {
  const [jsonText, setJsonText] = useState(currentPreviewData);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const updateMutation = useUpdateDraft();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      setErrorMessage("Only .json fixture files can be uploaded for preview data.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        // Validate JSON
        JSON.parse(content);
        setJsonText(content);
        setSuccessMessage(`Loaded "${file.name}" into editor. Click Save to persist.`);
      } catch {
        setErrorMessage("The uploaded file does not contain valid JSON syntax.");
      }
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (jsonText.trim() !== "") {
      try {
        JSON.parse(jsonText);
      } catch {
        setErrorMessage("Invalid JSON format. Please ensure syntax is valid before saving.");
        return;
      }
    }

    try {
      await updateMutation.mutateAsync({
        id: componentId,
        input: {
          previewData: jsonText.trim(),
        },
      });

      setSuccessMessage("Preview fixture data saved successfully.");
      onUpdateSuccess?.();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message || "Failed to update preview data.");
      } else {
        const errorObj = err as { message?: string };
        setErrorMessage(errorObj?.message || "An unexpected error occurred.");
      }
    }
  };

  return (
    <div
      className={`rounded-xl border border-zinc-800 bg-zinc-850 p-6 space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">
            Component Preview Fixture (JSON)
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Safe structured test data passed into the component during public or draft visual rendering.
          </p>
        </div>

        <div>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            id="json-file-input"
            className="hidden"
          />
          <label
            htmlFor="json-file-input"
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-750 transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Upload JSON File</span>
          </label>
        </div>
      </div>

      <textarea
        rows={6}
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        placeholder={`{\n  "title": "Quarterly Revenue",\n  "value": "$428,500"\n}`}
        disabled={updateMutation.isPending}
        className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-700 bg-zinc-950 text-zinc-100 text-xs font-mono placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 disabled:opacity-50 leading-relaxed transition-colors"
      />

      <div className="flex items-center justify-between">
        <UploadProgress
          isUploading={updateMutation.isPending}
          errorMessage={errorMessage}
          successMessage={successMessage}
        />

        <button
          type="button"
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-200 hover:bg-blue-100 text-zinc-900 font-medium text-xs transition-colors disabled:opacity-50"
        >
          {updateMutation.isPending ? "Saving..." : "Save Preview Data"}
        </button>
      </div>
    </div>
  );
};
