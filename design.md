---

name: Meri — Voice-First Business Assistant

colors:
background: '#FFFFFF'
foreground: '#111111'
surface: '#F7F7F7'
surface-subtle: '#FAFAFA'
surface-strong: '#EEEEEE'
surface-dark: '#111111'
foreground-dark: '#FFFFFF'
muted: '#6B6B6B'
muted-dark: '#A3A3A3'
border: '#E5E5E5'
border-strong: '#D4D4D4'
border-dark: '#2A2A2A'
primary: '#111111'
primary-foreground: '#FFFFFF'
accent: '#FE6904'
accent-foreground: '#FFFFFF'
success: '#16A34A'
warning: '#CA8A04'
error: '#DC2626'

typography:
display-hero:
fontFamily: 'Space Grotesk'
fontSize: 64px
fontWeight: '700'
lineHeight: 1.05
letterSpacing: -0.04em

display-hero-mobile:
fontFamily: 'Space Grotesk'
fontSize: 42px
fontWeight: '700'
lineHeight: 1.08
letterSpacing: -0.035em

headline-xl:
fontFamily: 'Space Grotesk'
fontSize: 44px
fontWeight: '600'
lineHeight: 1.1
letterSpacing: -0.03em

headline-xl-mobile:
fontFamily: 'Space Grotesk'
fontSize: 32px
fontWeight: '600'
lineHeight: 1.15
letterSpacing: -0.025em

headline-lg:
fontFamily: 'Space Grotesk'
fontSize: 32px
fontWeight: '600'
lineHeight: 1.2
letterSpacing: -0.025em

headline-md:
fontFamily: 'Space Grotesk'
fontSize: 22px
fontWeight: '600'
lineHeight: 1.3
letterSpacing: -0.015em

metric-number:
fontFamily: 'Space Grotesk'
fontSize: 52px
fontWeight: '700'
lineHeight: 1
letterSpacing: -0.04em

body-lg:
fontFamily: 'Inter'
fontSize: 18px
fontWeight: '400'
lineHeight: 1.6
letterSpacing: -0.01em

body-md:
fontFamily: 'Inter'
fontSize: 15px
fontWeight: '400'
lineHeight: 1.55

body-sm:
fontFamily: 'Inter'
fontSize: 13px
fontWeight: '400'
lineHeight: 1.5

eyebrow:
fontFamily: 'Space Grotesk'
fontSize: 12px
fontWeight: '600'
lineHeight: 1.3
letterSpacing: 0.12em

rounded:
sm: 0.375rem
DEFAULT: 0.625rem
md: 0.875rem
lg: 1.25rem
xl: 1.75rem
full: 9999px

spacing:
gutter: 1.5rem
page-padding: 2rem
section: 7.5rem
section-mobile: 5rem
xs: 0.25rem
sm: 0.5rem
md: 1rem
lg: 1.5rem
xl: 2.5rem
2xl: 4rem
3xl: 6rem

layout:
max-width: 1240px
content-width: 720px
mobile-breakpoint: 768px
tablet-breakpoint: 1024px
-------------------------

# Meri Design System

## 1. Product Identity

**Meri** is a voice-first business assistant for small-business owners.

The interface should communicate:

* simplicity
* intelligence
* trust
* speed
* calmness
* modern AI technology
* practical business utility

Meri should feel like a capable business tool rather than an accounting dashboard, enterprise infrastructure platform, chatbot toy, or generic AI landing page.

The core product idea is:

> **Run your business by voice.**

The current MVP allows a business owner to:

* record sales
* record expenses
* record purchases
* adjust inventory
* record customer debts
* ask questions about business data
* interact through text
* interact through Voxide voice

The UI must accurately represent these capabilities.

Do not visually imply capabilities that do not currently exist.

---

# 2. Design Direction

Meri uses a **predominantly monochrome visual system**.

The primary visual language is:

* black
* white
* near-black
* soft gray
* subtle borders
* restrained shadows
* generous whitespace

The design should feel closer to modern AI products such as ElevenLabs and Vapi than to traditional business/accounting software.

However, Meri must have its own identity.

### Core principle

**Monochrome first. Accent second.**

The interface should remain visually strong even if the accent color is removed.

The Meri accent is used sparingly for:

* selected states
* active voice states when appropriate
* small brand details
* important interaction feedback
* occasional visual emphasis

Do not use the accent as a dominant page background.

---

# 3. Brand Accent

Meri's primary accent is:

`#FE6904`

This is the Voxide orange currently associated with the voice integration.

Use it carefully.

### Appropriate uses

* active voice indicator
* selected voice state
* small status indicator
* subtle glow around active voice interaction
* small branded details
* selected navigation state where appropriate

### Do not use it for

* large background sections
* every button
* every icon
* large text blocks
* decorative gradients throughout the page

The accent should feel **rare and intentional**.

If the user sees orange everywhere, the design has failed.

---

# 4. Color System

## Light Mode

### Base

* Background: `#FFFFFF`
* Primary text: `#111111`
* Secondary text: `#6B6B6B`
* Muted text: `#8A8A8A`
* Surface: `#F7F7F7`
* Subtle surface: `#FAFAFA`
* Strong surface: `#EEEEEE`
* Border: `#E5E5E5`
* Strong border: `#D4D4D4`

### Dark surfaces

Dark surfaces may be used for:

* hero visualizations
* assistant visual areas
* product mockups
* selected feature sections
* footer

Use:

* `#111111`
* `#181818`
* `#222222`

Avoid unnecessary gradients.

---

# 5. Dark Mode

Meri supports light and dark themes.

The theme switcher must be **icon-only**.

Do not display text such as:

* "Sun"
* "Moon"
* "Light"
* "Dark"

Use an appropriate icon with:

* accessible `aria-label`
* tooltip on hover/focus
* keyboard accessibility

Dark mode should remain monochrome.

Use orange only where the active state genuinely benefits from it.

---

# 6. Typography

Use:

### Space Grotesk

For:

* hero headlines
* section headlines
* large metrics
* important product labels
* navigation brand
* major UI headings

### Inter

For:

* body text
* descriptions
* form labels
* assistant messages
* metadata
* supporting information

Typography should be bold and confident without becoming excessively futuristic.

Avoid excessive uppercase text.

Eyebrows may use uppercase with increased letter spacing, but normal product copy should use natural sentence case.

---

# 7. Layout

Use a responsive centered layout with a maximum width of approximately:

`1240px`

### Desktop

* 12-column conceptual grid
* 24px minimum gutters
* 32px+ outer page padding
* large vertical spacing between sections
* generous whitespace

### Tablet

* 8-column conceptual grid
* reduced section spacing
* cards can stack

### Mobile

* 4-column conceptual grid
* 16px page padding
* full-width interactive elements
* avoid cramped multi-column layouts
* preserve generous vertical spacing

The design should feel intentionally composed rather than simply "desktop stacked on mobile."

---

# 8. Shape Language

Meri uses two primary shape categories.

### Structural containers

Use approximately:

`12px - 20px`

for:

* cards
* panels
* product previews
* assistant result cards
* manual recording panels

### Pills

Use fully rounded shapes for:

* compact controls
* tags
* filters
* status indicators
* voice controls
* small action buttons

Do not turn every component into a pill.

---

# 9. Borders and Elevation

Meri should rely more on:

* whitespace
* contrast
* borders
* surface changes

than on heavy shadows.

### Default card

```text
background: #FFFFFF
border: 1px solid #E5E5E5
border-radius: 16px
```

### Dark card

```text
background: #111111
border: 1px solid #2A2A2A
```

### Shadows

Use shadows sparingly.

Avoid large floating-card shadows that make the interface look like a generic SaaS template.

---

# 10. Navigation

The navbar should be minimal.

### Desktop

Suggested structure:

```text
Meri                         Product   How it works   Assistant   [Theme]   [Try Meri]
```

The exact links may be adjusted based on the actual landing-page implementation.

The layout should not feel left-heavy.

The Meri logo/name should occupy the left.

Navigation occupies the center/right.

Utility controls and CTA occupy the right.

### Mobile

Replace the navigation links with a **hamburger icon**.

Do not use a button labeled "Menu" unless the design specifically requires it.

The mobile menu should open as a clean overlay/sheet.

---

# 11. Hero

The primary hero message is:

> **Run your business by voice.**

Do not use:

> Your business guide

because the current MVP does not yet provide broad business recommendations or autonomous guidance.

The hero should immediately communicate:

1. what Meri is
2. who it is for
3. what the user can do with it

Example supporting direction:

> Record sales, track expenses, manage inventory, and ask questions about your business — simply by talking to Meri.

The exact final copy may be refined during implementation.

---

# 12. Hero Visual

The hero should have a strong visual anchor.

The visual should not be a generic dashboard screenshot.

Prefer a representation of the actual Meri interaction:

* large voice orb
* voice activity
* assistant state
* short example interaction
* subtle waveform/audio visualization

The hero visual should feel alive without becoming visually noisy.

The visual should communicate:

**"You talk. Meri understands. Your business data changes."**

---

# 13. Voice Assistant Orb

The assistant page should contain a **large central voice visual**.

The orb is a primary interaction element, not a tiny decorative widget.

Use an appropriate open-source voice UI/orb component where possible.

ElevenLabs UI components may be used as the visual/component layer where appropriate.

The actual voice provider remains **Voxide**.

Do not replace Voxide with ElevenLabs.

Do not fake Voxide functionality.

The orb should visually respond only to states that can actually be determined from the application's voice integration.

---

# 14. Voice States

The assistant visual should support clear states.

### Idle

* calm
* mostly static
* subtle ambient movement
* no aggressive glow

### Listening

* stronger animation
* subtle pulsing
* waveform/audio activity if available
* accent may appear

### Processing

* restrained movement
* indicate that Meri is thinking/processing
* avoid fake "AI magic" animations

### Responding

* gentle dynamic movement
* waveform/audio visualization if supported

### Error

* clear but restrained error state
* do not use dramatic animations

### Disabled/unavailable

* visually muted
* clearly explain why interaction cannot proceed

Animations should communicate state rather than exist purely for decoration.

---

# 15. Voice Motion

Motion should be smooth, subtle, and continuous.

Avoid:

* excessive bouncing
* cartoon-like scaling
* rapid flashing
* constant particle effects
* unnecessary 3D rotations
* distracting parallax

### Idle motion

The orb may use a slow breathing/pulse cycle.

Approximate:

```text
duration: 3–5 seconds
scale change: very small
opacity change: very small
```

The user should notice movement without feeling that the component is demanding attention.

### Listening motion

Increase the amplitude/frequency of the visual response.

If real audio amplitude is available, use it.

If not, use a restrained deterministic animation rather than pretending the visualization represents real microphone amplitude.

### State transitions

Use approximately:

```text
150–300ms
```

for ordinary UI transitions.

Use longer transitions for major page/section movement.

---

# 16. Landing Page Storytelling

The landing page should borrow **structural storytelling patterns** from modern AI product sites such as Vapi, but must not copy Vapi's visual identity or content.

The landing page should tell a simple story:

### Section 1 — Hero

**Run your business by voice.**

Show Meri's core interaction.

### Section 2 — The Problem

Small-business owners should not have to stop what they are doing to maintain complicated records.

Keep this section concise.

### Section 3 — How Meri Works

Show the basic loop:

```text
Speak → Meri understands → Business data updates → Ask anything
```

This should be visually clear.

### Section 4 — What Meri Can Handle

Show the actual MVP capabilities:

* Sales
* Expenses
* Purchases
* Inventory
* Customer debts
* Business questions

Do not invent advanced accounting features.

### Section 5 — Product Visualization

Show the assistant interface and realistic examples of the actual product.

Examples:

> "I sold three shirts for 900 birr."

Then:

> Sale recorded
> 3 shirts · ETB 900

Another:

> "How many shirts do I have left?"

Then:

> 17 shirts remaining

Another:

> "Who owes me money?"

Then:

> Hana — ETB 1,200

These are illustrative examples and should be clearly presented as product demonstrations.

### Section 6 — Voice + Text

Explain that users can interact with Meri through voice or text.

### Section 7 — Final CTA

Return to the core message:

**Run your business by voice.**

---

# 17. Product Visualizations

Product visualizations should demonstrate real MVP concepts.

Do not create fake analytics dashboards merely because other AI websites use dashboards.

Avoid visualizing:

* unsupported forecasts
* fake revenue charts
* fake AI scores
* fake call analytics
* fake business intelligence
* unsupported automation

If a visualization uses demo data, make it clear that it is demonstration data.

The strongest visualizations are actual interactions:

```text
User message
      ↓
Meri interpretation
      ↓
Business action/result
```

---

# 18. Assistant Page

The assistant page is the primary product experience.

It should prioritize voice.

Recommended structure:

```text
                  Meri

            [ Large voice orb ]

             Listening / Idle

      "How many shirts are left?"

            [ assistant response ]

       Try asking:
       • How much did I sell today?
       • How many shirts are left?
       • Who owes me money?
       • What did I spend this week?

             [ text input ]

       [ microphone / voice control ]

             Record manually
```

The exact arrangement may change responsively.

The central voice interaction should remain the visual anchor.

---

# 19. Query Suggestions

Use the label:

> **Try asking**

instead of "Query chips."

Suggestions should look like compact interactive prompts.

Examples:

* How much did I sell today?
* How many shirts are left?
* Who owes me money?
* What did I spend this week?

Clicking a suggestion should populate or submit the query according to the existing product behavior.

Do not invent additional backend capabilities.

---

# 20. Business Result Cards

Never expose raw backend JSON as the primary user-facing result.

Backend responses should be transformed into human-readable UI.

### Inventory

Instead of:

```json
{
  "item": "shirts",
  "quantity": 17
}
```

show:

> **17 shirts**
> Current inventory

### Sales

Instead of raw JSON, show:

> **ETB 2,700**
> Sales today

### Debt

Show:

> **Hana owes you ETB 1,200**

### Expense

Show:

> **ETB 850**
> Expenses this week

Cards should be simple, readable, and visually calm.

---

# 21. Activity / Result Feed

The assistant can display recent actions/results in a conversational activity feed.

Examples:

> Sale recorded
> 3 shirts · ETB 900

> Expense recorded
> Transport · ETB 250

> Inventory updated
> +20 shirts

> Debt recorded
> Hana · ETB 1,200 owed to you

> Query result
> 17 shirts remaining

Use clear icons and timestamps where available.

Do not overwhelm the interface with accounting-style tables.

---

# 22. Manual Recording

Manual recording remains part of the MVP.

However, it is **secondary to voice**.

Do not place the entire structured event form permanently beside the voice interface.

Instead provide a clear secondary action:

> **Record manually**

This can open a step-by-step flow.

### Step 1

Choose event type:

* Sale
* Expense
* Purchase
* Inventory adjustment
* Customer debt

### Step 2

Show only the fields relevant to that event.

### Step 3

Review.

### Step 4

Confirm.

The user should never be presented with a huge form containing irrelevant fields.

---

# 23. Confirmation

Mutating actions should require clear confirmation where appropriate.

Examples:

> Record sale?

> 3 shirts
> ETB 900

Actions:

**Cancel**
**Confirm**

The confirmation should use the actual values extracted from the user's input.

Do not display fake confirmation values.

Read-only queries can execute directly.

---

# 24. Clarification

If Meri does not have enough information to perform an action, ask for the missing information.

Example:

User:

> "I sold some shirts."

Meri:

> How many shirts did you sell, and for how much?

The clarification should be concise.

Avoid exposing internal API terminology.

Do not say:

> "Missing required field: quantity."

Prefer natural language.

---

# 25. Error States

Errors should be understandable to a business owner.

Avoid raw:

```text
500 Internal Server Error
```

unless displayed in a developer/debug context.

Instead:

> Something went wrong while saving that sale.

Provide:

**Try again**

For network/backend configuration errors, provide enough information to diagnose the problem during development without exposing unnecessary technical details to normal users.

---

# 26. Buttons

### Primary

Black background:

```text
background: #111111
color: #FFFFFF
```

Rounded, compact, confident.

### Secondary

White or transparent:

```text
background: #FFFFFF
border: 1px solid #D4D4D4
color: #111111
```

### Accent

Use `#FE6904` only when an accent action/state is genuinely appropriate.

Do not make every CTA orange.

---

# 27. Cards

Cards should feel lightweight.

Default:

```text
background: #FFFFFF
border: 1px solid #E5E5E5
border-radius: 16px
```

Hover:

* very subtle surface shift
* subtle border change
* small movement only when appropriate

Avoid exaggerated card lifts.

---

# 28. Forms

Forms should be:

* compact
* clear
* accessible
* mobile friendly

Inputs:

```text
height: approximately 44–48px
border: 1px solid #D4D4D4
border-radius: 10–12px
```

Focus:

* strong visible focus ring
* accent may be used sparingly

Labels should remain visible.

Do not rely exclusively on placeholders.

---

# 29. Mobile Design

Mobile is a first-class experience.

The assistant should feel natural on a phone.

### Mobile assistant priority

1. Meri branding
2. Voice orb
3. Current state
4. Conversation/result
5. Try asking
6. Text input
7. Manual recording

Avoid placing large side panels beside the assistant on mobile.

The orb should remain visually prominent but must not consume the entire viewport.

---

# 30. Responsive Navigation

Desktop:

```text
Logo | navigation | theme | CTA
```

Mobile:

```text
Logo                     [hamburger]
```

The mobile menu should open into a clean sheet/overlay.

---

# 31. Accessibility

All interactive components must have:

* keyboard support
* visible focus states
* accessible labels
* sufficient contrast
* appropriate semantic HTML
* screen-reader labels for icon-only controls

Icon-only buttons must have `aria-label`.

The voice state should not be communicated by color alone.

Example:

Do not rely only on an orange orb.

Also show:

> Listening

or an equivalent accessible status.

Respect:

```text
prefers-reduced-motion
```

When reduced motion is enabled:

* disable large movement
* remove unnecessary parallax
* reduce orb animation
* preserve state clarity through static styling

---

# 32. Motion Principles

Meri motion should communicate **state, hierarchy, and continuity**.

Motion should never compensate for weak layout.

### General timing

Fast interaction:

`150–200ms`

Standard transition:

`200–300ms`

Large visual transition:

`400–700ms`

Ambient animation:

`3–6s`

Avoid excessive simultaneous animations.

---

# 33. Landing Page Motion

Use subtle scroll-based reveals.

Elements may:

* fade in
* move upward slightly
* scale very slightly
* reveal progressively

Avoid dramatic entrance animations.

### Product visualization

Product mockups can animate when entering the viewport.

Example:

```text
empty state
    ↓
user input appears
    ↓
Meri processes
    ↓
result card appears
```

The sequence should be slow enough to understand.

Do not create fake loading behavior that suggests the real backend is processing if it is only a marketing animation.

---

# 34. Assistant Motion

The assistant page should feel alive even while idle.

### Idle

Slow breathing orb.

### Listening

More active pulse.

### Processing

Subtle shifting/rotational motion.

### Response

Small response transition.

### New result

Result card enters with:

```text
opacity: 0 → 1
transform: translateY(8px) → translateY(0)
```

approximately `200–300ms`.

---

# 35. Microinteractions

Use microinteractions for:

* button hover
* input focus
* query suggestion selection
* card selection
* voice state transitions
* confirmation actions
* theme switching
* mobile menu opening

Do not animate every element.

A good rule:

> If the animation does not communicate an interaction or state change, question whether it is necessary.

---

# 36. Theme Transition

Theme switching should feel smooth.

Use a short transition for:

* background
* foreground
* border
* surface

Avoid long animated page-wide transitions.

The theme icon itself may rotate/fade subtly.

---

# 37. Voxide Integration

Voxide is the actual voice provider.

The Voxide UI/widget must remain visually distinct from Meri's general interface where the provider requires its own branding.

Voxide orange:

`#FE6904`

Do not create a competing orange.

If the Voxide SDK supports positioning/configuration, prefer the actual Voxide launcher in the bottom-right for the persistent site-level voice entry point.

Do not create a fake replacement launcher that merely looks like Voxide.

---

# 38. Voxide Launcher

When present globally:

* position bottom-right
* remain accessible
* avoid covering important controls
* remain visible on mobile without blocking the assistant UI
* use the actual Voxide component/configuration where supported

The launcher should not be confused with the large central assistant orb.

### Important distinction

**Central orb = Meri assistant experience**

**Voxide launcher = voice provider integration/control**

They serve different purposes.

---

# 39. ElevenLabs UI Components

ElevenLabs UI may be used as an open-source visual/component source for:

* orb
* waveform
* audio visualization
* voice states
* agent interaction patterns

Use components selectively.

Do not redesign the whole product to look like ElevenLabs.

Do not use ElevenLabs as the voice backend.

Meri's actual voice integration remains Voxide.

---

# 40. Reference Inspiration

### Vapi

Use Vapi primarily for:

* page storytelling
* whitespace
* section rhythm
* product visualization
* monochrome visual language
* scroll-driven presentation
* clear CTA hierarchy

Do not copy:

* Vapi branding
* Vapi copy
* Vapi-specific layouts
* Vapi-specific colors
* Vapi-specific product claims

### ElevenLabs UI

Use for:

* voice interaction components
* orb behavior
* audio visualization
* interaction patterns

### Voxide

Use for:

* actual voice integration
* provider-specific widget
* provider-specific behavior
* orange accent where appropriate

### Dribbble voice UI reference

Use for:

* large central voice visual
* assistant-first information architecture
* modern voice/chat interaction
* visual hierarchy

Do not reproduce the reference pixel-for-pixel.

---

# 41. Do

* Keep the interface predominantly monochrome.
* Use whitespace aggressively.
* Make voice interaction visually important.
* Make the assistant orb a strong visual anchor.
* Show real MVP capabilities.
* Transform raw API responses into human-readable UI.
* Keep manual recording available but secondary.
* Use step-by-step manual recording.
* Use restrained orange accents.
* Use real Voxide integration.
* Use ElevenLabs UI components where useful.
* Design mobile-first.
* Keep animations purposeful.
* Make states obvious.
* Make accessibility part of implementation.

# 42. Don't

* Do not copy Vapi.
* Do not copy ElevenLabs.
* Do not turn Meri into an enterprise telephony dashboard.
* Do not use emerald/mint as the main accent.
* Do not use multiple competing accent colors.
* Do not make the whole interface orange.
* Do not expose raw JSON to normal users.
* Do not build fake analytics dashboards.
* Do not claim capabilities that are not implemented.
* Do not make manual forms the primary experience.
* Do not create a separate Amharic parser.
* Do not claim full Amharic voice responses in the current MVP.
* Do not add unnecessary animation.
* Do not create a second voice backend.
* Do not let UI components independently calculate business data.

---

# 43. Implementation Boundaries

The backend remains the source of truth for:

* business events
* inventory
* debts
* sales
* expenses
* purchases
* queries

The frontend is responsible for:

* presentation
* interaction
* loading states
* confirmations
* clarification UI
* human-readable result rendering

Voxide is responsible for:

* voice interaction
* speech input/output
* invoking the defined frontend capabilities

Do not duplicate business logic in the UI.

---

# 44. Design Priority Order

When making implementation decisions, use this priority order:

1. Product clarity
2. Voice-first interaction
3. Usability
4. Visual hierarchy
5. Responsive behavior
6. Accessibility
7. Motion
8. Decorative polish

If visual polish conflicts with product clarity, choose product clarity.

If animation conflicts with performance or usability, remove the animation.

If a reference design conflicts with Meri's actual MVP, choose the actual MVP.

---

# 45. Definition of Done

The implementation is considered visually complete when:

* Meri clearly feels like one product
* landing and assistant pages share the same design language
* the UI is predominantly monochrome
* orange is restrained
* the hero communicates the actual MVP
* the assistant page has a strong central voice visual
* Voxide remains the actual voice provider
* manual recording is secondary
* query results are human-readable
* loading/error/confirmation/clarification states are polished
* mobile and desktop layouts are intentional
* theme switching is icon-based and accessible
* animations communicate state rather than decorate unnecessarily
* no unsupported product capability is visually implied
* no raw backend JSON is presented as normal user-facing UI
* all changes remain compatible with the existing backend/API architecture
