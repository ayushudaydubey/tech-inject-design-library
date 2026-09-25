import React from "react";
import Link from "next/link";
import { siteConfig } from "../../config/site";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-zinc-800 bg-zinc-900 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5 font-semibold text-zinc-100">
              <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 text-xs">
                TI
              </div>
              <span className="text-sm font-semibold tracking-tight text-zinc-100">
                Tech Inject <span className="text-blue-200 font-normal">UI</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              {siteConfig.description}
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-zinc-400">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
              <span>Dynamic Backend Catalogue Active</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/components" className="hover:text-blue-200 transition-colors">
                  All Components
                </Link>
              </li>
              <li>
                <Link href="/get-started" className="hover:text-blue-200 transition-colors">
                  CLI Installation
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-blue-200 transition-colors">
                  Customer Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3">
              Security Authority
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every protected asset, source code snippet, and AI agent prompt is verified live against the database on each request.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div>
            &copy; {new Date().getFullYear()} Tech Inject. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Production Ready Design Library</span>
            <span>TypeScript + React 19 + Next.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
