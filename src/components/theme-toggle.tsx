"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

function getSystemTheme(): Theme {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = (window.localStorage.getItem("theme") ||
      window.localStorage.getItem("meri-theme")) as Theme | null;
    const initial =
      saved === "light" || saved === "dark" ? saved : getSystemTheme();

    document.documentElement.dataset.theme = initial;
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(initial);

    window.requestAnimationFrame(() => setTheme(initial));
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(next);

    window.localStorage.setItem("theme", next);
    window.localStorage.setItem("meri-theme", next);
    setTheme(next);
  }

  return (
    <button
      id="theme-toggle"
      type="button"
      onClick={toggleTheme}
      className="inline-flex size-9 sm:size-10 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:border-accent hover:text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4 sm:size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4 sm:size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.5 15.3A8.5 8.5 0 0 1 8.7 3.5 8.5 8.5 0 1 0 20.5 15.3Z" />
    </svg>
  );
}
