import React from "react";
import { ValidationResult as IValidationResult } from "../../types/component";

export interface ValidationResultProps {
  result: IValidationResult | null;
  isValidating?: boolean;
  onValidate?: () => void;
  className?: string;
}

export const ValidationResult: React.FC<ValidationResultProps> = ({
  result,
  isValidating = false,
  onValidate,
  className = "",
}) => {
  return (
    <div
      className={`rounded-xl border border-zinc-800 bg-zinc-850 p-6 space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <span>Publishing Readiness Validation</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Verifies required metadata, source code presence, and dependency integrity.
          </p>
        </div>

        {onValidate && (
          <button
            type="button"
            onClick={onValidate}
            disabled={isValidating}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-200 hover:bg-blue-100 text-zinc-900 font-medium text-xs transition-colors disabled:opacity-50"
          >
            {isValidating && (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            <span>{isValidating ? "Validating..." : "Run Validation"}</span>
          </button>
        )}
      </div>

      {!result && !isValidating && (
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 text-center">
          Click &ldquo;Run Validation&rdquo; to test readiness before publishing to the public catalogue.
        </div>
      )}

      {result && (
        <div
          className={`p-4 rounded-xl border text-xs space-y-3 ${
            result.isValid
              ? "bg-zinc-900 border-green-800/60 text-green-300"
              : "bg-zinc-900 border-rose-800/60 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2 font-medium text-sm">
            {result.isValid ? (
              <>
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Validation Passed &mdash; Ready to Publish</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Validation Failed ({result.errors.length} error{result.errors.length === 1 ? "" : "s"})</span>
              </>
            )}
          </div>

          {result.isValid ? (
            <ul className="space-y-1.5 text-xs text-green-300/90 pl-7 list-disc">
              <li>Component metadata and slug verified</li>
              <li>At least one valid source file attached</li>
              <li>Dependencies structure conforms to package specification</li>
              <li>Ready for deployment to public catalogue</li>
            </ul>
          ) : (
            <div className="space-y-2 pl-7">
              <p className="font-medium text-rose-400">
                Fix the following issues before publishing:
              </p>
              {result.detailedErrors && result.detailedErrors.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {result.detailedErrors.map((err, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-zinc-850 border border-zinc-750 text-zinc-300 text-xs font-mono"
                    >
                      {err.file && (
                        <div className="font-semibold flex items-center gap-2 text-rose-400">
                          <span>{err.file}</span>
                          {err.line && (
                            <span className="text-[10px] bg-zinc-800 border border-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded">
                              Line {err.line}
                              {err.column ? `, Col ${err.column}` : ""}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="mt-0.5 text-[11px] leading-relaxed">{err.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="space-y-1 text-xs text-rose-400 list-disc pl-4 font-mono">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
