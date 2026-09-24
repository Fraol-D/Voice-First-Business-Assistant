/**
 * Voxide Voice AI Client — Capability Registration
 *
 * This module initializes the Voxide SDK client and registers six voice
 * capabilities that map directly to the backend API contract:
 *
 *   5 mutating "record" actions → POST /api/v1/events
 *   1 read-only "query" action  → POST /api/v1/query
 *
 * Design principles (from the API contract):
 *   - Handlers are intentionally thin: they call the existing API client.
 *   - The backend owns validation, business rules, and persistence.
 *   - Handlers return the API client's result, including clarification.
 *   - If the backend needs clarification, Voxide's model asks and retries.
 *
 * @see API_CONTRACT.md  — full backend contract
 * @see voxide_capability.md — capability registration spec
 * @see voxide_integration.md — SDK integration guide
 */

import { VoxideClient, type VoxideAction } from "@voxide/react";
import { createEvent, queryBusiness } from "@/lib/api/client";
import type { EventType } from "@/lib/api/types";
import {
  MVP_BUSINESS_ID,
  DEFAULT_LANGUAGE,
  VOXIDE_ENABLED,
} from "@/lib/config";

// ---------------------------------------------------------------------------
// Client initialisation
// ---------------------------------------------------------------------------

/**
 * Publishable key from the environment. No placeholder: without a real key
 * the widget stays unmounted and the rest of the app keeps working.
 */
const publicKey = process.env.NEXT_PUBLIC_VOXIDE_PUBLIC_KEY?.trim();

/**
 * Shared client when a real key is configured. Null leaves voice disabled.
 */
export const ai: VoxideClient | null = publicKey
  ? VOXIDE_ENABLED
    ? new VoxideClient({ publicKey })
    : null
  : null;

/** Same currency choices as the event form. Omitted voice currency uses ETB. */
const CURRENCIES = ["ETB", "USD"] as const;
const DEFAULT_CURRENCY = "ETB";
const DEBT_DIRECTIONS = ["owed_to_business", "owed_by_business"] as const;

// ---------------------------------------------------------------------------
// Shared handler helpers
// ---------------------------------------------------------------------------

/**
 * Returns the current business ID.
 *
 * Sourced from the existing app config (`MVP_BUSINESS_ID`) rather than
 * inventing new state — per the capability registration spec.
 */
function getBusinessId(): string {
  return MVP_BUSINESS_ID;
}

/**
 * Returns the current interaction language.
 *
 * Sourced from the existing app config (`DEFAULT_LANGUAGE`) rather than
 * inventing new state — per the capability registration spec.
 */
function getLanguage(): string {
  return DEFAULT_LANGUAGE;
}

function asText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function currencyOf(value: unknown): string {
  const text = asText(value)?.toUpperCase();
  if (text && (CURRENCIES as readonly string[]).includes(text)) {
    return text;
  }
  return DEFAULT_CURRENCY;
}

function directionOf(
  value: unknown,
): (typeof DEBT_DIRECTIONS)[number] | null {
  const text = asText(value);
  if (text && (DEBT_DIRECTIONS as readonly string[]).includes(text)) {
    return text as (typeof DEBT_DIRECTIONS)[number];
  }
  return null;
}

function withDate(
  data: Record<string, string | number | null>,
  value: unknown,
): Record<string, string | number | null> {
  const date = asText(value);
  if (date) {
    data.date = date;
  }
  return data;
}

function missingFields(fields: string[], message: string) {
  return {
    ok: false as const,
    kind: "clarification" as const,
    message,
    missing_fields: fields,
  };
}

/**
 * Submits a business event through the shared API client.
 * The client owns URL resolution, JSON parsing, and clarification mapping.
 */
function submitEvent(
  eventType: EventType,
  data: Record<string, string | number | null>,
) {
  return createEvent({
    business_id: getBusinessId(),
    language: getLanguage(),
    event_type: eventType,
    data,
  });
}

/** Submits a natural-language query through the shared API client. */
function submitQuery(query: string) {
  return queryBusiness({
    business_id: getBusinessId(),
    language: getLanguage(),
    query,
  });
}

function confirmationDetail(
  actionName: string,
  args: Record<string, unknown>,
): string {
  const currency = currencyOf(args.currency);
  if (actionName === "recordSale") {
    return [
      `Item: ${asText(args.item) ?? args.item}`,
      `Quantity: ${asNumber(args.quantity) ?? args.quantity}`,
      `Amount: ${asNumber(args.amount) ?? args.amount}`,
      `Currency: ${currency}`,
      asText(args.customer) ? `Customer: ${asText(args.customer)}` : null,
    ]
      .filter((line): line is string => Boolean(line))
      .join("\n");
  }
  if (actionName === "recordExpense") {
    return [
      `Description: ${asText(args.description) ?? args.description}`,
      `Amount: ${asNumber(args.amount) ?? args.amount}`,
      `Currency: ${currency}`,
    ].join("\n");
  }
  if (actionName === "recordPurchase") {
    return [
      `Item: ${asText(args.item) ?? args.item}`,
      `Quantity: ${asNumber(args.quantity) ?? args.quantity}`,
      `Amount: ${asNumber(args.amount) ?? args.amount}`,
      `Currency: ${currency}`,
      asText(args.supplier) ? `Supplier: ${asText(args.supplier)}` : null,
    ]
      .filter((line): line is string => Boolean(line))
      .join("\n");
  }
  if (actionName === "recordAdjustment") {
    const quantity = asNumber(args.quantity);
    const effect =
      quantity === null
        ? ""
        : quantity > 0
          ? " (increases stock)"
          : quantity < 0
            ? " (decreases stock)"
            : " (no stock change)";
    return [
      `Item: ${asText(args.item) ?? args.item}`,
      `Quantity: ${quantity ?? args.quantity}${effect}`,
      `Reason: ${asText(args.reason) ?? "none"}`,
    ].join("\n");
  }
  if (actionName === "recordDebt") {
    return [
      `Customer: ${asText(args.customer) ?? args.customer}`,
      `Amount: ${asNumber(args.amount) ?? args.amount}`,
      `Currency: ${currency}`,
      `Direction: ${asText(args.direction) ?? args.direction}`,
    ].join("\n");
  }
  return "";
}

/**
 * SDK default confirmation only shows the action description.
 * This handler shows the values that will be recorded. `dangerous: true`
 * still turns confirmation on; this only replaces the prompt text.
 */
function confirmRecord(
  action: VoxideAction,
  args: Record<string, unknown>,
): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const detail = confirmationDetail(action.name, args);
  const message = detail
    ? `Confirm this record?\n\n${detail}`
    : `Confirm: ${action.description}`;
  return window.confirm(message);
}

// ---------------------------------------------------------------------------
// Capability registration
// ---------------------------------------------------------------------------

/**
 * Register all six voice capabilities in a single `ai.register()` call.
 *
 * Action names, param shapes, endpoint routing, and `dangerous` flags are
 * non-negotiable and must stay aligned with the backend's event/query types.
 * See voxide_capability.md § "Non-negotiable" for the full list of constraints.
 *
 * Every `record*` action is `dangerous: true` (prompts user confirmation).
 * `queryBusiness` is `dangerous: false` (read-only, no confirmation needed).
 */
if (ai) {
ai.onConfirmation(confirmRecord);
ai.register({
  // -------------------------------------------------------------------------
  // recordSale — POST /api/v1/events with event_type: "sale"
  //
  // Records a sale of an item. The user speaks something like:
  // "I sold 3 shirts for 900 birr" or "Record a sale of 5 bags to Hana"
  // -------------------------------------------------------------------------
  recordSale: {
    description: "Record a sale of an item to a customer",
    params: {
      item:     { required: true,  type: "string" },
      quantity: { required: true,  type: "number" },
      amount:   { required: true,  type: "number" },
      currency: {
        type: "string",
        enum: [...CURRENCIES],
        description: "ETB or USD. Omit to record ETB, the event form default.",
      },
      customer: { type: "string", sensitive: true },
      date:     {                  type: "string" },  // optional, ISO date
    },
    dangerous: true,
    handler: (params: Record<string, unknown>) => {
      const item = asText(params.item);
      const quantity = asNumber(params.quantity);
      const amount = asNumber(params.amount);
      if (!item || quantity === null || amount === null) {
        return missingFields(
          [
            !item ? "item" : "",
            quantity === null ? "quantity" : "",
            amount === null ? "amount" : "",
          ].filter(Boolean),
          "A sale needs an item, quantity, and amount.",
        );
      }
      return submitEvent(
        "sale",
        withDate(
          {
            item,
            quantity,
            amount,
            currency: currencyOf(params.currency),
            customer: asText(params.customer),
          },
          params.date,
        ),
      );
    },
  },

  // -------------------------------------------------------------------------
  // recordExpense — POST /api/v1/events with event_type: "expense"
  //
  // Records a business expense. The user speaks something like:
  // "I spent 2000 birr on transportation" or "Record 500 birr expense for rent"
  // -------------------------------------------------------------------------
  recordExpense: {
    description: "Record a business expense",
    params: {
      description: { required: true,  type: "string" },
      amount:      { required: true,  type: "number" },
      currency: {
        type: "string",
        enum: [...CURRENCIES],
        description: "ETB or USD. Omit to record ETB, the event form default.",
      },
      category:    {                  type: "string" },  // optional
      date:        {                  type: "string" },  // optional, ISO date
    },
    dangerous: true,
    handler: (params: Record<string, unknown>) => {
      const description = asText(params.description);
      const amount = asNumber(params.amount);
      if (!description || amount === null) {
        return missingFields(
          [
            !description ? "description" : "",
            amount === null ? "amount" : "",
          ].filter(Boolean),
          "An expense needs a description and an amount.",
        );
      }
      return submitEvent(
        "expense",
        withDate(
          {
            description,
            amount,
            currency: currencyOf(params.currency),
            category: asText(params.category),
          },
          params.date,
        ),
      );
    },
  },

  // -------------------------------------------------------------------------
  // recordPurchase — POST /api/v1/events with event_type: "purchase"
  //
  // Records a purchase of stock/supplies. The user speaks something like:
  // "I bought 20 shirts for 8000 birr" or "Purchased 50 bags from Kebede"
  // -------------------------------------------------------------------------
  recordPurchase: {
    description: "Record a purchase of stock or supplies from a supplier",
    params: {
      item:     { required: true,  type: "string" },
      quantity: { required: true,  type: "number" },
      amount:   { required: true,  type: "number" },
      currency: {
        type: "string",
        enum: [...CURRENCIES],
        description: "ETB or USD. Omit to record ETB, the event form default.",
      },
      supplier: { type: "string", sensitive: true },
      date:     {                  type: "string" },  // optional, ISO date
    },
    dangerous: true,
    handler: (params: Record<string, unknown>) => {
      const item = asText(params.item);
      const quantity = asNumber(params.quantity);
      const amount = asNumber(params.amount);
      if (!item || quantity === null || amount === null) {
        return missingFields(
          [
            !item ? "item" : "",
            quantity === null ? "quantity" : "",
            amount === null ? "amount" : "",
          ].filter(Boolean),
          "A purchase needs an item, quantity, and amount.",
        );
      }
      return submitEvent(
        "purchase",
        withDate(
          {
            item,
            quantity,
            amount,
            currency: currencyOf(params.currency),
            supplier: asText(params.supplier),
          },
          params.date,
        ),
      );
    },
  },

  // -------------------------------------------------------------------------
  // recordAdjustment — POST /api/v1/events with event_type: "inventory_adjustment"
  //
  // Adjusts inventory for an item. Positive quantity increases stock,
  // negative decreases it. The user speaks something like:
  // "2 shirts were damaged" or "Add 10 bags to inventory"
  // -------------------------------------------------------------------------
  recordAdjustment: {
    description:
      "Adjust inventory quantity for an item. A positive quantity increases stock. A negative quantity decreases stock. Damage, loss, or spoilage must use a negative quantity.",
    params: {
      item:     { required: true,  type: "string" },
      quantity: {
        required: true,
        type: "number",
        description:
          "Positive quantity increases stock. Negative quantity decreases stock. For damage or loss, send a negative number.",
      },
      reason:   {                  type: "string" },  // optional
      date:     {                  type: "string" },  // optional, ISO date
    },
    dangerous: true,
    handler: (params: Record<string, unknown>) => {
      const item = asText(params.item);
      const quantity = asNumber(params.quantity);
      if (!item || quantity === null) {
        return missingFields(
          [!item ? "item" : "", quantity === null ? "quantity" : ""].filter(
            Boolean,
          ),
          "An inventory adjustment needs an item and a signed quantity.",
        );
      }
      const data: Record<string, string | number | null> = { item, quantity };
      const reason = asText(params.reason);
      if (reason) {
        data.reason = reason;
      }
      return submitEvent("inventory_adjustment", withDate(data, params.date));
    },
  },

  // -------------------------------------------------------------------------
  // recordDebt — POST /api/v1/events with event_type: "customer_debt"
  //
  // Records a debt relationship. The user speaks something like:
  // "Hana owes me 600 birr" or "I owe Abebe 1200 birr"
  // -------------------------------------------------------------------------
  recordDebt: {
    description:
      "Record money a customer owes the business, or money the business owes a customer",
    params: {
      customer:  { required: true, type: "string", sensitive: true },
      amount:    { required: true,  type: "number" },
      currency: {
        type: "string",
        enum: [...CURRENCIES],
        description: "ETB or USD. Omit to record ETB, the event form default.",
      },
      direction: {
        required: true,
        type: "string",
        enum: [...DEBT_DIRECTIONS],
        description:
          "owed_to_business when the customer owes the business. owed_by_business when the business owes the customer.",
      },
      date:      {                  type: "string" },  // optional, ISO date
    },
    dangerous: true,
    handler: (params: Record<string, unknown>) => {
      const customer = asText(params.customer);
      const amount = asNumber(params.amount);
      const direction = directionOf(params.direction);
      const missing = [
        !customer ? "customer" : "",
        amount === null ? "amount" : "",
        !direction ? "direction" : "",
      ].filter(Boolean);
      if (!customer || amount === null || !direction) {
        return missingFields(
          missing,
          "Customer debt needs a customer, an amount, and direction owed_to_business or owed_by_business.",
        );
      }
      return submitEvent(
        "customer_debt",
        withDate(
          {
            customer,
            amount,
            currency: currencyOf(params.currency),
            direction,
          },
          params.date,
        ),
      );
    },
  },

  // -------------------------------------------------------------------------
  // queryBusiness — POST /api/v1/query
  //
  // Answers a question about the business. The user speaks something like:
  // "How much did I sell today?" or "Who owes me money?"
  // This is read-only, so dangerous is false (no confirmation prompt).
  // -------------------------------------------------------------------------
  queryBusiness: {
    description:
      "Answer a question about sales, expenses, purchases, inventory, or customer debt",
    params: {
      query: { required: true, type: "string" },
    },
    dangerous: false,
    handler: (params: Record<string, unknown>) => {
      const query = asText(params.query);
      if (!query) {
        return missingFields(["query"], "A business question is required.");
      }
      return submitQuery(query);
    },
  },
});
}

// ---------------------------------------------------------------------------
// bindState — intentionally NOT wired up
// ---------------------------------------------------------------------------
//
// Per voxide_capability.md § "bindState — do not add by default":
// None of these six actions need bindState — every one is fully specified by
// what the user says (item, quantity, amount, etc. are all spoken, never
// implied by "that one" or "the current page").
//
// If a future UI adds a selection/view concept that voice commands would need
// to resolve (e.g. a selected inventory row for "mark that one as damaged"),
// bindState should be added at that point — not preemptively.
// ---------------------------------------------------------------------------
