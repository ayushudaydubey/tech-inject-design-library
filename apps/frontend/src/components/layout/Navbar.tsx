"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "../../hooks/useAuth";
import { siteConfig } from "../../config/site";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, isPremium } = useCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/components" && pathname.startsWith("/components")) return true;
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-40 h-14 w-full border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex h-full items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-medium text-zinc-100 group focus:outline-none"
            >
              <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 font-semibold text-xs transition-colors group-hover:border-zinc-600">
                TI
              </div>
              <span className="text-sm font-semibold tracking-tight text-zinc-100">
                Tech Inject <span className="text-blue-200 font-normal">UI</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                Library
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
              {siteConfig.navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                      active
                        ? "bg-zinc-800 text-blue-200 font-medium"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
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
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-700 bg-zinc-800 text-xs font-medium text-zinc-200 hover:bg-zinc-700/80 transition-colors"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isPremium ? "bg-amber-400" : "bg-green-400"
                    }`}
                  />
                  <span>{user.name}</span>
                  {isPremium && (
                    <span className="bg-amber-400/10 text-amber-300 border border-amber-400/20 font-medium px-1.5 py-0.2 rounded text-[10px]">
                      PRO
                    </span>
                  )}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/components"
                  className="px-3.5 py-1.5 text-xs font-medium text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors"
                >
                  Browse Catalogue
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 focus:outline-none"
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
        <div className="md:hidden border-b border-zinc-800 bg-zinc-900 px-4 pt-2 pb-5 space-y-2.5">
          <nav className="flex flex-col space-y-1">
            {siteConfig.navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                  isActive(item.href)
                    ? "bg-zinc-800 text-blue-200"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-zinc-800">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="text-xs text-zinc-300 px-2">
                  Signed in as <span className="font-semibold text-zinc-100">{user.email}</span>
                </div>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 rounded-md border border-zinc-700"
                >
                  Manage Account
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-3 py-1.5 text-xs font-medium text-zinc-300 border border-zinc-700 rounded-md"
                >
                  Sign In
                </Link>
                <Link
                  href="/components"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-3 py-1.5 text-xs font-medium text-zinc-900 bg-zinc-100 rounded-md"
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
