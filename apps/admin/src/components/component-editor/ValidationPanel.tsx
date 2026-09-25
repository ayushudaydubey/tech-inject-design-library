"use client";

import React from "react";
import { ValidationResult, DetailedValidationError } from "./types";
import { UndeclaredDependency } from "./dependencyAnalyzer";

export interface ValidationPanelProps {
  result: ValidationResult | null;
  isValidating?: boolean;
  onRunValidation: () => void;
  undeclaredDependencies?: UndeclaredDependency[];
  onNavigateToError?: (filename: string, line?: number) => void;
  className?: string;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  result,
  isValidating = false,
  onRunValidation,
  undeclaredDependencies = [],
  onNavigateToError,
  className = "",
}) => {
  return (
    <div
      className={`rounded-xl border border-zinc-800 bg-zinc-850 p-6 space-y-5 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <span>Publishing Readiness & Code Validation</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Validates syntax, file paths, security constraints, and external dependencies.
          </p>
        </div>

        <button
          type="button"
          onClick={onRunValidation}
          disabled={isValidating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-200 hover:bg-blue-100 text-zinc-900 font-medium text-xs transition-colors disabled:opacity-50 self-start sm:self-auto cursor-pointer"
        >
          {isValidating ? (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span>{isValidating ? "Validating Source..." : "Run Validation"}</span>
        </button>
      </div>

      {/* Real-time undeclared dependencies warning */}
      {undeclaredDependencies.length > 0 && (
        <div className="p-3.5 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-medium text-blue-200">
            <svg className="w-4 h-4 shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Undeclared Imported Dependencies Detected ({undeclaredDependencies.length})</span>
          </div>
          <div className="space-y-1 pl-5">
            {undeclaredDependencies.map((dep, idx) => (
              <div
                key={idx}
                onClick={() => onNavigateToError?.(dep.file, dep.line)}
                className="hover:underline hover:text-blue-200 cursor-pointer flex items-center gap-2 font-mono text-[11px]"
              >
                <span>&bull;</span>
                <span>
                  Dependency <strong className="text-zinc-100">&ldquo;{dep.pkgName}&rdquo;</strong> is imported in {dep.file} (Line {dep.line}) but not declared.
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation status overview */}
      {!result && !isValidating && (
        <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 text-center space-y-1">
          <p className="font-medium text-zinc-300">
            Validation checks have not been run yet.
          </p>
          <p className="text-[11px] text-zinc-500">
            Click &ldquo;Run Validation&rdquo; above to verify code integrity, file extensions, dependencies, and publishing requirements.
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Header banner */}
          <div
            className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
              result.isValid
                ? "bg-zinc-900 border-green-800/60 text-green-300"
                : "bg-zinc-900 border-rose-800/60 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2.5 font-medium text-sm">
              {result.isValid ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-green-400 text-zinc-900 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Validation Passed &mdash; Ready to Publish</span>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span>
                    Validation Failed &mdash; {result.errors.length} issue{result.errors.length === 1 ? "" : "s"} found
                  </span>
                </>
              )}
            </div>

            <span className="text-[11px] font-mono opacity-80">
              {result.isValid ? "100% compliant" : "Action required"}
            </span>
          </div>

          {/* Validation Checks Checklist */}
          {result.checks && result.checks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {result.checks.map((check, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border flex items-center gap-2 font-mono text-[11px] ${
                    check.passed
                      ? "border-zinc-800 bg-zinc-900 text-green-300"
                      : "border-zinc-800 bg-zinc-900 text-rose-300"
                  }`}
                >
                  {check.passed ? (
                    <span className="text-green-400 font-bold">✓</span>
                  ) : (
                    <span className="text-rose-400 font-bold">✕</span>
                  )}
                  <div className="truncate">
                    <span className="font-medium text-zinc-200">{check.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Detailed Error Cards */}
          {!result.isValid && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Detailed Diagnostic Messages
              </h4>
              <div className="space-y-1.5">
                {(result.detailedErrors && result.detailedErrors.length > 0
                  ? result.detailedErrors
                  : result.errors.map((msg) => ({ message: msg }))
                ).map((err: DetailedValidationError, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (err.file) {
                        onNavigateToError?.(err.file, err.line);
                      }
                    }}
                    className={`p-3 rounded-xl border border-zinc-800 bg-zinc-900 text-xs transition-colors ${
                      err.file
                        ? "cursor-pointer hover:bg-zinc-800/80 hover:border-zinc-700"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        {err.file && (
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium text-rose-400">
                              {err.file}
                            </span>
                            {err.line !== undefined && (
                              <span className="font-mono text-[10px] bg-zinc-800 border border-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded">
                                Line {err.line}
                                {err.column ? `, Col ${err.column}` : ""}
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-zinc-300 font-mono text-[11px] leading-relaxed">
                          {err.message}
                        </p>
                      </div>

                      {err.file && (
                        <span className="text-[10px] text-blue-200 hover:underline font-sans font-medium shrink-0">
                          Jump to code &rarr;
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
