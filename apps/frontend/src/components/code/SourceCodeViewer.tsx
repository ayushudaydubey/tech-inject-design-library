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
      <div className={`p-8 rounded-lg border border-zinc-700 bg-zinc-800 text-center ${className}`}>
        <p className="text-xs text-zinc-400">
          No source code files attached to this component yet.
        </p>
      </div>
    );
  }

  const currentFile = allFiles[activeFileIndex] || allFiles[0];
  const lines = currentFile.content ? currentFile.content.split("\n") : [];

  return (
    <div
      className={`rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden shadow-xs ${className}`}
      role="region"
      aria-label="Component Source Code Viewer"
    >
      {/* File Tabs Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-zinc-800 bg-zinc-800 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-0.5">
          {allFiles.map((file, idx) => {
            const isSelected = idx === activeFileIndex;
            return (
              <button
                key={`${file.group}-${file.filename}-${idx}`}
                type="button"
                onClick={() => setActiveFileIndex(idx)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs transition-colors ${isSelected
                  ? "bg-zinc-800 text-zinc-100 border border-zinc-700 font-medium"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                  }`}
              >
                <span>{file.filename}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded uppercase ${file.group === "theme"
                    ? "bg-green-500/10 text-green-300 border border-green-500/20"
                    : file.group === "support"
                      ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                      : "bg-blue-200/10 text-blue-200 border border-blue-200/20"
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
      <div className="overflow-x-auto p-4 max-h-[520px] font-mono text-xs text-blue-200 leading-relaxed select-text bg-zinc-950">
        <div className="table w-full">
          {lines.map((line, idx) => (
            <div key={idx} className="table-row hover:bg-zinc-800/40">
              <span className="table-cell pr-4 text-right text-zinc-500 select-none w-10 text-[11px]">
                {idx + 1}
              </span>
              <span className="table-cell whitespace-pre text-blue-200 font-mono">
                {line || " "}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
