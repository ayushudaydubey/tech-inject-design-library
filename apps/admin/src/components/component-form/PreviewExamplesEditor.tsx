"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";

export interface PreviewExampleItem {
  name: string;
  description?: string;
  props: Record<string, unknown>;
}

export interface PreviewExamplesEditorProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export const PreviewExamplesEditor: React.FC<PreviewExamplesEditorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [editorMode, setEditorMode] = useState<"visual" | "raw">("visual");
  const [parseError, setParseError] = useState<string | null>(null);

  // Parse examples from the string value
  const parsedExamples = useMemo<PreviewExampleItem[]>(() => {
    if (!value || !value.trim()) {
      return [{ name: "Default", props: {} }];
    }
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed.examples) && parsed.examples.length > 0) {
        return parsed.examples.map((ex: unknown, i: number) => {
          if (typeof ex === "object" && ex !== null) {
            const e = ex as Record<string, unknown>;
            return {
              name: String(e.name || `Example ${i + 1}`),
              description: e.description ? String(e.description) : undefined,
              props: typeof e.props === "object" && e.props !== null ? (e.props as Record<string, unknown>) : {},
            };
          }
          return { name: `Example ${i + 1}`, props: {} };
        });
      }
      if (Array.isArray(parsed.variants) && parsed.variants.length > 0) {
        return parsed.variants.map((v: unknown, i: number) => {
          if (typeof v === "object" && v !== null) {
            const e = v as Record<string, unknown>;
            return {
              name: String(e.name || `Variant ${i + 1}`),
              description: e.description ? String(e.description) : undefined,
              props: typeof e.props === "object" && e.props !== null ? (e.props as Record<string, unknown>) : {},
            };
          }
          return { name: `Variant ${i + 1}`, props: {} };
        });
      }
      // Single object fallback
      if (typeof parsed === "object" && parsed !== null) {
        return [{ name: "Default", props: parsed as Record<string, unknown> }];
      }
      return [{ name: "Default", props: {} }];
    } catch {
      return [{ name: "Default", props: {} }];
    }
  }, [value]);

  const [examplesList, setExamplesList] = useState<PreviewExampleItem[]>(parsedExamples);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Keep local list in sync when external value changes
  useEffect(() => {
    setExamplesList(parsedExamples);
  }, [parsedExamples]);

  // Synchronize visual state to parent JSON string
  const syncToParent = useCallback(
    (newList: PreviewExampleItem[]) => {
      setExamplesList(newList);
      const dataToSave = {
        examples: newList.map((item) => ({
          name: item.name.trim() || "Example",
          ...(item.description ? { description: item.description.trim() } : {}),
          props: item.props || {},
        })),
      };
      onChange(JSON.stringify(dataToSave, null, 2));
      setParseError(null);
    },
    [onChange]
  );

  const handleAddExample = () => {
    const nextIdx = examplesList.length + 1;
    const baseProps = examplesList.length > 0 ? { ...examplesList[0].props } : {};
    const updated = [
      ...examplesList,
      {
        name: `Example ${nextIdx}`,
        description: "",
        props: baseProps,
      },
    ];
    syncToParent(updated);
    setExpandedIndex(updated.length - 1);
  };

  const handleRemoveExample = (idx: number) => {
    if (examplesList.length <= 1) return;
    const updated = examplesList.filter((_, i) => i !== idx);
    syncToParent(updated);
    if (expandedIndex === idx) {
      setExpandedIndex(Math.max(0, idx - 1));
    } else if (expandedIndex !== null && expandedIndex > idx) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const handleUpdateName = (idx: number, newName: string) => {
    const updated = [...examplesList];
    updated[idx] = { ...updated[idx], name: newName };
    syncToParent(updated);
  };

  const handleUpdateDescription = (idx: number, newDesc: string) => {
    const updated = [...examplesList];
    updated[idx] = { ...updated[idx], description: newDesc };
    syncToParent(updated);
  };

  const handleUpdatePropsJson = (idx: number, rawPropsText: string) => {
    try {
      const parsed = JSON.parse(rawPropsText || "{}");
      if (typeof parsed === "object" && parsed !== null) {
        const updated = [...examplesList];
        updated[idx] = { ...updated[idx], props: parsed as Record<string, unknown> };
        syncToParent(updated);
        setParseError(null);
      }
    } catch (err: unknown) {
      setParseError(`Example ${idx + 1} has invalid JSON props: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleFormatRawJson = () => {
    try {
      const parsed = JSON.parse(value || "{}");
      onChange(JSON.stringify(parsed, null, 2));
      setParseError(null);
    } catch (err: unknown) {
      setParseError(`Cannot format: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header with visual / raw toggle */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-semibold text-zinc-200">
            Preview Examples & Fixture Data
          </label>
          <span className="text-[11px] text-zinc-400">
            Configure multiple states/variants (e.g. Primary, Secondary, Loading, Disabled)
          </span>
        </div>

        <div className="flex items-center bg-zinc-800 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setEditorMode("visual")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              editorMode === "visual"
                ? "bg-zinc-700 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Examples Builder ({examplesList.length})
          </button>
          <button
            type="button"
            onClick={() => setEditorMode("raw")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              editorMode === "raw"
                ? "bg-zinc-700 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Raw JSON
          </button>
        </div>
      </div>

      {parseError && (
        <div className="p-2.5 rounded-md bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
          ⚠️ {parseError}
        </div>
      )}

      {editorMode === "visual" ? (
        <div className="space-y-2.5">
          {/* Examples list */}
          <div className="space-y-2">
            {examplesList.map((example, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-lg border border-zinc-700/80 bg-zinc-900/90 overflow-hidden text-xs"
                >
                  <div
                    className="flex items-center justify-between px-3 py-2 bg-zinc-800/80 cursor-pointer select-none"
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 flex items-center justify-center font-mono text-[10px] font-semibold">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-zinc-200">
                        {example.name || `Example ${idx + 1}`}
                      </span>
                      {example.description && (
                        <span className="text-[11px] text-zinc-400 truncate max-w-xs">
                          — {example.description}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {examplesList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExample(idx)}
                          disabled={disabled}
                          title="Remove this preview example"
                          className="px-2 py-0.5 rounded text-[11px] text-rose-400 hover:text-rose-200 hover:bg-rose-900/40 border border-transparent hover:border-rose-700/50 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                        className="text-zinc-400 hover:text-zinc-200 px-1.5 py-0.5"
                      >
                        {isExpanded ? "▲" : "▼"}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-3 space-y-3 bg-zinc-900">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                            Example / State Name
                          </label>
                          <input
                            type="text"
                            value={example.name}
                            onChange={(e) => handleUpdateName(idx, e.target.value)}
                            disabled={disabled}
                            placeholder="e.g. Primary, Secondary, Outline, Disabled"
                            className="w-full px-2.5 py-1.5 rounded border border-zinc-700 bg-zinc-950 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                            Description (Optional)
                          </label>
                          <input
                            type="text"
                            value={example.description || ""}
                            onChange={(e) => handleUpdateDescription(idx, e.target.value)}
                            disabled={disabled}
                            placeholder="e.g. Standard emphasis button for calls to action"
                            className="w-full px-2.5 py-1.5 rounded border border-zinc-700 bg-zinc-950 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-medium text-zinc-300">
                            Props JSON
                          </label>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            Must be valid JSON object
                          </span>
                        </div>
                        <textarea
                          rows={4}
                          defaultValue={JSON.stringify(example.props, null, 2)}
                          onBlur={(e) => handleUpdatePropsJson(idx, e.target.value)}
                          disabled={disabled}
                          placeholder={`{\n  "variant": "primary",\n  "children": "Click me"\n}`}
                          className="w-full px-2.5 py-2 rounded border border-zinc-700 bg-zinc-950 text-xs font-mono text-blue-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAddExample}
            disabled={disabled}
            className="w-full py-2 px-3 rounded-lg border border-dashed border-zinc-700 hover:border-indigo-500/80 bg-zinc-800/40 hover:bg-indigo-950/20 text-xs font-medium text-indigo-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>+ Add Preview Example / State</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400">
              Raw JSON (supports single props object or {"{ \"examples\": [ ... ] }"})
            </span>
            <button
              type="button"
              onClick={handleFormatRawJson}
              disabled={disabled}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium underline"
            >
              Format JSON
            </button>
          </div>
          <textarea
            rows={7}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              try {
                JSON.parse(e.target.value);
                setParseError(null);
              } catch (err: unknown) {
                setParseError(err instanceof Error ? err.message : String(err));
              }
            }}
            placeholder={`{\n  "examples": [\n    {\n      "name": "Primary",\n      "props": { "variant": "primary", "children": "Button" }\n    }\n  ]\n}`}
            disabled={disabled}
            className="w-full px-3 py-2 rounded-md border border-zinc-700 bg-zinc-950 text-xs font-mono text-blue-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 leading-relaxed"
          />
        </div>
      )}
    </div>
  );
};
