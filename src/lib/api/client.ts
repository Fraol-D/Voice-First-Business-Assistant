import { getApiBaseUrl } from "@/lib/config";
import type {
  ApiFailure,
  ApiResult,
  CreateEventRequest,
  CreateEventSuccess,
  HealthSuccess,
  QueryRequest,
  QuerySuccess,
} from "@/lib/api/types";

const CONNECTIVITY_MESSAGE =
  "Unable to connect to the business service. Please try again.";

const CONFIG_MESSAGE =
  "Backend URL is not configured. Set NEXT_PUBLIC_API_URL and restart the app.";

type ErrorPayload = {
  success?: boolean;
  status?: string;
  message?: string;
  missing_fields?: unknown;
  error?: {
    code?: string;
    message?: string;
  };
};

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const fields = value.filter((item): item is string => typeof item === "string");
  return fields.length > 0 ? fields : undefined;
}

function failureFromPayload(
  payload: ErrorPayload | null,
  httpStatus: number,
): ApiFailure {
  const missing = asStringArray(payload?.missing_fields);
  const code = payload?.error?.code;
  const isClarification =
    payload?.status === "needs_clarification" ||
    code === "NEEDS_CLARIFICATION" ||
    Boolean(missing?.length);

  const message =
    payload?.message ||
    payload?.error?.message ||
    "The business service could not complete this request.";

  return {
    ok: false,
    kind: isClarification ? "clarification" : "error",
    message,
    code,
    missing_fields: missing,
    status: httpStatus,
  };
}

async function readJson(response: Response): Promise<unknown | null> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

async function request(
  path: string,
  init: RequestInit,
): Promise<{ response: Response; body: unknown | null } | ApiFailure> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return { ok: false, kind: "config", message: CONFIG_MESSAGE };
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
    const body = await readJson(response);
    return { response, body };
  } catch {
    return { ok: false, kind: "network", message: CONNECTIVITY_MESSAGE };
  }
}

export async function healthCheck(): Promise<ApiResult<HealthSuccess>> {
  const result = await request("/api/v1/health", { method: "GET" });
  if ("ok" in result) {
    return result;
  }

  const { response, body } = result;
  if (!response.ok) {
    return failureFromPayload(
      (body ?? {}) as ErrorPayload,
      response.status,
    );
  }

  const payload = body as HealthSuccess | null;
  if (!payload || typeof payload.status !== "string") {
    return {
      ok: false,
      kind: "error",
      message: "The business service returned an unexpected health response.",
      status: response.status,
    };
  }

  return { ok: true, data: payload, status: response.status };
}

export async function createEvent(
  payload: CreateEventRequest,
): Promise<ApiResult<CreateEventSuccess>> {
  const result = await request("/api/v1/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if ("ok" in result) {
    return result;
  }

  const { response, body } = result;
  const parsed = (body ?? {}) as ErrorPayload & {
    event?: CreateEventSuccess["event"];
    message?: string;
  };

  if (!response.ok || parsed.success === false) {
    return failureFromPayload(parsed, response.status);
  }

  if (parsed.success !== true || !parsed.event || !parsed.message) {
    return {
      ok: false,
      kind: "error",
      message: "The business service returned an unexpected event response.",
      status: response.status,
    };
  }

  return {
    ok: true,
    data: {
      success: true,
      event: parsed.event,
      message: parsed.message,
    },
    status: response.status,
  };
}

export async function queryBusiness(
  payload: QueryRequest,
): Promise<ApiResult<QuerySuccess>> {
  const result = await request("/api/v1/query", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if ("ok" in result) {
    return result;
  }

  const { response, body } = result;
  const parsed = (body ?? {}) as ErrorPayload & {
    query_type?: string;
    result?: unknown;
  };

  if (!response.ok || parsed.success === false) {
    return failureFromPayload(parsed, response.status);
  }

  if (parsed.success !== true || typeof parsed.message !== "string") {
    return {
      ok: false,
      kind: "error",
      message: "The business service returned an unexpected query response.",
      status: response.status,
    };
  }

  return {
    ok: true,
    data: {
      success: true,
      query_type: parsed.query_type,
      result: parsed.result,
      message: parsed.message,
    },
    status: response.status,
  };
}
