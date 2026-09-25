"use client";

import React, { useState, useMemo } from "react";
import {
  detectAllImportedPackages,
  isSafeNpmPackageName,
  isSafeSemverVersion,
  normalizePackageName,
  COMMON_SUGGESTIONS,
  KNOWN_LIBRARY_VERSIONS,
} from "../component-editor/dependencyAnalyzer";

export interface DependenciesFieldsProps {
  dependencies: Record<string, string>;
  onChange: (dependencies: Record<string, string>) => void;
  editorFiles?: Array<{ path?: string; filename?: string; content?: string }>;
  disabled?: boolean;
}

export const DependenciesFields: React.FC<DependenciesFieldsProps> = ({
  dependencies,
  onChange,
  editorFiles = [],
  disabled = false,
}) => {
  const [newPkg, setNewPkg] = useState("");
  const [newVersion, setNewVersion] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Editing state: holds package name currently being edited
  const [editingPkg, setEditingPkg] = useState<string | null>(null);
  const [editingVersion, setEditingVersion] = useState<string>("");
  const [editError, setEditError] = useState<string | null>(null);

  // Dynamic detection from source files
  const detectedFromSource = useMemo(() => {
    return detectAllImportedPackages(editorFiles);
  }, [editorFiles]);

  // Undeclared detected imports (in source, but not yet declared)
  const undeclaredDetected = useMemo(() => {
    const declaredKeys = new Set(
      Object.keys(dependencies).map((k) => k.toLowerCase())
    );
    return detectedFromSource.filter((d) => !declaredKeys.has(d.pkgName));
  }, [detectedFromSource, dependencies]);

  // Set of imported package names for quick check
  const importedSet = useMemo(() => {
    return new Set(detectedFromSource.map((d) => d.pkgName));
  }, [detectedFromSource]);

  // Common suggestions that are not yet declared and not in undeclared detected
  const availableQuickSuggestions = useMemo(() => {
    const declaredKeys = new Set(
      Object.keys(dependencies).map((k) => k.toLowerCase())
    );
    const undeclaredKeys = new Set(undeclaredDetected.map((u) => u.pkgName));
    return COMMON_SUGGESTIONS.filter(
      (s) => !declaredKeys.has(s.pkg.toLowerCase()) && !undeclaredKeys.has(s.pkg.toLowerCase())
    );
  }, [dependencies, undeclaredDetected]);

  // Handle adding a detected dependency
  const handleAddDetected = (pkgName: string, defaultVer: string | null) => {
    setError(null);
    const normalized = normalizePackageName(pkgName);
    const ver = defaultVer || KNOWN_LIBRARY_VERSIONS[normalized] || "^1.0.0";

    if (!isSafeNpmPackageName(normalized)) {
      setError(`Invalid package name "${pkgName}".`);
      return;
    }

    if (!isSafeSemverVersion(ver)) {
      setError(`Invalid dependency version "${ver}".`);
      return;
    }

    onChange({
      ...dependencies,
      [normalized]: ver,
    });
  };

  // Handle manual add
  const handleAddManual = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const rawPkg = newPkg.trim();
    if (!rawPkg) {
      setError("Package name is required.");
      return;
    }

    const normalized = normalizePackageName(rawPkg);

    if (!isSafeNpmPackageName(normalized)) {
      setError(
        "Invalid package name. NPM packages must only contain lowercase alphanumeric characters, hyphens, dots, or scoped format (e.g. @scope/pkg)."
      );
      return;
    }

    // Check duplicate
    const existingKey = Object.keys(dependencies).find(
      (k) => k.toLowerCase() === normalized
    );
    if (existingKey) {
      setError(
        `Dependency "${existingKey}" already exists. You can edit its version below.`
      );
      return;
    }

    // Version resolution: user input -> known version -> error if required
    let ver = newVersion.trim();
    if (!ver) {
      if (KNOWN_LIBRARY_VERSIONS[normalized]) {
        ver = KNOWN_LIBRARY_VERSIONS[normalized];
      } else {
        setError(
          `Version required for "${normalized}". Please specify a semver range (e.g. ^1.0.0).`
        );
        return;
      }
    }

    if (!isSafeSemverVersion(ver)) {
      setError(
        `Invalid dependency version "${ver}". Must be a valid semver range (e.g. ^0.475.0, ~2.1.0, 1.2.3).`
      );
      return;
    }

    onChange({
      ...dependencies,
      [normalized]: ver,
    });

    setNewPkg("");
    setNewVersion("");
  };

  // Start editing a dependency
  const handleStartEdit = (pkg: string, currentVer: string) => {
    setEditingPkg(pkg);
    setEditingVersion(currentVer);
    setEditError(null);
  };

  // Save edited dependency version
  const handleSaveEdit = (pkg: string) => {
    setEditError(null);
    const ver = editingVersion.trim();

    if (!ver) {
      setEditError("Version cannot be empty.");
      return;
    }

    if (!isSafeSemverVersion(ver)) {
      setEditError(
        `Invalid dependency version "${ver}". Must be a valid semver range.`
      );
      return;
    }

    // Update in place preserving single entry
    const updated: Record<string, string> = {};
    for (const [key, existingVer] of Object.entries(dependencies)) {
      if (key.toLowerCase() === pkg.toLowerCase()) {
        updated[key] = ver;
      } else {
        updated[key] = existingVer;
      }
    }

    onChange(updated);
    setEditingPkg(null);
    setEditingVersion("");
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingPkg(null);
    setEditingVersion("");
    setEditError(null);
  };

  // Remove a dependency
  const handleRemove = (pkgToRemove: string) => {
    const updated: Record<string, string> = {};
    for (const [key, ver] of Object.entries(dependencies)) {
      if (key.toLowerCase() !== pkgToRemove.toLowerCase()) {
        updated[key] = ver;
      }
    }
    onChange(updated);
    if (editingPkg && editingPkg.toLowerCase() === pkgToRemove.toLowerCase()) {
      handleCancelEdit();
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-xl border border-zinc-800 bg-zinc-850">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-semibold text-zinc-100">
            Declared Dependencies
          </label>
          <p className="text-[11px] text-zinc-400">
            NPM packages required for this component. Auto-detected from source code imports.
          </p>
        </div>
      </div>

      {/* 1. Detected from Source */}
      {undeclaredDetected.length > 0 && (
        <div className="p-3 rounded-lg border border-zinc-700 bg-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-200 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Detected from source ({undeclaredDetected.length})</span>
            </span>
            <span className="text-[10px] text-zinc-400">
              Required for publishing
            </span>
          </div>

          <div className="space-y-1.5">
            {undeclaredDetected.map((item) => (
              <div
                key={item.pkgName}
                className="flex items-center justify-between p-2 rounded-md bg-zinc-900 border border-zinc-750 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-zinc-100">
                    {item.pkgName}
                  </span>
                  {item.suggestedVersion ? (
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      Suggested: {item.suggestedVersion}
                    </span>
                  ) : (
                    <span className="text-[11px] text-zinc-500 italic">
                      Version required
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleAddDetected(item.pkgName, item.suggestedVersion)}
                  disabled={disabled}
                  className="px-2.5 py-1 rounded bg-blue-200 hover:bg-blue-100 text-zinc-900 font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Suggested Library Packages (Quick Add) */}
      {availableQuickSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-zinc-500 text-[11px]">Suggested:</span>
          {availableQuickSuggestions.map((s) => (
            <button
              key={s.pkg}
              type="button"
              onClick={() => handleAddDetected(s.pkg, s.ver)}
              disabled={disabled}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>+</span>
              <span>{s.pkg}</span>
              <span className="text-zinc-400 text-[10px]">{s.ver}</span>
            </button>
          ))}
        </div>
      )}

      {/* 3. Declared Dependencies List */}
      <div className="space-y-2">
        <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
          Declared ({Object.keys(dependencies).length})
        </span>

        <div className="min-h-12 p-2 rounded-lg border border-zinc-800 bg-zinc-900 space-y-1.5">
          {Object.keys(dependencies).length === 0 ? (
            <div className="text-center py-3 text-xs text-zinc-500 italic">
              No dependencies declared yet.
            </div>
          ) : (
            Object.entries(dependencies).map(([pkg, ver]) => {
              const isEditing = editingPkg === pkg;
              const isImported = importedSet.has(pkg.toLowerCase());

              return (
                <div
                  key={pkg}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-md bg-zinc-800 border border-zinc-750 text-xs"
                >
                  {isEditing ? (
                    /* Inline Edit Mode */
                    <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <span className="font-mono font-medium text-zinc-100 px-2 py-1 bg-zinc-750 rounded">
                        {pkg}
                      </span>
                      <input
                        type="text"
                        value={editingVersion}
                        onChange={(e) => setEditingVersion(e.target.value)}
                        placeholder="Version (e.g. ^0.475.0)"
                        className="flex-1 px-2.5 py-1 rounded border border-blue-200 bg-zinc-900 font-mono text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-200"
                        autoFocus
                      />
                      <div className="flex items-center gap-1 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(pkg)}
                          className="px-2.5 py-1 rounded bg-blue-200 hover:bg-blue-100 text-zinc-900 font-medium text-xs cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-2.5 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Normal Display Mode */
                    <>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-medium text-zinc-100">
                          {pkg}
                        </span>
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-950/60 text-blue-200 border border-blue-800/60">
                          {ver}
                        </span>
                        {isImported ? (
                          <span className="text-[10px] text-green-300 font-medium">
                            ✓ Imported in source
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-500 italic">
                            (Optional / configuration)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(pkg, ver)}
                          disabled={disabled}
                          className="px-2 py-0.5 rounded text-[11px] font-medium text-zinc-400 hover:text-blue-200 hover:bg-zinc-750 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <span className="text-zinc-700">|</span>
                        <button
                          type="button"
                          onClick={() => handleRemove(pkg)}
                          disabled={disabled}
                          className="px-2 py-0.5 rounded text-[11px] font-medium text-zinc-400 hover:text-rose-400 hover:bg-zinc-750 transition-colors cursor-pointer disabled:opacity-50"
                          aria-label={`Remove ${pkg}`}
                        >
                          Remove
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {editError && <p className="text-[11px] text-rose-400 font-medium">{editError}</p>}

      {/* 4. Add New Package Manually */}
      <div className="pt-2 border-t border-zinc-800 space-y-2">
        <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
          Add Dependency Manually
        </span>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={newPkg}
              onChange={(e) => {
                setNewPkg(e.target.value);
                const normalized = normalizePackageName(e.target.value);
                if (KNOWN_LIBRARY_VERSIONS[normalized] && !newVersion) {
                  setNewVersion(KNOWN_LIBRARY_VERSIONS[normalized]);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddManual();
                }
              }}
              placeholder="Package (e.g. framer-motion, @radix-ui/react-dialog)"
              disabled={disabled}
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 disabled:opacity-50"
            />
          </div>
          <div className="w-full sm:w-36">
            <input
              type="text"
              value={newVersion}
              onChange={(e) => setNewVersion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddManual();
                }
              }}
              placeholder="Version (e.g. ^12.0.0)"
              disabled={disabled}
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 disabled:opacity-50"
            />
          </div>
          <button
            type="button"
            onClick={() => handleAddManual()}
            disabled={disabled || !newPkg.trim()}
            className="px-4 py-1.5 rounded-lg bg-blue-200 hover:bg-blue-100 text-zinc-900 font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            Add Dependency
          </button>
        </div>
      </div>

      {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
    </div>
  );
};

