"use client";

import React from "react";
import Link from "next/link";
import { useCurrentUser } from "../../hooks/useAuth";

export interface PremiumLockProps {
  componentName: string;
  slug?: string;
  message?: string;
  className?: string;
}

export const PremiumLock: React.FC<PremiumLockProps> = ({
  componentName,
  slug,
  message,
  className = "",
}) => {
  const { isAuthenticated, user } = useCurrentUser();

  const redirectUrl = slug ? `/components/${slug}` : "/components";

  return (
    <div
      className={`rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-gradient-to-b from-amber-50/70 to-amber-100/40 dark:from-amber-950/30 dark:to-slate-900 p-8 text-center max-w-xl mx-auto shadow-sm ${className}`}
      role="region"
      aria-label="Premium access locked"
    >
      <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 shadow-xs">
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        Premium Component
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
        {componentName} Requires Premium Access
      </h3>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
        {message ||
          "This component contains production CRM algorithms, multi-stage pipelines, and advanced tokens restricted to verified premium members."}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {!isAuthenticated ? (
          <>
            <Link
              href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              Sign In to Check Access
            </Link>
            <Link
              href="/components"
              className="px-4 py-2.5 rounded-xl font-medium text-sm text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
            >
              Browse Free Components
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/account"
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              View Account Tier ({user?.name})
            </Link>
            <Link
              href="/components"
              className="px-4 py-2.5 rounded-xl font-medium text-sm text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
            >
              Browse Catalogue
            </Link>
          </>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-amber-200/60 dark:border-amber-900/40 text-[11px] text-slate-500 dark:text-slate-400">
        Source code, preview sandboxes, and AI integration prompts are securely enforced by backend access services.
      </div>
    </div>
  );
};
