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

  const rawCode = usageDocumentation
    .replace(/^```[a-zA-Z]*\n?/, "")
    .replace(/```$/, "")
    .trim();

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-100">
          Usage Example
        </h3>
        <CopyButton text={rawCode} size="sm" />
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-800 p-4 overflow-hidden relative shadow-xs">
        <pre className="text-xs font-mono text-blue-200 overflow-x-auto leading-relaxed bg-zinc-950">
          <code className="bg-zinc-950 text-blue-200">{rawCode}</code>
        </pre>
      </div>
    </div>
  );
};
