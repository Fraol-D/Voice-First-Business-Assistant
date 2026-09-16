# Voice-First Business Assistant

> Run your business by voice.

A voice-first operating assistant for microbusinesses.

The system is intended to help business owners capture everyday business activity such as sales, expenses, purchases, inventory changes, and customer debts through natural voice interaction.

It converts spoken activity into structured business events, maintains a live view of business state, provides visual business insights, and helps owners make operational decisions using their own data.

This repository is at an early stage. The application currently hosts a project landing page. Voice capture, business-state persistence, dashboards, and decision support are planned and not yet implemented.

## Core Flow

Voice → Validated Business Event → Business State → Analysis → Decision

## Planned Capabilities

- Voice-based business activity capture
- Sales and expense tracking
- Inventory tracking
- Customer receivables
- Business dashboard
- Business visualizations
- Voice-based business queries
- Operational decision support

## Planned Architecture Principle

AI should interpret natural-language input and explain results, but the underlying structured business state and deterministic calculations should remain the source of truth for business numbers.

## Documentation

- [Problem exploration](docs/ideation/01-problem-exploration.md)
- [Research findings](docs/ideation/02-research-findings.md)
- [Existing approaches](docs/ideation/03-existing-approaches.md)
- [Solution hypothesis](docs/ideation/04-solution-hypothesis.md)
- [Product definition](docs/ideation/05-product-definition.md)
- [Architecture](docs/architecture/architecture.md)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

```bash
npm run build
npm run lint
```

## Status

Built during the STARK Official Hackathon 2026.
test test
