"use client";

import { useEffect, useRef, useState, type FormEvent, type HTMLAttributes } from "react";
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

export function AssistantWorkspace() {
  const [health, setHealth] = useState<"checking" | "ok" | "down">("checking");
  const [queryText, setQueryText] = useState("");
  const [chatHistory, setChatHistory] = useState<
    Array<{ sender: "user" | "assistant"; text: string; detail?: string }>
  >([]);
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
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, response]);

  function updateField(name: keyof typeof fields, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
  }

  async function onQuery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) {
      return;
    }
    const query = queryText.trim();
    setQueryText("");
    if (!query) {
      setResponse({
        kind: "issue",
        tone: "error",
        message: "Enter a question about the business.",
      });
      return;
    }

    setChatHistory((prev) => [...prev, { sender: "user", text: query }]);

    setResponse({ kind: "loading", action: "query" });
    const result = await queryBusiness({
      business_id: MVP_BUSINESS_ID,
      language: DEFAULT_LANGUAGE,
      query,
    });

    if (!result.ok) {
      setResponse(issueFromFailure(result));
      setChatHistory((prev) => [
        ...prev,
        { sender: "assistant", text: result.message },
      ]);
      return;
    }

    const detail =
      result.data.result === undefined
        ? undefined
        : JSON.stringify(result.data.result, null, 2);

    setChatHistory((prev) => [
      ...prev,
      {
        sender: "assistant",
        text: result.data.message,
        detail,
      },
    ]);

    setResponse({
      kind: "success",
      title: result.data.query_type
        ? `Query · ${result.data.query_type}`
        : "Query",
      message: result.data.message,
      detail,
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
        <div className="flex h-[520px] flex-col overflow-hidden rounded-xl border border-line bg-surface">
          <div className="border-b border-line p-5 pb-3 sm:p-6 sm:pb-3">
            <h2 className="text-base font-medium">Ask the business</h2>
            <p className="mt-1 text-sm text-muted">
              Sent to <code className="text-foreground">POST /api/v1/query</code>
            </p>
          </div>

          <div
            ref={chatContainerRef}
            className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5"
          >
            {chatHistory.length === 0 ? (
              <p className="text-sm text-muted">
                Ask questions about your business items, sales, stock, or expenses.
              </p>
            ) : (
              chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      msg.sender === "user"
                        ? "bg-accent text-background"
                        : "border border-line bg-background text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.detail ? (
                      <pre className="mt-2 overflow-x-auto rounded-md border border-line bg-surface p-2 text-xs text-muted">
                        {msg.detail}
                      </pre>
                    ) : null}
                  </div>
                </div>
              ))
            )}
            {response.kind === "loading" && response.action === "query" && (
              <div className="flex items-start">
                <div className="max-w-[85%] rounded-lg border border-line bg-background px-3 py-2 text-sm italic text-muted">
                  Thinking…
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={onQuery}
            className="border-t border-line bg-surface p-3 sm:p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <textarea
                id="query"
                value={queryText}
                onChange={(event) => setQueryText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                rows={2}
                placeholder="How many shirts do I have left?"
                className="w-full resize-none rounded-md border border-line bg-background px-3 py-2 text-base text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 sm:text-sm"
              />
              <button
                type="submit"
                disabled={busy}
                className="min-h-10 rounded-md bg-accent px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
              >
                {response.kind === "loading" && response.action === "query"
                  ? "Asking…"
                  : "Ask"}
              </button>
            </div>
          </form>
        </div>

        <form
          onSubmit={onRecordEvent}
          className="rounded-xl border border-line bg-surface p-5 sm:p-6"
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
            className="mt-4 min-h-11 w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
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
        className="mt-2 min-h-11 w-full rounded-md border border-line bg-background px-3 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 sm:text-sm"
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
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
