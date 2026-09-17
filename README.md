# Voice-First Business Assistant

> Run your business by voice.

## Frontend Service

This repository is the **Frontend Service** for the STARK Hackathon 2026 project, Voice-First Business Assistant.

The product is a voice-first business assistant for small-business owners. It is intended to let owners record business activity and query their business state using natural language and voice. Typical activity includes sales, expenses, purchases, inventory changes, and customer debts.

This repository is currently at an early stage and hosts the project landing page. The frontend product experience is planned; voice capture, business-state persistence, dashboards, backend APIs, and decision support are not yet implemented here.

### Frontend Responsibilities

The Frontend Service will provide:

- A mobile-first user interface
- Voice interaction and recording UI
- A business dashboard
- Business metrics and visualizations
- Transaction and history views
- Communication with the Backend Service and AI / Voice Service
- A responsive desktop experience

The frontend presents data and interaction states. It does not own business rules or the canonical business state.

## Services

The project is split across three services:

1. **Frontend Service** — this repository. Owns the user interface, voice interaction UI, dashboards, visualizations, transaction/history views, and service communication.
2. **Backend Service** — a separate repository. Owns business data, validation, business logic, calculations, persistence, and the authoritative business state.
3. **AI / Voice Service** — a separate repository. Owns natural-language and voice interaction, Voxide integration, and later ScholarXIV integration. It interprets requests and coordinates with the Backend Service; it does not replace the backend as the source of truth.

## Architecture

```text
User
	|
	v
Frontend Service
	|
	v
AI / Voice Service
	|
	v
Backend Service
	|
	v
Database
```

The Backend Service is the source of truth for business state, validated records, and deterministic business calculations. The AI / Voice Service helps interpret and express natural-language interactions, while the Frontend Service presents the experience.

## Repository Links

- **Frontend Service:** this repository
- **Backend Service:** repository URL TBD
- **AI / Voice Service:** repository URL TBD

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

## Development Workflow

The `main` branch is protected. Work happens on feature branches, and changes are submitted through pull requests. At least one experienced developer reviews each pull request before it is merged. The experienced developers for this project are **Fraol, Brooke, and Ali**.

## Planned Architecture Principle

AI should interpret natural-language input and explain results, but the underlying structured business state and deterministic calculations should remain the source of truth for business numbers.

## Documentation

- [Problem exploration](docs/ideation/01-problem-exploration.md)
- [Research findings](docs/ideation/02-research-findings.md)
- [Existing approaches](docs/ideation/03-existing-approaches.md)
- [Solution hypothesis](docs/ideation/04-solution-hypothesis.md)
- [Product definition](docs/ideation/05-product-definition.md)
- [Architecture](docs/architecture/architecture.md)

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

To build and lint locally:

```bash
npm run build
npm run lint
```

## Status

Built during the STARK Official Hackathon 2026.
