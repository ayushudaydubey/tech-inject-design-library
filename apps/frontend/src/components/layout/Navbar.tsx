"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "../../hooks/useAuth";
import { siteConfig } from "../../config/site";
import { BrandLogo } from "../common/BrandLogo";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, isPremium } = useCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/components" && pathname.startsWith("/components")) return true;
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-50 h-15 w-full border-b border-zinc-800/70 bg-zinc-950/90 backdrop-blur-md transition-colors shadow-[0_4px_24px_-4px_rgba(0,0,0,0.6)]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex h-full items-center justify-between">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-6 lg:gap-8">
            <BrandLogo size="md" badgeText="Library" href="/" />

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
              {siteConfig.navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                      active
                        ? "bg-zinc-900 text-blue-200 font-semibold border border-zinc-800 shadow-xs"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60 border border-transparent"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action: Auth & Status */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/account"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700 transition-all shadow-xs"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isPremium ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                  />
                  <span>{user.name}</span>
                  {isPremium && (
                    <span className="bg-amber-400/10 text-amber-300 border border-amber-400/25 font-bold px-1.5 py-0.2 rounded text-[10px]">
                      PRO
                    </span>
                  )}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50 rounded-lg transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/components"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg transition-all shadow-xs hover:shadow group"
                >
                  <span>Browse Catalogue</span>
                  <svg
                    className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 focus:outline-hidden transition-colors"
              aria-label="Toggle mobile navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800/80 bg-zinc-950/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 shadow-2xl">
          <nav className="flex flex-col space-y-1.5">
            {siteConfig.navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-zinc-900 text-blue-200 font-semibold border border-zinc-800"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-zinc-800/80">
            {isAuthenticated && user ? (
              <div className="space-y-2.5">
                <div className="text-xs text-zinc-400 px-2 flex items-center justify-between">
                  <span>Signed in as</span>
                  <span className="font-semibold text-zinc-200">{user.email}</span>
                </div>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-3.5 py-2 text-xs font-semibold text-zinc-200 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors"
                >
                  Manage Account
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-3.5 py-2 text-xs font-semibold text-zinc-300 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/components"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-3.5 py-2 text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg transition-colors shadow-xs"
                >
                  Browse Catalogue
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
