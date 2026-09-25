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
      className={`rounded-xl border border-zinc-800 bg-zinc-850 p-6 space-y-5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">
            Primary Component Source Code
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Upload .tsx, .ts, .jsx, or .js files. Memory buffer validated up to 5MB per file.
          </p>
        </div>
        <span className="text-[11px] font-mono text-zinc-400">
          {sourceFiles.length} file(s) attached
        </span>
      </div>

      {/* Currently Attached Files List */}
      {sourceFiles.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            Current Stored Source Files:
          </div>
          <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
            {sourceFiles.map((f, i) => (
              <div key={i} className="px-3.5 py-2.5 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-200 font-medium truncate">
                  {f.filename}
                </span>
                <span className="text-[10px] uppercase font-medium text-blue-200 bg-blue-950/60 border border-blue-800/40 px-2 py-0.5 rounded">
                  {f.fileType}
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
          accept=".tsx,.ts,.jsx,.js"
          onChange={handleFileChange}
          disabled={uploadMutation.isPending}
          className="hidden"
          id="source-files-input"
        />

        <label
          htmlFor="source-files-input"
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-750 rounded-lg border border-zinc-700 transition-colors"
        >
          <svg className="w-4 h-4 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Choose Source Files</span>
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
