import { UI_CLASS } from '../constants/design-tokens';
import type { LozengeType, TaskPriority } from '../types';

export type AppStatusContext = 'case' | 'folder' | 'task' | 'document' | 'requirement' | 'entityTable' | 'application';

export function getRagDotClass(rag: string | undefined): string {
  if (rag === 'Red' || rag === 'Amber' || rag === 'Green') return UI_CLASS.ragDot[rag];
  return UI_CLASS.ragDot.Green;
}

export function getRagOrder(rag: string | undefined): number {
  if (rag === 'Red') return 3;
  if (rag === 'Amber') return 2;
  return 1;
}

export function getPriorityDotClass(priority: TaskPriority | string): string {
  if (priority === 'URGENT' || priority === 'HIGH' || priority === 'NORMAL') {
    return UI_CLASS.priorityDot[priority];
  }
  return UI_CLASS.priorityDot.NORMAL;
}

/** Dot color for portfolio-style FilterChip priority pills (matches home Case portfolio). */
export function getPriorityChipDot(priority: string): string {
  const normalized = priority.trim().toUpperCase();
  if (normalized === 'URGENT') return '#cd2c23';
  if (normalized === 'HIGH') return '#f5a200';
  return '#b7bbc2';
}

export function formatPriorityChipLabel(priority: string): string {
  const normalized = priority.trim().toUpperCase();
  if (normalized === 'URGENT') return 'Urgent';
  if (normalized === 'HIGH') return 'High';
  if (normalized === 'NORMAL') return 'Normal';
  if (normalized === 'LOW') return 'Low';
  return priority;
}

export function getStatusShort(status: string): string {
  if (status.startsWith('Closed:')) return status;
  return status.split(':')[0]?.trim() || status;
}

export function getStatusLozengeType(
  status: string,
  context: AppStatusContext = 'case',
): LozengeType {
  const normalized = status.trim();
  const upper = normalized.toUpperCase();

  if (upper === 'ACTIVE' || upper.startsWith('ACTIVE:')) return 'Informative';
  if (upper === 'INACTIVE' || upper === 'TERMINATED' || upper.startsWith('INACTIVE')) return 'Neutral';

  if (context === 'task') {
    if (normalized === 'Completed' || normalized === 'Complete') return 'Success';
    if (normalized === 'Cancelled') return 'Neutral';
    if (normalized === 'In Queue' || normalized === 'Pending Approval' || normalized === 'Escalated') return 'Warning';
    if (normalized === 'To Do' || normalized === 'Open' || normalized === 'Saved') return 'Discovery';
    if (normalized === 'In Progress') return 'Informative';
    if (normalized === 'Overdue') return 'Alert';
    return 'Neutral';
  }

  if (context === 'document') {
    if (normalized === 'Validated') return 'Success';
    if (normalized === 'Pending Review') return 'Warning';
    if (normalized === 'Rejected') return 'Alert';
    if (normalized === 'Processing') return 'Informative';
    return 'Neutral';
  }

  if (context === 'requirement') {
    if (normalized === 'Fulfilled' || normalized === 'Waived' || normalized === 'Completed') return 'Success';
    if (normalized === 'Overdue') return 'Alert';
    if (normalized === 'Pending') return 'Discovery';
    if (normalized === 'Ordered' || normalized === 'Scheduled') return 'Informative';
    return 'Neutral';
  }

  if (context === 'entityTable' || context === 'folder') {
    if (upper === 'ACTIVE') return 'Informative';
    if (upper === 'INACTIVE' || upper === 'TERMINATED') return 'Neutral';
    if (upper === 'DRAFT') return 'Warning';
    if (upper === 'IN QUEUE') return 'Warning';
    return 'Neutral';
  }

  if (context === 'application') {
    const lower = normalized.toLowerCase();
    if (lower.includes('approved') || lower.includes('issued') || lower.includes('completed')) return 'Success';
    if (lower.includes('declined') || lower.includes('withdrawn') || lower.includes('cancelled')) return 'Alert';
    if (lower.includes('underwriting') || lower.includes('pending') || lower.includes('review')) return 'Warning';
    if (lower.includes('interview') || lower.includes('scheduled') || lower.includes('submitted')) return 'Discovery';
    return 'Informative';
  }

  if (normalized === 'Declined' || normalized === 'Terminated: Declined') return 'Alert';
  if (
    normalized === 'Not Started' ||
    normalized.includes('Terminated') ||
    normalized.includes('Cancelled') ||
    normalized.startsWith('Closed:')
  ) return 'Neutral';
  if (normalized.includes('Completed') || normalized.includes('RTW') || normalized === 'Approved') {
    return 'Success';
  }
  if (
    normalized.includes('Pending') ||
    normalized.includes('Awaiting') ||
    normalized === 'In Progress'
  ) return 'Warning';
  return 'Informative';
}

export type RequirementStatusStyle = 'caseTable' | 'panel';

/** Requirement status lozenges — panel style matches side panels; caseTable matches CaseView grids. */
export function getRequirementStatusLozengeType(
  status: string,
  style: RequirementStatusStyle = 'caseTable',
): LozengeType {
  const normalized = status.trim();
  const lower = normalized.toLowerCase();
  if (['fulfilled', 'waived', 'completed'].includes(lower)) return 'Success';
  if (lower === 'overdue') return 'Alert';
  if (lower === 'outstanding') return 'Warning';
  if (lower === 'ordered' || lower === 'scheduled') return 'Informative';
  if (['pending', 'in_review'].includes(lower)) {
    return style === 'panel' ? 'Warning' : 'Discovery';
  }
  return getStatusLozengeType(normalized, 'requirement');
}

export function getRelatedCaseStatusLozengeType(status: string): LozengeType {
  if (status === 'Declined' || status === 'Terminated: Declined') return 'Alert';
  if (status.startsWith('Terminated:') || status.startsWith('Closed:')) return 'Neutral';
  if (status === 'Approved') return 'Success';
  if (status.startsWith('Active')) return 'Informative';
  if (status === 'Pending Requirements' || status === 'Pending Decision' || status === 'In Progress') {
    return 'Warning';
  }
  return 'Informative';
}

