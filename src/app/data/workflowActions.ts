import { applyWorkflowOutcomes, resolveWorkflowProfile } from '../domain/objectWorkflow';
import { isSimpleServiceTask } from './simpleServiceRules';
import { datasetRegistry } from './datasetRegistry';
import type { DatasetRequestRecord, DatasetTaskRecord, SystemDataset } from './multi-case-dataset';
import {
  advanceRequestSystemSteps,
  appendRequestHumanAction,
  type MutationResult,
  type WorkflowActorContext,
  updateRequestStatus,
  updateTaskFields,
  updateTaskStatus,
} from './datasetMutations';
import { resolveAssigneeIdentity } from './userDirectory';

export type WorkflowActionResult = MutationResult<{
  task?: DatasetTaskRecord | null;
  request?: DatasetRequestRecord | null;
}>;

function getDataset(datasetId: string): SystemDataset {
  return datasetRegistry.getDataset(datasetId);
}

function linkedRequestIdFromTask(task: DatasetTaskRecord): string | undefined {
  return task.createdFrom?.kind === 'request'
    ? task.createdFrom.id
    : task.linkedObjects.find((ref) => ref.kind === 'request')?.id;
}

function cascadeSimpleServiceCompletion(
  datasetId: string,
  task: DatasetTaskRecord,
  actor: WorkflowActorContext,
): string {
  let activeId = updateTaskStatus(datasetId, task.id, 'Completed').datasetId;
  const requestId = linkedRequestIdFromTask(task);

  if (!requestId) return activeId;

  const request = getDataset(activeId).requests.find((row) => row.id === requestId);
  const profile = resolveWorkflowProfile({
    category: request?.category,
    templateId: request?.templateId,
    caseSubtype: task.caseSubtype,
    caseType: task.caseType,
  });

  activeId = applyWorkflowOutcomes(activeId, requestId, profile, 'task_complete', actor);

  activeId = appendRequestHumanAction(
    activeId,
    requestId,
    actor,
    'Task completed',
    `${task.label} marked complete.`,
  ).datasetId;

  activeId = updateRequestStatus(activeId, requestId, 'Completed').datasetId;
  activeId = advanceRequestSystemSteps(activeId, requestId, { completeAll: true }).datasetId;

  return appendRequestHumanAction(
    activeId,
    requestId,
    actor,
    'Service completed',
    'All policy service steps finished.',
  ).datasetId;
}

export function pickUpTask(
  datasetId: string,
  taskId: string,
  actor: WorkflowActorContext,
): MutationResult<DatasetTaskRecord | null> {
  const assignee = resolveAssigneeIdentity(actor.name);
  let result = updateTaskFields(datasetId, taskId, {
    status: 'In progress',
    assignee: assignee.assigneeValue,
    assigneeId: assignee.assigneeId,
    assigneeKind: assignee.assigneeKind,
    queue: 'my_tasks',
  });

  const task = result.dataset.tasks.find((row) => row.id === taskId);
  const requestId = task ? linkedRequestIdFromTask(task) : undefined;
  if (requestId) {
    result = appendRequestHumanAction(
      result.datasetId,
      requestId,
      actor,
      'Task picked up',
      `${actor.name} is reviewing this request.`,
    );
    const request = result.dataset.requests.find((row) => row.id === requestId);
    if (request?.status === 'New') {
      const statusResult = updateRequestStatus(result.datasetId, requestId, 'In progress');
      result = { ...statusResult, record: result.record };
    }
  }

  return result;
}

export function releaseTaskToQueue(
  datasetId: string,
  taskId: string,
  actor: WorkflowActorContext,
  queue: 'my_tasks' | 'team_tasks' = 'team_tasks',
): MutationResult<DatasetTaskRecord | null> {
  let result = updateTaskFields(datasetId, taskId, {
    status: 'Open',
    queue,
    assignee: 'Operations queue',
    assigneeId: undefined,
    assigneeKind: 'team',
  });

  const task = result.dataset.tasks.find((row) => row.id === taskId);
  const requestId = task ? linkedRequestIdFromTask(task) : undefined;
  if (requestId) {
    result = appendRequestHumanAction(
      result.datasetId,
      requestId,
      actor,
      'Task released',
      `Returned to ${queue === 'team_tasks' ? 'team queue' : 'assignee queue'}.`,
    );
  }
  return result;
}

export function executeTaskAction(
  datasetId: string,
  taskId: string,
  actionType: string,
  actor: WorkflowActorContext,
): WorkflowActionResult {
  const task = getDataset(datasetId).tasks.find((row) => row.id === taskId);
  if (!task) {
    const dataset = getDataset(datasetId);
    return { datasetId, dataset, record: { task: null, request: null } };
  }

  if (actionType === 'complete' || actionType === 'complete_return' || actionType === 'send_approver') {
    const finalDatasetId = isSimpleServiceTask(task)
      ? cascadeSimpleServiceCompletion(datasetId, task, actor)
      : updateTaskStatus(datasetId, taskId, 'Completed').datasetId;

    const dataset = getDataset(finalDatasetId);
    const requestId = linkedRequestIdFromTask(task);
    return {
      datasetId: finalDatasetId,
      dataset,
      record: {
        task: dataset.tasks.find((row) => row.id === taskId) ?? null,
        request: requestId ? dataset.requests.find((row) => row.id === requestId) ?? null : null,
      },
    };
  }

  if (actionType === 'request_info') {
    const requestId = linkedRequestIdFromTask(task);
    let activeId = updateTaskFields(datasetId, taskId, { status: 'In progress' }).datasetId;
    if (requestId) {
      activeId = updateRequestStatus(activeId, requestId, 'Pending info').datasetId;
      activeId = advanceRequestSystemSteps(activeId, requestId, {
        inProgressKind: 'follow_up_client',
      }).datasetId;
      activeId = appendRequestHumanAction(
        activeId,
        requestId,
        actor,
        'Additional information requested',
        'Client follow-up required before the service can be completed.',
      ).datasetId;
    }
    const dataset = getDataset(activeId);
    return {
      datasetId: activeId,
      dataset,
      record: {
        task: dataset.tasks.find((row) => row.id === taskId) ?? null,
        request: requestId ? dataset.requests.find((row) => row.id === requestId) ?? null : null,
      },
    };
  }

  return executeTaskAction(datasetId, taskId, 'complete', actor);
}

export function executeRequestAction(
  datasetId: string,
  requestId: string,
  actionType: 'start_review' | 'request_info' | 'complete' | 'reject',
  actor: WorkflowActorContext,
): MutationResult<DatasetRequestRecord | null> {
  let activeId = datasetId;

  if (actionType === 'start_review') {
    activeId = updateRequestStatus(activeId, requestId, 'In progress').datasetId;
    activeId = advanceRequestSystemSteps(activeId, requestId, {
      completeKinds: ['review_required'],
      inProgressKind: 'create_task',
    }).datasetId;
    return appendRequestHumanAction(activeId, requestId, actor, 'Review started', `${actor.name} began review.`);
  }

  if (actionType === 'request_info') {
    activeId = updateRequestStatus(activeId, requestId, 'Pending info').datasetId;
    activeId = advanceRequestSystemSteps(activeId, requestId, { inProgressKind: 'follow_up_client' }).datasetId;
    return appendRequestHumanAction(
      activeId,
      requestId,
      actor,
      'Additional information requested',
      'Outbound follow-up queued for the requester.',
    );
  }

  if (actionType === 'reject') {
    activeId = updateRequestStatus(activeId, requestId, 'Rejected').datasetId;
    activeId = advanceRequestSystemSteps(activeId, requestId, { completeAll: true }).datasetId;
    for (const task of getDataset(activeId).tasks) {
      if (linkedRequestIdFromTask(task) === requestId && task.status !== 'Completed' && task.status !== 'Cancelled') {
        activeId = updateTaskStatus(activeId, task.id, 'Cancelled').datasetId;
      }
    }
    return appendRequestHumanAction(
      activeId,
      requestId,
      actor,
      'Request rejected',
      'Service request closed without applying changes.',
    );
  }

  const request = getDataset(activeId).requests.find((row) => row.id === requestId);
  const profile = resolveWorkflowProfile({
    category: request?.category,
    templateId: request?.templateId,
  });

  activeId = applyWorkflowOutcomes(activeId, requestId, profile, 'request_complete', actor);
  activeId = updateRequestStatus(activeId, requestId, 'Completed').datasetId;
  activeId = advanceRequestSystemSteps(activeId, requestId, { completeAll: true }).datasetId;
  return appendRequestHumanAction(activeId, requestId, actor, 'Service completed', 'Request closed successfully.');
}
