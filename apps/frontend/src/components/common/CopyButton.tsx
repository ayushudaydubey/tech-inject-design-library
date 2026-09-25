"use client";

import React, { useState } from "react";
import { copyToClipboard } from "../../lib/utils";

export interface CopyButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  size?: "sm" | "md";
  variant?: "default" | "ghost" | "dark";
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label = "Copy",
  copiedLabel = "Copied!",
  className = "",
  size = "md",
  variant = "default",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sizeClasses =
    size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";

  const variantClasses =
    variant === "ghost"
      ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
      : variant === "dark"
      ? "bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-700"
      : "bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 shadow-sm";

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? copiedLabel : `${label} to clipboard`}
      className={`inline-flex items-center gap-1.5 font-medium rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-blue-200/50 disabled:opacity-50 ${sizeClasses} ${variantClasses} ${className}`}
      disabled={!text}
    >
      {copied ? (
        <>
          <svg
            className="w-4 h-4 text-green-300 animate-in zoom-in-50 duration-150"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-green-300">{copiedLabel}</span>
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
