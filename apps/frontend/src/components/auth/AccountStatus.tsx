"use client";

import React from "react";
import Link from "next/link";
import { useCurrentUser } from "../../hooks/useAuth";
import { LogoutButton } from "./LogoutButton";
import { formatDate } from "../../lib/utils";

export interface AccountStatusProps {
  className?: string;
  showLogout?: boolean;
}

export const AccountStatus: React.FC<AccountStatusProps> = ({
  className = "",
  showLogout = true,
}) => {
  const { user, isLoading, isPremium, isAuthenticated } = useCurrentUser();

  if (isLoading) {
    return (
      <div className={`p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse ${className}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2">
            <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800/60 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className={`p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center ${className}`}>
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Not Signed In
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Sign in with your customer account to unlock premium components and commands.
        </p>
        <div className="mt-4">
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-lg border border-slate-200 dark:border-slate-700">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {user.name}
              </h2>
              {isPremium ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Premium Member
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Free Tier
                </span>
              )}
              {user.role === "admin" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Admin
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {user.email}
            </p>
          </div>
        </div>

        {showLogout && <LogoutButton />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Access Tier
          </div>
          <div className="mt-1 text-base font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isPremium ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
            {isPremium ? "Premium Access" : "Standard Free"}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isPremium
              ? "Full access to all components, source, and AI prompts."
              : "Can access all free components in the catalogue."}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Account Role
          </div>
          <div className="mt-1 text-base font-semibold text-slate-900 dark:text-white capitalize">
            {user.role}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Customer identifier: {user.id.slice(-8)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Member Since
          </div>
          <div className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
            {formatDate(user.createdAt) || "Active"}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Security authority: Backend live verification
          </p>
        </div>
      </div>
    </div>
  );
};
