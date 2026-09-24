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
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm ${className}`}
    >
      <div className="mb-6 text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-lg mb-3 shadow-sm">
          TI
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Admin Console Sign In
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Enter verified administrator credentials to access the design library drafting and customer management console.
        </p>
      </div>

      {errorMessage && (
        <div
          className="mb-5 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5"
          role="alert"
        >
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="admin-email"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
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
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 text-xs"
          />
        </div>

        <div>
          <label
            htmlFor="admin-password"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
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
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full mt-2 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-semibold text-xs shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white disabled:opacity-50 flex items-center justify-center gap-2"
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
      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={handleFillAdminCredentials}
          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Auto-Fill Seeded Admin
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              admin@techinject.io
            </div>
          </div>
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
            Fill
          </span>
        </button>
      </div>
    </div>
  );
};
