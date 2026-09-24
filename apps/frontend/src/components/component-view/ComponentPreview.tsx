"use client";

import React, { useState } from "react";
import { CopyButton } from "../common/CopyButton";

export interface ComponentPreviewProps {
  slug: string;
  name: string;
  previewData?: string;
  className?: string;
}

export const ComponentPreview: React.FC<ComponentPreviewProps> = ({
  slug,
  name,
  previewData,
  className = "",
}) => {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"visual" | "data">("visual");

  // Safe JSON parse without eval()
  let parsedData: Record<string, unknown> | null = null;
  if (previewData) {
    try {
      parsedData = JSON.parse(previewData);
    } catch {
      parsedData = null;
    }
  }

  // Safe visual renderers based on verified backend fixtures
  const renderVisualContent = () => {
    if (!previewData && !parsedData) {
      return (
        <div className="py-16 text-center text-slate-400 dark:text-slate-500">
          <p className="text-sm">Static preview placeholder for {name}</p>
        </div>
      );
    }

    // 1. Sales Metric Card safe preview
    if (
      slug === "sales-metric-card" ||
      (parsedData && typeof parsedData.title === "string" && parsedData.value !== undefined)
    ) {
      const title = String(parsedData?.title || "Quarterly Revenue");
      const value = String(parsedData?.value || "$428,500");
      const change = typeof parsedData?.change === "number" ? parsedData.change : 12.4;
      const trend = String(parsedData?.trend || "up");
      const isPositive = trend === "up";

      return (
        <div className="flex items-center justify-center p-8 w-full">
          <div className="w-full max-w-sm p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {title}
            </div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {value}
            </div>
            <div className="mt-3 flex items-center text-sm font-medium">
              <span
                className={`flex items-center gap-1 font-semibold ${
                  isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {isPositive ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {Math.abs(change)}%
              </span>
              <span className="ml-2 text-xs text-slate-400">vs last period</span>
            </div>
          </div>
        </div>
      );
    }

    // 2. Pipeline Kanban Board safe preview
    if (
      slug === "pipeline-kanban-board" ||
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
          <div className="flex gap-4 min-w-[500px]">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className="flex-1 min-w-[180px] bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                    {stage.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    ${Number(stage.totalValue).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-xs border border-slate-100 dark:border-slate-700/60">
                    <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      Acme Corp Expansion
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Stage Probability: 75%</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-xs border border-slate-100 dark:border-slate-700/60">
                    <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      Globex Annual Renewal
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Stage Probability: 90%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 3. Fallback safe preview data presentation
    return (
      <div className="p-8 text-center">
        <div className="inline-block p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs text-left max-w-md w-full">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Safe Preview Render
          </div>
          <pre className="text-xs text-slate-700 dark:text-slate-300 font-mono overflow-auto max-h-48 whitespace-pre-wrap">
            {JSON.stringify(parsedData, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  const getViewportWidth = () => {
    switch (viewport) {
      case "mobile":
        return "max-w-sm";
      case "tablet":
        return "max-w-xl";
      default:
        return "w-full";
    }
  };

  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-xs ${className}`}>
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("visual")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "visual"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Interactive Preview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("data")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "data"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Fixture Data (JSON)
          </button>
        </div>

        {/* Viewport Width Controls */}
        {activeTab === "visual" && (
          <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800/80 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              aria-label="Desktop viewport"
              className={`p-1.5 rounded-md transition-colors ${
                viewport === "desktop"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
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
              className={`p-1.5 rounded-md transition-colors ${
                viewport === "tablet"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
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
              className={`p-1.5 rounded-md transition-colors ${
                viewport === "mobile"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
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
      <div className="bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50/50 dark:bg-slate-950 p-6 flex items-center justify-center min-h-[300px]">
        {activeTab === "visual" ? (
          <div className={`transition-all duration-300 mx-auto ${getViewportWidth()}`}>
            {renderVisualContent()}
          </div>
        ) : (
          <div className="w-full relative bg-slate-900 rounded-xl p-4 text-slate-100 font-mono text-xs overflow-auto max-h-96">
            <div className="absolute top-3 right-3">
              <CopyButton text={previewData || "{}"} size="sm" variant="dark" />
            </div>
            <pre>{previewData ? JSON.stringify(JSON.parse(previewData), null, 2) : "{}"}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
