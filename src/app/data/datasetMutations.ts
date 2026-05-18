import { validateSystemDataset } from './dataQualityGuards';
import { datasetRegistry } from './datasetRegistry';
import { migrateSystemDataset } from './generatedDatasetRepository';
import type { DatasetRequestRecord, DatasetRequirementRecord, DatasetTaskRecord, SystemDataset } from './multi-case-dataset';
import { findRelationshipIssues } from '../domain/dataArchitecture';
import {
  caseTypeCodeForClaimSubType,
  caseTypeMetadataForSubType,
  normalizeCaseSubTypeForStorage,
} from '../domain/claimSubTypes';
import type { CaseKind, CaseRecord, ClaimSubType, ObjectRef, WorkObjectKind } from '../domain/objectRefs';
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

function getWritableDataset(datasetId: string): WritableDataset {
  const source = datasetRegistry.getDataset(datasetId);
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
