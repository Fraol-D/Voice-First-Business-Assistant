/** Temporary MVP business identity until authentication exists. */
export const MVP_BUSINESS_ID = "business_123";

export const DEFAULT_LANGUAGE = "en";

export function getApiBaseUrl(): string | undefined {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!value) {
    return undefined;
  }
  return value.replace(/\/$/, "");
}
