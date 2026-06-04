import { validateSystemDataset } from './dataQualityGuards';
import { datasetRegistry } from './datasetRegistry';
import { migrateSystemDataset } from './generatedDatasetRepository';
import type {
  DatasetDocumentRecord,
  DatasetRequestRecord,
  DatasetRequirementRecord,
  DatasetTaskRecord,
  SystemDataset,
} from './multi-case-dataset';
import type { RequestSubmittedForm, RequestSystemStep, RequestSystemStepKind, RequestTimelineAction } from '../types';
import { SIMPLE_SERVICE_WORKFLOWS, type SimpleServiceWorkflowId } from '../domain/workflows/simpleServiceWorkflows';
import { isSimpleServiceRequestCategory } from './simpleServiceRules';
import { findRelationshipIssues } from '../domain/dataArchitecture';
import {
  caseTypeCodeForClaimSubType,
  caseTypeMetadataForSubType,
  normalizeCaseSubTypeForStorage,
} from '../domain/claimSubTypes';
import { DEFAULT_DATASET_ID, type CaseKind, CaseRecord, ClaimSubType, ObjectRef, WorkObjectKind } from '../domain/objectRefs';
import { getActiveDemoConfigurationId } from './datasetResolutionContext';
import {
  applyEquisoftNb66ReqGatheringOverlay,
  isSharedMultiCaseDemoDatasetId,
} from './equisoftNb66ReqGatheringOverlay';
import { applyEmpireAddressChangeOverlay, isEmpireDatasetId } from './empireAddressChangeOverlay';
import { usesSbliBrandedDemoData } from './sharedDemoDatasetNeutralize';
import { getWorkflowDefinition } from '../domain/workflows';
import { resolveAssigneeIdentity } from './userDirectory';

export type MutationResult<T = unknown> = {
  datasetId: string;
  dataset: SystemDataset;
  record: T;
};

type WritableDataset = {
  dataset: SystemDataset;
  datasetId: string;
};

function nowId() {
  return Date.now().toString(36);
}

function caseTypeCodeForNewCase(caseKind: CaseKind, claimSubType?: ClaimSubType): string {
  if (caseKind === 'claim') {
    return caseTypeCodeForClaimSubType(claimSubType ?? 'disability_benefit');
  }
  const map = {
    new_business: 'NB',
    customer_service: 'CS',
    agent_onboarding: 'AGT',
  } as const satisfies Record<Exclude<CaseKind, 'claim'>, string>;
  return map[caseKind];
}

function isGeneratedDataset(datasetId: string) {
  return datasetRegistry.listMetadata().some((metadata) => metadata.id === datasetId && metadata.readonly === false);
}

function cloneDataset(dataset: SystemDataset): SystemDataset {
  return structuredClone(dataset);
}

function withDemoWriteOverlays(dataset: SystemDataset): SystemDataset {
  if (usesSbliBrandedDemoData(getActiveDemoConfigurationId())) return dataset;
  if (isSharedMultiCaseDemoDatasetId(dataset.id)) {
    return applyEquisoftNb66ReqGatheringOverlay(dataset, {
      preserveAddedProposals: dataset.id !== DEFAULT_DATASET_ID,
    });
  }
  if (isEmpireDatasetId(dataset.id)) {
    return applyEmpireAddressChangeOverlay(dataset);
  }
  return dataset;
}

/** Apply demo overlays when branching a writable copy from a seeded dataset. */
function withEquisoftNb66GatheringForWrite(dataset: SystemDataset): SystemDataset {
  return withDemoWriteOverlays(dataset);
}

function getWritableDataset(datasetId: string): WritableDataset {
  const source = withEquisoftNb66GatheringForWrite(datasetRegistry.getDataset(datasetId));
  if (isGeneratedDataset(source.id)) {
    return { dataset: cloneDataset(source), datasetId: source.id };
  }
  const copyId = `${source.id}-workspace-copy-${nowId()}`;
  return {
    dataset: {
      ...cloneDataset(source),
      id: copyId,
      label: `${source.label} workspace`,
      description: `${source.description} Local editable workspace copy.`,
      schemaVersion: source.schemaVersion,
    },
    datasetId: copyId,
  };
}

function linkedCaseIds(row: { linkedObjects?: ObjectRef[] }) {
  return row.linkedObjects?.filter((ref) => ref.kind === 'case').map((ref) => ref.id) ?? [];
}

function recomputeCaseModuleSummaries(dataset: SystemDataset) {
  dataset.cases = dataset.cases.map((caseRecord) => {
    const matchesCase = (row: { linkedObjects?: ObjectRef[] }) => linkedCaseIds(row).includes(caseRecord.id);
    const tasks = dataset.tasks.filter(matchesCase);
    const requirements = dataset.requirements.filter(matchesCase);
    const documents = dataset.documents.filter(matchesCase);
    const requests = dataset.requests.filter(matchesCase);
    const communications = dataset.communications.filter(matchesCase);
    return {
      ...caseRecord,
      moduleSummaries: [
        { module: 'tasks' as const, total: tasks.length, attention: tasks.filter((row) => row.status !== 'Completed').length },
        { module: 'requirements' as const, total: requirements.length, attention: requirements.filter((row) => !['Fulfilled', 'Completed', 'Waived'].includes(row.status)).length },
        { module: 'documents' as const, total: documents.length, completed: documents.filter((row) => row.status === 'Validated').length },
        { module: 'requests' as const, total: requests.length, attention: requests.filter((row) => row.status !== 'Completed').length },
        { module: 'communications' as const, total: communications.length },
      ],
    };
  });
}

function commitDataset(dataset: SystemDataset) {
  recomputeCaseModuleSummaries(dataset);
  const normalized = migrateSystemDataset(dataset);
  const validation = validateSystemDataset(normalized);
  const relationshipIssues = findRelationshipIssues(normalized);
  if (validation.errors.length || relationshipIssues.length) {
    throw new Error([...validation.errors, ...relationshipIssues.map((issue) => issue.message)].join(' '));
  }
  datasetRegistry.saveDataset(normalized);
  return normalized;
}

function sequence(prefix: string, rows: Array<{ id: string }>) {
  return `${prefix}-${String(rows.length + 1).padStart(4, '0')}-${nowId().toUpperCase()}`;
}

export function objectRef(ref: ObjectRef): ObjectRef {
  return { ...ref, label: ref.label ?? ref.id };
}

function addUniqueRef(refs: ObjectRef[], ref: ObjectRef) {
  if (refs.some((item) => item.kind === ref.kind && item.id === ref.id)) return refs;
  return [...refs, objectRef(ref)];
}

function findPolicyRef(dataset: SystemDataset, policyNumber?: string): ObjectRef | undefined {
  if (!policyNumber) return undefined;
  const policy = dataset.policies.find((item) =>
    item.id === policyNumber || item.policyNumber === policyNumber || item.label === policyNumber,
  );
  return policy ? { kind: 'policy', id: policy.id, label: policy.label } : undefined;
}

export type CreateRequestInput = {
  title: string;
  category?: DatasetRequestRecord['category'];
  priority?: DatasetRequestRecord['priority'];
  due?: string;
  source: string;
  sourceChannel?: DatasetRequestRecord['sourceChannel'];
  sourceDetail?: string;
  requester?: string;
  clientId?: string;
  caseId?: string;
  policyNumber?: string;
  requirementId?: string;
  notes?: string;
  assignedTo?: string;
  templateId?: string;
  requestMode?: string;
  tasks?: Array<{
    title: string;
    type: string;
    assignee: string;
    dueWindow: string;
    description: string;
  }>;
};

export function createRequest(datasetId: string, input: CreateRequestInput): MutationResult<DatasetRequestRecord> {
  const writable = getWritableDataset(datasetId);
  const dataset = writable.dataset;
  const assignee = resolveAssigneeIdentity(input.assignedTo);
  let linkedObjects: ObjectRef[] = [];
  if (input.caseId) linkedObjects = addUniqueRef(linkedObjects, { kind: 'case', id: input.caseId, label: input.caseId });
  if (input.clientId) {
    const client = dataset.clients.find((item) => item.id === input.clientId);
    linkedObjects = addUniqueRef(linkedObjects, { kind: 'client', id: input.clientId, label: client?.name ?? input.clientId });
  }
  const policyRef = findPolicyRef(dataset, input.policyNumber);
  if (policyRef) linkedObjects = addUniqueRef(linkedObjects, policyRef);
  if (input.requirementId) {
    const req = dataset.requirements.find((item) => item.id === input.requirementId);
    linkedObjects = addUniqueRef(linkedObjects, { kind: 'requirement', id: input.requirementId, label: req?.label ?? input.requirementId });
  }

  const request: DatasetRequestRecord = {
    id: sequence('REQ', dataset.requests),
    kind: 'request',
    label: input.title,
    status: 'New',
    source: input.source,
    category: input.category,
    priority: input.priority,
    received: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    sourceChannel: input.sourceChannel,
    sourceDetail: input.sourceDetail,
    requester: input.requester,
    clientId: input.clientId,
    policyNumber: input.policyNumber,
    assignedTo: assignee.assigneeValue,
    assigneeId: assignee.assigneeId,
    assigneeKind: assignee.assigneeKind,
    due: input.due,
    notes: input.notes,
    templateId: input.templateId,
    requestMode: input.requestMode,
    aiSummary: input.notes || `Manual request created: ${input.title}.`,
    nextAction: input.tasks?.length ? 'Review chained follow-up tasks' : 'Review request',
    systemSteps: [
      { id: `${nowId()}-received`, kind: 'review_required', status: 'awaiting_review', title: 'Review manual request' },
      ...(input.caseId ? [{ id: `${nowId()}-case`, kind: 'create_case' as const, status: 'completed' as const, title: 'Linked to case' }] : []),
    ],
    linkedObjects,
  };

  const createdTasks: DatasetTaskRecord[] = (input.tasks ?? [])
    .filter((task) => task.title.trim())
    .map((task, index) => {
      const taskAssignee = resolveAssigneeIdentity(task.assignee);
      return {
        id: sequence('TSK', [...dataset.tasks, ...Array.from({ length: index }, (_, offset) => ({ id: `pending-${offset}` }))]),
        kind: 'task',
        label: task.title,
        status: 'To Do',
        priority: input.priority ?? 'Normal',
        assignee: taskAssignee.assigneeValue,
        assigneeId: taskAssignee.assigneeId,
        assigneeKind: taskAssignee.assigneeKind,
        hasAI: false,
        aiSummary: task.description,
        slaRemaining: task.dueWindow || input.due || '2d',
        slaStatus: 'normal',
        origin: task.type || 'Manual request',
        sourceContext: 'request_creation',
        createdFrom: { kind: 'request', id: request.id, label: request.label },
        createdDate: new Date().toISOString(),
        description: task.description,
        queue: task.assignee?.toLowerCase().includes('queue') ? 'team_tasks' : 'my_tasks',
        requiredAuthorityLevel: 1,
        linkedObjects: addUniqueRef(linkedObjects, { kind: 'request', id: request.id, label: request.label }),
        panelContext: {
          summaryStatus: 'Manual',
          contextTitle: task.type || 'Follow-up task',
          contextSummary: task.description || `Follow up on ${request.label}.`,
          suggestions: ['Review linked request', 'Complete the assigned follow-up', 'Document outcome'],
        },
      };
    });

  dataset.requests = [request, ...dataset.requests];
  dataset.tasks = [...createdTasks, ...dataset.tasks];
  const saved = commitDataset(dataset);
  return { datasetId: saved.id, dataset: saved, record: request };
}

export type CreateTaskInput = {
  title: string;
  description?: string;
  priority: string;
  assignee: string;
  dueWindow: string;
  queue: 'my_tasks' | 'team_tasks';
  caseId?: string;
  linkedObjects?: ObjectRef[];
  origin?: string;
};

export function createTask(datasetId: string, input: CreateTaskInput): MutationResult<DatasetTaskRecord> {
  const writable = getWritableDataset(datasetId);
  const dataset = writable.dataset;
  let linkedObjects = [...(input.linkedObjects ?? [])];
  if (input.caseId) linkedObjects = addUniqueRef(linkedObjects, { kind: 'case', id: input.caseId, label: input.caseId });
  const caseRecord = input.caseId ? dataset.cases.find((item) => item.id === input.caseId) : undefined;
  const assignee = resolveAssigneeIdentity(input.assignee);
  const task: DatasetTaskRecord = {
    id: sequence('TSK', dataset.tasks),
    kind: 'task',
    label: input.title,
    status: 'To Do',
    priority: input.priority,
    assignee: assignee.assigneeValue,
    assigneeId: assignee.assigneeId,
    assigneeKind: assignee.assigneeKind,
    caseType: caseRecord?.caseTypeCode,
    hasAI: false,
    aiSummary: input.description,
    slaRemaining: input.dueWindow,
    slaStatus: 'normal',
    origin: input.origin ?? caseRecord?.activeStepId ?? 'Manual task',
    sourceContext: input.caseId ? 'case_view' : 'task_module',
    createdFrom: input.caseId ? { kind: 'case', id: input.caseId, label: caseRecord?.title ?? input.caseId } : undefined,
    createdDate: new Date().toISOString(),
    description: input.description,
    queue: input.queue,
    requiredAuthorityLevel: 1,
    linkedObjects,
    panelContext: {
      summaryStatus: 'Manual',
      contextTitle: input.origin ?? 'Manual task',
      contextSummary: input.description ?? `Manual task created for ${caseRecord?.title ?? input.caseId ?? 'the workspace'}.`,
      suggestions: ['Review linked context', 'Complete the task', 'Document the outcome'],
    },
  };
  dataset.tasks = [task, ...dataset.tasks];
  const saved = commitDataset(dataset);
  return { datasetId: saved.id, dataset: saved, record: task };
}

export type CreateCaseInput = {
  caseKind: CaseKind;
  /** Claim: `claimDetails.claimSubType`. New business: `caseSubType` on the case record. */
  claimSubType?: ClaimSubType;
  primaryPartyId: string;
  policyId?: string;
  applicationId?: string;
  agentId?: string;
  assignee: string;
  title?: string;
  priority?: string;
  initialFact?: string;
};

export function createCase(datasetId: string, input: CreateCaseInput): MutationResult<CaseRecord> {
  const writable = getWritableDataset(datasetId);
  const dataset = writable.dataset;
  const client = dataset.clients.find((item) => item.id === input.primaryPartyId);
  const agent = dataset.agents.find((item) => item.id === input.primaryPartyId || item.id === input.agentId);
  const primaryParty: ObjectRef = input.caseKind === 'agent_onboarding' && agent
    ? { kind: 'agent', id: agent.id, label: agent.name, role: 'agent' }
    : { kind: 'client', id: client?.id ?? input.primaryPartyId, label: client?.name ?? input.primaryPartyId, role: 'primary party', policyRole: 'Insured' };
  const storedSubType = normalizeCaseSubTypeForStorage(input.caseKind, input.claimSubType);
  const subtypeMeta = storedSubType ? caseTypeMetadataForSubType(input.caseKind, storedSubType) : undefined;
  const workflowId =
    subtypeMeta?.workflowTemplateId
    ?? (input.caseKind === 'new_business'
      ? 'new-business-application'
      : input.caseKind === 'customer_service'
        ? 'customer-service-case'
        : input.caseKind === 'agent_onboarding'
          ? 'agent-onboarding'
          : 'claim-income-protection');
  const matchedWorkflow = getWorkflowDefinition(workflowId);
  let linkedObjects: ObjectRef[] = [];
  if (primaryParty.kind === 'client') linkedObjects = addUniqueRef(linkedObjects, primaryParty);
  if (input.policyId) {
    const policy = dataset.policies.find((item) => item.id === input.policyId);
    if (policy) linkedObjects = addUniqueRef(linkedObjects, { kind: 'policy', id: policy.id, label: policy.label });
  }
  if (input.applicationId) {
    const app = dataset.applications.find((item) => item.id === input.applicationId);
    if (app) linkedObjects = addUniqueRef(linkedObjects, { kind: 'application', id: app.id, label: app.label });
  }
  if (input.agentId) {
    const linkedAgent = dataset.agents.find((item) => item.id === input.agentId);
    if (linkedAgent) linkedObjects = addUniqueRef(linkedObjects, { kind: 'agent', id: linkedAgent.id, label: linkedAgent.name });
  }
  const assignee = resolveAssigneeIdentity(input.assignee);
  const defaultTitle =
    subtypeMeta?.caseTypeLabel
    ?? `${matchedWorkflow?.label ?? input.caseKind.replace('_', ' ')} ${dataset.cases.length + 1}`;
  const caseRecord: CaseRecord = {
    id: sequence('CASE', dataset.cases),
    kind: 'case',
    caseKind: input.caseKind,
    ...(subtypeMeta
      ? {
          caseTypeId: subtypeMeta.caseTypeId,
          caseTypeLabel: subtypeMeta.caseTypeLabel,
          workflowTemplateId: subtypeMeta.workflowTemplateId,
        }
      : { workflowTemplateId: matchedWorkflow?.id ?? workflowId }),
    caseTypeCode: caseTypeCodeForNewCase(input.caseKind, storedSubType),
    ...(storedSubType ? { caseSubType: storedSubType } : {}),
    title: input.title?.trim() || defaultTitle,
    status: 'New',
    createdAt: new Date().toISOString(),
    priority: input.priority ?? 'Normal',
    phaseId: matchedWorkflow?.phases[0]?.id,
    activeStepId: matchedWorkflow?.steps[0]?.id,
    assignee: { kind: 'event', id: assignee.assigneeId ?? assignee.assigneeValue, label: assignee.assigneeValue, role: assignee.assigneeKind ?? 'assignee' },
    assigneeId: assignee.assigneeId,
    assigneeKind: assignee.assigneeKind,
    primaryParty,
    participants: primaryParty.kind === 'client' ? [{ ...primaryParty, kind: 'client', role: primaryParty.role ?? 'primary party' }] : [],
    linkedObjects,
    moduleSummaries: [],
    facts: input.initialFact?.trim()
      ? [{
          id: `${nowId()}-initial-fact`,
          label: 'Initial briefing',
          value: input.initialFact.trim(),
          category: 'Intake',
          importance: 'primary',
        }]
      : [],
    sections: [{
      id: `${nowId()}-intake`,
      label: 'Intake briefing',
      defaultOpen: true,
      fields: [
        { id: 'case-type', label: 'Case type', value: input.caseKind.replace('_', ' ') },
        { id: 'assignee', label: 'Assignee', value: assignee.assigneeValue },
        ...(input.initialFact?.trim() ? [{ id: 'initial-fact', label: 'Initial fact', value: input.initialFact.trim() }] : []),
      ],
    }],
    ...(input.caseKind === 'claim' && storedSubType
      ? { claimDetails: { claimSubType: storedSubType } }
      : {}),
  };
  dataset.cases = [caseRecord, ...dataset.cases];
  const saved = commitDataset(dataset);
  return { datasetId: saved.id, dataset: saved, record: saved.cases.find((item) => item.id === caseRecord.id) ?? caseRecord };
}

export function updateTaskStatus(datasetId: string, taskId: string, status: string): MutationResult<DatasetTaskRecord | null> {
  const writable = getWritableDataset(datasetId);
  const dataset = writable.dataset;
  let updated: DatasetTaskRecord | null = null;
  dataset.tasks = dataset.tasks.map((task) => {
    if (task.id !== taskId) return task;
    updated = { ...task, status };
    return updated;
  });
  const saved = commitDataset(dataset);
  return { datasetId: saved.id, dataset: saved, record: updated };
}

export function updateRequestStatus(datasetId: string, requestId: string, status: string): MutationResult<DatasetRequestRecord | null> {
  const writable = getWritableDataset(datasetId);
  const dataset = writable.dataset;
  let updated: DatasetRequestRecord | null = null;
  dataset.requests = dataset.requests.map((request) => {
    if (request.id !== requestId) return request;
    updated = { ...request, status };
    return updated;
  });
  const saved = commitDataset(dataset);
  return { datasetId: saved.id, dataset: saved, record: updated };
}

export function applyNb66SuggestedRequirements(
  datasetId: string,
  caseId: string,
  requirementIds: string[],
  templates: Record<string, DatasetRequirementRecord>,
  linkedTaskByRequirement: Record<string, string>,
): MutationResult<{ added: DatasetRequirementRecord[] }> {
  const writable = getWritableDataset(datasetId);
  const dataset = writable.dataset;
  const added: DatasetRequirementRecord[] = [];

  for (const requirementId of requirementIds) {
    const template = templates[requirementId];
    if (!template) continue;
    const exists = dataset.requirements.some((row) => row.id === requirementId);
    if (exists) continue;

    dataset.requirements = [structuredClone(template), ...dataset.requirements];
    added.push(template);

    const taskId = linkedTaskByRequirement[requirementId];
    if (taskId) {
      dataset.tasks = dataset.tasks.map((task) =>
        task.id === taskId && taskLinkedToCase(task, caseId)
          ? { ...task, status: 'In Queue', queue: task.queue ?? 'my_tasks' }
          : task,
      );
    }
  }

  const saved = commitDataset(dataset);
  return { datasetId: saved.id, dataset: saved, record: { added } };
}

function taskLinkedToCase(
  task: DatasetTaskRecord,
  caseId: string,
): boolean {
  return task.linkedObjects.some((ref) => ref.kind === 'case' && ref.id === caseId);
}

export function upsertRequirement(
  datasetId: string,
  input: {
    id?: string;
    caseId: string;
    label: string;
    category: string;
    dueDate?: string;
    followUpDate?: string;
    phase?: string;
    notes?: string;
  },
): MutationResult<DatasetRequirementRecord> {
  const writable = getWritableDataset(datasetId);
  const dataset = writable.dataset;
  const existing = input.id ? dataset.requirements.find((item) => item.id === input.id) : undefined;
  const record: DatasetRequirementRecord = {
    id: existing?.id ?? sequence('REQM', dataset.requirements),
    kind: 'requirement',
    label: input.label,
    category: input.category,
    status: existing?.status ?? 'Pending',
    rag: existing?.rag ?? 'Amber',
    dueDate: input.dueDate,
    followUpDate: input.followUpDate,
    source: existing?.source ?? 'manual',
    trigger: input.notes || existing?.trigger || 'Assessor',
    phase: input.phase ?? existing?.phase,
    linkedObjects: addUniqueRef(existing?.linkedObjects ?? [], { kind: 'case', id: input.caseId, label: input.caseId }),
  };
  dataset.requirements = existing
    ? dataset.requirements.map((item) => (item.id === existing.id ? record : item))
    : [record, ...dataset.requirements];
  const saved = commitDataset(dataset);
  return { datasetId: saved.id, dataset: saved, record };
}

export function linkObject(datasetId: string, source: ObjectRef, target: ObjectRef): MutationResult<ObjectRef | null> {
  const writable = getWritableDataset(datasetId);
  const dataset = writable.dataset;
  const rows = getRowsByWorkKind(dataset, source.kind);
  let record: { id: string; linkedObjects?: ObjectRef[] } | undefined;
  rows.forEach((row) => {
    if (row.id === source.id) record = row;
  });
  if (!record) {
    throw new Error(`Cannot link ${source.kind} ${source.id}; source record was not found.`);
  }
  record.linkedObjects = addUniqueRef(record.linkedObjects ?? [], target);
  const saved = commitDataset(dataset);
  return { datasetId: saved.id, dataset: saved, record: target };
}

function getRowsByWorkKind(dataset: SystemDataset, kind: WorkObjectKind): Array<{ id: string; linkedObjects?: ObjectRef[] }> {
  switch (kind) {
    case 'case':
      return dataset.cases;
    case 'task':
      return dataset.tasks;
    case 'request':
      return dataset.requests;
    case 'requirement':
      return dataset.requirements;
    case 'document':
      return dataset.documents;
    case 'communication':
      return dataset.communications;
    case 'event':
      return dataset.activityEvents;
    default:
      return [];
  }
}

function hasDependency(dataset: SystemDataset, target: ObjectRef) {
  const linkedObjectDependency = [
    ...dataset.tasks,
    ...dataset.requests,
    ...dataset.requirements,
    ...dataset.documents,
    ...dataset.communications,
    ...dataset.activityEvents,
    ...dataset.cases,
  ].some((row) => row.id !== target.id && row.linkedObjects?.some((ref) => ref.kind === target.kind && ref.id === target.id));
  if (linkedObjectDependency) return true;
  if (target.kind === 'client') {
    return dataset.policies.some((policy) => policy.clientId === target.id || policy.participants.some((participant) => participant.clientId === target.id))
      || dataset.applications.some((application) => application.clientId === target.id)
      || dataset.requests.some((request) => request.clientId === target.id);
  }
  if (target.kind === 'policy') {
    const targetPolicy = dataset.policies.find((policy) => policy.id === target.id);
    return dataset.requests.some((request) => request.policyNumber === target.id || request.policyNumber === targetPolicy?.policyNumber)
      || dataset.documents.some((document) => document.linkedCase === target.id);
  }
  if (target.kind === 'application') {
    return dataset.cases.some((caseRecord) => caseRecord.linkedObjects.some((ref) => ref.kind === 'application' && ref.id === target.id));
  }
  if (target.kind === 'case') {
    return [
      ...dataset.tasks,
      ...dataset.requests,
      ...dataset.requirements,
      ...dataset.documents,
      ...dataset.communications,
      ...dataset.activityEvents,
    ].some((row) => row.linkedObjects?.some((ref) => ref.kind === 'case' && ref.id === target.id));
  }
  return false;
}

export function deleteEntity(datasetId: string, target: ObjectRef): MutationResult<boolean> {
  const writable = getWritableDataset(datasetId);
  const dataset = writable.dataset;
  if (hasDependency(dataset, target)) {
    throw new Error(`Cannot delete ${target.kind} ${target.id}; other records still reference it.`);
  }
  switch (target.kind) {
    case 'case':
      dataset.cases = dataset.cases.filter((item) => item.id !== target.id);
      break;
    case 'task':
      dataset.tasks = dataset.tasks.filter((item) => item.id !== target.id);
      break;
    case 'request':
      dataset.requests = dataset.requests.filter((item) => item.id !== target.id);
      break;
    case 'requirement':
      dataset.requirements = dataset.requirements.filter((item) => item.id !== target.id);
      break;
    case 'document':
      dataset.documents = dataset.documents.filter((item) => item.id !== target.id);
      break;
    case 'communication':
      dataset.communications = dataset.communications.filter((item) => item.id !== target.id);
      break;
    case 'event':
      dataset.activityEvents = dataset.activityEvents.filter((item) => item.id !== target.id);
      break;
    default:
      throw new Error(`Delete is not supported for ${target.kind}.`);
  }
  const saved = commitDataset(dataset);
  return { datasetId: saved.id, dataset: saved, record: true };
}

export type WorkflowActorContext = {
  name: string;
  userId?: string;
};

function timelineTimestamp(): string {
  return new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function humanTimelineEntry(
  actor: WorkflowActorContext,
  action: string,
  detail: string,
): RequestTimelineAction {
  return {
    ts: timelineTimestamp(),
    actor: actor.name,
    actorType: 'Human',
    icon: 'ti-user',
    dotCls: 'rp-tl-dot-human',
    action,
    detail,
  };
}

function findRequest(dataset: SystemDataset, requestId: string) {
  return dataset.requests.find((row) => row.id === requestId);
}

function findTask(dataset: SystemDataset, taskId: string) {
  return dataset.tasks.find((row) => row.id === taskId);
}

export function appendRequestHumanAction(
  datasetId: string,
  requestId: string,
  actor: WorkflowActorContext,
  action: string,
  detail: string,
): MutationResult<DatasetRequestRecord | null> {
  const writable = getWritableDataset(datasetId);
  const dataset = writable.dataset;
  let updated: DatasetRequestRecord | null = null;
  dataset.requests = dataset.requests.map((request) => {
    if (request.id !== requestId) return request;
    updated = {
      ...request,
      humanActions: [...(request.humanActions ?? []), humanTimelineEntry(actor, action, detail)],
    };
    return updated;
  });
  const saved = commitDataset(dataset);
  return { datasetId: saved.id, dataset: saved, record: updated };
}

export function advanceRequestSystemSteps(
  datasetId: string,
  requestId: string,
  options: {
    completeKinds?: RequestSystemStepKind[];
    inProgressKind?: RequestSystemStepKind;
    completeAll?: boolean;
  },
): MutationResult<DatasetRequestRecord | null> {
  const writable = getWritableDataset(datasetId);
  const dataset = writable.dataset;
  let updated: DatasetRequestRecord | null = null;
  dataset.requests = dataset.requests.map((request) => {
    if (request.id !== requestId || !request.systemSteps?.length) return request;
    const steps = request.systemSteps.map((step) => {
      if (options.completeAll) {
        return { ...step, status: 'completed' as const };
      }
      if (options.completeKinds?.includes(step.kind)) {
        return { ...step, status: 'completed' as const };
      }
      if (options.inProgressKind && step.kind === options.inProgressKind) {
        return { ...step, status: 'in_progress' as const };
      }
      return step;
    });
    updated = { ...request, systemSteps: steps };
    return updated;
  });
  const saved = commitDataset(dataset);
  return { datasetId: saved.id, dataset: saved, record: updated };
}

export function updateTaskFields(
  datasetId: string,
  taskId: string,
  patch: Partial<
    Pick<
      DatasetTaskRecord,
      'status' | 'assignee' | 'assigneeId' | 'assigneeKind' | 'queue' | 'aiSummary' | 'nextAction'
    >
  >,
): MutationResult<DatasetTaskRecord | null> {
  const writable = getWritableDataset(datasetId);
  const dataset = writable.dataset;
  let updated: DatasetTaskRecord | null = null;
  dataset.tasks = dataset.tasks.map((task) => {
    if (task.id !== taskId) return task;
    updated = { ...task, ...patch };
    return updated;
  });
  const saved = commitDataset(dataset);
  return { datasetId: saved.id, dataset: saved, record: updated };
}

function extractFormField(form: RequestSubmittedForm | undefined, label: string): string | undefined {
  return form?.fields.find((field) => field.label.toLowerCase().includes(label.toLowerCase()))?.value;
}

export function applyMailingAddressFromRequest(
  datasetId: string,
  requestId: string,
  actor: WorkflowActorContext,
): MutationResult<{ request: DatasetRequestRecord | null; newAddress?: string }> {
  const writable = getWritableDataset(datasetId);
  const dataset = writable.dataset;
  const request = findRequest(dataset, requestId);
  if (!request) {
    return { datasetId: writable.datasetId, dataset, record: { request: null } };
  }

  const newAddress =
    extractFormField(request.form, 'new mailing') ??
    extractFormField(request.form, 'new address');
  const clientId = request.clientId ?? request.linkedObjects.find((ref) => ref.kind === 'client')?.id;
  const policyId =
    request.policyNumber ??
    request.linkedObjects.find((ref) => ref.kind === 'policy')?.id;

  if (clientId && newAddress) {
    dataset.clients = dataset.clients.map((client) =>
      client.id === clientId
        ? { ...client, profile: { ...client.profile, address: newAddress } }
        : client,
    );
  }

  if (policyId && newAddress) {
    dataset.policies = dataset.policies.map((policy) =>
      policy.id === policyId || policy.policyNumber === policyId
        ? { ...policy, linkedObjects: policy.linkedObjects }
        : policy,
    );
  }

  let updatedRequest: DatasetRequestRecord | null = null;
  dataset.requests = dataset.requests.map((row) => {
    if (row.id !== requestId) return row;
    updatedRequest = {
      ...row,
      nextAction: 'Service completed',
      humanActions: [
        ...(row.humanActions ?? []),
        humanTimelineEntry(
          actor,
          'Mailing address applied',
          newAddress ? `Policy and client records updated to ${newAddress}.` : 'Policy administration update recorded.',
        ),
      ],
    };
    return updatedRequest;
  });

  const saved = commitDataset(dataset);
  return { datasetId: saved.id, dataset: saved, record: { request: updatedRequest, newAddress } };
}

export function updateDocumentStatus(
  datasetId: string,
  documentId: string,
  status: string,
  actor?: WorkflowActorContext,
): MutationResult<DatasetDocumentRecord | null> {
  const writable = getWritableDataset(datasetId);
  const dataset = writable.dataset;
  let updated: DatasetDocumentRecord | null = null;
  dataset.documents = dataset.documents.map((document) => {
    if (document.id !== documentId) return document;
    updated = { ...document, status };
    return updated;
  });

  if (actor && updated) {
    const requestId = updated.linkedObjects.find((ref) => ref.kind === 'request')?.id;
    if (requestId) {
      dataset.requests = dataset.requests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              humanActions: [
                ...(request.humanActions ?? []),
                humanTimelineEntry(
                  actor,
                  'Document reviewed',
                  `${updated!.label ?? documentId} marked as ${status}.`,
                ),
              ],
            }
          : request,
      );
    }
  }

  const saved = commitDataset(dataset);
  const record = saved.documents.find((row) => row.id === documentId) ?? updated;
  return { datasetId: saved.id, dataset: saved, record };
}

function buildSimpleServiceSystemSteps(workflowId: SimpleServiceWorkflowId): RequestSystemStep[] {
  return SIMPLE_SERVICE_WORKFLOWS[workflowId].systemSteps.map((step, index) => ({
    id: `${nowId()}-step-${index}`,
    kind: step.kind,
    status: index === 0 ? 'awaiting_review' : 'queued',
    title: step.title,
    description: step.description,
  }));
}

export type CreateSimpleServiceRequestInput = {
  title: string;
  workflowId: SimpleServiceWorkflowId;
  clientId: string;
  policyNumber: string;
  requester?: string;
  priority?: DatasetRequestRecord['priority'];
  due?: string;
  source?: string;
  sourceChannel?: DatasetRequestRecord['sourceChannel'];
  assignedTo?: string;
  currentAddress?: string;
  newAddress?: string;
  effectiveDate?: string;
  notes?: string;
};

export function createSimpleServiceRequest(
  datasetId: string,
  input: CreateSimpleServiceRequestInput,
): MutationResult<{ request: DatasetRequestRecord; task: DatasetTaskRecord }> {
  const workflow = SIMPLE_SERVICE_WORKFLOWS[input.workflowId];
  const writable = getWritableDataset(datasetId);
  const dataset = writable.dataset;
  const assignee = resolveAssigneeIdentity(input.assignedTo ?? 'Operations queue');
  const client = dataset.clients.find((row) => row.id === input.clientId);
  const policyRef = findPolicyRef(dataset, input.policyNumber);

  let linkedObjects: ObjectRef[] = [];
  if (client) {
    linkedObjects = addUniqueRef(linkedObjects, { kind: 'client', id: client.id, label: client.name });
  }
  if (policyRef) linkedObjects = addUniqueRef(linkedObjects, policyRef);

  const requestId = sequence('REQ', dataset.requests);
  const taskId = sequence('TSK', dataset.tasks);

  const form: RequestSubmittedForm = {
    submitted: timelineTimestamp(),
    channel: input.sourceChannel === 'client_portal' ? 'Client portal' : 'Manual intake',
    formType: workflow.category === 'Address Change' ? 'SBLI Address Change Form v2.0' : 'Beneficiary change form',
    fields: [
      { label: 'Policy number', value: input.policyNumber },
      ...(input.currentAddress ? [{ label: 'Current address on file', value: input.currentAddress }] : []),
      ...(input.newAddress ? [{ label: 'New mailing address', value: input.newAddress }] : []),
      ...(input.effectiveDate ? [{ label: 'Effective date', value: input.effectiveDate }] : []),
      ...(input.notes ? [{ label: 'Notes', value: input.notes }] : []),
    ],
  };

  const request: DatasetRequestRecord = {
    id: requestId,
    kind: 'request',
    label: input.title,
    status: 'In progress',
    source: input.source ?? 'Manual client request',
    category: workflow.category,
    subtype: workflow.subtype,
    priority: input.priority ?? 'Normal',
    received: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    sourceChannel: input.sourceChannel ?? 'client_portal',
    sourceDetail: 'Manual policy service intake',
    requester: input.requester ?? client?.name ?? 'Client',
    clientId: input.clientId,
    policyNumber: input.policyNumber,
    assignedTo: assignee.assigneeValue,
    assigneeId: assignee.assigneeId,
    assigneeKind: assignee.assigneeKind,
    due: input.due,
    notes: input.notes,
    templateId: workflow.templateId,
    requestMode: 'internal',
    aiSummary:
      input.notes ||
      `Manual ${workflow.category.toLowerCase()} for ${client?.name ?? input.clientId} on policy ${input.policyNumber}.`,
    nextAction: 'Complete address change review',
    linkedTasks: [taskId],
    form,
    systemSteps: buildSimpleServiceSystemSteps(input.workflowId).map((step, index) =>
      index === 0 ? { ...step, status: 'completed' } : index === 1 ? { ...step, status: 'completed' } : step,
    ),
    aiActions: [
      {
        ts: timelineTimestamp(),
        actor: 'System',
        actorType: 'System',
        icon: 'ti-bolt',
        dotCls: 'rp-tl-dot-system',
        action: 'Simple service task created',
        detail: `Task ${taskId} assigned to ${assignee.assigneeValue}. No claim case created.`,
      },
    ],
    humanActions: [],
    linkedObjects: addUniqueRef(linkedObjects, { kind: 'request', id: requestId, label: input.title }),
  };

  let taskLinked = addUniqueRef(linkedObjects, { kind: 'request', id: requestId, label: input.title });
  if (client) {
    taskLinked = addUniqueRef(taskLinked, { kind: 'client', id: client.id, label: client.name, role: 'owner' });
  }
  if (policyRef) taskLinked = addUniqueRef(taskLinked, policyRef);

  const task: DatasetTaskRecord = {
    id: taskId,
    kind: 'task',
    taskId,
    label: workflow.taskLabel,
    status: 'To Do',
    priority: input.priority ?? 'Normal',
    assignee: assignee.assigneeValue,
    assigneeId: assignee.assigneeId,
    assigneeKind: assignee.assigneeKind,
    caseType: 'Service',
    caseSubtype: workflow.taskSubtype,
    hasAI: true,
    aiSummary: input.notes || `Review ${workflow.category.toLowerCase()} for ${client?.name ?? input.clientId}.`,
    stage: 'policy_service',
    origin: 'Manual intake',
    sourceContext: `Simple policy service — ${workflow.taskSubtype.replace('_', ' ')}`,
    createdFrom: { kind: 'request', id: requestId, label: input.title },
    createdDate: new Date().toISOString(),
    description: `Review and apply ${workflow.category.toLowerCase()} for ${client?.name ?? input.clientId}.`,
    queue: 'team_tasks',
    requiredAuthorityLevel: 1,
    actions: [
      { type: 'complete', label: 'Complete', isPrimary: true },
      { type: 'request_info', label: 'Request info' },
    ],
    panelContext: {
      summaryStatus: 'To Do',
      contextTitle: `Simple tasks — ${workflow.category}`,
      contextSummary: input.notes || `Review ${workflow.category.toLowerCase()} linked to ${requestId}.`,
      suggestions: ['Review submitted form', 'Confirm supporting documents', 'Apply policy update'],
    },
    summary: {
      contextLabel: 'Suggested next steps',
      title: workflow.category,
      description: `Policy service task for ${workflow.category.toLowerCase()} on ${input.policyNumber}.`,
      checklist:
        input.workflowId === 'address_change'
          ? [
              'Confirm supporting documents and unit formatting',
              'Update policy admin mailing address',
              'Send confirmation letter to client',
            ]
          : [
              'Confirm beneficiary designation details',
              'Update policy admin beneficiary records',
              'Send confirmation to client',
            ],
    },
    linkedObjects: taskLinked,
  };

  request.linkedObjects = addUniqueRef(request.linkedObjects, { kind: 'task', id: taskId, label: workflow.taskLabel });

  dataset.requests = [request, ...dataset.requests];
  dataset.tasks = [task, ...dataset.tasks];
  const saved = commitDataset(dataset);
  return {
    datasetId: saved.id,
    dataset: saved,
    record: {
      request: saved.requests.find((row) => row.id === requestId) ?? request,
      task: saved.tasks.find((row) => row.id === taskId) ?? task,
    },
  };
}

export function isSimpleServiceRequestRecord(request: DatasetRequestRecord): boolean {
  return isSimpleServiceRequestCategory(request.category);
}
