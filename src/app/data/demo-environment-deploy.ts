import type { DemoConfigurationSnapshot, SavedDemoConfiguration } from '../contexts/PlatformSettingsContext';
import { DEFAULT_DATASET_ID, DEFAULT_DATA_SOURCE_SETTINGS } from '../domain/objectRefs';
import { BUILTIN_CASE_TYPES } from '../domain/caseTypes';
import { DEFAULT_LANGUAGE, type SupportedLanguage } from '../i18n/types';
import type { Branding } from '../contexts/PlatformSettingsContext';

export const DEMO_ENV_EQUISOFT_ID = 'demo-equisoft';
export const DEMO_ENV_SBLI_ID = 'demo-sbli';
export const SHARED_DEMO_DATASET_ID = DEFAULT_DATASET_ID;

/** Shape committed in `src/app/data/demo-environments/*.preset.json` */
export type DeployableDemoPresetFile = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  settings: {
    branding: Branding;
    themeMode: DemoConfigurationSnapshot['themeMode'];
    language: SupportedLanguage;
    mode: DemoConfigurationSnapshot['mode'];
    activeCaseTypeId: string | null;
    preferences: DemoConfigurationSnapshot['preferences'];
    modules: DemoConfigurationSnapshot['modules'];
    dataSource?: Pick<DemoConfigurationSnapshot['dataSource'], 'displayCurrency'>;
  };
};

export const DEPLOYABLE_PRESET_REPO_PATH: Record<string, string> = {
  [DEMO_ENV_EQUISOFT_ID]: 'src/app/data/demo-environments/equisoft.preset.json',
  [DEMO_ENV_SBLI_ID]: 'src/app/data/demo-environments/sbli.preset.json',
};

export function buildDemoSnapshotFromBranding(branding: Branding): DemoConfigurationSnapshot {
  return {
    version: 4,
    mode: 'multi',
    activeCaseTypeId: 'ct-ip',
    caseTypes: BUILTIN_CASE_TYPES.map((caseType) => ({ ...caseType })),
    dataSource: {
      ...DEFAULT_DATA_SOURCE_SETTINGS,
      activeDatasetId: SHARED_DEMO_DATASET_ID,
      displayCurrency: 'USD',
      legacyMockOverlayEnabled: false,
    },
    anatomy: {
      entityAnatomyOverrides: {},
      caseTypeAnatomyOverrides: {},
      utilityContextCardOverrides: {},
    },
    branding: { ...branding },
    themeMode: 'dark',
    language: DEFAULT_LANGUAGE as SupportedLanguage,
    preferences: {
      aiActivityEnabled: true,
      aiSidePanelEnabled: true,
      casesAiAssistantEnabled: true,
      aiActivityVisible: true,
    },
    modules: {
      home: true,
      cases: true,
      folders: false,
      finances: false,
      tasks: true,
      requests: true,
      documents: true,
      aiActions: true,
      insights: false,
      reports: false,
      copilot: true,
    },
    roles: { enabled: false },
  };
}

export function hydrateDeployablePreset(file: DeployableDemoPresetFile): SavedDemoConfiguration {
  const base = buildDemoSnapshotFromBranding(file.settings.branding);
  return {
    id: file.id,
    name: file.name,
    description: file.description,
    createdAt: file.createdAt,
    settings: {
      ...base,
      mode: file.settings.mode,
      activeCaseTypeId: file.settings.activeCaseTypeId,
      branding: { ...file.settings.branding },
      themeMode: file.settings.themeMode,
      language: file.settings.language,
      preferences: { ...file.settings.preferences },
      modules: { ...file.settings.modules },
      dataSource: {
        ...base.dataSource,
        ...(file.settings.dataSource ?? {}),
        activeDatasetId: SHARED_DEMO_DATASET_ID,
        displayCurrency: file.settings.dataSource?.displayCurrency ?? 'USD',
        legacyMockOverlayEnabled: false,
      },
    },
  };
}

export function snapshotToDeployablePreset(
  config: Pick<SavedDemoConfiguration, 'id' | 'name' | 'description' | 'createdAt' | 'settings'>,
): DeployableDemoPresetFile {
  return {
    id: config.id,
    name: config.name,
    description: config.description,
    createdAt: config.createdAt,
    settings: {
      branding: config.settings.branding,
      themeMode: config.settings.themeMode,
      language: config.settings.language,
      mode: config.settings.mode,
      activeCaseTypeId: config.settings.activeCaseTypeId,
      preferences: config.settings.preferences,
      modules: config.settings.modules,
      dataSource: config.settings.dataSource?.displayCurrency
        ? { displayCurrency: config.settings.dataSource.displayCurrency }
        : undefined,
    },
  };
}

export function downloadDeployablePreset(file: DeployableDemoPresetFile): void {
  const blob = new Blob([`${JSON.stringify(file, null, 2)}\n`], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const filename = file.id === DEMO_ENV_SBLI_ID ? 'sbli.preset.json' : 'equisoft.preset.json';
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
