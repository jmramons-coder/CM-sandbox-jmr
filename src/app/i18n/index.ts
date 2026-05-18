/**
 * i18next bootstrap. Synchronously registers all locale resources at startup
 * (no lazy loading — bundle size is acceptable for this in-app demo and we
 * avoid the loading flash that comes with HTTP backends).
 *
 * Language is owned by `PlatformSettingsContext` (so the user can change it
 * from the Language settings page and have it persist via the existing
 * localStorage layer). The provider mirrors changes here through
 * `i18n.changeLanguage()` and updates `document.documentElement.lang`.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './resources/en/common.json';
import enNav from './resources/en/nav.json';
import enSettings from './resources/en/settings.json';
import enFolders from './resources/en/folders.json';
import enFixtures from './resources/en/fixtures.json';

import frCommon from './resources/fr/common.json';
import frNav from './resources/fr/nav.json';
import frSettings from './resources/fr/settings.json';
import frFolders from './resources/fr/folders.json';
import frFixtures from './resources/fr/fixtures.json';

import esCommon from './resources/es/common.json';
import esNav from './resources/es/nav.json';
import esSettings from './resources/es/settings.json';
import esFolders from './resources/es/folders.json';
import esFixtures from './resources/es/fixtures.json';

import { DEFAULT_LANGUAGE } from './types';

export const I18N_NAMESPACES = ['common', 'nav', 'settings', 'folders', 'fixtures'] as const;

export const I18N_RESOURCES = {
  en: {
    common: enCommon,
    nav: enNav,
    settings: enSettings,
    folders: enFolders,
    fixtures: enFixtures,
  },
  fr: {
    common: frCommon,
    nav: frNav,
    settings: frSettings,
    folders: frFolders,
    fixtures: frFixtures,
  },
  es: {
    common: esCommon,
    nav: esNav,
    settings: esSettings,
    folders: esFolders,
    fixtures: esFixtures,
  },
} as const;

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: I18N_RESOURCES,
    lng: DEFAULT_LANGUAGE,
    fallbackLng: 'en',
    ns: I18N_NAMESPACES as unknown as string[],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
    react: {
      useSuspense: false,
    },
  });
}

export default i18n;
