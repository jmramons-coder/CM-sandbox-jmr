/**
 * Task Sorting Utilities
 */

import type { Task, SortableColumn, SortDirection } from '../types';
import { getPriorityOrder, isValidDateString } from './task-helpers';

/**
 * Sorts an array of tasks based on the specified column and direction
 */
export function sortTasks(
  tasks: Task[],
  column: SortableColumn | null,
  direction: SortDirection
): Task[] {
  if (!column) return tasks;

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
