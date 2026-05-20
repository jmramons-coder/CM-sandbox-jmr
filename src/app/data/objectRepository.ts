import { CASE_OVERVIEWS, MOCK_CASES } from './mock-cases';
import { MOCK_DOCUMENTS } from './mock-documents';
import { MOCK_REQUESTS } from './mock-requests';
import { MY_TASKS, TEAM_TASKS } from './mock-tasks';
import { datasetRegistry } from './datasetRegistry';
import { normalizeDataset } from './datasetRegistry';
import { mergeGiDemoEntities } from './gi-demo-entity-records';
import {
  MULTI_CASE_DEMO_DATASET,
  type ActivityEventRecord,
  type AiActionRecord,
  type AgentRecord,
  type CommunicationRecord,
  type DatasetDocumentRecord,
  type DatasetRequirementRecord,
  type DatasetRequestRecord,
  type DatasetTaskRecord,
  type SystemDataset,
} from './multi-case-dataset';
import type { CaseDocument, CaseOverview, CaseRequirement, CaseSummary, ServiceRequest, Task, TaskLinkedObject } from '../types';
import { resolveClaimSubType } from '../domain/claimSubTypes';
import { stripSummaryTitleDecorators } from '../utils/summaryText';
import type { CaseRecord, ObjectRef, ObjectRelationshipRow, WorkObjectKind } from '../domain/objectRefs';
import type { DataSourceSettings } from '../domain/objectRefs';
import { resolveObjectLocation } from '../domain/objectRefs';
import { getWorkflowDefinition } from '../domain/workflows';
import { parseCaseTypeCodeFromId } from '../domain/caseTypes';
import { getDocumentFileType } from './documentMetadata';
import { resolveAssigneeLabel } from './userDirectory';
import { deriveAiActionsFromDataset } from './aiActionDerivation';

export { deriveAiActionsFromDataset } from './aiActionDerivation';

export interface ObjectRepository {
  dataset: SystemDataset;
  listCaseRecords: () => CaseRecord[];
  listCaseSummaries: () => CaseSummary[];
  listTasks: (filter?: { caseId?: string }) => Task[];
  listDocuments: (filter?: { caseId?: string }) => CaseDocument[];
  listRequests: (filter?: { caseId?: string }) => ServiceRequest[];
  listRequirements: (caseId: string) => CaseRequirement[];
  listCommunications: (caseId: string) => CommunicationRecord[];
  listActivityEvents: (caseId: string) => ActivityEventRecord[];
  listAiActions: (filter?: { caseId?: string; status?: AiActionRecord['status']; sourceSurface?: AiActionRecord['sourceSurface'] }) => AiActionRecord[];
  getAiAction: (actionId: string) => AiActionRecord | undefined;
  listRelatedObjects: (ref: ObjectRef) => ObjectRef[];
  listRelationships: (ref?: ObjectRef) => ObjectRelationshipRow[];
  listAgents: () => AgentRecord[];
  getEntity: (kind: WorkObjectKind, id: string) => unknown;
  getCaseRecord: (caseId: string) => CaseRecord | undefined;
  getCaseSummary: (caseId: string) => CaseSummary | undefined;
  getLegacyCaseOverview: (caseId: string) => CaseOverview | undefined;
  listObjectRefs: (kind?: WorkObjectKind) => ObjectRef[];
}

export function getSystemDataset(datasetId: string | undefined | null): SystemDataset {
  return datasetRegistry.getDataset(datasetId);
}

export function filterDatasetBySettings(dataset: SystemDataset, settings?: DataSourceSettings): SystemDataset {
  const sourceDataset = normalizeDataset(dataset);
  if (!settings) return sourceDataset;
  const enabledEntities = new Set(settings.enabledObjectDomains);
  const enabledBusinessLines = new Set(settings.enabledWorkflows);
  const enabledCases = sourceDataset.cases.filter((item) => enabledEntities.has('case') && enabledBusinessLines.has(item.caseKind));
  const enabledCaseIds = new Set(enabledCases.map((item) => item.id));
  const retainedRefs = new Set<string>();
  const refKey = (kind: WorkObjectKind, id: string) => `${kind}:${id}`;
  const addRef = (ref: ObjectRef) => {
    if (ref.kind === 'case' && !enabledCaseIds.has(ref.id)) return false;
    if (!enabledEntities.has(ref.kind)) return false;
    const key = refKey(ref.kind, ref.id);
    const had = retainedRefs.has(key);
    retainedRefs.add(key);
    return !had;
  };
  const addRefs = (refs: ObjectRef[]) => refs.some(addRef);
  const refsAllowed = (refs: ObjectRef[]) =>
    refs.every((ref) => enabledEntities.has(ref.kind)) &&
    refs.every((ref) => ref.kind !== 'case' || enabledCaseIds.has(ref.id));

  enabledCases.forEach((item) => {
    addRef({ kind: 'case', id: item.id, label: item.title });
    addRef(item.primaryParty);
    addRefs(item.participants ?? []);
    addRefs(item.linkedObjects ?? []);
  });

  const touchesRetained = (refs: ObjectRef[]) => refs.some((ref) => retainedRefs.has(refKey(ref.kind, ref.id)));
  const touchesEnabledCase = (refs: ObjectRef[]) => refs.some((ref) => ref.kind === 'case' && enabledCaseIds.has(ref.id));
  let changed = true;
  while (changed) {
    changed = false;
    sourceDataset.policies.forEach((item) => {
      if (!enabledEntities.has('policy')) return;
      const participantRefs = (item.participants ?? []).map((participant) => ({ kind: 'client' as const, id: participant.clientId, role: participant.role }));
      const refs = [...(item.linkedObjects ?? []), ...(item.agents ?? []), ...participantRefs];
      if (retainedRefs.has(refKey('policy', item.id)) || touchesRetained(refs)) {
        changed = addRef({ kind: 'policy', id: item.id, label: item.label }) || addRefs(refs) || changed;
      }
    });
    sourceDataset.agents.forEach((item) => {
      if (!enabledEntities.has('agent')) return;
      const agentRefs = item.linkedObjects ?? [];
      if (retainedRefs.has(refKey('agent', item.id)) || touchesRetained(agentRefs)) {
        changed = addRef({ kind: 'agent', id: item.id, label: item.name }) || addRefs(agentRefs) || changed;
      }
    });
    sourceDataset.applications.forEach((item) => {
      if (!enabledEntities.has('application')) return;
      const refs: ObjectRef[] = [{ kind: 'client', id: item.clientId, label: item.clientId }];
      if (retainedRefs.has(refKey('application', item.id)) || touchesRetained(refs)) {
        changed = addRef({ kind: 'application', id: item.id, label: item.label }) || addRefs(refs) || changed;
      }
    });
    [
      ...sourceDataset.tasks,
      ...sourceDataset.requirements,
      ...sourceDataset.documents,
      ...sourceDataset.requests,
      ...sourceDataset.communications,
      ...sourceDataset.notes,
      ...sourceDataset.activityEvents,
    ].forEach((item) => {
      const refs = item.linkedObjects ?? [];
      if (!enabledEntities.has(item.kind) || !refsAllowed(refs)) return;
      if (retainedRefs.has(refKey(item.kind, item.id)) || touchesEnabledCase(refs) || touchesRetained(refs)) {
        const base = item as { id: string };
        const label = 'label' in item ? item.label : 'subject' in item ? item.subject : 'body' in item ? item.body : base.id;
        changed = addRef({ kind: item.kind, id: item.id, label }) || addRefs(refs) || changed;
      }
    });
  }

  const hasRef = (kind: WorkObjectKind, id: string) => retainedRefs.has(refKey(kind, id));
  const rowRetained = (kind: WorkObjectKind, id: string, refs: ObjectRef[] = []) =>
    enabledEntities.has(kind) && refsAllowed(refs) && (hasRef(kind, id) || touchesEnabledCase(refs) || touchesRetained(refs));

  const filtered = {
    ...sourceDataset,
    legacyMockOverlayEnabled: false,
    enabledBusinessLines: sourceDataset.enabledBusinessLines?.filter((kind) => enabledBusinessLines.has(kind)),
    objectDomains: sourceDataset.objectDomains.filter((kind) => enabledEntities.has(kind)),
    cases: enabledCases,
    clients: enabledEntities.has('client') ? sourceDataset.clients.filter((item) => hasRef('client', item.id)) : [],
    policies: enabledEntities.has('policy') ? sourceDataset.policies.filter((item) => {
      const participantRefs = (item.participants ?? []).map((participant) => ({ kind: 'client' as const, id: participant.clientId }));
      return rowRetained('policy', item.id, [...(item.linkedObjects ?? []), ...(item.agents ?? []), ...participantRefs]);
    }) : [],
    agents: enabledEntities.has('agent') ? sourceDataset.agents.filter((item) => rowRetained('agent', item.id, item.linkedObjects ?? [])) : [],
    applications: enabledEntities.has('application') ? sourceDataset.applications.filter((item) => rowRetained('application', item.id, [{ kind: 'client', id: item.clientId }])) : [],
    tasks: enabledEntities.has('task') ? sourceDataset.tasks.filter((item) => rowRetained('task', item.id, item.linkedObjects ?? [])) : [],
    requirements: enabledEntities.has('requirement') ? sourceDataset.requirements.filter((item) => rowRetained('requirement', item.id, item.linkedObjects ?? [])) : [],
    documents: enabledEntities.has('document') ? sourceDataset.documents.filter((item) => rowRetained('document', item.id, item.linkedObjects ?? [])) : [],
    requests: enabledEntities.has('request') ? sourceDataset.requests.filter((item) => rowRetained('request', item.id, item.linkedObjects ?? [])) : [],
    communications: enabledEntities.has('communication') ? sourceDataset.communications.filter((item) => rowRetained('communication', item.id, item.linkedObjects ?? [])) : [],
    notes: enabledEntities.has('note') ? sourceDataset.notes.filter((item) => rowRetained('note', item.id, item.linkedObjects ?? [])) : [],
    activityEvents: enabledEntities.has('event') ? sourceDataset.activityEvents.filter((item) => rowRetained('event', item.id, item.linkedObjects ?? [])) : [],
    documentEvidence: enabledEntities.has('document')
      ? sourceDataset.documentEvidence.filter((item) => {
          const evRefs = item.linkedObjects ?? [];
          return hasRef('document', item.documentId) && refsAllowed(evRefs) && (touchesEnabledCase(evRefs) || touchesRetained(evRefs));
        })
      : [],
    assistantResponses: sourceDataset.assistantResponses.filter((item) => {
      const refs = item.linkedObjects ?? [];
      return refsAllowed(refs) && (touchesEnabledCase(refs) || touchesRetained(refs));
    }),
    aiActions: sourceDataset.aiActions.filter((item) => {
      const refs = item.linkedObjects ?? [];
      return refsAllowed(refs) && (touchesEnabledCase(refs) || touchesRetained(refs));
    }),
  };
  return enabledEntities.has('policy') ? mergeGiDemoEntities(filtered) : filtered;
}

export function createObjectRepository(datasetId?: string | null, settings?: DataSourceSettings): ObjectRepository {
  const dataset = filterDatasetBySettings(getSystemDataset(datasetId), settings);
  return {
    dataset,
    listCaseRecords: () => dataset.cases,
    listCaseSummaries: () => listCaseSummaries(dataset),
    listTasks: (filter) => listTasks(dataset, filter),
    listDocuments: (filter) => listDocuments(dataset, filter),
    listRequests: (filter) => listRequests(dataset, filter),
    listRequirements: (caseId) => listRequirements(dataset, caseId),
    listCommunications: (caseId) => listCommunications(dataset, caseId),
    listActivityEvents: (caseId) => listActivityEvents(dataset, caseId),
    listAiActions: (filter) => listAiActions(dataset, filter),
    getAiAction: (actionId) => getAiAction(dataset, actionId),
    listRelatedObjects: (ref) => listRelatedObjects(dataset, ref),
    listRelationships: (ref) => listRelationships(dataset, ref),
    listAgents: () => dataset.agents,
    getEntity: (kind, id) => getEntity(dataset, kind, id),
    getCaseRecord: (caseId) => dataset.cases.find((item) => item.id === caseId),
    getCaseSummary: (caseId) => listCaseSummaries(dataset).find((item) => item.id === caseId),
    getLegacyCaseOverview: () => undefined,
    listObjectRefs: (kind) => listObjectRefs(dataset, kind),
  };
}

function refMatchesCase(refs: ObjectRef[] | undefined, caseId: string): boolean {
  return (refs ?? []).some((ref) => ref.kind === 'case' && ref.id === caseId);
}

function getLinkedCaseId(refs: ObjectRef[] | undefined): string | undefined {
  return (refs ?? []).find((ref) => ref.kind === 'case')?.id;
}

function getLinkedClientLabel(dataset: SystemDataset, refs: ObjectRef[] | undefined): string {
  const caseId = getLinkedCaseId(refs);
  const caseRecord = caseId ? dataset.cases.find((item) => item.id === caseId) : undefined;
  return caseRecord?.primaryParty.label ?? 'N/A';
}

function formatPolicyRole(role: string): string {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function getPrimaryPartyPolicyRole(dataset: SystemDataset, caseRecord?: CaseRecord): string | undefined {
  if (!caseRecord?.primaryParty) return undefined;
  if (caseRecord.primaryParty.kind !== 'client') return caseRecord.primaryParty.policyRole;
  const linkedPolicyIds = new Set((caseRecord.linkedObjects ?? []).filter((ref) => ref.kind === 'policy').map((ref) => ref.id));
  const roles = dataset.policies
    .filter((policy) => linkedPolicyIds.has(policy.id))
    .flatMap((policy) => policy.participants)
    .filter((participant) => participant.clientId === caseRecord.primaryParty.id)
    .map((participant) => participant.role);
  const preferredRole = roles.find((role) => role === 'insured' || role === 'beneficiary') ?? roles[0];
  return preferredRole ? formatPolicyRole(preferredRole) : caseRecord.primaryParty.policyRole;
}

function toTaskLinkedObject(ref: ObjectRef): TaskLinkedObject | null {
  const kind = ref.kind === 'application' ? 'application' : ref.kind;
  if (!['case', 'client', 'policy', 'agent', 'application', 'requirement', 'task', 'request', 'document', 'communication'].includes(kind)) return null;
  return {
    kind: kind as TaskLinkedObject['kind'],
    id: ref.id,
    label: ref.label ?? ref.id,
    href: ref.href,
  };
}

function toTask(dataset: SystemDataset, row: DatasetTaskRecord): Task {
  const refs = row.linkedObjects ?? [];
  const caseId = getLinkedCaseId(refs);
  const caseRecord = caseId ? dataset.cases.find((item) => item.id === caseId) : undefined;
  const primaryPartyPolicyRole = getPrimaryPartyPolicyRole(dataset, caseRecord);
  const priority = String(row.priority).toLowerCase();
  const normalizedPriority = priority === 'urgent' ? 'URGENT' : priority === 'high' ? 'HIGH' : 'NORMAL';
  return {
    id: row.id,
    taskId: row.taskId,
    priority: normalizedPriority,
    caseType: row.caseType ?? caseRecord?.caseTypeCode ?? 'Standalone',
    caseSubtype: row.caseSubtype,
    taskType: stripSummaryTitleDecorators(row.label),
    hasAI: row.hasAI ?? row.aiGenerated ?? Boolean(row.aiSummary),
    aiSummary: row.aiSummary,
    aiAction: row.aiAction,
    alert: row.alert,
    summary: row.summary,
    aiNarrative: row.aiNarrative,
    evidenceDocuments: row.evidenceDocuments,
    contextCards: row.contextCards,
    actions: row.actions,
    claimantName: caseRecord?.primaryParty.label ?? refs.find((ref) => ref.kind === 'client')?.label ?? 'N/A',
    claimantPolicyRole: primaryPartyPolicyRole,
    primaryPartyName: caseRecord?.primaryParty.label ?? refs.find((ref) => ref.kind === 'client')?.label,
    primaryPartyLabel: primaryPartyPolicyRole ? `Primary party (${primaryPartyPolicyRole})` : 'Primary party',
    product: row.product ?? caseRecord?.facts?.find((fact) => fact.id === 'product')?.value ?? 'N/A',
    slaRemaining: row.slaRemaining ?? row.dueDate ?? '2d',
    dueDate: row.dueDate,
    stage: row.stage,
    aiGenerated: row.aiGenerated,
    aiConfidence: row.aiConfidence,
    slaStatus: row.slaStatus ?? (normalizedPriority === 'HIGH' ? 'warning' : 'normal'),
    status: row.status as Task['status'],
    assignedTo: resolveAssigneeLabel(row.assigneeId ?? row.assignee ?? row.owner),
    assigneeId: row.assigneeId,
    assigneeKind: row.assigneeKind,
    origin: row.origin ?? 'Dataset',
    sourceContext: row.sourceContext,
    createdFrom: row.createdFrom,
    createdDate: row.createdDate ?? 'Dataset record',
    description: row.description,
    queue: row.queue ?? 'my_tasks',
    teamOrigin: row.teamOrigin,
    requiredAuthorityLevel: row.requiredAuthorityLevel ?? 1,
    caseId,
    linkedObjects: refs.map(toTaskLinkedObject).filter((ref): ref is TaskLinkedObject => Boolean(ref)),
    objectRefs: refs,
    panelContext: {
      ...(row.panelContext ?? {
        summaryStatus: row.status,
        contextTitle: stripSummaryTitleDecorators(row.label),
        contextSummary: `Dataset task linked to ${caseRecord?.title ?? caseId ?? 'the active environment'}.`,
        suggestions: ['Review linked entities', 'Confirm ownership', 'Update task status'],
      }),
      scoringContext: row.scoringContext ?? row.panelContext?.scoringContext,
    },
  };
}

function toDocument(dataset: SystemDataset, row: DatasetDocumentRecord): CaseDocument {
  const refs = row.linkedObjects ?? [];
  const caseId = getLinkedCaseId(refs);
  const caseRecord = caseId ? dataset.cases.find((item) => item.id === caseId) : undefined;
  return {
    id: row.id,
    name: row.label,
    filename: row.filename,
    category: row.category,
    status: row.status as CaseDocument['status'],
    stage: row.stage,
    uploaded: row.uploaded ?? row.uploadedAt ?? 'May 8, 2026',
    uploadedAt: row.uploadedAt,
    source: row.source ?? (row.fileAvailable ? 'dataset_import' : 'metadata_only'),
    claimant: row.claimant,
    reqContext: row.reqContext,
    insights: row.insights,
    followUps: row.followUps,
    insight: row.insight,
    aiInsight: row.aiInsight,
    aiConfidence: row.aiConfidence,
    aiSummary: row.aiSummary ?? row.insight ?? (row.fileAvailable
      ? 'Document file available in the active dataset.'
      : (row.placeholderReason ?? 'Document metadata exists, but the actual file has not been provided yet.')),
    aiAction: row.aiAction ?? (row.fileAvailable ? 'Review' : 'Await file'),
    linkedRequirement: row.linkedRequirement ?? refs.find((ref) => ref.kind === 'requirement')?.label ?? 'No linked requirement',
    linkedRequirementId: row.linkedRequirementId,
    linkedCase: row.linkedCase ?? caseId ?? 'N/A',
    caseId,
    claimantName: caseRecord?.primaryParty.label ?? getLinkedClientLabel(dataset, refs),
    primaryPartyName: caseRecord?.primaryParty.label,
    primaryPartyLabel: 'Primary party',
    objectRefs: refs,
    fileSize: row.fileSize ?? (row.fileAvailable ? 'Imported' : 'No file'),
    fileType: getDocumentFileType(row.label, row.fileType),
    fileAvailable: row.fileAvailable,
    fileUrl: row.fileUrl,
    placeholderReason: row.placeholderReason,
    scoringContext: row.scoringContext,
  };
}

function toRequirementStatus(status: string): CaseRequirement['status'] {
  switch (status) {
    case 'fulfilled':
      return 'Fulfilled';
    case 'overdue':
      return 'Overdue';
    case 'in_review':
      return 'Pending';
    case 'scheduled':
      return 'Ordered';
    case 'not_started':
      return 'In Queue';
    case 'pending':
      return 'Pending';
    default:
      return status as CaseRequirement['status'];
  }
}

function toRequest(row: DatasetRequestRecord): ServiceRequest {
  const refs = row.linkedObjects ?? [];
  const caseId = row.caseId ?? getLinkedCaseId(refs);
  const title = row.name ?? row.label;
  return {
    id: row.id,
    title,
    name: row.name,
    subtype: row.subtype,
    category: row.category ?? 'General',
    status: row.status as ServiceRequest['status'],
    statusCls: row.statusCls,
    priority: row.priority ?? 'Normal',
    received: row.received ?? 'May 8, 2026',
    receivedFull: row.receivedFull,
    receivedTime: row.receivedTime,
    source: row.channel ?? row.source,
    channel: row.channel,
    sourceChannel: row.sourceChannel ?? row.channel as ServiceRequest['sourceChannel'] ?? 'email',
    sourceDetail: row.sourceDetail ?? row.channel ?? row.source,
    requester: row.requester ?? refs.find((ref) => ref.kind === 'client')?.label ?? 'Dataset',
    requesterRole: row.requesterRole,
    requesterInitials: row.requesterInitials,
    caseId,
    caseKey: row.caseKey,
    clientId: row.clientId,
    policyNumber: row.policyNumber,
    primaryPartyName: refs.find((ref) => ref.kind === 'client')?.label,
    primaryPartyLabel: 'Requester',
    assignedTo: row.assignee ?? resolveAssigneeLabel(row.assigneeId ?? row.assignedTo ?? 'Operations queue'),
    assigneeId: row.assigneeId,
    assigneeKind: row.assigneeKind,
    due: row.due ?? '2d',
    notes: row.notes,
    templateId: row.templateId,
    requestMode: row.requestMode,
    aiSummary: row.summary ?? row.notes ?? row.aiSummary ?? `Dataset request linked to ${refs.length} related entities.`,
    summary: row.summary,
    nextAction: row.nextAction ?? 'Review request',
    form: row.form,
    aiActions: row.aiActions,
    humanActions: row.humanActions,
    linkedCase: row.linkedCase,
    linkedTasks: row.linkedTasks,
    linkedReqs: row.linkedReqs,
    linkedObjects: refs.map(toTaskLinkedObject).filter((ref): ref is TaskLinkedObject => Boolean(ref)),
    objectRefs: refs,
    systemSteps: row.systemSteps ?? [
      {
        id: `${row.id}-match`,
        kind: 'review_required',
        status: 'awaiting_review',
        title: 'Review dataset request',
        description: 'Generated request from the active dataset graph.',
      },
    ],
  };
}

function toRequirement(row: DatasetRequirementRecord): CaseRequirement {
  const refs = row.linkedObjects ?? [];
  const linkedDocs = row.linkedDocs ?? refs.filter((ref) => ref.kind === 'document').map((ref) => ref.id);
  const linkedTasks = row.linkedTasks ?? refs.filter((ref) => ref.kind === 'task').map((ref) => ref.id);
  return {
    id: row.id,
    datasetRequirementId: row.id,
    name: row.label,
    category: row.category,
    rag: row.rag ?? 'Amber',
    status: toRequirementStatus(row.status),
    stage: row.stage,
    dueDate: row.dueDate ?? 'TBD',
    followUpDate: row.followUpDate ?? 'TBD',
    source: row.source ?? 'dataset',
    sourceType: row.sourceType,
    responsibleParty: row.responsibleParty,
    trigger: row.trigger ?? row.workflowStepId ?? 'Business line',
    phase: row.phase as CaseRequirement['phase'],
    notes: row.notes,
    aiSummary: row.aiSummary,
    fulfillmentCriteria: row.fulfillmentCriteria,
    linkedDocs,
    linkedTasks,
    blockingImpact: row.blockingImpact,
    context: row.context,
    history: row.history,
    workflowStepId: row.workflowStepId,
    aiInsight: row.aiInsight,
    aiConfidence: row.aiConfidence,
    objectRefs: refs,
  };
}

export function listTasks(dataset: SystemDataset = MULTI_CASE_DEMO_DATASET, filter: { caseId?: string } = {}): Task[] {
  if (!dataset.objectDomains.includes('task')) return [];
  const generated = dataset.tasks.map((row) => toTask(dataset, row));
  const legacy = [...MY_TASKS, ...TEAM_TASKS];
  const rows = dataset.legacyMockOverlayEnabled === true ? dedupeById([...generated, ...legacy]) : generated;
  return filter.caseId ? rows.filter((row) => row.caseId === filter.caseId) : rows;
}

export function listDocuments(dataset: SystemDataset = MULTI_CASE_DEMO_DATASET, filter: { caseId?: string } = {}): CaseDocument[] {
  if (!dataset.objectDomains.includes('document')) return [];
  const generated = dataset.documents.map((row) => toDocument(dataset, row));
  const rows = dataset.legacyMockOverlayEnabled === true ? dedupeById([...generated, ...MOCK_DOCUMENTS]) : generated;
  return filter.caseId ? rows.filter((row) => row.caseId === filter.caseId) : rows;
}

export function listRequests(dataset: SystemDataset = MULTI_CASE_DEMO_DATASET, filter: { caseId?: string } = {}): ServiceRequest[] {
  if (!dataset.objectDomains.includes('request')) return [];
  const generated = dataset.requests.map((row) => toRequest(row));
  const rows = dataset.legacyMockOverlayEnabled === true ? dedupeById([...generated, ...MOCK_REQUESTS]) : generated;
  return filter.caseId ? rows.filter((row) => row.caseId === filter.caseId) : rows;
}

export function listRequirements(dataset: SystemDataset = MULTI_CASE_DEMO_DATASET, caseId: string): CaseRequirement[] {
  return dataset.requirements.filter((row) => refMatchesCase(row.linkedObjects, caseId)).map(toRequirement);
}

export function listCommunications(dataset: SystemDataset = MULTI_CASE_DEMO_DATASET, caseId: string): CommunicationRecord[] {
  return dataset.communications.filter((row) => refMatchesCase(row.linkedObjects, caseId));
}

export function listActivityEvents(dataset: SystemDataset = MULTI_CASE_DEMO_DATASET, caseId: string): ActivityEventRecord[] {
  return dataset.activityEvents.filter((row) => refMatchesCase(row.linkedObjects, caseId));
}

function actionLinkedToCase(action: AiActionRecord, caseId: string): boolean {
  return (action.linkedObjects ?? []).some((ref) => ref.kind === 'case' && ref.id === caseId);
}

export function listAiActions(
  dataset: SystemDataset = MULTI_CASE_DEMO_DATASET,
  filter: { caseId?: string; status?: AiActionRecord['status']; sourceSurface?: AiActionRecord['sourceSurface'] } = {},
): AiActionRecord[] {
  const explicitIds = new Set(dataset.aiActions.map((action) => action.id));
  const rows = [
    ...dataset.aiActions,
    ...deriveAiActionsFromDataset(dataset).filter((action) => !explicitIds.has(action.id)),
  ];
  return rows
    .filter((action) => !filter.caseId || actionLinkedToCase(action, filter.caseId))
    .filter((action) => !filter.status || action.status === filter.status)
    .filter((action) => !filter.sourceSurface || action.sourceSurface === filter.sourceSurface)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getAiAction(dataset: SystemDataset = MULTI_CASE_DEMO_DATASET, actionId: string): AiActionRecord | undefined {
  return listAiActions(dataset).find((action) => action.id === actionId);
}

export function listRelatedObjects(dataset: SystemDataset, ref: ObjectRef): ObjectRef[] {
  const rows = listRelationships(dataset, ref);
  const related = rows.map((row) =>
    row.source.kind === ref.kind && row.source.id === ref.id ? row.target : row.source,
  );
  return dedupeRefs(related);
}

function relationshipId(source: ObjectRef, target: ObjectRef, relationship: string): string {
  return `${source.kind}-${source.id}-${target.kind}-${target.id}-${relationship}`.replace(/[^a-zA-Z0-9-]+/g, '-');
}

function isMainEntityKind(kind: WorkObjectKind): boolean {
  return ['case', 'client', 'policy', 'agent', 'application'].includes(kind);
}

function toRef(ref: ObjectRef): ObjectRef {
  return {
    ...ref,
    label: ref.label ?? ref.id,
    href: ref.href ?? resolveObjectLocation(ref),
  };
}

function pushRelationship(rows: ObjectRelationshipRow[], source: ObjectRef, target: ObjectRef, relationship: string, status?: string, effectiveDate?: string) {
  const sourceRef = toRef(source);
  const targetRef = toRef(target);
  const id = relationshipId(sourceRef, targetRef, relationship);
  if (rows.some((row) => row.id === id)) return;
  rows.push({
    id,
    source: sourceRef,
    target: targetRef,
    relationship,
    status,
    effectiveDate,
    scope: isMainEntityKind(sourceRef.kind) && isMainEntityKind(targetRef.kind) ? 'main_entity' : targetRef.kind === 'event' ? 'audit' : 'utility',
  });
}

export function listRelationships(dataset: SystemDataset, ref?: ObjectRef): ObjectRelationshipRow[] {
  const rows: ObjectRelationshipRow[] = [];
  dataset.cases.forEach((item) => {
    const source: ObjectRef = { kind: 'case', id: item.id, label: item.title, summary: item.status };
    pushRelationship(rows, source, item.primaryParty, item.primaryParty.role ?? 'primary party', item.status);
    item.participants.forEach((participant) => pushRelationship(rows, source, participant, participant.role ?? 'participant', item.status));
    (item.linkedObjects ?? []).forEach((target) => pushRelationship(rows, source, target, target.role ?? 'linked entity', item.status));
  });
  dataset.policies.forEach((policy) => {
    const source: ObjectRef = { kind: 'policy', id: policy.id, label: policy.label, summary: policy.status };
    policy.participants.forEach((participant) => {
      const client = dataset.clients.find((item) => item.id === participant.clientId);
      pushRelationship(rows, source, { kind: 'client', id: participant.clientId, label: client?.name ?? participant.clientId, role: participant.role }, participant.role, policy.status, participant.effectiveDate);
    });
    policy.agents.forEach((agent) => pushRelationship(rows, source, agent, agent.role ?? 'agent', policy.status));
    policy.linkedObjects.forEach((target) => pushRelationship(rows, source, target, target.role ?? 'linked entity', policy.status));
  });
  dataset.agents.forEach((agent) => {
    const source: ObjectRef = { kind: 'agent', id: agent.id, label: agent.name, summary: agent.status };
    agent.linkedObjects.forEach((target) => pushRelationship(rows, source, target, target.role ?? 'linked entity', agent.status));
  });
  dataset.applications.forEach((application) => {
    pushRelationship(
      rows,
      { kind: 'application', id: application.id, label: application.label, summary: application.status },
      { kind: 'client', id: application.clientId, label: dataset.clients.find((item) => item.id === application.clientId)?.name ?? application.clientId },
      'applicant',
      application.status,
    );
  });
  [
    ...dataset.tasks,
    ...dataset.requirements,
    ...dataset.documents,
    ...dataset.requests,
    ...dataset.communications,
    ...dataset.notes,
    ...dataset.activityEvents,
  ].forEach((item) => {
    if (!('linkedObjects' in item)) return;
    const source = toRef({ kind: item.kind as WorkObjectKind, id: item.id, label: 'label' in item ? item.label : 'subject' in item ? item.subject : 'body' in item ? item.body.slice(0, 64) : String((item as { id: string }).id) });
    (item.linkedObjects ?? []).forEach((target) => pushRelationship(rows, source, target, target.role ?? 'linked object'));
  });
  if (!ref) return rows;
  return rows.filter((row) =>
    (row.source.kind === ref.kind && row.source.id === ref.id) ||
    (row.target.kind === ref.kind && row.target.id === ref.id),
  );
}

function dedupeRefs(refs: ObjectRef[]): ObjectRef[] {
  const seen = new Set<string>();
  return refs.filter((ref) => {
    const key = `${ref.kind}:${ref.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeById<T extends { id: string | number }>(rows: T[]): T[] {
  const seen = new Set<string | number>();
  return rows.filter((row) => {
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });
}

export function getEntity(dataset: SystemDataset, kind: WorkObjectKind, id: string): unknown {
  switch (kind) {
    case 'case': return dataset.cases.find((row) => row.id === id);
    case 'client': return dataset.clients.find((row) => row.id === id);
    case 'policy': return dataset.policies.find((row) => row.id === id);
    case 'agent': return dataset.agents.find((row) => row.id === id);
    case 'application': return dataset.applications.find((row) => row.id === id);
    case 'requirement': return dataset.requirements.find((row) => row.id === id);
    case 'task': return dataset.tasks.find((row) => row.id === id);
    case 'request': return dataset.requests.find((row) => row.id === id);
    case 'document': return dataset.documents.find((row) => row.id === id);
    case 'communication': return dataset.communications.find((row) => row.id === id);
    case 'note': return dataset.notes.find((row) => row.id === id);
    case 'event': return dataset.activityEvents.find((row) => row.id === id);
    default: return undefined;
  }
}

export function listCaseSummaries(dataset: SystemDataset = MULTI_CASE_DEMO_DATASET): CaseSummary[] {
  if (!dataset.objectDomains.includes('case')) return [];
  const includeLegacyClaims = dataset.legacyMockOverlayEnabled === true && (dataset.enabledBusinessLines?.includes('claim') ?? true);
  const generated = dataset.cases.map((record) => caseRecordToLegacySummary(record, dataset));
  const generatedIds = new Set(generated.map((item) => item.id));
  return [
    ...generated,
    ...(includeLegacyClaims ? MOCK_CASES.filter((summary) => !generatedIds.has(summary.id)).map((summary) => ({
      ...summary,
      caseKind: summary.caseKind ?? 'claim',
      caseTypeCode: summary.caseTypeCode ?? parseCaseTypeCodeFromId(summary.id) ?? 'IP',
      claimSubType: summary.claimSubType ?? resolveClaimSubType({
        caseKind: summary.caseKind ?? 'claim',
        caseTypeCode: summary.caseTypeCode ?? parseCaseTypeCodeFromId(summary.id) ?? 'IP',
        claimDetails: undefined,
      }),
      workflowTemplateId: summary.workflowTemplateId ?? 'claim-income-protection',
      primaryPartyName: summary.primaryPartyName ?? summary.claimant,
      primaryPartyLabel: summary.primaryPartyLabel ?? 'Claimant',
    })) : []),
  ];
}

export function caseRecordToLegacySummary(record: CaseRecord, dataset: SystemDataset = MULTI_CASE_DEMO_DATASET): CaseSummary {
  const workflow = getWorkflowDefinition(record.workflowTemplateId);
  const facts = record.facts ?? [];
  const productFact = facts.find((fact) => fact.id === 'product' || fact.category === 'application');
  const financialFact = facts.find((fact) => fact.category === 'financial');
  const linkedPolicy = (record.linkedObjects ?? []).find((ref) => ref.kind === 'policy');
  const createdDate = record.createdAt
    ? new Date(record.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Dataset record';
  const normalizedPriority = record.priority === 'Urgent' ? 'Urgent' : record.priority === 'High' ? 'High' : 'Normal';
  const primaryParty = record.primaryParty ?? { kind: 'client' as const, id: `${record.id}-party`, label: 'Unknown' };
  return {
    id: record.id,
    caseKind: record.caseKind,
    caseTypeCode: record.caseTypeCode,
    workflowTemplateId: record.workflowTemplateId,
    title: record.title,
    claimant: primaryParty.label ?? primaryParty.id,
    primaryPartyName: primaryParty.label ?? primaryParty.id,
    primaryPartyLabel: workflow?.primaryPartyLabel ?? 'Primary party',
    primaryPartyPolicyRole: getPrimaryPartyPolicyRole(dataset, record),
    product: productFact?.value ?? workflow?.label ?? record.caseTypeCode,
    benefit: financialFact?.value ?? 'N/A',
    status: record.status,
    phase: record.phaseId === 'post-approval' ? 'post-approval' : 'pre-approval',
    rag: normalizedPriority === 'Urgent' || normalizedPriority === 'High' ? 'Amber' : 'Green',
    aiRecommendation:
      record.caseKind === 'claim'
        ? 'Pending'
        : record.caseKind === 'customer_service'
          ? 'Monitor'
          : 'Pending',
    aiSummary: record.analysis?.narrative ?? facts.map((fact) => `${fact.label}: ${fact.value}`).join(' · '),
    priority: normalizedPriority,
    sla: normalizedPriority === 'Urgent' || normalizedPriority === 'High' ? 'Today' : '2d',
    created: createdDate,
    policyNumber: linkedPolicy?.id,
    linkedObjects: record.linkedObjects ?? [],
    claimSubType: resolveClaimSubType(record),
  };
}

function listObjectRefs(dataset: SystemDataset, kind?: WorkObjectKind): ObjectRef[] {
  const refs: ObjectRef[] = [
    ...dataset.cases.map((item) => ({
      kind: 'case' as const,
      id: item.id,
      label: item.title,
      role: item.caseKind,
      summary: item.status,
    })),
    ...dataset.clients.map((item) => ({
      kind: 'client' as const,
      id: item.id,
      label: item.name,
      summary: item.summary,
    })),
    ...dataset.policies.map((item) => ({
      kind: 'policy' as const,
      id: item.id,
      label: item.label,
      summary: `${item.product} · ${item.status}`,
    })),
    ...dataset.agents.map((item) => ({
      kind: 'agent' as const,
      id: item.id,
      label: item.name,
      summary: `${item.agencyName ?? 'Agent'} · ${item.status}`,
    })),
    ...dataset.applications.map((item) => ({
      kind: 'application' as const,
      id: item.id,
      label: item.label,
      summary: `${item.product} · ${item.status}`,
    })),
    ...dataset.tasks.map((item) => ({
      kind: 'task' as const,
      id: item.id,
      label: item.label,
      summary: `${item.priority} · ${item.status}`,
    })),
    ...dataset.requirements.map((item) => ({
      kind: 'requirement' as const,
      id: item.id,
      label: item.label,
      summary: `${item.category} · ${item.status}`,
    })),
    ...dataset.documents.map((item) => ({
      kind: 'document' as const,
      id: item.id,
      label: item.label,
      summary: `${item.category} · ${item.status}`,
    })),
    ...dataset.requests.map((item) => ({
      kind: 'request' as const,
      id: item.id,
      label: item.label,
      summary: `${item.source} · ${item.status}`,
    })),
    ...dataset.communications.map((item) => ({
      kind: 'communication' as const,
      id: item.id,
      label: item.subject,
      summary: `${item.channel} · ${item.status}`,
    })),
    ...dataset.notes.map((item) => ({
      kind: 'note' as const,
      id: item.id,
      label: item.body.slice(0, 64),
      summary: `${item.author} · ${item.visibility}`,
    })),
    ...dataset.activityEvents.map((item) => ({
      kind: 'event' as const,
      id: item.id,
      label: item.label,
      summary: `${item.actor} · ${item.timestamp}`,
    })),
  ];
  return kind ? refs.filter((ref) => ref.kind === kind) : refs;
}

export function createCaseRecordFromLegacySummary(summary: CaseSummary): CaseRecord {
  const caseTypeCode = summary.caseTypeCode ?? parseCaseTypeCodeFromId(summary.id) ?? 'IP';
  const caseKind = summary.caseKind ?? 'claim';
  const workflowTemplateId = summary.workflowTemplateId ?? 'claim-income-protection';
  const workflow = getWorkflowDefinition(workflowTemplateId);
  const primaryParty: ObjectRef = {
    kind: 'client',
    id: `CLI-${summary.claimant.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`,
    label: summary.primaryPartyName ?? summary.claimant,
    role: workflow?.primaryPartyLabel.toLowerCase() ?? 'primary party',
    policyRole: summary.primaryPartyPolicyRole,
    href: `/cases/${summary.id}`,
  };

  return {
    id: summary.id,
    kind: 'case',
    caseKind,
    caseTypeCode,
    workflowTemplateId,
    title: summary.title ?? `${workflow?.caseNoun ?? 'Case'} ${summary.id}`,
    status: summary.status,
    priority: summary.priority,
    phaseId: summary.phase,
    primaryParty,
    participants: [{ ...primaryParty, kind: 'client', role: primaryParty.role ?? 'primary party' }],
    linkedObjects: [
      ...(summary.policyNumber
        ? [{ kind: 'policy' as const, id: summary.policyNumber, label: summary.policyNumber }]
        : []),
      ...(summary.linkedObjects ?? []),
    ],
    moduleSummaries: [],
    facts: [
      { id: 'product', label: 'Product', value: summary.product, category: 'case', importance: 'primary' },
      { id: 'financial', label: 'Financial value', value: summary.benefit, category: 'financial' },
      { id: 'sla', label: 'SLA', value: summary.sla, category: 'operations' },
    ],
    sections: [
      {
        id: 'summary',
        label: workflow?.caseNoun ?? 'Case',
        defaultOpen: true,
        fields: [
          { id: 'primary-party', label: workflow?.primaryPartyLabel ?? 'Primary party', value: summary.claimant, objectRef: primaryParty },
          { id: 'product', label: 'Product', value: summary.product },
          { id: 'status', label: 'Status', value: summary.status },
        ],
      },
    ],
    ...(caseKind === 'claim'
      ? {
          claimDetails: {
            claimSubType: summary.claimSubType ?? resolveClaimSubType({ caseKind: 'claim', caseTypeCode, claimDetails: undefined }),
            claimNumber: summary.id,
          },
        }
      : {}),
  };
}

export const ACTIVE_OBJECT_REPOSITORY = createObjectRepository();

export const LEGACY_OBJECT_COUNTS = {
  cases: MOCK_CASES.length,
  tasks: MY_TASKS.length + TEAM_TASKS.length,
  documents: MOCK_DOCUMENTS.length,
  requests: MOCK_REQUESTS.length,
};
