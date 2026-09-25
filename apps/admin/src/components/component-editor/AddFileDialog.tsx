"use client";

import React, { useState } from "react";
import { validateClientFilePath, ALLOWED_EXTENSIONS } from "./pathValidation";
import {
  REACT_TSX_TEMPLATE,
  CSS_TEMPLATE,
  TYPES_TS_TEMPLATE,
  JSON_TEMPLATE,
} from "./templates";

export interface AddFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFile: (filename: string, initialContent?: string) => void;
  existingFilenames: string[];
}

export const AddFileDialog: React.FC<AddFileDialogProps> = ({
  isOpen,
  onClose,
  onAddFile,
  existingFilenames,
}) => {
  const [fileName, setFileName] = useState("");
  const [templateType, setTemplateType] = useState<"empty" | "auto">("auto");
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFileName(val);

    if (val.trim()) {
      const check = validateClientFilePath(val);
      if (!check.isValid) {
        setValidationError(check.error || "Invalid file name");
      } else if (
        existingFilenames.some(
          (f) => f.toLowerCase() === check.normalizedPath.toLowerCase()
        )
      ) {
        setValidationError(`A file named "${check.normalizedPath}" already exists.`);
      } else {
        setValidationError(null);
      }
    } else {
      setValidationError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const check = validateClientFilePath(fileName);
    if (!check.isValid) {
      setValidationError(check.error || "Invalid file name");
      return;
    }

    if (
      existingFilenames.some(
        (f) => f.toLowerCase() === check.normalizedPath.toLowerCase()
      )
    ) {
      setValidationError(`A file named "${check.normalizedPath}" already exists.`);
      return;
    }

    let initialContent = "";
    if (templateType === "auto") {
      if (check.extension === "tsx" || check.extension === "jsx") {
        initialContent = REACT_TSX_TEMPLATE;
      } else if (check.extension === "css" || check.extension === "scss") {
        initialContent = CSS_TEMPLATE;
      } else if (check.normalizedPath.includes("types") || check.extension === "ts") {
        initialContent = TYPES_TS_TEMPLATE;
      } else if (check.extension === "json") {
        initialContent = JSON_TEMPLATE;
      }
    }

    onAddFile(check.normalizedPath, initialContent);
    setFileName("");
    setValidationError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-file-title"
    >
      <div className="w-full max-w-md rounded-xl border border-zinc-750 bg-zinc-850 shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-blue-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 id="add-file-title" className="text-sm font-semibold text-zinc-100">
                Add New Source File
              </h3>
              <p className="text-[11px] text-zinc-400">
                Support for TSX, TS, CSS, JSON, Markdown, etc.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded hover:bg-zinc-800"
          >
            &times;
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              File Name & Path
            </label>
            <input
              type="text"
              autoFocus
              value={fileName}
              onChange={handleFileNameChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && fileName.trim() && !validationError) {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
              placeholder="e.g. notification-banner.css or types.ts"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
            />
            {validationError ? (
              <p className="mt-1.5 text-[11px] text-rose-400 flex items-center gap-1 font-sans">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{validationError}</span>
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-zinc-400 font-sans">
                Allowed: {ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(", ")}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Initial Content
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTemplateType("auto")}
                className={`px-3 py-2 rounded-lg border text-left font-medium transition-all ${
                  templateType === "auto"
                    ? "border-blue-200/50 bg-zinc-800 text-blue-200 ring-1 ring-blue-200/20"
                    : "border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                <div className="font-semibold text-[11px]">Recommended Template</div>
                <div className="text-[10px] text-zinc-400">Based on file extension</div>
              </button>
              <button
                type="button"
                onClick={() => setTemplateType("empty")}
                className={`px-3 py-2 rounded-lg border text-left font-medium transition-all ${
                  templateType === "empty"
                    ? "border-blue-200/50 bg-zinc-800 text-blue-200 ring-1 ring-blue-200/20"
                    : "border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                <div className="font-semibold text-[11px]">Empty File</div>
                <div className="text-[10px] text-zinc-400">Start from scratch</div>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg border border-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
              disabled={!fileName.trim() || Boolean(validationError)}
              className="px-4 py-1.5 text-xs font-medium text-zinc-900 bg-blue-200 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
