"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type { Locale, InterpolationValues, I18nContextType } from "./types";
import enDictionary from "@/locales/en.json";
import amDictionary from "@/locales/am.json";

const STORAGE_KEY = "meri-locale";
const DEFAULT_LOCALE: Locale = "en";

const dictionaries: Record<Locale, Record<string, unknown>> = {
  en: enDictionary as Record<string, unknown>,
  am: amDictionary as Record<string, unknown>,
};

/**
 * Module-level storage for non-React contexts (e.g. API clients, Voxide wrapper)
 */
let currentActiveLocale: Locale = DEFAULT_LOCALE;

export function getActiveLocale(): Locale {
  if (typeof window !== "undefined") {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved === "en" || saved === "am") {
      return saved;
    }
  }
  return currentActiveLocale;
}

export function setActiveLocale(locale: Locale): void {
  currentActiveLocale = locale;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
      document.cookie = `${STORAGE_KEY}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = locale;
      document.documentElement.dir = "ltr";
    } catch {
      // Ignore local storage restrictions
    }
  }
}

/**
 * Helper to resolve nested keys like "hero.title" or "manualModal.types.sale"
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}

/**
 * Interpolates variables in format {variableName}
 */
function interpolate(template: string, values?: InterpolationValues): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const val = values[key];
    if (val === undefined || val === null) {
      return match;
    }
    return String(val);
  });
}

/**
 * Direct translation lookup for non-React contexts (e.g. Voxide handlers, utility scripts)
 */
export function formatTranslation(
  key: string,
  values?: InterpolationValues,
  targetLocale?: Locale,
): string {
  const loc = targetLocale ?? getActiveLocale();
  const activeDict = dictionaries[loc] || dictionaries.en;
  let text = getNestedValue(activeDict, key);

  if (text === undefined && loc !== "en") {
    text = getNestedValue(dictionaries.en, key);
  }

  if (text === undefined) {
    return key;
  }

  return interpolate(text, values);
}

const I18nContext = createContext<I18nContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to English on SSR to ensure deterministic hydration
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const saved = (window.localStorage.getItem(STORAGE_KEY) ||
        window.localStorage.getItem("locale")) as Locale | null;
      if (saved === "am" || saved === "en") {
        currentActiveLocale = saved;
        document.documentElement.lang = saved;
        document.documentElement.dir = "ltr";
        window.requestAnimationFrame(() => {
          setLocaleState(saved);
          setIsReady(true);
        });
      } else {
        document.documentElement.lang = DEFAULT_LOCALE;
        document.documentElement.dir = "ltr";
        window.requestAnimationFrame(() => {
          setIsReady(true);
        });
      }
    } catch {
      window.requestAnimationFrame(() => {
        setIsReady(true);
      });
    }
  }, []);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    setActiveLocale(nextLocale);
  }, []);

  const t = useCallback(
    (key: string, values?: InterpolationValues): string => {
      return formatTranslation(key, values, locale);
    },
    [locale],
  );

  const contextValue = useMemo<I18nContextType>(
    () => ({
      locale,
      setLocale,
      t,
      isReady,
    }),
    [locale, setLocale, t, isReady],
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    // Graceful fallback for components rendered outside provider
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: (key: string, values?: InterpolationValues) => {
        const text = getNestedValue(dictionaries.en, key) ?? key;
        return interpolate(text, values);
      },
      isReady: true,
    };
  }
  return context;
}
