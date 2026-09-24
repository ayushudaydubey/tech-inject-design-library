"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLogout } from "../../hooks/useAuth";

export interface LogoutButtonProps {
  className?: string;
  variant?: "default" | "minimal";
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  className = "",
  variant = "default",
}) => {
  const router = useRouter();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push("/login");
      router.refresh();
    } catch {
      // Even if network fails, token was cleared in onError/finally
      router.push("/login");
    }
  };

  if (variant === "minimal") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
        className={`text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline disabled:opacity-50 transition-colors ${className}`}
      >
        {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg border border-rose-200 dark:border-rose-900/50 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50 ${className}`}
    >
      <svg
        className={`w-4 h-4 ${logoutMutation.isPending ? "animate-spin" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      <span>{logoutMutation.isPending ? "Signing out..." : "Sign Out"}</span>
    </button>
  );
};
