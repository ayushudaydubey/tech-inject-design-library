import React from "react";
import Link from "next/link";
import { CopyButton } from "../../components/common/CopyButton";

export default function GetStartedPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Page Header */}
      <div className="space-y-3 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          Developer Guide
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Getting Started with Tech Inject UI
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Learn how to integrate reusable components into your Next.js and React applications using the CLI, source copy, or AI coding agents.
        </p>
      </div>

      {/* Step 1: Browse Catalogue */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
            1
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Browse and Select Components
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 pl-11">
          Explore the dynamically updated catalogue of components. Filter by category (e.g. Analytics, CRM Pipeline) or access tier (Free vs. Premium).
        </p>
        <div className="pl-11">
          <Link
            href="/components"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
          >
            <span>Explore Components</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Step 2: Install via CLI */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
            2
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Install Using the CLI
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 pl-11">
          Add component source files directly into your project using the official package runner command:
        </p>
        <div className="pl-11 space-y-3">
          {/* Free component command */}
          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-100 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 select-none">$</span>
              <span>npx tech-inject add sales-metric-card</span>
            </div>
            <CopyButton text="npx tech-inject add sales-metric-card" size="sm" variant="dark" />
          </div>

          {/* Premium component command */}
          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-100 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 select-none">$</span>
              <span>npx tech-inject add pipeline-kanban-board --auth</span>
            </div>
            <CopyButton text="npx tech-inject add pipeline-kanban-board --auth" size="sm" variant="dark" />
          </div>
        </div>
      </section>

      {/* Step 3: Copy Source Code */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
            3
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Manual Copy & Paste
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 pl-11">
          Prefer zero tooling? Every component page includes full copyable TypeScript source code, supporting types, and theme CSS files. Simply click the &ldquo;Copy Source&rdquo; button and paste it into your <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">src/components</code> directory.
        </p>
      </section>

      {/* Step 4: AI Coding Agent Integration */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
            4
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Automate with AI Coding Agents
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 pl-11">
          Developing with Cursor, Claude Code, GitHub Copilot, or Antigravity? Each component provides a structured integration prompt containing props interfaces, dependencies, and wiring instructions.
        </p>
        <div className="pl-11">
          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-300 space-y-2">
            <div className="text-purple-400 font-bold">Example AI Agent Prompt:</div>
            <p className="text-slate-400 whitespace-pre-wrap leading-relaxed">
              &quot;Add the SalesMetricCard component to your React project. Install dependencies: lucide-react, clsx. Follow the component props and theme definitions.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* Step 5: Customer Authentication */}
      <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Customer Authentication & Premium Tiers
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Premium components require an active customer membership. You can sign in using your customer credentials. Pre-seeded testing accounts are provided on the login page for instant testing.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Go to Sign In
          </Link>
          <Link
            href="/account"
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Check Account Status
          </Link>
        </div>
      </section>
    </div>
  );
}
