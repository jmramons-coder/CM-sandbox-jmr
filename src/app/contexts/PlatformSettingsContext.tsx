import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import i18n from '../i18n';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_FEATURE_ENABLED,
  isSupportedLanguage,
  type SupportedLanguage,
} from '../i18n/types';
import {
  BUILTIN_CASE_TYPES,
  getCaseTypeById,
  type CaseTypeDefinition,
} from '../domain/caseTypes';
import {
  DEFAULT_DATA_SOURCE_SETTINGS,
  type DataSourceSettings,
} from '../domain/objectRefs';
import { demoEnvironmentRepository } from '../data/demoEnvironmentRepository';
import {
  applyActiveDemoEnvironment,
  isBuiltInDemoEnvironment,
  mergeSeededDemoConfigurations,
  pruneStaleGeneratedDatasets,
  resolveDefaultDemoEnvironmentId,
  SEEDED_DEMO_ENVIRONMENTS,
} from '../data/demo-environment-presets';
import {
  downloadDeployablePreset,
  snapshotToDeployablePreset,
} from '../data/demo-environment-deploy';
import { setActiveDemoConfigurationId } from '../data/datasetResolutionContext';
import { filterDatasetBySettings, getSystemDataset } from '../data/objectRepository';
import type { SystemDataset } from '../data/multi-case-dataset';
import { getWorkflowDefinition } from '../domain/workflows';
import type { IdentityDocumentPermissionOverrides } from '../domain/identityDocumentPermissions';

/* ─── Defaults ─── */

export const DEFAULT_BRANDING = {
  productName: 'Amplify Case Management',
  showProductName: true,
  logoMode: 'default' as 'default' | 'custom',
  /** Custom logo shown on dark surfaces (header, dark previews). */
  logoDarkDataUrl: undefined as string | undefined,
  /** Custom logo shown on light surfaces (light-bg previews, PDFs, etc). */
  logoLightDataUrl: undefined as string | undefined,
  headerColor: '#003a5a',
  primaryColor: '#006296',
  accentColor: '#602fa0',
  onHeaderColor: '#ffffff',
} as const;

export type Branding = {
  productName: string;
  showProductName: boolean;
  logoMode: 'default' | 'custom';
  logoDarkDataUrl?: string;
  logoLightDataUrl?: string;
  headerColor: string;
  primaryColor: string;
  accentColor: string;
  onHeaderColor: string;
};

export type ThemeMode = 'light' | 'dark';

export type ModuleId =
  | 'home'
  | 'cases'
  | 'folders'
  | 'finances'
  | 'users'
  | 'tasks'
  | 'requests'
  | 'documents'
  | 'aiActions'
  | 'insights'
  | 'reports'
  | 'copilot';

export type ModuleSettings = Record<ModuleId, boolean>;

export const DEFAULT_MODULES: ModuleSettings = {
  home: true,
  cases: true,
  folders: false,
  finances: false,
  users: true,
  tasks: true,
  requests: false,
  documents: true,
  aiActions: true,
  insights: false,
  reports: false,
  copilot: true,
};

export type IdentityDocumentPreferences = {
  documentTypes?: string[];
  unmaskTimeoutMs?: number;
  permissionOverrides?: IdentityDocumentPermissionOverrides;
};

export type PlatformPreferences = {
  aiActivityEnabled: boolean;
  aiSidePanelEnabled: boolean;
  casesAiAssistantEnabled: boolean;
  aiActivityVisible: boolean;
  /** Cursor highlight + click ripples for screen recordings. */
  presentationModeEnabled: boolean;
  identityDocuments?: IdentityDocumentPreferences;
};

export type DemoConfigurationSnapshot = {
  version: 4;
  mode: 'single' | 'multi';
  activeCaseTypeId: string | null;
  caseTypes: CaseTypeDefinition[];
  dataSource: DataSourceSettings;
  anatomy: AnatomySettings;
  branding: Branding;
  themeMode: ThemeMode;
  language: SupportedLanguage;
  preferences: PlatformPreferences;
  modules: ModuleSettings;
  roles: { enabled: false };
};

export type SavedDemoConfiguration = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  settings: DemoConfigurationSnapshot;
};

export type AnatomySettings = {
  entityAnatomyOverrides: Record<string, {
    enabled?: boolean;
    identificationFields?: string[];
    tabs?: Array<{ id: string; label: string; enabled: boolean; sections?: Array<{ id: string; label: string; enabled?: boolean; fields: string[]; subsections?: Array<{ id: string; label: string; enabled?: boolean; fields: string[] }> }> }>;
    overviewSections?: Array<{ id: string; label: string; fields: string[] }>;
    actions?: string[];
  }>;
  caseTypeAnatomyOverrides: Record<string, {
    enabled?: boolean;
    steps?: Array<{ id: string; label: string; phaseId: string; tooltip: string; logic?: Record<string, boolean> }>;
    identificationFields?: string[];
    overviewFields?: Array<{ id: string; label: string; source: string; required: boolean }>;
    tabs?: Array<{ id: string; label: string; enabled: boolean; sections?: Array<{ id: string; label: string; enabled?: boolean; fields: string[]; subsections?: Array<{ id: string; label: string; enabled?: boolean; fields: string[] }> }> }>;
    actions?: string[];
  }>;
  utilityContextCardOverrides: Record<string, {
    enabled?: boolean;
    label?: string;
  }>;
};

export type PlatformSettings = {
  /**
   * Schema version. Bump whenever the persisted shape needs a forced migration
   * (see `loadSettings` for the migration ladder). Today:
   *   1 → initial multi-case shape.
   *   2 → folders module defaults to OFF; older payloads have their `modules`
   *       slice reset to the new defaults but everything else is preserved.
   *   4 → new business workflow step ids refreshed in persisted anatomy when legacy
   *       NB step ids are still present.
   *   5 → seeded Equisoft/SBLI demo environments; prune stale generated datasets.
   */
  version: 5;
  mode: 'single' | 'multi';
  activeCaseTypeId: string | null;
  caseTypes: CaseTypeDefinition[];
  /**
   * Data/source selection for demo environments. Today this points at mock JSON
   * datasets; later it can select local/remote database-backed adapters.
   */
  dataSource: DataSourceSettings;
  anatomy: AnatomySettings;
  branding: Branding;
  /**
   * Global appearance mode. Today only affects the header bg and logo variant.
   * Intended to expand into full light/dark theming of the whole shell.
   */
  themeMode: ThemeMode;
  /**
   * Active UI language. Mirrored to i18next via `i18n.changeLanguage()` and
   * to the <html lang> attribute by `LanguageApplier` below so the whole
   * shell re-renders the moment the user picks a new language.
   */
  language: SupportedLanguage;
  preferences: PlatformPreferences;
  modules: ModuleSettings;
  roles: { enabled: false };
  demoConfigurations: SavedDemoConfiguration[];
  activeDemoConfigurationId: string | null;
};

const STORAGE_KEY = 'amplify-platform-settings';

/* Light-mode header surface. Kept minimal for now — expand into a proper light
 * palette when full light-theme support lands. */
const LIGHT_HEADER_BG = '#f5f5f7';
const LIGHT_HEADER_FG = '#1b1c1e';

const CURRENT_SETTINGS_VERSION = 6 as const;

const DEFAULT_ANATOMY_SETTINGS: AnatomySettings = {
  entityAnatomyOverrides: {},
  caseTypeAnatomyOverrides: {},
  utilityContextCardOverrides: {},
};

const DEFAULT_SETTINGS: PlatformSettings = {
  version: CURRENT_SETTINGS_VERSION,
  mode: 'multi',
  activeCaseTypeId: 'ct-ip',
  caseTypes: BUILTIN_CASE_TYPES.map((c) => ({ ...c })),
  dataSource: { ...DEFAULT_DATA_SOURCE_SETTINGS },
  anatomy: structuredClone(DEFAULT_ANATOMY_SETTINGS),
  branding: { ...DEFAULT_BRANDING },
  themeMode: 'dark',
  language: DEFAULT_LANGUAGE,
  preferences: {
    aiActivityEnabled: true,
    aiSidePanelEnabled: true,
    casesAiAssistantEnabled: true,
    aiActivityVisible: true,
    presentationModeEnabled: true,
  },
  modules: { ...DEFAULT_MODULES },
  roles: { enabled: false },
  demoConfigurations: [...SEEDED_DEMO_ENVIRONMENTS],
  activeDemoConfigurationId: resolveDefaultDemoEnvironmentId(),
};

const LEGACY_NB_ANATOMY_STEP_IDS = new Set(['completeness-check', 'advisor-clarification', 'submit-underwriting']);

function migrateLegacyNewBusinessAnatomySteps(
  overrides: AnatomySettings['caseTypeAnatomyOverrides'],
): AnatomySettings['caseTypeAnatomyOverrides'] {
  const nb = overrides.new_business;
  if (!nb?.steps?.length || !nb.steps.some((step) => LEGACY_NB_ANATOMY_STEP_IDS.has(step.id))) {
    return overrides;
  }
  const workflow = getWorkflowDefinition('new-business-application');
  if (!workflow) return overrides;
  return {
    ...overrides,
    new_business: {
      ...nb,
      steps: workflow.steps.map((step, index) => ({
        id: step.id,
        label: step.label,
        phaseId: step.phaseId,
        tooltip: step.tooltip,
        logic:
          nb.steps.find((previous) => previous.id === step.id)?.logic ??
          nb.steps[index]?.logic ?? {
            createTask: index === 0,
            createRequirement: index === 1,
            createRequest: false,
          },
      })),
    },
  };
}

/* ─── Persistence ─── */

function finalizePlatformSettings(settings: PlatformSettings): PlatformSettings {
  const applied = applyActiveDemoEnvironment(settings);
  setActiveDemoConfigurationId(applied.activeDemoConfigurationId ?? resolveDefaultDemoEnvironmentId());
  return applied;
}

function loadSettings(): PlatformSettings {
  if (typeof window === 'undefined') return finalizePlatformSettings(structuredClone(DEFAULT_SETTINGS));
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return finalizePlatformSettings(structuredClone(DEFAULT_SETTINGS));
    const parsed = JSON.parse(raw) as Partial<PlatformSettings> & { version?: number };
    if (!parsed || typeof parsed.version !== 'number') {
      return finalizePlatformSettings(structuredClone(DEFAULT_SETTINGS));
    }
    /* Anything newer than the current version (e.g. someone downgraded the
     * app) is treated as unknown and replaced with defaults — safer than
     * silently dropping unknown fields. */
    if (parsed.version > CURRENT_SETTINGS_VERSION) {
      return finalizePlatformSettings(structuredClone(DEFAULT_SETTINGS));
    }
    /* Back-compat: earlier versions stored a single `logoDataUrl`. Promote it to
     * the dark-background slot so pre-existing custom logos keep working. */
    const rawBranding = (parsed.branding ?? {}) as Partial<Branding> & {
      logoDataUrl?: string;
    };
    const { logoDataUrl: legacyLogo, ...restBranding } = rawBranding;
    const mergedBranding: Branding = {
      ...DEFAULT_SETTINGS.branding,
      ...restBranding,
      logoDarkDataUrl: restBranding.logoDarkDataUrl ?? legacyLogo,
    };
    /* Module migrations:
     *   v1 → v2: reset `modules` to the new defaults so the Folders flag flips
     *   off without nuking branding, case types, etc. (the user's other tweaks
     *   stay intact and the next save persists at v2 so this only runs once).
     */
    const isPreV2 = parsed.version < 2;
    const modules: ModuleSettings = isPreV2
      ? { ...DEFAULT_MODULES }
      : { ...DEFAULT_MODULES, ...(parsed.modules ?? {}) };
    const dataSource: DataSourceSettings = {
      ...DEFAULT_DATA_SOURCE_SETTINGS,
      ...(parsed.dataSource ?? {}),
      activeDatasetId: DEFAULT_DATA_SOURCE_SETTINGS.activeDatasetId,
      legacyMockOverlayEnabled: false,
      enabledObjectDomains:
        DEFAULT_DATA_SOURCE_SETTINGS.enabledObjectDomains,
      enabledWorkflows: DEFAULT_DATA_SOURCE_SETTINGS.enabledWorkflows.filter(
        (kind) => (kind as string) !== 'underwriting',
      ) as DataSourceSettings['enabledWorkflows'],
    };
    const rawCaseTypeOverrides = parsed.anatomy?.caseTypeAnatomyOverrides ?? {};
    const caseTypeAnatomyOverrides = Object.fromEntries(
      Object.entries(rawCaseTypeOverrides).filter(([key]) => key !== 'underwriting'),
    ) as AnatomySettings['caseTypeAnatomyOverrides'];
    const anatomy: AnatomySettings = {
      entityAnatomyOverrides: parsed.anatomy?.entityAnatomyOverrides ?? {},
      caseTypeAnatomyOverrides,
      utilityContextCardOverrides: parsed.anatomy?.utilityContextCardOverrides ?? {},
    };
    const migratedAnatomy =
      parsed.version < 4 ? migrateLegacyNewBusinessAnatomySteps(anatomy.caseTypeAnatomyOverrides) : anatomy.caseTypeAnatomyOverrides;
    const anatomyOut: AnatomySettings = {
      ...anatomy,
      caseTypeAnatomyOverrides: migratedAnatomy,
    };
    if (parsed.version < 5) {
      pruneStaleGeneratedDatasets();
    }

    const embeddedDemoConfigurations = Array.isArray(parsed.demoConfigurations)
      ? parsed.demoConfigurations.filter(isSavedDemoConfiguration)
      : [];
    const demoConfigurations = mergeSeededDemoConfigurations(
      demoEnvironmentRepository.list<SavedDemoConfiguration>(embeddedDemoConfigurations),
    );
    const defaultDemoId = resolveDefaultDemoEnvironmentId();
    const activeDemoConfigurationId =
      typeof parsed.activeDemoConfigurationId === 'string' &&
      demoConfigurations.some((config) => config.id === parsed.activeDemoConfigurationId)
        ? parsed.activeDemoConfigurationId
        : defaultDemoId;

    const baseSettings = {
      ...DEFAULT_SETTINGS,
      ...parsed,
      version: CURRENT_SETTINGS_VERSION,
      activeCaseTypeId:
        parsed.activeCaseTypeId === 'ct-uw' || parsed.activeCaseTypeId === 'ct-li'
          ? 'ct-ip'
          : parsed.activeCaseTypeId ?? null,
      caseTypes: mergeCaseTypes(parsed.caseTypes),
      dataSource,
      anatomy: anatomyOut,
      branding: mergedBranding,
      themeMode: parsed.themeMode === 'light' ? 'light' : 'dark',
      language: isSupportedLanguage(parsed.language) ? parsed.language : DEFAULT_LANGUAGE,
      preferences: {
        ...DEFAULT_SETTINGS.preferences,
        ...(parsed.preferences ?? {}),
        presentationModeEnabled:
          parsed.version < 6
            ? true
            : (parsed.preferences?.presentationModeEnabled ?? DEFAULT_SETTINGS.preferences.presentationModeEnabled),
      },
      modules,
      roles: { enabled: false },
      demoConfigurations,
      activeDemoConfigurationId,
    } as PlatformSettings;

    return finalizePlatformSettings(baseSettings);
  } catch {
    return finalizePlatformSettings(structuredClone(DEFAULT_SETTINGS));
  }
}

function isSavedDemoConfiguration(value: unknown): value is SavedDemoConfiguration {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<SavedDemoConfiguration>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.createdAt === 'string' &&
    Boolean(candidate.settings)
  );
}

function createDemoConfigurationSnapshot(settings: PlatformSettings): DemoConfigurationSnapshot {
  return {
    version: CURRENT_SETTINGS_VERSION,
    mode: settings.mode,
    activeCaseTypeId: settings.activeCaseTypeId,
    caseTypes: structuredClone(settings.caseTypes),
    dataSource: structuredClone(settings.dataSource),
    anatomy: structuredClone(settings.anatomy),
    branding: structuredClone(settings.branding),
    themeMode: settings.themeMode,
    language: settings.language,
    preferences: structuredClone(settings.preferences),
    modules: structuredClone(settings.modules),
    roles: { enabled: false },
  };
}

function applyDemoConfigurationSnapshot(
  snapshot: DemoConfigurationSnapshot,
  demoConfigurations: SavedDemoConfiguration[],
  activeDemoConfigurationId: string | null,
): PlatformSettings {
  return {
    ...structuredClone(snapshot),
    version: CURRENT_SETTINGS_VERSION,
    dataSource: {
      ...DEFAULT_DATA_SOURCE_SETTINGS,
      ...(snapshot.dataSource ?? {}),
    },
    anatomy: {
      ...structuredClone(DEFAULT_ANATOMY_SETTINGS),
      ...(snapshot.anatomy ?? {}),
    },
    roles: { enabled: false },
    demoConfigurations,
    activeDemoConfigurationId,
  };
}

/**
 * Accent colors shipped in earlier versions of the app. If a persisted built-in
 * type still has one of these values, we assume the user never customized it
 * and upgrade it to the new default (pastel) automatically.
 */
const LEGACY_BUILTIN_ACCENTS: Record<string, string[]> = {
  IP: ['#006296'],
  WOP: ['#1f7a5b'],
  WP: ['#a8531a'],
  LI: ['#602fa0'],
};

/**
 * Merge persisted case types with built-ins: keep user's enabled/copy edits but
 * guarantee every built-in exists (so newly shipped defaults appear automatically).
 */
function mergeCaseTypes(persisted: CaseTypeDefinition[] | undefined): CaseTypeDefinition[] {
  const defaults = BUILTIN_CASE_TYPES.map((c) => ({ ...c }));
  if (!persisted || !Array.isArray(persisted) || persisted.length === 0) return defaults;
  const result: CaseTypeDefinition[] = [];
  const seen = new Set<string>();
  for (const d of defaults) {
    const found = persisted.find((p) => p.id === d.id || p.code?.toUpperCase() === d.code);
    if (found) {
      const merged = { ...d, ...found, isBuiltIn: true, code: d.code, id: d.id };
      const legacy = LEGACY_BUILTIN_ACCENTS[d.code.toUpperCase()] ?? [];
      if (legacy.includes(merged.accentColor?.toLowerCase?.() ?? '')) {
        merged.accentColor = d.accentColor;
      }
      result.push(merged);
      seen.add(found.id);
    } else {
      result.push(d);
    }
  }
  for (const p of persisted) {
    if (seen.has(p.id)) continue;
    if (defaults.some((d) => d.id === p.id)) continue;
    if (p.id === 'ct-uw' || p.id === 'ct-li') continue;
    if ((p.caseKind as string) === 'underwriting') continue;
    result.push({ ...p, isBuiltIn: false });
  }
  return result;
}

function persist(settings: PlatformSettings) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* quota / private mode — best effort */
  }
}

/* ─── Context ─── */

type Ctx = {
  settings: PlatformSettings;
  update: (patch: Partial<PlatformSettings>) => void;
  updateBranding: (patch: Partial<Branding>) => void;
  setMode: (mode: 'single' | 'multi') => void;
  setActiveCaseTypeId: (id: string | null) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: SupportedLanguage) => void;
  updateCaseType: (id: string, patch: Partial<CaseTypeDefinition>) => void;
  toggleCaseType: (id: string, enabled: boolean) => void;
  addCaseType: (partial: Omit<CaseTypeDefinition, 'id' | 'isBuiltIn'> & { id?: string }) => CaseTypeDefinition;
  removeCaseType: (id: string) => void;
  setAiActivityEnabled: (enabled: boolean) => void;
  setAiSidePanelEnabled: (enabled: boolean) => void;
  setCasesAiAssistantEnabled: (enabled: boolean) => void;
  setAiActivityVisible: (visible: boolean) => void;
  setPresentationModeEnabled: (enabled: boolean) => void;
  setModuleEnabled: (id: ModuleId, enabled: boolean) => void;
  updateDataSource: (patch: Partial<DataSourceSettings>) => void;
  updateAnatomy: (patch: Partial<AnatomySettings>) => void;
  saveDemoConfiguration: (input: { name: string; description: string }) => void;
  deleteDemoConfiguration: (id: string) => void;
  exportBuiltInDemoEnvironmentForDeploy: (id: string) => string | null;
  setActiveDemoConfiguration: (id: string | null) => void;
  resetBranding: () => void;
  resetAll: () => void;
};

const PlatformSettingsCtx = createContext<Ctx | null>(null);

export function PlatformSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PlatformSettings>(() => loadSettings());

  useEffect(() => {
    persist(settings);
  }, [settings]);

  useEffect(() => {
    setActiveDemoConfigurationId(settings.activeDemoConfigurationId ?? resolveDefaultDemoEnvironmentId());
  }, [settings.activeDemoConfigurationId]);

  /* Keep activeCaseTypeId valid when mode/enabled change. */
  useEffect(() => {
    setSettings((prev) => {
      if (prev.mode !== 'single') return prev;
      const current = getCaseTypeById(prev.activeCaseTypeId, prev.caseTypes);
      if (current && current.enabled) return prev;
      const firstEnabled = prev.caseTypes.find((c) => c.enabled);
      if (firstEnabled && firstEnabled.id !== prev.activeCaseTypeId) {
        return { ...prev, activeCaseTypeId: firstEnabled.id };
      }
      return prev;
    });
  }, [settings.mode, settings.caseTypes]);

  const update = useCallback((patch: Partial<PlatformSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateBranding = useCallback((patch: Partial<Branding>) => {
    setSettings((prev) => ({ ...prev, branding: { ...prev.branding, ...patch } }));
  }, []);

  const setMode = useCallback((mode: 'single' | 'multi') => {
    setSettings((prev) => {
      if (mode === 'single') {
        const activeId =
          getCaseTypeById(prev.activeCaseTypeId, prev.caseTypes)?.enabled
            ? prev.activeCaseTypeId
            : prev.caseTypes.find((c) => c.enabled)?.id ?? null;
        return { ...prev, mode, activeCaseTypeId: activeId };
      }
      return { ...prev, mode };
    });
  }, []);

  const setActiveCaseTypeId = useCallback((id: string | null) => {
    setSettings((prev) => ({ ...prev, activeCaseTypeId: id }));
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setSettings((prev) => ({ ...prev, themeMode: mode }));
  }, []);

  const setLanguage = useCallback((language: SupportedLanguage) => {
    setSettings((prev) => (prev.language === language ? prev : { ...prev, language }));
  }, []);

  const updateCaseType = useCallback((id: string, patch: Partial<CaseTypeDefinition>) => {
    setSettings((prev) => ({
      ...prev,
      caseTypes: prev.caseTypes.map((c) => (c.id === id ? { ...c, ...patch, id: c.id } : c)),
    }));
  }, []);

  const toggleCaseType = useCallback((id: string, enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      caseTypes: prev.caseTypes.map((c) => (c.id === id ? { ...c, enabled } : c)),
    }));
  }, []);

  const addCaseType = useCallback(
    (partial: Omit<CaseTypeDefinition, 'id' | 'isBuiltIn'> & { id?: string }) => {
      const id =
        partial.id ?? `ct-${(partial.code || 'new').toLowerCase()}-${Date.now().toString(36)}`;
      const def: CaseTypeDefinition = {
        id,
        code: partial.code,
        label: partial.label,
        shortLabel: partial.shortLabel || partial.code,
        description: partial.description || '',
        accentColor: partial.accentColor || '#006296',
        enabled: partial.enabled ?? true,
        caseKind: partial.caseKind,
        workflowTemplateId: partial.workflowTemplateId,
        progressSteps: partial.progressSteps,
        tabs: partial.tabs,
        statuses: partial.statuses,
        requirementCategories: partial.requirementCategories,
        decisions: partial.decisions,
        actions: partial.actions,
        workflowActions: partial.workflowActions,
        participantLabels: partial.participantLabels,
        searchableObjectKinds: partial.searchableObjectKinds,
        integrations: partial.integrations,
        copy: partial.copy,
        isBuiltIn: false,
      };
      setSettings((prev) => ({ ...prev, caseTypes: [...prev.caseTypes, def] }));
      return def;
    },
    [],
  );

  const removeCaseType = useCallback((id: string) => {
    setSettings((prev) => {
      const target = prev.caseTypes.find((c) => c.id === id);
      if (!target || target.isBuiltIn) return prev;
      return { ...prev, caseTypes: prev.caseTypes.filter((c) => c.id !== id) };
    });
  }, []);

  const setAiActivityEnabled = useCallback((enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, aiActivityEnabled: enabled },
    }));
  }, []);

  const setAiSidePanelEnabled = useCallback((enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, aiSidePanelEnabled: enabled },
    }));
  }, []);

  const setCasesAiAssistantEnabled = useCallback((enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, casesAiAssistantEnabled: enabled },
    }));
  }, []);

  const setAiActivityVisible = useCallback((visible: boolean) => {
    setSettings((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        aiActivityVisible: visible,
        /* When making the feed visible again, default it to active. */
        ...(visible ? { aiActivityEnabled: true } : {}),
      },
    }));
  }, []);

  const setPresentationModeEnabled = useCallback((enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, presentationModeEnabled: enabled },
    }));
  }, []);

  const setModuleEnabled = useCallback((id: ModuleId, enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      modules: { ...prev.modules, [id]: enabled },
    }));
  }, []);

  const updateDataSource = useCallback((patch: Partial<DataSourceSettings>) => {
    setSettings((prev) => ({
      ...prev,
      dataSource: {
        ...prev.dataSource,
        ...patch,
        enabledObjectDomains: patch.enabledObjectDomains ?? prev.dataSource.enabledObjectDomains,
        enabledWorkflows: patch.enabledWorkflows ?? prev.dataSource.enabledWorkflows,
      },
    }));
  }, []);

  const updateAnatomy = useCallback((patch: Partial<AnatomySettings>) => {
    setSettings((prev) => ({
      ...prev,
      anatomy: {
        ...prev.anatomy,
        ...patch,
        entityAnatomyOverrides: patch.entityAnatomyOverrides ?? prev.anatomy.entityAnatomyOverrides,
        caseTypeAnatomyOverrides: patch.caseTypeAnatomyOverrides ?? prev.anatomy.caseTypeAnatomyOverrides,
        utilityContextCardOverrides: patch.utilityContextCardOverrides ?? prev.anatomy.utilityContextCardOverrides,
      },
    }));
  }, []);

  const saveDemoConfiguration = useCallback((input: { name: string; description: string }) => {
    const name = input.name.trim();
    if (!name) return;
    setSettings((prev) => {
      const saved: SavedDemoConfiguration = {
        id: `demo-config-${Date.now().toString(36)}`,
        name,
        description: input.description.trim(),
        createdAt: new Date().toISOString(),
        settings: createDemoConfigurationSnapshot(prev),
      };
      const demoConfigurations = demoEnvironmentRepository.save(saved, prev.demoConfigurations);
      return {
        ...prev,
        demoConfigurations,
      };
    });
  }, []);

  const exportBuiltInDemoEnvironmentForDeploy = useCallback(
    (id: string) => {
      if (!isBuiltInDemoEnvironment(id)) return null;
      const seed = SEEDED_DEMO_ENVIRONMENTS.find((config) => config.id === id);
      if (!seed) return null;
      const file = snapshotToDeployablePreset({
        id: seed.id,
        name: seed.name,
        description: seed.description,
        createdAt: seed.createdAt,
        settings: createDemoConfigurationSnapshot(settings),
      });
      downloadDeployablePreset(file);
      if (file.id === 'demo-sbli') return 'sbli.preset.json';
      if (file.id === 'demo-guardian-1821') return 'guardian.preset.json';
      return 'equisoft.preset.json';
    },
    [settings],
  );

  const deleteDemoConfiguration = useCallback((id: string) => {
    if (isBuiltInDemoEnvironment(id)) return;
    setSettings((prev) => {
      const demoConfigurations = demoEnvironmentRepository.remove<SavedDemoConfiguration>(id);
      const wasActive = prev.activeDemoConfigurationId === id;
      const activeDemoConfigurationId = wasActive
        ? resolveDefaultDemoEnvironmentId()
        : prev.activeDemoConfigurationId;
      const base = {
        ...prev,
        demoConfigurations,
        activeDemoConfigurationId,
      } as PlatformSettings;
      return applyActiveDemoEnvironment(base);
    });
  }, []);

  const setActiveDemoConfiguration = useCallback((id: string | null) => {
    const resolvedDemoId = id ?? resolveDefaultDemoEnvironmentId();
    setActiveDemoConfigurationId(resolvedDemoId);
    setSettings((prev) => {
      if (!id) {
        const reset = finalizePlatformSettings({
          ...structuredClone(DEFAULT_SETTINGS),
          demoConfigurations: prev.demoConfigurations,
          activeDemoConfigurationId: resolveDefaultDemoEnvironmentId(),
        });
        return reset;
      }
      const target = prev.demoConfigurations.find((config) => config.id === id);
      if (!target) return prev;
      return finalizePlatformSettings(
        applyDemoConfigurationSnapshot(target.settings, prev.demoConfigurations, target.id),
      );
    });
  }, []);

  const resetBranding = useCallback(() => {
    setSettings((prev) => ({ ...prev, branding: { ...DEFAULT_BRANDING } }));
  }, []);

  const resetAll = useCallback(() => {
    setSettings((prev) =>
      applyActiveDemoEnvironment({
        ...structuredClone(DEFAULT_SETTINGS),
        demoConfigurations: mergeSeededDemoConfigurations(prev.demoConfigurations),
      }),
    );
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      settings,
      update,
      updateBranding,
      setMode,
      setActiveCaseTypeId,
      setThemeMode,
      setLanguage,
      updateCaseType,
      toggleCaseType,
      addCaseType,
      removeCaseType,
      setAiActivityEnabled,
      setAiSidePanelEnabled,
      setCasesAiAssistantEnabled,
      setAiActivityVisible,
      setPresentationModeEnabled,
      setModuleEnabled,
      updateDataSource,
      updateAnatomy,
      saveDemoConfiguration,
      deleteDemoConfiguration,
      exportBuiltInDemoEnvironmentForDeploy,
      setActiveDemoConfiguration,
      resetBranding,
      resetAll,
    }),
    [
      settings,
      update,
      updateBranding,
      setMode,
      setActiveCaseTypeId,
      setThemeMode,
      setLanguage,
      updateCaseType,
      toggleCaseType,
      addCaseType,
      removeCaseType,
      setAiActivityEnabled,
      setAiSidePanelEnabled,
      setCasesAiAssistantEnabled,
      setAiActivityVisible,
      setPresentationModeEnabled,
      setModuleEnabled,
      updateDataSource,
      updateAnatomy,
      saveDemoConfiguration,
      deleteDemoConfiguration,
      exportBuiltInDemoEnvironmentForDeploy,
      setActiveDemoConfiguration,
      resetBranding,
      resetAll,
    ],
  );

  return (
    <PlatformSettingsCtx.Provider value={value}>
      <BrandingApplier branding={settings.branding} themeMode={settings.themeMode} />
      <LanguageApplier language={settings.language} />
      {children}
    </PlatformSettingsCtx.Provider>
  );
}

/**
 * Pushes the current language down to i18next and the <html lang> attribute.
 * Runs once on mount (so a persisted language is applied from the very first
 * render) and again whenever the user picks a new language in settings.
 *
 * While `LANGUAGE_FEATURE_ENABLED` is false the active language is hard-pinned
 * to English regardless of any persisted preference. This keeps the app fully
 * English until every module is tokenized and the FR / ES translations have
 * been through a UX writing review — flipping the flag re-enables the
 * persisted preference automatically.
 */
function LanguageApplier({ language }: { language: SupportedLanguage }) {
  const effective: SupportedLanguage = LANGUAGE_FEATURE_ENABLED ? language : DEFAULT_LANGUAGE;
  useEffect(() => {
    if (i18n.language !== effective) {
      void i18n.changeLanguage(effective);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = effective;
    }
  }, [effective]);
  return null;
}

/**
 * Writes the current branding values to CSS variables on :root so the entire
 * app re-themes instantly. In light mode, the header uses a light surface
 * instead of the custom brand header color.
 */
function BrandingApplier({
  branding,
  themeMode,
}: {
  branding: Branding;
  themeMode: ThemeMode;
}) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (themeMode === 'light') {
      root.style.setProperty('--brand-header', LIGHT_HEADER_BG);
      root.style.setProperty('--brand-on-header', LIGHT_HEADER_FG);
    } else {
      root.style.setProperty('--brand-header', branding.headerColor);
      root.style.setProperty('--brand-on-header', branding.onHeaderColor);
    }
    root.style.setProperty('--brand-primary', branding.primaryColor);
    root.style.setProperty('--brand-accent', branding.accentColor);
    root.dataset.themeMode = themeMode;
  }, [branding, themeMode]);
  return null;
}

/* ─── Hooks ─── */

export function usePlatformSettings(): Ctx {
  const ctx = useContext(PlatformSettingsCtx);
  if (!ctx) throw new Error('usePlatformSettings must be used inside PlatformSettingsProvider');
  return ctx;
}

export function useBranding(): Branding {
  return usePlatformSettings().settings.branding;
}

export function useThemeMode(): ThemeMode {
  return usePlatformSettings().settings.themeMode;
}

export function useIsMultiCase(): boolean {
  return usePlatformSettings().settings.mode === 'multi';
}

/**
 * Returns the effective list of case types for the current mode:
 * - multi: all enabled types
 * - single: only the active type (if enabled)
 */
export function useEnabledCaseTypes(): CaseTypeDefinition[] {
  const { settings } = usePlatformSettings();
  return useMemo(() => {
    if (settings.mode === 'single') {
      const active = getCaseTypeById(settings.activeCaseTypeId, settings.caseTypes);
      return active && active.enabled ? [active] : [];
    }
    return settings.caseTypes.filter((c) => c.enabled);
  }, [settings.mode, settings.activeCaseTypeId, settings.caseTypes]);
}

export function useModules(): ModuleSettings {
  return usePlatformSettings().settings.modules;
}

export function usePresentationModeEnabled(): boolean {
  return usePlatformSettings().settings.preferences.presentationModeEnabled ?? true;
}

export function useDataSourceSettings(): DataSourceSettings {
  return usePlatformSettings().settings.dataSource;
}

/** Dataset from the active demo environment (re-resolves when branding env toggles). */
export function useResolvedSystemDataset(): SystemDataset {
  const { settings } = usePlatformSettings();
  const { dataSource, activeDemoConfigurationId } = settings;
  return useMemo(
    () => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource),
    [dataSource, activeDemoConfigurationId],
  );
}
