"use client";

import React, { useState, useRef, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { VoiceOrb } from "./voice-orb";
import { AssistantVoiceControl } from "@/components/voxide/assistant-voice-control";
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
import { DEFAULT_LANGUAGE, MVP_BUSINESS_ID } from "@/lib/config";
import { ThemeToggle } from "@/components/theme-toggle";
import { MeriLogo } from "@/components/landing/meri-logo";
import { AuthenticatedBottomNav } from "@/components/navigation/authenticated-bottom-nav";

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

const SUGGESTIONS = [
  "How much did I sell today?",
  "How much did I spend this week?",
  "Who owes me money?",
] as const;

const INPUT_CLASS =
  "w-full min-h-[44px] rounded-xl border border-border bg-surface-subtle px-3.5 py-2.5 text-base sm:text-sm text-foreground outline-none focus:border-accent transition-colors";

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

function numberValue(
  data: InterpretationEventData,
  key: string,
): number | null {
  const value = data[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatAmount(value: number, currency: string | null): string {
  return `${value.toLocaleString("en-US")} ${currency ?? "ETB"}`;
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
): PendingEvent | null {
  const currency = textValue(data, "currency")?.toUpperCase() ?? "ETB";

  if (eventType === "sale" || eventType === "purchase") {
    const item = textValue(data, "item");
    const quantity = numberValue(data, "quantity");
    const amount = numberValue(data, "amount");

    if (!item || quantity === null || amount === null) return null;

    const label = eventType === "sale" ? "Sale" : "Purchase";

    return {
      request: {
        business_id: MVP_BUSINESS_ID,
        language: DEFAULT_LANGUAGE,
        event_type: eventType,
        data: { ...data, currency },
      },
      summary: `${label} — ${quantity} ${item} for ${formatAmount(amount, currency)}`,
      headline: `${quantity} ${item} · ${formatAmount(amount, currency)}`,
      card: eventType === "sale" ? "sale" : "note",
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
        language: DEFAULT_LANGUAGE,
        event_type: eventType,
        data: { ...data, currency },
      },
      summary: `Expense — ${description} · ${formatAmount(amount, currency)}`,
      headline: `${description} · ${formatAmount(amount, currency)}`,
      card: "expense",
      source: "text",
    };
  }

  if (eventType === "inventory_adjustment") {
    const item = textValue(data, "item");
    const quantity = numberValue(data, "quantity");

    if (!item || quantity === null || quantity === 0) return null;

    const reason = textValue(data, "reason") ?? "adjustment";
    const action =
      quantity < 0
        ? `${Math.abs(quantity)} ${item} lost`
        : `${quantity} ${item} added`;

    return {
      request: {
        business_id: MVP_BUSINESS_ID,
        language: DEFAULT_LANGUAGE,
        event_type: eventType,
        data,
      },
      summary: `Inventory adjustment — ${action} (${reason})`,
      headline: action,
      card: "note",
      source: "text",
    };
  }

  const customer = textValue(data, "customer");
  const amount = numberValue(data, "amount");
  const direction = textValue(data, "direction");

  if (!customer || amount === null || !direction) return null;

  const debtSummary =
    direction === "owed_to_business"
      ? `${customer} owes the business ${formatAmount(amount, currency)}`
      : `The business owes ${customer} ${formatAmount(amount, currency)}`;

  return {
    request: {
      business_id: MVP_BUSINESS_ID,
      language: DEFAULT_LANGUAGE,
      event_type: eventType,
      data: { ...data, currency },
    },
    summary: `Debt — ${debtSummary}`,
    headline: debtSummary,
    card: "note",
    source: "text",
  };
}

function positiveNumber(value: string, label: string): number | string {
  const parsed = Number(value);

  if (!value.trim() || !Number.isFinite(parsed) || parsed <= 0) {
    return `${label} must be greater than zero.`;
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
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [querying, setQuerying] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<
    "ok" | "checking" | "offline"
  >("checking");
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
  const [manualDirection, setManualDirection] =
    useState("owed_to_business");
  const [manualDate, setManualDate] = useState("");

  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [visualViewportHeight, setVisualViewportHeight] = useState<number | null>(null);

  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const vv = window.visualViewport;

    const handleResize = () => {
      const isKeyboard = window.innerHeight - vv.height > 150;
      setIsKeyboardOpen(isKeyboard);
      setVisualViewportHeight(vv.height);
    };

    handleResize();
    vv.addEventListener("resize", handleResize);

    return () => vv.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let active = true;

    const runHealthCheck = () => {
      healthCheck()
        .then((res) => {
          if (!active) return;

          setBackendStatus(
            res.ok && res.data.status === "ok" ? "ok" : "offline",
          );
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
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 50);

    return () => clearTimeout(timer);
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
      timestamp: "Just now",
    });

    requestAnimationFrame(() => {
      scrollToBottom();
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
            ? buildClarificationContinuation(
                continuesClarification,
                trimmed,
              )
            : trimmed
        : trimmed;

      const result = await interpretText(
        interpretationText,
        DEFAULT_LANGUAGE,
      );

      if (!result.ok) {
        if (result.kind === "clarification") {
          pushFeed({
            id: nextId("clarification"),
            kind: "assistant-clarification",
            question: result.message,
            options: [],
            timestamp: "Needs input",
          });
        } else {
          pushFeed({
            id: nextId("error"),
            kind: "assistant-note",
            badge: "Could not complete",
            tone: "error",
            text: result.message,
            timestamp: "Just now",
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
          options: [],
          timestamp: "Needs input",
        });

        return;
      }

      if (result.data.type === "create_event") {
        const event = pendingEventFromInterpretation(
          result.data.event_type,
          result.data.data,
        );

        if (!event) {
          pushFeed({
            id: nextId("error"),
            kind: "assistant-note",
            badge: "Could not complete",
            tone: "error",
            text: "The AI engine returned an incomplete event record.",
            timestamp: "Just now",
          });

          return;
        }

        setPendingEvent(event);
        setIsManualModalOpen(true);
        return;
      }

      const queryResult = await queryBusiness({
        business_id: MVP_BUSINESS_ID,
        language: DEFAULT_LANGUAGE,
        query: result.data.query,
      });

      if (!queryResult.ok) {
        if (queryResult.kind === "clarification") {
          pushFeed({
            id: nextId("clarification"),
            kind: "assistant-clarification",
            question: queryResult.message,
            options: [],
            timestamp: "Needs input",
          });
        } else {
          pushFeed({
            id: nextId("error"),
            kind: "assistant-note",
            badge: "Could not complete",
            tone: "error",
            text: queryResult.message,
            timestamp: "Just now",
          });
        }

        return;
      }

      pushFeed({
        id: nextId("answer"),
        kind: "assistant-note",
        badge: "Answer",
        tone: "answer",
        text: queryResult.data.message,
        timestamp: "Just now",
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

    const rawVal = inputRef.current
      ? inputRef.current.value
      : inputText;

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

    if (
      manualEventType === "sale" ||
      manualEventType === "purchase"
    ) {
      const item = manualItem.trim();

      if (!item) return { error: "Enter the item name." };

      const quantity = positiveNumber(manualQuantity, "Quantity");

      if (typeof quantity === "string") {
        return { error: quantity };
      }

      const amount = positiveNumber(manualAmount, "Amount");

      if (typeof amount === "string") {
        return { error: amount };
      }

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
            language: DEFAULT_LANGUAGE,
            event_type: "sale",
            data,
          },
          summary: `Sale: ${quantity} ${item} · ETB ${amount}`,
          headline: `${quantity} ${item} · ETB ${amount}`,
          card: "sale",
        };
      }

      const supplier = manualSupplier.trim();

      if (supplier) data.supplier = supplier;

      return {
        request: {
          business_id: MVP_BUSINESS_ID,
          language: DEFAULT_LANGUAGE,
          event_type: "purchase",
          data,
        },
        summary: `Purchase: ${quantity} ${item} · ETB ${amount}`,
        headline: `${quantity} ${item} · ETB ${amount}`,
        card: "note",
      };
    }

    if (manualEventType === "expense") {
      const description = manualDescription.trim();

      if (!description) {
        return { error: "Enter an expense description." };
      }

      const amount = positiveNumber(manualAmount, "Amount");

      if (typeof amount === "string") {
        return { error: amount };
      }

      data.description = description;
      data.amount = amount;
      data.currency = "ETB";

      const category = manualCategory.trim();

      if (category) data.category = category;

      return {
        request: {
          business_id: MVP_BUSINESS_ID,
          language: DEFAULT_LANGUAGE,
          event_type: "expense",
          data,
        },
        summary: `Expense: ${description} · ETB ${amount}`,
        headline: `${description} · ETB ${amount}`,
        card: "expense",
      };
    }

    if (manualEventType === "inventory_adjustment") {
      const item = manualItem.trim();

      if (!item) return { error: "Enter the item name." };

      const reason = manualReason.trim();

      if (!reason) {
        return { error: "Enter a reason for the adjustment." };
      }

      const quantity = Number(manualQuantity);

      if (
        !manualQuantity.trim() ||
        !Number.isFinite(quantity) ||
        quantity === 0
      ) {
        return {
          error:
            "Quantity must be a non-zero number. Use a negative number to decrease stock.",
        };
      }

      data.item = item;
      data.quantity = quantity;
      data.reason = reason;

      return {
        request: {
          business_id: MVP_BUSINESS_ID,
          language: DEFAULT_LANGUAGE,
          event_type: "inventory_adjustment",
          data,
        },
        summary: `Inventory adjustment: ${quantity} ${item} · ${reason}`,
        headline: `${quantity} ${item}`,
        card: "note",
      };
    }

    const customer = manualCustomer.trim();

    if (!customer) {
      return { error: "Enter the customer's name." };
    }

    const amount = positiveNumber(manualAmount, "Amount");

    if (typeof amount === "string") {
      return { error: amount };
    }

    if (
      manualDirection !== "owed_to_business" &&
      manualDirection !== "owed_by_business"
    ) {
      return {
        error:
          "Choose whether the customer owes the business or the business owes the customer.",
      };
    }

    data.customer = customer;
    data.amount = amount;
    data.currency = "ETB";
    data.direction = manualDirection;

    return {
      request: {
        business_id: MVP_BUSINESS_ID,
        language: DEFAULT_LANGUAGE,
        event_type: "customer_debt",
        data,
      },
      summary: `Customer debt: ${customer} · ETB ${amount} · ${manualDirection}`,
      headline: `${customer} · ETB ${amount}`,
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
            timestamp: "Needs input",
          });
        }

        return;
      }

      if (pendingEvent.card === "note") {
        pushFeed({
          id: nextId("event"),
          kind: "assistant-note",
          badge: "Recorded",
          tone: "answer",
          text: result.data.message,
          timestamp: "Just now",
        });
      } else {
        pushFeed({
          id: nextId("event"),
          kind: "assistant-sale-expense",
          type: pendingEvent.card,
          headline: pendingEvent.headline,
          subtitle: result.data.message,
          timestamp: "Just now",
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
      setFormError(
        "Unable to connect to the business service. Please try again.",
      );
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
  const hasConversation = feedItems.length > 0;

  return (
    <div
      id="assistant-shell"
      className="flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col overflow-hidden overscroll-none bg-background text-foreground transition-colors duration-200 selection:bg-accent/30"
      style={
        isKeyboardOpen && visualViewportHeight
          ? { height: `${visualViewportHeight}px`, maxHeight: `${visualViewportHeight}px` }
          : undefined
      }
    >
      <header className="sticky top-0 z-30 shrink-0 bg-background pt-[env(safe-area-inset-top,0px)] transition-colors duration-200">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-3 sm:px-6">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-muted hover:text-foreground transition-colors p-1 -ml-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Back to home"
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <MeriLogo compact={false} />
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <div
              className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1.5 text-xs text-muted"
              aria-live="polite"
              title={
                backendStatus === "ok"
                  ? "Connected"
                  : backendStatus === "checking"
                    ? "Checking…"
                    : "Can't reach the backend. Voice and recording may not work."
              }
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  backendStatus === "ok"
                    ? "bg-[#16A34A]"
                    : backendStatus === "checking"
                      ? "bg-amber-400 animate-pulse"
                      : "bg-foreground/30"
                }`}
                aria-hidden="true"
              />
              <span className="font-inter text-[11px] sm:text-xs hidden md:inline">
                {backendStatus === "ok"
                  ? "Connected"
                  : backendStatus === "checking"
                    ? "Checking…"
                    : "Offline"}
              </span>
            </div>

            <Link
              href="/dashboard"
              className="hidden md:inline-flex min-h-[44px] items-center justify-center rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground hover:border-border-strong hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Dashboard
            </Link>

            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              aria-label="Record manually"
              title="Record manually"
              className="inline-flex min-w-[44px] min-h-[44px] size-11 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-all duration-200 hover:border-border-strong hover:text-accent active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </button>

            <ThemeToggle />

            <Link
              href="/settings#profile"
              className="relative inline-flex min-w-[44px] min-h-[44px] size-11 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-all duration-200 hover:border-border-strong hover:text-accent active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
            </Link>
          </div>
        </div>
      </header>

      <div className="relative flex-1 flex flex-col min-h-0 w-full max-w-4xl mx-auto overflow-hidden">
        <div
          className={`hidden shrink-0 bg-background transition-all duration-500 sm:block ${
            hasConversation
              ? "pointer-events-none max-h-0 -translate-y-2 translate-x-[35vw] scale-50 overflow-hidden opacity-0"
              : "max-h-[190px] overflow-hidden"
          }`}
        >
          <VoiceOrb
            isListening={isListening || busy}
            className={`transition-transform duration-500 ${
              hasConversation
                ? "origin-center"
                : ""
            }`}
            onToggle={() => {
              if (busy) return;
              setIsListening((prev) => !prev);
            }}
          />
        </div>

        <div
          id="assistant-feed"
          ref={feedRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-3 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4 custom-scrollbar"
          style={{ WebkitOverflowScrolling: "touch" }}
          aria-live="polite"
        >
          {feedItems.length === 0 && !querying && (
            <p className="py-8 text-center text-sm font-inter text-muted">
              Ask a question about your business.
            </p>
          )}

          {feedItems.map((item) => {
            if (item.kind === "user") {
              return (
                <div
                  key={item.id}
                  className="flex justify-end animate-enter-up"
                >
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
                    <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 mb-2">
                      <span
                        className={`assistant-card-badge shrink-0 ${
                          item.tone === "error"
                            ? "badge-clarification"
                            : "badge-inventory"
                        }`}
                      >
                        {item.badge}
                      </span>
                      <span className="card-timestamp shrink-0">
                        {item.timestamp}
                      </span>
                    </div>

                    <p className="text-sm sm:text-base text-foreground font-inter leading-relaxed break-words">
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
            <div
              className="flex flex-col gap-2 max-w-[95%] sm:max-w-[80%] animate-enter-up"
              role="status"
            >
              <div className="assistant-card py-2.5 px-3.5 sm:py-3 sm:px-4 w-full flex items-center gap-3">
                <div
                  className="flex items-center gap-1 h-4 shrink-0"
                  aria-hidden="true"
                >
                  <span className="w-1 bg-accent rounded-full h-2.5 animate-pulse" />
                  <span className="w-1 bg-accent rounded-full h-4 animate-pulse delay-75" />
                  <span className="w-1 bg-accent rounded-full h-3 animate-pulse delay-150" />
                </div>

                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent font-space">
                    Thinking
                  </span>
                  <span className="text-xs text-muted font-inter truncate">
                    Checking your business…
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className={`shrink-0 bg-background px-3 sm:px-6 pt-2 space-y-2.5 transition-all duration-200 ${
            isInputFocused || isKeyboardOpen
              ? "pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))]"
              : "pb-[calc(3.5rem+max(0.75rem,env(safe-area-inset-bottom,0.75rem)))] md:pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))]"
          }`}
        >
          <div
            id="suggestion-pills"
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 sm:justify-center"
            aria-label="Query suggestions"
          >
            {SUGGESTIONS.map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => void submitText(pill)}
                disabled={busy}
                className="inline-flex items-center whitespace-nowrap rounded-full border border-border bg-surface min-h-[44px] px-3.5 py-2 text-xs text-muted hover:text-foreground hover:border-accent/50 hover:bg-surface-strong transition-all shrink-0 cursor-pointer font-inter focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
              >
                {pill}
              </button>
            ))}
          </div>

          <form
            id="chat-form"
            onSubmit={handleChatSubmit}
            className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-border bg-surface transition-all duration-200"
          >
            <input
              id="chat-input"
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder="Ask a question about your business..."
              disabled={busy}
              className="flex-1 min-w-0 bg-transparent text-base text-foreground placeholder-faint font-inter disabled:opacity-60 pl-2 sm:pl-3 py-2"
              autoComplete="off"
            />

            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center"
              aria-label="Voxide voice control"
            >
              <AssistantVoiceControl />
            </div>

            <button
              id="send-button"
              type="submit"
              disabled={!hasInputText || busy}
              aria-label={
                querying ? "Checking your business" : "Send message"
              }
              className={`flex shrink-0 items-center justify-center rounded-full min-w-[44px] min-h-[44px] size-11 transition-all duration-200 active:scale-95 ${
                hasInputText && !busy
                  ? "bg-accent text-white shadow-[0_0_14px_rgba(254,105,4,0.45)] hover:opacity-90 cursor-pointer"
                  : "bg-surface-strong text-faint cursor-not-allowed opacity-60"
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
        </div>
      </div>

      <AuthenticatedBottomNav
        hidden={isInputFocused || isKeyboardOpen}
      />

      {isManualModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="manual-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeManual();
          }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-sm animate-enter-up"
        >
          <div className="max-h-[85vh] sm:max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-2xl pb-[max(1.5rem,env(safe-area-inset-bottom,1.5rem))]">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Manual Recording
                </span>
                <h3
                  id="manual-title"
                  className="font-space text-lg font-bold text-foreground mt-0.5"
                >
                  Record what happened
                </h3>
              </div>

              <button
                type="button"
                onClick={closeManual}
                className="inline-flex min-w-[44px] min-h-[44px] size-11 items-center justify-center rounded-full text-muted hover:text-foreground hover:bg-surface-strong transition-colors cursor-pointer active:scale-95"
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {pendingEvent ? (
              <div className="space-y-4 font-inter text-sm">
                <p className="text-sm text-muted">
                  Review this event before it is sent to the business service.
                </p>

                <div className="rounded-xl border border-border bg-surface-subtle px-3.5 py-2.5 text-foreground">
                  {pendingEvent.summary}

                  <p className="mt-2 text-sm text-muted">
                    Record this?
                  </p>

                  {manualDate ? (
                    <span className="mt-1 block text-xs text-muted">
                      Date: {manualDate}
                    </span>
                  ) : null}
                </div>

                {formError ? (
                  <p
                    className="rounded-xl border border-border bg-surface-subtle px-3.5 py-2 text-sm text-foreground"
                    role="alert"
                  >
                    {formError}
                  </p>
                ) : null}

                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setPendingEvent(null);
                      setFormError(null);
                    }}
                    disabled={manualSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 min-h-[44px] text-xs font-medium text-muted hover:text-foreground transition-colors disabled:opacity-50 active:scale-95 cursor-pointer"
                  >
                    {pendingEvent.source === "text" ? "Cancel" : "Edit"}
                  </button>

                  <button
                    type="button"
                    onClick={() => void confirmManualEvent()}
                    disabled={manualSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-accent hover:opacity-90 border border-border px-6 py-2.5 min-h-[44px] text-xs font-semibold text-white transition-colors disabled:opacity-50 active:scale-95 cursor-pointer shadow-sm"
                  >
                    {manualSubmitting
                      ? "Recording…"
                      : "Confirm Record"}
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleReview}
                className="space-y-4 font-inter text-sm"
              >
                <div>
                  <label
                    className="block text-xs text-muted mb-1.5"
                    htmlFor="manual-event-type"
                  >
                    Event type
                  </label>

                  <select
                    id="manual-event-type"
                    value={manualEventType}
                    onChange={(e) => {
                      setManualEventType(e.target.value as EventType);
                      setFormError(null);
                    }}
                    className="w-full min-h-[44px] rounded-xl border border-border bg-surface-subtle px-3.5 py-2.5 text-base sm:text-sm text-foreground outline-none focus:border-accent"
                  >
                    <option value="sale">Sale</option>
                    <option value="expense">Expense</option>
                    <option value="purchase">Purchase</option>
                    <option value="inventory_adjustment">
                      Inventory adjustment
                    </option>
                    <option value="customer_debt">
                      Customer debt
                    </option>
                  </select>
                </div>

                {manualEventType === "expense" ? (
                  <>
                    <div>
                      <label
                        className="block text-xs text-muted mb-1.5"
                        htmlFor="manual-desc"
                      >
                        Description
                      </label>

                      <input
                        id="manual-desc"
                        type="text"
                        value={manualDescription}
                        onChange={(e) =>
                          setManualDescription(e.target.value)
                        }
                        placeholder="e.g. Transport, electricity"
                        className={INPUT_CLASS}
                      />
                    </div>

                    <div>
                      <label
                        className="block text-xs text-muted mb-1.5"
                        htmlFor="manual-category"
                      >
                        Category (optional)
                      </label>

                      <input
                        id="manual-category"
                        type="text"
                        value={manualCategory}
                        onChange={(e) =>
                          setManualCategory(e.target.value)
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                  </>
                ) : null}

                {manualEventType === "sale" ||
                manualEventType === "purchase" ||
                manualEventType === "inventory_adjustment" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        className="block text-xs text-muted mb-1.5"
                        htmlFor="manual-item"
                      >
                        Item
                      </label>

                      <input
                        id="manual-item"
                        type="text"
                        value={manualItem}
                        onChange={(e) => setManualItem(e.target.value)}
                        placeholder="e.g. Shirts"
                        className={INPUT_CLASS}
                      />
                    </div>

                    <div>
                      <label
                        className="block text-xs text-muted mb-1.5"
                        htmlFor="manual-quantity"
                      >
                        Quantity
                      </label>

                      <input
                        id="manual-quantity"
                        type="number"
                        value={manualQuantity}
                        onChange={(e) =>
                          setManualQuantity(e.target.value)
                        }
                        placeholder={
                          manualEventType === "inventory_adjustment"
                            ? "e.g. -2"
                            : "e.g. 3"
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>
                ) : null}

                {manualEventType !== "inventory_adjustment" ? (
                  <div>
                    <label
                      className="block text-xs text-muted mb-1.5"
                      htmlFor="manual-amount"
                    >
                      Amount (ETB)
                    </label>

                    <input
                      id="manual-amount"
                      type="number"
                      value={manualAmount}
                      onChange={(e) =>
                        setManualAmount(e.target.value)
                      }
                      placeholder="e.g. 900"
                      className={INPUT_CLASS}
                    />
                  </div>
                ) : null}

                {manualEventType === "sale" ||
                manualEventType === "customer_debt" ? (
                  <div>
                    <label
                      className="block text-xs text-muted mb-1.5"
                      htmlFor="manual-customer"
                    >
                      {manualEventType === "sale"
                        ? "Customer (optional)"
                        : "Customer"}
                    </label>

                    <input
                      id="manual-customer"
                      type="text"
                      value={manualCustomer}
                      onChange={(e) =>
                        setManualCustomer(e.target.value)
                      }
                      placeholder="e.g. Hana"
                      className={INPUT_CLASS}
                    />
                  </div>
                ) : null}

                {manualEventType === "purchase" ? (
                  <div>
                    <label
                      className="block text-xs text-muted mb-1.5"
                      htmlFor="manual-supplier"
                    >
                      Supplier (optional)
                    </label>

                    <input
                      id="manual-supplier"
                      type="text"
                      value={manualSupplier}
                      onChange={(e) =>
                        setManualSupplier(e.target.value)
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                ) : null}

                {manualEventType === "inventory_adjustment" ? (
                  <div>
                    <label
                      className="block text-xs text-muted mb-1.5"
                      htmlFor="manual-reason"
                    >
                      Reason
                    </label>

                    <input
                      id="manual-reason"
                      type="text"
                      value={manualReason}
                      onChange={(e) =>
                        setManualReason(e.target.value)
                      }
                      placeholder="e.g. damaged"
                      className={INPUT_CLASS}
                    />
                  </div>
                ) : null}

                {manualEventType === "customer_debt" ? (
                  <div>
                    <label
                      className="block text-xs text-muted mb-1.5"
                      htmlFor="manual-direction"
                    >
                      Debt direction
                    </label>

                    <select
                      id="manual-direction"
                      value={manualDirection}
                      onChange={(e) =>
                        setManualDirection(e.target.value)
                      }
                      className="w-full min-h-[44px] rounded-xl border border-border bg-surface-subtle px-3.5 py-2.5 text-base sm:text-sm text-foreground outline-none focus:border-accent"
                    >
                      <option value="owed_to_business">
                        Customer owes the business
                      </option>
                      <option value="owed_by_business">
                        Business owes the customer
                      </option>
                    </select>
                  </div>
                ) : null}

                <div>
                  <label
                    className="block text-xs text-muted mb-1.5"
                    htmlFor="manual-date"
                  >
                    Date (optional)
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
                  <p
                    className="rounded-xl border border-border bg-surface-subtle px-3.5 py-2 text-sm text-foreground"
                    role="alert"
                  >
                    {formError}
                  </p>
                ) : null}

                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={closeManual}
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 min-h-[44px] text-xs font-medium text-muted hover:text-foreground transition-colors active:scale-95 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-accent hover:opacity-90 border border-border px-6 py-2.5 min-h-[44px] text-xs font-semibold text-white transition-colors active:scale-95 cursor-pointer shadow-sm"
                  >
                    Review
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