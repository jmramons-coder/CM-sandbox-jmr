import { countDatasetObjects } from '../domain/dataArchitecture';
import { DEFAULT_DATASET_ID, type CaseKind } from '../domain/objectRefs';
import { generatedDatasetRepository } from './generatedDatasetRepository';
import { MULTI_CASE_DEMO_DATASET, SYSTEM_DATASETS, type SystemDataset } from './multi-case-dataset';
import type { DatasetMetadata } from './dataAdapters';
import { packageFromDataset } from './datasetPackageMappers';
import { normalizeCaseStructure } from './caseStructure';
import { applyDatasetEnvironmentSettings, setDatasetDisplayCurrency } from './datasetEnvironmentSettings';
import { mergeGiDemoEntities } from './gi-demo-entity-records';
import type { DisplayCurrency } from '../utils/currency';

export function normalizeDataset(dataset: SystemDataset): SystemDataset {
  const requirements = dataset.requirements ?? [];
  const normalized: SystemDataset = {
    ...dataset,
    objectDomains: dataset.objectDomains ?? [],
    enabledBusinessLines: dataset.enabledBusinessLines ?? [],
    cases: (dataset.cases ?? []).map((caseRecord) => ({
        ...caseRecord,
        assignee: caseRecord.assignee ?? caseRecord.owner,
        facts: caseRecord.facts ?? [],
        sections: caseRecord.sections ?? [],
        linkedObjects: caseRecord.linkedObjects ?? [],
        participants: caseRecord.participants ?? [],
        primaryParty: caseRecord.primaryParty ?? {
          kind: 'client',
          id: `${caseRecord.id}-party`,
          label: 'Unknown',
        },
      })),
    clients: dataset.clients ?? [],
    policies: (dataset.policies ?? []).map((policy) => ({
      ...policy,
      linkedObjects: policy.linkedObjects ?? [],
      agents: policy.agents ?? [],
    })),
    agents: (dataset.agents ?? []).map((agent) => ({
      ...agent,
      linkedObjects: agent.linkedObjects ?? [],
    })),
    applications: dataset.applications ?? [],
    tasks: (dataset.tasks ?? []).map((task) => ({
      ...task,
      assignee: task.assignee ?? task.owner ?? 'Unassigned',
      linkedObjects: task.linkedObjects ?? [],
    })),
    requirements: (dataset.requirements ?? []).map((requirement) => ({
      ...requirement,
      linkedObjects: requirement.linkedObjects ?? [],
    })),
    documents: (dataset.documents ?? []).map((document) => {
      const baseRefs = document.linkedObjects ?? [];
      const linkedCaseId = document.linkedCaseId ?? baseRefs.find((ref) => ref.kind === 'case')?.id ?? document.linkedCase;
      const linkedRequirementId =
        document.linkedRequirementId ??
        baseRefs.find((ref) => ref.kind === 'requirement')?.id ??
        requirements.find((requirement) => requirement.label === document.linkedRequirement)?.id;
      return {
        ...document,
        linkedCaseId,
        linkedRequirementId,
        linkedObjects: [
          ...baseRefs,
          ...(linkedCaseId && !baseRefs.some((ref) => ref.kind === 'case' && ref.id === linkedCaseId)
            ? [{ kind: 'case' as const, id: linkedCaseId, label: document.linkedCase ?? linkedCaseId }]
            : []),
          ...(linkedRequirementId && !baseRefs.some((ref) => ref.kind === 'requirement' && ref.id === linkedRequirementId)
            ? [{ kind: 'requirement' as const, id: linkedRequirementId, label: document.linkedRequirement ?? linkedRequirementId }]
            : []),
        ],
      };
    }),
    requests: (dataset.requests ?? []).map((request) => ({
      ...request,
      linkedObjects: request.linkedObjects ?? [],
    })),
    communications: (dataset.communications ?? []).map((row) => ({
      ...row,
      linkedObjects: row.linkedObjects ?? [],
    })),
    notes: (dataset.notes ?? []).map((row) => ({
      ...row,
      linkedObjects: row.linkedObjects ?? [],
    })),
    activityEvents: (dataset.activityEvents ?? []).map((row) => ({
      ...row,
      linkedObjects: row.linkedObjects ?? [],
    })),
    documentEvidence: (dataset.documentEvidence ?? []).map((row) => ({
      ...row,
      linkedObjects: row.linkedObjects ?? [],
    })),
    assistantResponses: (dataset.assistantResponses ?? []).map((row) => ({
      ...row,
      linkedObjects: row.linkedObjects ?? [],
    })),
    aiActions: (dataset.aiActions ?? []).map((row) => ({
      ...row,
      linkedObjects: row.linkedObjects ?? [],
    })),
  };
  return applyDatasetEnvironmentSettings(
    mergeGiDemoEntities({
      ...normalized,
      displayCurrency: normalized.displayCurrency ?? 'GBP',
      cases: normalized.cases.map((caseRecord) => normalizeCaseStructure(caseRecord, normalized)),
    }),
  );
}

function getByteSize(value: unknown): number {
  try {
    return new Blob([JSON.stringify(value)]).size;
  } catch {
    return JSON.stringify(value).length;
  }
}

export function getDatasetMetadata(dataset: SystemDataset, source: Pick<DatasetMetadata, 'storageKind' | 'sourceLabel' | 'readonly'>): DatasetMetadata {
  const counts = countDatasetObjects(dataset);
  return {
    id: dataset.id,
    label: dataset.label,
    description: dataset.description,
    organizationLabel: dataset.organizationLabel,
    storageKind: source.storageKind,
    sourceLabel: source.sourceLabel,
    readonly: source.readonly,
    recordCount: counts.total,
    caseCount: dataset.cases.length,
    caseTypeCount: new Set<CaseKind>(dataset.enabledBusinessLines ?? dataset.cases.map((item) => item.caseKind)).size,
    documentMode: dataset.documentMode,
    packageSizeBytes: getByteSize(dataset),
  };
}

export const datasetRegistry = {
  listDatasets(): SystemDataset[] {
    const generated = generatedDatasetRepository.list();
    return [...SYSTEM_DATASETS, ...generated].map(normalizeDataset);
  },
  listMetadata(): DatasetMetadata[] {
    return [
      ...SYSTEM_DATASETS.map((dataset) =>
        getDatasetMetadata(dataset, {
          storageKind: 'built_in',
          sourceLabel: 'Built-in',
          readonly: true,
        }),
      ),
      ...generatedDatasetRepository.list().map((dataset) =>
        getDatasetMetadata(dataset, {
          storageKind: 'generated',
          sourceLabel: 'Generated/imported',
          readonly: false,
        }),
      ),
    ];
  },
  getDataset(datasetId: string | undefined | null): SystemDataset {
    const requestedId = datasetId ?? DEFAULT_DATASET_ID;
    return this.listDatasets().find((dataset) => dataset.id === requestedId) ?? normalizeDataset(MULTI_CASE_DEMO_DATASET);
  },
  saveDataset(dataset: SystemDataset): SystemDataset[] {
    return generatedDatasetRepository.save(dataset);
  },
  deleteDataset(datasetId: string): SystemDataset[] {
    return generatedDatasetRepository.delete(datasetId);
  },
  duplicateDataset(datasetId: string): SystemDataset[] {
    const source = this.getDataset(datasetId);
    const base = generatedDatasetRepository.list().find((item) => item.id === datasetId) ?? source;
    const copy: SystemDataset = {
      ...structuredClone(base),
      id: `${datasetId}-copy-${Date.now()}`,
      label: `${source.label} copy`,
      description: source.description,
      displayCurrency: source.displayCurrency ?? 'GBP',
    };
    generatedDatasetRepository.save(copy);
    return this.listDatasets();
  },
  exportDataset(datasetId: string): string | null {
    const dataset = this.getDataset(datasetId);
    return dataset ? JSON.stringify(packageFromDataset(dataset), null, 2) : null;
  },
  updateDisplayCurrency(datasetId: string, displayCurrency: DisplayCurrency): SystemDataset[] {
    setDatasetDisplayCurrency(datasetId, displayCurrency);
    const isGenerated = generatedDatasetRepository.list().some((item) => item.id === datasetId);
    if (isGenerated) {
      const dataset = this.getDataset(datasetId);
      generatedDatasetRepository.save({ ...dataset, displayCurrency });
    }
    return this.listDatasets();
  },
};
