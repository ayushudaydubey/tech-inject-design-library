import Link from "next/link";
import { HeroChips } from "@/components/hero/HeroChips";

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1 bg-[var(--background)]">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 border-b border-[var(--border)] overflow-hidden">

        <HeroChips />

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="mb-8">
            <span className="text-[13px] font-medium text-blue-200">
              Tech Inject Design Library &bull; 1.0
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-semibold text-[var(--text-primary)] tracking-tight max-w-3xl mx-auto leading-tight">
            Production UI Components for Modern Engineering
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            A practical, enterprise-grade component catalogue. Copy source code, install via CLI, or integrate with AI coding agents directly.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/components"
              className="px-6 py-2.5 rounded bg-[var(--text-primary)] text-[var(--background)] font-medium text-[15px] hover:bg-zinc-200 transition-colors"
            >
              Browse Components
            </Link>
            <Link
              href="/get-started"
              className="px-6 py-2.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-medium text-[15px] hover:bg-[var(--surface-muted)] transition-colors"
            >
              Getting Started
            </Link>
          </div>

          {/* Code Editor Card */}
          <div className="mt-16 max-w-2xl mx-auto rounded-xl border border-zinc-800/70 bg-zinc-950 overflow-hidden shadow-2xl shadow-black/60 text-left font-mono text-[12.5px]">

            {/* ── Editor title bar ──────────────────────────────────────── */}
            <div className="flex items-center gap-0 bg-zinc-900 border-b border-zinc-800/80">
              {/* Window dots */}
              <div className="flex items-center gap-1.5 px-3.5 py-2.5 border-r border-zinc-800/60">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              </div>
              {/* Active file tab */}
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-950 border-r border-zinc-800/60 text-zinc-300 text-[11px]">
                <svg className="w-3 h-3 text-zinc-400" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v18H3V3zm16 16V5H5v14h14z"/></svg>
                install.ts
              </div>
              <div className="flex items-center gap-2 px-4 py-2 text-zinc-600 text-[11px]">
                terminal
              </div>
              <div className="ml-auto px-3 text-[10px] text-zinc-600">tech-inject-ui</div>
            </div>

            {/* ── Editor body ───────────────────────────────────────────── */}
            <div className="flex">
              {/* Line number gutter */}
              <div className="select-none py-4 px-3 text-right text-[11px] leading-[1.9] text-zinc-600 bg-zinc-950 min-w-[36px] border-r border-zinc-800/40">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <div key={n}>{n}</div>
                ))}
              </div>

              {/* Code lines */}
              <div className="py-4 px-5 leading-[1.9] overflow-x-auto flex-1">
                {/* line 1 */}
                <div>
                  <span className="text-purple-400">import</span>
                  <span className="text-zinc-300"> &#123; </span>
                  <span className="text-zinc-200">TechInject</span>
                  <span className="text-zinc-300"> &#125; </span>
                  <span className="text-purple-400">from</span>
                  <span className="text-green-300"> &apos;tech-inject-ui&apos;</span>
                  <span className="text-zinc-500">;</span>
                </div>
                {/* line 2 - blank */}
                <div>&nbsp;</div>
                {/* line 3 */}
                <div>
                  <span className="text-zinc-500">// Install a component via CLI</span>
                </div>
                {/* line 4 */}
                <div>
                  <span className="text-purple-400">const</span>
                  <span className="text-zinc-200"> result</span>
                  <span className="text-zinc-300"> = </span>
                  <span className="text-purple-400">await</span>
                  <span className="text-zinc-200"> TechInject</span>
                  <span className="text-zinc-400">.</span>
                  <span className="text-yellow-300">add</span>
                  <span className="text-zinc-300">(</span>
                </div>
                {/* line 5 */}
                <div className="pl-5">
                  <span className="text-green-300">&apos;sales-metric-card&apos;</span>
                  <span className="text-zinc-500">,</span>
                </div>
                {/* line 6 */}
                <div className="pl-5">
                  <span className="text-zinc-300">&#123; </span>
                  <span className="text-cyan-300">typescript</span>
                  <span className="text-zinc-300">: </span>
                  <span className="text-orange-300">true</span>
                  <span className="text-zinc-300"> &#125;</span>
                </div>
                {/* line 7 */}
                <div>
                  <span className="text-zinc-300">)</span>
                  <span className="text-zinc-500">;</span>
                </div>
                {/* line 8 - blank */}
                <div>&nbsp;</div>
                {/* line 9 output */}
                <div>
                  <span className="text-zinc-600">// </span>
                  <span className="text-green-400">✓</span>
                  <span className="text-zinc-500"> Installed </span>
                  <span className="text-zinc-300">SalesMetricCard.tsx</span>
                  <span className="text-zinc-500">, </span>
                  <span className="text-zinc-300">types.ts</span>
                </div>
                {/* line 10 cursor */}
                <div className="flex items-center gap-0">
                  <span className="text-zinc-500">▸ </span>
                  <span className="text-zinc-300">npx tech-inject add </span>
                  <span className="text-green-300">sales-metric-card</span>
                  <span className="inline-block w-[2px] h-[14px] bg-zinc-300 ml-0.5 animate-pulse" />
                </div>
              </div>
            </div>

            {/* ── Status bar ────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-3 py-1 bg-zinc-800 border-t border-zinc-700/60 text-[10px] text-zinc-400">
              <div className="flex items-center gap-3">
                <span>⎇ main</span>
                <span>✓ TypeScript</span>
              </div>
              <div className="flex items-center gap-3">
                <span>tech-inject-ui v1.0</span>
                <span>UTF-8</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">Architecture &amp; Features</h3>
            <p className="mt-2 text-[var(--text-secondary)]">Engineered for real-world workflows without brittle deployments.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 border border-zinc-800/80 bg-zinc-950 rounded-xl shadow-[0_0_20px_rgba(191,219,254,0.12)] hover:shadow-[0_0_25px_rgba(191,219,254,0.22)] transition-all">
              <h4 className="font-medium text-[var(--text-primary)]">Dynamic Publishing</h4>
              <p className="mt-2 text-[14px] text-[var(--text-muted)]">Immediate catalog updates without frontend redeployment.</p>
            </div>
            <div className="p-5 border border-zinc-800/80 bg-zinc-950 rounded-xl shadow-[0_0_20px_rgba(191,219,254,0.12)] hover:shadow-[0_0_25px_rgba(191,219,254,0.22)] transition-all">
              <h4 className="font-medium text-[var(--text-primary)]">Access Authority</h4>
              <p className="mt-2 text-[14px] text-[var(--text-muted)]">Live database permission checks for premium source code.</p>
            </div>
            <div className="p-5 border border-zinc-800/80 bg-zinc-950 rounded-xl shadow-[0_0_20px_rgba(191,219,254,0.12)] hover:shadow-[0_0_25px_rgba(191,219,254,0.22)] transition-all">
              <h4 className="font-medium text-[var(--text-primary)]">CLI Integration</h4>
              <p className="mt-2 text-[14px] text-[var(--text-muted)]">Install components seamlessly into any React project.</p>
            </div>
            <div className="p-5 border border-zinc-800/80 bg-zinc-950 rounded-xl shadow-[0_0_20px_rgba(191,219,254,0.12)] hover:shadow-[0_0_25px_rgba(191,219,254,0.22)] transition-all">
              <h4 className="font-medium text-[var(--text-primary)]">AI Prompts</h4>
              <p className="mt-2 text-[14px] text-[var(--text-muted)]">Contextual prompts for Cursor, Claude Code, and Copilot.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Free vs Premium Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 border border-zinc-800/80 bg-zinc-950 rounded-xl shadow-[0_0_20px_rgba(191,219,254,0.08)]">
              <div className="text-xs font-medium text-blue-200 mb-4">Community</div>
              <h4 className="text-lg font-semibold text-[var(--text-primary)]">Open Access Components</h4>
              <p className="mt-2 text-[14px] text-[var(--text-muted)]">Core design building blocks accessible to all developers.</p>
              <ul className="mt-6 space-y-3 text-[14px] text-[var(--text-secondary)]">
                <li>• Unrestricted component preview</li>
                <li>• Full source code copy</li>
                <li>• CLI installation</li>
              </ul>
            </div>
            <div className="relative overflow-hidden p-8 border border-zinc-800 bg-zinc-950 rounded-2xl shadow-[inset_0_0_35px_rgba(191,219,254,0.12),inset_0_1px_0_0_rgba(191,219,254,0.35)]">
              {/* Inner ambient light gradient */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(191,219,254,0.14),transparent_65%)] pointer-events-none" />
              {/* Inner top gloss line */}
              <div className="absolute top-0 inset-x-6 h-[1px] bg-gradient-to-r from-transparent via-blue-200/50 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <div className="text-xs font-medium text-blue-200 mb-4">
                  Premium
                </div>
                <h4 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  Enterprise Components
                </h4>
                <p className="mt-2 text-[14px] text-zinc-400">Advanced pipelines and interactive enterprise widgets.</p>
                <ul className="mt-6 space-y-3 text-[14px] text-zinc-300">
                  <li className="flex items-center gap-2"><span className="text-blue-200">•</span> Complex drag-and-drop structures</li>
                  <li className="flex items-center gap-2"><span className="text-blue-200">•</span> Authenticated CLI downloads</li>
                  <li className="flex items-center gap-2"><span className="text-blue-200">•</span> Enterprise AI agent instructions</li>
                </ul>
                <div className="mt-8">
                  <Link href="/login" className="inline-flex items-center gap-1 text-[14px] text-blue-200 hover:text-white font-medium transition-colors hover:underline">
                    Sign In with Customer Account &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
