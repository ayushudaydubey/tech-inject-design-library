"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminLogin } from "../../hooks/useAdminAuth";
import { ApiError } from "../../lib/api";

export interface AdminLoginFormProps {
  className?: string;
  onSuccess?: () => void;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({
  className = "",
  onSuccess,
}) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useAdminLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter the administrator email.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your administrator password.");
      return;
    }

    try {
      await loginMutation.mutateAsync({
        email: trimmedEmail,
        password,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setErrorMessage("Invalid administrator email or password.");
        } else if (err.status === 403) {
          setErrorMessage("Forbidden: This account does not possess administrator privileges.");
        } else {
          setErrorMessage(err.message || "Failed to sign in. Please try again.");
        }
      } else {
        setErrorMessage("An unexpected network error occurred. Please try again.");
      }
    }
  };

  const handleFillAdminCredentials = () => {
    setEmail("admin@techinject.io");
    setPassword("AdminPassword123!");
    setErrorMessage(null);
  };

  return (
    <div
      className={`rounded-2xl border border-zinc-800 bg-zinc-950 p-7 shadow-xl ${className}`}
    >
      <div className="mb-6 text-center">
        <div className="w-10 h-10 mx-auto rounded-xl bg-zinc-900 border border-zinc-800 text-blue-200 flex items-center justify-center font-bold text-sm mb-3 shadow-xs">
          TI
        </div>
        <h2 className="text-lg font-semibold text-zinc-100">
          Admin Console Sign In
        </h2>
        <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
          Enter verified administrator credentials to access the design library drafting and customer management console.
        </p>
      </div>

      {errorMessage && (
        <div
          className="mb-5 p-3 rounded-lg border border-red-500/30 bg-red-950/20 text-red-300 text-xs flex items-start gap-2.5"
          role="alert"
        >
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="admin-email"
            className="block text-xs font-medium text-zinc-300 mb-1.5"
          >
            Admin Email Address
          </label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="admin@techinject.io"
            disabled={loginMutation.isPending}
            className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-200/60 focus:border-zinc-600 text-xs transition-colors disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="admin-password"
            className="block text-xs font-medium text-zinc-300 mb-1.5"
          >
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••••••"
            disabled={loginMutation.isPending}
            className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-200/60 focus:border-zinc-600 text-xs transition-colors disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full mt-2 py-2.5 px-4 rounded-lg bg-blue-200 hover:bg-blue-100 text-zinc-950 font-semibold text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-blue-200/60 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
        >
          {loginMutation.isPending ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Verifying Admin Session...</span>
            </>
          ) : (
            <span>Sign In to Admin Console</span>
          )}
        </button>
      </form>

      {/* Pre-seeded Admin Shortcut */}
      <div className="mt-6 pt-5 border-t border-zinc-800/80">
        <button
          type="button"
          onClick={handleFillAdminCredentials}
          className="w-full p-3 rounded-lg border border-zinc-800 bg-zinc-900/70 hover:bg-zinc-900 hover:border-zinc-700 text-left transition-colors flex items-center justify-between group"
        >
          <div>
            <div className="text-xs font-medium text-zinc-200 group-hover:text-blue-200 transition-colors">
              Auto-Fill Seeded Admin
            </div>
            <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
              admin@techinject.io
            </div>
          </div>
          <span className="text-[11px] font-medium text-blue-200 bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-md group-hover:border-zinc-700 transition-colors">
            Fill
          </span>
        </button>
      </div>
    </div>
  );
};
