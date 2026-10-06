"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import { useTranslation } from "@/lib/i18n";

function TickerRow({
  sequenceRef,
  operations,
}: {
  sequenceRef?: RefObject<HTMLDivElement | null>;
  operations: string[];
}) {
  return (
    <div
      ref={sequenceRef}
      className="business-ticker-sequence flex w-max shrink-0 items-center gap-6 pr-6"
    >
      {operations.map((operation) => (
        <span key={operation} className="flex items-center gap-6 whitespace-nowrap">
          <span className="font-display text-[11px] font-semibold tracking-[0.16em] text-muted">
            {operation}
          </span>
          <span className="signal-ticker-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </span>
      ))}
    </div>
  );
}

export function BusinessTicker() {
  const { t } = useTranslation();
  const sequenceRef = useRef<HTMLDivElement>(null);
  const [sequenceWidth, setSequenceWidth] = useState(0);
  const [copyCount, setCopyCount] = useState(2);

  const operations = useMemo(
    () => [
      t("ticker.sales"),
      t("ticker.expenses"),
      t("ticker.purchases"),
      t("ticker.inventory"),
      t("ticker.customerDebt"),
      t("ticker.businessInsights"),
    ],
    [t],
  );

  useEffect(() => {
    const sequence = sequenceRef.current;
    if (!sequence) return;

    const updateCopies = () => {
      const width = sequence.getBoundingClientRect().width;
      if (!width) return;
      setSequenceWidth(width);
      setCopyCount(Math.max(2, Math.ceil((window.innerWidth + width) / width)));
    };

    updateCopies();
    const observer = new ResizeObserver(updateCopies);
    observer.observe(sequence);
    window.addEventListener("resize", updateCopies);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateCopies);
    };
  }, [operations]);

  return (
    <div className="business-ticker border-y border-border bg-surface-subtle" aria-label={t("ticker.ariaLabel")}>
      <div
        className="business-ticker-track flex w-max py-4"
        style={{ "--ticker-distance": `-${sequenceWidth}px` } as CSSProperties}
      >
        {Array.from({ length: copyCount }, (_, index) => (
          <TickerRow
            key={index}
            sequenceRef={index === 0 ? sequenceRef : undefined}
            operations={operations}
          />
        ))}
      </div>
    </div>
  );
}
