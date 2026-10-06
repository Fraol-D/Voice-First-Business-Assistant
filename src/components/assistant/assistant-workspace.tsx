"use client";

import React, { useState, useRef, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { VoiceOrb } from "./voice-orb";
import { SaleExpenseCard, ClarificationCard } from "./structured-cards";
import {
  createEvent,
  healthCheck,
  interpretText,
  queryBusiness,
} from "@/lib/api/client";
import type {
  CreateEventRequest,
  EventType,
  InterpretationEventData,
} from "@/lib/api/types";
import { MVP_BUSINESS_ID } from "@/lib/config";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/lib/i18n";

export type FeedItem =
  | {
      id: string;
      kind: "user";
      text: string;
      timestamp: string;
    }
  | {
      id: string;
      kind: "assistant-sale-expense";
      type: "sale" | "expense";
      headline: string;
      subtitle?: string;
      timestamp: string;
    }
  | {
      id: string;
      kind: "assistant-note";
      badge: string;
      tone: "answer" | "error";
      text: string;
      timestamp: string;
      queryType?: string;
      result?: unknown;
    }
  | {
      id: string;
      kind: "assistant-clarification";
      question: string;
      options: string[];
      timestamp: string;
    };

const INPUT_CLASS =
  "w-full rounded-xl border border-border bg-surface-subtle px-3.5 py-2 text-foreground outline-none focus:border-accent";

type PendingEvent = {
  request: CreateEventRequest;
  summary: string;
  headline: string;
  card: "sale" | "expense" | "note";
  source?: "text" | "manual";
};

type PendingClarification = {
  originalText: string;
  question: string;
  missingFields: string[];
};

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function textValue(data: InterpretationEventData, key: string): string | null {
  const value = data[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberValue(data: InterpretationEventData, key: string): number | null {
  const value = data[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isLikelyNewRequest(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  const newRequestPrefixes = [
    "how ",
    "what ",
    "who ",
    "where ",
    "when ",
    "i sold ",
    "i bought ",
    "i spent ",
    "i lost ",
    "record ",
    "add ",
  ];
  return newRequestPrefixes.some((prefix) => normalized.startsWith(prefix));
}

function buildClarificationContinuation(
  pending: PendingClarification,
  answer: string,
): string {
  return [
    `Original user statement: ${pending.originalText}`,
    `Clarification question: ${pending.question}`,
    `Missing fields: ${pending.missingFields.join(", ")}`,
    `User clarification answer: ${answer}`,
    "Resolve the original request using the clarification answer.",
  ].join("\n");
}

function pendingEventFromInterpretation(
  eventType: EventType,
  data: InterpretationEventData,
  t: (key: string, values?: Record<string, string | number>) => string,
  locale: string,
): PendingEvent | null {
  const currency = textValue(data, "currency")?.toUpperCase() ?? "ETB";
  if (eventType === "sale" || eventType === "purchase") {
    const item = textValue(data, "item");
    const quantity = numberValue(data, "quantity");
    const amount = numberValue(data, "amount");
    if (!item || quantity === null || amount === null) return null;
    const isSale = eventType === "sale";
    return {
      request: {
        business_id: MVP_BUSINESS_ID,
        language: locale,
        event_type: eventType,
        data: { ...data, currency },
      },
      summary: isSale
        ? t("cards.saleSummary", { quantity, item, amount })
        : t("cards.purchaseSummary", { quantity, item, amount }),
      headline: isSale
        ? t("cards.saleHeadline", { quantity, item, amount })
        : t("cards.purchaseHeadline", { quantity, item, amount }),
      card: isSale ? "sale" : "note",
      source: "text",
    };
  }

  if (eventType === "expense") {
    const description = textValue(data, "description");
    const amount = numberValue(data, "amount");
    if (!description || amount === null) return null;
    return {
      request: {
        business_id: MVP_BUSINESS_ID,
        language: locale,
        event_type: eventType,
        data: { ...data, currency },
      },
      summary: t("cards.expenseSummary", { description, amount }),
      headline: t("cards.expenseHeadline", { description, amount }),
      card: "expense",
      source: "text",
    };
  }

  if (eventType === "inventory_adjustment") {
    const item = textValue(data, "item");
    const quantity = numberValue(data, "quantity");
    if (!item || quantity === null || quantity === 0) return null;
    const reason = textValue(data, "reason") ?? "adjustment";
    return {
      request: {
        business_id: MVP_BUSINESS_ID,
        language: locale,
        event_type: eventType,
        data,
      },
      summary: t("cards.inventorySummary", { quantity, item, reason }),
      headline: t("cards.inventoryHeadline", { quantity, item }),
      card: "note",
      source: "text",
    };
  }

  const customer = textValue(data, "customer");
  const amount = numberValue(data, "amount");
  const direction = textValue(data, "direction");
  if (!customer || amount === null || !direction) return null;
  const directionLabel =
    direction === "owed_to_business"
      ? t("cards.debtDirectionOwedToBusiness")
      : t("cards.debtDirectionOwedByBusiness");
  return {
    request: {
      business_id: MVP_BUSINESS_ID,
      language: locale,
      event_type: eventType,
      data: { ...data, currency },
    },
    summary: t("cards.debtSummary", { customer, amount, direction: directionLabel }),
    headline: t("cards.debtHeadline", { customer, amount }),
    card: "note",
    source: "text",
  };
}

function positiveNumber(
  value: string,
  label: string,
  customError?: string,
): number | string {
  const parsed = Number(value);
  if (!value.trim() || !Number.isFinite(parsed) || parsed <= 0) {
    return customError || `${label} must be greater than zero.`;
  }
  return parsed;
}

function withSelectedDate(
  data: Record<string, string | number | null>,
  date: string,
) {
  const selected = date.trim();
  if (selected) {
    data.date = selected;
  }
  return data;
}

export function AssistantWorkspace() {
  const { t, locale } = useTranslation();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [querying, setQuerying] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"ok" | "checking" | "offline">("checking");
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingEvent, setPendingEvent] = useState<PendingEvent | null>(null);
  const [pendingClarification, setPendingClarification] =
    useState<PendingClarification | null>(null);

  const [manualEventType, setManualEventType] = useState<EventType>("sale");
  const [manualItem, setManualItem] = useState("");
  const [manualQuantity, setManualQuantity] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualCustomer, setManualCustomer] = useState("");
  const [manualSupplier, setManualSupplier] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [manualCategory, setManualCategory] = useState("");
  const [manualReason, setManualReason] = useState("");
  const [manualDirection, setManualDirection] = useState("owed_to_business");
  const [manualDate, setManualDate] = useState("");

  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    let active = true;

    const runHealthCheck = () => {
      healthCheck()
        .then((res) => {
          if (!active) return;
          setBackendStatus(res.ok && res.data.status === "ok" ? "ok" : "offline");
        })
        .catch(() => {
          if (active) setBackendStatus("offline");
        });
    };

    runHealthCheck();

    const intervalId = window.setInterval(runHealthCheck, 15000);
    window.addEventListener("focus", runHealthCheck);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", runHealthCheck);
    };
  }, []);

  const scrollToBottom = () => {
    if (feedRef.current) {
      feedRef.current.scrollTo({
        top: feedRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [feedItems, querying]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const handleNativeInput = () => {
      setInputText(el.value);
    };
    el.addEventListener("input", handleNativeInput);
    return () => {
      el.removeEventListener("input", handleNativeInput);
    };
  }, []);

  function pushFeed(item: FeedItem) {
    setFeedItems((prev) => [...prev, item]);
  }

  async function submitText(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed || busyRef.current) return;
    busyRef.current = true;
    setQuerying(true);
    pushFeed({
      id: nextId("user"),
      kind: "user",
      text: trimmed,
      timestamp: t("common.justNow"),
    });
    setInputText("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }

    try {
      const continuesClarification =
        pendingClarification && !isLikelyNewRequest(trimmed)
          ? pendingClarification
          : null;
      const interpretationText = pendingClarification
        ? isLikelyNewRequest(trimmed)
          ? trimmed
          : continuesClarification
            ? buildClarificationContinuation(continuesClarification, trimmed)
            : trimmed
        : trimmed;
      const result = await interpretText(interpretationText, locale);
      if (!result.ok) {
        if (result.kind === "clarification") {
          pushFeed({
            id: nextId("clarification"),
            kind: "assistant-clarification",
            question: result.message,
            options: result.missing_fields ?? [],
            timestamp: t("assistant.needsInput"),
          });
        } else {
          pushFeed({
            id: nextId("error"),
            kind: "assistant-note",
            badge: t("assistant.couldNotComplete"),
            tone: "error",
            text: result.message,
            timestamp: t("common.justNow"),
          });
        }
        return;
      }
      setPendingClarification(null);

      if (result.data.type === "clarification") {
        setPendingClarification({
          originalText: continuesClarification?.originalText ?? trimmed,
          question: result.data.question,
          missingFields: result.data.missing_fields,
        });
        pushFeed({
          id: nextId("clarification"),
          kind: "assistant-clarification",
          question: result.data.question,
          options: result.data.missing_fields ?? [],
          timestamp: t("assistant.needsInput"),
        });
        return;
      }

      if (result.data.type === "create_event") {
        const event = pendingEventFromInterpretation(
          result.data.event_type,
          result.data.data,
          t,
          locale,
        );
        if (!event) {
          pushFeed({
            id: nextId("error"),
            kind: "assistant-note",
            badge: t("assistant.couldNotComplete"),
            tone: "error",
            text: t("assistant.engineIncompleteError"),
            timestamp: t("common.justNow"),
          });
          return;
        }
        setPendingEvent(event);
        setIsManualModalOpen(true);
        return;
      }

      const queryResult = await queryBusiness({
        business_id: MVP_BUSINESS_ID,
        language: locale,
        query: result.data.query,
      });
      if (!queryResult.ok) {
        if (queryResult.kind === "clarification") {
          pushFeed({
            id: nextId("clarification"),
            kind: "assistant-clarification",
            question: queryResult.message,
            options: queryResult.missing_fields ?? [],
            timestamp: t("assistant.needsInput"),
          });
        } else {
          pushFeed({
            id: nextId("error"),
            kind: "assistant-note",
            badge: t("assistant.couldNotComplete"),
            tone: "error",
            text: queryResult.message,
            timestamp: t("common.justNow"),
          });
        }
        return;
      }
      pushFeed({
        id: nextId("answer"),
        kind: "assistant-note",
        badge: t("assistant.recorded"),
        tone: "answer",
        text: queryResult.data.message,
        timestamp: t("common.justNow"),
        queryType: queryResult.data.query_type,
        result: queryResult.data.result,
      });
    } finally {
      busyRef.current = false;
      setQuerying(false);
    }
  }

  const handleChatSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const rawVal = inputRef.current ? inputRef.current.value : inputText;
    void submitText(rawVal || inputText);
  };

  const handleClarificationOption = (option: string) => {
    setInputText(option);
    if (inputRef.current) {
      inputRef.current.value = option;
      inputRef.current.focus();
    }
  };

  function buildManualEvent(): PendingEvent | { error: string } {
    const data: Record<string, string | number | null> = {};
    withSelectedDate(data, manualDate);

    if (manualEventType === "sale" || manualEventType === "purchase") {
      const item = manualItem.trim();
      if (!item) return { error: t("validation.enterItem") };
      const quantity = positiveNumber(manualQuantity, "Quantity", t("validation.enterQuantity"));
      if (typeof quantity === "string") return { error: quantity };
      const amount = positiveNumber(manualAmount, "Amount", t("validation.enterAmount"));
      if (typeof amount === "string") return { error: amount };
      data.item = item;
      data.quantity = quantity;
      data.amount = amount;
      data.currency = "ETB";
      if (manualEventType === "sale") {
        const customer = manualCustomer.trim();
        if (customer) data.customer = customer;
        return {
          request: {
            business_id: MVP_BUSINESS_ID,
            language: locale,
            event_type: "sale",
            data,
          },
          summary: t("cards.saleSummary", { quantity, item, amount }),
          headline: t("cards.saleHeadline", { quantity, item, amount }),
          card: "sale",
        };
      }
      const supplier = manualSupplier.trim();
      if (supplier) data.supplier = supplier;
      return {
        request: {
          business_id: MVP_BUSINESS_ID,
          language: locale,
          event_type: "purchase",
          data,
        },
        summary: t("cards.purchaseSummary", { quantity, item, amount }),
        headline: t("cards.purchaseHeadline", { quantity, item, amount }),
        card: "note",
      };
    }

    if (manualEventType === "expense") {
      const description = manualDescription.trim();
      if (!description) return { error: t("validation.enterExpenseDesc") };
      const amount = positiveNumber(manualAmount, "Amount", t("validation.enterAmount"));
      if (typeof amount === "string") return { error: amount };
      data.description = description;
      data.amount = amount;
      data.currency = "ETB";
      const category = manualCategory.trim();
      if (category) data.category = category;
      return {
        request: {
          business_id: MVP_BUSINESS_ID,
          language: locale,
          event_type: "expense",
          data,
        },
        summary: t("cards.expenseSummary", { description, amount }),
        headline: t("cards.expenseHeadline", { description, amount }),
        card: "expense",
      };
    }

    if (manualEventType === "inventory_adjustment") {
      const item = manualItem.trim();
      if (!item) return { error: t("validation.enterItem") };
      const reason = manualReason.trim();
      if (!reason) return { error: t("validation.enterReason") };
      const quantity = Number(manualQuantity);
      if (!manualQuantity.trim() || !Number.isFinite(quantity) || quantity === 0) {
        return {
          error: t("validation.enterAdjustmentQuantity"),
        };
      }
      data.item = item;
      data.quantity = quantity;
      data.reason = reason;
      return {
        request: {
          business_id: MVP_BUSINESS_ID,
          language: locale,
          event_type: "inventory_adjustment",
          data,
        },
        summary: t("cards.inventorySummary", { quantity, item, reason }),
        headline: t("cards.inventoryHeadline", { quantity, item }),
        card: "note",
      };
    }

    const customer = manualCustomer.trim();
    if (!customer) return { error: t("validation.enterCustomer") };
    const amount = positiveNumber(manualAmount, "Amount", t("validation.enterAmount"));
    if (typeof amount === "string") return { error: amount };
    if (
      manualDirection !== "owed_to_business" &&
      manualDirection !== "owed_by_business"
    ) {
      return {
        error: t("validation.chooseDebtDirection"),
      };
    }
    data.customer = customer;
    data.amount = amount;
    data.currency = "ETB";
    data.direction = manualDirection;
    const directionLabel =
      manualDirection === "owed_to_business"
        ? t("cards.debtDirectionOwedToBusiness")
        : t("cards.debtDirectionOwedByBusiness");
    return {
      request: {
        business_id: MVP_BUSINESS_ID,
        language: locale,
        event_type: "customer_debt",
        data,
      },
      summary: t("cards.debtSummary", { customer, amount, direction: directionLabel }),
      headline: t("cards.debtHeadline", { customer, amount }),
      card: "note",
    };
  }

  function handleReview(event: FormEvent) {
    event.preventDefault();
    const built = buildManualEvent();
    if ("error" in built) {
      setFormError(built.error);
      setPendingEvent(null);
      setPendingClarification(null);
      return;
    }
    setFormError(null);
    setPendingEvent(built);
  }

  async function confirmManualEvent() {
    if (!pendingEvent || busyRef.current) return;
    busyRef.current = true;
    setManualSubmitting(true);
    setFormError(null);
    try {
      const result = await createEvent(pendingEvent.request);
      if (!result.ok) {
        setFormError(result.message);
        if (result.kind === "clarification") {
          pushFeed({
            id: nextId("clarification"),
            kind: "assistant-clarification",
            question: result.message,
            options: result.missing_fields ?? [],
            timestamp: t("assistant.needsInput"),
          });
        }
        return;
      }

      if (pendingEvent.card === "note") {
        pushFeed({
          id: nextId("event"),
          kind: "assistant-note",
          badge: t("assistant.recorded"),
          tone: "answer",
          text: result.data.message,
          timestamp: t("common.justNow"),
        });
      } else {
        pushFeed({
          id: nextId("event"),
          kind: "assistant-sale-expense",
          type: pendingEvent.card,
          headline: pendingEvent.headline,
          subtitle: result.data.message,
          timestamp: t("common.justNow"),
        });
      }
      setPendingEvent(null);
      setIsManualModalOpen(false);
      setManualItem("");
      setManualQuantity("");
      setManualAmount("");
      setManualCustomer("");
      setManualSupplier("");
      setManualDescription("");
      setManualCategory("");
      setManualReason("");
      setManualDirection("owed_to_business");
      setManualDate("");
    } catch {
      setFormError(t("validation.connectError"));
    } finally {
      busyRef.current = false;
      setManualSubmitting(false);
    }
  }

  function closeManual() {
    if (manualSubmitting) return;
    setIsManualModalOpen(false);
    setPendingEvent(null);
    setFormError(null);
  }

  const hasInputText = inputText.trim().length > 0;
  const busy = querying || manualSubmitting;

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background text-foreground transition-colors duration-200 selection:bg-accent/30">
      <header className="sticky top-0 z-30 shrink-0 border-b border-border bg-background/90 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors"
              aria-label={t("assistant.backToHome")}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-space text-lg font-bold text-foreground tracking-tight">
                Meri
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div
              className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted"
              aria-live="polite"
              title={
                backendStatus === "ok"
                  ? t("assistant.connected")
                  : backendStatus === "checking"
                  ? t("assistant.checking")
                  : t("assistant.offlineTitle")
              }
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  backendStatus === "ok"
                    ? "bg-[#16A34A]"
                    : backendStatus === "checking"
                    ? "bg-amber-400 animate-pulse"
                    : "bg-foreground/30"
                }`}
                aria-hidden="true"
              />
              <span className="font-inter text-[11px] sm:text-xs">
                {backendStatus === "ok"
                  ? t("assistant.connected")
                  : backendStatus === "checking"
                  ? t("assistant.checking")
                  : t("assistant.unavailable")}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-inter text-muted hover:text-foreground rounded-full border border-border hover:border-border-strong bg-surface px-3 py-1 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{t("assistant.recordManually")}</span>
            </button>

            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-h-0 w-full max-w-4xl mx-auto overflow-hidden">
        <div className="shrink-0 border-b border-border/50 bg-background transition-colors duration-200">
          <VoiceOrb
            isListening={isListening || busy}
            onToggle={() => {
              if (busy) return;
              setIsListening((prev) => !prev);
            }}
            sublabel={
              querying
                ? t("assistant.checkingBusiness")
                : manualSubmitting
                  ? t("assistant.sendingRecord")
                  : t("assistant.tapToSpeakOrType")
            }
          />
        </div>

        <div
          id="assistant-feed"
          ref={feedRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 custom-scrollbar"
          aria-live="polite"
        >
          {feedItems.length === 0 && !querying && (
            <p className="py-8 text-center text-sm font-inter text-muted">
              {t("assistant.emptyFeed")}
            </p>
          )}
          {feedItems.map((item) => {
            if (item.kind === "user") {
              return (
                <div key={item.id} className="flex justify-end animate-enter-up">
                  <div className="user-feed-bubble max-w-[85%] sm:max-w-[70%]">
                    {item.text}
                  </div>
                </div>
              );
            }

            if (item.kind === "assistant-sale-expense") {
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 max-w-[95%] sm:max-w-[85%] animate-enter-up"
                >
                  <SaleExpenseCard
                    type={item.type}
                    headline={item.headline}
                    subtitle={item.subtitle}
                    timestamp={item.timestamp}
                  />
                </div>
              );
            }

            if (item.kind === "assistant-note") {
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 max-w-[95%] sm:max-w-[85%] animate-enter-up"
                >
                  <div className="assistant-card w-full">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`assistant-card-badge ${
                          item.tone === "error" ? "badge-clarification" : "badge-inventory"
                        }`}
                      >
                        {item.badge}
                      </span>
                      <span className="card-timestamp">{item.timestamp}</span>
                    </div>
                    <p className="text-sm sm:text-base text-foreground font-inter leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            }

            if (item.kind === "assistant-clarification") {
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 max-w-[95%] sm:max-w-[85%] animate-enter-up"
                >
                  <ClarificationCard
                    question={item.question}
                    options={item.options}
                    onSelectOption={handleClarificationOption}
                    timestamp={item.timestamp}
                  />
                </div>
              );
            }

            return null;
          })}
          {querying && (
            <div className="flex flex-col gap-2 max-w-[95%] sm:max-w-[85%] animate-enter-up">
              <div className="assistant-card w-full" role="status">
                <span className="assistant-card-badge badge-inventory">
                  {t("assistant.checkingStatus")}
                </span>
                <p className="mt-2 text-sm font-inter text-muted">
                  {t("assistant.checkingBusiness")}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur-md px-3 sm:px-6 pt-2 pb-3 sm:pb-4 space-y-2.5 transition-colors duration-200">
          <div
            id="suggestion-pills"
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5"
            aria-label={t("assistant.querySuggestions")}
          >
            <span className="text-xs font-inter text-muted shrink-0 font-medium select-none pl-1">
              {t("assistant.tryAsking")}
            </span>
            {[
              t("assistant.suggestions.todaySales"),
              t("assistant.suggestions.weekExpenses"),
              t("assistant.suggestions.shirtsCount"),
              t("assistant.suggestions.whoOwes"),
            ].map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => void submitText(pill)}
                disabled={busy}
                className="whitespace-nowrap rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs text-muted hover:text-foreground hover:border-accent/50 hover:bg-surface-strong transition-all shrink-0 cursor-pointer font-inter focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                {pill}
              </button>
            ))}
          </div>

          <form
            id="chat-form"
            onSubmit={handleChatSubmit}
            className="flex items-center gap-2 rounded-full border border-border bg-surface transition-all duration-200"
            style={{
              borderRadius: "9999px",
              padding: "6px 8px 6px 18px",
            }}
          >
            <input
              id="chat-input"
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t("assistant.inputPlaceholder")}
              disabled={busy}
              className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder-faint font-inter disabled:opacity-60"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                boxShadow: "none",
              }}
              autoComplete="off"
            />

            <button
              id="send-button"
              type="submit"
              disabled={!hasInputText || busy}
              aria-label={querying ? t("assistant.checkingBusiness") : t("assistant.sendMessage")}
              className={`flex shrink-0 items-center justify-center rounded-full w-9 h-9 sm:w-10 sm:h-10 transition-all duration-200 ${
                hasInputText && !busy
                  ? "bg-accent text-white shadow-[0_0_14px_rgba(254,105,4,0.45)] hover:opacity-90 cursor-pointer active:scale-95"
                  : "bg-surface-strong text-faint cursor-not-allowed"
              }`}
            >
              <svg
                className="w-4 h-4 translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </form>

          <div className="flex sm:hidden justify-center pt-0.5">
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="text-[11px] font-inter text-muted hover:text-foreground underline underline-offset-2 cursor-pointer"
            >
              {t("assistant.recordManually")}
            </button>
          </div>
        </div>
      </div>

      {isManualModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="manual-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-enter-up"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                  {t("manualModal.badge")}
                </span>
                <h3 id="manual-title" className="font-space text-lg font-bold text-foreground mt-0.5">
                  {t("manualModal.title")}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeManual}
                className="rounded-full p-1.5 text-muted hover:text-foreground hover:bg-surface-strong transition-colors"
                aria-label={t("manualModal.close")}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {pendingEvent ? (
              <div className="space-y-4 font-inter text-sm">
                <p className="text-sm text-muted">
                  {t("manualModal.reviewIntro")}
                </p>
                <div className="rounded-xl border border-border bg-surface-subtle px-3.5 py-2.5 text-foreground">
                  {pendingEvent.summary}
                  <p className="mt-2 text-sm text-muted">Record this?</p>
                  {manualDate ? (
                    <span className="mt-1 block text-xs text-muted">
                      {t("manualModal.dateLabel", { date: manualDate })}
                    </span>
                  ) : null}
                </div>
                {formError ? (
                  <p className="rounded-xl border border-border bg-surface-subtle px-3.5 py-2 text-sm text-foreground" role="alert">
                    {formError}
                  </p>
                ) : null}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setPendingEvent(null);
                      setFormError(null);
                    }}
                    disabled={manualSubmitting}
                    className="rounded-full border border-border px-4 py-2 text-xs font-medium text-muted hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    {pendingEvent.source === "text"
                      ? t("common.cancel")
                      : t("manualModal.edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => void confirmManualEvent()}
                    disabled={manualSubmitting}
                    className="rounded-full bg-primary hover:opacity-90 border border-border px-5 py-2 text-xs font-semibold text-primary-foreground transition-colors disabled:opacity-50"
                  >
                    {manualSubmitting ? t("manualModal.recordingInProgress") : t("manualModal.confirmRecord")}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReview} className="space-y-4 font-inter text-sm">
                <div>
                  <label className="block text-xs text-muted mb-1.5" htmlFor="manual-event-type">
                    {t("manualModal.eventType")}
                  </label>
                  <select
                    id="manual-event-type"
                    value={manualEventType}
                    onChange={(e) => {
                      setManualEventType(e.target.value as EventType);
                      setFormError(null);
                    }}
                    className="w-full rounded-xl border border-border bg-surface-subtle px-3.5 py-2.5 text-foreground outline-none focus:border-accent"
                  >
                    <option value="sale">{t("manualModal.types.sale")}</option>
                    <option value="expense">{t("manualModal.types.expense")}</option>
                    <option value="purchase">{t("manualModal.types.purchase")}</option>
                    <option value="inventory_adjustment">{t("manualModal.types.inventory_adjustment")}</option>
                    <option value="customer_debt">{t("manualModal.types.customer_debt")}</option>
                  </select>
                </div>

                {manualEventType === "expense" ? (
                  <>
                    <div>
                      <label className="block text-xs text-muted mb-1.5" htmlFor="manual-desc">
                        {t("manualModal.description")}
                      </label>
                      <input
                        id="manual-desc"
                        type="text"
                        value={manualDescription}
                        onChange={(e) => setManualDescription(e.target.value)}
                        placeholder={t("manualModal.descriptionPlaceholder")}
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1.5" htmlFor="manual-category">
                        {t("manualModal.category")}
                      </label>
                      <input
                        id="manual-category"
                        type="text"
                        value={manualCategory}
                        onChange={(e) => setManualCategory(e.target.value)}
                        className={INPUT_CLASS}
                      />
                    </div>
                  </>
                ) : null}

                {manualEventType === "sale" ||
                manualEventType === "purchase" ||
                manualEventType === "inventory_adjustment" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-muted mb-1.5" htmlFor="manual-item">
                        {t("manualModal.item")}
                      </label>
                      <input
                        id="manual-item"
                        type="text"
                        value={manualItem}
                        onChange={(e) => setManualItem(e.target.value)}
                        placeholder={t("manualModal.itemPlaceholder")}
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1.5" htmlFor="manual-quantity">
                        {t("manualModal.quantity")}
                      </label>
                      <input
                        id="manual-quantity"
                        type="number"
                        value={manualQuantity}
                        onChange={(e) => setManualQuantity(e.target.value)}
                        placeholder={
                          manualEventType === "inventory_adjustment"
                            ? t("manualModal.quantityPlaceholderAdj")
                            : t("manualModal.quantityPlaceholderSale")
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>
                ) : null}

                {manualEventType !== "inventory_adjustment" ? (
                  <div>
                    <label className="block text-xs text-muted mb-1.5" htmlFor="manual-amount">
                      {t("manualModal.amount")}
                    </label>
                    <input
                      id="manual-amount"
                      type="number"
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      placeholder={t("manualModal.amountPlaceholder")}
                      className={INPUT_CLASS}
                    />
                  </div>
                ) : null}

                {manualEventType === "sale" || manualEventType === "customer_debt" ? (
                  <div>
                    <label className="block text-xs text-muted mb-1.5" htmlFor="manual-customer">
                      {manualEventType === "sale" ? t("manualModal.customerOptional") : t("manualModal.customer")}
                    </label>
                    <input
                      id="manual-customer"
                      type="text"
                      value={manualCustomer}
                      onChange={(e) => setManualCustomer(e.target.value)}
                      placeholder={t("manualModal.customerPlaceholder")}
                      className={INPUT_CLASS}
                    />
                  </div>
                ) : null}

                {manualEventType === "purchase" ? (
                  <div>
                    <label className="block text-xs text-muted mb-1.5" htmlFor="manual-supplier">
                      {t("manualModal.supplier")}
                    </label>
                    <input
                      id="manual-supplier"
                      type="text"
                      value={manualSupplier}
                      onChange={(e) => setManualSupplier(e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>
                ) : null}

                {manualEventType === "inventory_adjustment" ? (
                  <div>
                    <label className="block text-xs text-muted mb-1.5" htmlFor="manual-reason">
                      {t("manualModal.reason")}
                    </label>
                    <input
                      id="manual-reason"
                      type="text"
                      value={manualReason}
                      onChange={(e) => setManualReason(e.target.value)}
                      placeholder={t("manualModal.reasonPlaceholder")}
                      className={INPUT_CLASS}
                    />
                  </div>
                ) : null}

                {manualEventType === "customer_debt" ? (
                  <div>
                    <label className="block text-xs text-muted mb-1.5" htmlFor="manual-direction">
                      {t("manualModal.debtDirection")}
                    </label>
                    <select
                      id="manual-direction"
                      value={manualDirection}
                      onChange={(e) => setManualDirection(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface-subtle px-3.5 py-2.5 text-foreground outline-none focus:border-accent"
                    >
                      <option value="owed_to_business">{t("cards.debtDirectionOwedToBusiness")}</option>
                      <option value="owed_by_business">{t("cards.debtDirectionOwedByBusiness")}</option>
                    </select>
                  </div>
                ) : null}

                <div>
                  <label className="block text-xs text-muted mb-1.5" htmlFor="manual-date">
                    {t("manualModal.date")}
                  </label>
                  <input
                    id="manual-date"
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>

                {formError ? (
                  <p className="rounded-xl border border-border bg-surface-subtle px-3.5 py-2 text-sm text-foreground" role="alert">
                    {formError}
                  </p>
                ) : null}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={closeManual}
                    className="rounded-full border border-border px-4 py-2 text-xs font-medium text-muted hover:text-foreground transition-colors"
                  >
                    {t("manualModal.cancel")}
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-primary hover:opacity-90 border border-border px-5 py-2 text-xs font-semibold text-primary-foreground transition-colors"
                  >
                    {t("manualModal.review")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
