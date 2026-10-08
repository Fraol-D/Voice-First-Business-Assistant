"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AuthenticatedBottomNavProps {
  hidden?: boolean;
}

export function AuthenticatedBottomNav({ hidden = false }: AuthenticatedBottomNavProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAssistant = pathname === "/assistant" || pathname.startsWith("/assistant/");
  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isSettings = pathname === "/settings" || pathname.startsWith("/settings/");

  if (hidden) {
    return null;
  }

  return (
    <nav
      role="navigation"
      aria-label="Mobile application navigation"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-border bg-surface/95 backdrop-blur-md transition-all duration-200"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="grid grid-cols-4 items-center h-14 max-w-md mx-auto px-1">
        {/* 1. Home (active link) */}
        <Link
          href="/"
          aria-current={isHome ? "page" : undefined}
          aria-label="Home"
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 px-2 transition-colors duration-150 active:scale-95 ${
            isHome
              ? "text-accent font-semibold"
              : "text-muted hover:text-foreground"
          }`}
        >
          <svg
            className="size-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={isHome ? 2 : 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="text-[11px] font-inter mt-1 tracking-tight">
            Home
          </span>
        </Link>

        {/* 2. Assistant (active link) */}
        <Link
          href="/assistant"
          aria-current={isAssistant ? "page" : undefined}
          aria-label="Assistant"
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 px-2 transition-colors duration-150 active:scale-95 ${
            isAssistant
              ? "text-accent font-semibold"
              : "text-muted hover:text-foreground"
          }`}
        >
          <svg
            className="size-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={isAssistant ? 2 : 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          </svg>
          <span className="text-[11px] font-inter mt-1 tracking-tight">
            Assistant
          </span>
        </Link>

        {/* 3. Dashboard (active link) */}
        <Link
          href="/dashboard"
          aria-current={isDashboard ? "page" : undefined}
          aria-label="Dashboard"
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 px-2 transition-colors duration-150 active:scale-95 ${
            isDashboard
              ? "text-accent font-semibold"
              : "text-muted hover:text-foreground"
          }`}
        >
          <svg
            className="size-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={isDashboard ? 2 : 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
          <span className="text-[11px] font-inter mt-1 tracking-tight">
            Dashboard
          </span>
        </Link>

        {/* 4. Settings (active link to /settings) */}
        <Link
          href="/settings"
          aria-current={isSettings ? "page" : undefined}
          aria-label="Settings"
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 px-2 transition-colors duration-150 active:scale-95 ${
            isSettings
              ? "text-accent font-semibold"
              : "text-muted hover:text-foreground"
          }`}
        >
          <svg
            className="size-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={isSettings ? 2 : 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
          <span className="text-[11px] font-inter mt-1 tracking-tight">
            Settings
          </span>
        </Link>
      </div>
    </nav>
  );
}
