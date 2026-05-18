/**
 * Type augmentation for react-i18next so `t('settings.tabs.modules.label')`
 * gets full autocomplete and is checked at compile time. The English JSON
 * is the source of truth — add a key there first, then translate.
 */
import 'react-i18next';

import type common from './resources/en/common.json';
import type nav from './resources/en/nav.json';
import type settings from './resources/en/settings.json';
import type folders from './resources/en/folders.json';
import type fixtures from './resources/en/fixtures.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      nav: typeof nav;
      settings: typeof settings;
      folders: typeof folders;
      fixtures: typeof fixtures;
    };
  }
}
