"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getDashboardSummary } from "@/lib/api/client";
import type { DashboardResponse } from "@/lib/api/types";
import { MeriLogo } from "@/components/landing/meri-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthenticatedBottomNav } from "@/components/navigation/authenticated-bottom-nav";

const DEMO_PREVIEW_DATA: DashboardResponse = {
  sales_today: { amount: 3450, currency: "ETB", count: 8 },
  expenses_today: { amount: 820, currency: "ETB", count: 3 },
  customer_debt: {
    total: 1250,
    currency: "ETB",
    customers: [
      { customer: "Abebe Bikila", amount: 750, currency: "ETB" },
      { customer: "Tigist Assefa", amount: 500, currency: "ETB" },
    ],
  },
  inventory: {
    total_items: 24,
    low_stock_count: 2,
    items: [
      { item: "cotton shirts", quantity: 3, unit: "pcs" },
      { item: "leather shoes", quantity: 1, unit: "pairs" },
    ],
  },
  recent_activity: [
    {
      id: "demo_1",
      type: "sale",
      description: "Sale: 2 cotton shirts to Abebe Bikila",
      amount: 900,
      currency: "ETB",
      timestamp: new Date().toISOString(),
    },
    {
      id: "demo_2",
      type: "expense",
      description: "Store electricity utility payment",
      amount: 450,
      currency: "ETB",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "demo_3",
      type: "customer_debt",
      description: "Debt: Tigist Assefa owes business",
      amount: 500,
      currency: "ETB",
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
  ],
};

function formatMoney(amount: number, currency: string = "ETB"): string {
  const formatted = Number.isFinite(amount)
    ? amount.toLocaleString("en-US", {
        minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      })
    : "0";
  return `${formatted} ${currency}`;
}

function formatTimestamp(isoString: string): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

function getEventTypeBadge(type: string): { label: string; className: string } {
  switch (type.toLowerCase()) {
    case "sale":
      return {
        label: "Sale",
        className: "bg-success/15 text-success border-success/20",
      };
    case "expense":
      return {
        label: "Expense",
        className: "bg-error/15 text-error border-error/20",
      };
    case "purchase":
      return {
        label: "Purchase",
        className: "bg-accent/15 text-accent border-accent/20",
      };
    case "customer_debt":
      return {
        label: "Debt",
        className: "bg-warning/15 text-warning border-warning/20",
      };
    case "inventory_adjustment":
      return {
        label: "Adjustment",
        className: "bg-foreground/10 text-foreground border-border",
      };
    default:
      return {
        label: type.replace("_", " "),
        className: "bg-surface-strong text-muted border-border",
      };
  }
}

export default function DashboardPage() {
  const { user, isLoading: authLoading, isConfigured } = useAuth();
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setIsFetching(false);
      return;
    }

    setIsFetching(true);
    setFetchError(null);

    try {
      const result = await getDashboardSummary();

      if (result.ok) {
        setDashboardData(result.data);
        setFetchError(null);
        setLastRefreshedAt(new Date());
      } else {
        const errorMsg =
          result.status === 404
            ? "Dashboard endpoint returned 404 Not Found. Please verify backend route alignment."
            : result.message || "Unable to retrieve dashboard metrics.";
        setFetchError(errorMsg);
      }
    } catch {
      setFetchError("Could not reach backend service. Please check network connectivity.");
    } finally {
      setIsFetching(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      if (isConfigured && !user) {
        router.push("/login?next=/dashboard");
        return;
      }
      if (user) {
        fetchDashboardData();
      } else {
        setIsFetching(false);
      }
    }
  }, [authLoading, isConfigured, user, router, fetchDashboardData]);

  // Loading skeleton state while authenticating
  if (authLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
        <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur-md pt-[env(safe-area-inset-top,0px)]">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
            <div className="h-6 w-24 bg-surface rounded animate-pulse" />
            <div className="h-8 w-8 rounded-full bg-surface animate-pulse" />
          </div>
        </header>
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          <div className="h-8 w-48 bg-surface rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 rounded-2xl border border-border bg-surface/50 p-5 animate-pulse"
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Fallback 1: Local development environment with unconfigured Supabase credentials
  if (!isConfigured && !previewMode) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
        <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur-md pt-[env(safe-area-inset-top,0px)]">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-1.5 rounded-lg py-1 px-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              <MeriLogo />
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                href="/settings"
                className="inline-flex min-h-[38px] items-center justify-center rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground hover:border-border-strong transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Settings
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center font-inter">
          <div className="w-full rounded-2xl border border-warning/30 bg-surface/80 p-6 sm:p-8 space-y-5 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
                <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-1 flex-1">
                <h1 className="font-display text-xl font-bold text-foreground">
                  Authentication Service Not Configured
                </h1>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  Supabase environment credentials are required for authenticated business sessions and data isolation.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background/80 p-4 space-y-2 text-xs">
              <div className="font-semibold text-foreground">
                Required Configuration in <code className="text-accent font-mono">.env.local</code>:
              </div>
              <pre className="font-mono text-[11px] text-muted overflow-x-auto p-3 rounded-lg bg-surface border border-border">
                {`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
              </pre>
              <p className="text-[11px] text-muted pt-1">
                Note: In addition, ensure <code className="font-mono text-foreground">SUPABASE_URL</code> is set in <code className="font-mono text-foreground">backend-engine/.env</code> so the backend can verify session tokens.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => setPreviewMode(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-xs font-semibold text-background shadow-sm hover:opacity-90 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
              >
                Enable Demo Preview Mode
              </button>
              <Link
                href="/settings"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-border bg-surface px-4 py-2.5 text-xs font-medium text-foreground hover:border-border-strong transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Open Settings
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Fallback 2: Configured Supabase project, but user is not logged in
  if (!user && !previewMode) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background text-foreground p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 sm:p-8 text-center space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent">
            <svg
              className="size-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">
            Sign In Required
          </h1>
          <p className="text-sm text-muted">
            You must be signed in to view your business dashboard.
          </p>
          <Link
            href="/login?next=/dashboard"
            className="inline-flex w-full items-center justify-center rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-background shadow-sm hover:opacity-90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const activeData = previewMode ? DEMO_PREVIEW_DATA : dashboardData;
  const sales = activeData?.sales_today;
  const expenses = activeData?.expenses_today;
  const debt = activeData?.customer_debt;
  const inventory = activeData?.inventory;
  const recentActivity = activeData?.recent_activity ?? [];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur-md pt-[env(safe-area-inset-top,0px)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Left: Meri Logo + Page Title */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg py-1 px-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Meri homepage"
            >
              <MeriLogo />
            </Link>
            <span
              className="text-border-strong font-light text-base select-none"
              aria-hidden="true"
            >
              /
            </span>
            <span className="font-display font-semibold text-sm sm:text-base text-foreground tracking-tight">
              Dashboard
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Session Indicator Chip */}
            {previewMode ? (
              <div className="hidden lg:flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs text-warning">
                <span className="size-2 rounded-full bg-warning animate-pulse" />
                <span>Demo Preview Mode</span>
              </div>
            ) : user ? (
              <div className="hidden lg:flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
                <span className="size-2 rounded-full bg-success" />
                <span className="truncate max-w-[160px]" title={user.email ?? ""}>
                  {user.email ?? "Active Session"}
                </span>
              </div>
            ) : null}

            {/* Refresh Button */}
            {!previewMode && (
              <button
                type="button"
                onClick={fetchDashboardData}
                disabled={isFetching}
                aria-label="Refresh dashboard metrics"
                title="Refresh metrics"
                className="inline-flex min-w-[38px] min-h-[38px] size-9 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-all duration-200 hover:border-border-strong hover:text-accent active:scale-95 disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <svg
                  className={`size-4 ${isFetching ? "animate-spin text-accent" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            )}

            {/* Desktop link to Assistant */}
            <Link
              href="/assistant"
              className="hidden md:inline-flex min-h-[38px] items-center justify-center rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold text-background shadow-sm hover:opacity-90 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Assistant
            </Link>

            <ThemeToggle />

            {/* Profile & Settings Link */}
            <Link
              href="/settings#profile"
              className="relative inline-flex min-w-[38px] min-h-[38px] size-9 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-all duration-200 hover:border-border-strong hover:text-accent active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Profile and Settings"
              title="Profile & Settings"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 font-inter pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-12">
        {/* Demo Mode Notice Banner */}
        {previewMode && (
          <div className="rounded-xl border border-warning/30 bg-warning/10 p-3.5 sm:p-4 text-xs sm:text-sm text-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-warning shrink-0" />
              <span>
                <strong>Demo Preview Mode:</strong> Showing simulated business data because Supabase authentication is not yet configured in <code className="font-mono text-accent">.env.local</code>.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPreviewMode(false)}
              className="text-xs font-semibold underline text-foreground hover:text-accent cursor-pointer self-start sm:self-auto"
            >
              Exit Preview
            </button>
          </div>
        )}

        {/* Banner Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
              Business Overview
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Live financial summary, inventory, and activity for your business.
            </p>
          </div>
          {lastRefreshedAt && !previewMode && (
            <div className="text-[11px] sm:text-xs text-muted flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-accent" />
              <span>
                Updated at{" "}
                {lastRefreshedAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>

        {/* Global Error Banner (with actionable backend setup guidance if auth failed) */}
        {fetchError && !previewMode && (
          <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-xs sm:text-sm text-error space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <svg
                  className="size-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className="font-medium">{fetchError}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={fetchDashboardData}
                  disabled={isFetching}
                  className="underline font-medium hover:opacity-80 cursor-pointer disabled:opacity-50"
                >
                  {isFetching ? "Retrying..." : "Retry"}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode(true)}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-foreground hover:border-border-strong transition-all cursor-pointer"
                >
                  Switch to Demo Preview
                </button>
              </div>
            </div>

            {fetchError.toLowerCase().includes("authentication service is not configured") && (
              <div className="pt-2 text-xs text-foreground/80 border-t border-error/20 space-y-1">
                <p>
                  <strong>Backend Configuration Tip:</strong> The FastAPI backend returned HTTP 401 because <code className="font-mono text-foreground font-semibold">SUPABASE_URL</code> is missing or unconfigured in <code className="font-mono text-foreground font-semibold">backend-engine/.env</code>.
                </p>
                <p className="text-muted">
                  Ensure <code className="font-mono text-foreground">backend-engine/.env</code> contains <code className="font-mono text-accent">SUPABASE_URL={process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kovjpgflputeexnzwizu.supabase.co"}</code> to verify ES256 auth tokens via Supabase JWKS.
                </p>
              </div>
            )}

            {fetchError.toLowerCase().includes("temporarily unavailable") && (
              <div className="pt-2 text-xs text-foreground/80 border-t border-error/20">
                <strong>JWKS Key Fetch Tip:</strong> The backend was unable to reach the Supabase JWKS endpoint (<code className="font-mono">/auth/v1/.well-known/jwks.json</code>). Please check network access to your Supabase project.
              </div>
            )}

            {(fetchError.toLowerCase().includes("could not reach backend") ||
              fetchError.toLowerCase().includes("unable to connect")) && (
              <div className="pt-2 text-xs text-foreground/80 border-t border-error/20">
                <strong>Backend Service Tip:</strong> Verify that the FastAPI backend server is running locally on <code className="font-mono text-foreground font-semibold">http://localhost:8000</code>.
              </div>
            )}
          </div>
        )}

        {/* 4 Overview Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Today's Sales */}
          <div className="rounded-2xl border border-border bg-surface/60 p-5 space-y-3 transition-colors hover:border-border-strong">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Today&apos;s Sales
              </span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>

            {isFetching && !previewMode ? (
              <div className="space-y-2 py-1">
                <div className="h-7 w-28 bg-surface rounded animate-pulse" />
                <div className="h-3 w-20 bg-surface rounded animate-pulse" />
              </div>
            ) : (
              <div className="space-y-1">
                <div className="font-display font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
                  {formatMoney(sales?.amount ?? 0, sales?.currency)}
                </div>
                <div className="text-xs text-muted">
                  {(sales?.count ?? 0) > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-foreground">
                      <span className="size-1.5 rounded-full bg-success" />
                      {sales?.count} {sales?.count === 1 ? "sale" : "sales"} today
                    </span>
                  ) : (
                    "0 sales recorded today"
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Today's Expenses */}
          <div className="rounded-2xl border border-border bg-surface/60 p-5 space-y-3 transition-colors hover:border-border-strong">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Today&apos;s Expenses
              </span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-foreground/10 text-foreground">
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                  />
                </svg>
              </div>
            </div>

            {isFetching && !previewMode ? (
              <div className="space-y-2 py-1">
                <div className="h-7 w-28 bg-surface rounded animate-pulse" />
                <div className="h-3 w-20 bg-surface rounded animate-pulse" />
              </div>
            ) : (
              <div className="space-y-1">
                <div className="font-display font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
                  {formatMoney(expenses?.amount ?? 0, expenses?.currency)}
                </div>
                <div className="text-xs text-muted">
                  {(expenses?.count ?? 0) > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-foreground">
                      <span className="size-1.5 rounded-full bg-accent" />
                      {expenses?.count}{" "}
                      {expenses?.count === 1 ? "expense" : "expenses"} today
                    </span>
                  ) : (
                    "0 expenses recorded today"
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Customer Debt */}
          <div className="rounded-2xl border border-border bg-surface/60 p-5 space-y-3 transition-colors hover:border-border-strong">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Customer Debt
              </span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-warning/15 text-warning">
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>

            {isFetching && !previewMode ? (
              <div className="space-y-2 py-1">
                <div className="h-7 w-28 bg-surface rounded animate-pulse" />
                <div className="h-3 w-20 bg-surface rounded animate-pulse" />
              </div>
            ) : (
              <div className="space-y-1">
                <div className="font-display font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
                  {formatMoney(debt?.total ?? 0, debt?.currency)}
                </div>
                <div className="text-xs text-muted">
                  {(debt?.total ?? 0) > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-warning font-medium">
                      {debt?.customers.length ?? 0}{" "}
                      {(debt?.customers.length ?? 0) === 1
                        ? "customer owes"
                        : "customers owe"}
                    </span>
                  ) : (
                    "No outstanding debt"
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Inventory Overview */}
          <div className="rounded-2xl border border-border bg-surface/60 p-5 space-y-3 transition-colors hover:border-border-strong">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Inventory
              </span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-surface-strong text-foreground">
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>

            {isFetching && !previewMode ? (
              <div className="space-y-2 py-1">
                <div className="h-7 w-28 bg-surface rounded animate-pulse" />
                <div className="h-3 w-20 bg-surface rounded animate-pulse" />
              </div>
            ) : (
              <div className="space-y-1">
                <div className="font-display font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
                  {inventory?.total_items ?? 0}{" "}
                  <span className="text-base font-normal text-muted">
                    {(inventory?.total_items ?? 0) === 1 ? "item" : "items"}
                  </span>
                </div>
                <div className="text-xs">
                  {(inventory?.low_stock_count ?? 0) > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-warning font-medium">
                      <span className="size-1.5 rounded-full bg-warning" />
                      {inventory?.low_stock_count}{" "}
                      {(inventory?.low_stock_count ?? 0) === 1
                        ? "low stock alert"
                        : "low stock alerts"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-muted">
                      <span className="size-1.5 rounded-full bg-success" />
                      All inventory levels healthy
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lower Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Column: Customer Debt & Inventory Breakdowns */}
          <div className="space-y-6 sm:space-y-8">
            {/* Section: Customer Debt Breakdown */}
            <section className="rounded-2xl border border-border bg-surface/50 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-semibold text-lg text-foreground">
                    Customer Debt Breakdown
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Customers with active receivable balances.
                  </p>
                </div>
                {debt && debt.customers.length > 0 && (
                  <span className="rounded-full bg-warning/15 px-2.5 py-0.5 text-[11px] font-medium text-warning">
                    {debt.customers.length} open
                  </span>
                )}
              </div>

              {isFetching && !previewMode ? (
                <div className="space-y-3 pt-2">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-14 rounded-xl border border-border bg-surface animate-pulse"
                    />
                  ))}
                </div>
              ) : debt && debt.customers.length > 0 ? (
                <div className="space-y-2.5 pt-1">
                  {debt.customers.map((c, idx) => (
                    <div
                      key={`${c.customer}-${idx}`}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background/50 hover:border-border-strong transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-accent/15 text-accent font-display font-semibold text-xs">
                          {c.customer.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">
                            {c.customer}
                          </div>
                          <div className="text-[11px] text-muted">
                            Receivable balance
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display font-bold text-sm text-foreground">
                          {formatMoney(c.amount, c.currency)}
                        </div>
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-warning">
                          Owed to business
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-border/60 bg-background/40 p-6 text-center space-y-2">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-success/15 text-success">
                    <svg
                      className="size-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="font-display font-medium text-sm text-foreground">
                    No outstanding customer debt
                  </div>
                  <p className="text-xs text-muted max-w-sm mx-auto">
                    All customer accounts are fully settled. Credit sales recorded
                    in Assistant will appear here.
                  </p>
                </div>
              )}
            </section>

            {/* Section: Inventory Breakdown / Low Stock Alerts */}
            <section className="rounded-2xl border border-border bg-surface/50 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-semibold text-lg text-foreground">
                    Inventory Breakdown
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Tracked items and low stock notifications.
                  </p>
                </div>
                {inventory && inventory.low_stock_count > 0 && (
                  <span className="rounded-full bg-warning/15 px-2.5 py-0.5 text-[11px] font-medium text-warning">
                    {inventory.low_stock_count} low
                  </span>
                )}
              </div>

              {isFetching && !previewMode ? (
                <div className="space-y-3 pt-2">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-14 rounded-xl border border-border bg-surface animate-pulse"
                    />
                  ))}
                </div>
              ) : inventory && inventory.items.length > 0 ? (
                <div className="space-y-2.5 pt-1">
                  {inventory.items.map((it, idx) => (
                    <div
                      key={`${it.item}-${idx}`}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background/50 hover:border-border-strong transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-surface-strong text-muted font-display font-semibold text-xs">
                          <svg
                            className="size-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground capitalize">
                            {it.item}
                          </div>
                          <div className="text-[11px] text-muted">
                            {it.quantity} {it.unit} remaining
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center rounded-full bg-warning/15 px-2.5 py-1 text-[11px] font-semibold text-warning">
                          Low Stock
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-border/60 bg-background/40 p-6 text-center space-y-2">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-success/15 text-success">
                    <svg
                      className="size-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="font-display font-medium text-sm text-foreground">
                    All inventory levels healthy
                  </div>
                  <p className="text-xs text-muted max-w-sm mx-auto">
                    No items are currently below low-stock thresholds. Manage
                    stock in Assistant with voice adjustments.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Recent Activity Feed */}
          <section className="rounded-2xl border border-border bg-surface/50 p-5 sm:p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-semibold text-lg text-foreground">
                    Recent Activity
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Chronological audit log of business events.
                  </p>
                </div>
                {recentActivity.length > 0 && (
                  <span className="rounded-full bg-surface-strong px-2.5 py-0.5 text-[11px] font-medium text-muted">
                    {recentActivity.length} events
                  </span>
                )}
              </div>

              {isFetching && !previewMode ? (
                <div className="space-y-3 pt-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-16 rounded-xl border border-border bg-surface animate-pulse"
                    />
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-2.5 pt-1">
                  {recentActivity.map((act) => {
                    const badge = getEventTypeBadge(act.type);
                    return (
                      <div
                        key={act.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background/50 hover:border-border-strong transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <span
                            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-medium text-foreground truncate">
                              {act.description}
                            </div>
                            <div className="text-[10px] sm:text-[11px] text-muted">
                              {formatTimestamp(act.timestamp)}
                            </div>
                          </div>
                        </div>

                        {act.amount !== null && act.amount !== undefined && (
                          <div className="text-right shrink-0">
                            <span
                              className={`font-display font-semibold text-xs sm:text-sm ${
                                act.type === "sale"
                                  ? "text-success"
                                  : act.type === "expense" || act.type === "purchase"
                                    ? "text-foreground"
                                    : "text-muted"
                              }`}
                            >
                              {act.type === "sale" ? "+" : ""}
                              {formatMoney(act.amount, act.currency || "ETB")}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-border/60 bg-background/40 p-6 text-center space-y-2.5">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-surface-strong text-muted">
                    <svg
                      className="size-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="font-display font-medium text-sm text-foreground">
                    No recent activity recorded
                  </div>
                  <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                    Transactions recorded in Assistant will automatically appear
                    here in chronological order.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border/60 flex items-center justify-between mt-4">
              <span className="text-xs text-muted">
                Need to record a new transaction?
              </span>
              <Link
                href="/assistant"
                className="inline-flex items-center justify-center rounded-full bg-surface hover:bg-surface-strong border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground hover:text-accent transition-colors"
              >
                Open Assistant &rarr;
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Persistent Mobile Bottom Navigation */}
      <AuthenticatedBottomNav />
    </div>
  );
}
