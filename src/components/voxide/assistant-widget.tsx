/**
 * AssistantWidget — Global Voice UI Component
 *
 * This is a thin "use client" wrapper that renders the Voxide voice widget.
 * It is mounted **once** in the root layout (`app/layout.tsx`) so that:
 *
 *   1. The widget stays mounted across all route navigations
 *   2. An in-progress voice call is never interrupted by navigation
 *   3. The voice assistant is available on every page (landing, assistant, etc.)
 *
 * The widget receives the pre-configured `ai` client from `@/lib/voxide/client`,
 * which already has all six capabilities registered. No additional setup is
 * needed here — VoxideWidget initialises itself.
 *
 * No extra props are passed to VoxideWidget (no `theme`, `accentColor`, `position`,
 * etc.) so that all appearance settings are controlled from the Voxide dashboard.
 * Hardcoding a prop here would silently override the matching dashboard control.
 *
 * @see src/lib/voxide/client.ts — capability registrations

 */
"use client";

import { VoxideWidget } from "@voxide/react";
import { ai } from "@/lib/voxide/client";

export function AssistantWidget() {
  // Pass nothing but the client. Every other prop outranks the dashboard,
  // so hardcoding one makes the matching Appearance control silently do nothing.
  return <VoxideWidget client={ai} />;
}
