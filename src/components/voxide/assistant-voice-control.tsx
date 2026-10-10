"use client";

import { useVoxideVoice } from "@voxide/react";
import { ai } from "@/lib/voxide/client";

const ACTIVE_STATUSES = new Set([
  "connecting",
  "listening",
  "thinking",
  "speaking",
  "executing",
]);

export function AssistantVoiceControl() {
  const { status, connect, disconnect, errorCode } = useVoxideVoice(ai);
  const active = ACTIVE_STATUSES.has(status);
  const unavailable = status === "error";
  const label = unavailable
    ? "Voice unavailable"
    : active
      ? "Stop voice"
      : "Start voice";

  if (!ai) return null;

  const handleClick = () => {
    if (active) {
      disconnect();
      return;
    }

    void connect();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={errorCode ? `Voice error: ${errorCode}` : label}
      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95 ${
        unavailable
          ? "border-red-500/50 text-red-500 hover:bg-red-500/10"
          : active
            ? "border-accent bg-accent/10 text-accent"
            : "border-border text-muted hover:border-accent/60 hover:text-accent"
      }`}
    >
      {active ? (
        <span className="flex h-4 items-center gap-0.5" aria-hidden="true">
          <span className="h-2 w-0.5 rounded-full bg-current animate-pulse" />
          <span className="h-4 w-0.5 rounded-full bg-current animate-pulse [animation-delay:75ms]" />
          <span className="h-3 w-0.5 rounded-full bg-current animate-pulse [animation-delay:150ms]" />
        </span>
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15a3 3 0 003-3V6a3 3 0 00-6 0v6a3 3 0 003 3z" />
        </svg>
      )}
    </button>
  );
}
