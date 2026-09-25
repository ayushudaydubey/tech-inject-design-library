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
      <div className={`p-6 rounded-lg border border-zinc-700/60 bg-zinc-800 animate-pulse ${className}`}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-zinc-700/60" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-zinc-700/60 rounded" />
            <div className="h-3.5 w-44 bg-zinc-700/40 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className={`p-6 rounded-lg border border-zinc-700/60 bg-zinc-800 text-center ${className}`}>
        <div className="w-10 h-10 mx-auto rounded-full bg-zinc-850 flex items-center justify-center text-zinc-400 mb-3 border border-zinc-700">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-zinc-100">
          Not Signed In
        </h3>
        <p className="mt-1 text-xs text-zinc-400">
          Sign in with your customer account to unlock premium components and commands.
        </p>
        <div className="mt-4">
          <Link
            href="/login"
            className="inline-flex items-center px-3.5 py-1.5 text-xs font-medium text-zinc-900 bg-blue-200 hover:bg-blue-100 rounded-md transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-zinc-700/60 bg-zinc-800 p-5 shadow-xs ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-700/60">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-zinc-750 flex items-center justify-center text-zinc-200 font-semibold text-sm border border-zinc-700">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-100">
                {user.name}
              </h2>
              {isPremium ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-850 text-blue-200 border border-zinc-700">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Premium Member
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-850 text-zinc-400 border border-zinc-700">
                  Free Tier
                </span>
              )}
              {user.role === "admin" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-850 text-zinc-300 border border-zinc-700">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              {user.email}
            </p>
          </div>
        </div>

        {showLogout && <LogoutButton />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-5">
        <div className="p-3.5 rounded-md bg-zinc-850 border border-zinc-700/60">
          <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
            Access Tier
          </div>
          <div className="mt-1 text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isPremium ? "bg-blue-200" : "bg-green-400"
              }`}
            />
            {isPremium ? "Premium Access" : "Standard Free"}
          </div>
          <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
            {isPremium
              ? "Full access to all components, source, and AI prompts."
              : "Can access all free components in the catalogue."}
          </p>
        </div>

        <div className="p-3.5 rounded-md bg-zinc-850 border border-zinc-700/60">
          <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
            Account Role
          </div>
          <div className="mt-1 text-xs font-semibold text-zinc-200 capitalize">
            {user.role}
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">
            Customer identifier: {user.id.slice(-8)}
          </p>
        </div>

        <div className="p-3.5 rounded-md bg-zinc-850 border border-zinc-700/60">
          <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
            Member Since
          </div>
          <div className="mt-1 text-xs font-semibold text-zinc-200">
            {formatDate(user.createdAt) || "Active"}
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">
            Security authority: Backend live verification
          </p>
        </div>
      </div>
    </div>
  );
};
