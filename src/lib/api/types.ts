export const EVENT_TYPES = [
  "sale",
  "expense",
  "purchase",
  "inventory_adjustment",
  "customer_debt",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export type CreateEventRequest = {
  business_id: string;
  language: string;
  event_type: EventType;
  data: Record<string, string | number | null>;
};

export type QueryRequest = {
  business_id: string;
  language: string;
  query: string;
};

export type EventRecord = {
  id: string;
  event_type: string;
  data: Record<string, unknown>;
};

export type CreateEventSuccess = {
  success: true;
  event: EventRecord;
  message: string;
};

export type QuerySuccess = {
  success: true;
  query_type?: string;
  result?: unknown;
  message: string;
};

export type HealthSuccess = {
  status: string;
};

export type ApiFailureKind = "config" | "network" | "error" | "clarification";

export type ApiFailure = {
  ok: false;
  kind: ApiFailureKind;
  message: string;
  code?: string;
  missing_fields?: string[];
  status?: number;
};

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  status: number;
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;
