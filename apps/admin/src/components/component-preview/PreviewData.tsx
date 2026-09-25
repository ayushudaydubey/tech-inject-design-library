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
      <div className={`p-4 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-zinc-500 italic text-center ${className}`}>
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
      className={`rounded-xl border border-zinc-800 bg-zinc-850 p-6 space-y-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-100">
          Fixture Data Payload
        </h3>
        <span className="text-[11px] font-mono text-zinc-400">JSON</span>
      </div>

      <pre className="p-4 rounded-xl bg-zinc-900 text-zinc-200 font-mono text-xs overflow-auto max-h-60 leading-relaxed border border-zinc-800">
        <code>{formatted}</code>
      </pre>
    </div>
  );
};
