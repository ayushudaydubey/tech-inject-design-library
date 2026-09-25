import React from "react";

export interface UploadProgressProps {
  isUploading: boolean;
  fileCount?: number;
  successMessage?: string | null;
  errorMessage?: string | null;
  className?: string;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  isUploading,
  fileCount = 0,
  successMessage,
  errorMessage,
  className = "",
}) => {
  if (isUploading) {
    return (
      <div
        className={`p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-blue-200 flex items-center gap-2.5 ${className}`}
        role="status"
      >
        <svg className="w-4 h-4 animate-spin text-blue-200" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>Uploading {fileCount} file(s) into memory storage...</span>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div
        className={`p-3 rounded-xl bg-zinc-850 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2 ${className}`}
        role="alert"
      >
        <svg className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{errorMessage}</span>
      </div>
    );
  }

  if (successMessage) {
    return (
      <div
        className={`p-3 rounded-xl bg-zinc-850 border border-green-800/60 text-xs text-green-300 flex items-center gap-2 ${className}`}
        role="status"
      >
        <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        <span>{successMessage}</span>
      </div>
    );
  }

  return null;
};
