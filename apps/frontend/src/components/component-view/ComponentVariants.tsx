import React from "react";

export interface ComponentVariantsProps {
  slug?: string;
  themeFiles?: { filename: string; content: string; fileType: string }[];
  className?: string;
}

export const ComponentVariants: React.FC<ComponentVariantsProps> = ({
  themeFiles,
  className = "",
}) => {
  if (!themeFiles || themeFiles.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
          <span>Theme Tokens & Variants</span>
        </h3>
        <span className="text-xs text-zinc-400">
          CSS Tokens & Theme Classes
        </span>
      </div>

      <div className="space-y-3">
        {themeFiles.map((theme) => (
          <div
            key={theme.filename}
            className="rounded-lg border border-zinc-700/60 bg-zinc-800 overflow-hidden"
          >
            <div className="px-4 py-2 border-b border-zinc-700/60 bg-zinc-900/60 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="font-medium text-zinc-200">
                {theme.filename}
              </span>
              <span className="uppercase text-[10px] text-zinc-500">
                {theme.fileType}
              </span>
            </div>
            <pre className="p-4 text-xs font-mono text-zinc-200 bg-zinc-900 overflow-x-auto leading-relaxed">
              <code>{theme.content}</code>
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};
