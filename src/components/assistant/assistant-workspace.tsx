"use client";

import React, { useState, useRef, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { VoiceOrb } from "./voice-orb";
import {
  SaleExpenseCard,
  InventoryCard,
  ClarificationCard,
} from "./structured-cards";
import { healthCheck, createEvent } from "@/lib/api/client";
import type { EventType } from "@/lib/api/types";
import { DEFAULT_LANGUAGE, MVP_BUSINESS_ID } from "@/lib/config";
import { ThemeToggle } from "@/components/theme-toggle";

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
      kind: "assistant-inventory";
      countText: string;
      statusBadgeText: string;
      subtitle?: string;
      timestamp: string;
    }
  | {
      id: string;
      kind: "assistant-clarification";
      question: string;
      options: string[];
      timestamp: string;
    };

const INITIAL_FEED_ITEMS: FeedItem[] = [
  // 1. Initial Dummy Sale Card (§20–§21)
  {
    id: "initial-sale",
    kind: "assistant-sale-expense",
    type: "sale",
    headline: "3 shirts · ETB 900",
    subtitle: "Recorded to today's sales balance",
    timestamp: "Today at 12:42 PM",
  },
  // 2. Initial Dummy Inventory Query Card (§20–§21)
  {
    id: "initial-inventory",
    kind: "assistant-inventory",
    countText: "17 shirts remaining",
    statusBadgeText: "In Stock",
    subtitle: "Current inventory level",
    timestamp: "Live count",
  },
  // 3. Initial Dummy Clarification Card (§23–§24)
  {
    id: "initial-clarification",
    kind: "assistant-clarification",
    question: "Did you mean 900 birr in cash or transfer?",
    options: ["Cash", "Transfer"],
    timestamp: "Needs input",
  },
];

const SUGGESTIONS = [
  "Sold 2 jackets for 1200 birr",
  "Expense: 400 birr for transport",
  "Check stock for shirts",
] as const;

export function AssistantWorkspace() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>(INITIAL_FEED_ITEMS);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"ok" | "checking" | "offline">("checking");
  const [manualSubmitting, setManualSubmitting] = useState(false);

  // Manual event fields
  const [manualEventType, setManualEventType] = useState<EventType>("sale");
  const [manualItem, setManualItem] = useState("");
  const [manualQuantity, setManualQuantity] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualCustomer, setManualCustomer] = useState("");
  const [manualDescription, setManualDescription] = useState("");

  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Health check on mount
  useEffect(() => {
    let active = true;
    healthCheck()
      .then((res) => {
        if (!active) return;
        setBackendStatus(res.ok && res.data.status === "ok" ? "ok" : "offline");
      })
      .catch(() => {
        if (active) setBackendStatus("offline");
      });
    return () => {
      active = false;
    };
  }, []);

  // Smoothly scroll feed when items change
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
  }, [feedItems]);

  // Synchronize native input changes for programmatic or vanilla JS events
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

  // Click suggestion pill: inserts string into text input and focuses it (§19 & requirement 4)
  const handleSelectSuggestion = (pillText: string) => {
    setInputText(pillText);
    if (inputRef.current) {
      inputRef.current.value = pillText;
      inputRef.current.focus();
    }
  };

  // Form submit handler
  const handleChatSubmit = (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    const rawVal = inputRef.current ? inputRef.current.value : inputText;
    const trimmed = (rawVal || inputText).trim();
    if (!trimmed) return;

    // 1. Append user message bubble to #assistant-feed
    const userBubble: FeedItem = {
      id: "user-" + Date.now(),
      kind: "user",
      text: trimmed,
      timestamp: "Just now",
    };

    setFeedItems((prev) => [...prev, userBubble]);
    setInputText("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }

    // 2. Smoothly scroll to newest message
    setTimeout(scrollToBottom, 50);
  };

  // Click on clarification option
  const handleClarificationOption = (option: string) => {
    setInputText(option);
    if (inputRef.current) {
      inputRef.current.value = option;
      inputRef.current.focus();
    }
  };

  // Manual event recording submit
  const handleManualRecordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setManualSubmitting(true);
    try {
      const parsedAmount = Number(manualAmount) || 0;
      const parsedQty = Number(manualQuantity) || 1;

      const res = await createEvent({
        business_id: MVP_BUSINESS_ID,
        language: DEFAULT_LANGUAGE,
        event_type: manualEventType,
        data: {
          item: manualItem || "Item",
          quantity: parsedQty,
          amount: parsedAmount,
          currency: "ETB",
          customer: manualCustomer || null,
          description: manualDescription || manualItem || "Manual record",
          date: new Date().toISOString().slice(0, 10),
        },
      });

      if (res.ok) {
        setFeedItems((prev) => [
          ...prev,
          {
            id: "manual-" + Date.now(),
            kind: "assistant-sale-expense",
            type: manualEventType === "expense" ? "expense" : "sale",
            headline: `${parsedQty} ${manualItem || "items"} · ETB ${parsedAmount.toLocaleString()}`,
            subtitle: "Manually recorded via form",
            timestamp: "Just now",
          },
        ]);
        setIsManualModalOpen(false);
        setManualItem("");
        setManualQuantity("");
        setManualAmount("");
      }
    } catch {
      // Fallback local update if backend offline
      setFeedItems((prev) => [
        ...prev,
        {
          id: "manual-offline-" + Date.now(),
          kind: "assistant-sale-expense",
          type: manualEventType === "expense" ? "expense" : "sale",
          headline: `${manualQuantity || "1"} ${manualItem || "items"} · ETB ${manualAmount || "0"}`,
          subtitle: "Recorded locally",
          timestamp: "Just now",
        },
      ]);
      setIsManualModalOpen(false);
    } finally {
      setManualSubmitting(false);
    }
  };

  const hasInputText = inputText.trim().length > 0;

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background text-foreground transition-colors duration-200 selection:bg-accent/30">
      {/* 1. Header: Minimal bar with back link/branding & connection status (§29 & requirement 2) */}
      <header className="sticky top-0 z-30 shrink-0 border-b border-border bg-background/90 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors"
              aria-label="Back to home"
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

          <div className="flex items-center gap-3">
            {/* Small connection status indicator */}
            <div
              className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted"
              title={`Status: ${backendStatus}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  backendStatus === "ok"
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"
                    : backendStatus === "checking"
                    ? "bg-amber-400 animate-pulse"
                    : "bg-emerald-400/80"
                }`}
              />
              <span className="font-inter text-[11px] sm:text-xs">
                {backendStatus === "ok"
                  ? "Connected"
                  : backendStatus === "checking"
                  ? "Checking…"
                  : "Voice Ready"}
              </span>
            </div>

            {/* Secondary Action: Record manually (§18, §22, §29) */}
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-inter text-muted hover:text-foreground rounded-full border border-border hover:border-border-strong bg-surface px-3 py-1 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Record manually</span>
            </button>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Layout Area Following §29 Mobile Priority Order:
          1. Branding (in header)
          2. Voice orb (#voice-orb-container)
          3. Current state / Sublabel
          4. Conversation / result feed (#assistant-feed)
          5. Try asking (#suggestion-pills)
          6. Text input (#chat-form)
          7. Manual recording (secondary) */}
      <div className="flex-1 flex flex-col min-h-0 w-full max-w-4xl mx-auto overflow-hidden">
        {/* 2. Voice Orb Container (#voice-orb-container) - Centered visual anchor (§13–§15, §18) */}
        <div className="shrink-0 border-b border-border/50 bg-background transition-colors duration-200">
          <VoiceOrb
            isListening={isListening}
            onToggle={() => setIsListening((prev) => !prev)}
            sublabel="Tap to speak or type below"
          />
        </div>

        {/* 3. Conversation Feed (#assistant-feed) - Scrollable middle area (§20–§21) */}
        <div
          id="assistant-feed"
          ref={feedRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 custom-scrollbar"
        >
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

            if (item.kind === "assistant-inventory") {
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 max-w-[95%] sm:max-w-[85%] animate-enter-up"
                >
                  <InventoryCard
                    countText={item.countText}
                    statusBadgeText={item.statusBadgeText}
                    subtitle={item.subtitle}
                    timestamp={item.timestamp}
                  />
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
        </div>

        {/* 4. Bottom Dock: Sticky bottom wrapper (§18–§19, §29) */}
        <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur-md px-3 sm:px-6 pt-2 pb-3 sm:pb-4 space-y-2.5 transition-colors duration-200">
          {/* a) "Try asking" row (#suggestion-pills): Horizontal scrolling container with pills (§19) */}
          <div
            id="suggestion-pills"
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5"
            aria-label="Query suggestions"
          >
            <span className="text-xs font-inter text-muted shrink-0 font-medium select-none pl-1">
              Try asking:
            </span>
            {SUGGESTIONS.map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => handleSelectSuggestion(pill)}
                className="whitespace-nowrap rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs text-muted hover:text-foreground hover:border-accent/50 hover:bg-surface-strong transition-all shrink-0 cursor-pointer font-inter focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {pill}
              </button>
            ))}
          </div>

          {/* b) Text Input Form (#chat-form): Rounded pill container (§18, §29) */}
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
              placeholder="Record transaction or ask a question..."
              className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder-faint font-inter"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                boxShadow: "none",
              }}
              autoComplete="off"
            />

            {/* Send button that activates to #FE6904 when input has text */}
            <button
              id="send-button"
              type="submit"
              disabled={!hasInputText}
              aria-label="Send message"
              className={`flex shrink-0 items-center justify-center rounded-full w-9 h-9 sm:w-10 sm:h-10 transition-all duration-200 ${
                hasInputText
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

          {/* Mobile secondary trigger for manual recording (§29) */}
          <div className="flex sm:hidden justify-center pt-0.5">
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="text-[11px] font-inter text-muted hover:text-foreground underline underline-offset-2 cursor-pointer"
            >
              Record manually
            </button>
          </div>
        </div>
      </div>

      {/* Step-by-Step Manual Recording Modal (§22: secondary to voice) */}
      {isManualModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-enter-up"
        >
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Manual Recording
                </span>
                <h3 className="font-space text-lg font-bold text-foreground mt-0.5">
                  Record what happened
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="rounded-full p-1.5 text-muted hover:text-foreground hover:bg-surface-strong transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleManualRecordSubmit} className="space-y-4 font-inter text-sm">
              <div>
                <label className="block text-xs text-muted mb-1.5" htmlFor="manual-event-type">
                  Event type
                </label>
                <select
                  id="manual-event-type"
                  value={manualEventType}
                  onChange={(e) => setManualEventType(e.target.value as EventType)}
                  className="w-full rounded-xl border border-border bg-surface-subtle px-3.5 py-2.5 text-foreground outline-none focus:border-accent"
                >
                  <option value="sale">Sale</option>
                  <option value="expense">Expense</option>
                  <option value="purchase">Purchase</option>
                  <option value="inventory_adjustment">Inventory adjustment</option>
                  <option value="customer_debt">Customer debt</option>
                </select>
              </div>

              {manualEventType !== "expense" ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-muted mb-1.5" htmlFor="manual-item">
                        Item
                      </label>
                      <input
                        id="manual-item"
                        type="text"
                        value={manualItem}
                        onChange={(e) => setManualItem(e.target.value)}
                        placeholder="e.g. Shirts"
                        required
                        className="w-full rounded-xl border border-border bg-surface-subtle px-3.5 py-2 text-foreground outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1.5" htmlFor="manual-quantity">
                        Quantity
                      </label>
                      <input
                        id="manual-quantity"
                        type="number"
                        min="1"
                        value={manualQuantity}
                        onChange={(e) => setManualQuantity(e.target.value)}
                        placeholder="e.g. 3"
                        required
                        className="w-full rounded-xl border border-border bg-surface-subtle px-3.5 py-2 text-foreground outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-muted mb-1.5" htmlFor="manual-amount">
                      Amount (ETB)
                    </label>
                    <input
                      id="manual-amount"
                      type="number"
                      min="1"
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      placeholder="e.g. 900"
                      required
                      className="w-full rounded-xl border border-border bg-surface-subtle px-3.5 py-2 text-foreground outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-muted mb-1.5" htmlFor="manual-customer">
                      Customer (optional)
                    </label>
                    <input
                      id="manual-customer"
                      type="text"
                      value={manualCustomer}
                      onChange={(e) => setManualCustomer(e.target.value)}
                      placeholder="e.g. Hana"
                      className="w-full rounded-xl border border-border bg-surface-subtle px-3.5 py-2 text-foreground outline-none focus:border-accent"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs text-muted mb-1.5" htmlFor="manual-desc">
                      Description
                    </label>
                    <input
                      id="manual-desc"
                      type="text"
                      value={manualDescription}
                      onChange={(e) => setManualDescription(e.target.value)}
                      placeholder="e.g. Transport, electricity"
                      required
                      className="w-full rounded-xl border border-border bg-surface-subtle px-3.5 py-2 text-foreground outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1.5" htmlFor="manual-amount">
                      Amount (ETB)
                    </label>
                    <input
                      id="manual-amount"
                      type="number"
                      min="1"
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      placeholder="e.g. 400"
                      required
                      className="w-full rounded-xl border border-border bg-surface-subtle px-3.5 py-2 text-foreground outline-none focus:border-accent"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="rounded-full border border-border px-4 py-2 text-xs font-medium text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manualSubmitting}
                  className="rounded-full bg-primary hover:opacity-90 border border-border px-5 py-2 text-xs font-semibold text-primary-foreground transition-colors"
                >
                  {manualSubmitting ? "Recording…" : "Confirm Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
