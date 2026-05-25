import type { DashboardTaskMetric } from '../../utils/dashboard-task-widget';

/** Dashboard role view — controls identity framing and dashboard data projection. */
export type RoleView = 'assessor' | 'manager';

export type UserProfile = {
  name: string;
  initials: string;
  email: string;
  role: RoleView;
  band: number;
  team: string;
  maxAuthority: number | null;
};

export type DashboardKpi = {
  val: string;
  label: string;
  cls: 'red' | 'blue' | 'grn' | 'amber' | string;
};

export type DashboardKpiTrend = {
  arrow: string;
  cls: 'up' | 'down' | 'ok' | string;
  label: string;
};

export type DashboardSummaryCard = {
  icon: string;
  iconBg: string;
  iconColor: string;
  val: string;
  valCls: string;
  title: string;
  sub: string;
};

export type DashboardBriefAction = {
  label: string;
  route: string;
  caseKey?: string;
};

export type DashboardBriefHighlightTone = 'neutral' | 'warn' | 'urgent' | 'action' | 'positive';

export type DashboardBriefHighlightIcon = 'sla' | 'blocker' | 'focus' | 'progress' | 'decision';

export type DashboardBriefSegment =
  | { type: 'text'; value: string }
  | {
      type: 'cue';
      label: string;
      tone: DashboardBriefHighlightTone;
      icon: DashboardBriefHighlightIcon;
    }
  | {
      type: 'link';
      label: string;
      route: string;
      kind: 'case' | 'task' | 'request' | 'document';
    };

export type DashboardCaseRow = {
  key: string;
  name: string;
  id: string;
  type: string;
  status: string;
  dot: string;
  val: string;
  sla: string;
  slaCls: string;
  assignee: string;
};

export type CaseStageProgress = {
  total: number;
  done: number;
  active: number;
};

export type DashboardCaseHealthRow = DashboardCaseRow & {
  stages: CaseStageProgress;
};

export type DashboardBlockerData = {
  count: number;
  val: string;
  items: string;
  primaryCaseKey: string;
};

export type DashboardFocusData = {
  tid: string;
  taskId?: string;
  priority: string;
  prio: string;
  conf: string;
  title: string;
  link: string;
  claimantName: string;
  caseKey: string;
  caseId: string;
  ai: string;
  reason: string;
  ctaLabel: string;
  primaryRoute: string;
  metric: DashboardTaskMetric;
  evidenceLabel?: string;
  evidenceRoute?: string;
};

export type DashboardProgressData = {
  done: number;
  target: number;
  streak: number;
  velDir: 'up' | 'down' | 'flat' | string;
  velLabel: string;
  pct: number;
};

export type DashboardMetricBar = {
  label: string;
  val: string;
  bar: number;
  cls: '' | 'amber' | 'red' | string;
};

export type DashboardVelocityRow = {
  name: string;
  initials: string;
  avCls: string;
  tasks: number;
  overdue: number;
  trend: 'warn' | 'ok' | 'flat' | string;
  trendLabel: string;
  spark: number[];
};

export type DashboardActivityRow = {
  ts: string;
  actor: string;
  action: string;
  case: string;
};

export type TeamAssessorRow = {
  name: string;
  initials: string;
  avCls: string;
  tasks: number;
  overdue: number;
  cases: number;
  sla: string;
  slaCls: string;
  conf: number;
  trend: string;
  trendLabel: string;
  spark: number[];
};

export type AiConfidenceBar = {
  label: string;
  pct: number;
  cls: string;
};

export type ActivityDotClass = 'ai' | 'system' | 'human';

export type DashboardViewModel = {
  roleView: RoleView;
  user: UserProfile;
  eyebrow: string;
  headline: string;
  sub: string;
  kpis: DashboardKpi[];
  kpiTrends: DashboardKpiTrend[];
  cards: DashboardSummaryCard[];
  /** Plain-text fallback when segments are empty. */
  briefText: string;
  briefSegments: DashboardBriefSegment[];
  briefAction: DashboardBriefAction;
  cases: DashboardCaseHealthRow[];
  showAssigneeOnCases: boolean;
  caseHealthTitle: string;
  blocker: DashboardBlockerData;
  focus: DashboardFocusData;
  focusTitle: string;
  progress: DashboardProgressData;
  progressTitle: string;
  progressLabel: string;
  metricBars: DashboardMetricBar[];
  velocity: DashboardVelocityRow[];
  aiHealthBars: DashboardMetricBar[];
  activity24h: DashboardActivityRow[];
  activityWeek: DashboardActivityRow[];
  activityPanelTitle: string;
};

export const DEFAULT_ROLE_VIEW: RoleView = 'assessor';

export function isRoleView(value: unknown): value is RoleView {
  return value === 'assessor' || value === 'manager';
}

export function classifyActivityDot(actor: string): ActivityDotClass {
  if (actor === 'AI Agent') return 'ai';
  if (actor === 'System') return 'system';
  return 'human';
}
