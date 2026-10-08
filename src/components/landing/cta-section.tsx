"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export function CtaSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-background py-20 lg:py-[120px]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[16px] border border-border bg-surface px-6 py-14 text-center sm:px-12 sm:py-18">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-[#6B6B6B] dark:text-[#A3A3A3]">
            {t("cta.badge")}
          </p>
          <h2 className="font-display mt-3 text-[32px] leading-[1.15] font-semibold tracking-[-0.025em] text-foreground sm:text-[38px] lg:text-[44px] lg:leading-[1.1] lg:tracking-[-0.03em]">
            {t("cta.title")}
          </h2>
          <p className="font-sans mx-auto mt-4 max-w-[560px] text-base leading-[1.6] text-[#6B6B6B] dark:text-[#A3A3A3] sm:text-[18px]">
            {t("cta.subtitle")}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 sm:mt-10">
            <Link
              href="/assistant"
              className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3 text-sm font-medium text-background shadow-sm shadow-accent/20 transition-all hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {t("cta.tryMeri")}
            </Link>

            <a
              href="#demo"
              className="inline-flex items-center justify-center rounded-full border border-border-strong bg-transparent px-6 py-3 text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent hover:bg-accent-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {t("cta.seeHowItWorks")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
