import React from "react";
import Link from "next/link";
import { BrandLogo } from "../common/BrandLogo";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 text-zinc-400 py-6 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <BrandLogo size="sm" badgeText="Console" href="/dashboard" />
            <div className="text-xs text-blue-200">
              Admin Authority Active
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400 font-medium">
            <Link href="/dashboard/components" className="hover:text-zinc-200 transition-colors">
              Components
            </Link>
            <span className="text-zinc-700">&bull;</span>
            <Link href="/dashboard/customers" className="hover:text-zinc-200 transition-colors">
              Customers
            </Link>
            <span className="text-zinc-700">&bull;</span>
            <a
              href={process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sky-300 transition-colors inline-flex items-center gap-1"
            >
              Public App
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-900 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500 font-mono">
          <span>&copy; {new Date().getFullYear()} Tech Inject Admin Console. Enterprise Rights Reserved.</span>
          <span>Verified Engine Session</span>
        </div>
      </div>
    </footer>
  );
};
