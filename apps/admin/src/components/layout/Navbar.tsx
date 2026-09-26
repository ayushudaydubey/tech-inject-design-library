"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminSession, useAdminLogout } from "../../hooks/useAdminAuth";
import { BrandLogo } from "../common/BrandLogo";

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
    <header className="sticky top-0 z-40 h-15 w-full border-b border-zinc-800/70 bg-zinc-950/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-[0_4px_24px_-4px_rgba(0,0,0,0.6)] transition-colors">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation Sidebar"
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors focus:outline-hidden"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <BrandLogo size="md" badgeText="Console" href="/dashboard" />
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Public Catalogue Link */}
        <a
          href={process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 transition-all shadow-xs"
        >
          <span>Public Catalogue</span>
          <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>

        {/* Admin User Info & Logout */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-zinc-800/80">
            <div className="hidden md:block text-right">
              <div className="text-xs font-semibold text-zinc-200 flex items-center justify-end gap-1.5">
                <span>{user.name}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <div className="text-[10px] font-mono text-zinc-400">{user.email}</div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg border border-rose-500/20 transition-all disabled:opacity-50 shadow-xs"
            >
              {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
