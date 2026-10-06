"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MeriLogo } from "@/components/landing/meri-logo";
import { useTranslation } from "@/lib/i18n";

export function Navbar() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = useMemo(
    () => [
      { href: "#demo", label: t("nav.demo") },
      { href: "#capabilities", label: t("nav.capabilities") },
      { href: "/assistant", label: t("nav.assistant"), isRoute: true },
    ],
    [t],
  );

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-border bg-background"
    >
      <div className="relative mx-auto flex h-16 w-full max-w-[1240px] items-center px-4 sm:px-8">
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-sm py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={t("nav.home")}
          >
            <MeriLogo />
          </Link>
        </div>

        {/* Zone 2: Center — Product, How it works, Assistant */}
        <nav
          className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-[15px] font-medium text-foreground"
          aria-label={t("nav.mainNavigation")}
        >
          {navLinks.map((link) =>
            link.isRoute ? (
              <Link
                key={link.href}
                href={link.href}
                className="group relative py-1 text-foreground transition-opacity duration-200 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-foreground transition-all duration-200 group-hover:w-full" />
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="group relative py-1 text-foreground transition-opacity duration-200 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-foreground transition-all duration-200 group-hover:w-full" />
              </a>
            ),
          )}
        </nav>

        {/* Zone 3: Right — Flush right (ml-auto) flex group holding LanguageSwitcher, ThemeToggle, CTA */}
        <div className="hidden md:flex ml-auto items-center gap-2.5">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            href="/assistant"
            className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-medium text-background shadow-sm shadow-accent/20 transition-all hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {t("nav.tryMeri")}
          </Link>
        </div>

        {/* Mobile hamburger icon on right */}
        <div className="flex md:hidden ml-auto items-center">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-all duration-200 hover:opacity-70 hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={t("nav.openMenu")}
            aria-expanded={isOpen}
          >
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Full-Screen Overlay / Sheet */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-background px-6 py-5 md:hidden animate-[enter-up_0.25s_ease-out_both]"
          role="dialog"
          aria-modal="true"
          aria-label={t("nav.mobileMenu")}
        >
          <div className="flex items-center justify-between border-b border-border pb-4">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1.5 rounded-sm py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={t("nav.home")}
            >
              <MeriLogo />
            </Link>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-all duration-200 hover:opacity-70 hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={t("nav.closeMenu")}
            >
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <nav className="mt-8 flex flex-col gap-6">
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="font-display text-2xl font-semibold tracking-tight text-foreground transition-opacity duration-200 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="font-display text-2xl font-semibold tracking-tight text-foreground transition-opacity duration-200 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                >
                  {link.label}
                </a>
              ),
            )}
          </nav>

          <div className="mt-auto border-t border-border pt-6 pb-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{t("nav.language")}</span>
              <LanguageSwitcher />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{t("nav.theme")}</span>
              <ThemeToggle />
            </div>
            <Link
              href="/assistant"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center rounded-full bg-accent py-3.5 text-base font-semibold text-background shadow-sm shadow-accent/20 transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {t("nav.tryMeri")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
