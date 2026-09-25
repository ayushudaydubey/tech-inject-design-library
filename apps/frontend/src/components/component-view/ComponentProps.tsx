"use client";

import React from "react";

export interface ComponentPropsProps {
  propsDocumentation?: string;
  declaredDependencies?: Record<string, string>;
  className?: string;
}

interface TableRow {
  prop: string;
  type: string;
  defaultVal: string;
  description: string;
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

  const rawText = propsDocumentation || "";
  const lines = rawText.split("\n");

  const tableRows: TableRow[] = [];
  const nonTableLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith("|") && line.endsWith("|")) {
      const cells = line
        .split("|")
        .map((c) => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

      if (
        cells.every((c) => /^[-: ]+$/.test(c)) ||
        (cells[0] && cells[0].toLowerCase() === "prop")
      ) {
        continue;
      }

      if (cells.length >= 3) {
        tableRows.push({
          prop: cells[0].replace(/`/g, ""),
          type: cells[1].replace(/`/g, ""),
          defaultVal: cells.length >= 4 ? cells[2].replace(/`/g, "") : "-",
          description: cells.length >= 4 ? cells[3] : cells[2] || "",
        });
      }
    } else {
      if (line !== "") {
        nonTableLines.push(lines[i]);
      }
    }
  }

  return (
    <div className={`space-y-4 w-full ${className}`}>
      {hasProps && (
        <div className="rounded-lg border border-zinc-700/60 bg-zinc-800 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-700/60 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Component Properties
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Configurable props, types, and default values.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded">
              TypeScript
            </span>
          </div>

          {/* Structured Table */}
          {tableRows.length > 0 ? (
            <div className="overflow-x-auto rounded-md border border-zinc-700/60 bg-zinc-900">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-700/60 bg-zinc-800/80 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                    <th className="px-4 py-2.5">Prop</th>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Default</th>
                    <th className="px-4 py-2.5">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300 font-sans">
                  {tableRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-4 py-2.5 font-mono font-medium text-blue-200">
                        <code>{row.prop}</code>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-zinc-300">
                        <span className="bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-[11px]">
                          {row.type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-zinc-400">
                        {row.defaultVal && row.defaultVal !== "-" ? (
                          <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-[11px] text-zinc-300">
                            {row.defaultVal}
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-400 leading-relaxed">
                        {row.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-2 text-zinc-300">
              {nonTableLines.map((line, idx) => {
                if (line.startsWith("###")) {
                  return (
                    <h4
                      key={idx}
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 mt-3"
                    >
                      {line.replace(/^###\s*/, "")}
                    </h4>
                  );
                }
                if (line.startsWith("- `") || line.startsWith("* `")) {
                  const match = line.match(/^[-*]\s*`([^`]+)`\s*\(([^)]+)\):\s*(.+)$/);
                  if (match) {
                    const [, propName, propType, propDesc] = match;
                    return (
                      <div
                        key={idx}
                        className="py-2 border-b border-zinc-700/60 last:border-0 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-medium text-blue-200 bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 rounded text-xs">
                            {propName}
                          </code>
                          <span className="font-mono text-zinc-300 text-xs">
                            {propType}
                          </span>
                        </div>
                        <span className="text-zinc-400 text-xs sm:text-right">
                          {propDesc}
                        </span>
                      </div>
                    );
                  }
                }
                return (
                  <p key={idx} className="text-xs text-zinc-400 leading-relaxed my-1">
                    {line}
                  </p>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Dependencies */}
      {hasDeps && declaredDependencies && (
        <div className="rounded-lg border border-zinc-700/60 bg-zinc-800 p-4 space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Dependencies
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(declaredDependencies).map(([pkg, version]) => (
              <span
                key={pkg}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-zinc-900 text-zinc-300 border border-zinc-700"
              >
                <span className="font-medium text-blue-200">{pkg}</span>
                <span className="text-zinc-500">{version}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
