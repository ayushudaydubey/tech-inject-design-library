"use client";

import React, { useState } from "react";
import { EditorFileState } from "./types";
import { MAIN_SOURCE_EXTENSIONS } from "./pathValidation";

export interface FileTabsProps {
  files: EditorFileState[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onDeleteFile: (id: string) => void;
  onRenameFile?: (id: string, newName: string) => void;
  onOpenAddFileDialog: () => void;
  onInsertTemplate: (templateType: "tsx" | "css" | "types") => void;
  hasUnsavedChanges?: boolean;
}

export const FileTabs: React.FC<FileTabsProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onDeleteFile,
  onRenameFile,
  onOpenAddFileDialog,
  onInsertTemplate,
  hasUnsavedChanges = false,
}) => {
  const [fileToDelete, setFileToDelete] = useState<EditorFileState | null>(null);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

  const mainSourceFilesCount = files.filter((f) =>
    MAIN_SOURCE_EXTENSIONS.includes(f.fileType.toLowerCase())
  ).length;

  const handleDeleteClick = (e: React.MouseEvent, file: EditorFileState) => {
    e.stopPropagation();

    // Check if this is the last source file
    const isMainSource = MAIN_SOURCE_EXTENSIONS.includes(
      file.fileType.toLowerCase()
    );
    if (isMainSource && mainSourceFilesCount <= 1) {
      alert(
        "Cannot delete this file. At least one main component source file (.tsx, .ts, .jsx, .js) is required."
      );
      return;
    }

    setFileToDelete(file);
  };

  const confirmDelete = () => {
    if (fileToDelete) {
      onDeleteFile(fileToDelete.id);
      setFileToDelete(null);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 border-b border-zinc-800 bg-zinc-900 text-xs select-none">
        {/* Left: Scrollable Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
          {files.map((file) => {
            const isActive = file.id === activeFileId;
            const ext = file.fileType.toLowerCase();

            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                onDoubleClick={() => {
                  const newName = window.prompt("Rename file:", file.filename);
                  if (newName && newName.trim() !== file.filename && onRenameFile) {
                    onRenameFile(file.id, newName.trim());
                  }
                }}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs cursor-pointer transition-all border ${
                  isActive
                    ? "bg-zinc-800 text-blue-200 border-zinc-700 font-medium"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 border-transparent"
                }`}
              >
                <span>{file.path || file.filename}</span>

                {/* File role badge */}
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-sans font-medium uppercase tracking-wider ${
                    ext === "tsx" || ext === "jsx"
                      ? "bg-blue-950/60 text-blue-200 border border-blue-800/40"
                      : ext === "css" || ext === "scss"
                      ? "bg-green-950/60 text-green-300 border border-green-800/40"
                      : ext === "json"
                      ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                      : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                  }`}
                >
                  {ext === "tsx" || ext === "jsx"
                    ? "Component"
                    : ext === "css" || ext === "scss"
                    ? "Theme"
                    : file.filename.toLowerCase().includes("types")
                    ? "Types"
                    : "Helper"}
                </span>

                {/* Close/delete file button */}
                <button
                  type="button"
                  onClick={(e) => handleDeleteClick(e, file)}
                  title={`Delete ${file.filename}`}
                  className="opacity-0 group-hover:opacity-100 hover:bg-zinc-700 hover:text-rose-400 rounded p-0.5 transition-opacity"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}

          {/* Add file button */}
          <button
            type="button"
            onClick={onOpenAddFileDialog}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-blue-200 hover:bg-zinc-800 transition-colors font-medium text-xs ml-1"
            title="Add File"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add File</span>
          </button>
        </div>

        {/* Right: Actions & Status */}
        <div className="flex items-center gap-2 relative">
          {/* Unsaved indicator */}
          <div className="flex items-center gap-1.5 text-[11px] font-sans mr-2">
            {hasUnsavedChanges ? (
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Unsaved changes</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                <span>Saved</span>
              </span>
            )}
          </div>

          {/* Templates Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTemplateMenu((prev) => !prev)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-750 transition-colors text-xs font-medium"
            >
              <span>Insert Template</span>
              <svg className="w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showTemplateMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowTemplateMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-52 rounded-xl border border-zinc-700 bg-zinc-850 shadow-xl py-1.5 z-30 font-sans text-xs">
                  <div className="px-3 py-1 text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                    Insert Starter Code
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onInsertTemplate("tsx");
                      setShowTemplateMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 text-zinc-200 transition-colors flex items-center justify-between"
                  >
                    <span>Insert React TSX Template</span>
                    <span className="text-[10px] text-blue-200 font-mono">.tsx</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onInsertTemplate("css");
                      setShowTemplateMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 text-zinc-200 transition-colors flex items-center justify-between"
                  >
                    <span>Insert CSS Template</span>
                    <span className="text-[10px] text-green-300 font-mono">.css</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onInsertTemplate("types");
                      setShowTemplateMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 text-zinc-200 transition-colors flex items-center justify-between"
                  >
                    <span>Insert Types Template</span>
                    <span className="text-[10px] text-zinc-400 font-mono">.ts</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-xl border border-zinc-750 bg-zinc-900 p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-rose-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Delete &ldquo;{fileToDelete.filename}&rdquo;?
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                Are you sure you want to remove this file from the component draft? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg border border-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors"
              >
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
