"use client";

import React, { useState } from "react";

interface VoiceOrbProps {
  /**
   * Optional voice listening/active state. Defaults to idle.
   */
  isListening?: boolean;
  /**
   * Callback when the orb is tapped/clicked.
   */
  onToggle?: () => void;
  /**
   * Custom sublabel text under the orb. Defaults to "Tap to speak or type below".
   */
  sublabel?: string;
  /**
   * Optional custom inner visual or Voxide canvas component.
   */
  children?: React.ReactNode;
}

/**
 * VoiceOrb — Modular voice interaction anchor (§13–§15, §18, §29)
 * 
 * Provides the clean, glowing breathing circle placeholder with a 3–6s subtle pulse.
 * Self-contained so teammates can easily bind real-time Voxide voice session events or
 * swap the inner canvas placeholder with custom audio wave visualizers.
 */
export function VoiceOrb({
  isListening = false,
  onToggle,
  sublabel = "Tap to speak or type below",
  children,
}: VoiceOrbProps) {
  const [internalActive, setInternalActive] = useState(false);
  const active = isListening || internalActive;

  const handleClick = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalActive((prev) => !prev);
    }
  };

  return (
    <div
      id="voice-orb-container"
      className="flex flex-col items-center justify-center py-4 sm:py-6 select-none transition-all duration-300"
    >
      {/* Outer interactive button wrapping the breathing orb visual */}
      <button
        type="button"
        onClick={handleClick}
        aria-label={active ? "Stop speaking" : "Tap to speak"}
        className="relative group focus:outline-none cursor-pointer rounded-full"
      >
        {/* Soft Ambient Radial Glow */}
        <div
          className={`absolute -inset-4 sm:-inset-6 rounded-full blur-2xl transition-opacity duration-700 pointer-events-none ${
            active
              ? "bg-[#FE6904]/25 opacity-100"
              : "bg-[#FE6904]/10 opacity-70 group-hover:opacity-90"
          }`}
          aria-hidden="true"
        />

        {/* Breathing Circle Container (§14 idle breathing circle, 4s cycle) */}
        <div
          className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center transition-transform duration-500 orb-breathe-animation ${
            active ? "border-[#FE6904]/60" : "border-border group-hover:border-[#FE6904]/30"
          }`}
          style={{
            background:
              "radial-gradient(circle at 45% 45%, var(--surface-strong) 0%, var(--surface) 55%, var(--background) 100%)",
            borderWidth: "1.5px",
          }}
        >
          {children ? (
            /* Teammates can mount their custom Voxide visualizer canvas here */
            children
          ) : (
            /* Modular Inner Visual Placeholder */
            <div className="relative flex flex-col items-center justify-center">
              {/* Inner core circle with subtle orange glow */}
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  active
                    ? "bg-[#221710] border border-[#FE6904] shadow-[0_0_20px_rgba(254,105,4,0.35)]"
                    : "bg-surface border border-border group-hover:border-[#FE6904]/40 shadow-[0_0_15px_rgba(0,0,0,0.15)] dark:shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                }`}
              >
                {active ? (
                  /* Active audio indicator */
                  <div className="flex items-center gap-1 h-5" aria-hidden="true">
                    <span className="w-1 bg-[#FE6904] rounded-full h-3 animate-pulse" />
                    <span className="w-1 bg-[#FE6904] rounded-full h-5 animate-pulse delay-75" />
                    <span className="w-1 bg-[#FE6904] rounded-full h-4 animate-pulse delay-150" />
                    <span className="w-1 bg-[#FE6904] rounded-full h-2 animate-pulse delay-100" />
                  </div>
                ) : (
                  /* Idle microphone glyph */
                  <svg
                    className="w-6 h-6 text-muted transition-colors duration-200 group-hover:text-[#FE6904]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15a3 3 0 003-3V6a3 3 0 00-6 0v6a3 3 0 003 3z"
                    />
                  </svg>
                )}
              </div>
            </div>
          )}
        </div>
      </button>

      {/* Sublabel (§18 & §29) */}
      <span className="mt-3 text-xs sm:text-sm font-inter text-muted text-center tracking-normal">
        {active ? "Listening… speak to Meri" : sublabel}
      </span>
    </div>
  );
}
