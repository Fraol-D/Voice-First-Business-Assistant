"use client";

import { useEffect, useState, type FormEvent, type HTMLAttributes } from "react";
import { createEvent, healthCheck, queryBusiness } from "@/lib/api/client";
import type { ApiFailure, EventType } from "@/lib/api/types";
import { DEFAULT_LANGUAGE, MVP_BUSINESS_ID } from "@/lib/config";

type ResponseState =
  | { kind: "idle" }
  | { kind: "loading"; action: "query" | "event" }
  | { kind: "success"; title: string; message: string; detail?: string }
  | {
      kind: "issue";
      tone: "error" | "clarification";
      message: string;
      missing_fields?: string[];
    };

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function validationIssue(message: string): ResponseState {
  return { kind: "issue", tone: "error", message };
}

function issueFromFailure(failure: ApiFailure): ResponseState {
  return {
    kind: "issue",
    tone: failure.kind === "clarification" ? "clarification" : "error",
    message: failure.message,
    missing_fields: failure.missing_fields,
  };
}

const eventLabels: Record<EventType, string> = {
  sale: "Sale",
  expense: "Expense",
  purchase: "Purchase",
  inventory_adjustment: "Inventory adjustment",
  customer_debt: "Customer debt",
};

const queryExamples = [
  "How many shirts do I have?",
  "How much did I sell today?",
  "How much did I spend this week?",
  "Who owes me?",
] as const;

export function AssistantWorkspace() {
  const [health, setHealth] = useState<"checking" | "ok" | "down">("checking");
  const [queryText, setQueryText] = useState("");
  const [eventType, setEventType] = useState<EventType>("sale");
  const [fields, setFields] = useState({
    item: "",
    quantity: "",
    amount: "",
    currency: "ETB",
    customer: "",
    supplier: "",
    description: "",
    category: "",
    reason: "",
    direction: "owed_to_business",
    date: todayIsoDate(),
  });
  const [response, setResponse] = useState<ResponseState>({ kind: "idle" });
  const busy = response.kind === "loading";

  useEffect(() => {
    let cancelled = false;
    healthCheck().then((result) => {
      if (cancelled) {
        return;
      }
      setHealth(result.ok && result.data.status === "ok" ? "ok" : "down");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function updateField(name: keyof typeof fields, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
  }

  async function onQuery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) {
      return;
    }
    const query = queryText.trim();
    if (!query) {
      setResponse({
        kind: "issue",
        tone: "error",
        message: "Enter a question about the business.",
      });
      return;
    }

    setResponse({ kind: "loading", action: "query" });
    const result = await queryBusiness({
      business_id: MVP_BUSINESS_ID,
      language: DEFAULT_LANGUAGE,
      query,
    });

    if (!result.ok) {
      setResponse(issueFromFailure(result));
      return;
    }

    setResponse({
      kind: "success",
      title: result.data.query_type
        ? `Query · ${result.data.query_type}`
        : "Query",
      message: result.data.message,
      detail:
        result.data.result === undefined
          ? undefined
          : JSON.stringify(result.data.result, null, 2),
    });
  }

  async function onRecordEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) {
      return;
    }

    const quantity = parseNumber(fields.quantity);
    const amount = parseNumber(fields.amount);
    if (Number.isNaN(quantity) || Number.isNaN(amount)) {
      setResponse(validationIssue("Enter valid numbers for quantity and amount."));
      return;
    }

    const item = fields.item.trim();
    const customer = fields.customer.trim();
    const description = fields.description.trim();
    const reason = fields.reason.trim();
    const currency = fields.currency.trim();

    if (!fields.date) {
      setResponse(validationIssue("Choose a date for this event."));
      return;
    }

    if (eventType === "sale" || eventType === "purchase") {
      if (!item) {
        setResponse(validationIssue("Enter the item name."));
        return;
      }
      if (quantity === null || quantity <= 0) {
        setResponse(validationIssue("Quantity must be greater than zero."));
        return;
      }
      if (amount === null || amount <= 0) {
        setResponse(validationIssue("Amount must be greater than zero."));
        return;
      }
      if (!currency) {
        setResponse(validationIssue("Choose a currency."));
        return;
      }
    }

    if (eventType === "expense") {
      if (!description) {
        setResponse(validationIssue("Enter a description for the expense."));
        return;
      }
      if (amount === null || amount <= 0) {
        setResponse(validationIssue("Amount must be greater than zero."));
        return;
      }
      if (!currency) {
        setResponse(validationIssue("Choose a currency."));
        return;
      }
    }

    if (eventType === "inventory_adjustment") {
      if (!item) {
        setResponse(validationIssue("Enter the item name."));
        return;
      }
      if (quantity === null || quantity === 0) {
        setResponse(validationIssue("Adjustment quantity cannot be zero."));
        return;
      }
      if (!reason) {
        setResponse(validationIssue("Enter a reason for the adjustment."));
        return;
      }
    }

    if (eventType === "customer_debt") {
      if (!customer) {
        setResponse(validationIssue("Enter the customer's name."));
        return;
      }
      if (amount === null || amount <= 0) {
        setResponse(validationIssue("Amount must be greater than zero."));
        return;
      }
      if (!currency) {
        setResponse(validationIssue("Choose a currency."));
        return;
      }
    }

    const data: Record<string, string | number | null> = { date: fields.date };
    if (eventType === "sale") {
      data.item = item;
      data.quantity = quantity;
      data.amount = amount;
      data.currency = currency;
      data.customer = customer || null;
    }

    if (eventType === "expense") {
      data.description = description;
      data.amount = amount;
      data.currency = currency;
      data.category = fields.category.trim() || null;
    }

    if (eventType === "purchase") {
      data.item = item;
      data.quantity = quantity;
      data.amount = amount;
      data.currency = currency;
      data.supplier = fields.supplier.trim() || null;
    }

    if (eventType === "inventory_adjustment") {
      data.item = item;
      data.quantity = quantity;
      data.reason = reason;
    }

    if (eventType === "customer_debt") {
      data.customer = customer;
      data.amount = amount;
      data.currency = currency;
      data.direction = fields.direction;
    }

    setResponse({ kind: "loading", action: "event" });
    const result = await createEvent({
      business_id: MVP_BUSINESS_ID,
      language: DEFAULT_LANGUAGE,
      event_type: eventType,
      data,
    });

    if (!result.ok) {
      setResponse(issueFromFailure(result));
      return;
    }

    setResponse({
      kind: "success",
      title: "Event recorded",
      message: result.data.message,
      detail: JSON.stringify(result.data.event, null, 2),
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-7 px-4 py-7 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-medium text-accent">Meri workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Your business, guided by voice.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Ask a question in plain language, or record what happened today.
            Voxide is ready when you want to speak; text stays available here
            whenever you need a reliable fallback.
          </p>
        </div>
        <p
          className={`rounded-full border px-3 py-1 text-xs ${
            health === "ok"
              ? "border-positive/40 text-positive"
              : health === "checking"
                ? "border-line text-faint"
                : "border-attention/40 text-attention"
          }`}
        >
          {health === "ok"
            ? "Backend connected"
            : health === "checking"
              ? "Checking backend"
              : "Backend unavailable"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={onQuery}
          className="rounded-2xl border border-accent/35 bg-surface p-5 shadow-[0_12px_30px_rgba(0,0,0,0.12)] sm:p-6"
        >
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">
            Text fallback
          </p>
          <h2 className="mt-2 text-xl font-semibold">Ask your business</h2>
          <p className="mt-1 text-sm text-muted">
            Get an answer from the business data you have already recorded.
          </p>
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Example questions">
            {queryExamples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setQueryText(example)}
                className="rounded-full border border-line px-3 py-2 text-left text-xs text-muted transition-colors hover:border-accent/60 hover:text-foreground"
              >
                {example}
              </button>
            ))}
          </div>
          <label className="mt-4 block text-sm text-muted" htmlFor="query">
            Question
          </label>
          <textarea
            id="query"
            value={queryText}
            onChange={(event) => setQueryText(event.target.value)}
            rows={4}
            placeholder="Try a question about sales, stock, or money owed"
            className="mt-3 min-h-28 w-full resize-y rounded-xl border border-line bg-background px-3 py-3 text-base text-foreground outline-none transition-colors placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/30 sm:text-sm"
          />
          <button
            type="submit"
            disabled={busy}
            className="mt-4 min-h-11 w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {response.kind === "loading" && response.action === "query"
              ? "Asking…"
              : "Ask"}
          </button>
        </form>

        <form
          onSubmit={onRecordEvent}
          className="rounded-2xl border border-line bg-surface p-5 sm:p-6"
        >
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">
            Structured record
          </p>
          <h2 className="mt-2 text-xl font-semibold">Record what happened</h2>
          <p className="mt-1 text-sm text-muted">
            Keep sales, expenses, purchases, stock, and customer balances current.
          </p>

          <label className="mt-4 block text-sm text-muted" htmlFor="event-type">
            Event type
          </label>
          <select
            id="event-type"
            value={eventType}
            onChange={(event) => setEventType(event.target.value as EventType)}
            className="mt-2 min-h-11 w-full rounded-md border border-line bg-background px-3 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 sm:text-sm"
          >
            {(Object.keys(eventLabels) as EventType[]).map((type) => (
              <option key={type} value={type}>
                {eventLabels[type]}
              </option>
            ))}
          </select>

          {(eventType === "sale" ||
            eventType === "purchase" ||
            eventType === "inventory_adjustment") && (
            <Field
              label="Item"
              value={fields.item}
              onChange={(value) => updateField("item", value)}
            />
          )}

          {(eventType === "sale" ||
            eventType === "purchase" ||
            eventType === "inventory_adjustment") && (
            <Field
              label="Quantity"
              value={fields.quantity}
              onChange={(value) => updateField("quantity", value)}
              inputMode="decimal"
              type="number"
            />
          )}

          {eventType === "expense" && (
            <>
              <Field
                label="Description"
                value={fields.description}
                onChange={(value) => updateField("description", value)}
              />
              <Field
                label="Category"
                value={fields.category}
                onChange={(value) => updateField("category", value)}
              />
            </>
          )}

          {eventType !== "inventory_adjustment" && (
            <Field
              label="Amount"
              value={fields.amount}
              onChange={(value) => updateField("amount", value)}
              inputMode="decimal"
              type="number"
            />
          )}

          {eventType !== "inventory_adjustment" && (
            <SelectField
              id="currency"
              label="Currency"
              value={fields.currency}
              onChange={(value) => updateField("currency", value)}
              options={[
                ["ETB", "ETB — Ethiopian Birr"],
                ["USD", "USD — US Dollar"],
              ]}
            />
          )}

          {eventType === "sale" && (
            <Field
              label="Customer (optional)"
              value={fields.customer}
              onChange={(value) => updateField("customer", value)}
            />
          )}

          {eventType === "purchase" && (
            <Field
              label="Supplier (optional)"
              value={fields.supplier}
              onChange={(value) => updateField("supplier", value)}
            />
          )}

          {eventType === "inventory_adjustment" && (
            <Field
              label="Reason"
              value={fields.reason}
              onChange={(value) => updateField("reason", value)}
            />
          )}

          {eventType === "customer_debt" && (
            <>
              <Field
                label="Customer"
                value={fields.customer}
                onChange={(value) => updateField("customer", value)}
              />
              <SelectField
                id="direction"
                label="Debt direction"
                value={fields.direction}
                onChange={(value) => updateField("direction", value)}
                options={[
                  ["owed_to_business", "Customer owes me"],
                  ["owed_by_business", "I owe them"],
                ]}
              />
            </>
          )}

          <Field
            label="Date"
            value={fields.date}
            onChange={(value) => updateField("date", value)}
            type="date"
          />

          <button
            type="submit"
            disabled={busy}
            className="mt-4 min-h-11 w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {response.kind === "loading" && response.action === "event"
              ? "Recording…"
              : "Record event"}
          </button>
        </form>
      </div>

      <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6" aria-live="polite">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
              Activity
            </p>
            <h2 className="mt-2 text-lg font-semibold">Your latest update</h2>
          </div>
          <span className="hidden rounded-full border border-line px-2.5 py-1 text-xs text-faint sm:inline">
            Meri text workflow
          </span>
        </div>
        {response.kind === "idle" && (
          <p className="mt-4 rounded-xl border border-dashed border-line bg-background/40 p-4 text-sm text-muted">
            Your answer or confirmation will appear here after you ask or record something.
          </p>
        )}
        {response.kind === "loading" && (
          <p className="mt-4 rounded-xl border border-dashed border-line bg-background/40 p-4 text-sm text-muted">
            Working with your business data…
          </p>
        )}
        {response.kind === "success" && (
          <div className="mt-4 space-y-3 rounded-xl border border-positive/25 bg-positive/10 p-4">
            <p className="text-xs uppercase tracking-wide text-positive">
              {response.title}
            </p>
            <p className="text-sm leading-6">{response.message}</p>
            {response.detail ? (
              <pre className="overflow-x-auto rounded-md border border-line bg-background p-3 text-xs text-muted">
                {response.detail}
              </pre>
            ) : null}
          </div>
        )}
        {response.kind === "issue" && (
          <div className="mt-4 space-y-3 rounded-xl border border-attention/30 bg-attention/10 p-4">
            <p
              className={`text-xs uppercase tracking-wide ${
                response.tone === "clarification"
                  ? "text-attention"
                  : "text-attention"
              }`}
            >
              {response.tone === "clarification"
                ? "Needs clarification"
                : "Could not complete"}
            </p>
            <p className="text-sm leading-6">{response.message}</p>
            {response.missing_fields?.length ? (
              <p className="text-sm text-muted">
                Missing: {response.missing_fields.join(", ")}
              </p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <>
      <label className="mt-3 block text-sm text-muted" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-11 w-full rounded-md border border-line bg-background px-3 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 sm:text-sm"
      />
    </>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <>
      <label className="mt-3 block text-sm text-muted" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-11 w-full rounded-md border border-line bg-background px-3 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 sm:text-sm"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </>
  );
}
