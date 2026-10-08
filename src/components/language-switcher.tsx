"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "pill" | "compact";
}

export function LanguageSwitcher({
  className = "",
  variant = "pill",
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useTranslation();

  const toggleLanguage = () => {
    const next: Locale = locale === "en" ? "am" : "en";
    setLocale(next);
  };

  const ariaLabel =
    locale === "en"
      ? t("switcher.switchToAmharic")
      : t("switcher.switchToEnglish");

  if (variant === "compact") {
    return (
      <button
        id="language-switcher-compact"
        type="button"
        onClick={toggleLanguage}
        className={`relative inline-flex size-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-all duration-200 hover:border-border-strong hover:bg-surface-strong cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        <span className="font-medium text-xs tracking-tight">
          {locale === "en" ? "አማ" : "EN"}
        </span>
      </button>
    );
  }

  return (
    <button
      id="language-switcher"
      type="button"
      onClick={toggleLanguage}
      className={`relative inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs font-medium text-foreground transition-all duration-200 hover:border-border-strong hover:bg-surface-strong cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <svg
        className="size-3.5 text-muted shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3.6 9h16.8M3.6 15h16.8" />
        <path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z" />
      </svg>
      <span className="font-semibold tracking-wide">
        {locale === "en" ? "አማርኛ" : "English"}
      </span>
    </button>
  );
}
