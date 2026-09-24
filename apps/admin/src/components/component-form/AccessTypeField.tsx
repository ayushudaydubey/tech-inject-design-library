import React from "react";
import { ComponentAccessType } from "../../types/component";

export interface AccessTypeFieldProps {
  value: ComponentAccessType;
  onChange: (value: ComponentAccessType) => void;
  disabled?: boolean;
}

export const AccessTypeField: React.FC<AccessTypeFieldProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
        Access Tier
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Free Option */}
        <label
          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
            value === "free"
              ? "border-blue-500 bg-blue-50/40 dark:bg-blue-950/20"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input
            type="radio"
            name="accessType"
            value="free"
            checked={value === "free"}
            onChange={() => onChange("free")}
            disabled={disabled}
            className="mt-0.5 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Free Community Component</span>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                Open
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Available to all visitors without requiring authentication.
            </p>
          </div>
        </label>

        {/* Premium Option */}
        <label
          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
            value === "premium"
              ? "border-amber-500 bg-amber-50/40 dark:bg-amber-950/20"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input
            type="radio"
            name="accessType"
            value="premium"
            checked={value === "premium"}
            onChange={() => onChange("premium")}
            disabled={disabled}
            className="mt-0.5 text-amber-600 focus:ring-amber-500"
          />
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Premium Protected Component</span>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Guarded by server authentication; requires active customer premium status.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};
