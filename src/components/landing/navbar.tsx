"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MeriLogo } from "@/components/landing/meri-logo";
import { useAuth } from "@/lib/auth/auth-context";
import { useTranslation } from "@/lib/i18n";

export function Navbar() {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();

  const publicNavLinks = [
    { href: "#demo", label: t("nav.demo") },
    { href: "#capabilities", label: t("nav.capabilities") },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background pt-[env(safe-area-inset-top,0px)]">
      <div className="relative mx-auto flex h-16 w-full max-w-[1240px] items-center px-4 sm:px-8">
        {/* Left: Meri logo */}
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-sm py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={t("nav.home")}
          >
            <MeriLogo />
          </Link>
        </div>

        {/* Zone 2: Center — Demo, Capabilities, Dashboard */}
        <nav
          className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-[15px] font-medium text-foreground"
          aria-label={t("nav.mainNavigation")}
        >
          {publicNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative py-1 text-foreground transition-opacity duration-200 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-foreground transition-all duration-200 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Zone 3: Right — Assistant, Theme, Profile */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Desktop-only Auth & CTA */}
          <div className="hidden items-center gap-2 md:flex">
            {!isLoading && user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/assistant"
                  className="inline-flex h-10 items-center justify-center rounded-full bg-accent px-4 text-sm font-medium text-background shadow-sm shadow-accent/20 transition-all hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {t("nav.assistant")}
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:border-border-strong hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-foreground hover:opacity-70 transition-opacity"
                >
                  Sign In
                </Link>

                <Link
                  href="/assistant"
                  className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-medium text-background shadow-sm shadow-accent/20 transition-all hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {t("nav.assistant")}
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-l border-border pl-3">
            <ThemeToggle className="size-10 min-h-10 min-w-10" />
            <LanguageSwitcher variant="compact" />
          </div>

          {/* Far Right: Profile Button */}
          <Link
            href="/settings#profile"
            className="relative ml-2 inline-flex size-10 min-h-10 min-w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-all duration-200 hover:border-border-strong hover:text-accent active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Profile and Settings"
            title="Profile & Settings"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-4 sm:size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>

            {!isLoading && user && (
              <span
                className="absolute top-2.5 right-2.5 size-2 rounded-full bg-accent ring-2 ring-surface"
                aria-hidden="true"
              />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}