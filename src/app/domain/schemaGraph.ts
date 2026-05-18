import type { SystemDataset } from '../data/multi-case-dataset';
import { projectCaseRecordForCatalogRow } from './claimSubTypes';
import {
  ENTITY_SCHEMA_DEFINITIONS,
  IMPORT_TARGETS,
  OBJECT_RELATIONSHIPS,
  type CatalogObjectKind,
  type EntitySchemaCategory,
  type EntitySchemaDefinition,
  type ImportTargetDefinition,
  type ObjectRelationshipDefinition,
  type RelationshipIssue,
} from './dataArchitecture';

export type SchemaGraphNodeGroup = 'core' | 'work' | 'audit' | 'intelligence';

export type SchemaGraphNode = {
  id: CatalogObjectKind;
  schema: EntitySchemaDefinition;
  group: SchemaGraphNodeGroup;
  recordCount: number;
  issueCount: number;
  fieldCount: number;
  populatedFieldCount: number;
  importTarget?: ImportTargetDefinition;
  defaultPosition: { x: number; y: number };
};

export type SchemaGraphEdge = {
  id: string;
  relationship: ObjectRelationshipDefinition;
  source: CatalogObjectKind;
  target: CatalogObjectKind;
  issueCount: number;
};

export type SchemaGraph = {
  nodes: SchemaGraphNode[];
  edges: SchemaGraphEdge[];
};

export function getDatasetRowsForKind(dataset: SystemDataset, kind: CatalogObjectKind): Array<Record<string, unknown>> {
  switch (kind) {
    case 'case':
      return dataset.cases.map(projectCaseRecordForCatalogRow);
    case 'client':
      return dataset.clients as unknown as Array<Record<string, unknown>>;
    case 'policy':
      return dataset.policies as unknown as Array<Record<string, unknown>>;
    case 'agent':
      return dataset.agents as unknown as Array<Record<string, unknown>>;
    case 'application':
      return dataset.applications as unknown as Array<Record<string, unknown>>;
    case 'requirement':
      return dataset.requirements as unknown as Array<Record<string, unknown>>;
    case 'task':
      return dataset.tasks as unknown as Array<Record<string, unknown>>;
    case 'request':
      return dataset.requests as unknown as Array<Record<string, unknown>>;
    case 'document':
      return dataset.documents as unknown as Array<Record<string, unknown>>;
    case 'communication':
      return dataset.communications as unknown as Array<Record<string, unknown>>;
    case 'note':
      return dataset.notes as unknown as Array<Record<string, unknown>>;
    case 'event':
      return dataset.activityEvents as unknown as Array<Record<string, unknown>>;
    case 'document_evidence':
      return dataset.documentEvidence as unknown as Array<Record<string, unknown>>;
    case 'assistant_response':
      return dataset.assistantResponses as unknown as Array<Record<string, unknown>>;
    case 'ai_action':
      return dataset.aiActions as unknown as Array<Record<string, unknown>>;
    default:
      return [];
  }
}

function graphGroup(category: EntitySchemaCategory, kind: CatalogObjectKind): SchemaGraphNodeGroup {
  if (kind === 'document_evidence' || kind === 'assistant_response' || kind === 'ai_action') return 'intelligence';
  if (category === 'audit') return 'audit';
  if (category === 'work') return 'work';
  return 'core';
}

const DEFAULT_SCHEMA_POSITIONS: Partial<Record<CatalogObjectKind, { x: number; y: number }>> = {
  client: { x: 64, y: 96 },
  policy: { x: 64, y: 244 },
  agent: { x: 64, y: 392 },
  application: { x: 284, y: 500 },
  case: { x: 314, y: 250 },
  requirement: { x: 560, y: 86 },
  task: { x: 560, y: 208 },
  request: { x: 560, y: 330 },
  document: { x: 560, y: 452 },
  communication: { x: 790, y: 150 },
  event: { x: 790, y: 286 },
  note: { x: 790, y: 422 },
  assistant_response: { x: 960, y: 96 },
  ai_action: { x: 960, y: 250 },
  document_evidence: { x: 960, y: 452 },
};

const FALLBACK_GROUP_X: Record<SchemaGraphNodeGroup, number> = {
  core: 80,
  work: 560,
  audit: 790,
  intelligence: 960,
};

const FALLBACK_GROUP_Y: Record<SchemaGraphNodeGroup, number> = {
  core: 90,
  work: 90,
  audit: 120,
  intelligence: 120,
};

export function getSchemaFieldCoverage(dataset: SystemDataset, schema: EntitySchemaDefinition) {
  const rows = getDatasetRowsForKind(dataset, schema.kind);
  const populatedFieldCount = schema.fields.filter((field) =>
    rows.some((row) => {
      const value = row[field.name];
      return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== '';
    }),
  ).length;
  return { supported: schema.fields.length, populated: populatedFieldCount };
}

export function buildSchemaGraph({
  dataset,
  relationshipIssues,
}: {
  dataset: SystemDataset;
  relationshipIssues: RelationshipIssue[];
}): SchemaGraph {
  const groupIndexes: Record<SchemaGraphNodeGroup, number> = {
    core: 0,
    work: 0,
    audit: 0,
    intelligence: 0,
  };

  const nodes = ENTITY_SCHEMA_DEFINITIONS.map((schema): SchemaGraphNode => {
    const group = graphGroup(schema.category, schema.kind);
    const index = groupIndexes[group]++;
    const rows = getDatasetRowsForKind(dataset, schema.kind);
    const coverage = getSchemaFieldCoverage(dataset, schema);
    return {
      id: schema.kind,
      schema,
      group,
      recordCount: rows.length,
      issueCount: relationshipIssues.filter((issue) => issue.sourceKind === schema.kind || issue.targetKind === schema.kind).length,
      fieldCount: schema.fields.length,
      populatedFieldCount: coverage.populated,
      importTarget: IMPORT_TARGETS.find((target) => target.kind === schema.kind),
      defaultPosition: DEFAULT_SCHEMA_POSITIONS[schema.kind] ?? {
        x: FALLBACK_GROUP_X[group],
        y: FALLBACK_GROUP_Y[group] + index * 110,
      },
    };
  });

  const edges = OBJECT_RELATIONSHIPS.map((relationship): SchemaGraphEdge => ({
    id: relationship.id,
    relationship,
    source: relationship.source,
    target: relationship.target,
    issueCount: relationshipIssues.filter((issue) =>
      (issue.sourceKind === relationship.source && issue.targetKind === relationship.target) ||
      (issue.sourceKind === relationship.target && issue.targetKind === relationship.source),
    ).length,
  }));

  return { nodes, edges };
}
