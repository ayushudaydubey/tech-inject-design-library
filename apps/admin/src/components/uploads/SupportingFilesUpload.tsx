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
      className={`rounded-xl border border-zinc-800 bg-zinc-850 p-6 space-y-5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">
            Supporting & Theme Files
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Attach CSS theme tokens (*.css) or auxiliary TypeScript helpers (types.ts, *.utils.ts).
          </p>
        </div>
        <span className="text-[11px] font-mono text-zinc-400">
          {totalFiles.length} file(s) attached
        </span>
      </div>

      {/* Currently Attached Files List */}
      {totalFiles.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            Current Attached Files:
          </div>
          <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
            {themeFiles.map((f, i) => (
              <div key={`theme-${i}`} className="px-3.5 py-2.5 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-200 font-medium truncate">
                  {f.filename}
                </span>
                <span className="text-[10px] uppercase font-medium text-green-300 bg-green-950/60 border border-green-800/40 px-2 py-0.5 rounded">
                  Theme CSS
                </span>
              </div>
            ))}
            {supportingFiles.map((f, i) => (
              <div key={`supp-${i}`} className="px-3.5 py-2.5 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-200 font-medium truncate">
                  {f.filename}
                </span>
                <span className="text-[10px] uppercase font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded">
                  Helper TS
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Drop Zone / Input */}
      <div className="p-5 rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900/60 text-center space-y-3">
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
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-750 rounded-lg border border-zinc-700 transition-colors"
        >
          <svg className="w-4 h-4 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span>Choose Theme & Supporting Files</span>
        </label>

        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-zinc-300 font-medium">
              Selected: {selectedFiles.map((f) => f.name).join(", ")}
            </p>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="px-4 py-1.5 rounded-lg bg-blue-200 hover:bg-blue-100 text-zinc-900 font-medium text-xs transition-colors disabled:opacity-50"
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
