import type { Task } from '../types';

function matchesSearch(task: Task, query: string): boolean {
  const q = query.toLowerCase();
  const haystack = [
    task.id,
    task.taskId,
    task.taskType,
    task.caseId,
    task.claimantName,
    task.primaryPartyName,
    task.product,
    task.assignedTo,
    task.description,
    task.aiSummary,
    task.origin,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

function matchesPriority(task: Task, filter: string): boolean {
  if (filter === 'All') return true;
  const map: Record<string, Task['priority']> = {
    Urgent: 'URGENT',
    High: 'HIGH',
    Normal: 'NORMAL',
  };
  return task.priority === map[filter];
}

function matchesSla(task: Task, filter: string): boolean {
  if (filter === 'All') return true;
  if (filter === 'At risk') return task.slaStatus === 'warning';
  if (filter === 'On track') return task.slaStatus === 'normal';
  if (filter === 'Breached') return task.slaStatus === 'danger';
  return true;
}

function matchesDueDate(task: Task, filter: string): boolean {
  if (filter === 'All') return true;
  if (filter === 'Overdue') return task.slaStatus === 'danger';
  // Demo data uses ISO-ish strings; treat warning/danger as time-sensitive buckets.
  if (filter === 'Today') return task.slaStatus === 'danger' || task.slaStatus === 'warning';
  if (filter === 'This week') return task.slaStatus !== 'normal' || Boolean(task.dueDate);
  if (filter === 'This month') return Boolean(task.dueDate) || Boolean(task.slaRemaining);
  return true;
}

export function filterTasks(
  tasks: Task[],
  options: {
    searchQuery: string;
    priorityFilter: string;
    dueDateFilter: string;
    slaStatusFilter: string;
  },
): Task[] {
  const query = options.searchQuery.trim();
  return tasks.filter(
    (task) =>
      (!query || matchesSearch(task, query))
      && matchesPriority(task, options.priorityFilter)
      && matchesDueDate(task, options.dueDateFilter)
      && matchesSla(task, options.slaStatusFilter),
  );
}
