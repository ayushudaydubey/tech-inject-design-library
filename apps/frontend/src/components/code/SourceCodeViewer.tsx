"use client";

import React, { useState } from "react";
import { ComponentFile } from "../../types/component";
import { CopyCodeButton } from "./CopyCodeButton";

export interface SourceCodeViewerProps {
  sourceFiles?: ComponentFile[];
  supportingFiles?: ComponentFile[];
  themeFiles?: ComponentFile[];
  isLocked?: boolean;
  className?: string;
}

export const SourceCodeViewer: React.FC<SourceCodeViewerProps> = ({
  sourceFiles = [],
  supportingFiles = [],
  themeFiles = [],
  isLocked = false,
  className = "",
}) => {
  // Combine all available files with category tagging
  const allFiles = [
    ...sourceFiles.map((f) => ({ ...f, group: "source" })),
    ...supportingFiles.map((f) => ({ ...f, group: "support" })),
    ...themeFiles.map((f) => ({ ...f, group: "theme" })),
  ];

  const [activeFileIndex, setActiveFileIndex] = useState(0);

  if (isLocked) {
    return null;
  }

  if (allFiles.length === 0) {
    return (
      <div className={`p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center ${className}`}>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No source code files attached to this component yet.
        </p>
      </div>
    );
  }

  const currentFile = allFiles[activeFileIndex] || allFiles[0];
  const lines = currentFile.content ? currentFile.content.split("\n") : [];

  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-md ${className}`}
      role="region"
      aria-label="Component Source Code Viewer"
    >
      {/* File Tabs Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900/90 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
          {allFiles.map((file, idx) => {
            const isSelected = idx === activeFileIndex;
            return (
              <button
                key={`${file.group}-${file.filename}-${idx}`}
                type="button"
                onClick={() => setActiveFileIndex(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-medium transition-colors ${
                  isSelected
                    ? "bg-slate-800 text-white shadow-xs border border-slate-700"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <span>{file.filename}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded uppercase ${
                    file.group === "theme"
                      ? "bg-emerald-950 text-emerald-400"
                      : file.group === "support"
                      ? "bg-purple-950 text-purple-400"
                      : "bg-blue-950 text-blue-400"
                  }`}
                >
                  {file.fileType}
                </span>
              </button>
            );
          })}
        </div>

        {/* Copy Button */}
        <div>
          <CopyCodeButton
            code={currentFile.content}
            filename={currentFile.filename}
          />
        </div>
      </div>

      {/* Code Display with Line Numbers */}
      <div className="overflow-x-auto p-4 max-h-[520px] font-mono text-xs text-slate-200 leading-relaxed select-text">
        <div className="table w-full">
          {lines.map((line, idx) => (
            <div key={idx} className="table-row hover:bg-slate-900/40">
              <span className="table-cell pr-4 text-right text-slate-600 select-none w-10 text-[11px]">
                {idx + 1}
              </span>
              <span className="table-cell whitespace-pre text-slate-100 font-mono">
                {line || " "}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
