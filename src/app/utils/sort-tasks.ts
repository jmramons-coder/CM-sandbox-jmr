/**
 * Task Sorting Utilities
 */

import type { Task, SortableColumn, SortDirection } from '../types';
import { sortTasksByRelevance } from './module-relevance-sort';
import { isAddressChangeServiceTask } from './taskSimpleService';
import { getPriorityOrder, isValidDateString } from './task-helpers';

/** Demo showcase: policy-service address change with no claim case. */
export const ADDRESS_CHANGE_REVIEW_TASK_ID = 'task_ps_addr_001';
export const EMPIRE_ADDRESS_CHANGE_REVIEW_TASK_ID = 'task_emp_addr_001';

const ADDRESS_CHANGE_PIN_IDS = [ADDRESS_CHANGE_REVIEW_TASK_ID, EMPIRE_ADDRESS_CHANGE_REVIEW_TASK_ID];

/** Keeps the no-case address change review task first under default (relevance) ordering. */
export function pinAddressChangeReviewTaskFirst(tasks: Task[]): Task[] {
  const index = tasks.findIndex(
    (task) =>
      ADDRESS_CHANGE_PIN_IDS.some(
        (id) => task.id === id || task.taskId === id,
      )
      || (!task.caseId && isAddressChangeServiceTask(task)),
  );
  if (index <= 0) return tasks;
  const pinned = tasks[index];
  return [pinned, ...tasks.filter((_, i) => i !== index)];
}

/**
 * Sorts an array of tasks based on the specified column and direction
 */
export function sortTasks(
  tasks: Task[],
  column: SortableColumn | null,
  direction: SortDirection
): Task[] {
  if (!column) return pinAddressChangeReviewTaskFirst(sortTasksByRelevance(tasks));

  return [...tasks].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (column) {
      case 'taskId':
        aValue = a.id.toLowerCase();
        bValue = b.id.toLowerCase();
        break;

      case 'priority':
        aValue = getPriorityOrder(a.priority);
        bValue = getPriorityOrder(b.priority);
        break;

      case 'caseType':
        aValue = a.caseType.toLowerCase();
        bValue = b.caseType.toLowerCase();
        break;

      case 'taskType':
        aValue = a.taskType.toLowerCase();
        bValue = b.taskType.toLowerCase();
        break;

      case 'claimantName':
        aValue = a.claimantName.toLowerCase();
        bValue = b.claimantName.toLowerCase();
        break;

      case 'product':
        aValue = a.product.toLowerCase();
        bValue = b.product.toLowerCase();
        break;

      case 'slaRemaining':
        aValue = a.slaRemaining;
        bValue = b.slaRemaining;
        break;

      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;

      case 'assignedTo':
        aValue = a.assignedTo.toLowerCase();
        bValue = b.assignedTo.toLowerCase();
        break;

      case 'origin':
        aValue = a.origin.toLowerCase();
        bValue = b.origin.toLowerCase();
        break;

      case 'createdDate':
        aValue = isValidDateString(a.createdDate) ? new Date(a.createdDate).getTime() : 0;
        bValue = isValidDateString(b.createdDate) ? new Date(b.createdDate).getTime() : 0;
        break;

      case 'caseId':
        aValue = (a.caseId ?? '').toLowerCase();
        bValue = (b.caseId ?? '').toLowerCase();
        break;

      default:
        return 0;
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}
