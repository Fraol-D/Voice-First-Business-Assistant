"use client";

import Link from "next/link";
import { MeriLogo } from "@/components/landing/meri-logo";
import { useTranslation } from "@/lib/i18n";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t border-border bg-surface-subtle text-foreground transition-colors duration-200">
      <div className="mx-auto max-w-[1240px] px-4 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Brand & Core Message */}
          <div className="max-w-sm">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-sm py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={t("nav.home")}
            >
              <MeriLogo />
            </Link>
            <p className="font-sans mt-3 text-sm leading-relaxed text-muted">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap gap-8 text-sm text-muted sm:gap-12">
            <div className="flex flex-col gap-3">
              <span className="font-display text-xs font-semibold uppercase tracking-wider text-foreground">
                {t("footer.product")}
              </span>
              <a
                href="#demo"
                className="rounded-sm transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t("footer.demo")}
              </a>
              <a
                href="#capabilities"
                className="rounded-sm transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t("footer.capabilities")}
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-display text-xs font-semibold uppercase tracking-wider text-foreground">
                {t("footer.experience")}
              </span>
              <Link
                href="/assistant"
                className="rounded-sm transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t("footer.assistant")}
              </Link>
              <a
                href="https://github.com/Fraol-D/Voice-First-Business-Assistant"
                target="_blank"
                rel="noreferrer"
                className="rounded-sm transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t("footer.github")}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 text-xs text-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Meri. {t("footer.copyright")}</p>
          <div className="flex items-center gap-2">
            <span>{t("footer.voicePoweredBy")}</span>
            <span className="font-medium text-foreground">Voxide</span>
            <span className="size-1.5 rounded-full bg-[#FE6904]" aria-hidden="true" />
          </div>
        </div>
      </div>
    </footer>
  );
}
