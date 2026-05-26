/**
 * Default list ordering when the user has not chosen a column sort.
 * Active / actionable items first; completed / closed last.
 */

import type {
  CaseDocument,
  CaseRequirement,
  CaseSummary,
  ServiceRequest,
  Task,
  TaskPriority,
} from '../types';
import { getTaskKanbanColumnId, type TaskKanbanColumnId } from './task-kanban';
import { isValidDateString } from './task-helpers';

const KANBAN_RELEVANCE_RANK: Record<TaskKanbanColumnId, number> = {
  todo: 0,
  in_progress: 1,
  review: 2,
  done: 3,
};

function normalizeStatusKey(status: string): string {
  return status.trim().toLowerCase().replace(/\s+/g, ' ');
}

function requestPriorityRank(priority: string): number {
  const key = priority.toLowerCase();
  if (key === 'urgent') return 0;
  if (key === 'high') return 1;
  return 2;
}

function taskPriorityRank(priority: TaskPriority | string): number {
  if (priority === 'URGENT' || priority === 'Urgent') return 0;
  if (priority === 'HIGH' || priority === 'High') return 1;
  return 2;
}

function slaRank(sla: Task['slaStatus'] | undefined): number {
  if (sla === 'danger') return 0;
  if (sla === 'warning') return 1;
  return 2;
}

export function taskStatusRelevanceRank(status: string): number {
  const column = getTaskKanbanColumnId(status);
  return KANBAN_RELEVANCE_RANK[column];
}

export function requestStatusRelevanceRank(status: string): number {
  const key = normalizeStatusKey(status);
  if (key === 'new') return 0;
  if (key === 'in progress' || key === 'in review') return 1;
  if (key.includes('pending') || key.includes('awaiting')) return 2;
  if (key === 'completed' || key === 'rejected' || key === 'cancelled') return 4;
  return 3;
}

export function documentStatusRelevanceRank(status: string): number {
  const key = normalizeStatusKey(status);
  if (key.includes('pending') || key === 'received' || key.includes('review') || key === 'processing') return 0;
  if (key === 'rejected') return 2;
  if (key === 'validated' || key.includes('accepted') || key.includes('complete')) return 3;
  return 1;
}

export function requirementStatusRelevanceRank(status: string): number {
  const key = normalizeStatusKey(status);
  if (key === 'overdue') return 0;
  if (key === 'pending' || key === 'ordered' || key === 'in queue' || key === 'not_started' || key === 'scheduled') return 1;
  if (key === 'in_review' || key.includes('review')) return 2;
  if (key === 'fulfilled' || key === 'waived' || key === 'completed') return 4;
  return 3;
}

export function caseStatusRelevanceRank(status: string): number {
  const key = normalizeStatusKey(status);
  if (key.includes('open') || key.includes('active') || key.includes('progress') || key.includes('pending')) return 0;
  if (key.includes('hold') || key.includes('review') || key.includes('await')) return 1;
  if (key.includes('close') || key.includes('complete') || key.includes('settled') || key.includes('denied')) return 3;
  return 2;
}

function parseDateMs(value: string | undefined): number {
  if (!value || !isValidDateString(value)) return Number.POSITIVE_INFINITY;
  return new Date(value).getTime();
}

export function sortTasksByRelevance(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const statusDelta = taskStatusRelevanceRank(a.status) - taskStatusRelevanceRank(b.status);
    if (statusDelta !== 0) return statusDelta;

    const priorityDelta = taskPriorityRank(a.priority) - taskPriorityRank(b.priority);
    if (priorityDelta !== 0) return priorityDelta;

    const slaDelta = slaRank(a.slaStatus) - slaRank(b.slaStatus);
    if (slaDelta !== 0) return slaDelta;

    return parseDateMs(a.dueDate ?? a.createdDate) - parseDateMs(b.dueDate ?? b.createdDate);
  });
}

export function sortRequestsByRelevance(requests: ServiceRequest[]): ServiceRequest[] {
  return [...requests].sort((a, b) => {
    const statusDelta = requestStatusRelevanceRank(a.status) - requestStatusRelevanceRank(b.status);
    if (statusDelta !== 0) return statusDelta;

    const priorityDelta = requestPriorityRank(a.priority) - requestPriorityRank(b.priority);
    if (priorityDelta !== 0) return priorityDelta;

    return String(b.received ?? '').localeCompare(String(a.received ?? ''));
  });
}

export function sortDocumentsByRelevance(documents: CaseDocument[]): CaseDocument[] {
  return [...documents].sort((a, b) => {
    const statusDelta = documentStatusRelevanceRank(a.status) - documentStatusRelevanceRank(b.status);
    if (statusDelta !== 0) return statusDelta;

    return String(b.uploaded ?? '').localeCompare(String(a.uploaded ?? ''));
  });
}

export function sortRequirementsByRelevance(requirements: CaseRequirement[]): CaseRequirement[] {
  return [...requirements].sort((a, b) => {
    const statusDelta = requirementStatusRelevanceRank(a.status) - requirementStatusRelevanceRank(b.status);
    if (statusDelta !== 0) return statusDelta;

    return parseDateMs(a.dueDate) - parseDateMs(b.dueDate);
  });
}

export function sortCasesByRelevance(cases: CaseSummary[]): CaseSummary[] {
  return [...cases].sort((a, b) => {
    const statusDelta = caseStatusRelevanceRank(a.status) - caseStatusRelevanceRank(b.status);
    if (statusDelta !== 0) return statusDelta;

    const priorityOrder = { URGENT: 0, HIGH: 1, NORMAL: 2, Urgent: 0, High: 1, Normal: 2 };
    const aPri = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
    const bPri = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;
    if (aPri !== bPri) return aPri - bPri;

    return String(b.created ?? '').localeCompare(String(a.created ?? ''));
  });
}

/** Case task tab rows (dataset + overlay). */
export function sortCaseTaskRowsByRelevance<T extends { status: string; priority?: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const statusDelta = taskStatusRelevanceRank(a.status) - taskStatusRelevanceRank(b.status);
    if (statusDelta !== 0) return statusDelta;
    return taskPriorityRank(a.priority ?? 'Normal') - taskPriorityRank(b.priority ?? 'Normal');
  });
}

export function sortCaseDocumentsByRelevance<T extends { status: string; uploaded?: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const statusDelta = documentStatusRelevanceRank(a.status) - documentStatusRelevanceRank(b.status);
    if (statusDelta !== 0) return statusDelta;
    return String(b.uploaded ?? '').localeCompare(String(a.uploaded ?? ''));
  });
}
