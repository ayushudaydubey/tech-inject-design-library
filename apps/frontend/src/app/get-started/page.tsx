import React from "react";
import Link from "next/link";
import { CopyButton } from "../../components/common/CopyButton";

export default function GetStartedPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="space-y-2.5 pb-6 border-b border-zinc-800">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-blue-200 border border-zinc-700">
          Developer Guide
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
          Getting Started with Tech Inject UI
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
          Learn how to integrate reusable components into your Next.js and React applications using the CLI, source copy, or AI coding agents.
        </p>
      </div>

      {/* Step 1: Browse Catalogue */}
      <section className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-zinc-800 text-blue-200 border border-zinc-700 font-medium flex items-center justify-center text-xs">
            1
          </div>
          <h2 className="text-base font-semibold text-zinc-100">
            Browse and Select Components
          </h2>
        </div>
        <p className="text-xs text-zinc-400 pl-8.5 leading-relaxed">
          Explore the dynamically updated catalogue of components. Filter by category (e.g. Analytics, CRM Pipeline) or access tier (Free vs. Premium).
        </p>
        <div className="pl-8.5">
          <Link
            href="/components"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-900 bg-blue-200 hover:bg-blue-100 rounded-md transition-colors"
          >
            <span>Explore Components</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Step 2: Install via CLI */}
      <section className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-zinc-800 text-blue-200 border border-zinc-700 font-medium flex items-center justify-center text-xs">
            2
          </div>
          <h2 className="text-base font-semibold text-zinc-100">
            Install Using the CLI
          </h2>
        </div>
        <p className="text-xs text-zinc-400 pl-8.5 leading-relaxed">
          Add component source files directly into your project using the official package runner command:
        </p>
        <div className="pl-8.5 space-y-2.5">
          {/* Free component command */}
          <div className="rounded-md bg-zinc-850 p-3 border border-zinc-700/80 text-xs font-mono text-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-green-300 select-none">$</span>
              <span>npx tech-inject add sales-metric-card</span>
            </div>
            <CopyButton text="npx tech-inject add sales-metric-card" size="sm" variant="dark" />
          </div>

          {/* Premium component command */}
          <div className="rounded-md bg-zinc-850 p-3 border border-zinc-700/80 text-xs font-mono text-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-green-300 select-none">$</span>
              <span>npx tech-inject add pipeline-kanban-board --auth</span>
            </div>
            <CopyButton text="npx tech-inject add pipeline-kanban-board --auth" size="sm" variant="dark" />
          </div>
        </div>
      </section>

      {/* Step 3: Copy Source Code */}
      <section className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-zinc-800 text-blue-200 border border-zinc-700 font-medium flex items-center justify-center text-xs">
            3
          </div>
          <h2 className="text-base font-semibold text-zinc-100">
            Manual Copy & Paste
          </h2>
        </div>
        <p className="text-xs text-zinc-400 pl-8.5 leading-relaxed">
          Prefer zero tooling? Every component page includes full copyable TypeScript source code, supporting types, and theme CSS files. Simply click the &ldquo;Copy Source&rdquo; button and paste it into your <code className="font-mono text-[11px] bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-300">src/components</code> directory.
        </p>
      </section>

      {/* Step 4: AI Coding Agent Integration */}
      <section className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-zinc-800 text-blue-200 border border-zinc-700 font-medium flex items-center justify-center text-xs">
            4
          </div>
          <h2 className="text-base font-semibold text-zinc-100">
            Automate with AI Coding Agents
          </h2>
        </div>
        <p className="text-xs text-zinc-400 pl-8.5 leading-relaxed">
          Developing with Cursor, Claude Code, GitHub Copilot, or Antigravity? Each component provides a structured integration prompt containing props interfaces, dependencies, and wiring instructions.
        </p>
        <div className="pl-8.5">
          <div className="rounded-md bg-zinc-850 p-3.5 border border-zinc-700/80 text-xs font-mono text-zinc-300 space-y-1.5">
            <div className="text-blue-200 font-medium">Example AI Agent Prompt:</div>
            <p className="text-zinc-400 whitespace-pre-wrap leading-relaxed">
              &quot;Add the SalesMetricCard component to your React project. Install dependencies: lucide-react, clsx. Follow the component props and theme definitions.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* Step 5: Customer Authentication */}
      <section className="space-y-3 pt-4 border-t border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-100">
          Customer Authentication & Premium Tiers
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Premium components require an active customer membership. You can sign in using your customer credentials. Pre-seeded testing accounts are provided on the login page for instant testing.
        </p>
        <div className="flex items-center gap-2.5 pt-1">
          <Link
            href="/login"
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-100 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-md transition-colors"
          >
            Go to Sign In
          </Link>
          <Link
            href="/account"
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Check Account Status
          </Link>
        </div>
      </section>
    </div>
  );
}
