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
        className={`rounded-lg border border-amber-400/20 bg-amber-400/5 p-4 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-300 flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-100">
              Installation Command Restricted
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Sign in to unlock premium installation token (<code className="font-mono text-amber-300">--auth</code>).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-zinc-700/60 bg-zinc-800 p-4 space-y-3 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-semibold text-zinc-100">
            Install Component
          </h3>
          <p className="text-[11px] text-zinc-400">
            Add files directly via the CLI runner.
          </p>
        </div>

        {/* Package Runner Switcher */}
        <div className="flex items-center bg-zinc-900 p-0.5 rounded-md border border-zinc-700/60 text-[11px]">
          <button
            type="button"
            onClick={() => setSelectedTool("npx")}
            className={`px-2 py-0.5 rounded transition-colors ${
              selectedTool === "npx"
                ? "bg-zinc-700 text-zinc-100 font-medium"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            npx
          </button>
          <button
            type="button"
            onClick={() => setSelectedTool("pnpm")}
            className={`px-2 py-0.5 rounded transition-colors ${
              selectedTool === "pnpm"
                ? "bg-zinc-700 text-zinc-100 font-medium"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            pnpm dlx
          </button>
          <button
            type="button"
            onClick={() => setSelectedTool("bun")}
            className={`px-2 py-0.5 rounded transition-colors ${
              selectedTool === "bun"
                ? "bg-zinc-700 text-zinc-100 font-medium"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            bunx
          </button>
        </div>
      </div>

      {/* Terminal Command Box */}
      <div className="relative flex items-center justify-between rounded-md bg-zinc-900 px-3 py-2.5 font-mono text-xs text-zinc-100 border border-zinc-700/60">
        <div className="flex items-center gap-2.5 overflow-x-auto pr-14 py-0.5 no-scrollbar">
          <span className="text-green-300 select-none font-medium">$</span>
          <span className="text-zinc-200 whitespace-nowrap">{command}</span>
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <CopyButton text={command} size="sm" variant="dark" />
        </div>
      </div>

      {/* Notes & Required Files */}
      {(installNotes || (requiredFiles && requiredFiles.length > 0)) && (
        <div className="pt-1 text-[11px] space-y-1 text-zinc-400">
          {installNotes && (
            <p className="flex items-start gap-1.5">
              <span className="text-blue-200 font-medium">ℹ</span>
              <span>{installNotes}</span>
            </p>
          )}

          {requiredFiles && requiredFiles.length > 0 && (
            <div>
              <span className="font-medium text-zinc-300">Files: </span>
              <span className="font-mono text-zinc-400">
                {requiredFiles.join(", ")}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
