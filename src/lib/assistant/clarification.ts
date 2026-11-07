import type {
  CreateEventRequest,
  EventType,
  InterpretationEventData,
  InterpretationResult,
} from "@/lib/api/types";

/**
 * The engine keeps no session. Each follow-up resends this block.
 * A clarification response has only a question and missing fields.
 */
export type PendingClarification = {
  originalText: string;
  question: string;
  missingFields: string[];
  priorAnswers: string[];
};

const CONTINUATION_CLOSING =
  "Resolve the original request using the clarification answer.";

export type PreparedInterpretation = {
  text: string;
  continues: PendingClarification | null;
  abandonedPending: boolean;
};

export type AssistantTurnResolution =
  | {
      action: "clarification";
      pending: PendingClarification;
      question: string;
    }
  | {
      action: "await_confirmation";
      eventType: EventType;
      data: InterpretationEventData;
    }
  | {
      action: "query";
      query: string;
    };

function textField(data: InterpretationEventData, key: string): string | null {
  const value = data[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberField(data: InterpretationEventData, key: string): number | null {
  const value = data[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * Date is intentionally not required. An omitted date lets the backend apply
 * the current business date in Africa/Addis_Ababa.
 */
export function isTextEventReady(
  eventType: EventType,
  data: InterpretationEventData,
): boolean {
  if (eventType === "sale" || eventType === "purchase") {
    return (
      textField(data, "item") !== null &&
      numberField(data, "quantity") !== null &&
      numberField(data, "amount") !== null
    );
  }

  if (eventType === "expense") {
    return (
      textField(data, "description") !== null &&
      numberField(data, "amount") !== null
    );
  }

  if (eventType === "inventory_adjustment") {
    const quantity = numberField(data, "quantity");
    return textField(data, "item") !== null && quantity !== null && quantity !== 0;
  }

  return (
    textField(data, "customer") !== null &&
    numberField(data, "amount") !== null &&
    textField(data, "direction") !== null
  );
}

export function normalizeUtterance(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/\bwhat's\b/g, "what is")
    .replace(/\bwhats\b/g, "what is")
    .replace(/\bhow's\b/g, "how is")
    .replace(/\bhows\b/g, "how is")
    .replace(/\bwho's\b/g, "who is")
    .replace(/\bwhos\b/g, "who is")
    .replace(/\bwhere's\b/g, "where is")
    .replace(/\bwheres\b/g, "where is")
    .replace(/\bwhen's\b/g, "when is")
    .replace(/\bwhens\b/g, "when is")
    .replace(/\bi'm\b/g, "i am")
    .replace(/\bit's\b/g, "it is")
    .replace(/\bthat's\b/g, "that is")
    .replace(/\s+/g, " ")
    .trim();
}

function isBusinessQuery(normalized: string): boolean {
  if (
    /\bhow much did i\b/.test(normalized) ||
    /\bhow many did i\b/.test(normalized) ||
    /\bhow much have i\b/.test(normalized) ||
    /\bhow many have i\b/.test(normalized) ||
    /\bwhat did i (sell|buy|spend|pay|make)\b/.test(normalized) ||
    /\bwho owes\b/.test(normalized) ||
    /\bwhat do i owe\b/.test(normalized) ||
    /\bwhat is my\b/.test(normalized) ||
    /\bhow is my\b/.test(normalized)
  ) {
    return true;
  }

  if (
    /^(show|list|tell me)\b/.test(normalized) &&
    /\b(sales|expenses|inventory|stock|debt|profit)\b/.test(normalized)
  ) {
    return true;
  }

  if (
    /^(how|what|who|where|when|which)\b/.test(normalized) &&
    /\b(sales|expenses|inventory|stock|profit|revenue)\b/.test(normalized)
  ) {
    return true;
  }

  if (/\bhow much\b.*\b(sell|sold|spend|spent|make|made|owe)\b/.test(normalized)) {
    return true;
  }

  if (/\bhow many\b.*\b(sell|sold|left|have|stock)\b/.test(normalized)) {
    return true;
  }

  return false;
}

function isSocialOrChatter(normalized: string): boolean {
  return (
    /^(hi|hello|hey|yo|sup|thanks|thank you|ok|okay|cool|good morning|good afternoon|good evening|good night)\b/.test(
      normalized,
    ) ||
    /\bwhat is up\b/.test(normalized) ||
    /\bhow are you\b/.test(normalized) ||
    /\bwho are you\b/.test(normalized) ||
    /\bhow is it going\b/.test(normalized) ||
    /\bwhat are you doing\b/.test(normalized)
  );
}

function isOpenQuestion(normalized: string): boolean {
  return (
    normalized.endsWith("?") ||
    /^(how|what|who|where|when|why|which|can you|could you|would you|do you)\b/.test(
      normalized,
    )
  );
}

function isCorrection(normalized: string): boolean {
  return (
    /\b(actually|correction|instead|rather)\b/.test(normalized) ||
    /\b(make it|change it|it was|it is now)\b/.test(normalized) ||
    /^(no|nope|wrong)\b/.test(normalized)
  );
}

function suppliesTransactionFacts(
  normalized: string,
  pending: PendingClarification,
): boolean {
  if (/\b\d{4}-\d{2}-\d{2}\b/.test(normalized)) return true;
  if (/\b(birr|etb|usd|dollar|dollars)\b/.test(normalized)) return true;
  if (/\b(each|per unit|unit price|a piece|apiece)\b/.test(normalized)) return true;
  if (/\b(amount|quantity|qty|unit price|total)\b/.test(normalized) && /\d/.test(normalized)) {
    return true;
  }

  const missing = pending.missingFields.map((field) => field.toLowerCase());
  const asksDate = missing.some((field) => field.includes("date"));
  if (
    asksDate &&
    /\b(today|yesterday|tomorrow)\b/.test(normalized) &&
    !isBusinessQuery(normalized)
  ) {
    return true;
  }
  if (/\b(the date is|date is|dated)\b/.test(normalized)) return true;

  const asksNumber = missing.some((field) =>
    /amount|quantity|qty|price|unit/.test(field),
  );
  if (
    asksNumber &&
    /\b\d+(?:[.,]\d+)?\b/.test(normalized) &&
    !isBusinessQuery(normalized)
  ) {
    return true;
  }

  if (
    missing.some((field) => normalized.includes(field.replace(/_/g, " "))) &&
    (/\d/.test(normalized) ||
      /\b(today|yesterday|tomorrow|birr|etb)\b/.test(normalized))
  ) {
    return true;
  }

  return false;
}

function isClearlyDifferentTransaction(
  normalized: string,
  pending: PendingClarification,
): boolean {
  const starter =
    /^(i\s+(sold|bought|spent|paid|lost)|record\b|add\b|log\b)/.test(normalized);
  if (!starter) return false;

  if (
    /\b(them|it|those|the sale|each|per)\b/.test(normalized) &&
    suppliesTransactionFacts(normalized, pending)
  ) {
    return false;
  }

  if (
    /^(add|record|log)\b/.test(normalized) &&
    suppliesTransactionFacts(normalized, pending) &&
    !/\b(sale|expense|purchase|debt|inventory)\b/.test(normalized)
  ) {
    return false;
  }

  return true;
}

/**
 * A pending sale must not absorb chatter or a new business question.
 * Contractions such as "what's" are expanded before the check.
 * Messages that supply a missing amount, quantity, price, or date stay attached.
 */
export function isUnrelatedToPending(
  text: string,
  pending: PendingClarification,
): boolean {
  const normalized = normalizeUtterance(text);
  if (!normalized) return false;
  if (isClearlyDifferentTransaction(normalized, pending)) return true;
  if (isBusinessQuery(normalized)) return true;
  if (isSocialOrChatter(normalized) && !suppliesTransactionFacts(normalized, pending)) {
    return true;
  }
  if (suppliesTransactionFacts(normalized, pending) || isCorrection(normalized)) {
    return false;
  }
  if (isOpenQuestion(normalized)) return true;
  return false;
}

function singleLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Earlier answers stay inside the one answer line the engine continuation
 * parser accepts. A newline in that line makes the interpreter drop the sale.
 */
function clarificationAnswerLine(answers: string[]): string {
  const parts = answers.map(singleLine).filter((answer) => answer.length > 0);
  return parts
    .map((part, index) => {
      if (index === parts.length - 1) return part;
      return /[.!?]$/.test(part) ? part : `${part}.`;
    })
    .join(" ");
}

export function buildInterpretationText(
  pending: PendingClarification,
  answer: string,
): string {
  return [
    `Original user statement: ${pending.originalText}`,
    `Clarification question: ${pending.question}`,
    `Missing fields: ${pending.missingFields.join(", ")}`,
    `User clarification answer: ${clarificationAnswerLine([
      ...pending.priorAnswers,
      answer,
    ])}`,
    CONTINUATION_CLOSING,
  ].join("\n");
}

export function prepareInterpretationRequest(
  pending: PendingClarification | null,
  userText: string,
): PreparedInterpretation {
  const trimmed = userText.trim();
  if (!pending || isUnrelatedToPending(trimmed, pending)) {
    return {
      text: trimmed,
      continues: null,
      abandonedPending: pending !== null,
    };
  }

  return {
    text: buildInterpretationText(pending, trimmed),
    continues: pending,
    abandonedPending: false,
  };
}

export function nextClarificationState(
  previous: PendingClarification | null,
  userText: string,
  result: Extract<InterpretationResult, { type: "clarification" }>,
): PendingClarification {
  if (!previous) {
    return {
      originalText: userText.trim(),
      question: result.question,
      missingFields: [...result.missing_fields],
      priorAnswers: [],
    };
  }

  return {
    originalText: previous.originalText,
    question: result.question,
    missingFields: [...result.missing_fields],
    priorAnswers: [...previous.priorAnswers, userText.trim()],
  };
}

/**
 * Copies the engine event. A null or blank date is removed so the backend
 * business-date default applies. Nothing is added from earlier turns.
 */
export function eventDataForConfirmation(
  engineData: InterpretationEventData,
): InterpretationEventData {
  const merged: InterpretationEventData = { ...engineData };
  if (typeof merged.date === "string" && merged.date.trim()) {
    merged.date = merged.date.trim();
  } else {
    delete merged.date;
  }
  return merged;
}

export function buildTextEventRequest(
  eventType: EventType,
  data: InterpretationEventData,
  locale: string,
  businessId: string,
): CreateEventRequest {
  const requestData: InterpretationEventData = { ...data };
  if (eventType !== "inventory_adjustment") {
    const currency = requestData.currency;
    requestData.currency =
      typeof currency === "string" && currency.trim()
        ? currency.trim().toUpperCase()
        : "ETB";
  }

  return {
    business_id: businessId,
    language: locale,
    event_type: eventType,
    data: requestData,
  };
}

export function resolveAssistantTurn(args: {
  userText: string;
  continues: PendingClarification | null;
  interpretation: InterpretationResult;
}): AssistantTurnResolution {
  if (args.interpretation.type === "clarification") {
    const pending = nextClarificationState(
      args.continues,
      args.userText,
      args.interpretation,
    );
    return {
      action: "clarification",
      pending,
      question: args.interpretation.question,
    };
  }

  if (args.interpretation.type === "create_event") {
    return {
      action: "await_confirmation",
      eventType: args.interpretation.event_type,
      data: eventDataForConfirmation(args.interpretation.data),
    };
  }

  return {
    action: "query",
    query: args.interpretation.query,
  };
}

/**
 * Posts an event only after the user confirms the review modal.
 * Interpretation turns must not call this.
 */
export function confirmRecordedEvent<T>(
  request: CreateEventRequest,
  postEvent: (request: CreateEventRequest) => Promise<T>,
): Promise<T> {
  return postEvent(request);
}
