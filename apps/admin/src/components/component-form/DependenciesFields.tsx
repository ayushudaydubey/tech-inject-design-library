"use client";

import React, { useState } from "react";

export interface DependenciesFieldsProps {
  dependencies: Record<string, string>;
  onChange: (dependencies: Record<string, string>) => void;
  disabled?: boolean;
}

export const DependenciesFields: React.FC<DependenciesFieldsProps> = ({
  dependencies,
  onChange,
  disabled = false,
}) => {
  const [newPkg, setNewPkg] = useState("");
  const [newVersion, setNewVersion] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    setError(null);
    const pkg = newPkg.trim();
    const ver = newVersion.trim() || "^1.0.0";

    if (!pkg) {
      setError("Package name cannot be empty.");
      return;
    }

    // Safety validation: only valid npm package names (letters, numbers, hyphens, slashes, @)
    if (!/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(pkg)) {
      setError("Invalid npm package name format.");
      return;
    }

    onChange({
      ...dependencies,
      [pkg]: ver,
    });

    setNewPkg("");
    setNewVersion("");
  };

  const handleRemove = (pkgToRemove: string) => {
    const updated = { ...dependencies };
    delete updated[pkgToRemove];
    onChange(updated);
  };

  const quickAdd = (pkg: string, ver: string) => {
    onChange({
      ...dependencies,
      [pkg]: ver,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Declared Dependencies
        </label>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>Quick add:</span>
          <button
            type="button"
            onClick={() => quickAdd("lucide-react", "^0.300.0")}
            disabled={disabled}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            +lucide-react
          </button>
          <span>&bull;</span>
          <button
            type="button"
            onClick={() => quickAdd("clsx", "^2.1.0")}
            disabled={disabled}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            +clsx
          </button>
        </div>
      </div>

      {/* Existing Dependencies Chips */}
      <div className="flex flex-wrap gap-2 min-h-8 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950">
        {Object.keys(dependencies).length === 0 ? (
          <span className="text-xs text-slate-400 italic">
            No dependencies declared yet. (e.g. lucide-react, clsx)
          </span>
        ) : (
          Object.entries(dependencies).map(([pkg, ver]) => (
            <span
              key={pkg}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-md text-xs font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs"
            >
              <span className="font-semibold">{pkg}</span>
              <span className="text-slate-400">{ver}</span>
              <button
                type="button"
                onClick={() => handleRemove(pkg)}
                disabled={disabled}
                className="text-slate-400 hover:text-rose-500 p-0.5"
                aria-label={`Remove ${pkg}`}
              >
                &times;
              </button>
            </span>
          ))
        )}
      </div>

      {/* Add New Dependency Row */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newPkg}
          onChange={(e) => setNewPkg(e.target.value)}
          placeholder="Package (e.g. lucide-react)"
          disabled={disabled}
          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <input
          type="text"
          value={newVersion}
          onChange={(e) => setNewVersion(e.target.value)}
          placeholder="Version (e.g. ^0.300.0)"
          disabled={disabled}
          className="w-32 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs transition-colors disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {error && <p className="text-[11px] text-rose-500">{error}</p>}
    </div>
  );
};
