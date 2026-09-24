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
  // If no theme files exist and no specific variants apply, return null
  if (!themeFiles || themeFiles.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Theme Tokens & Variants</span>
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          CSS Tokens & Theme Classes
        </span>
      </div>

      <div className="space-y-3">
        {themeFiles.map((theme) => (
          <div
            key={theme.filename}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
          >
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {theme.filename}
              </span>
              <span className="uppercase text-[10px] text-slate-400">
                {theme.fileType}
              </span>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-800 dark:text-slate-200 bg-slate-900 text-slate-100 overflow-x-auto">
              <code>{theme.content}</code>
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};
