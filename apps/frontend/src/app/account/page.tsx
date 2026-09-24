"use client";

import React from "react";
import Link from "next/link";
import { AccountStatus } from "../../components/auth/AccountStatus";

export default function AccountPage() {

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 flex-1">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Customer Account & Security
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your session, view current access tier, and verify developer permissions.
        </p>
      </div>

      {/* Main Account Status Card */}
      <AccountStatus />

      {/* Access Permissions Summary */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Access Permissions Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-2.5 pr-4">Feature</th>
                <th className="py-2.5 px-4">Free Tier</th>
                <th className="py-2.5 pl-4">Premium Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="py-2.5 pr-4 font-medium">Public Catalogue Discovery</td>
                <td className="py-2.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold">&#10003; Granted</td>
                <td className="py-2.5 pl-4 text-emerald-600 dark:text-emerald-400 font-bold">&#10003; Granted</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-medium">Free Component Source & Install</td>
                <td className="py-2.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold">&#10003; Granted</td>
                <td className="py-2.5 pl-4 text-emerald-600 dark:text-emerald-400 font-bold">&#10003; Granted</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-medium">Premium CRM Kanban & Pipelines</td>
                <td className="py-2.5 px-4 text-rose-500 font-semibold">&#10007; Locked</td>
                <td className="py-2.5 pl-4 text-emerald-600 dark:text-emerald-400 font-bold">&#10003; Unlocked</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-medium">Authenticated CLI Add (<code className="font-mono">--auth</code>)</td>
                <td className="py-2.5 px-4 text-rose-500 font-semibold">&#10007; Locked</td>
                <td className="py-2.5 pl-4 text-emerald-600 dark:text-emerald-400 font-bold">&#10003; Unlocked</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-medium">Enterprise AI Coding Prompts</td>
                <td className="py-2.5 px-4 text-rose-500 font-semibold">&#10007; Locked</td>
                <td className="py-2.5 pl-4 text-emerald-600 dark:text-emerald-400 font-bold">&#10003; Unlocked</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Useful Links */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-sm">
        <Link
          href="/components"
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          &larr; Return to Components Catalogue
        </Link>
        <Link
          href="/get-started"
          className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          View CLI Setup Guide
        </Link>
      </div>
    </div>
  );
}
