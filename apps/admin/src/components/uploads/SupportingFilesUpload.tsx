"use client";

import React, { useState, useRef } from "react";
import { ComponentFile } from "../../types/component";
import { useUploadComponentFiles } from "../../hooks/useComponents";
import { UploadProgress } from "./UploadProgress";
import { ApiError } from "../../lib/api";

export interface SupportingFilesUploadProps {
  componentId: string;
  supportingFiles?: ComponentFile[];
  themeFiles?: ComponentFile[];
  onUploadSuccess?: () => void;
  className?: string;
}

export const SupportingFilesUpload: React.FC<SupportingFilesUploadProps> = ({
  componentId,
  supportingFiles = [],
  themeFiles = [],
  onUploadSuccess,
  className = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const uploadMutation = useUploadComponentFiles();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate permitted extensions (.css, .ts, .json, .md)
    const invalidFile = files.find((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      return !["css", "ts", "json", "md"].includes(ext || "");
    });

    if (invalidFile) {
      setErrorMessage(`File "${invalidFile.name}" has an unsupported format. Allowed supporting extensions: .css, .ts, .json, .md.`);
      return;
    }

    // Size limit
    const oversized = files.find((f) => f.size > 5 * 1024 * 1024);
    if (oversized) {
      setErrorMessage(`File "${oversized.name}" exceeds 5MB ceiling.`);
      return;
    }

    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      await uploadMutation.mutateAsync({
        id: componentId,
        formData,
      });

      setSuccessMessage(`Successfully attached ${selectedFiles.length} file(s) into component supporting bundles.`);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onUploadSuccess?.();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message || "Failed to upload supporting files.");
      } else {
        const errorObj = err as { message?: string };
        setErrorMessage(errorObj?.message || "An upload error occurred.");
      }
    }
  };

  const totalFiles = [...supportingFiles, ...themeFiles];

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Supporting & Theme Files
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Attach CSS theme tokens (*.css) or auxiliary TypeScript helpers (types.ts, *.utils.ts).
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {totalFiles.length} file(s) attached
        </span>
      </div>

      {/* Currently Attached Files List */}
      {totalFiles.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Current Attached Files:
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 overflow-hidden">
            {themeFiles.map((f, i) => (
              <div key={`theme-${i}`} className="px-3.5 py-2.5 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-800 dark:text-slate-200 font-semibold truncate">
                  {f.filename}
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded">
                  Theme CSS
                </span>
              </div>
            ))}
            {supportingFiles.map((f, i) => (
              <div key={`supp-${i}`} className="px-3.5 py-2.5 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-800 dark:text-slate-200 font-semibold truncate">
                  {f.filename}
                </span>
                <span className="text-[10px] uppercase font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/80 px-2 py-0.5 rounded">
                  Helper TS
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Drop Zone / Input */}
      <div className="p-5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-950/40 text-center space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".css,.ts,.json,.md"
          onChange={handleFileChange}
          disabled={uploadMutation.isPending}
          className="hidden"
          id="supporting-files-input"
        />

        <label
          htmlFor="supporting-files-input"
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs transition-colors"
        >
          <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span>Choose Theme & Supporting Files</span>
        </label>

        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Selected: {selectedFiles.map((f) => f.name).join(", ")}
            </p>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50"
            >
              {uploadMutation.isPending ? "Uploading..." : `Upload ${selectedFiles.length} File(s)`}
            </button>
          </div>
        )}
      </div>

      <UploadProgress
        isUploading={uploadMutation.isPending}
        fileCount={selectedFiles.length}
        errorMessage={errorMessage}
        successMessage={successMessage}
      />
    </div>
  );
};
