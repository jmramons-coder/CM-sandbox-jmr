import type { UserDirectoryRow, UserSortableColumn } from '../domain/access/platformUser';
import type { SortDirection } from '../types';

const ROLE_ORDER: Record<string, number> = {
  manager: 0,
  team_lead: 1,
  senior_assessor: 2,
  assessor: 3,
  operations_admin: 4,
};

const SLA_ORDER: Record<string, number> = {
  critical: 0,
  at_risk: 1,
  ok: 2,
};

export function sortUserRows(
  rows: UserDirectoryRow[],
  column: UserSortableColumn | null,
  direction: SortDirection,
): UserDirectoryRow[] {
  if (!column) {
    return [...rows].sort((a, b) => b.workload.openTasks - a.workload.openTasks);
  }
  const mult = direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    switch (column) {
      case 'name':
        return a.name.localeCompare(b.name) * mult;
      case 'role':
        return ((ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9)) * mult;
      case 'team':
        return (a.teamLabels[0] ?? '').localeCompare(b.teamLabels[0] ?? '') * mult;
      case 'openTasks':
        return (a.workload.openTasks - b.workload.openTasks) * mult;
      case 'overdue':
        return (a.workload.overdueTasks - b.workload.overdueTasks) * mult;
      case 'cases':
        return (a.workload.activeCases - b.workload.activeCases) * mult;
      case 'sla':
        return (
          ((SLA_ORDER[a.workload.slaHealth] ?? 9) - (SLA_ORDER[b.workload.slaHealth] ?? 9)) * mult
        );
      case 'capacity':
        return (a.workload.capacityPct - b.workload.capacityPct) * mult;
      case 'status':
        return (Number(a.blockedToday) - Number(b.blockedToday)) * mult;
      default:
        return 0;
    }
  });
}
