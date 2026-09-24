import React from "react";
import { CopyButton } from "../common/CopyButton";

export interface ComponentUsageProps {
  usageDocumentation?: string;
  className?: string;
}

export const ComponentUsage: React.FC<ComponentUsageProps> = ({
  usageDocumentation,
  className = "",
}) => {
  if (!usageDocumentation || usageDocumentation.trim() === "") {
    return null;
  }

  // Clean code markdown tags if present
  const rawCode = usageDocumentation
    .replace(/^```[a-zA-Z]*\n?/, "")
    .replace(/```$/, "")
    .trim();

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Usage Example
        </h3>
        <CopyButton text={rawCode} size="sm" />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 overflow-hidden shadow-xs relative">
        <pre className="text-xs font-mono text-slate-100 overflow-x-auto leading-relaxed">
          <code>{rawCode}</code>
        </pre>
      </div>
    </div>
  );
};
