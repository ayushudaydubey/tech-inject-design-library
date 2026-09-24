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
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Publishing Readiness Validation</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verifies required metadata, source code presence, and dependency integrity.
          </p>
        </div>

        {onValidate && (
          <button
            type="button"
            onClick={onValidate}
            disabled={isValidating}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50"
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
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 text-center">
          Click &ldquo;Run Validation&rdquo; to test readiness before publishing to the public catalogue.
        </div>
      )}

      {result && (
        <div
          className={`p-4 rounded-xl border text-xs space-y-3 ${
            result.isValid
              ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {result.isValid ? (
              <>
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Validation Passed &mdash; Ready to Publish</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Validation Failed ({result.errors.length} error{result.errors.length === 1 ? "" : "s"})</span>
              </>
            )}
          </div>

          {result.isValid ? (
            <ul className="space-y-1.5 text-xs text-emerald-700 dark:text-emerald-300 pl-7 list-disc">
              <li>Component metadata and slug verified</li>
              <li>At least one valid source file attached</li>
              <li>Dependencies structure conforms to package specification</li>
              <li>Ready for deployment to public catalogue</li>
            </ul>
          ) : (
            <div className="space-y-1 pl-7">
              <p className="font-semibold text-rose-700 dark:text-rose-300">
                Fix the following issues before publishing:
              </p>
              <ul className="space-y-1 text-xs text-rose-600 dark:text-rose-400 list-disc pl-4">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
