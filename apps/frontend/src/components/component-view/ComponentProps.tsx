import React from "react";

export interface ComponentPropsProps {
  propsDocumentation?: string;
  declaredDependencies?: Record<string, string>;
  className?: string;
}

export const ComponentProps: React.FC<ComponentPropsProps> = ({
  propsDocumentation,
  declaredDependencies,
  className = "",
}) => {
  const hasProps = Boolean(propsDocumentation && propsDocumentation.trim() !== "");
  const hasDeps = Boolean(
    declaredDependencies && Object.keys(declaredDependencies).length > 0
  );

  if (!hasProps && !hasDeps) {
    return null;
  }

  // Parse lines of propsDocumentation if in markdown list format
  const lines = propsDocumentation ? propsDocumentation.split("\n") : [];

  return (
    <div className={`space-y-6 ${className}`}>
      {hasProps && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Component Properties
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              TypeScript Interface
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
              {lines.map((line, idx) => {
                if (line.startsWith("###")) {
                  return (
                    <h4
                      key={idx}
                      className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 mt-1"
                    >
                      {line.replace(/^###\s*/, "")}
                    </h4>
                  );
                }
                if (line.startsWith("- `") || line.startsWith("* `")) {
                  // Prop line e.g. - `title` (string): Metric label
                  const match = line.match(/^[-*]\s*`([^`]+)`\s*\(([^)]+)\):\s*(.+)$/);
                  if (match) {
                    const [, propName, propType, propDesc] = match;
                    return (
                      <div
                        key={idx}
                        className="py-2 border-b border-slate-100 dark:border-slate-800/80 last:border-0 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                            {propName}
                          </code>
                          <span className="font-mono text-slate-500 dark:text-slate-400">
                            {propType}
                          </span>
                        </div>
                        <span className="text-slate-600 dark:text-slate-400 sm:text-right">
                          {propDesc}
                        </span>
                      </div>
                    );
                  }
                }
                if (line.trim() === "") return null;
                return (
                  <p key={idx} className="text-xs text-slate-600 dark:text-slate-400 my-1">
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {hasDeps && declaredDependencies && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Declared Dependencies
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(declaredDependencies).map(([pkg, version]) => (
              <span
                key={pkg}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
              >
                <span className="font-semibold text-slate-900 dark:text-white">
                  {pkg}
                </span>
                <span className="text-slate-400">{version}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
