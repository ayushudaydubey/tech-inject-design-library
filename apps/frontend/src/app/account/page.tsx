"use client";

import React from "react";
import Link from "next/link";
import { AccountStatus } from "../../components/auth/AccountStatus";

export default function AccountPage() {

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1">
      {/* Header */}
      <div className="pb-5 border-b border-zinc-800">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          Customer Account & Security
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Manage your session, view current access tier, and verify developer permissions.
        </p>
      </div>

      {/* Main Account Status Card */}
      <AccountStatus />

      {/* Access Permissions Summary */}
      <div className="rounded-lg border border-zinc-700/60 bg-zinc-800 p-5 space-y-3.5">
        <h3 className="text-sm font-semibold text-zinc-100">
          Access Permissions Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-zinc-700/60 text-zinc-400 font-medium text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 pr-4">Feature</th>
                <th className="py-2.5 px-4">Free Tier</th>
                <th className="py-2.5 pl-4">Premium Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700/50 text-zinc-300">
              <tr>
                <td className="py-2.5 pr-4 font-normal text-zinc-200">Public Catalogue Discovery</td>
                <td className="py-2.5 px-4 text-green-300 font-medium">&#10003; Granted</td>
                <td className="py-2.5 pl-4 text-green-300 font-medium">&#10003; Granted</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-normal text-zinc-200">Free Component Source & Install</td>
                <td className="py-2.5 px-4 text-green-300 font-medium">&#10003; Granted</td>
                <td className="py-2.5 pl-4 text-green-300 font-medium">&#10003; Granted</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-normal text-zinc-200">Premium CRM Kanban & Pipelines</td>
                <td className="py-2.5 px-4 text-red-400 font-medium">&#10007; Locked</td>
                <td className="py-2.5 pl-4 text-green-300 font-medium">&#10003; Unlocked</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-normal text-zinc-200">Authenticated CLI Add (<code className="font-mono text-[11px] bg-zinc-900 border border-zinc-700 px-1 py-0.5 rounded text-zinc-300">--auth</code>)</td>
                <td className="py-2.5 px-4 text-red-400 font-medium">&#10007; Locked</td>
                <td className="py-2.5 pl-4 text-green-300 font-medium">&#10003; Unlocked</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-normal text-zinc-200">Enterprise AI Coding Prompts</td>
                <td className="py-2.5 px-4 text-red-400 font-medium">&#10007; Locked</td>
                <td className="py-2.5 pl-4 text-green-300 font-medium">&#10003; Unlocked</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Useful Links */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-zinc-800 text-xs">
        <Link
          href="/components"
          className="text-blue-200 hover:text-blue-100 font-medium"
        >
          &larr; Return to Components Catalogue
        </Link>
        <Link
          href="/get-started"
          className="text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          View CLI Setup Guide
        </Link>
      </div>
    </div>
  );
}
