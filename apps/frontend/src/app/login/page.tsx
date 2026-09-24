"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "../../components/auth/LoginForm";
import { useCurrentUser } from "../../hooks/useAuth";

function LoginContent() {
  const { isAuthenticated, user } = useCurrentUser();

  if (isAuthenticated && user) {
    return (
      <div className="max-w-md mx-auto p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Already Signed In
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          You are currently signed in as <span className="font-semibold">{user.email}</span> ({user.isPremium ? "Premium Member" : "Free Customer"}).
        </p>
        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/components"
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            Browse Catalogue
          </Link>
          <Link
            href="/account"
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors"
          >
            View Account
          </Link>
        </div>
      </div>
    );
  }

  return <LoginForm className="max-w-md mx-auto" />;
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse text-center">
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded mx-auto mb-4" />
              <div className="h-10 w-full bg-slate-100 dark:bg-slate-800 rounded mb-3" />
              <div className="h-10 w-full bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
          }
        >
          <LoginContent />
        </Suspense>
      </div>
    </div>
  );
}
