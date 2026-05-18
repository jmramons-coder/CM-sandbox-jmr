/* Supported language list and display metadata used by the Language settings
 * page. Adding a new language is a four-step change:
 *   1. Add the code below (extend SupportedLanguage).
 *   2. Add an entry to LANGUAGES with native + English names + a sample line.
 *   3. Drop a new resource folder under src/app/i18n/resources/<code>/ with
 *      the same five namespace JSON files.
 *   4. Register the resource in src/app/i18n/index.ts and wire a date-fns
 *      locale in src/app/i18n/format.ts.
 */
export const SUPPORTED_LANGUAGES = ['en', 'fr', 'es'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/**
 * Feature flag for the multi-language UX. While `false` the Language settings
 * page renders as a "Coming soon" placeholder and the active language is
 * forced to English regardless of any persisted preference, so partial / mixed
 * translations never surface to users. Flip to `true` once every module is
 * fully tokenized and the FR / ES translations have had a UX writing review.
 */
export const LANGUAGE_FEATURE_ENABLED = false;

export type LanguageMeta = {
  code: SupportedLanguage;
  /** Name as written by speakers of the language. */
  nativeName: string;
  /** Name in English — used as the secondary line on the Language settings page. */
  englishName: string;
  /** Short region tag shown next to the name (Quebec, Latin America, etc.). */
  region: string;
  /** A short greeting / sample line so users can preview the tone. */
  sample: string;
};

export const LANGUAGES: Record<SupportedLanguage, LanguageMeta> = {
  en: {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    region: 'United States',
    sample: 'Welcome back — pick up where you left off.',
  },
  fr: {
    code: 'fr',
    nativeName: 'Français',
    englishName: 'French',
    region: 'Canada',
    sample: 'Bon retour — reprenez là où vous étiez.',
  },
  es: {
    code: 'es',
    nativeName: 'Español',
    englishName: 'Spanish',
    region: 'Latinoamérica',
    sample: 'Bienvenido de nuevo — continúe donde lo dejó.',
  },
};

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}
