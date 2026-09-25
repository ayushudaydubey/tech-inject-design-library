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
    <header className="sticky top-0 z-30 h-14 w-full border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation Sidebar"
            className="md:hidden p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 font-semibold text-zinc-100"
        >
          <div className="w-7 h-7 rounded-md bg-zinc-800 text-zinc-100 border border-zinc-700 flex items-center justify-center font-bold text-xs">
            TI
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-100">
            {adminConfig.name}
          </span>
          <span className="text-[10px] uppercase font-medium text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
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
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-normal text-zinc-400 hover:text-blue-200 transition-colors"
        >
          <span>View Public Catalogue</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>

        {/* Admin User Info & Logout */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-zinc-800">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-medium text-zinc-200">
                {user.name}
              </div>
              <div className="text-[10px] text-zinc-400">{user.email}</div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="px-2.5 py-1 text-xs font-medium text-red-300 hover:bg-red-950/30 rounded-md border border-red-500/20 transition-colors disabled:opacity-50"
            >
              {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
