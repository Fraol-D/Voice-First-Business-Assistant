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

    const data: Record<string, string | number | null> = {
      date: fields.date || todayIsoDate(),
      currency: fields.currency.trim() || "ETB",
    };

    const quantity = parseNumber(fields.quantity);
    const amount = parseNumber(fields.amount);
    if (Number.isNaN(quantity) || Number.isNaN(amount)) {
      setResponse({
        kind: "issue",
        tone: "error",
        message: "Quantity and amount must be valid numbers when provided.",
      });
      return;
    }

    if (eventType === "sale") {
      data.item = fields.item.trim() || null;
      if (quantity !== null) data.quantity = quantity;
      if (amount !== null) data.amount = amount;
      data.customer = fields.customer.trim() || null;
    }

    if (eventType === "expense") {
      data.description = fields.description.trim() || null;
      data.category = fields.category.trim() || null;
      if (amount !== null) data.amount = amount;
    }

    if (eventType === "purchase") {
      data.item = fields.item.trim() || null;
      if (quantity !== null) data.quantity = quantity;
      if (amount !== null) data.amount = amount;
      data.supplier = fields.supplier.trim() || null;
    }

    if (eventType === "inventory_adjustment") {
      data.item = fields.item.trim() || null;
      if (quantity !== null) data.quantity = quantity;
      data.reason = fields.reason.trim() || null;
      delete data.currency;
    }

    if (eventType === "customer_debt") {
      data.customer = fields.customer.trim() || null;
      if (amount !== null) data.amount = amount;
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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">Text workflow</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Ask and record
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Questions go to the backend as natural language. Recording an event
            uses the structured API contract — this page does not calculate
            totals, stock, or debts.
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
          className="rounded-xl border border-line bg-surface p-5"
        >
          <h2 className="text-base font-medium">Ask the business</h2>
          <p className="mt-1 text-sm text-muted">
            Sent to <code className="text-foreground">POST /api/v1/query</code>
          </p>
          <label className="mt-4 block text-sm text-muted" htmlFor="query">
            Question
          </label>
          <textarea
            id="query"
            value={queryText}
            onChange={(event) => setQueryText(event.target.value)}
            rows={4}
            placeholder="How many shirts do I have left?"
            className="mt-2 w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={busy}
            className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
          >
            {response.kind === "loading" && response.action === "query"
              ? "Asking…"
              : "Ask"}
          </button>
        </form>

        <form
          onSubmit={onRecordEvent}
          className="rounded-xl border border-line bg-surface p-5"
        >
          <h2 className="text-base font-medium">Record an event</h2>
          <p className="mt-1 text-sm text-muted">
            Sent to <code className="text-foreground">POST /api/v1/events</code>
          </p>

          <label className="mt-4 block text-sm text-muted" htmlFor="event-type">
            Event type
          </label>
          <select
            id="event-type"
            value={eventType}
            onChange={(event) => setEventType(event.target.value as EventType)}
            className="mt-2 w-full rounded-md border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
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
            />
          )}

          {eventType !== "inventory_adjustment" && (
            <Field
              label="Currency"
              value={fields.currency}
              onChange={(value) => updateField("currency", value)}
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
              <label className="mt-3 block text-sm text-muted" htmlFor="direction">
                Direction
              </label>
              <select
                id="direction"
                value={fields.direction}
                onChange={(event) => updateField("direction", event.target.value)}
                className="mt-2 w-full rounded-md border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              >
                <option value="owed_to_business">Owed to business</option>
              </select>
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
            className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
          >
            {response.kind === "loading" && response.action === "event"
              ? "Recording…"
              : "Record event"}
          </button>
        </form>
      </div>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="text-base font-medium">Backend response</h2>
        {response.kind === "idle" && (
          <p className="mt-2 text-sm text-muted">
            Submit a question or an event to see the backend result here.
          </p>
        )}
        {response.kind === "loading" && (
          <p className="mt-2 text-sm text-muted">
            Waiting for the business service…
          </p>
        )}
        {response.kind === "success" && (
          <div className="mt-2 space-y-2">
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
          <div className="mt-2 space-y-2">
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
        className="mt-2 w-full rounded-md border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
      />
    </>
  );
}
