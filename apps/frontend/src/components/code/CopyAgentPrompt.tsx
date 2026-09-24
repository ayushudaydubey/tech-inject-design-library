"use client";

import React, { useState } from "react";
import { CopyButton } from "../common/CopyButton";

export interface CopyAgentPromptProps {
  name: string;
  slug: string;
  isLocked?: boolean;
  agentPrompt?: string;
  installCommand?: string;
  dependencies?: Record<string, string>;
  propsDocumentation?: string;
  className?: string;
}

export const CopyAgentPrompt: React.FC<CopyAgentPromptProps> = ({
  name,
  slug,
  isLocked = false,
  agentPrompt,
  installCommand,
  dependencies,
  propsDocumentation,
  className = "",
}) => {
  const [expanded, setExpanded] = useState(false);

  if (isLocked) {
    return null;
  }

  // Generate comprehensive structured prompt for AI coding agents
  const depList = dependencies
    ? Object.entries(dependencies)
        .map(([k, v]) => `${k}@${v}`)
        .join(", ")
    : "none";

  const fullAgentPrompt =
    agentPrompt ||
    `You are integrating the '${name}' component from Tech Inject Design Library into this React/Next.js application.

1. Install the component:
   Run: ${installCommand || `npx tech-inject add ${slug}`}

2. Required Dependencies:
   Ensure the following packages are installed: ${depList}

3. Component Specifications:
${propsDocumentation ? propsDocumentation : "Use standard TypeScript props."}

4. Architectural Guidelines:
   - Import the component from your local components directory.
   - Follow standard Tailwind styling and theme tokens provided in the component's css file.
   - Wire event handlers and data properties matching the interface above.`;

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              AI Coding Agent Prompt
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Copy this structured prompt into Cursor, Claude Code, GitHub Copilot, or Antigravity to automate integration.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {expanded ? "Collapse" : "Preview Prompt"}
          </button>
          <CopyButton text={fullAgentPrompt} label="Copy Agent Prompt" size="sm" />
        </div>
      </div>

      {expanded && (
        <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-64 whitespace-pre-wrap leading-relaxed shadow-inner">
          {fullAgentPrompt}
        </div>
      )}
    </div>
  );
};
