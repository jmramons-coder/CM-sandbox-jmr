import type { SavedDemoConfiguration } from '../contexts/PlatformSettingsContext';
import { generatedDatasetRepository } from './generatedDatasetRepository';
import equisoftPreset from './demo-environments/equisoft.preset.json';
import sbliPreset from './demo-environments/sbli.preset.json';
import {
  DEMO_ENV_EQUISOFT_ID,
  DEMO_ENV_SBLI_ID,
  SHARED_DEMO_DATASET_ID,
  hydrateDeployablePreset,
  type DeployableDemoPresetFile,
} from './demo-environment-deploy';
import { DEFAULT_DATA_SOURCE_SETTINGS } from '../domain/objectRefs';

export { DEMO_ENV_EQUISOFT_ID, DEMO_ENV_SBLI_ID, SHARED_DEMO_DATASET_ID };

const BUILT_IN_DEMO_ENVIRONMENT_IDS = new Set([DEMO_ENV_EQUISOFT_ID, DEMO_ENV_SBLI_ID]);

export function isBuiltInDemoEnvironment(id: string): boolean {
  return BUILT_IN_DEMO_ENVIRONMENT_IDS.has(id);
}

export const SEEDED_DEMO_ENVIRONMENTS: SavedDemoConfiguration[] = [
  hydrateDeployablePreset(equisoftPreset as DeployableDemoPresetFile),
  hydrateDeployablePreset(sbliPreset as DeployableDemoPresetFile),
];

const STALE_DEMO_NAME_PATTERN =
  /requirements-seeded|1,000-record|data context|context copy|multi-case smoke|demo dataset copy/i;

const STALE_GENERATED_LABEL_PATTERN =
  /requirements-seeded|1,000-record simulation|multi-case smoke|data context| copy$/i;

export function resolveDefaultDemoEnvironmentId(): string {
  const env = import.meta.env.VITE_DEFAULT_DEMO_ENV;
  if (env === DEMO_ENV_SBLI_ID || env === 'sbli') return DEMO_ENV_SBLI_ID;
  return DEMO_ENV_EQUISOFT_ID;
}

export function mergeSeededDemoConfigurations(saved: SavedDemoConfiguration[]): SavedDemoConfiguration[] {
  const byId = new Map<string, SavedDemoConfiguration>();
  SEEDED_DEMO_ENVIRONMENTS.forEach((seed) => byId.set(seed.id, seed));
  saved
    .filter((item) => !byId.has(item.id) && !STALE_DEMO_NAME_PATTERN.test(item.name))
    .forEach((item) => byId.set(item.id, item));
  return Array.from(byId.values());
}

export function applyActiveDemoEnvironment(
  settings: import('../contexts/PlatformSettingsContext').PlatformSettings,
): import('../contexts/PlatformSettingsContext').PlatformSettings {
  const activeId = settings.activeDemoConfigurationId ?? resolveDefaultDemoEnvironmentId();
  const target = settings.demoConfigurations.find((config) => config.id === activeId);
  if (!target) {
    return {
      ...settings,
      activeDemoConfigurationId: resolveDefaultDemoEnvironmentId(),
    };
  }
  return {
    ...target.settings,
    version: 5,
    demoConfigurations: settings.demoConfigurations,
    activeDemoConfigurationId: activeId,
    dataSource: {
      ...DEFAULT_DATA_SOURCE_SETTINGS,
      ...(target.settings.dataSource ?? {}),
      activeDatasetId: SHARED_DEMO_DATASET_ID,
      legacyMockOverlayEnabled: false,
    },
  };
}

export function pruneStaleGeneratedDatasets(): void {
  if (typeof window === 'undefined') return;
  const keep = generatedDatasetRepository
    .list()
    .filter((dataset) => dataset.id === SHARED_DEMO_DATASET_ID || !STALE_GENERATED_LABEL_PATTERN.test(dataset.label));
  const current = generatedDatasetRepository.list();
  if (keep.length === current.length) return;
  current
    .filter((dataset) => !keep.some((item) => item.id === dataset.id))
    .forEach((dataset) => {
      generatedDatasetRepository.delete(dataset.id);
    });
}
