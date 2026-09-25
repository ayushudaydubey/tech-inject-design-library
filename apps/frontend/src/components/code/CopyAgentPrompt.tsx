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
  const [expanded, setExpanded] = useState(true);

  if (isLocked) {
    return null;
  }

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
      className={`rounded-lg border border-zinc-700/60 bg-zinc-800 p-4 space-y-3 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-zinc-700 border border-zinc-600 flex items-center justify-center text-blue-200">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-100">
              AI Coding Agent Prompt
            </h3>
            <p className="text-[11px] text-zinc-400">
              For Cursor, Claude Code, Copilot, or Antigravity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] font-medium text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded hover:bg-zinc-700 transition-colors"
          >
            {expanded ? "Hide" : "Preview"}
          </button>
          <CopyButton text={fullAgentPrompt} label="Copy Prompt" size="sm" />
        </div>
      </div>

      {expanded && (
        <div className="rounded-md bg-zinc-900 p-3 border border-zinc-700/60 text-xs font-mono text-zinc-300 overflow-x-auto max-h-56 whitespace-pre-wrap leading-relaxed no-scrollbar">
          {fullAgentPrompt}
        </div>
      )}
    </div>
  );
};
