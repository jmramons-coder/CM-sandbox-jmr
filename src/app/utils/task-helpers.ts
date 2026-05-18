/**
 * Utility Functions - Amplify Case Management
 */

import type { TaskPriority } from '../types';

/**
 * Gets priority order for sorting (higher number = higher priority)
 */
export function getPriorityOrder(priority: TaskPriority): number {
  const order: Record<TaskPriority, number> = {
    URGENT: 3,
    HIGH: 2,
    NORMAL: 1,
  };
  return order[priority];
}

/**
 * Checks if a string is a valid date string
 */
export function isValidDateString(dateString: string): boolean {
  return !isNaN(new Date(dateString).getTime());
}
