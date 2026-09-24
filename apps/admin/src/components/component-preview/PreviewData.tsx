import React from "react";

export interface PreviewDataProps {
  previewData?: string;
  className?: string;
}

export const PreviewData: React.FC<PreviewDataProps> = ({
  previewData,
  className = "",
}) => {
  if (!previewData || previewData.trim() === "") {
    return (
      <div className={`p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-400 italic text-center ${className}`}>
        No preview fixture data configured.
      </div>
    );
  }

  let formatted = previewData;
  try {
    const parsed = JSON.parse(previewData);
    formatted = JSON.stringify(parsed, null, 2);
  } catch {
    // Keep raw
  }

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Fixture Data Payload
        </h3>
        <span className="text-[11px] font-mono text-slate-400">JSON</span>
      </div>

      <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-auto max-h-60 leading-relaxed border border-slate-800">
        <code>{formatted}</code>
      </pre>
    </div>
  );
};
