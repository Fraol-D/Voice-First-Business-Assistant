const DEFAULT_CURRENCY = "ETB";

const MONETARY_STRING_REGEX =
  /^(?:((?:[A-Za-z]{3}|[Bb][Ii][Rr][Rr]|ብር)(?:\s+(?:[A-Za-z]{3}|[Bb][Ii][Rr][Rr]|ብር))*)\s*)?([+-]?\d[\d,]*(?:\.\d+)?)(?:\s*((?:[A-Za-z]{3}|[Bb][Ii][Rr][Rr]|ብር)(?:\s+(?:[A-Za-z]{3}|[Bb][Ii][Rr][Rr]|ብር))*))?$/;

function normalizeCurrency(currency?: string | null): string | null {
  if (typeof currency !== "string") return null;
  const trimmed = currency.trim();
  if (!trimmed) return null;
  if (/^(?:birr|ብር)$/i.test(trimmed)) {
    return "ETB";
  }
  if (/^[A-Za-z]{3}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  return null;
}

function formatNumeric(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formats a numeric or preformatted monetary value into `<number> <CURRENCY>`
 * (e.g. `90,000 ETB`), preventing duplicate leading or trailing currency labels.
 *
 * Non-monetary strings, null/undefined, empty strings, NaN, and Infinity
 * safely fall back to `0 <CURRENCY>` (defaulting to `0 ETB`).
 */
export function formatAmount(
  value: number | string | null | undefined,
  currency?: string | null,
): string {
  const explicitCurrency = normalizeCurrency(currency);
  const fallbackCurrency = explicitCurrency ?? DEFAULT_CURRENCY;

  if (value === null || value === undefined) {
    return `0 ${fallbackCurrency}`;
  }

  if (typeof value === "number") {
    return `${formatNumeric(value)} ${fallbackCurrency}`;
  }

  if (typeof value !== "string") {
    return `0 ${fallbackCurrency}`;
  }

  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return `0 ${fallbackCurrency}`;
  }

  const match = MONETARY_STRING_REGEX.exec(normalized);
  if (!match) {
    return `0 ${fallbackCurrency}`;
  }

  const leadingTokens = match[1]?.trim().split(/\s+/) ?? [];
  const numericCore = match[2];
  const trailingTokens = match[3]?.trim().split(/\s+/) ?? [];

  const embeddedCurrency =
    normalizeCurrency(leadingTokens[0]) ??
    normalizeCurrency(trailingTokens[0]);

  const parsed = Number(numericCore.replace(/,/g, ""));
  const resolvedCurrency =
    explicitCurrency ?? embeddedCurrency ?? DEFAULT_CURRENCY;

  if (!Number.isFinite(parsed)) {
    return `0 ${resolvedCurrency}`;
  }

  return `${formatNumeric(parsed)} ${resolvedCurrency}`;
}
