import { describe, expect, it, vi } from 'vitest';
import { filterDatasetBySettings, listActivityEvents, listAiActions, listCaseSummaries, listCommunications, listDocuments, listRequirements, listRequests, listTasks } from './objectRepository';
import { datasetFromPackage, packageFromDataset } from './datasetPackageMappers';
import { validateDatasetPackage } from './datasetPackageSchema';
import { DATASET_GENERATION_PROFILES, generateDatasetFromProfile } from './datasetGenerator';
import { SYSTEM_DATASETS } from './multi-case-dataset';
import { validateSystemDataset } from './dataQualityGuards';
import { DATASET_MUTATION_BOUNDARIES, FIRST_REAL_PERSISTENCE_ADAPTER } from './dataAdapters';
import { migrateSystemDataset, SYSTEM_DATASET_SCHEMA_VERSION } from './generatedDatasetRepository';
import { listCaseIntelligence } from '../domain/intelligenceMonitoring';
import { buildDataSettingsViewModel } from '../domain/dataSettingsViewModel';
import { buildSchemaGraph, getDatasetRowsForKind } from '../domain/schemaGraph';
import { createCase, createRequest, createTask, deleteEntity, linkObject } from './datasetMutations';
import { datasetRegistry } from './datasetRegistry';
import {
  resolveContextSupportCards,
  type TaskContextCardKind,
} from '../domain/utilityContextCards';
import { deriveHumanNet } from '../domain/scoring';
import { resolveObjectLocation, type DataSourceSettings } from '../domain/objectRefs';
import { getCaseOverview } from './mock-cases';
import type { AnatomySettings } from '../contexts/PlatformSettingsContext';
import { mergeCaseShellWithCaseType, resolveEffectiveCaseTypeAnatomy, resolveCaseTypeForSettings } from '../domain/runtimeDataConfig';
import enCommon from '../i18n/resources/en/common.json';
import frCommon from '../i18n/resources/fr/common.json';
import esCommon from '../i18n/resources/es/common.json';
import enFixtures from '../i18n/resources/en/fixtures.json';
import frFixtures from '../i18n/resources/fr/fixtures.json';
import esFixtures from '../i18n/resources/es/fixtures.json';
import enFolders from '../i18n/resources/en/folders.json';
import frFolders from '../i18n/resources/fr/folders.json';
import esFolders from '../i18n/resources/es/folders.json';
import enNav from '../i18n/resources/en/nav.json';
import frNav from '../i18n/resources/fr/nav.json';
import esNav from '../i18n/resources/es/nav.json';
import enSettings from '../i18n/resources/en/settings.json';
import frSettings from '../i18n/resources/fr/settings.json';
import esSettings from '../i18n/resources/es/settings.json';

function flattenKeys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => flattenKeys(child, prefix ? `${prefix}.${key}` : key));
}

function taskContextCardKinds(taskId: string): TaskContextCardKind[] {
  const dataset = SYSTEM_DATASETS[0];
  const task = listTasks(dataset).find((item) => item.id === taskId);
  expect(task).toBeTruthy();
  const caseRecord = dataset.cases.find((item) => item.id === task?.caseId);
  return resolveContextSupportCards({ anchor: { kind: 'task', id: taskId, task }, dataset, caseRecord }).map((card) => card.kind);
}

function requirementContextCardKinds(requirementId: string): TaskContextCardKind[] {
  const dataset = SYSTEM_DATASETS[0];
  const requirement = dataset.requirements.find((item) => item.id === requirementId);
  expect(requirement).toBeTruthy();
  const caseId = requirement?.linkedObjects.find((ref) => ref.kind === 'case')?.id;
  const caseRecord = dataset.cases.find((item) => item.id === caseId);
  return resolveContextSupportCards({ anchor: { kind: 'requirement', id: requirementId }, dataset, caseRecord }).map((card) => card.kind);
}

function documentContextCardKinds(documentId: string): TaskContextCardKind[] {
  const dataset = SYSTEM_DATASETS[0];
  const document = dataset.documents.find((item) => item.id === documentId);
  expect(document).toBeTruthy();
  const caseRecord = dataset.cases.find((item) => item.id === document?.linkedCaseId);
  return resolveContextSupportCards({ anchor: { kind: 'document', id: documentId }, dataset, caseRecord }).map((card) => card.kind);
}

function requestContextCardKinds(requestId: string): TaskContextCardKind[] {
  const dataset = SYSTEM_DATASETS[0];
  const request = dataset.requests.find((item) => item.id === requestId);
  expect(request).toBeTruthy();
  const caseId = request?.linkedObjects.find((ref) => ref.kind === 'case')?.id;
  const caseRecord = dataset.cases.find((item) => item.id === caseId);
  return resolveContextSupportCards({ anchor: { kind: 'request', id: requestId }, dataset, caseRecord }).map((card) => card.kind);
}

describe('dataset validation gates', () => {
  it('validates built-in system datasets', () => {
    SYSTEM_DATASETS.forEach((dataset) => {
      const validation = validateSystemDataset(dataset);
      expect(validation.errors).toEqual([]);
    });
  });

  it('roundtrips packages without losing optional intelligence records', () => {
    const dataset = SYSTEM_DATASETS[0];
    const datasetPackage = packageFromDataset(dataset);
    expect(validateDatasetPackage(datasetPackage).errors).toEqual([]);

    const roundtrip = datasetFromPackage(datasetPackage);
    expect(roundtrip.aiActions.length).toBe(dataset.aiActions.length);
    expect(roundtrip.assistantResponses.length).toBe(dataset.assistantResponses.length);
    expect(roundtrip.documentEvidence.length).toBe(dataset.documentEvidence.length);
    expect(validateSystemDataset(roundtrip).errors).toEqual([]);
  });

  it('roundtrips all built-in datasets with graph parity', () => {
    SYSTEM_DATASETS.forEach((dataset) => {
      const datasetPackage = packageFromDataset(dataset);
      const roundtrip = datasetFromPackage(datasetPackage);
      expect(validateDatasetPackage(datasetPackage).errors).toEqual([]);
      expect(packageFromDataset(roundtrip).relationships.length).toBe(datasetPackage.relationships.length);
      expect(roundtrip.documentEvidence.length).toBe(dataset.documentEvidence.length);
      expect(roundtrip.assistantResponses.length).toBe(dataset.assistantResponses.length);
      expect(roundtrip.aiActions.length).toBe(dataset.aiActions.length);
    });
  });

  it('keeps SBLI assistant responses linked to real case ids', () => {
    const dataset = SYSTEM_DATASETS[0];
    expect(dataset.assistantResponses.length).toBeGreaterThan(0);
    const caseIds = new Set(dataset.cases.map((row) => row.id));
    dataset.assistantResponses.forEach((response) => {
      response.linkedObjects
        .filter((ref) => ref.kind === 'case')
        .forEach((ref) => {
          expect(caseIds.has(ref.id)).toBe(true);
        });
    });
  });

  it('smoke-validates all generated dataset profiles', () => {
    DATASET_GENERATION_PROFILES.forEach((profile) => {
      const generated = generateDatasetFromProfile(profile);
      expect(validateSystemDataset(generated).errors).toEqual([]);
      expect(listCaseIntelligence(generated).length).toBeGreaterThan(0);
      expect(generated.documentEvidence.every((row) => row.pages.length && row.findings.length)).toBe(true);
      expect(generated.communications.every((row) => row.createdAt)).toBe(true);
      expect(generated.cases.filter((row) => row.caseKind === 'claim').every((row) => row.claimDetails)).toBe(true);
      expect(generated.cases.filter((row) => row.caseKind === 'agent_onboarding').every((row) => row.activeStepId === 'contracting')).toBe(true);
      expect(generated.cases.filter((row) => row.caseKind === 'agent_onboarding').every((row) => !row.linkedObjects.some((ref) => ref.kind === 'policy'))).toBe(true);
    });
  });

  it('does not leak hidden cases through optional intelligence arrays', () => {
    const dataset = SYSTEM_DATASETS[0];
    const hiddenCase = dataset.cases.find((row) => row.caseKind !== 'claim');
    expect(hiddenCase).toBeTruthy();

    const settings: DataSourceSettings = {
      mode: 'mock',
      connector: 'mock_json',
      activeDatasetId: dataset.id,
      displayCurrency: 'GBP',
      enabledObjectDomains: dataset.objectDomains,
      enabledWorkflows: ['claim'],
      legacyMockOverlayEnabled: false,
      resetBehavior: 'ui_only',
    };
    const filtered = filterDatasetBySettings(dataset, settings);

    expect(filtered.assistantResponses.some((row) => row.linkedObjects.some((ref) => ref.kind === 'case' && ref.id === hiddenCase?.id))).toBe(false);
    expect(filtered.documentEvidence.some((row) => row.linkedObjects.some((ref) => ref.kind === 'case' && ref.id === hiddenCase?.id))).toBe(false);
    expect(listAiActions(filtered).some((row) => row.linkedObjects.some((ref) => ref.kind === 'case' && ref.id === hiddenCase?.id))).toBe(false);
  });

  it('builds coherent case intelligence metrics', () => {
    const rows = listCaseIntelligence(SYSTEM_DATASETS[0]);
    const row = rows.find((item) => item.caseId === SYSTEM_DATASETS[0].cases[0]?.id);
    expect(row).toBeTruthy();
    expect(row?.metrics.aiActions).toBe(row?.aiActions.length);
    expect(row?.metrics.tasks).toBe(row?.tasks.length);
    expect(row?.metrics.requirements).toBe(row?.requirements.length);
    expect(row?.latestSignal).toBeTruthy();
  });

  it('builds a complete schema graph for the whiteboard', () => {
    const dataset = SYSTEM_DATASETS[0];
    const graph = buildSchemaGraph({ dataset, relationshipIssues: [] });
    const nodeIds = graph.nodes.map((node) => node.id);

    expect(nodeIds).toContain('application');
    expect(nodeIds).toContain('note');
    expect(nodeIds).toContain('document_evidence');
    expect(nodeIds).toContain('assistant_response');
    expect(nodeIds).toContain('ai_action');
    expect(graph.edges.length).toBeGreaterThan(0);
    expect(graph.nodes.find((node) => node.id === 'case')?.recordCount).toBe(dataset.cases.length);
    expect(graph.nodes.find((node) => node.id === 'document_evidence')?.recordCount).toBe(dataset.documentEvidence.length);
    expect(graph.edges.some((edge) => edge.source === 'requirement' && edge.target === 'document')).toBe(true);
  });

  it('lists dataset rows for all schema-backed record kinds', () => {
    const dataset = SYSTEM_DATASETS[0];

    expect(getDatasetRowsForKind(dataset, 'case').length).toBe(dataset.cases.length);
    const deathRow = getDatasetRowsForKind(dataset, 'case').find((row) => row.id === 'CD44-6679812');
    expect(deathRow?.claimSubType).toBe('death_benefit');
    expect(getDatasetRowsForKind(dataset, 'document_evidence').length).toBe(dataset.documentEvidence.length);
    expect(getDatasetRowsForKind(dataset, 'assistant_response').length).toBe(dataset.assistantResponses.length);
    expect(getDatasetRowsForKind(dataset, 'ai_action').length).toBe(dataset.aiActions.length);
  });

  it('resolves claim sub-types in summaries and catalog case rows', () => {
    const dataset = SYSTEM_DATASETS[0];
    const summaries = listCaseSummaries(dataset);
    expect(summaries.find((s) => s.id === 'CD44-6679812')?.claimSubType).toBe('death_benefit');
    expect(summaries.find((s) => s.id === 'CD26-5546112')?.claimSubType).toBe('waiver_of_premium');
  });

  it('uses the SBLI seed as the default built-in dataset', () => {
    const dataset = SYSTEM_DATASETS[0];
    const deferredArrays = [
      dataset.clients,
      dataset.policies,
      dataset.agents,
      dataset.applications,
      dataset.communications,
      dataset.notes,
      dataset.activityEvents,
      dataset.assistantResponses,
      dataset.aiActions,
    ];
    expect(dataset.cases.map((row) => row.id).sort()).toEqual([
      'CD26-5546112',
      'CD44-6679812',
      'NB66-7622343',
      'NB98-9989870',
    ]);
    expect(dataset.cases.some((row) => ['IP26-5546112', 'NB-100245', 'CS-450091', 'AG-ONB-1001'].includes(row.id))).toBe(false);
    expect(dataset.clients.length).toBeGreaterThan(0);
    expect(dataset.policies.length).toBeGreaterThan(0);
    expect(dataset.agents.length).toBeGreaterThan(0);
    expect(dataset.applications.length).toBeGreaterThan(0);
    expect(deferredArrays.filter((rows) => rows.length > 0).length).toBe(4);
    expect(dataset.objectDomains).toEqual([
      'case',
      'client',
      'policy',
      'agent',
      'application',
      'task',
      'requirement',
      'document',
      'request',
    ]);
    expect(dataset.tasks).toHaveLength(33);
    expect(dataset.documents).toHaveLength(18);
    expect(dataset.documentEvidence).toHaveLength(8);
    expect(dataset.requirements).toHaveLength(25);
    expect(dataset.requests).toHaveLength(6);
    expect(dataset.targetRecordCount).toBe(111);
    expect(dataset.legacyMockOverlayEnabled).toBe(false);
  });

  it('retains SBLI case AI summaries and exposes seeded utility read models', () => {
    const dataset = SYSTEM_DATASETS[0];
    const caseId = 'NB66-7622343';
    expect(dataset.cases.every((row) => row.analysis?.narrative && row.analysis.confidence)).toBe(true);
    expect(dataset.cases.every((row) => (row.generalInformation?.cards?.length ?? 0) >= 3)).toBe(true);
    expect(dataset.cases.every((row) => (row.generalInformation?.sections.length ?? 0) === 0)).toBe(true);
    expect(listCaseSummaries(dataset).find((row) => row.id === caseId)).toBeTruthy();
    expect(listTasks(dataset, { caseId }).length).toBe(8);
    expect(listDocuments(dataset, { caseId }).length).toBe(5);
    expect(listRequirements(dataset, caseId)).toHaveLength(7);
    expect(listCommunications(dataset, caseId)).toEqual([]);
    expect(listActivityEvents(dataset, caseId)).toEqual([]);
  });

  it('builds a stable data settings view model from registry metadata and active data', () => {
    const dataset = SYSTEM_DATASETS[0];
    const viewModel = buildDataSettingsViewModel({
      activeDataset: dataset,
      dataContexts: SYSTEM_DATASETS,
      registryMetadata: SYSTEM_DATASETS.map((item) => ({
        id: item.id,
        label: item.label,
        description: item.description,
        storageKind: 'built_in' as const,
        sourceLabel: 'Built-in',
        readonly: true,
        recordCount: 0,
        caseCount: 0,
        caseTypeCount: 0,
      })),
    });

    expect(viewModel.counts.total).toBeGreaterThan(0);
    expect(viewModel.datasetMetadata.some((metadata) => metadata.id === dataset.id && metadata.sourceLabel === 'Built-in')).toBe(true);
    expect(viewModel.schemaGraph.nodes.some((node) => node.id === 'case')).toBe(true);
    expect(viewModel.systemValidation.errors).toEqual([]);
  });

  it('links every seeded task evidence reference to a document record', () => {
    const dataset = SYSTEM_DATASETS[0];
    const documentIds = new Set(dataset.documents.map((row) => row.id));
    const aiTasks = dataset.tasks.filter((row) => row.aiNarrative);
    expect(aiTasks.length).toBeGreaterThan(0);
    const richTasks = dataset.tasks.filter((task) => task.summary || task.actions?.length || task.evidenceDocuments?.length || task.contextCards?.length || task.aiNarrative);
    expect(richTasks.every((task) => task.summary?.description && task.summary.checklist.length && task.actions?.length)).toBe(true);
    expect(dataset.tasks.flatMap((task) => task.evidenceDocuments ?? []).every((document) => documentIds.has(document.id))).toBe(true);
    expect(
      dataset.documents.every(
        (document) =>
          (document.linkedCaseId && document.linkedRequirementId) ||
          document.linkedObjects?.some((ref) => ref.kind === 'request'),
      ),
    ).toBe(true);
    expect(dataset.documentEvidence.every((row) => documentIds.has(row.documentId))).toBe(true);
    expect(SYSTEM_DATASETS[0].requests).toHaveLength(6);
    expect(SYSTEM_DATASETS[0].communications).toEqual([]);
    expect(SYSTEM_DATASETS[0].activityEvents).toEqual([]);
  });

  it('loads the complete SBLI requirement architecture with resolved task and document links', () => {
    const dataset = SYSTEM_DATASETS[0];
    const documentIds = new Set(dataset.documents.map((row) => row.id));
    const taskIds = new Set(dataset.tasks.map((row) => row.id));
    const requirementsByCase = new Map<string, number>();
    dataset.requirements.forEach((requirement) => {
      const caseId = requirement.linkedObjects.find((ref) => ref.kind === 'case')?.id;
      expect(caseId).toBeTruthy();
      requirementsByCase.set(caseId ?? '', (requirementsByCase.get(caseId ?? '') ?? 0) + 1);
      expect(requirement.aiSummary).toBeTruthy();
      expect(requirement.fulfillmentCriteria?.length).toBeGreaterThan(0);
      expect(requirement.context?.kv.length).toBeGreaterThan(0);
      expect(requirement.history?.length).toBeGreaterThan(0);
      expect((requirement.linkedDocs ?? []).every((documentId) => documentIds.has(documentId))).toBe(true);
      expect((requirement.linkedTasks ?? []).every((taskId) => taskIds.has(taskId))).toBe(true);
    });

    expect(Object.fromEntries(requirementsByCase)).toEqual({
      'CD26-5546112': 7,
      'CD44-6679812': 7,
      'NB66-7622343': 7,
      'NB98-9989870': 4,
    });
    expect(dataset.requirements.filter((row) => row.blockingImpact).length).toBe(7);
  });

  it('uses case-type-specific contextual support instead of generic workflow and gate cards', () => {
    expect(SYSTEM_DATASETS[0].cases.find((row) => row.id === 'CD26-5546112')?.activeStepId).toBe('decision');
    expect(SYSTEM_DATASETS[0].cases.find((row) => row.id === 'NB66-7622343')?.activeStepId).toBe('req_gathering');
    expect(SYSTEM_DATASETS[0].enabledBusinessLines).toEqual(['claim', 'new_business']);
  });

  it('resolves contextual support through canonical anchors for every panel entity', () => {
    const dataset = SYSTEM_DATASETS[0];
    expect(resolveContextSupportCards({ anchor: { kind: 'task', id: 'missing-task' }, dataset })).toEqual([]);
    expect(resolveContextSupportCards({ anchor: { kind: 'requirement', id: 'missing-requirement' }, dataset })).toEqual([]);
    expect(resolveContextSupportCards({ anchor: { kind: 'document', id: 'missing-document' }, dataset })).toEqual([]);
  });

  it('maps seeded requirements into the case overview related-record phase', () => {
    const dataset = SYSTEM_DATASETS[0];
    const overview = getCaseOverview('NB66-7622343', dataset);
    expect(overview.requirements).toHaveLength(7);
    expect(overview.requirements.find((requirement) => requirement.id === 'req_mt_005')?.blockingImpact?.severity).toBe('high');
    const roundtrip = datasetFromPackage(packageFromDataset(dataset));
    expect(roundtrip.requirements.find((requirement) => requirement.id === 'req_mt_005')?.fulfillmentCriteria?.length).toBeGreaterThan(0);
    expect(overview.generalInformation?.cards?.map((card) => card.id)).toEqual(
      expect.arrayContaining(['application_intake', 'insured_health_profile', 'ai_scoring_summary']),
    );
  });

  it('loads workflow metadata and typed general information for all SBLI cases', () => {
    const dataset = SYSTEM_DATASETS[0];
    expect(dataset.cases).toHaveLength(4);
    dataset.cases.forEach((caseRecord) => {
      expect(caseRecord.workflowMeta?.caseId).toBe(caseRecord.id);
      expect(caseRecord.workflowMeta?.contextBar).toHaveLength(4);
      expect(caseRecord.workflowMeta?.subwayStages.filter((stage) => stage.state === 'active')).toHaveLength(1);
      expect(caseRecord.workflowMeta?.tabs.length).toBeGreaterThan(0);
      expect(caseRecord.workflowMeta?.headerActions.map((action) => action.label)).toEqual(['Decision', 'Create task']);
      expect(caseRecord.generalInformation?.aiSummary?.text).toBeTruthy();
      expect(caseRecord.generalInformation?.cards?.length).toBeGreaterThan(0);
      expect(caseRecord.generalInformation?.collapsibles?.length).toBeGreaterThan(0);
      expect(caseRecord.generalInformation?.sections).toEqual([]);
      caseRecord.generalInformation?.cards?.forEach((card) => {
        if (card.type === 'key_value_grid') {
          expect(card.fields.every((field) => field.label && field.value)).toBe(true);
        }
        if (card.type === 'scoring_bar_chart') {
          expect(card.factors.every((factor) => factor.name && factor.points && factor.barPct >= 0)).toBe(true);
        }
        if (card.type === 'status_tile_grid') {
          expect(card.tiles.every((tile) => tile.label && ['pending', 'complete', 'flagged'].includes(tile.status))).toBe(true);
        }
      });
    });

    const wop = dataset.cases.find((row) => row.id === 'CD26-5546112');
    expect(wop?.workflowMeta?.contextBar[2]?.label).toBe('Monthly premium');
    expect(wop?.workflowMeta?.contextBar[2]?.value).toBe('$38/month');

    const death = dataset.cases.find((row) => row.id === 'CD44-6679812');
    expect(death?.workflowMeta?.contextBar[0]?.label).toBe('Beneficiary');
    expect(death?.workflowMeta?.contextBar[2]?.label).toBe('Payout');

    const fullUw = dataset.cases.find((row) => row.id === 'NB66-7622343');
    expect(fullUw?.workflowMeta?.tabs).toEqual(expect.arrayContaining(['Scoring']));
    expect(fullUw?.workflowMeta?.tabs).not.toContain('Application');
    expect(fullUw?.generalInformation?.cards?.some((card) => card.type === 'scoring_bar_chart')).toBe(true);

    const simplified = dataset.cases.find((row) => row.id === 'NB98-9989870');
    expect(simplified?.workflowMeta?.tabs).toContain('Scoring');
    expect(simplified?.workflowMeta?.tabs).not.toContain('Application');
    expect(simplified?.generalInformation?.cards?.some((card) => card.type === 'status_tile_grid')).toBe(true);

    const roundtrip = datasetFromPackage(packageFromDataset(dataset));
    expect(roundtrip.cases.find((row) => row.id === 'CD26-5546112')?.workflowMeta?.contextBar[2]?.label).toBe('Monthly premium');
    expect(roundtrip.cases.find((row) => row.id === 'NB66-7622343')?.generalInformation?.cards?.some((card) => card.type === 'scoring_bar_chart')).toBe(true);
  });

  it('loads orphan simple-service tasks linked to requests, clients, and policies without a case', () => {
    const dataset = SYSTEM_DATASETS[0];
    const addressTask = listTasks(dataset).find((task) => task.id === 'task_ps_addr_001');
    const beneficiaryTask = listTasks(dataset).find((task) => task.id === 'task_ps_bene_001');
    const addressRequest = listRequests(dataset).find((request) => request.id === 'REQ-2026-005');

    expect(addressTask).toBeTruthy();
    expect(beneficiaryTask).toBeTruthy();
    expect(addressRequest).toBeTruthy();
    expect(addressTask?.caseId).toBeUndefined();
    expect(beneficiaryTask?.caseId).toBeUndefined();
    expect(addressRequest?.caseId).toBeUndefined();
    expect(addressTask?.primaryPartyName).toBe('Nora Whitfield');
    expect(beneficiaryTask?.primaryPartyName).toBe('David Chen');
    expect(addressTask?.objectRefs?.some((ref) => ref.kind === 'request' && ref.id === 'REQ-2026-005')).toBe(true);
    expect(addressTask?.objectRefs?.some((ref) => ref.kind === 'policy' && ref.id === 'SBLI-TL-2022-007316')).toBe(true);
    expect(beneficiaryTask?.objectRefs?.some((ref) => ref.kind === 'policy' && ref.id === 'SBLI-TL-2020-008905')).toBe(true);
    expect(addressRequest?.linkedTasks).toEqual(['task_ps_addr_001']);
  });

  it('loads the SBLI request architecture with resolved links and full audit data', () => {
    const dataset = SYSTEM_DATASETS[0];
    const taskIds = new Set(dataset.tasks.map((task) => task.id));
    const requirementIds = new Set(dataset.requirements.map((requirement) => requirement.id));
    const requestsByCategory = Object.fromEntries(
      ['Claims', 'New business'].map((category) => [category, dataset.requests.filter((request) => request.category === category).length]),
    );

    expect(requestsByCategory).toEqual({ Claims: 2, 'New business': 2 });
    expect(dataset.requests.map((request) => request.form?.fields.length)).toEqual([9, 9, 12, 11, 5, 5]);
    expect(dataset.requests.map((request) => request.aiActions?.length)).toEqual([5, 5, 5, 6, 3, 3]);
    expect(dataset.requests.map((request) => request.humanActions?.length)).toEqual([5, 3, 5, 2, 1, 1]);
    dataset.requests.forEach((request) => {
      const isSimpleService = request.category === 'Address Change' || request.category === 'Beneficiary Change';
      if (!isSimpleService) {
        expect(dataset.cases.some((caseRecord) => caseRecord.id === request.caseId)).toBe(true);
        expect(request.linkedObjects.some((ref) => ref.kind === 'case' && ref.id === request.caseId)).toBe(true);
      } else {
        expect(request.caseId).toBeUndefined();
        expect(request.linkedObjects.some((ref) => ref.kind === 'case')).toBe(false);
        expect(request.linkedObjects.some((ref) => ref.kind === 'client')).toBe(true);
        expect(request.linkedObjects.some((ref) => ref.kind === 'policy')).toBe(true);
      }
      expect((request.linkedTasks ?? []).every((taskId) => taskIds.has(taskId))).toBe(true);
      expect((request.linkedReqs ?? []).every((requirementId) => requirementIds.has(requirementId))).toBe(true);
    });

    const roundtrip = datasetFromPackage(packageFromDataset(dataset));
    const request = roundtrip.requests.find((row) => row.id === 'REQ-2026-003');
    expect(request?.form?.fields.length).toBe(12);
    expect(request?.aiActions?.length).toBe(5);
    expect(request?.humanActions?.length).toBe(5);
    expect(request?.linkedTasks?.length).toBe(7);
    expect(request?.linkedReqs?.length).toBe(7);
  });

  it('loads the SBLI seeded decision flows for every case', () => {
    const dataset = SYSTEM_DATASETS[0];
    const decisionFlows = dataset.cases.map((caseRecord) => caseRecord.decisionFlow);
    expect(decisionFlows.every(Boolean)).toBe(true);
    expect(decisionFlows.map((flow) => flow?.options.length)).toEqual([3, 3, 4, 3]);
    expect(decisionFlows.map((flow) => flow?.confirmChecks.length)).toEqual([4, 5, 4, 4]);
    expect(decisionFlows.map((flow) => Object.keys(flow?.outcomes ?? {}).length)).toEqual([3, 3, 4, 3]);
    expect(decisionFlows.map((flow) => flow?.aiRecommendation.confidence)).toEqual([91, 96, 72, 95]);
    expect(dataset.cases.find((caseRecord) => caseRecord.id === 'NB66-7622343')?.decisionFlow?.steps).toEqual(['Review', 'Offer type', 'Terms', 'Confirm']);
    dataset.cases.forEach((caseRecord) => {
      const flow = caseRecord.decisionFlow;
      expect(flow?.caseId).toBe(caseRecord.id);
      const optionIds = new Set(flow?.options.map((option) => option.id));
      expect(optionIds.has(flow?.aiRecommendation.recommendedOptionId ?? '')).toBe(true);
      expect(flow?.options.every((option) => Boolean(flow.outcomes[option.id]))).toBe(true);
    });
    const roundtrip = datasetFromPackage(packageFromDataset(dataset));
    expect(roundtrip.cases.find((caseRecord) => caseRecord.id === 'CD44-6679812')?.decisionFlow?.aiRecommendation.confidence).toBe(96);
  });

  it('loads seeded NB scoring models and derives human working nets', () => {
    const dataset = SYSTEM_DATASETS[0];
    const marc = dataset.cases.find((row) => row.id === 'NB66-7622343')?.underwritingScoring;
    const elena = dataset.cases.find((row) => row.id === 'NB98-9989870')?.underwritingScoring;
    expect(marc?.debits).toHaveLength(4);
    expect(marc?.credits).toHaveLength(2);
    expect(elena?.debits).toHaveLength(0);
    expect(elena?.credits).toHaveLength(2);
    expect(marc?.aiNet).toBe(25);
    expect(elena?.aiNet).toBe(-50);
    expect(marc ? deriveHumanNet(marc) : null).toBe(90);
    expect(elena ? deriveHumanNet(elena) : null).toBe(-50);
    expect(marc?.debits.every((item) => item.condition && item.confidence && item.pending != null && item.aiGenerated != null)).toBe(true);
    expect(elena?.credits.every((item) => item.factor && item.confidence && item.pending != null && item.aiGenerated != null)).toBe(true);
    const roundtrip = datasetFromPackage(packageFromDataset(dataset));
    expect(roundtrip.cases.find((row) => row.id === 'NB66-7622343')?.underwritingScoring?.aiNet).toBe(25);
  });

  it('resolveCaseTypeForSettings bundles workflow and anatomy for claim death vs disability', () => {
    const emptyAnatomy: AnatomySettings = {
      entityAnatomyOverrides: {},
      caseTypeAnatomyOverrides: {},
      utilityContextCardOverrides: {},
    };
    const domains = ['task', 'document', 'communication', 'event', 'requirement'] as const;
    const disability = resolveCaseTypeForSettings('claim', emptyAnatomy, [...domains], { claimSubType: 'disability_benefit' });
    expect(disability?.workflow.id).toBe('claim-income-protection');
    const death = resolveCaseTypeForSettings('claim', emptyAnatomy, [...domains], { claimSubType: 'death' });
    expect(death?.workflow.id).toBe('claim-death-benefit');
    expect(death?.anatomy.tabsResolved.length).toBeGreaterThan(0);
  });

  it('merges case shell with business-line anatomy and hides utility tabs when domains are off', () => {
    const merged = mergeCaseShellWithCaseType('claim');
    expect(merged?.tabs.map((tab) => tab.id)).toContain('overview');
    expect(merged?.tabs.map((tab) => tab.id)).toContain('decision');
    const withTasks = resolveEffectiveCaseTypeAnatomy('claim', undefined, [
      'task',
      'document',
      'communication',
      'event',
      'requirement',
    ]);
    expect(withTasks?.tabs.map((tab) => tab.id)).toContain('tasks');
    const withoutTasks = resolveEffectiveCaseTypeAnatomy('claim', undefined, [
      'document',
      'communication',
      'event',
      'requirement',
    ]);
    expect(withoutTasks?.tabs.map((tab) => tab.id)).not.toContain('tasks');
  });

  it('uses request hash routes while retaining query compatibility', () => {
    expect(resolveObjectLocation({ kind: 'request', id: 'REQ-CS-450091' })).toBe('/requests#request=REQ-CS-450091');
    const legacyObject = new URLSearchParams('?object=REQ-CS-450091').get('object');
    expect(legacyObject).toBe('REQ-CS-450091');
  });

  it('keeps i18n fixture namespaces in parity across supported locales', () => {
    [
      [enCommon, frCommon, esCommon],
      [enFixtures, frFixtures, esFixtures],
      [enFolders, frFolders, esFolders],
      [enNav, frNav, esNav],
      [enSettings, frSettings, esSettings],
    ].forEach(([en, fr, es]) => {
      const expected = flattenKeys(en).sort();
      expect(flattenKeys(fr).sort()).toEqual(expected);
      expect(flattenKeys(es).sort()).toEqual(expected);
    });
  });

  it('defines migration-ready persistence boundaries for the first real adapter', () => {
    expect(FIRST_REAL_PERSISTENCE_ADAPTER).toBe('local_indexeddb');
    expect(DATASET_MUTATION_BOUNDARIES.map((item) => item.kind).sort()).toEqual([
      'create_dataset',
      'delete_dataset',
      'import_package',
      'migrate_dataset',
      'update_dataset',
    ]);
    expect(DATASET_MUTATION_BOUNDARIES.every((item) => item.firstAdapter === FIRST_REAL_PERSISTENCE_ADAPTER)).toBe(true);

    const migrated = migrateSystemDataset({ ...SYSTEM_DATASETS[0], schemaVersion: 1 });
    expect(migrated.schemaVersion).toBe(SYSTEM_DATASET_SCHEMA_VERSION);
    expect(
      migrated.documents.every(
        (document) => document.linkedCaseId || document.linkedObjects?.some((ref) => ref.kind === 'request'),
      ),
    ).toBe(true);
    expect(migrated.documents.filter((document) => document.linkedRequirement).every((document) => document.linkedRequirementId)).toBe(true);
    expect(validateSystemDataset(migrated).errors).toEqual([]);
  });
});

describe('dataset mutation service', () => {
  it('normalizes case records into controlled case data sections', () => {
    const dataset = datasetRegistry.getDataset(SYSTEM_DATASETS[0].id);
    const caseRecord = dataset.cases[0];

    expect(caseRecord.identification?.caseId).toBe(caseRecord.id);
    expect(caseRecord.identification?.caseTypeId).toBe(caseRecord.workflowTemplateId);
    expect(caseRecord.contextCard?.headlineMetrics.map((field) => field.id)).toEqual(
      expect.arrayContaining(['workflow-slot-1', 'workflow-slot-2', 'workflow-slot-3', 'workflow-slot-4']),
    );
    expect(caseRecord.contextCard?.sla?.label).toBeTruthy();
    expect(caseRecord.workflowState?.templateId).toBe(caseRecord.workflowTemplateId);
    expect(caseRecord.workflowState?.steps.length).toBeGreaterThan(0);
    expect(caseRecord.tabs?.map((tab) => tab.id)).toEqual(expect.arrayContaining(['overview', 'requirements', 'tasks']));
    expect(caseRecord.tabs?.some((tab) => tab.utilityEntity)).toBe(true);
    expect(caseRecord.workflowMeta?.contextBar).toHaveLength(4);
    expect(caseRecord.generalInformation?.cards?.length).toBeGreaterThan(0);
  });

  it('duplicates built-in datasets on request creation and persists chained tasks', () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      },
    });

    const source = SYSTEM_DATASETS[0];
    const sourceCase = source.cases[0];
    const result = createRequest(source.id, {
      title: 'Persisted mutation request',
      source: 'Unit test',
      sourceChannel: 'email',
      requester: sourceCase.primaryParty.label,
      caseId: sourceCase.id,
      assignedTo: 'Operations queue',
      tasks: [{ title: 'Follow-up mutation task', type: 'Review', assignee: 'Operations queue', dueWindow: '1d', description: 'Check mutation path' }],
    });

    expect(result.datasetId).not.toBe(source.id);
    const saved = datasetRegistry.getDataset(result.datasetId);
    expect(saved.requests.some((request) => request.id === result.record.id)).toBe(true);
    expect(saved.tasks.some((task) => task.linkedObjects?.some((ref) => ref.kind === 'request' && ref.id === result.record.id))).toBe(true);
  });

  it('writes directly to generated datasets after the workspace copy exists', () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      },
    });

    const first = createTask(SYSTEM_DATASETS[0].id, {
      title: 'Generated workspace task',
      priority: 'Normal',
      assignee: 'IP Claims Team',
      dueWindow: '2d',
      queue: 'team_tasks',
      caseId: SYSTEM_DATASETS[0].cases[0].id,
    });
    const second = createTask(first.datasetId, {
      title: 'Second generated workspace task',
      priority: 'High',
      assignee: 'IP Claims Team',
      dueWindow: '1d',
      queue: 'team_tasks',
      caseId: SYSTEM_DATASETS[0].cases[0].id,
    });

    expect(second.datasetId).toBe(first.datasetId);
    expect(datasetRegistry.getDataset(second.datasetId).tasks.some((task) => task.id === second.record.id)).toBe(true);
  });

  it('persists created-record fidelity fields and recomputed case summaries', () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      },
    });

    const source = {
      ...generateDatasetFromProfile(DATASET_GENERATION_PROFILES[0]),
      id: 'mutation-profile-source',
    };
    datasetRegistry.saveDataset(source);
    const createdCase = createCase(source.id, {
      caseKind: 'claim',
      primaryPartyId: source.clients[0].id,
      assignee: 'IP Claims Team',
      priority: 'High',
      initialFact: 'Customer called with urgent evidence.',
    });
    const createdTask = createTask(createdCase.datasetId, {
      title: 'Review initial evidence',
      priority: 'High',
      assignee: 'IP Claims Team',
      dueWindow: '1d',
      queue: 'team_tasks',
      caseId: createdCase.record.id,
    });

    const saved = datasetRegistry.getDataset(createdTask.datasetId);
    const savedCase = saved.cases.find((item) => item.id === createdCase.record.id);
    const savedTask = saved.tasks.find((item) => item.id === createdTask.record.id);
    expect(savedTask?.assigneeId).toBe('ip-claims');
    expect(savedTask?.sourceContext).toBe('case_view');
    expect(savedCase?.identification?.caseId).toBe(createdCase.record.id);
    expect(savedCase?.contextCard?.headlineMetrics.some((field) => field.id === 'primary-party')).toBe(true);
    expect(savedCase?.workflowState?.templateId).toBe(savedCase?.workflowTemplateId);
    expect(savedCase?.facts.some((fact) => fact.label === 'Initial briefing')).toBe(true);
    expect(savedCase?.moduleSummaries.find((summary) => summary.module === 'tasks')?.total).toBe(1);
    expect(savedCase?.caseTypeCode).toBe('IP');
    expect(savedCase?.claimDetails?.claimSubType).toBe('disability_benefit');
    expect(savedCase?.caseSubType).toBe('disability_benefit');
    expect(savedCase?.caseTypeId).toBe('ct_claim_disability');
    expect(savedCase?.workflowTemplateId).toBe('ct_claim_disability');
  });

  it('persists new business sub-types with SBLI case type and workflow ids', () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      },
    });

    const source = {
      ...generateDatasetFromProfile(DATASET_GENERATION_PROFILES[0]),
      id: 'mutation-nb-source',
    };
    datasetRegistry.saveDataset(source);
    const fullUw = createCase(source.id, {
      caseKind: 'new_business',
      primaryPartyId: source.clients[0].id,
      claimSubType: 'full_underwriting',
      assignee: 'Underwriting Team',
    });
    const simplified = createCase(fullUw.datasetId, {
      caseKind: 'new_business',
      primaryPartyId: source.clients[0].id,
      claimSubType: 'simplified_underwriting',
      assignee: 'Underwriting Team',
    });

    const saved = datasetRegistry.getDataset(simplified.datasetId);
    const fullRecord = saved.cases.find((item) => item.id === fullUw.record.id);
    const simpRecord = saved.cases.find((item) => item.id === simplified.record.id);
    expect(fullRecord?.caseSubType).toBe('full_underwriting');
    expect(fullRecord?.caseTypeId).toBe('ct_nb_full_uw');
    expect(fullRecord?.workflowTemplateId).toBe('ct_nb_full_uw');
    expect(fullRecord?.caseTypeCode).toBe('NB');
    expect(simpRecord?.caseSubType).toBe('simplified_underwriting');
    expect(simpRecord?.caseTypeId).toBe('ct_nb_simplified');
    expect(simpRecord?.workflowTemplateId).toBe('ct_nb_simplified');
  });

  it('guards no-op links and scalar delete dependencies', () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      },
    });

    const source = {
      ...generateDatasetFromProfile(DATASET_GENERATION_PROFILES[0]),
      id: 'delete-guard-profile-source',
    };
    datasetRegistry.saveDataset(source);
    expect(() => linkObject(source.id, { kind: 'task', id: 'missing-task' }, { kind: 'case', id: source.cases[0].id })).toThrow(/source record/);
    expect(() => deleteEntity(source.id, { kind: 'client', id: source.clients[0].id })).toThrow(/still reference/);
  });
});
