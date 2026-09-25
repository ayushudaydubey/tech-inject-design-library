"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ComponentSummary } from "../../types/component";

export interface ComponentCardProps {
  component: ComponentSummary;
  className?: string;
  /** Stagger delay index — pass the array index from the grid */
  index?: number;
}

export const ComponentCard: React.FC<ComponentCardProps> = ({
  component,
  className = "",
  index = 0,
}) => {
  const isPremium = component.accessType === "premium";
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // animate once
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Stagger: max 6 steps so deep-page cards don't wait forever
  const delayMs = Math.min(index % 6, 5) * 60;

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transitionProperty: "opacity, transform, border-color, background-color, box-shadow",
        transitionDuration: "0.45s, 0.45s, 0.2s, 0.2s, 0.2s",
        transitionTimingFunction: "ease",
        transitionDelay: visible ? `${delayMs}ms, ${delayMs}ms, 0ms, 0ms, 0ms` : "0ms",
      }}
      className={`group relative flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4.5 hover:border-zinc-700 hover:bg-zinc-800 hover:[box-shadow:0_0_10px_1px_rgba(59,130,246,0.15),0_0_10px_1px_rgba(34,197,94,0.10)] ${className}`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-zinc-900 text-zinc-300 border border-zinc-800">
            {component.category}
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-zinc-400 font-mono">
              v{component.version}
            </span>
            {isPremium ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-yellow-500/15 text-yellow-300 border border-yellow-500/40">
                <span>PRO</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-green-950/60 text-green-300 border border-green-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span>Free</span>
              </span>
            )}
          </div>
        </div>

        {/* Component Title & Description */}
        <h3 className="text-sm font-semibold text-blue-200 group-hover:text-blue-100 transition-colors">
          <Link href={`/components/${component.slug}`} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {component.name}
          </Link>
        </h3>

        <p className="mt-1.5 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
          {component.description}
        </p>
      </div>

      {/* Footer Info & Action */}
      <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <span className="font-mono text-[11px] text-zinc-400 truncate max-w-[170px]">
          tech-inject add {component.slug}
        </span>

        <span className="inline-flex items-center font-medium text-xs text-blue-200 group-hover:translate-x-0.5 transition-transform flex-shrink-0">
          View
          <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
};
