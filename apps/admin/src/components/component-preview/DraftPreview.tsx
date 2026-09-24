"use client";

import React, { useState } from "react";
import { AdminComponent } from "../../types/component";
import { ComponentStatusBadge } from "../components/ComponentStatusBadge";
import { ComponentAccessBadge } from "../components/ComponentAccessBadge";

export interface DraftPreviewProps {
  component: AdminComponent;
  className?: string;
}

export const DraftPreview: React.FC<DraftPreviewProps> = ({
  component,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<"render" | "source">("render");

  let parsedData: Record<string, unknown> | null = null;
  if (component.previewData) {
    try {
      parsedData = JSON.parse(component.previewData);
    } catch {
      parsedData = null;
    }
  }

  const renderPreviewContent = () => {
    // 1. Sales Metric Card safe preview
    if (
      component.slug === "sales-metric-card" ||
      (parsedData && typeof parsedData.title === "string" && parsedData.value !== undefined)
    ) {
      const title = String(parsedData?.title || component.name);
      const value = String(parsedData?.value || "$428,500");
      const change = typeof parsedData?.change === "number" ? parsedData.change : 12.4;
      const trend = String(parsedData?.trend || "up");
      const isPositive = trend === "up";

      return (
        <div className="flex items-center justify-center p-6 w-full">
          <div className="w-full max-w-sm p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {title}
            </div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
              {value}
            </div>
            <div className="mt-2 flex items-center text-xs font-semibold">
              <span className={isPositive ? "text-emerald-600 flex items-center gap-1" : "text-rose-600 flex items-center gap-1"}>
                {isPositive ? "▲" : "▼"} {Math.abs(change)}%
              </span>
              <span className="ml-2 text-slate-400 font-normal">vs last period</span>
            </div>
          </div>
        </div>
      );
    }

    // 2. Pipeline Kanban Board safe preview
    if (
      component.slug === "pipeline-kanban-board" ||
      (parsedData && Array.isArray(parsedData.stages))
    ) {
      interface StageItem {
        id: string;
        name: string;
        totalValue: number;
      }
      const stages = (parsedData?.stages as StageItem[]) || [
        { id: "lead", name: "Lead In", totalValue: 45000 },
        { id: "demo", name: "Demo Scheduled", totalValue: 82000 },
        { id: "closed", name: "Closed Won", totalValue: 120000 },
      ];

      return (
        <div className="w-full p-4 overflow-x-auto">
          <div className="flex gap-3 min-w-[480px]">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className="flex-1 bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 uppercase">
                    {stage.name}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-600 font-bold">
                    ${Number(stage.totalValue).toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg text-xs font-medium border border-slate-100 dark:border-slate-700 shadow-xs">
                  Active CRM Pipeline Stage
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 3. Fallback preview
    return (
      <div className="p-8 text-center space-y-2">
        <div className="w-10 h-10 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Safe Visual Sandbox for &ldquo;{component.name}&rdquo;
        </p>
        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
          {component.sourceFiles?.length || 0} source file(s) attached.
        </p>
      </div>
    );
  };

  const primarySource = component.sourceFiles?.[0];

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden ${className}`}
    >
      {/* Header bar */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {component.name}
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            v{component.version}
          </span>
          <ComponentStatusBadge status={component.status} />
          <ComponentAccessBadge accessType={component.accessType} />
        </div>

        {/* View toggles */}
        <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("render")}
            className={`px-3 py-1 rounded-md font-semibold transition-colors ${
              activeTab === "render"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Visual Sandbox
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("source")}
            className={`px-3 py-1 rounded-md font-semibold transition-colors ${
              activeTab === "source"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Source Inspect
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 bg-slate-50/40 dark:bg-slate-950/40 min-h-[260px] flex items-center justify-center">
        {activeTab === "render" ? (
          renderPreviewContent()
        ) : (
          <div className="w-full">
            {primarySource ? (
              <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-auto max-h-72 border border-slate-800 leading-relaxed">
                <code>{primarySource.content}</code>
              </pre>
            ) : (
              <p className="text-xs text-slate-400 text-center py-8 italic">
                No source code file uploaded yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
