"use client";

import React, { useState } from "react";
import { AdminComponent } from "../../types/component";
import { ComponentStatusBadge } from "../components/ComponentStatusBadge";
import { ComponentAccessBadge } from "../components/ComponentAccessBadge";
import { DynamicComponentSandbox } from "./DynamicComponentSandbox";

export interface DraftPreviewProps {
  component: AdminComponent;
  className?: string;
}

export const DraftPreview: React.FC<DraftPreviewProps> = ({
  component,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<"render" | "source">("render");

  const allFiles = React.useMemo(() => {
    const list: typeof component.sourceFiles = [];
    const seen = new Set<string>();

    const add = (f?: (typeof component.sourceFiles)[0]) => {
      if (!f) return;
      const key = (f.path || f.filename || "").toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        list.push(f);
      }
    };

    (component.sourceFiles || []).forEach(add);
    (component.supportingFiles || []).forEach(add);
    (component.themeFiles || []).forEach(add);

    return list;
  }, [component.sourceFiles, component.supportingFiles, component.themeFiles]);

  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const currentInspectFile = allFiles[activeSourceIndex] || allFiles[0];

  return (
    <div
      className={`rounded-xl border border-zinc-800 bg-zinc-850 overflow-hidden ${className}`}
    >
      {/* Header bar */}
      <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-100">
            {component.name}
          </span>
          <span className="font-mono text-[11px] text-zinc-400">
            v{component.version}
          </span>
          <ComponentStatusBadge status={component.status} />
          <ComponentAccessBadge accessType={component.accessType} />
        </div>

        {/* View toggles */}
        <div className="flex items-center bg-zinc-800 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("render")}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === "render"
                ? "bg-zinc-700 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Visual Sandbox
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("source")}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === "source"
                ? "bg-zinc-700 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Source Inspect
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 bg-zinc-950 min-h-[300px] flex items-center justify-center">
        {/* Visual Sandbox View */}
        <div className={`w-full min-h-[460px] h-[520px] max-h-[720px] ${activeTab === "render" ? "block" : "hidden"}`}>
          <DynamicComponentSandbox
            name={component.name}
            slug={component.slug}
            previewData={component.previewData}
            sourceFiles={component.sourceFiles}
            supportingFiles={component.supportingFiles}
            themeFiles={component.themeFiles}
            declaredDependencies={component.declaredDependencies}
            propsDocumentation={component.propsDocumentation}
          />
        </div>

        {/* Source Inspect View */}
        <div className={`w-full space-y-3 ${activeTab === "source" ? "block" : "hidden"}`}>
          {allFiles.length > 0 ? (
            <>
              {allFiles.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {allFiles.map((file, idx) => {
                    const isSelected = idx === activeSourceIndex;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveSourceIndex(idx)}
                        className={`px-2.5 py-1 rounded-md font-mono text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-zinc-800 text-blue-200 font-medium border border-zinc-700"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
                        }`}
                      >
                        <span>{file.path || file.filename}</span>
                        <span className="text-[9px] uppercase opacity-75 font-sans">
                          {file.fileType}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              <pre className="p-4 rounded-xl bg-zinc-950 text-blue-200 font-mono text-xs overflow-auto max-h-80 border border-zinc-800 leading-relaxed">
                <code>{currentInspectFile?.content || "// Empty file"}</code>
              </pre>
            </>
          ) : (
            <p className="text-xs text-zinc-500 text-center py-8 italic">
              No source code files attached to this component yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
