"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useTranslation } from "@/lib/i18n";

export function ProductVisualization() {
  const { t } = useTranslation();
  const [activeScenario, setActiveScenario] = useState(0);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [run, setRun] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const scenarios = useMemo(
    () => [
      {
        id: "sale",
        label: t("demo.recordSale"),
        prompt: t("demo.salePrompt"),
        intent: t("demo.saleIntent"),
        detail: t("demo.saleDetail"),
        response: t("demo.saleResponse"),
      },
      {
        id: "inventory",
        label: t("demo.checkInventory"),
        prompt: t("demo.inventoryPrompt"),
        intent: t("demo.inventoryIntent"),
        detail: t("demo.inventoryDetail"),
        response: t("demo.inventoryResponse"),
      },
      {
        id: "debt",
        label: t("demo.trackDebt"),
        prompt: t("demo.debtPrompt"),
        intent: t("demo.debtIntent"),
        detail: t("demo.debtDetail"),
        response: t("demo.debtResponse"),
      },
    ],
    [t],
  );

  const scenario = scenarios[activeScenario] || scenarios[0];

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          setRun((value) => value + 1);
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const first = window.setTimeout(() => setStep(2), 650);
    const second = window.setTimeout(() => setStep(3), 1400);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [run, activeScenario]);

  function replay() {
    setStep(1);
    setRun((value) => value + 1);
  }

  function chooseScenario(index: number) {
    setActiveScenario(index);
    setStep(1);
    setRun((value) => value + 1);
  }

  return (
    <section id="demo" className="scroll-mt-20 bg-surface-subtle py-20 lg:py-[120px]">
      <div ref={sectionRef} className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <div className="mx-auto max-w-[680px] text-center">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-accent">
            {t("demo.badge")}
          </p>
          <h2 className="mt-3 font-display text-[32px] leading-[1.15] font-semibold tracking-[-0.025em] text-foreground sm:text-[38px] lg:text-[44px]">
            {t("demo.title")}
          </h2>
          <p className="mt-4 text-base leading-[1.6] text-muted sm:text-[18px]">
            {t("demo.subtitle")}
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2.5">
          {scenarios.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => chooseScenario(index)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all sm:text-sm ${
                activeScenario === index
                  ? "bg-accent text-background shadow-sm shadow-accent/20"
                  : "border border-border bg-surface text-muted hover:border-accent/50 hover:text-foreground"
              }`}
              aria-pressed={activeScenario === index}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-[1080px] overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-[0_20px_60px_rgba(0,0,0,0.16)] sm:p-8">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-accent" />
              <span className="font-display text-xs font-semibold uppercase tracking-wider text-muted">
                {t("demo.assistantHeader")}
              </span>
            </div>
            <button
              type="button"
              onClick={replay}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {t("demo.replay")}
            </button>
          </div>

          <div className="grid items-center gap-8 pt-8 lg:grid-cols-[1fr_auto_1fr]">
            <div className="rounded-xl border border-border bg-background p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                {t("demo.youSay")}
              </p>
              <p className="mt-4 text-lg leading-relaxed text-foreground">
                “{scenario.prompt}”
              </p>
              <div className="mt-5 flex items-center gap-2 text-xs text-accent">
                <span className="flex h-5 items-end gap-0.5" aria-hidden="true">
                  <span className="h-2 w-0.5 rounded-full bg-accent animate-pulse" />
                  <span className="h-4 w-0.5 rounded-full bg-accent animate-pulse [animation-delay:120ms]" />
                  <span className="h-3 w-0.5 rounded-full bg-accent animate-pulse [animation-delay:240ms]" />
                </span>
                {t("demo.voiceInput")}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div
                className={`relative flex size-32 items-center justify-center rounded-full border border-accent/60 shadow-[0_0_44px_rgba(254,105,4,0.22)] orb-breathe-animation ${step === 2 ? "ring-2 ring-accent/40" : ""}`}
                style={{ background: "var(--orb-bg-gradient)" }}
              >
                <div
                  className={`flex size-16 items-center justify-center rounded-full border border-accent/50 transition-all duration-500 ${step === 2 ? "shadow-[0_0_24px_rgba(254,105,4,0.45)]" : ""}`}
                  style={{ backgroundColor: "var(--orb-inner-bg-active)" }}
                >
                  {step === 2 ? (
                    <div className="flex items-center gap-1" aria-label={t("demo.meriThinking")}>
                      <span className="size-2 rounded-full bg-accent animate-pulse" />
                      <span className="size-2 rounded-full bg-accent animate-pulse [animation-delay:150ms]" />
                      <span className="size-2 rounded-full bg-accent animate-pulse [animation-delay:300ms]" />
                    </div>
                  ) : (
                    <svg className="size-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15a3 3 0 003-3V6a3 3 0 00-6 0v6a3 3 0 003 3z" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs text-muted">
                {step === 2 ? t("demo.understanding") : t("demo.readyWhenYouAre")}
              </span>
            </div>

            <div className={`rounded-xl border border-accent/30 bg-accent-dim p-5 transition-all duration-500 ${step === 3 ? "opacity-100 translate-y-0" : "opacity-50 translate-y-1"}`}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                {t("demo.meriResponds")}
              </p>
              <p className="mt-4 font-display text-xl font-semibold tracking-tight text-foreground">
                {scenario.detail}
              </p>
              <p className="mt-2 text-sm text-muted">{scenario.response}</p>
              <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-accent">
                <span className="size-1.5 rounded-full bg-accent" />
                {scenario.intent}
              </div>
            </div>
          </div>

          <p className="mt-8 border-t border-border pt-4 text-center text-xs text-muted">
            {t("demo.disclaimer")}
          </p>
        </div>
      </div>
    </section>
  );
}
