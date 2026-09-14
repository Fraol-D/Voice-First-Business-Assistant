# Voice-First Business Assistant — Design System

## Product

**Voice-First Business Assistant**

**Tagline:** Run your business by voice.

The product is a voice-first operating assistant for microbusinesses. It turns spoken business activity into structured records, maintains a live view of business state, and helps owners understand and act on their own business data.

The interface should feel like a real, focused SaaS product — not a hackathon prototype.

---

## Design Direction

### Overall feeling

* Calm
* Modern
* Trustworthy
* Practical
* Lightweight
* Data-aware
* Human

The product should feel appropriate for a real business owner who needs clarity and speed.

Avoid making it look like an AI experiment, developer tool, or hackathon landing page.

### Visual references

Take inspiration from:

* Linear — restraint, typography, spacing, subtle motion, product polish
* Square — business dashboards, useful information hierarchy, operational clarity
* Modern SaaS products — strong hero typography and polished product previews

Do not copy any existing product's branding or layout.

---

## Color System

Use a dark graphite foundation.

### Background

* Main background: near-black graphite
* Secondary surfaces: slightly lighter graphite
* Cards: subtle elevation from the background

### Accent

Use cyan/teal as the primary product accent.

Accent should communicate:

* voice
* activity
* live state
* important actions

Do not flood the interface with accent color.

### Text

* Primary: near-white
* Secondary: muted gray
* Tertiary: darker muted gray

### Semantic colors

Use restrained green/red/amber only where they communicate business state:

* Green → positive / healthy / received
* Amber → attention / low stock / pending
* Red → negative / overdue / risk

---

## Typography

Use a modern sans-serif.

Prioritize:

1. Clear hierarchy
2. Large confident headlines
3. Comfortable reading width
4. Compact but readable dashboard text

Avoid:

* oversized marketing copy everywhere
* excessive uppercase text
* decorative fonts
* overly tight line heights

---

## Navigation

The navigation should be minimal.

Left:
**Voice-First Business Assistant** or a compact product mark.

Right:

* Product
* How it works
* Demo

Primary CTA:
**Try the assistant**

Do NOT display:

* STARK
* STARK 2026
* Hackathon
* Early-stage project
* Development status

The product interface should stand independently from the hackathon.

---

## Hero

The hero should immediately communicate the product.

### Eyebrow

**Your business, in your voice.**

### Main headline

**Run your business by voice.**

### Supporting copy

Speak naturally about sales, expenses, inventory, and customer debts. The assistant turns what you say into structured business records and helps you understand what is happening in your business.

### Primary CTA

**Try the assistant**

### Secondary CTA

**See how it works**

Keep the hero concise.

---

## Hero Product Preview

The most important visual element of the landing page should be a realistic product preview.

Show a dashboard-like business snapshot inside a polished product frame.

Example information:

**Today**

* Sales: ETB 8,450
* Expenses: ETB 2,180
* Cash position: ETB 6,270
* Outstanding: ETB 3,400

Include a small activity stream:

* Sale recorded — 12 shirts — ETB 4,800
* Inventory added — 20 shirts
* Customer balance updated — Abebe — ETB 1,200

Include a visible voice interaction element:

**"What did I sell today?"**

Then show:

**You sold ETB 8,450 today across 17 transactions.**

This is a visual preview only at this stage. Do not pretend these are real user records.

Label demo data subtly as:
**Demo business**

---

## Product Story

After the hero, communicate the core loop:

### Speak

Tell the assistant what happened.

### Record

Your words become structured business activity.

### Understand

See sales, expenses, inventory, and outstanding payments in one place.

### Decide

Ask questions about your business and get answers based on your recorded data.

Use simple icons and restrained animation.

---

## Feature Section

Keep this short.

### Capture business activity

Record sales, expenses, purchases, inventory changes, and customer debts by voice.

### See what is happening

Get a simple view of your business activity and performance.

### Ask your business

Ask questions about sales, inventory, expenses, and money owed.

### Make better decisions

Use your own business data to answer practical operational questions.

Do not add pricing, testimonials, fake customer logos, fake statistics, or unsupported claims.

---

## Motion

Motion should make the product feel alive without becoming distracting.

Use:

* subtle fade/slide entrance
* gentle card movement
* small hover states
* animated voice waveform
* subtle number transitions
* soft accent glow around active voice elements

Avoid:

* constant floating animations
* excessive parallax
* large spinning objects
* flashy gradients
* excessive glassmorphism
* animation on every element

The interface should feel responsive, not animated for its own sake.

---

## Cards

Cards should have:

* subtle borders
* restrained corner radius
* very small elevation difference
* generous internal spacing

Avoid extremely rounded "AI SaaS" cards.

The visual hierarchy should come primarily from typography, spacing, and contrast.

---

## Buttons

Primary:

* solid accent
* strong contrast
* compact
* confident

Secondary:

* transparent or low-contrast surface
* subtle border

Button text should be action-oriented:

Good:

* Try the assistant
* See the demo
* Ask a question
* Record activity

Avoid:

* Learn more
* Discover
* Explore the future

---

## Landing Page Structure

1. Minimal navigation
2. Hero
3. Product/dashboard preview
4. How it works
5. Core capabilities
6. Short closing CTA
7. Minimal product footer

The page should be visually impressive without becoming long.

---

## Footer

Keep the footer product-focused.

Example:

**Voice-First Business Assistant**

Run your business by voice.

Links:

* Product
* How it works
* GitHub

Do not mention STARK in the product footer.

---

## Responsive Design

Desktop:

* Strong two-column hero
* Large product preview
* Comfortable whitespace

Mobile:

* Single-column layout
* Hero remains concise
* Product preview remains readable
* Navigation collapses cleanly

The mobile experience should not feel like an afterthought.

---

## Important Constraints

This iteration is a **visual foundation**, not a feature-building milestone.

Do not:

* add authentication
* add a database
* add Voxide
* add an AI API
* add real voice processing
* add complex charts
* add a design library
* add unnecessary dependencies
* create a full dashboard application

Use the existing Next.js/Tailwind setup.

Prefer existing components and CSS over adding dependencies.

The static preview may use realistic demo data, but it must be clearly presented as demo data.

The design should be easy to extend later into the real application.

---

## Product Principle

The interface should always communicate this idea:

**Speak naturally → your business state updates → you understand what is happening → you make a better decision.**

Everything added to the product should reinforce this loop.
