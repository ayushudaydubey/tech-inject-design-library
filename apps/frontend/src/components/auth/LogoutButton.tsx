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
        className={`text-xs font-medium text-red-300 hover:text-red-200 hover:underline disabled:opacity-50 transition-colors ${className}`}
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
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-300 bg-red-950/20 hover:bg-red-900/30 rounded-md border border-red-500/20 transition-colors focus:outline-none focus:ring-1 focus:ring-red-400/50 disabled:opacity-50 ${className}`}
    >
      <svg
        className={`w-3.5 h-3.5 ${logoutMutation.isPending ? "animate-spin" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      <span>{logoutMutation.isPending ? "Signing out..." : "Sign Out"}</span>
    </button>
  );
};
