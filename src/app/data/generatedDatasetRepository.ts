import type { SystemDataset } from './multi-case-dataset';
import { findRelationshipIssues } from '../domain/dataArchitecture';
import { resolveClaimSubType } from '../domain/claimSubTypes';
import { validateSystemDataset } from './dataQualityGuards';
import { normalizeCaseStructure } from './caseStructure';

const GENERATED_DATASETS_KEY = 'amplify-generated-datasets';
export const GENERATED_DATASETS_STORAGE_VERSION = 1;
export const SYSTEM_DATASET_SCHEMA_VERSION = 6;

const LEGACY_NB_STEP_IDS: Record<string, string> = {
  'completeness-check': 'initial-review',
  'advisor-clarification': 'requirement-gathering',
  'submit-underwriting': 'underwriting-review',
};

function migrateNewBusinessWorkflowRecords(dataset: SystemDataset): SystemDataset {
  const mapStepId = (id: string | undefined) => {
    if (!id) return id;
    return LEGACY_NB_STEP_IDS[id] ?? id;
  };
  const mapNbPhaseId = (phaseId: string | undefined) => {
    if (phaseId === 'validation' || phaseId === 'submission') return 'pre-approval';
    return phaseId;
  };
  const cases = (dataset.cases ?? []).map((caseRecord) => {
    if (caseRecord.caseKind !== 'new_business' || caseRecord.workflowTemplateId !== 'new-business-application') {
      return caseRecord;
    }
    return {
      ...caseRecord,
      phaseId: mapNbPhaseId(caseRecord.phaseId),
      activeStepId: mapStepId(caseRecord.activeStepId) ?? caseRecord.activeStepId,
    };
  });
  const caseById = new Map(cases.map((c) => [c.id, c]));
  const requirements = (dataset.requirements ?? []).map((requirement) => {
    const caseId = requirement.linkedObjects?.find((ref) => ref.kind === 'case')?.id;
    const linkedCase = caseId ? caseById.get(caseId) : undefined;
    if (linkedCase?.caseKind !== 'new_business') return requirement;
    const nextStepId = mapStepId(requirement.workflowStepId);
    if (nextStepId === requirement.workflowStepId) return requirement;
    return { ...requirement, workflowStepId: nextStepId };
  });
  return { ...dataset, cases, requirements };
}

const DEATH_CLAIM_STEP_IDS = new Set(['fnol', 'initial-review', 'requirement-gathering', 'decision']);

const LEGACY_DEATH_STEP_FROM_IP: Record<string, string> = {
  fnol: 'fnol',
  triage: 'initial-review',
  requirements: 'requirement-gathering',
  'requirement-gathering': 'requirement-gathering',
  'initial-review': 'initial-review',
  'medical-review': 'requirement-gathering',
  decision: 'decision',
  restoration: 'decision',
  monitoring: 'decision',
  closure: 'decision',
};

function isDeathClaimRecord(caseRecord: SystemDataset['cases'][number]): boolean {
  return (
    caseRecord.caseKind === 'claim' &&
    (caseRecord.caseTypeCode?.toUpperCase() === 'DTH' || caseRecord.claimDetails?.claimSubType === 'death')
  );
}

function migrateDeathClaimWorkflowRecords(dataset: SystemDataset): SystemDataset {
  const normalizeDeathActiveStepId = (id: string | undefined) => {
    const mapped = id ? LEGACY_DEATH_STEP_FROM_IP[id] ?? id : 'requirement-gathering';
    return DEATH_CLAIM_STEP_IDS.has(mapped) ? mapped : 'requirement-gathering';
  };
  const cases = dataset.cases.map((caseRecord) => {
    if (!isDeathClaimRecord(caseRecord)) return caseRecord;
    return {
      ...caseRecord,
      workflowTemplateId: 'claim-death-benefit',
      phaseId:
        caseRecord.phaseId === 'post-approval'
          ? 'post-approval'
          : caseRecord.phaseId === 'intake'
            ? 'intake'
            : 'pre-approval',
      activeStepId: normalizeDeathActiveStepId(caseRecord.activeStepId),
    };
  });
  const caseById = new Map(cases.map((c) => [c.id, c]));
  const requirements = (dataset.requirements ?? []).map((requirement) => {
    const caseId = requirement.linkedObjects?.find((ref) => ref.kind === 'case')?.id;
    const linkedCase = caseId ? caseById.get(caseId) : undefined;
    if (!linkedCase || !isDeathClaimRecord(linkedCase)) return requirement;
    const next = normalizeDeathActiveStepId(requirement.workflowStepId);
    if (next === requirement.workflowStepId) return requirement;
    return { ...requirement, workflowStepId: next };
  });
  return { ...dataset, cases, requirements };
}

type GeneratedDatasetsPayload = {
  version: number;
  datasets: SystemDataset[];
};

function isSystemDataset(value: unknown): value is SystemDataset {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<SystemDataset>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.label === 'string' &&
    Array.isArray(candidate.cases) &&
    Array.isArray(candidate.clients) &&
    Array.isArray(candidate.policies)
  );
}

export function migrateSystemDataset(dataset: SystemDataset): SystemDataset {
  const requirements = dataset.requirements ?? [];
  const documents = (dataset.documents ?? []).map((document) => {
    const existingLinkedObjects = document.linkedObjects ?? [];
    const linkedCaseId = document.linkedCaseId ?? existingLinkedObjects.find((ref) => ref.kind === 'case')?.id ?? document.linkedCase;
    const linkedRequirementId =
      document.linkedRequirementId ??
      existingLinkedObjects.find((ref) => ref.kind === 'requirement')?.id ??
      requirements.find((requirement) => requirement.label === document.linkedRequirement)?.id;
    const linkedObjects = [
      ...existingLinkedObjects,
      ...(linkedCaseId && !existingLinkedObjects.some((ref) => ref.kind === 'case' && ref.id === linkedCaseId)
        ? [{ kind: 'case' as const, id: linkedCaseId, label: document.linkedCase ?? linkedCaseId }]
        : []),
      ...(linkedRequirementId && !existingLinkedObjects.some((ref) => ref.kind === 'requirement' && ref.id === linkedRequirementId)
        ? [{ kind: 'requirement' as const, id: linkedRequirementId, label: document.linkedRequirement ?? linkedRequirementId }]
        : []),
    ];
    return {
      ...document,
      linkedCaseId,
      linkedRequirementId,
      linkedObjects,
    };
  });
  const normalized: SystemDataset = {
    ...dataset,
    schemaVersion: SYSTEM_DATASET_SCHEMA_VERSION,
    applications: dataset.applications ?? [],
    notes: dataset.notes ?? [],
    documentEvidence: dataset.documentEvidence ?? [],
    assistantResponses: dataset.assistantResponses ?? [],
    aiActions: dataset.aiActions ?? [],
    activityEvents: dataset.activityEvents ?? [],
    cases: (dataset.cases ?? []).map((caseRecord) => {
      const withAssignee = {
        ...caseRecord,
        assignee: caseRecord.assignee ?? caseRecord.owner,
      };
      if (withAssignee.caseKind !== 'claim') return withAssignee;
      const cd = withAssignee.claimDetails ?? {};
      const claimSubType = cd.claimSubType ?? resolveClaimSubType(withAssignee);
      return {
        ...withAssignee,
        claimDetails: { ...cd, claimSubType },
      };
    }),
    documents,
    tasks: (dataset.tasks ?? []).map((task) => ({
      ...task,
      assignee: task.assignee ?? task.owner ?? 'Unassigned',
    })),
  };
  const migratedNb = migrateNewBusinessWorkflowRecords(normalized);
  const migratedDeath = migrateDeathClaimWorkflowRecords(migratedNb);
  return {
    ...migratedDeath,
    cases: migratedDeath.cases.map((caseRecord) => normalizeCaseStructure(caseRecord, migratedDeath)),
  };
}

function assertValidGeneratedDataset(dataset: SystemDataset): SystemDataset {
  const normalized = migrateSystemDataset(dataset);
  const validation = validateSystemDataset(normalized);
  const relationshipIssues = findRelationshipIssues(normalized);
  if (!normalized.id || !normalized.label || !normalized.cases || !normalized.clients || !normalized.policies) {
    throw new Error('Generated dataset is missing required identity or entity arrays.');
  }
  if (validation.errors.length) {
    throw new Error(`Generated dataset ${normalized.id} failed schema validation: ${validation.errors.join(' ')}`);
  }
  if (relationshipIssues.length) {
    throw new Error(`Generated dataset ${normalized.id} failed relationship validation: ${relationshipIssues.map((issue) => issue.message).join(' ')}`);
  }
  return normalized;
}

function readGeneratedDatasets(): SystemDataset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(GENERATED_DATASETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const rows = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === 'object' && Array.isArray((parsed as Partial<GeneratedDatasetsPayload>).datasets)
        ? (parsed as Partial<GeneratedDatasetsPayload>).datasets
        : [];
    return rows.filter(isSystemDataset).map(migrateSystemDataset);
  } catch {
    return [];
  }
}

function writeGeneratedDatasets(datasets: SystemDataset[]) {
  if (typeof window === 'undefined') return;
  const payload: GeneratedDatasetsPayload = {
    version: GENERATED_DATASETS_STORAGE_VERSION,
    datasets,
  };
  window.localStorage.setItem(GENERATED_DATASETS_KEY, JSON.stringify(payload));
}

export const generatedDatasetRepository = {
  list(): SystemDataset[] {
    return readGeneratedDatasets();
  },
  save(dataset: SystemDataset): SystemDataset[] {
    const current = readGeneratedDatasets();
    const normalized = assertValidGeneratedDataset(dataset);
    const next = [normalized, ...current.filter((item) => item.id !== normalized.id)];
    writeGeneratedDatasets(next);
    return next;
  },
  delete(datasetId: string): SystemDataset[] {
    const next = readGeneratedDatasets().filter((item) => item.id !== datasetId);
    writeGeneratedDatasets(next);
    return next;
  },
  duplicate(datasetId: string): SystemDataset[] {
    const current = readGeneratedDatasets();
    const source = current.find((item) => item.id === datasetId);
    if (!source) return current;
    const copy: SystemDataset = {
      ...structuredClone(source),
      id: `${source.id}-copy-${Date.now()}`,
      label: `${source.label} copy`,
      description: source.description,
    };
    const next = [assertValidGeneratedDataset(copy), ...current];
    writeGeneratedDatasets(next);
    return next;
  },
  storageVersion: GENERATED_DATASETS_STORAGE_VERSION,
};
