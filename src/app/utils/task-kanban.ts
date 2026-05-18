import type { Task, TaskStatus } from '../types';

export type TaskKanbanColumnId = 'todo' | 'in_progress' | 'review' | 'done';

export type TaskKanbanColumn = {
  id: TaskKanbanColumnId;
  label: string;
  hint: string;
  accentClass: string;
  statuses: TaskStatus[];
};

export const TASK_KANBAN_COLUMNS: TaskKanbanColumn[] = [
  {
    id: 'todo',
    label: 'To do',
    hint: 'Open & queued',
    accentClass: 'bg-[#6b7280]',
    statuses: ['Open', 'To Do', 'In Queue'],
  },
  {
    id: 'in_progress',
    label: 'In progress',
    hint: 'Active work',
    accentClass: 'bg-brand-blue',
    statuses: ['In Progress', 'Saved'],
  },
  {
    id: 'review',
    label: 'Review',
    hint: 'Approval & escalation',
    accentClass: 'bg-[#f5a200]',
    statuses: ['Pending Approval', 'Escalated'],
  },
  {
    id: 'done',
    label: 'Done',
    hint: 'Closed tasks',
    accentClass: 'bg-brand-green',
    statuses: ['Complete', 'Completed', 'Cancelled'],
  },
];

const PRIORITY_RANK: Record<Task['priority'], number> = {
  URGENT: 0,
  HIGH: 1,
  NORMAL: 2,
};

const SLA_RANK: Record<Task['slaStatus'], number> = {
  danger: 0,
  warning: 1,
  normal: 2,
};

export function getTaskKanbanColumnId(status: TaskStatus): TaskKanbanColumnId {
  const match = TASK_KANBAN_COLUMNS.find((column) => column.statuses.includes(status));
  return match?.id ?? 'todo';
}

export function groupTasksByKanbanColumn(tasks: Task[]): Record<TaskKanbanColumnId, Task[]> {
  const groups: Record<TaskKanbanColumnId, Task[]> = {
    todo: [],
    in_progress: [],
    review: [],
    done: [],
  };

  const sorted = [...tasks].sort((a, b) => {
    const priorityDelta = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (priorityDelta !== 0) return priorityDelta;
    return SLA_RANK[a.slaStatus] - SLA_RANK[b.slaStatus];
  });

  for (const task of sorted) {
    groups[getTaskKanbanColumnId(task.status)].push(task);
  }

  return groups;
}

export function getKanbanStatusForColumn(columnId: TaskKanbanColumnId): TaskStatus {
  const column = TASK_KANBAN_COLUMNS.find((item) => item.id === columnId);
  return column?.statuses[0] ?? 'Open';
}
