/**
 * Locale-aware formatting helpers. Date formatting uses date-fns + the
 * matching locale package; numbers and currency use the platform's `Intl`
 * APIs, both keyed off the active i18next language.
 *
 * The hooks subscribe to language changes via `useTranslation()` so any
 * displayed value re-renders the moment the user switches languages from the
 * Language settings page.
 */
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { format as formatDateFns, parseISO } from 'date-fns';
import { enUS, fr as frLocale, es as esLocale } from 'date-fns/locale';

import type { SupportedLanguage } from './types';

const DATE_FNS_LOCALES = {
  en: enUS,
  fr: frLocale,
  es: esLocale,
} as const;

const INTL_LOCALES: Record<SupportedLanguage, string> = {
  en: 'en-US',
  fr: 'fr-CA',
  es: 'es-419',
};

function resolveLanguage(value: string | undefined): SupportedLanguage {
  if (value === 'fr' || value === 'es' || value === 'en') return value;
  return 'en';
}

/**
 * Formats a date or ISO date string in the active locale. Falls back to the
 * raw input when parsing fails so the UI never blanks out on bad data.
 *
 * @example formatDate('2026-04-25', 'PP') → 'Apr 25, 2026' / '25 avr. 2026'
 */
export function useFormatDate() {
  const { i18n } = useTranslation();
  const lang = resolveLanguage(i18n.language);
  return useCallback(
    (value: Date | string | null | undefined, pattern = 'PP'): string => {
      if (value === null || value === undefined) return '';
      try {
        const date = value instanceof Date ? value : parseISO(value);
        if (Number.isNaN(date.getTime())) return typeof value === 'string' ? value : '';
        return formatDateFns(date, pattern, { locale: DATE_FNS_LOCALES[lang] });
      } catch {
        return typeof value === 'string' ? value : '';
      }
    },
    [lang],
  );
}

export function useFormatNumber() {
  const { i18n } = useTranslation();
  const lang = resolveLanguage(i18n.language);
  return useCallback(
    (value: number, options?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(INTL_LOCALES[lang], options).format(value),
    [lang],
  );
}

export function useFormatCurrency() {
  const { i18n } = useTranslation();
  const lang = resolveLanguage(i18n.language);
  return useCallback(
    (value: number, currency: string, options?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(INTL_LOCALES[lang], {
        style: 'currency',
        currency,
        ...options,
      }).format(value),
    [lang],
  );
}

/** Returns the raw date-fns locale for components (e.g. react-day-picker) that take it directly. */
export function useDateFnsLocale() {
  const { i18n } = useTranslation();
  return DATE_FNS_LOCALES[resolveLanguage(i18n.language)];
}
