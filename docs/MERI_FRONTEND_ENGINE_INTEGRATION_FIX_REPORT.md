# Meri frontend / AI engine clarification integration

## 1. Root causes

The AI engine clarification schema allows only `type`, `question`, and `missing_fields`. `extra="forbid"` rejects `data`, `extracted`, `partial`, `resolved`, and `transaction`.

The frontend stored a transaction draft by reading those fields from clarification responses. On a real clarification the draft stayed empty, so item, quantity, amount, currency, and date were not recovered from the response.

The engine continuation parser accepts one text block:

```text
Original user statement: ...
Clarification question: ...
Missing fields: ...
User clarification answer: ...
Resolve the original request using the clarification answer.
```

The frontend added an "Authoritative resolved fields" section and a different closing instruction. That text does not match the parser. Local `interpret_text` on it returned a new clarification asking what was sold.

The interpreter also keeps the first quantity and the first money amount. A later correction in the same continuation does not replace them. The frontend must not invent the corrected total.

## 2. Files modified

- `src/lib/assistant/clarification.ts`
- `src/lib/assistant/clarification.test.ts`
- `src/lib/api/types.ts`
- `src/lib/api/client.test.ts`
- `docs/MERI_FRONTEND_ENGINE_INTEGRATION_FIX_REPORT.md`

`src/components/assistant/assistant-workspace.tsx` already calls `prepareInterpretationRequest`, `resolveAssistantTurn`, and `confirmRecordedEvent`. It did not need a further edit.

No AI engine or backend file was changed. Nothing was deployed.

## 3. Continuation format

Every clarification follow-up is still `POST /interpret` with `{ "text", "language" }`. There is no session and no `context` object.

`text` is:

```text
Original user statement: I sold 30 shoes today.
Clarification question: How much was the sale?
Missing fields: amount
User clarification answer: 3000 birr each.
Resolve the original request using the clarification answer.
```

The pending state keeps the original utterance, the latest question, the latest `missing_fields`, and every earlier answer. The next answer is appended on the same `User clarification answer` line, separated by a space. A newline in that line makes the interpreter drop the sale, so each answer is collapsed to one line.

After the amount answer and a date answer, the request is:

```text
Original user statement: I sold 30 shoes yesterday.
Clarification question: What date should I use? Please give a specific date as YYYY-MM-DD.
Missing fields: date
User clarification answer: 3000 birr each. 2026-11-06
Resolve the original request using the clarification answer.
```

A clarification response updates only the question and `missing_fields`. Transaction values are taken from the later `create_event.data`. A null or blank `data.date` is removed. The frontend does not add `unit_price` or a date of its own. Currency is still uppercased, and a blank non-inventory currency remains `ETB`, which matches the backend default.

Unrelated messages are still sent as their own text. "What's up with u?" does not stay on the sale. The sale draft is cleared. The next "How much did I sell today?" is a new request.

## 4. Engine response shapes used

These shapes come from the engine schema and from local `interpret_text` on the continuation strings above. The HTTP client tests stub `fetch` with the same JSON. They do not call a deployed engine.

Initial sale:

```json
{
  "type": "clarification",
  "question": "How much was the sale?",
  "missing_fields": ["amount"]
}
```

Unit price continuation (`I sold 30 shoes today.` plus `3000 birr each.`):

```json
{
  "type": "create_event",
  "event_type": "sale",
  "data": {
    "item": "shoes",
    "quantity": 30,
    "amount": 90000,
    "currency": "ETB"
  }
}
```

Relative date, before the amount:

```json
{
  "type": "clarification",
  "question": "How much was the sale? What date should I use? Please give a specific date as YYYY-MM-DD.",
  "missing_fields": ["amount", "date"]
}
```

After `3000 birr each.` on that sale:

```json
{
  "type": "clarification",
  "question": "What date should I use? Please give a specific date as YYYY-MM-DD.",
  "missing_fields": ["date"]
}
```

After the accumulated date answer:

```json
{
  "type": "create_event",
  "event_type": "sale",
  "data": {
    "item": "shoes",
    "quantity": 30,
    "amount": 90000,
    "currency": "ETB",
    "date": "2026-11-06"
  }
}
```

`What's up with u?` and `How much did I sell today?` are each a query whose `query` is the same text.

Confirmed event body for the undated sale:

```json
{
  "business_id": "business_123",
  "language": "en",
  "event_type": "sale",
  "data": {
    "item": "shoes",
    "quantity": 30,
    "amount": 90000,
    "currency": "ETB"
  }
}
```

## 5. Tests and commands

Command, from `Voice-First-Business-Assistant`:

```text
npm test
```

Script: `tsx --test src/lib/api/client.test.ts src/lib/assistant/clarification.test.ts`

Result: 29 tests, 28 passed, 0 failed, 1 skipped.

Two tests invoke the local interpreter by running `python` against `meri-ai-engine` (`app/interpreter/service.py`, `interpret_text`). They are not HTTP calls and not a deployed integration.

- The today-sale continuation returned the 90,000 ETB `create_event` above.
- The yesterday amount-plus-date continuation returned the same sale with `date` `2026-11-06`.

The other tests use those JSON fixtures through the frontend functions. `submitText` is checked from source: it does not call `createEvent` or `confirmRecordedEvent`. The confirm handler posts `pendingEvent.request` once.

`npx tsc --noEmit` in the same directory exited 0.

## 6. Correction handling

The correction is preserved in the continuation:

```text
Original user statement: I sold 30 shoes today.
Clarification question: How much was the sale?
Missing fields: amount
User clarification answer: 3000 birr each. No, I sold 20 shoes, and they were 2000 birr each.
Resolve the original request using the clarification answer.
```

The local interpreter returned:

```json
{
  "type": "create_event",
  "event_type": "sale",
  "data": {
    "item": "shoes",
    "quantity": 30,
    "amount": 90000,
    "currency": "ETB"
  }
}
```

That is not quantity 20 and amount 40,000. The test is skipped as blocked by the engine contract. The frontend does not calculate 20 × 2000.

On the real today-sale path, `3000 birr each.` already returns `create_event`. The pending draft is cleared and the confirmation modal opens. A later correction is a new `/interpret` request, not another line on that sale. The blocked test repeats the amount clarification only so both answers are still in one continuation when the interpreter is called.

## 7. Complete sale flow

The compatible continuation for "I sold 30 shoes today." and "3000 birr each." passes in the local interpreter: sale, shoes, quantity 30, amount 90000, currency ETB, no date, no `unit_price`.

The frontend opens confirmation from that `create_event` and does not post before confirm.

## 8. Confirmation

`POST /api/v1/events` still happens only in `confirmRecordedEvent`, which the review modal calls after an explicit confirm. The endpoint, auth, and event body shape are unchanged. Tests recorded zero posts before confirm and one post of the payload in section 4.

## 9. Remaining limitations

- The current engine ignores an explicit later quantity or amount inside a continuation. That needs an engine change. The frontend cannot correct it without inventing totals.
- After `create_event`, the text draft is cleared. A correction typed while the modal is open is not folded back into the original sale.
- Previous answers share one answer line. The engine reads the first quantity and the first price in the composed utterance.
- A newline inside the answer line breaks interpretation, so answers are flattened.
- This run did not call a deployed `/interpret` or `/api/v1/events` service, and the assistant screen was not clicked in a browser.
