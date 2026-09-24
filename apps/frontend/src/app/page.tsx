import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 mb-6 shadow-xs animate-in fade-in duration-500">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span>Tech Inject Design Library &bull; Version 1.0</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
            Production UI Components for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Modern Engineering
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A dynamic, enterprise-grade component catalogue. Copy production-ready source code, install via CLI, or automate integrations with AI coding agents.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/components"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Browse Components
            </Link>
            <Link
              href="/get-started"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold text-base border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs"
            >
              Getting Started Guide
            </Link>
          </div>

          {/* CLI Terminal snippet */}
          <div className="mt-12 max-w-xl mx-auto rounded-2xl bg-slate-950 border border-slate-800 p-4 shadow-xl text-left font-mono text-xs text-slate-300">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800/80 text-slate-500 text-[11px]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="ml-2">terminal &mdash; zsh</span>
            </div>
            <div className="flex items-center gap-2 text-slate-100">
              <span className="text-emerald-400 select-none">$</span>
              <span>npx tech-inject add sales-metric-card</span>
            </div>
            <div className="mt-2 text-slate-400 text-[11px]">
              &gt; Resolving component from public catalogue...<br />
              &gt; Installed SalesMetricCard.tsx, types.ts, metric-card.css<br />
              &gt; Done in 0.8s
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
              Architecture & Features
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Engineered for Real-World Workflows
            </h3>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
              Built on a dynamic backend authority model without hardcoded static lists or brittle deployments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Dynamic Publishing
              </h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                When an admin drafts and publishes a component, it immediately appears in the catalogue without frontend redeployment.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Server-Side Access Authority
              </h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Premium source code and install scripts are guarded by live database permission checks. Revocation takes effect instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                CLI Integration
              </h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Install components with verified dependencies using <code className="text-blue-600 dark:text-blue-400">npx tech-inject add</code> in any React project.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                AI Coding Prompts
              </h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Export contextual prompts tailored for Claude Code, Cursor, and Copilot with verified props and installation commands.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Free vs Premium Section */}
      <section className="py-20 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Community & Enterprise Tiers
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Clear boundaries between open components and enterprise-grade building blocks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Tier Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xs">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mb-4">
                Free Community Tier
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                Open Access Components
              </h4>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Core design building blocks accessible to all developers without an account.
              </p>
              <ul className="mt-6 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">&#10003;</span>
                  <span>Unrestricted component preview and fixture inspect</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">&#10003;</span>
                  <span>Full source code copy and download</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">&#10003;</span>
                  <span>CLI installation without developer token</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">&#10003;</span>
                  <span>AI agent integration prompt export</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link
                  href="/components"
                  className="block text-center py-2.5 px-4 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Explore Free Components
                </Link>
              </div>
            </div>

            {/* Premium Tier Card */}
            <div className="rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-gradient-to-b from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 p-8 shadow-sm relative">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Premium Developer Tier
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                Enterprise CRM Components
              </h4>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Advanced pipelines, interactive kanban boards, and enterprise widgets.
              </p>
              <ul className="mt-6 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-amber-500 font-bold">&#10003;</span>
                  <span>Complex drag-and-drop opportunity pipelines</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-500 font-bold">&#10003;</span>
                  <span>Production-tested CRM metrics and token sets</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-500 font-bold">&#10003;</span>
                  <span>Authenticated CLI downloads via developer token</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-500 font-bold">&#10003;</span>
                  <span>Enterprise AI agent orchestration instructions</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link
                  href="/login"
                  className="block text-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-colors"
                >
                  Sign In with Customer Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Build CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold">
            Start Building with Tech Inject UI Today
          </h3>
          <p className="mt-3 text-blue-100 text-sm max-w-xl mx-auto">
            Browse our dynamically updated catalogue, inspect live fixtures, and install atomic UI components into your codebase in seconds.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/components"
              className="px-6 py-3 rounded-xl bg-white text-blue-600 font-bold text-sm shadow-sm hover:bg-blue-50 transition-colors"
            >
              Browse Public Catalogue
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
