export type DemoEnvironmentLike = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  settings: unknown;
};

export type DemoEnvironmentStorageAdapter = 'seed_json' | 'local_storage' | 'local_file' | 'backend';

const DEMO_ENV_STORAGE_KEY = 'amplify-demo-environments';
export const DEMO_ENVIRONMENTS_STORAGE_VERSION = 1;

type DemoEnvironmentsPayload = {
  version: typeof DEMO_ENVIRONMENTS_STORAGE_VERSION;
  environments: DemoEnvironmentLike[];
};

import {
  isBuiltInDemoEnvironment,
  mergeSeededDemoConfigurations,
  SEEDED_DEMO_ENVIRONMENTS as SEEDED_PRESETS,
} from './demo-environment-presets';

/**
 * Built-in demo environments (Equisoft default + SBLI branded). User-saved
 * snapshots are merged in `list()` from local storage.
 */
export const SEEDED_DEMO_ENVIRONMENTS: DemoEnvironmentLike[] = SEEDED_PRESETS;

function isDemoEnvironmentLike(value: unknown): value is DemoEnvironmentLike {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<DemoEnvironmentLike>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.createdAt === 'string' &&
    Boolean(candidate.settings)
  );
}

function readLocalStorage(): DemoEnvironmentLike[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(DEMO_ENV_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const rows = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === 'object' && Array.isArray((parsed as Partial<DemoEnvironmentsPayload>).environments)
        ? (parsed as Partial<DemoEnvironmentsPayload>).environments
        : [];
    return rows.filter(isDemoEnvironmentLike);
  } catch {
    return [];
  }
}

function writeLocalStorage(environments: DemoEnvironmentLike[]) {
  if (typeof window === 'undefined') return;
  try {
    const payload: DemoEnvironmentsPayload = {
      version: DEMO_ENVIRONMENTS_STORAGE_VERSION,
      environments,
    };
    window.localStorage.setItem(DEMO_ENV_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* best effort until local/backend adapters are wired */
  }
}

export const demoEnvironmentRepository = {
  adapter: 'local_storage' as DemoEnvironmentStorageAdapter,
  storageVersion: DEMO_ENVIRONMENTS_STORAGE_VERSION,

  list<T extends DemoEnvironmentLike>(embedded: T[] = []): T[] {
    const byId = new Map<string, DemoEnvironmentLike>();
    [...SEEDED_DEMO_ENVIRONMENTS, ...readLocalStorage(), ...embedded].forEach((environment) => {
      byId.set(environment.id, environment);
    });
    return Array.from(byId.values()) as T[];
  },

  save<T extends DemoEnvironmentLike>(environment: T, _current: T[] = []): T[] {
    if (isBuiltInDemoEnvironment(environment.id)) {
      return mergeSeededDemoConfigurations(readLocalStorage()) as T[];
    }
    const userSaved = [
      environment,
      ...readLocalStorage().filter((item) => item.id !== environment.id),
    ];
    writeLocalStorage(userSaved);
    return mergeSeededDemoConfigurations(userSaved) as T[];
  },

  remove<T extends DemoEnvironmentLike>(id: string): T[] {
    if (isBuiltInDemoEnvironment(id)) {
      return mergeSeededDemoConfigurations(readLocalStorage()) as T[];
    }
    const userSaved = readLocalStorage().filter((item) => item.id !== id);
    writeLocalStorage(userSaved);
    return mergeSeededDemoConfigurations(userSaved) as T[];
  },

  replaceAll<T extends DemoEnvironmentLike>(environments: T[]): T[] {
    const userSaved = environments.filter((item) => !isBuiltInDemoEnvironment(item.id));
    writeLocalStorage(userSaved);
    return mergeSeededDemoConfigurations(userSaved) as T[];
  },
};
