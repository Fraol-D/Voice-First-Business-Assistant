"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section id="hero" className="relative overflow-hidden py-20 lg:py-[120px]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <div className="mx-auto max-w-[760px] text-center">
          <p className="enter-up font-display text-xs font-semibold uppercase tracking-[0.12em] text-accent">
            {t("hero.badge")}
          </p>
          <h1
            className="enter-up mt-4 font-display text-[42px] leading-[1.08] font-bold tracking-[-0.035em] text-foreground sm:text-[54px] sm:leading-[1.06] lg:text-[64px] lg:leading-[1.05] lg:tracking-[-0.04em]"
            style={{ animationDelay: "80ms" }}
          >
            {t("hero.title")}
          </h1>
          <p
            className="enter-up mx-auto mt-6 max-w-xl text-base leading-[1.6] text-muted sm:text-[18px]"
            style={{ animationDelay: "140ms" }}
          >
            {t("hero.subtitle")}
          </p>
          <div
            className="enter-up mt-8 flex flex-wrap items-center justify-center gap-3.5 sm:mt-10"
            style={{ animationDelay: "200ms" }}
          >
            <Link
              href="/assistant"
              className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3 text-sm font-medium text-background shadow-sm shadow-accent/20 transition-all hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {t("hero.tryMeri")}
            </Link>
            <a
              href="#demo"
              className="inline-flex items-center justify-center rounded-full border border-border-strong bg-transparent px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent hover:bg-accent-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {t("hero.seeHowItWorks")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
