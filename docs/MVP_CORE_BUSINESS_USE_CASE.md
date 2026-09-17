# MVP Core Business Use Case

## 1. Purpose

This document defines the core business use case and functional scope of the MVP.

The product is a voice- and text-enabled business assistant designed for small-business owners. It allows a business owner to record and retrieve business information through natural language rather than requiring technical knowledge of databases, spreadsheets, or structured forms.

The MVP focuses on one core capability:

> **Allow a small-business owner to naturally communicate business events and questions, while the system converts relevant information into structured business data, stores it, retrieves it, and provides useful responses based on the business's actual data.**

The system should be designed so that research-backed advice and additional capabilities can be added after the MVP without requiring a fundamental redesign.

---

## 2. Target User

The primary user is a **small-business owner**.

The MVP is intentionally not restricted to one specific business type. It should support common business operations that can apply across different types of small businesses.

Examples may include retail shops, small trading businesses, service businesses, and other businesses that need to track basic financial and operational information.

The product should not require the user to understand:

- Database structures
- Tables or columns
- API requests
- Accounting terminology
- Technical commands
- How information is stored internally

The user should be able to communicate naturally.

---

## 3. Core User Interaction

The primary interaction model is:

```text
User
  ↓
Voice or Text Input
  ↓
Language / Input Processing
  ↓
Intent + Structured Data Extraction
  ↓
Validation
  ↓
Business Logic
  ↓
Database
  ↓
Response
  ↓
Text and/or Voice Output
```

The user should be able to express a business event conversationally.

For example:

> "I sold three shirts for 900 birr today."

The system should identify the relevant information, such as:

```text
Event: Sale
Quantity: 3
Product: Shirts
Amount: 900 ETB
Date: Today
```

The system then validates the information and stores it in the appropriate structured representation.

The user should not need to say:

> "Insert a new record into the sales table."

The natural-language interaction is the interface.

---

## 4. Core Business Operations

The MVP should support structured recording and retrieval of the most important small-business information.

### 4.1 Sales

The system should allow users to record sales through natural language.

Example:

> "I sold five shirts for 1,500 birr today."

Relevant information may include:

- Product/service
- Quantity
- Sale amount
- Date/time
- Customer, when provided
- Payment status, when relevant

---

### 4.2 Expenses

The system should allow users to record business expenses.

Example:

> "I spent 2,000 birr on stock transportation."

Relevant information may include:

- Expense category
- Amount
- Description
- Date/time

---

### 4.3 Purchases

The system should allow users to record purchases made for the business.

Example:

> "I bought 20 shirts for 8,000 birr."

Relevant information may include:

- Product
- Quantity
- Purchase cost
- Supplier, when provided
- Date/time

---

### 4.4 Inventory

The system should maintain relevant inventory information based on recorded business events.

For example, when a user records:

> "I bought 20 shirts."

and later:

> "I sold 3 shirts."

the system should be able to maintain the corresponding inventory state.

Inventory-related information may include:

- Product
- Quantity
- Stock changes
- Purchase information
- Sales affecting inventory

Inventory should be treated as structured business state rather than merely text stored in a database.

---

### 4.5 Customer Debts / Money Owed

The system should allow users to record money owed by or to customers when relevant.

Example:

> "Hana bought two shirts for 600 birr and owes me the money."

The system should extract and store the relevant information so that the user can later ask about outstanding payments.

---

## 5. Retrieving Business Information

The user should be able to ask questions about previously recorded business information using natural language.

Examples:

> "How much did I sell today?"

> "What did I spend this week?"

> "How many shirts do I have left?"

> "Who owes me money?"

> "How much does Hana owe me?"

> "What were my biggest expenses this month?"

The system should answer based on the **structured business data stored in the database**, rather than relying on the language model's memory or assumptions.

The database/business state is the source of truth.

---

## 6. Business Calculations and Insights

The system should be able to derive useful information from stored business data.

Examples include:

- Total sales
- Total expenses
- Purchase totals
- Outstanding customer debts
- Current inventory quantities
- Sales over a specified period
- Expenses over a specified period
- Basic revenue/expense comparisons
- Other straightforward business metrics that can be deterministically calculated from stored data

Where a value can be calculated from structured data, the system should calculate it using business logic rather than asking the language model to perform the calculation from unstructured conversation.

The MVP should prioritize **correctness and usefulness over the number of metrics supported**.

---

## 7. Advice Capability

The product is intended to eventually provide business advice based on the user's actual business data.

For example:

> "Should I buy more shirts?"

The system could analyze information such as:

- Current inventory
- Historical sales
- Sales trends
- Purchase history
- Available business data

and provide an answer based on those facts.

### MVP scope

A limited form of data-driven advice may be included in the MVP if the team has sufficient time and the underlying business data supports it.

However, the MVP does **not** need to include external research retrieval.

### Post-MVP

A future version should be able to combine:

```text
User's Business Data
        +
External Research / Knowledge
        ↓
Research-backed Business Advice
```

For example, Scholarxiv could provide relevant research concerning inventory management, small-business decision making, demand forecasting, or other business topics.

The architecture should therefore keep the advice layer sufficiently modular that external research can be added later without redesigning the core business-data system.

---

## 8. Voice and Text

Voice interaction is a core MVP capability.

The user should be able to:

1. Speak a business event or question.
2. Have the system process the request.
3. Have the system perform the appropriate business operation.
4. Receive the response through voice.

Text interaction should provide the equivalent functionality.

Therefore, the MVP supports:

```text
Voice → Business Operation → Voice Response

Voice → Business Operation → Text Response

Text → Business Operation → Text Response

Text → Business Operation → Voice Response
```

The exact combinations supported by the final UI may depend on implementation constraints, but voice interaction must be a first-class workflow rather than an afterthought.

---

## 9. Multilingual Interaction

The application should support the languages selected by the team for the MVP.

The user should be able to interact naturally in a supported language, while the underlying business data remains structured and language-independent wherever possible.

For example, a sale recorded in one supported language should still become the same underlying type of business event as a sale recorded in another supported language.

Language processing should therefore be separated from the core business logic.

Conceptually:

```text
Language-specific input
        ↓
Normalized structured intent
        ↓
Language-independent business logic
        ↓
Structured business state
        ↓
Language-specific response
```

This separation will make it easier to add additional languages later.

---

## 10. Source of Truth

The database is the source of truth for the business.

The language model should be responsible for tasks such as:

- Understanding natural language
- Extracting structured information
- Interpreting user intent
- Generating natural-language responses

The language model should **not** independently invent or maintain business state.

Business operations should pass through validation and deterministic business logic before changes are persisted.

For example:

```text
Natural language
      ↓
LLM / extraction
      ↓
Structured event
      ↓
Validation
      ↓
Business logic
      ↓
Database
```

For information retrieval:

```text
User question
      ↓
Intent extraction
      ↓
Database query / business calculation
      ↓
Verified result
      ↓
Natural-language response
```

This separation is important for reliability.

---

## 11. MVP Scope

### In scope

The MVP includes:

- Web application frontend
- Voice input
- Voice output
- Text input
- Text output
- Support for selected languages
- Backend API
- Structured business data
- Database persistence
- Natural-language extraction of business events
- Validation of extracted data
- Core business logic
- Recording relevant business operations
- Retrieving stored business information
- Basic deterministic business calculations
- Basic data-driven responses/advice where feasible
- End-to-end integration between frontend, backend, database, and Voxide

The MVP should provide a complete working flow rather than a large collection of disconnected features.

---

## 12. Explicitly Out of Scope

The following are not required for the MVP:

- Scholarxiv integration
- External research retrieval
- Research-backed advice using Scholarxiv
- Advanced forecasting
- Complex accounting functionality
- Full enterprise accounting
- Large-scale analytics
- Extensive business automation
- Highly sophisticated recommendation systems
- Advanced/fancy UI animations
- A large number of specialized business workflows
- Supporting every possible business operation

These may be considered after the MVP.

---

## 13. Post-MVP Direction

The architecture should make the following extensions possible without fundamentally changing the MVP:

### Research-backed advice

```text
Business Data
      +
Scholarxiv / Research Knowledge
      ↓
Context-aware Business Advice
```

### More business operations

Additional structured events can be introduced without changing the basic interaction model.

For example:

```text
Sale
Expense
Purchase
Inventory Adjustment
Customer Debt
        ↓
Additional Business Events
```

### More languages

New languages should primarily require language-layer support rather than changes to the underlying business logic.

### More advanced analytics

The structured business data can later support:

- Trend analysis
- Demand forecasting
- Inventory recommendations
- Profit analysis
- Business performance reports
- Automated alerts

---

## 14. Definition of a Successful MVP

The MVP is successful when a small-business owner can use the application without understanding its underlying technical architecture and complete a meaningful business workflow end to end.

At minimum, the following should work reliably:

```text
1. User speaks or types a business event.
2. System understands the intended operation.
3. Relevant structured information is extracted.
4. Information is validated.
5. Business state is updated in the database.
6. User can later ask about that information.
7. System retrieves the correct business data.
8. System provides the result through the supported output mode.
```

The MVP should demonstrate that **natural-language interaction can serve as a practical interface for maintaining and understanding small-business data**.

---

## 15. Guiding Principle

> **The user speaks naturally. The system handles the structure.**

The complexity of databases, APIs, validation, business calculations, and service-to-service communication should remain behind the interface.

The MVP should therefore prioritize:

1. Correct business state
2. Reliable voice/text interaction
3. Simple and understandable user flow
4. Clear service boundaries
5. Extensibility for future capabilities

over visual complexity or a large number of features.
