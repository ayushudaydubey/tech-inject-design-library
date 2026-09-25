"use client";

import React, { useState } from "react";
import { CopyButton } from "../common/CopyButton";
import { DynamicComponentSandbox, ComponentFile } from "./DynamicComponentSandbox";

export interface ComponentPreviewProps {
  slug: string;
  name: string;
  previewData?: string;
  sourceFiles?: ComponentFile[];
  supportingFiles?: ComponentFile[];
  themeFiles?: ComponentFile[];
  declaredDependencies?: Record<string, string>;
  mainComponentFile?: string;
  propsDocumentation?: string;
  className?: string;
}

export const ComponentPreview: React.FC<ComponentPreviewProps> = ({
  slug,
  name,
  previewData,
  sourceFiles = [],
  supportingFiles = [],
  themeFiles = [],
  declaredDependencies = {},
  mainComponentFile,
  propsDocumentation,
  className = "",
}) => {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"visual" | "data">("visual");

  const getViewportWidth = () => {
    switch (viewport) {
      case "mobile":
        return "w-full max-w-sm";
      case "tablet":
        return "w-full max-w-2xl";
      default:
        return "w-full max-w-full";
    }
  };

  const formattedJson = React.useMemo(() => {
    if (!previewData || previewData.trim() === "") return "{}";
    try {
      return JSON.stringify(JSON.parse(previewData), null, 2);
    } catch {
      return previewData;
    }
  }, [previewData]);

  return (
    <div
      className={`min-h-[460px] h-[540px] max-h-[720px] w-full flex flex-col rounded-lg border border-zinc-700/60 overflow-hidden bg-zinc-900 ${className}`}
    >
      {/* Top Toolbar */}
      <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-zinc-700/60 bg-zinc-800/90">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("visual")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === "visual"
                ? "bg-zinc-700 text-zinc-100 border border-zinc-600"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Interactive Preview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("data")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === "data"
                ? "bg-zinc-700 text-zinc-100 border border-zinc-600"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Fixture Data (JSON)
          </button>
        </div>

        {/* Viewport Width Controls */}
        {activeTab === "visual" && (
          <div className="flex items-center gap-0.5 bg-zinc-900 p-0.5 rounded-md border border-zinc-700/60 text-xs">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              aria-label="Desktop viewport"
              className={`p-1.5 rounded transition-colors ${
                viewport === "desktop"
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Desktop (100%)"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewport("tablet")}
              aria-label="Tablet viewport"
              className={`p-1.5 rounded transition-colors ${
                viewport === "tablet"
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Tablet (640px)"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              aria-label="Mobile viewport"
              className={`p-1.5 rounded transition-colors ${
                viewport === "mobile"
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Mobile (384px)"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 w-full min-h-0 relative overflow-hidden bg-zinc-900 flex items-center justify-center p-0">
        <div className={activeTab === "visual" ? `h-full w-full flex items-center justify-center transition-all duration-300 mx-auto ${getViewportWidth()}` : "hidden"}>
          <DynamicComponentSandbox
            name={name}
            slug={slug}
            previewData={previewData}
            sourceFiles={sourceFiles}
            supportingFiles={supportingFiles}
            themeFiles={themeFiles}
            declaredDependencies={declaredDependencies}
            mainComponentFile={mainComponentFile}
            propsDocumentation={propsDocumentation}
          />
        </div>
        <div className={activeTab === "data" ? "w-full h-full relative bg-zinc-950 p-4 text-blue-200 font-mono text-xs overflow-auto" : "hidden"}>
          <div className="absolute top-3 right-3 z-10">
            <CopyButton text={formattedJson} size="sm" variant="dark" />
          </div>
          <pre className="text-blue-200 leading-relaxed whitespace-pre-wrap">{formattedJson}</pre>
        </div>
      </div>
    </div>
  );
};
