"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n";

export interface SaleExpenseCardProps {
  type?: "sale" | "expense";
  headline: string; // e.g. "3 shirts · ETB 900" or "Transport · ETB 400"
  timestamp?: string;
  subtitle?: string;
}

export function SaleExpenseCard({
  type = "sale",
  headline,
  timestamp,
  subtitle,
}: SaleExpenseCardProps) {
  const { t } = useTranslation();
  const isSale = type === "sale";
  const resolvedTimestamp = timestamp ?? t("common.justNow");

  return (
    <div className="assistant-card w-full">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className={`assistant-card-badge ${
            isSale ? "badge-sale" : "badge-expense"
          }`}
        >
          {isSale && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#FE6904] animate-pulse"
              aria-hidden="true"
            />
          )}
          {isSale ? t("cards.saleRecorded") : t("cards.expenseRecorded")}
        </span>
        <span className="card-timestamp">{resolvedTimestamp}</span>
      </div>
      <div className="card-amount">{headline}</div>
      {subtitle ? (
        <p className="text-xs text-muted mt-1.5 font-inter">{subtitle}</p>
      ) : (
        <p className="text-xs text-muted mt-1.5 font-inter">
          {isSale ? t("cards.salesBalanceNote") : t("cards.expenseLogsNote")}
        </p>
      )}
    </div>
  );
}

export interface InventoryCardProps {
  countText: string; // e.g. "17 shirts remaining"
  statusBadgeText?: string; // e.g. "In Stock"
  timestamp?: string;
  subtitle?: string;
}

export function InventoryCard({
  countText,
  statusBadgeText,
  timestamp,
  subtitle,
}: InventoryCardProps) {
  const { t } = useTranslation();
  const resolvedBadgeText = statusBadgeText ?? t("cards.inStock");
  const resolvedTimestamp = timestamp ?? t("cards.liveCount");
  const resolvedSubtitle = subtitle ?? t("cards.currentInventoryLevel");

  return (
    <div className="assistant-card w-full">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="assistant-card-badge badge-inventory">{t("cards.inventory")}</span>
        <div className="flex items-center gap-2">
          <span className="badge-status-stock inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40 px-2.5 py-0.5 text-[0.6875rem] font-semibold tracking-wide">
            <span
              className="badge-status-stock-dot w-1.5 h-1.5 rounded-full bg-[#16A34A] dark:bg-emerald-400"
              aria-hidden="true"
            />
            {resolvedBadgeText}
          </span>
          <span className="card-timestamp">{resolvedTimestamp}</span>
        </div>
      </div>
      <div className="card-amount">{countText}</div>
      <p className="text-xs text-muted mt-1.5 font-inter">{resolvedSubtitle}</p>
    </div>
  );
}

export interface ClarificationCardProps {
  question: string;
  options: string[];
  onSelectOption?: (option: string) => void;
  timestamp?: string;
}

export function ClarificationCard({
  question,
  options,
  onSelectOption,
  timestamp,
}: ClarificationCardProps) {
  const { t } = useTranslation();
  const resolvedTimestamp = timestamp ?? t("assistant.needsInput");

  return (
    <div className="assistant-card w-full">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="assistant-card-badge badge-clarification">
          {t("cards.needsClarification")}
        </span>
        <span className="card-timestamp">{resolvedTimestamp}</span>
      </div>
      <p className="text-sm sm:text-base text-foreground font-inter mb-3 leading-relaxed">
        {question}
      </p>
      <div className="flex flex-wrap gap-2 pt-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelectOption?.(option)}
            className="card-option-btn"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
