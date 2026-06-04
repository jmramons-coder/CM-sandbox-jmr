import { isTaskSystemSourced } from '../components/ModuleCellHelpers';
import type { Task, TaskStatus } from '../types';
import { resolveHumanAssigneeName } from './task-assignees';

export type TaskCompletionActor = 'ai' | 'human' | 'system';

export type TaskCompletionAttribution = {
  actor: TaskCompletionActor;
  /** Short name shown after the verb (e.g. AI, Victor Ramon, System). */
  label: string;
  verb: 'Completed' | 'Approved';
};

export function isTaskCompletedStatus(status: TaskStatus | string): boolean {
  const key = String(status).toLowerCase();
  return key === 'completed' || key === 'complete' || key === 'done';
}

function isAiAssignee(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return normalized === 'ai agent' || normalized === 'ai crew' || normalized.startsWith('ai ');
}

function isSystemAssignee(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return normalized === 'system' || normalized === 'automated';
}

function isAiOwnedTaskType(taskType: string): boolean {
  const title = taskType.trim().toLowerCase();
  return title.startsWith('ai:') || title.startsWith('ai ');
}

export function resolveTaskCompletionAttribution(
  task: Pick<Task, 'status' | 'assignedTo' | 'assigneeId' | 'aiGenerated' | 'taskType' | 'executionMode' | 'origin'>,
): TaskCompletionAttribution | null {
  if (!isTaskCompletedStatus(task.status)) return null;

  const assignee = task.assignedTo?.trim() || '';

  if (isAiAssignee(assignee) || (task.aiGenerated && isAiOwnedTaskType(task.taskType))) {
    return { actor: 'ai', label: 'AI', verb: 'Completed' };
  }

  if (isSystemAssignee(assignee) || (!assignee && isTaskSystemSourced(task))) {
    return { actor: 'system', label: 'System', verb: 'Completed' };
  }

  const verb = task.executionMode === 'semi_auto' ? 'Approved' : 'Completed';
  const humanName = resolveHumanAssigneeName(task.assignedTo, task.assigneeId);
  return {
    actor: 'human',
    label: humanName ?? 'User',
    verb,
  };
}
