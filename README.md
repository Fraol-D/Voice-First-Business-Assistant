# Voice-First Business Assistant

> Run your business by voice.

## Frontend Service

This repository is the **Frontend Service** for the STARK Hackathon 2026 project, Voice-First Business Assistant.

The product is a voice-first business assistant for small-business owners. It is intended to let owners record business activity and query their business state using natural language and voice. Typical activity includes sales, expenses, purchases, inventory changes, and customer debts.

This repository hosts the product landing page, a text-based assistant, and the Voxide voice widget. The widget registers frontend capabilities. Those capabilities call the existing API client (`createEvent` and `queryBusiness`), which talks to the Backend Service over `/api/v1`. The frontend does not contain a voice backend or a business-logic backend, and it does not own business rules or the canonical business state.

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

1. **Frontend Service** — this repository. Owns the user interface, the Voxide voice widget and its capability handlers, dashboards, visualizations, transaction/history views, and calls to the Backend Service through the existing API client.
2. **Backend Service** — a separate repository. Owns business data, validation, business logic, calculations, persistence, and the authoritative business state.
3. **AI / Voice Service** — a separate repository for additional language tooling, including later ScholarXIV integration. It is not the Voxide integration used by this MVP. Live voice is the `@voxide/react` widget in this frontend. Voxide's hosted service handles the voice session. Capability handlers only forward structured requests through the existing API client. This repository does not implement that voice service or the business backend.

## Architecture

```text
User
	|
	v
Frontend Service
	Voxide widget and capability handlers
	|
	v
Existing API client
	|
	v
Backend Service
	|
	v
Database
```

The Backend Service is the source of truth for business state, validated records, and deterministic business calculations. The frontend Voxide capabilities interpret a spoken request only far enough to call `createEvent` or `queryBusiness`. They do not calculate or store business state. Voxide's hosted voice session stays outside this repository.

## Repository Links

- **Frontend Service:** this repository
- **Backend Service:** (https://github.com/Al1husse1n/backend-engine)
- **AI / Voice Service:** (https://github.com/biruk-tafese/ai-engine)

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

The `main` branch is protected. Work happens on feature branches, and changes are submitted through pull requests. At least one experienced developer reviews each pull request before it is merged.

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

Open [http://localhost:3000](http://localhost:3000) to view the landing page. The text assistant is at [http://localhost:3000/assistant](http://localhost:3000/assistant).

Copy `.env.example` to `.env.local` and set the backend origin:

```text
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Voice is optional. Set `NEXT_PUBLIC_VOXIDE_PUBLIC_KEY` to a real Voxide publishable key to mount the widget. If that variable is missing, the widget stays off and the text assistant still works.

Do not hardcode the backend URL or a Voxide key in application code. Restart `npm run dev` after changing environment variables.

To build and lint locally:

```bash
npm run build
npm run lint
```

## Status

Built during the STARK Official Hackathon 2026.
