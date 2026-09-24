"use client";

import React, { useState } from "react";
import { copyToClipboard } from "../../lib/utils";

export interface CopyCodeButtonProps {
  code: string;
  filename?: string;
  className?: string;
}

export const CopyCodeButton: React.FC<CopyCodeButtonProps> = ({
  code,
  filename,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!code) return;
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!code}
      aria-label={
        copied
          ? `Copied ${filename || "code"} to clipboard`
          : `Copy ${filename || "source code"} to clipboard`
      }
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
        copied
          ? "bg-emerald-600 text-white"
          : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white"
      } ${className}`}
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 animate-in zoom-in-50 duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>Copied Source!</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Copy Source</span>
        </>
      )}
    </button>
  );
};
