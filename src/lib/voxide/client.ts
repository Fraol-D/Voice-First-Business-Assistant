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
 *   - Handlers are intentionally thin: fetch + return response as-is.
 *   - The backend owns validation, business rules, and persistence.
 *   - Handlers never construct their own success/error/clarification messages.
 *   - If the backend returns `needs_clarification`, Voxide's model will
 *     naturally ask the user for the missing field and re-call the action.
 *
 * @see API_CONTRACT.md  — full backend contract
 * @see voxide_capability.md — capability registration spec
 * @see voxide_integration.md — SDK integration guide
 */

import { VoxideClient } from "@voxide/react";
import { MVP_BUSINESS_ID, DEFAULT_LANGUAGE, getApiBaseUrl } from "@/lib/config";

// ---------------------------------------------------------------------------
// Client initialisation
// ---------------------------------------------------------------------------

/**
 * The publishable key is safe to ship in the browser.
 * Source it from the environment so it's easy to rotate per deployment.
 * Falls back to a placeholder if the env var is not set.
 */
const publicKey =
  process.env.NEXT_PUBLIC_VOXIDE_PUBLIC_KEY ?? "vox_pub_XXXXXXXXXXXX";

/**
 * Single Voxide client instance shared across the app.
 * Imported by the <AssistantWidget /> component to render the voice UI.
 */
export const ai = new VoxideClient({ publicKey });

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

/**
 * Submits a business event to the backend.
 *
 * Every `record*` capability handler funnels through this function.
 * It builds the request payload per the API contract (§5) and returns
 * the backend's JSON response **as-is** — the Voxide model composes
 * what it actually says from the structured result.
 *
 * @param eventType - One of: sale, expense, purchase, inventory_adjustment, customer_debt
 * @param data      - The event-specific fields (item, quantity, amount, etc.)
 * @returns The backend's raw JSON response (success, clarification, or error)
 */
async function submitEvent(
  eventType: string,
  data: Record<string, unknown>,
): Promise<unknown> {
  const baseUrl = getApiBaseUrl();

  const res = await fetch(`${baseUrl}/api/v1/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      business_id: getBusinessId(),
      language: getLanguage(),
      event_type: eventType,
      data,
    }),
  });

  // Return the backend's response object untouched — never construct
  // our own success/error/clarification messages (API contract §17,
  // voxide_capability.md § "Response handling — important").
  return await res.json();
}

/**
 * Submits a natural-language query to the backend.
 *
 * The `queryBusiness` capability handler calls this function.
 * It builds the request payload per the API contract (§9) and returns
 * the backend's JSON response **as-is**.
 *
 * @param query - The user's natural-language question (e.g. "How much did I sell today?")
 * @returns The backend's raw JSON response (success or error)
 */
async function submitQuery(query: string): Promise<unknown> {
  const baseUrl = getApiBaseUrl();

  const res = await fetch(`${baseUrl}/api/v1/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      business_id: getBusinessId(),
      language: getLanguage(),
      query,
    }),
  });

  // Return the backend's response object untouched.
  return await res.json();
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
      customer: {                  type: "string" },  // optional
      date:     {                  type: "string" },  // optional, ISO date
    },
    dangerous: true,
    handler: (params: Record<string, unknown>) => submitEvent("sale", params),
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
      category:    {                  type: "string" },  // optional
      date:        {                  type: "string" },  // optional, ISO date
    },
    dangerous: true,
    handler: (params: Record<string, unknown>) => submitEvent("expense", params),
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
      supplier: {                  type: "string" },  // optional
      date:     {                  type: "string" },  // optional, ISO date
    },
    dangerous: true,
    handler: (params: Record<string, unknown>) => submitEvent("purchase", params),
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
      "Adjust inventory quantity for an item, e.g. for damage or a stock correction",
    params: {
      item:     { required: true,  type: "string" },
      quantity: { required: true,  type: "number" },  // positive = increase, negative = decrease
      reason:   {                  type: "string" },  // optional
      date:     {                  type: "string" },  // optional, ISO date
    },
    dangerous: true,
    handler: (params: Record<string, unknown>) =>
      submitEvent("inventory_adjustment", params),
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
      customer:  { required: true,  type: "string" },
      amount:    { required: true,  type: "number" },
      direction: { required: true,  type: "string" },  // "owed_to_business" | "owed_by_business"
      date:      {                  type: "string" },  // optional, ISO date
    },
    dangerous: true,
    handler: (params: Record<string, unknown>) =>
      submitEvent("customer_debt", params),
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
    handler: (params: Record<string, unknown>) =>
      submitQuery(params.query as string),
  },
});

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
