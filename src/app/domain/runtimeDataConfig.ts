import {
  CASE_TYPE_ANATOMY_DEFINITIONS,
  ENTITY_ANATOMY_DEFINITIONS,
  attachOverviewSectionsToOverviewTab,
  type CaseTypeAnatomyDefinition,
  type EffectiveCaseTypeAnatomy,
  type EffectiveEntityAnatomy,
  type EntityAnatomySection,
  type EntityAnatomyTab,
} from './entityAnatomy';
import type { CaseKind, ClaimSubType, DataSourceSettings, WorkObjectKind } from './objectRefs';
import type { AnatomySettings } from '../contexts/PlatformSettingsContext';
import type { WorkflowDefinition } from './workflows';
import { getPrimaryWorkflowDefinition, getWorkflowDefinition, workflowTemplateIdForClaim } from './workflows';

export type CaseAnatomyTabOverride = NonNullable<AnatomySettings['caseTypeAnatomyOverrides'][string]['tabs']>[number];

export type ResolvedCaseAnatomyTab = EntityAnatomyTab & {
  enabled: boolean;
  isUtility: boolean;
};

export function isEntityEnabled(settings: DataSourceSettings, kind: WorkObjectKind): boolean {
  return settings.enabledObjectDomains.includes(kind);
}

export function isBusinessLineEnabled(settings: DataSourceSettings, kind: CaseKind): boolean {
  return settings.enabledWorkflows.includes(kind);
}

export function getEntityAnatomy(kind: WorkObjectKind) {
  const definition = ENTITY_ANATOMY_DEFINITIONS.find((item) => item.kind === kind);
  return definition ? attachOverviewSectionsToOverviewTab(definition) : undefined;
}

export function getCaseTypeAnatomy(caseKind: CaseKind | string | undefined) {
  const definition = CASE_TYPE_ANATOMY_DEFINITIONS.find((item) => item.caseKind === caseKind);
  return definition ? attachOverviewSectionsToOverviewTab(definition) : undefined;
}

/**
 * Merges the shared Case entity shell (overview + utility tabs) with a business-line
 * case-type definition so configuration and runtime see one ordered tab model.
 */
export function mergeCaseShellWithCaseType(caseKind: CaseKind | string | undefined): CaseTypeAnatomyDefinition | undefined {
  const entityCase = getEntityAnatomy('case');
  const caseType = CASE_TYPE_ANATOMY_DEFINITIONS.find((item) => item.caseKind === caseKind);
  if (!entityCase) {
    return caseType ? attachOverviewSectionsToOverviewTab(caseType) : undefined;
  }
  if (!caseType) {
    const shell = attachOverviewSectionsToOverviewTab(entityCase);
    return {
      caseKind: String(caseKind ?? 'case'),
      requiredMainEntityLinks: ['client', 'policy'],
      headerFields: shell.headerFields,
      identificationFields: shell.identificationFields ?? shell.headerFields,
      overviewSections: shell.overviewSections,
      tabs: shell.tabs as CaseTypeAnatomyDefinition['tabs'],
      lifecycleOutputs: ['task', 'requirement', 'document', 'communication'],
      actions: shell.actions,
    };
  }
  const entityWithOverview = attachOverviewSectionsToOverviewTab(entityCase);
  const caseTypeAttached = attachOverviewSectionsToOverviewTab(caseType);

  const mergedOverviewSections: EntityAnatomySection[] = [
    ...caseTypeAttached.overviewSections,
    ...entityWithOverview.overviewSections.filter(
      (section) => !caseTypeAttached.overviewSections.some((candidate) => candidate.id === section.id),
    ),
  ];

  const tabMap = new Map<string, EntityAnatomyTab>();
  for (const tab of entityWithOverview.tabs) {
    if (tab.id === 'overview') {
      tabMap.set(tab.id, { ...tab, sections: mergedOverviewSections });
    } else {
      tabMap.set(tab.id, { ...tab });
    }
  }
  for (const tab of caseTypeAttached.tabs) {
    if (!tabMap.has(tab.id)) {
      tabMap.set(tab.id, { ...tab });
    }
  }

  const orderedIds = [
    ...new Set([...entityWithOverview.tabs.map((tab) => tab.id), ...caseTypeAttached.tabs.map((tab) => tab.id)]),
  ];
  const mergedTabs = orderedIds.map((id) => tabMap.get(id)).filter((tab): tab is EntityAnatomyTab => Boolean(tab));

  return {
    ...caseTypeAttached,
    overviewSections: mergedOverviewSections,
    tabs: mergedTabs as CaseTypeAnatomyDefinition['tabs'],
  };
}

function resolveCaseTabsWithDomainsAndOverrides(
  tabs: CaseTypeAnatomyDefinition['tabs'],
  overrides: CaseAnatomyTabOverride[] | undefined,
  enabledDomains: WorkObjectKind[] | undefined,
): ResolvedCaseAnatomyTab[] {
  return tabs.map((tab) => {
    const override = overrides?.find((item) => item.id === tab.id);
    const isUtility = Boolean(tab.utilityEntity);
    const domainOk =
      !tab.utilityEntity || enabledDomains === undefined || enabledDomains.includes(tab.utilityEntity);
    const enabled = isUtility
      ? Boolean(tab.defaultEnabled && domainOk)
      : Boolean(override?.enabled ?? tab.defaultEnabled);
    return {
      ...tab,
      label: override?.label ?? tab.label,
      sections: override?.sections ?? tab.sections,
      defaultEnabled: tab.defaultEnabled,
      enabled,
      isUtility,
    };
  });
}

function applyTabOverrides(tabs: EntityAnatomyTab[], overrides?: Array<{ id: string; label?: string; enabled?: boolean; sections?: EntityAnatomySection[] }>) {
  if (!overrides?.length) return tabs;
  return tabs
    .map((tab) => {
      const override = overrides.find((item) => item.id === tab.id);
      if (!override) return tab;
      return {
        ...tab,
        label: override.label ?? tab.label,
        defaultEnabled: override.enabled ?? tab.defaultEnabled,
        sections: override.sections ?? tab.sections,
      };
    })
    .filter((tab) => tab.defaultEnabled);
}

export function resolveEffectiveEntityAnatomy(kind: WorkObjectKind, anatomy?: AnatomySettings): EffectiveEntityAnatomy | undefined {
  const definition = getEntityAnatomy(kind);
  if (!definition) return undefined;
  const override = anatomy?.entityAnatomyOverrides[kind];
  return {
    ...definition,
    identificationFields: override?.identificationFields ?? definition.identificationFields ?? definition.headerFields,
    tabs: applyTabOverrides(definition.tabs, override?.tabs),
  };
}

export type CaseAnatomySettingsBundle = EffectiveCaseTypeAnatomy & { tabsResolved: ResolvedCaseAnatomyTab[] };

/** Single bundle for Data settings and runtime: workflow + merged anatomy for a business line. */
export type CaseTypeForSettings = {
  caseKind: CaseKind;
  workflow: WorkflowDefinition;
  anatomy: CaseAnatomySettingsBundle;
  requiredMainEntityLinks: WorkObjectKind[];
};

/**
 * Resolves workflow and anatomy together so configuration UIs and CaseView stay aligned.
 * For `claim`, pass `claimSubType` to preview the death-benefit vs disability-benefit workflow template.
 */
export function resolveCaseTypeForSettings(
  caseKind: CaseKind,
  anatomy: AnatomySettings | undefined,
  enabledDomains: WorkObjectKind[] | undefined,
  options?: { claimSubType?: ClaimSubType | null },
): CaseTypeForSettings | undefined {
  const merged = mergeCaseShellWithCaseType(caseKind);
  if (!merged) return undefined;
  const anatomyBundle = resolveCaseAnatomyForSettings(caseKind, anatomy, enabledDomains);
  if (!anatomyBundle) return undefined;

  let workflow = getPrimaryWorkflowDefinition(caseKind);
  if (caseKind === 'claim' && options?.claimSubType != null) {
    const templateId = workflowTemplateIdForClaim(options.claimSubType);
    const alt = getWorkflowDefinition(templateId);
    if (alt) workflow = alt;
  }

  return {
    caseKind,
    workflow,
    anatomy: anatomyBundle,
    requiredMainEntityLinks: merged.requiredMainEntityLinks,
  };
}

export function resolveCaseAnatomyForSettings(
  caseKind: CaseKind | string | undefined,
  anatomy: AnatomySettings | undefined,
  enabledDomains: WorkObjectKind[] | undefined,
): CaseAnatomySettingsBundle | undefined {
  const definition = mergeCaseShellWithCaseType(caseKind);
  if (!definition) return undefined;
  const override = anatomy?.caseTypeAnatomyOverrides[String(caseKind)];
  const tabsResolved = resolveCaseTabsWithDomainsAndOverrides(definition.tabs, override?.tabs, enabledDomains);
  return {
    ...definition,
    identificationFields: override?.identificationFields ?? definition.identificationFields ?? definition.headerFields,
    overviewSections: definition.overviewSections,
    tabs: tabsResolved.filter((tab) => tab.enabled) as EffectiveCaseTypeAnatomy['tabs'],
    tabsResolved,
  };
}

export function buildContentTabOverridesForKind(
  kind: CaseKind | string,
  anatomy: AnatomySettings,
  contentTabEdits: Partial<Record<CaseKind, Record<string, boolean>>>,
): CaseAnatomyTabOverride[] {
  const merged = mergeCaseShellWithCaseType(kind);
  if (!merged) return [];
  const persistedTabs = anatomy.caseTypeAnatomyOverrides[String(kind)]?.tabs ?? [];
  const persistedById = new Map(persistedTabs.map((tab) => [tab.id, tab]));
  return merged.tabs
    .filter((tab) => !tab.utilityEntity)
    .map((tab) => {
      const persisted = persistedById.get(tab.id);
      const edited = contentTabEdits[kind as CaseKind]?.[tab.id];
      return {
        id: tab.id,
        label: persisted?.label ?? tab.label,
        enabled: edited !== undefined ? edited : (persisted?.enabled ?? tab.defaultEnabled),
        sections: persisted?.sections,
      };
    });
}

export function resolveEffectiveCaseTypeAnatomy(
  caseKind: CaseKind | string | undefined,
  anatomy?: AnatomySettings,
  enabledDomains?: WorkObjectKind[],
): EffectiveCaseTypeAnatomy | undefined {
  const merged = mergeCaseShellWithCaseType(caseKind);
  if (!merged) return undefined;
  const override = anatomy?.caseTypeAnatomyOverrides[String(caseKind)];
  const tabsResolved = resolveCaseTabsWithDomainsAndOverrides(merged.tabs, override?.tabs, enabledDomains);
  const overviewTab = tabsResolved.find((tab) => tab.id === 'overview');
  const overviewSections = overviewTab?.sections?.length ? overviewTab.sections : merged.overviewSections;

  return {
    ...merged,
    identificationFields: override?.identificationFields ?? merged.identificationFields ?? merged.headerFields,
    overviewSections,
    tabs: tabsResolved.filter((tab) => tab.enabled) as EffectiveCaseTypeAnatomy['tabs'],
  };
}
