import type { ServiceRequest, Task } from '../../types';
import { isOpenTaskStatus } from './statusCatalog';
import { sortCaseTaskRowsByRelevance } from '../../utils/module-relevance-sort';

/** Tasks tied to this request (explicit ids or object refs). */
export function tasksForRequest(request: Pick<ServiceRequest, 'id' | 'linkedTasks'>, linkedTasks: Task[]): Task[] {
  return linkedTasks.filter(
    (task) =>
      request.linkedTasks?.includes(task.id) ||
      task.objectRefs?.some((ref) => ref.kind === 'request' && ref.id === request.id) ||
      task.linkedObjects?.some((ref) => ref.kind === 'request' && ref.id === request.id),
  );
}

/** The one task the user should focus on next (open work first, then relevance sort). */
export function pickAccomplishmentTask(
  request: Pick<ServiceRequest, 'id' | 'linkedTasks'>,
  linkedTasks: Task[],
): Task | undefined {
  const linked = tasksForRequest(request, linkedTasks);
  if (!linked.length) return undefined;
  const open = linked.filter((task) => isOpenTaskStatus(task.status));
  const pool = open.length > 0 ? open : linked;
  return sortCaseTaskRowsByRelevance(pool)[0];
}

export function accomplishmentTaskNavLabel(task: Pick<Task, 'status' | 'taskType'>): string {
  if (isOpenTaskStatus(task.status)) {
    return task.taskType?.trim() || 'Work on task';
  }
  return 'View completed task';
}
