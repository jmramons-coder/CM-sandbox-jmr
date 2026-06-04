import { applyWorkflowOutcomes, resolveWorkflowProfile } from '../domain/objectWorkflow';
import { isSimpleServiceTask } from './simpleServiceRules';
import { datasetRegistry } from './datasetRegistry';
import { getSystemDataset } from './objectRepository';
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

function isWorkspaceDatasetId(datasetId: string): boolean {
  return datasetId.includes('-workspace-copy-');
}

/** Registry read for workflow: apply Equisoft read overlays on base demo; keep workspace copies as saved. */
function getDataset(datasetId: string): SystemDataset {
  const resolved = resolveWorkflowDatasetId(datasetId);
  if (isWorkspaceDatasetId(resolved)) {
    return datasetRegistry.getDataset(resolved);
  }
  return getSystemDataset(resolved);
}

/** Resolve a dataset task by canonical id or display taskId. */
export function findDatasetTaskRecord(
  dataset: SystemDataset,
  taskRef: string,
): DatasetTaskRecord | undefined {
  const needle = taskRef.trim();
  if (!needle) return undefined;
  return dataset.tasks.find((row) => row.id === needle || row.taskId === needle);
}

/** Resolve a task on the active registry dataset (not UI-filtered). */
export function resolveDatasetTaskForWorkflow(
  datasetId: string,
  taskRef: string,
): DatasetTaskRecord | undefined {
  const resolvedDatasetId = resolveWorkflowDatasetId(datasetId);
  return findDatasetTaskRecord(getDataset(resolvedDatasetId), taskRef);
}

function isCompletedTaskStatus(status: string | undefined): boolean {
  const key = (status ?? '').trim().toLowerCase();
  return key === 'completed' || key === 'complete' || key === 'done';
}

export function isTaskCompleteActionSuccess(
  result: WorkflowActionResult,
  taskRef?: string,
): boolean {
  const task = result.record?.task;
  if (!task || !isCompletedTaskStatus(task.status)) return false;
  const needle = taskRef?.trim();
  if (!needle) return true;
  return task.id === needle || task.taskId === needle;
}

/** Use when settings may reference a deleted workspace copy id. */
export function resolveWorkflowDatasetId(datasetId: string | undefined | null): string {
  const requested = (datasetId ?? '').trim();
  if (!requested) return datasetRegistry.getDataset(null).id;
  const exists = datasetRegistry.listDatasets().some((row) => row.id === requested);
  return exists ? requested : datasetRegistry.getDataset(null).id;
}

/** Find a task on the active dataset, then fall back to the built-in demo when stale workspace copies omit seed rows. */
function resolveWorkflowTaskLocation(
  datasetId: string,
  taskRef: string,
): { row: DatasetTaskRecord; datasetId: string } | null {
  const needle = taskRef.trim();
  if (!needle) return null;

  const tryDataset = (id: string) => {
    const row = findDatasetTaskRecord(getDataset(id), needle);
    return row ? { row, datasetId: id } : null;
  };

  const resolvedDatasetId = resolveWorkflowDatasetId(datasetId);
  const primary = tryDataset(resolvedDatasetId);
  if (primary) return primary;

  const canonicalId = datasetRegistry.getDataset(null).id;
  if (canonicalId !== resolvedDatasetId) {
    const fallback = tryDataset(canonicalId);
    if (fallback) return fallback;
  }

  return null;
}

export function runTaskWorkflowAction(
  datasetId: string,
  taskRef: string,
  actionType: string,
  actor: WorkflowActorContext,
): WorkflowActionResult | null {
  const located = resolveWorkflowTaskLocation(datasetId, taskRef);
  if (!located) return null;
  return executeTaskAction(located.datasetId, located.row.id, actionType, actor);
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
  const completed = updateTaskStatus(datasetId, task.id, 'Completed');
  if (!completed.record || !isCompletedTaskStatus(completed.record.status)) {
    throw new Error(`Failed to complete task ${task.id}`);
  }
  let activeId = completed.datasetId;
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

export type ReassignTasksInput = {
  taskIds: string[];
  toAssigneeName: string;
  actor: WorkflowActorContext;
  reason?: string;
};

export function reassignTasks(
  datasetId: string,
  input: ReassignTasksInput,
): MutationResult<{ tasks: DatasetTaskRecord[] }> {
  const assignee = resolveAssigneeIdentity(input.toAssigneeName);
  let activeId = datasetId;
  const reassigned: DatasetTaskRecord[] = [];

  for (const taskId of input.taskIds) {
    let result = updateTaskFields(activeId, taskId, {
      status: 'In Progress',
      assignee: assignee.assigneeValue,
      assigneeId: assignee.assigneeId,
      assigneeKind: assignee.assigneeKind ?? 'user',
      queue: 'my_tasks',
    });
    activeId = result.datasetId;
    const task = result.record;
    if (!task) continue;
    reassigned.push(task);

    const requestId = linkedRequestIdFromTask(task);
    if (requestId) {
      result = appendRequestHumanAction(
        activeId,
        requestId,
        input.actor,
        'Work reassigned',
        `${input.actor.name} reassigned ${task.label} to ${assignee.assigneeLabel}.${input.reason ? ` Reason: ${input.reason}` : ''}`,
      );
      activeId = result.datasetId;
    }
  }

  const dataset = getDataset(activeId);
  return {
    datasetId: activeId,
    dataset,
    record: { tasks: reassigned },
  };
}

export function executeTaskAction(
  datasetId: string,
  taskId: string,
  actionType: string,
  actor: WorkflowActorContext,
): WorkflowActionResult {
  const sourceDataset = getDataset(datasetId);
  const task = findDatasetTaskRecord(sourceDataset, taskId);
  if (!task) {
    return { datasetId, dataset: sourceDataset, record: { task: null, request: null } };
  }

  const canonicalTaskId = task.id;

  if (actionType === 'complete' || actionType === 'complete_return' || actionType === 'send_approver') {
    const finalDatasetId = isSimpleServiceTask(task)
      ? cascadeSimpleServiceCompletion(datasetId, task, actor)
      : (() => {
          const statusResult = updateTaskStatus(datasetId, canonicalTaskId, 'Completed');
          if (!statusResult.record || !isCompletedTaskStatus(statusResult.record.status)) {
            throw new Error(`Failed to complete task ${canonicalTaskId}`);
          }
          return statusResult.datasetId;
        })();

    const dataset = getDataset(finalDatasetId);
    const requestId = linkedRequestIdFromTask(task);
    return {
      datasetId: finalDatasetId,
      dataset,
      record: {
        task: findDatasetTaskRecord(dataset, canonicalTaskId) ?? null,
        request: requestId ? dataset.requests.find((row) => row.id === requestId) ?? null : null,
      },
    };
  }

  if (actionType === 'request_info') {
    const requestId = linkedRequestIdFromTask(task);
    let activeId = updateTaskFields(datasetId, canonicalTaskId, { status: 'In progress' }).datasetId;
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
        task: findDatasetTaskRecord(dataset, canonicalTaskId) ?? null,
        request: requestId ? dataset.requests.find((row) => row.id === requestId) ?? null : null,
      },
    };
  }

  return executeTaskAction(datasetId, canonicalTaskId, 'complete', actor);
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
