import type { DashboardVelocityRow } from '../domain/access/roleView';
import { listDatasetPlatformUsers } from './datasetUsers';
import { listTasks } from './objectRepository';
import { isUserBlockedOnDate, listAvailabilityBlocks } from './userAvailabilityStore';
import type {
  PlatformUser,
  UserDirectoryRow,
  UserWorkloadSnapshot,
  UserWorkloadSlaHealth,
} from '../domain/access/platformUser';
import type { SystemDataset } from './multi-case-dataset';
import type { Task } from '../types';

const OPEN_TASK_STATUSES = new Set([
  'Open',
  'To Do',
  'In Queue',
  'In Progress',
  'Saved',
  'Pending Approval',
  'Escalated',
]);

function taskBelongsToPlatformUser(task: Task, user: PlatformUser): boolean {
  if (task.assigneeId === user.id) return true;
  if (task.assignedTo === user.name) return true;
  if (task.pickedUpBy === user.name) return true;
  if (task.assignedTo === 'Me' && user.name === 'Victor Ramon') return true;
  return false;
}

function slaHealthForTasks(tasks: Task[]): UserWorkloadSlaHealth {
  if (tasks.some((t) => t.slaStatus === 'danger')) return 'critical';
  if (tasks.some((t) => t.slaStatus === 'warning')) return 'at_risk';
  return 'ok';
}

function capacityAvCls(capacityPct: number): '' | 'amber' | 'green' {
  if (capacityPct > 100) return 'amber';
  if (capacityPct < 45) return 'green';
  return '';
}

function trendFromWorkload(open: number, overdue: number): { trend: 'warn' | 'ok' | 'flat'; trendLabel: string } {
  if (overdue > 0) return { trend: 'warn', trendLabel: `${overdue} overdue` };
  if (open > 14) return { trend: 'warn', trendLabel: 'Heavy load' };
  if (open <= 6) return { trend: 'ok', trendLabel: 'Light queue' };
  return { trend: 'flat', trendLabel: 'Steady' };
}

const DASHBOARD_VELOCITY_ROW_LIMIT = 3;

/** Manager-home badge: pace, SLA/capacity pressure — not generic “available”. */
export function dashboardVelocityTagFromRow(
  row: UserDirectoryRow,
): { trend: 'warn' | 'ok' | 'flat'; trendLabel: string } {
  const { openTasks, overdueTasks, inProgress, dueToday, capacityPct, slaHealth } = row.workload;

  if (row.blockedToday) {
    return { trend: 'flat', trendLabel: 'Away' };
  }
  if (overdueTasks > 0) {
    return {
      trend: 'warn',
      trendLabel: overdueTasks === 1 ? '↑ 1 overdue' : `↑ ${overdueTasks} overdue`,
    };
  }
  if (capacityPct > 100) {
    return { trend: 'warn', trendLabel: `${capacityPct}% capacity` };
  }
  if (slaHealth === 'at_risk' && dueToday > 0) {
    return { trend: 'warn', trendLabel: `${dueToday} due today` };
  }
  if (openTasks >= 5 && inProgress === 0) {
    return { trend: 'warn', trendLabel: '↑ queue growing' };
  }
  if (capacityPct >= 88) {
    return { trend: 'warn', trendLabel: `${capacityPct}% load` };
  }
  const activeShare = openTasks > 0 ? inProgress / openTasks : 0;
  if (openTasks >= 4 && activeShare >= 0.35) {
    return { trend: 'ok', trendLabel: '↓ clearing well' };
  }
  if (dueToday > 0) {
    return { trend: 'warn', trendLabel: `${dueToday} due today` };
  }
  if (openTasks >= 6) {
    return { trend: 'flat', trendLabel: '→ steady' };
  }
  return { trend: 'ok', trendLabel: '→ steady' };
}

function velocityAttentionScore(row: UserDirectoryRow): number {
  const workload = row.workload;
  return (
    workload.overdueTasks * 1_000
    + Math.max(0, workload.capacityPct - 100) * 10
    + (row.blockedToday ? 500 : 0)
    + (workload.inProgress === 0 && workload.openTasks >= 4 ? 80 : 0)
    + workload.dueToday * 50
    + (workload.slaHealth === 'critical' ? 120 : workload.slaHealth === 'at_risk' ? 60 : 0)
    + workload.openTasks
  );
}

export function buildUserWorkloadSnapshot(user: PlatformUser, tasks: Task[]): UserWorkloadSnapshot {
  const owned = tasks.filter(
    (task) => OPEN_TASK_STATUSES.has(task.status) && taskBelongsToPlatformUser(task, user),
  );
  const overdueTasks = owned.filter((task) => task.slaStatus === 'danger').length;
  const dueToday = owned.filter(
    (task) => task.slaStatus === 'warning' || task.slaStatus === 'danger',
  ).length;
  const inProgress = owned.filter((task) =>
    ['In Progress', 'Escalated', 'Pending Approval'].includes(task.status),
  ).length;
  const caseIds = new Set(owned.map((task) => task.caseId).filter(Boolean));
  const aiTasks = owned.filter((task) => task.hasAI || task.aiConfidence != null || task.aiSummary);
  const capacityPct = user.maxConcurrentTasks
    ? Math.round((owned.length / user.maxConcurrentTasks) * 100)
    : 0;
  const byWorkType: Record<string, number> = {};
  owned.forEach((task) => {
    const key = task.taskType || 'Other';
    byWorkType[key] = (byWorkType[key] ?? 0) + 1;
  });
  const { trend, trendLabel } = trendFromWorkload(owned.length, overdueTasks);

  return {
    userId: user.id,
    openTasks: owned.length,
    overdueTasks,
    dueToday,
    inProgress,
    activeCases: caseIds.size,
    slaHealth: slaHealthForTasks(owned),
    aiAssistedShare: owned.length ? Math.round((aiTasks.length / owned.length) * 100) : 0,
    capacityPct,
    avCls: capacityAvCls(capacityPct),
    trend,
    trendLabel,
    byWorkType,
  };
}

export function buildUserDirectoryRows(dataset: SystemDataset, datasetId: string): UserDirectoryRow[] {
  const tasks = listTasks(dataset);
  const today = new Date().toISOString().slice(0, 10);

  return listDatasetPlatformUsers(dataset).map((user) => {
    const workload = buildUserWorkloadSnapshot(user, tasks);
    const blocks = listAvailabilityBlocks(datasetId, user.id);
    const blockedToday = isUserBlockedOnDate(blocks, today);
    const trainingAlert = user.training.some(
      (record) => record.status === 'expired' || record.status === 'expiring_soon',
    );
    return {
      ...user,
      workload,
      blockedToday,
      trainingAlert,
    };
  });
}

export function tasksForPlatformUser(dataset: SystemDataset, userId: string): Task[] {
  const user = listDatasetPlatformUsers(dataset).find((row) => row.id === userId);
  if (!user) return [];
  return listTasks(dataset).filter(
    (task) => OPEN_TASK_STATUSES.has(task.status) && taskBelongsToPlatformUser(task, user),
  );
}

export function filterUsersByTab(
  rows: UserDirectoryRow[],
  tab: import('../domain/access/platformUser').UsersTabType,
  managerTeamIds: string[],
  currentUserId: string,
): UserDirectoryRow[] {
  switch (tab) {
    case 'assessors':
      return rows.filter((row) => row.role === 'assessor' || row.role === 'senior_assessor');
    case 'managers':
      return rows.filter((row) => row.role === 'manager' || row.role === 'team_lead');
    case 'my_team':
      if (!managerTeamIds.length) return rows;
      return rows.filter((row) => row.teamIds.some((id) => managerTeamIds.includes(id)));
    case 'away':
      return rows.filter((row) => row.blockedToday);
    case 'attention':
      return rows.filter(
        (row) =>
          row.workload.overdueTasks > 0
          || row.workload.capacityPct > 100
          || row.workload.slaHealth === 'critical'
          || row.trainingAlert,
      );
    case 'all':
    default:
      return rows;
  }
}

export function buildDashboardVelocityRows(
  dataset: SystemDataset,
  options?: { managerTeamIds?: string[] },
): DashboardVelocityRow[] {
  const rows = buildUserDirectoryRows(dataset, dataset.id);
  let assessors = rows.filter((row) => row.role === 'assessor' || row.role === 'senior_assessor');

  if (options?.managerTeamIds?.length) {
    assessors = assessors.filter((row) =>
      row.teamIds.some((teamId) => options.managerTeamIds!.includes(teamId)),
    );
  }

  return assessors
    .sort(
      (a, b) =>
        velocityAttentionScore(b) - velocityAttentionScore(a) || a.name.localeCompare(b.name),
    )
    .slice(0, DASHBOARD_VELOCITY_ROW_LIMIT)
    .map((row) => {
      const { trend, trendLabel } = dashboardVelocityTagFromRow(row);
      return {
        name: row.name,
        initials: row.initials,
        avCls: row.workload.avCls,
        tasks: row.workload.openTasks,
        overdue: row.workload.overdueTasks,
        capacityPct: row.workload.capacityPct,
        inProgress: row.workload.inProgress,
        trend,
        trendLabel,
      };
    });
}

export function userMatchesSearch(row: UserDirectoryRow, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    row.name.toLowerCase().includes(q)
    || row.email.toLowerCase().includes(q)
    || row.teamLabels.some((team) => team.toLowerCase().includes(q))
    || row.role.toLowerCase().includes(q)
  );
}
