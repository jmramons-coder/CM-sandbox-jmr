import type { DynamicDocumentData } from '../../components/DynamicDocumentSidePanel';
import type { ServiceRequest, Task } from '../../types';
import type { DatasetRequestRecord, DatasetTaskRecord } from '../../data/multi-case-dataset';
import { clientRef, mergeLinkedEntities, policyRef, refsFromObjectRefs } from './relationGraph';
import { isDocumentReviewedStatus } from './statusCatalog';
import type { DocumentActionContext, LinkedEntityRef, RequestActionContext, TaskActionContext } from './types';
import { pickAccomplishmentTask } from './accomplishmentTask';
import { resolveWorkflowProfile } from './workflowProfile';

export function buildRequestActionContext(
  request: Pick<
    ServiceRequest,
    'id' | 'status' | 'category' | 'caseId' | 'clientId' | 'policyNumber' | 'linkedTasks' | 'linkedObjects'
  > & { templateId?: string },
  linkedTasks: Task[],
  evidenceDocument: DynamicDocumentData | null | undefined,
): RequestActionContext {
  const profile = resolveWorkflowProfile({
    category: request.category,
    templateId: request.templateId,
    caseId: request.caseId,
  });

  const primaryTask = pickAccomplishmentTask(request, linkedTasks);

  const taskEntities: LinkedEntityRef[] = primaryTask
    ? [
        {
          kind: 'task',
          id: primaryTask.id,
          label: primaryTask.taskType,
          href: `/tasks#task=${encodeURIComponent(primaryTask.id)}`,
        },
      ]
    : [];

  const caseEntity: LinkedEntityRef[] = request.caseId
    ? [{ kind: 'case', id: request.caseId, label: 'Case', href: `/cases/${request.caseId}` }]
    : [];

  const documentEntities: LinkedEntityRef[] = evidenceDocument
    ? [{ kind: 'document', id: evidenceDocument.documentId, label: evidenceDocument.documentTitle }]
    : refsFromObjectRefs(
        (request.linkedObjects ?? []).filter((ref) => ref.kind === 'document'),
      );

  const linkedEntities = mergeLinkedEntities(
    taskEntities,
    caseEntity,
    documentEntities,
    refsFromObjectRefs((request.linkedObjects ?? []).filter((ref) => ref.kind !== 'task')),
    clientRef(request.clientId, request.linkedObjects) ? [clientRef(request.clientId, request.linkedObjects)!] : [],
    policyRef(request.policyNumber, request.linkedObjects) ? [policyRef(request.policyNumber, request.linkedObjects)!] : [],
  );

  const docStatus = evidenceDocument?.status ?? evidenceDocument?.summary?.status;

  return {
    objectKind: 'request',
    requestId: request.id,
    status: request.status,
    category: request.category,
    templateId: request.templateId,
    caseId: request.caseId,
    profile,
    linkedEntities,
    primaryTask: primaryTask
      ? { id: primaryTask.id, status: primaryTask.status, label: primaryTask.taskType }
      : undefined,
    primaryDocument: evidenceDocument
      ? { id: evidenceDocument.documentId, status: docStatus ?? 'Received', label: evidenceDocument.documentTitle }
      : undefined,
    documentNeedsReview: Boolean(evidenceDocument && !isDocumentReviewedStatus(docStatus)),
  };
}

export function buildRequestContextFromDataset(
  request: DatasetRequestRecord,
  linkedTasks: DatasetTaskRecord[],
  evidenceDocument: DynamicDocumentData | null | undefined,
): RequestActionContext {
  return buildRequestActionContext(
    {
      id: request.id,
      status: request.status,
      category: request.category,
      templateId: request.templateId,
      caseId: request.linkedObjects?.find((ref) => ref.kind === 'case')?.id,
      clientId: request.clientId,
      policyNumber: request.policyNumber,
      linkedTasks: request.linkedTasks,
      linkedObjects: request.linkedObjects,
    },
    linkedTasks.map((task) => ({
      id: task.id,
      taskType: task.label,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignee ?? '',
      caseType: task.caseType,
      caseSubtype: task.caseSubtype,
      dueDate: task.dueDate ?? '',
      stage: task.stage ?? '',
      hasAI: task.hasAI ?? false,
      linkedObjects: task.linkedObjects,
    })) as Task[],
    evidenceDocument,
  );
}

export function buildTaskActionContext(
  task: Pick<DatasetTaskRecord, 'id' | 'status' | 'label' | 'caseType' | 'caseSubtype' | 'linkedObjects' | 'createdFrom'>,
): TaskActionContext {
  const linkedRequestId =
    task.createdFrom?.kind === 'request'
      ? task.createdFrom.id
      : task.linkedObjects.find((ref) => ref.kind === 'request')?.id;

  const profile = resolveWorkflowProfile({
    category: undefined,
    templateId: undefined,
    caseSubtype: task.caseSubtype,
    caseType: task.caseType,
    caseId: task.linkedObjects.find((ref) => ref.kind === 'case')?.id,
  });

  return {
    objectKind: 'task',
    taskId: task.id,
    status: task.status,
    profile,
    linkedRequestId,
    linkedEntities: refsFromObjectRefs(task.linkedObjects),
  };
}

export function buildDocumentActionContext(
  documentId: string,
  status: string,
  linkedRequestId: string | undefined,
  profileInput?: { category?: string; templateId?: string },
): DocumentActionContext {
  const profile = resolveWorkflowProfile(profileInput ?? {});
  return {
    objectKind: 'document',
    documentId,
    status,
    profile,
    linkedRequestId,
    needsReview: !isDocumentReviewedStatus(status),
  };
}
