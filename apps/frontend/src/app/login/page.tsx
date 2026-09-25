"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "../../components/auth/LoginForm";
import { useCurrentUser } from "../../hooks/useAuth";

function LoginContent() {
  const { isAuthenticated, user } = useCurrentUser();

  if (isAuthenticated && user) {
    return (
      <div className="max-w-md mx-auto p-7 rounded-2xl border border-zinc-800 bg-zinc-950 text-center space-y-4 shadow-xl">
        <div className="w-11 h-11 mx-auto rounded-full bg-zinc-900 flex items-center justify-center text-green-400 border border-zinc-800">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-zinc-100">
          Already Signed In
        </h2>
        <p className="text-xs text-zinc-300 leading-relaxed">
          You are currently signed in as <span className="font-semibold text-blue-200">{user.email}</span> ({user.isPremium ? "Premium Member" : "Free Customer"}).
        </p>
        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2.5">
          <Link
            href="/components"
            className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-blue-200 hover:bg-blue-100 rounded-lg transition-colors shadow-sm"
          >
            Browse Catalogue
          </Link>
          <Link
            href="/account"
            className="px-4 py-2 text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors"
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
    <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <div className="p-7 rounded-2xl border border-zinc-800 bg-zinc-950 animate-pulse text-center">
              <div className="h-6 w-32 bg-zinc-800 rounded mx-auto mb-3" />
              <div className="h-9 w-full bg-zinc-850 rounded mb-3" />
              <div className="h-9 w-full bg-zinc-850 rounded" />
            </div>
          }
        >
          <LoginContent />
        </Suspense>
      </div>
    </div>
  );
}
