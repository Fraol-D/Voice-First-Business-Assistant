/** Temporary MVP business identity until authentication exists. */
export const MVP_BUSINESS_ID = "business_123";

export const DEFAULT_LANGUAGE = "en";

// A real publishable key enables voice unless explicitly disabled.
export const VOXIDE_ENABLED =
  process.env.NEXT_PUBLIC_VOXIDE_ENABLED !== "false";

export function getApiBaseUrl(): string {
  let value = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!value) {
    return "http://localhost:8000";
  }
  while (value.startsWith("NEXT_PUBLIC_API_URL=")) {
    value = value.slice("NEXT_PUBLIC_API_URL=".length).trim();
  }
  if (!value) {
    return "http://localhost:8000";
  }
  return value.replace(/\/+$/, "");
}

export function getAiEngineUrl(): string | undefined {
  const value = process.env.NEXT_PUBLIC_AI_ENGINE_URL?.trim();
  if (!value) {
    return undefined;
  }
  return value.replace(/\/$/, "");
}
