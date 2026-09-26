import React from "react";
import Link from "next/link";
import { siteConfig } from "../../config/site";
import { BrandLogo } from "../common/BrandLogo";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-zinc-800 bg-zinc-950 text-zinc-400 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <BrandLogo size="md" badgeText="Enterprise" href="/" />

            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              {siteConfig.description}
            </p>

            {/* Backend status as clean simple text in blue-200 */}
            <div className="pt-1 text-xs text-blue-200">
              Dynamic Backend Catalogue Active
            </div>
          </div>

          {/* Explore Column */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link
                  href="/components"
                  className="hover:text-blue-200 transition-colors"
                >
                  All Components
                </Link>
              </li>
              <li>
                <Link
                  href="/get-started"
                  className="hover:text-blue-200 transition-colors"
                >
                  CLI Installation
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="hover:text-blue-200 transition-colors"
                >
                  Customer Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Security Authority Column */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3">
              Security Authority
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every protected asset, source code snippet, and AI agent prompt is verified live against the database on each request.
            </p>
          </div>
        </div>

        {/* Bottom Bar: Simple text in blue-200, no colorful dots */}
        <div className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-zinc-400">
            &copy; {new Date().getFullYear()} Tech Inject. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-blue-200">
            <span>Production Ready Design Library</span>
            <span>TypeScript + React 19 + Next.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
