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
      className={`rounded-lg border border-zinc-700 bg-zinc-800 p-6 sm:p-8 text-center max-w-xl mx-auto ${className}`}
      role="region"
      aria-label="Premium access locked"
    >
      <div className="mx-auto w-12 h-12 rounded-md bg-zinc-700 border border-zinc-600 flex items-center justify-center text-amber-300 mb-4">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>

      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-amber-400/10 text-amber-300 border border-amber-400/20 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Premium Component
      </div>

      <h3 className="text-lg font-semibold text-zinc-100">
        {componentName} Requires Premium Access
      </h3>

      <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
        {message ||
          "This component contains production CRM algorithms, multi-stage pipelines, and advanced tokens restricted to verified premium members."}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {!isAuthenticated ? (
          <>
            <Link
              href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
              className="px-4 py-2 rounded-md font-medium text-xs text-zinc-900 bg-zinc-100 hover:bg-zinc-200 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-200/50"
            >
              Sign In to Check Access
            </Link>
            <Link
              href="/components"
              className="px-4 py-2 rounded-md font-medium text-xs text-zinc-300 bg-zinc-700 hover:bg-zinc-600 border border-zinc-600 transition-colors"
            >
              Browse Free Components
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/account"
              className="px-4 py-2 rounded-md font-medium text-xs text-zinc-900 bg-zinc-100 hover:bg-zinc-200 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-200/50"
            >
              View Account Tier ({user?.name})
            </Link>
            <Link
              href="/components"
              className="px-4 py-2 rounded-md font-medium text-xs text-zinc-300 bg-zinc-700 hover:bg-zinc-600 border border-zinc-600 transition-colors"
            >
              Browse Catalogue
            </Link>
          </>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-700/60 text-[11px] text-zinc-500">
        Source code, preview sandboxes, and AI integration prompts are securely enforced by backend access services.
      </div>
    </div>
  );
};
