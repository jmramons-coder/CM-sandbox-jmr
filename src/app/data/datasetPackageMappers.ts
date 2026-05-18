import type { WorkObjectKind } from '../domain/objectRefs';
import { findRelationshipIssues } from '../domain/dataArchitecture';
import type { AmplifyDatasetPackage, PackageObjectRef } from './datasetPackageSchema';
import type { SystemDataset } from './multi-case-dataset';
import { SYSTEM_DATASET_SCHEMA_VERSION } from './generatedDatasetRepository';

const DATASET_PACKAGE_DOMAIN_ORDER: WorkObjectKind[] = [
  'client',
  'policy',
  'agent',
  'application',
  'case',
  'task',
  'document',
  'request',
  'requirement',
  'communication',
  'note',
  'event',
];

function getDatasetPackageEntityKey(kind: WorkObjectKind) {
  if (kind === 'policy') return 'policies';
  if (kind === 'case') return 'cases';
  if (kind === 'event') return 'events';
  if (kind === 'application') return 'applications';
  if (kind === 'note') return 'notes';
  return `${kind}s`;
}

export function datasetFromPackage(datasetPackage: AmplifyDatasetPackage): SystemDataset {
  const businessLines = Array.from(new Set(datasetPackage.entities.cases.map((item) => item.caseKind)));
  return {
    id: datasetPackage.environment.id,
    schemaVersion: SYSTEM_DATASET_SCHEMA_VERSION,
    label: `${datasetPackage.environment.organizationLabel} context`,
    description: `${datasetPackage.environment.market} ${datasetPackage.environment.businessModel} generated data context.`,
    organizationLabel: datasetPackage.environment.organizationLabel,
    environmentFit: `${datasetPackage.environment.market} - ${datasetPackage.environment.historyRange}`,
    enabledBusinessLines: businessLines,
    targetRecordCount: Object.values(datasetPackage.entities).reduce((total, rows) => total + (Array.isArray(rows) ? rows.length : 0), 0),
    documentMode: datasetPackage.environment.documentMode,
    objectDomains: DATASET_PACKAGE_DOMAIN_ORDER.filter((kind) => {
      const key = getDatasetPackageEntityKey(kind);
      return Array.isArray((datasetPackage.entities as unknown as Record<string, unknown[]>)[key]);
    }),
    cases: datasetPackage.entities.cases,
    clients: datasetPackage.entities.clients,
    policies: datasetPackage.entities.policies,
    agents: datasetPackage.entities.agents,
    applications: datasetPackage.entities.applications ?? [],
    tasks: datasetPackage.entities.tasks,
    requirements: datasetPackage.entities.requirements,
    documents: datasetPackage.entities.documents,
    requests: datasetPackage.entities.requests,
    communications: datasetPackage.entities.communications,
    notes: datasetPackage.entities.notes ?? [],
    activityEvents: datasetPackage.entities.events,
    documentEvidence: datasetPackage.entities.documentEvidence ?? [],
    assistantResponses: datasetPackage.entities.assistantResponses ?? [],
    aiActions: datasetPackage.entities.aiActions ?? [],
  };
}

export function packageFromDataset(dataset: SystemDataset): AmplifyDatasetPackage {
  const relationshipIssues = findRelationshipIssues(dataset);
  const validation = {
    valid: relationshipIssues.length === 0,
    errors: relationshipIssues.map((issue) => issue.message),
    warnings: [],
  };
  const relationshipKeys = new Set<string>();
  const relationships: AmplifyDatasetPackage['relationships'] = [];
  const pushRelationship = (
    source: PackageObjectRef,
    target: PackageObjectRef,
    relationship = target.role ?? 'linked entity',
  ) => {
    const key = `${source.kind}:${source.id}->${target.kind}:${target.id}:${relationship}`;
    if (relationshipKeys.has(key)) return;
    relationshipKeys.add(key);
    relationships.push({
      id: key.replace(/[^a-zA-Z0-9-]+/g, '-'),
      source,
      target,
      relationship,
    });
  };

  dataset.cases.forEach((source) => {
    const sourceRef = { kind: 'case' as const, id: source.id, label: source.title };
    [source.primaryParty, ...source.participants, ...source.linkedObjects].forEach((target) => pushRelationship(sourceRef, target));
  });
  dataset.policies.forEach((source) => {
    const sourceRef = { kind: 'policy' as const, id: source.id, label: source.label };
    [
      ...source.linkedObjects,
      ...source.agents,
      ...source.participants.map((participant) => ({ kind: 'client' as const, id: participant.clientId, role: participant.role })),
    ].forEach((target) => pushRelationship(sourceRef, target));
  });
  dataset.applications.forEach((source) => {
    pushRelationship(
      { kind: 'application' as const, id: source.id, label: source.label },
      { kind: 'client' as const, id: source.clientId },
      'applicant',
    );
  });
  [
    ...dataset.agents,
    ...dataset.tasks,
    ...dataset.requirements,
    ...dataset.documents,
    ...dataset.requests,
    ...dataset.communications,
    ...dataset.notes,
    ...dataset.activityEvents,
    ...dataset.documentEvidence.map((source) => ({
      ...source,
      kind: 'document_evidence' as const,
      label: source.title,
      linkedObjects: [{ kind: 'document' as const, id: source.documentId, label: source.title }, ...source.linkedObjects],
    })),
    ...dataset.assistantResponses.map((source) => ({
      ...source,
      kind: 'assistant_response' as const,
      label: source.prompt,
    })),
    ...dataset.aiActions.map((source) => ({
      ...source,
      label: source.title,
    })),
  ].forEach((source) => {
    const sourceRef: PackageObjectRef = { kind: source.kind, id: source.id, label: 'label' in source ? source.label : source.id };
    source.linkedObjects.forEach((target) => pushRelationship(sourceRef, target));
  });
  return {
    version: '1.0',
    environment: {
      id: dataset.id,
      organizationLabel: dataset.organizationLabel ?? dataset.label,
      market: dataset.environmentFit ?? 'Generated context',
      businessModel: 'platform_demo',
      historyRange: 'N/A',
      documentMode: dataset.documentMode ?? 'metadata_only',
    },
    entities: {
      clients: dataset.clients,
      policies: dataset.policies,
      agents: dataset.agents,
      applications: dataset.applications,
      cases: dataset.cases,
      tasks: dataset.tasks,
      documents: dataset.documents,
      requests: dataset.requests,
      requirements: dataset.requirements,
      communications: dataset.communications,
      notes: dataset.notes,
      events: dataset.activityEvents,
      documentEvidence: dataset.documentEvidence,
      assistantResponses: dataset.assistantResponses,
      aiActions: dataset.aiActions,
    },
    relationships,
    validation,
  };
}
