"use client";

import React, { useState } from "react";
import { ComponentInstallInfo } from "../../types/component";
import { CopyButton } from "../common/CopyButton";

export interface InstallCommandProps {
  slug: string;
  isLocked?: boolean;
  installInfo?: ComponentInstallInfo;
  accessType?: "free" | "premium";
  notes?: string;
  requiredFiles?: string[];
  className?: string;
}

export const InstallCommand: React.FC<InstallCommandProps> = ({
  slug,
  isLocked = false,
  installInfo,
  accessType = "free",
  notes,
  requiredFiles,
  className = "",
}) => {
  const [selectedTool, setSelectedTool] = useState<"npx" | "pnpm" | "bun">("npx");

  // Determine base command from backend metadata or standard format
  const baseNpxCommand =
    installInfo?.packageManagerCommand ||
    `npx tech-inject add ${slug}${accessType === "premium" ? " --auth" : ""}`;

  const getToolCommand = () => {
    if (selectedTool === "pnpm") {
      return baseNpxCommand.replace(/^npx\s+/, "pnpm dlx ");
    }
    if (selectedTool === "bun") {
      return baseNpxCommand.replace(/^npx\s+/, "bunx ");
    }
    return baseNpxCommand;
  };

  const command = getToolCommand();
  const installNotes = notes || installInfo?.notes;

  if (isLocked) {
    return (
      <div
        className={`rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-5 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Installation Command Restricted
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              This component requires an authenticated premium token (<code className="font-mono text-amber-600">--auth</code>). Sign in to unlock installation metadata.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Install Component</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Add component files directly into your project via the Tech Inject CLI.
          </p>
        </div>

        {/* Package Runner Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setSelectedTool("npx")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              selectedTool === "npx"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            npx
          </button>
          <button
            type="button"
            onClick={() => setSelectedTool("pnpm")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              selectedTool === "pnpm"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            pnpm dlx
          </button>
          <button
            type="button"
            onClick={() => setSelectedTool("bun")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              selectedTool === "bun"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            bunx
          </button>
        </div>
      </div>

      {/* Terminal Command Box */}
      <div className="relative flex items-center justify-between rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-100 border border-slate-800 shadow-inner">
        <div className="flex items-center gap-3 overflow-x-auto pr-16 py-0.5">
          <span className="text-emerald-400 select-none">$</span>
          <span className="text-slate-100 whitespace-nowrap">{command}</span>
        </div>
        <div className="absolute right-3">
          <CopyButton text={command} size="sm" variant="dark" />
        </div>
      </div>

      {/* Notes & Required Files */}
      {(installNotes || (requiredFiles && requiredFiles.length > 0)) && (
        <div className="pt-2 text-xs space-y-2">
          {installNotes && (
            <p className="text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{installNotes}</span>
            </p>
          )}

          {requiredFiles && requiredFiles.length > 0 && (
            <div className="text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Created files:{" "}
              </span>
              <span className="font-mono text-slate-600 dark:text-slate-400">
                {requiredFiles.join(", ")}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
