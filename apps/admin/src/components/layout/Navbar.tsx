"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminSession, useAdminLogout } from "../../hooks/useAdminAuth";
import { adminConfig } from "../../config/admin";

export interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const router = useRouter();
  const { data: user } = useAdminSession();
  const logoutMutation = useAdminLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation Sidebar"
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shadow-xs">
            TI
          </div>
          <span className="text-sm font-semibold tracking-tight">
            {adminConfig.name}
          </span>
          <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/80 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
            Console
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Public Catalogue Link */}
        <a
          href={process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <span>View Public Catalogue</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>

        {/* Admin User Info & Logout */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {user.name}
              </div>
              <div className="text-[10px] text-slate-400">{user.email}</div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900/50 transition-colors disabled:opacity-50"
            >
              {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
