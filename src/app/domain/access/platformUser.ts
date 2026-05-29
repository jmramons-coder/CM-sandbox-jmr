export type PlatformUserRole =
  | 'assessor'
  | 'senior_assessor'
  | 'manager'
  | 'team_lead'
  | 'operations_admin';

export type PlatformUserStatus = 'active' | 'inactive' | 'on_leave';

export type AvailabilityBlockReason =
  | 'pto'
  | 'sick'
  | 'training'
  | 'meeting'
  | 'reduced_capacity'
  | 'other';

export type TrainingStatus = 'current' | 'expiring_soon' | 'expired' | 'planned';

export interface TrainingRecord {
  id: string;
  title: string;
  category: 'product' | 'compliance' | 'system' | 'authority';
  status: TrainingStatus;
  completedAt?: string;
  expiresAt?: string;
}

export interface AvailabilityBlock {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  reason: AvailabilityBlockReason;
  notes?: string;
  blocksAssignment: boolean;
  createdBy: string;
  createdAt: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: PlatformUserRole;
  status: PlatformUserStatus;
  band: number;
  maxAuthority: number | null;
  teamIds: string[];
  teamLabels: string[];
  managerId?: string;
  maxConcurrentTasks: number;
  training: TrainingRecord[];
}

export type UserWorkloadSlaHealth = 'ok' | 'at_risk' | 'critical';

export interface UserWorkloadSnapshot {
  userId: string;
  openTasks: number;
  overdueTasks: number;
  dueToday: number;
  inProgress: number;
  activeCases: number;
  slaHealth: UserWorkloadSlaHealth;
  aiAssistedShare: number;
  capacityPct: number;
  avCls: '' | 'amber' | 'green';
  trend: 'warn' | 'ok' | 'flat';
  trendLabel: string;
  byWorkType: Record<string, number>;
}

export type UserDirectoryRow = PlatformUser & {
  workload: UserWorkloadSnapshot;
  blockedToday: boolean;
  trainingAlert: boolean;
};

export type UsersTabType =
  | 'all'
  | 'my_team'
  | 'assessors'
  | 'managers'
  | 'away'
  | 'attention';

export type UserSortableColumn =
  | 'name'
  | 'role'
  | 'team'
  | 'openTasks'
  | 'overdue'
  | 'cases'
  | 'sla'
  | 'capacity'
  | 'status';
