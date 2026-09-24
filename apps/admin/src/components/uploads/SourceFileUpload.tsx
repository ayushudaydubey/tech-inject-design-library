"use client";

import React, { useState, useRef } from "react";
import { ComponentFile } from "../../types/component";
import { useUploadComponentFiles } from "../../hooks/useComponents";
import { UploadProgress } from "./UploadProgress";
import { ApiError } from "../../lib/api";

export interface SourceFileUploadProps {
  componentId: string;
  sourceFiles?: ComponentFile[];
  onUploadSuccess?: () => void;
  className?: string;
}

export const SourceFileUpload: React.FC<SourceFileUploadProps> = ({
  componentId,
  sourceFiles = [],
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

    // Validate permitted extensions
    const invalidFile = files.find((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      return !["tsx", "ts", "jsx", "js"].includes(ext || "");
    });

    if (invalidFile) {
      setErrorMessage(`File "${invalidFile.name}" has an invalid extension. Only .tsx, .ts, .jsx, and .js files are allowed for main source files.`);
      return;
    }

    // Validate size (5MB ceiling)
    const oversizedFile = files.find((f) => f.size > 5 * 1024 * 1024);
    if (oversizedFile) {
      setErrorMessage(`File "${oversizedFile.name}" exceeds the maximum allowed size of 5MB.`);
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

      setSuccessMessage(`Successfully uploaded ${selectedFiles.length} source file(s) into database.`);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onUploadSuccess?.();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message || "Failed to upload files to backend.");
      } else {
        const errorObj = err as { message?: string };
        setErrorMessage(errorObj?.message || "An upload error occurred.");
      }
    }
  };

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Primary Component Source Code
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Upload .tsx, .ts, .jsx, or .js files. Memory buffer validated up to 5MB per file.
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {sourceFiles.length} file(s) attached
        </span>
      </div>

      {/* Currently Attached Files List */}
      {sourceFiles.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Current Stored Source Files:
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 overflow-hidden">
            {sourceFiles.map((f, i) => (
              <div key={i} className="px-3.5 py-2.5 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-800 dark:text-slate-200 font-semibold truncate">
                  {f.filename}
                </span>
                <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded">
                  {f.fileType}
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
          accept=".tsx,.ts,.jsx,.js"
          onChange={handleFileChange}
          disabled={uploadMutation.isPending}
          className="hidden"
          id="source-files-input"
        />

        <label
          htmlFor="source-files-input"
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs transition-colors"
        >
          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Choose Source Files</span>
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
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50"
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
