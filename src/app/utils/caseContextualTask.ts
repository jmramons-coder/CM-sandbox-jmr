import type { CaseOverview, Task, TaskPriority, TaskStatus } from '../types';

export type CaseContextualTaskRow = {
  id: string;
  taskType: string;
  priority: 'High' | 'Normal' | 'Urgent';
  status: string;
  dueDate: string;
  assignee: string;
  owner?: string;
};

const PRIORITY_MAP: Record<string, TaskPriority> = {
  High: 'HIGH',
  Normal: 'NORMAL',
  Urgent: 'URGENT',
};

const STATUS_MAP: Record<string, TaskStatus> = {
  Open: 'Open',
  'In Progress': 'In Progress',
  'Pending Approval': 'Pending Approval',
  Escalated: 'Escalated',
  Complete: 'Complete',
  Cancelled: 'Cancelled',
  Saved: 'Saved',
};

function buildSyntheticCaseTask(row: CaseContextualTaskRow, data: CaseOverview): Task {
  return {
    id: row.id,
    priority: PRIORITY_MAP[row.priority] ?? 'NORMAL',
    caseType: data.productType || data.lineOfBusiness || data.caseTypeLabel || 'Case',
    taskType: row.taskType,
    hasAI: false,
    claimantName: data.claimantName,
    claimantPolicyRole: data.primaryPartyPolicyRole,
    primaryPartyName: data.primaryPartyName ?? data.claimantName,
    primaryPartyLabel: data.primaryPartyLabel ?? 'Primary party',
    product: data.productName,
    slaRemaining: row.dueDate,
    slaStatus: 'normal',
    status: STATUS_MAP[row.status] ?? 'Open',
    assignedTo: row.assignee ?? row.owner ?? 'Unassigned',
    origin: 'Case file',
    createdDate: '',
    queue: 'my_tasks',
    requiredAuthorityLevel: 1,
    caseId: data.id,
  };
}

export function resolveTaskForCaseContextRow(row: CaseContextualTaskRow, data: CaseOverview): Task {
  return buildSyntheticCaseTask(row, data);
}
