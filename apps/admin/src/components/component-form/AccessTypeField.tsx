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
      <label className="block text-xs font-medium text-zinc-300">
        Access Tier
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Free Option */}
        <label
          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
            value === "free"
              ? "border-blue-200/40 bg-zinc-800 ring-1 ring-blue-200/20"
              : "border-zinc-800 bg-zinc-850/60 hover:bg-zinc-800/80 hover:border-zinc-700"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input
            type="radio"
            name="accessType"
            value="free"
            checked={value === "free"}
            onChange={() => onChange("free")}
            disabled={disabled}
            className="mt-0.5 text-zinc-100 focus:ring-blue-200"
          />
          <div>
            <div className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
              <span>Free Community Component</span>
              <span className="text-[10px] font-medium text-green-300 bg-green-950/60 px-1.5 py-0.2 rounded border border-green-800/60">
                Open
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Available to all visitors without requiring authentication.
            </p>
          </div>
        </label>

        {/* Premium Option */}
        <label
          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
            value === "premium"
              ? "border-blue-200/40 bg-zinc-800 ring-1 ring-blue-200/20"
              : "border-zinc-800 bg-zinc-850/60 hover:bg-zinc-800/80 hover:border-zinc-700"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input
            type="radio"
            name="accessType"
            value="premium"
            checked={value === "premium"}
            onChange={() => onChange("premium")}
            disabled={disabled}
            className="mt-0.5 text-zinc-100 focus:ring-blue-200"
          />
          <div>
            <div className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
              <span>Premium Protected Component</span>
              <span className="text-[10px] font-medium text-blue-200 bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-800/60">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Guarded by server authentication; requires active customer premium status.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};
