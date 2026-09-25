import React from "react";
import Link from "next/link";
import { ComponentDetail } from "../../types/component";
import { formatDate } from "../../lib/utils";

export interface ComponentHeaderProps {
  component: ComponentDetail;
  className?: string;
}

export const ComponentHeader: React.FC<ComponentHeaderProps> = ({
  component,
  className = "",
}) => {
  const isPremium = component.accessType === "premium";

  return (
    <div className={`space-y-2.5 pb-4 border-b border-zinc-800 ${className}`}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-zinc-400">
        <Link href="/" className="hover:text-blue-200 transition-colors">
          Home
        </Link>
        <span className="text-zinc-600">/</span>
        <Link href="/components" className="hover:text-blue-200 transition-colors">
          Components
        </Link>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-200 font-medium truncate max-w-xs">
          {component.name}
        </span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-zinc-900 text-zinc-400 border border-zinc-700">
              {component.category}
            </span>

            <span className="font-mono text-[11px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700">
              v{component.version}
            </span>

            {isPremium ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium bg-amber-400/10 text-amber-300 border border-amber-400/20">
                <span>Premium</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium bg-green-500/10 text-green-300 border border-green-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span>Free Community</span>
              </span>
            )}

            {component.publishedAt && (
              <span className="text-xs text-zinc-500 font-normal">
                Published {formatDate(component.publishedAt)}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
            {component.name}
          </h1>

          {/* Description */}
          <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-4xl leading-relaxed">
            {component.description}
          </p>
        </div>

        {/* Lock indicator */}
        {component.isLocked && (
          <div className="flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-zinc-800 text-amber-300 border border-zinc-700">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Protected Premium
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
