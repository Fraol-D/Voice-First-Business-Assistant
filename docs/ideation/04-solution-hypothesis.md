# Solution Hypothesis

This is a **product hypothesis** derived from the problem and research notes. It is not a research conclusion, and it has not been validated with users in this project.

## Hypothesis

> Could a voice-first interaction layer allow microbusiness owners to capture everyday business activity naturally while a structured data layer converts those interactions into reliable business information for operational decisions?

## How the hypothesis was reached

- Problem exploration pointed to a chain: capture → records → state (stock, cash, debts) → decisions.
- Research described skill and usability barriers to conventional digital tools, incomplete adoption of sophisticated business software among microenterprises, and a gap between informal records and usable insight.
- Comparison of approaches suggested that paper, apps, SMS/USSD, chat, and voice each cover part of that chain and fail at others.
- Voice looked promising as a **capture** layer because work is spoken and hands-busy, and because prior work (especially Dukawalla) already explored it with African SMBs.
- The same prior work showed that sending free speech through an LLM into spreadsheet columns is brittle. That suggested a different split of responsibilities: language understanding on one side, **validated events and persistent state** on the other.

The hypothesis is therefore two-part:

1. Voice can lower the cost of capturing activity **if** the interaction can live alongside serving customers (this is unproven here).
2. Reliability of numbers depends on a structured business-event and state layer, not on the model that parsed the sentence (this is an architectural bet).

## What would count as evidence later

The hypothesis would need evidence that this project does not yet have, for example:

- Owners can complete real capture (sale, expense, stock change, credit sale, payment) by voice without abandoning the tool.
- Extracted events can be validated (missing product, ambiguous amount, unknown customer) before they change state.
- Totals, stock, and receivables match the event log when checked by deterministic rules.
- Owners can ask questions and receive answers that trace back to that state.

Until then, the statement above remains a question.

## What this hypothesis is not

- It is not a claim that voice interfaces are generally better than GUIs.
- It is not a claim that Dukawalla “failed” or that this product is novel as a voice business assistant.
- It is not a claim that AI should compute business metrics.
- It is not user validation.
