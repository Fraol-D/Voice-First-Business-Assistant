export type Locale = "en" | "am";

export type InterpolationValues = Record<string, string | number | undefined | null>;

export interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: InterpolationValues) => string;
  isReady: boolean;
}
