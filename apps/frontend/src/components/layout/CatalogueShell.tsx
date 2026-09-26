"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { useComponents } from "../../hooks/useComponents";

interface CatalogueShellProps {
  children: React.ReactNode;
}

const DEFAULT_SIDEBAR_WIDTH = 260;
const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 420;

export const CatalogueShell: React.FC<CatalogueShellProps> = ({ children }) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_SIDEBAR_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const pathname = usePathname();
  const { data: components = [] } = useComponents();

  useEffect(() => {
    try {
      const savedWidth = localStorage.getItem("tech_inject_sidebar_width");
      if (savedWidth) {
        const parsed = parseInt(savedWidth, 10);
        if (!isNaN(parsed) && parsed >= MIN_SIDEBAR_WIDTH && parsed <= MAX_SIDEBAR_WIDTH) {
          requestAnimationFrame(() => {
            setSidebarWidth(parsed);
          });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const activeComponent = components.find(
    (c) => pathname === `/components/${c.slug}`
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileDrawerOpen) {
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileDrawerOpen]);

  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileDrawerOpen]);

  const startResizing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.min(Math.max(e.clientX, MIN_SIDEBAR_WIDTH), MAX_SIDEBAR_WIDTH);
      setSidebarWidth(newWidth);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isResizing || !e.touches[0]) return;
      const newWidth = Math.min(Math.max(e.touches[0].clientX, MIN_SIDEBAR_WIDTH), MAX_SIDEBAR_WIDTH);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        try {
          localStorage.setItem("tech_inject_sidebar_width", String(sidebarWidth));
        } catch {
          // ignore
        }
      }
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, sidebarWidth]);

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-3.75rem)] w-full">
      {/* Mobile / Tablet Header Bar (< lg) */}
      <div className="lg:hidden sticky top-15 z-30 flex items-center justify-between px-4 py-2 bg-zinc-950 border-b border-zinc-800">
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="inline-flex items-center gap-2 px-2.5 py-1 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-md border border-zinc-700 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-200/50"
          aria-label="Open component catalogue navigation drawer"
          aria-expanded={mobileDrawerOpen}
        >
          <svg
            className="w-4 h-4 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
          <span>Menu</span>
        </button>

        {/* Current Active Breadcrumb on Mobile */}
        <div className="text-xs text-zinc-400 font-medium truncate max-w-[200px]">
          {activeComponent ? (
            <span className="text-zinc-100 font-medium">
              {activeComponent.name}
            </span>
          ) : (
            <span>Catalogue Overview</span>
          )}
        </div>
      </div>

      {/* Main Catalogue Layout Shell */}
      <div className="flex-1 flex w-full relative">
        {/* Desktop Resizable Sidebar Container */}
        <div
          className="hidden lg:block relative flex-shrink-0"
          style={{ width: `${sidebarWidth}px` }}
        >
          <div className="sticky top-15 h-[calc(100vh-3.75rem)] w-full">
            <Sidebar className="h-full border-r border-zinc-800" />
          </div>

          {/* Draggable Resizer Handle */}
          <div
            onMouseDown={startResizing}
            onTouchStart={startResizing}
            role="separator"
            aria-orientation="vertical"
            aria-valuenow={sidebarWidth}
            aria-valuemin={MIN_SIDEBAR_WIDTH}
            aria-valuemax={MAX_SIDEBAR_WIDTH}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") {
                const next = Math.max(sidebarWidth - 15, MIN_SIDEBAR_WIDTH);
                setSidebarWidth(next);
                try {
                  localStorage.setItem("tech_inject_sidebar_width", String(next));
                } catch {
                  // ignore
                }
              } else if (e.key === "ArrowRight") {
                const next = Math.min(sidebarWidth + 15, MAX_SIDEBAR_WIDTH);
                setSidebarWidth(next);
                try {
                  localStorage.setItem("tech_inject_sidebar_width", String(next));
                } catch {
                  // ignore
                }
              }
            }}
            title="Drag to resize sidebar width"
            className={`absolute top-0 -right-1.5 w-3 h-full cursor-col-resize z-30 group select-none ${
              isResizing ? "cursor-col-resize" : ""
            }`}
          >
            <div
              className={`w-1 h-full mx-auto transition-colors duration-150 rounded-full ${
                isResizing
                  ? "bg-blue-200"
                  : "bg-transparent group-hover:bg-blue-200/50"
              }`}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <main
          id="catalogue-main-content"
          className="flex-1 min-w-0 w-full flex flex-col"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Component Navigation Drawer"
        >
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-zinc-950/70 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content Panel */}
          <div className="relative flex flex-col w-[250px] max-w-[80vw] h-full bg-zinc-900 border-r border-zinc-800 z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header with Close Button */}
            <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-900">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 font-semibold text-[10px]">
                  TI
                </div>
                <span className="font-semibold text-xs text-zinc-100">
                  Catalogue
                </span>
              </div>

              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                aria-label="Close component navigation drawer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Sidebar inside Drawer */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <Sidebar
                className="w-full border-r-0 h-full bg-transparent"
                onItemClick={() => setMobileDrawerOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
