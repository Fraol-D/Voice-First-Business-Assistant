"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { MeriLogo } from "@/components/landing/meri-logo";
import { AuthenticatedBottomNav } from "@/components/navigation/authenticated-bottom-nav";

export default function SettingsPage() {
  const { user, signOut, isLoading } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur-md pt-[env(safe-area-inset-top,0px)]">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/assistant"
              className="inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-lg py-1 px-1.5 text-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Back to Assistant"
            >
              <svg
                className="size-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <MeriLogo />
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-2.5">
            <Link
              href="/dashboard"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground hover:border-border-strong hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Dashboard
            </Link>
            <Link
              href="/assistant"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-4 py-2 text-xs font-semibold text-background shadow-sm hover:opacity-90 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Assistant
            </Link>
          </div>
        </div>
      </header>

      {/* Main Settings Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8 font-inter pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-12">
        {/* Title */}
        <div>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-foreground tracking-tight">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Manage your account session, application preferences, and workspace settings.
          </p>
        </div>

        {/* Section 1: Profile & Session */}
        <section id="profile" className="rounded-2xl border border-border bg-surface/50 p-5 sm:p-6 space-y-4 scroll-mt-20">
          <div>
            <h2 className="font-display font-medium text-lg text-foreground flex items-center gap-2">
              <svg
                className="size-5 text-muted shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Profile &amp; Session
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Your authentication identity and cloud sync status.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background/50">
              <div className="size-10 rounded-full bg-surface animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-24 bg-surface rounded animate-pulse" />
                <div className="h-4 w-40 bg-surface rounded animate-pulse" />
              </div>
            </div>
          ) : user ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-background/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent font-display font-semibold text-sm">
                  {user.email ? user.email[0].toUpperCase() : "A"}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground">
                    Account
                  </div>
                  <div
                    className="text-xs text-muted mt-0.5 truncate"
                    title={user.email ?? ""}
                  >
                    {user.email ?? "Active user session"}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-background/50">
              <div>
                <div className="text-sm font-semibold text-foreground">
                  Guest Session
                </div>
                <div className="text-xs text-muted mt-0.5">
                  Sign in to synchronize your records across multiple devices.
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Link
                  href="/login?next=/settings"
                  className="inline-flex min-h-[44px] sm:min-h-[38px] items-center justify-center rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground hover:border-border-strong active:scale-95 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup?next=/settings"
                  className="inline-flex min-h-[44px] sm:min-h-[38px] items-center justify-center rounded-full bg-accent px-4 py-2 text-xs font-semibold text-background hover:opacity-90 active:scale-95 shadow-sm transition-all"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Section 2: Dashboard Placeholder */}
        <section className="rounded-2xl border border-border bg-surface/50 p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-medium text-lg text-foreground flex items-center gap-2">
              <svg
                className="size-5 text-muted shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="7" height="9" rx="1" />
                <rect x="14" y="3" width="7" height="5" rx="1" />
                <rect x="14" y="12" width="7" height="9" rx="1" />
                <rect x="3" y="16" width="7" height="5" rx="1" />
              </svg>
              Dashboard
            </h2>
            <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-medium text-muted">
              Reserved Surface
            </span>
          </div>

          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            Business performance metrics, daily sales totals, and inventory velocity summaries will live here.
          </p>

          <div className="flex items-center justify-center rounded-xl border border-dashed border-border/80 py-8 px-4 text-center bg-background/30">
            <span className="text-xs text-muted/70">
              No active dashboard metrics configured yet.
            </span>
          </div>
        </section>

        {/* Section 3: Appearance / Theme */}
        <section className="rounded-2xl border border-border bg-surface/50 p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="font-display font-medium text-lg text-foreground flex items-center gap-2">
              <svg
                className="size-5 text-muted shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              Appearance
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Customize interface display options and theme modes.
            </p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/50">
            <div>
              <div className="text-sm font-semibold text-foreground">
                Theme Mode
              </div>
              <div className="text-xs text-muted mt-0.5">
                Toggle between Dark and Light mode.
              </div>
            </div>

            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </div>
        </section>

        {user ? (
          <section className="rounded-2xl border border-border bg-surface/50 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-medium text-lg text-foreground">
                  Sign out
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  End your current account session on this device.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={isSigningOut}
                className="inline-flex min-h-[44px] sm:min-h-[38px] items-center justify-center rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-muted hover:text-red-600 dark:hover:text-red-400 hover:border-red-500/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSigningOut ? "Signing Out…" : "Sign Out"}
              </button>
            </div>
          </section>
        ) : null}
      </main>

      {/* Mobile Bottom Navigation */}
      <AuthenticatedBottomNav />
    </div>
  );
}
