import { DEMO_CASE_IDS } from './demoCaseIds';
import { SBLI_CASE_WORKFLOW_GI_RECORDS } from './sbli-case-workflow-gi-records';
import {
  listCaseSummaries,
  listTasks,
} from './objectRepository';
import { buildDashboardActivityFeed } from '../utils/dashboardFeed';
import {
  buildDashboardTaskReason,
  resolveDashboardTaskEvidenceRoute,
  resolveDashboardTaskMetric,
  resolveDashboardTaskPrimaryAction,
  resolveDashboardTaskPrimaryRoute,
  resolveTaskEvidenceButtonLabel,
  resolveTaskEvidenceDocumentId,
  resolveTaskEvidencePreview,
} from '../utils/dashboard-task-widget';
import { formatCurrencyAmount, parseCurrencyAmount } from '../utils/currency';
import type { CaseSummary } from '../types';
import type { SystemDataset } from './multi-case-dataset';
import type {
  CaseStageProgress,
  DashboardActivityRow,
  DashboardBlockerData,
  DashboardBriefAction,
  DashboardBriefHighlightIcon,
  DashboardBriefHighlightTone,
  DashboardBriefSegment,
  DashboardCaseHealthRow,
  DashboardFocusData,
  DashboardMetricBar,
  DashboardProgressData,
  DashboardSummaryCard,
  RoleView,
  UserProfile,
} from '../domain/access/roleView';
import type { CaseRecord } from '../domain/objectRefs';
import type { Task } from '../types';

/** Demo cases shown on the home dashboard (matches seed keys bb/sd/mt/er). */
export const HOME_DASHBOARD_CASE_IDS = [
  DEMO_CASE_IDS.wopClaim,
  DEMO_CASE_IDS.deathClaim,
  DEMO_CASE_IDS.nbFullUw,
  DEMO_CASE_IDS.nbSimpleUw,
] as const;

export const HOME_CASE_KEY_BY_ID: Record<string, string> = {
  [DEMO_CASE_IDS.wopClaim]: 'bb',
  [DEMO_CASE_IDS.deathClaim]: 'sd',
  [DEMO_CASE_IDS.nbFullUw]: 'mt',
  [DEMO_CASE_IDS.nbSimpleUw]: 'er',
};

const OPEN_TASK_STATUSES = new Set([
  'Open',
  'To Do',
  'In Queue',
  'In Progress',
  'Saved',
  'Pending Approval',
  'Escalated',
]);

const DONE_TASK_STATUSES = new Set(['Complete', 'Completed']);

const PRIORITY_RANK: Record<string, number> = {
  URGENT: 0,
  HIGH: 1,
  NORMAL: 2,
  LOW: 3,
};

function taskBelongsToUser(task: Task, profile: UserProfile): boolean {
  if (task.assignedTo === profile.name) return true;
  // userDirectory labels the signed-in demo user as "Me" for Victor's queue.
  if (task.assignedTo === 'Me' && profile.role === 'assessor') return true;
  return false;
}

const ASSESSOR_WEEKLY_TARGET = 10;
const MANAGER_WEEKLY_TARGET = 40;

function getLinkedCaseId(refs: { kind: string; id: string }[] = []): string | undefined {
  return refs.find((ref) => ref.kind === 'case')?.id;
}

function parseBenefitAmount(value?: string | null): number {
  if (!value) return 0;
  const digits = value.replace(/[^0-9]/g, '');
  return digits ? Number.parseInt(digits, 10) : 0;
}

function formatExposure(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`;
  return `$${amount.toLocaleString()}`;
}

function isBlockingRequirementStatus(status: string): boolean {
  const normalized = status.toLowerCase();
  return normalized === 'overdue' || normalized === 'not_started' || normalized === 'pending';
}

export function getCaseStagesFromRecord(caseRecord?: CaseRecord): CaseStageProgress {
  const stages =
    caseRecord?.workflowMeta?.subwayStages
    ?? SBLI_CASE_WORKFLOW_GI_RECORDS[caseRecord?.id ?? '']?.workflowMeta.subwayStages
    ?? [];
  return {
    total: stages.length,
    done: stages.filter((stage) => stage.state === 'done').length,
    active: stages.filter((stage) => stage.state === 'active').length,
  };
}

function resolveSlaPresentation(caseRecord?: CaseRecord, summary?: CaseSummary) {
  const slaSlot = caseRecord?.workflowMeta?.contextBar.find(
    (slot) => slot.label.toLowerCase() === 'sla',
  );
  const valueColor = slaSlot?.valueColor;
  const slaCls =
    valueColor === 'danger' ? 'red'
      : valueColor === 'warning' ? 'amber'
        : summary?.priority === 'Urgent' || summary?.priority === 'High' ? 'amber'
          : 'grn';
  const dot = slaCls === 'red' ? '#E24B4A' : slaCls === 'amber' ? '#f5a200' : '#3B6D11';
  const slaLabel = slaSlot?.value
    ? (slaSlot.value.toLowerCase() === 'today' ? 'SLA Today' : `SLA ${slaSlot.value}`)
    : `SLA ${summary?.sla ?? '—'}`;
  return { slaCls, dot, sla: slaLabel };
}

export function buildLiveCaseHealthRows(
  dataset: SystemDataset,
  scopeCaseIds: string[],
): DashboardCaseHealthRow[] {
  const summaries = new Map(listCaseSummaries(dataset).map((row) => [row.id, row]));
  return scopeCaseIds
    .map((caseId) => {
      const caseRecord = dataset.cases.find((row) => row.id === caseId);
      const summary = summaries.get(caseId);
      if (!caseRecord && !summary) return null;
      const meta = caseRecord?.workflowMeta ?? SBLI_CASE_WORKFLOW_GI_RECORDS[caseId]?.workflowMeta;
      const { slaCls, dot, sla } = resolveSlaPresentation(caseRecord, summary);
      return {
        key: HOME_CASE_KEY_BY_ID[caseId] ?? caseId,
        name: summary?.claimant ?? meta?.contextBar[0]?.value ?? caseId,
        id: caseId,
        type: meta?.type ?? (caseId.startsWith('NB') ? 'NB' : 'CD'),
        status: meta?.status ?? summary?.status ?? 'Active',
        dot,
        val: summary?.benefit ?? '—',
        sla,
        slaCls,
        assignee: meta?.assignee ?? summary?.primaryPartyName ?? '—',
        stages: getCaseStagesFromRecord(caseRecord),
      } satisfies DashboardCaseHealthRow;
    })
    .filter((row): row is DashboardCaseHealthRow => Boolean(row));
}

export function buildLiveBlockerData(
  dataset: SystemDataset,
  scopeCaseIds: string[],
  isManager: boolean,
): DashboardBlockerData {
  const scope = new Set(scopeCaseIds);
  const summaries = new Map(listCaseSummaries(dataset).map((row) => [row.id, row]));
  const blockingReqs = dataset.requirements.filter((requirement) => {
    const caseId = getLinkedCaseId(requirement.linkedObjects);
    if (!caseId || !scope.has(caseId)) return false;
    return isBlockingRequirementStatus(requirement.status);
  });

  const blockedCaseIds = new Set<string>();
  for (const requirement of blockingReqs) {
    const caseId = getLinkedCaseId(requirement.linkedObjects);
    if (caseId) blockedCaseIds.add(caseId);
  }

  const blockedExposure = [...blockedCaseIds].reduce((sum, caseId) => {
    return sum + parseBenefitAmount(summaries.get(caseId)?.benefit);
  }, 0);

  const itemLabels = blockingReqs
    .slice(0, isManager ? 5 : 3)
    .map((requirement) => {
      const label = requirement.label.trim();
      if (requirement.status.toLowerCase() === 'overdue') {
        return `${label.split(' ')[0]} overdue`;
      }
      return label.length > 28 ? `${label.slice(0, 28)}…` : label;
    });

  const primaryCaseKey =
    HOME_CASE_KEY_BY_ID[[...blockedCaseIds][0] ?? DEMO_CASE_IDS.wopClaim] ?? 'bb';

  return {
    count: blockingReqs.length,
    val: formatExposure(blockedExposure),
    items: itemLabels.join(' · ') || 'No open blockers',
    primaryCaseKey,
  };
}

export function selectTopFocusTask(
  tasks: Task[],
  assigneeFilter: string | 'all',
  profile?: UserProfile,
): Task | undefined {
  return tasks
    .filter(
      (task) =>
        OPEN_TASK_STATUSES.has(task.status)
        && (
          assigneeFilter === 'all'
          || (profile ? taskBelongsToUser(task, profile) : task.assignedTo === assigneeFilter)
        ),
    )
    .sort((a, b) => {
      const priorityDelta =
        (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9);
      if (priorityDelta !== 0) return priorityDelta;
      const aConf = a.aiConfidence ?? a.aiNarrative?.confidence ?? 0;
      const bConf = b.aiConfidence ?? b.aiNarrative?.confidence ?? 0;
      return bConf - aConf;
    })[0];
}

function mapSeedPriority(prio: string): string {
  if (prio.toLowerCase() === 'high') return 'HIGH';
  if (prio.toLowerCase() === 'urgent') return 'URGENT';
  return 'NORMAL';
}

function normalizeSeedFocus(fallback: DashboardFocusData, roleView: RoleView): DashboardFocusData {
  const [claimantName] = fallback.link.split(' · ');
  const primaryRoute = fallback.primaryRoute
    ?? (fallback.taskId
      ? `/tasks#task=${encodeURIComponent(fallback.taskId)}`
      : '/tasks');
  return {
    ...fallback,
    priority: fallback.priority || mapSeedPriority(fallback.prio),
    claimantName: fallback.claimantName || claimantName || '',
    reason: fallback.reason || fallback.ai,
    primaryRoute: fallback.primaryRoute || primaryRoute,
    metric: fallback.metric ?? { show: false, value: '', label: '' },
  };
}

export function buildLiveFocusData(
  task: Task | undefined,
  fallback: DashboardFocusData,
  roleView: RoleView,
  dataset?: SystemDataset,
  relatedCase?: CaseSummary,
): DashboardFocusData {
  if (!task) return normalizeSeedFocus(fallback, roleView);

  const caseId = task.caseId ?? '';
  const caseKey = HOME_CASE_KEY_BY_ID[caseId] ?? fallback.caseKey;
  const confidence = task.aiConfidence ?? task.aiNarrative?.confidence;
  const confLabel = confidence ? `${Math.round(confidence)}% AI confidence` : fallback.conf;
  const reason = buildDashboardTaskReason(task);
  const metric = resolveDashboardTaskMetric(
    task,
    relatedCase,
    (value, options) => formatCurrencyAmount(value, 'USD', options),
    parseCurrencyAmount,
  );
  const evidencePreview = dataset ? resolveTaskEvidencePreview(task, dataset) : null;
  const primaryAction = resolveDashboardTaskPrimaryAction(task, roleView);

  return {
    tid: task.taskId ?? task.id,
    taskId: task.id,
    priority: task.priority,
    prio: task.priority === 'URGENT' || task.priority === 'HIGH' ? 'High' : 'Normal',
    conf: confLabel,
    title: task.taskType,
    link: `${task.claimantName}${caseId ? ` · ${caseId}` : ''}`,
    claimantName: task.claimantName ?? relatedCase?.claimant ?? '',
    caseKey,
    caseId: caseId || fallback.caseId,
    ai: reason,
    reason,
    ctaLabel: primaryAction.label,
    primaryRoute:
      roleView === 'manager' && caseId
        ? `/cases/${caseId}`
        : resolveDashboardTaskPrimaryRoute(task),
    metric,
    evidenceLabel: evidencePreview
      ? resolveTaskEvidenceButtonLabel(task, evidencePreview)
      : undefined,
    evidenceRoute: dataset ? resolveDashboardTaskEvidenceRoute(task, dataset) : undefined,
    evidenceDocumentId: dataset ? resolveTaskEvidenceDocumentId(task, dataset) : undefined,
    evidencePreviewUrl: evidencePreview?.pages[0]?.image,
    evidencePreviewTitle: evidencePreview?.documentTitle,
  };
}

export function buildLiveProgressData(
  tasks: Task[],
  profile: UserProfile,
  isManager: boolean,
  fallback: DashboardProgressData,
): DashboardProgressData {
  const relevantTasks = isManager
    ? tasks
    : tasks.filter((task) => taskBelongsToUser(task, profile));
  const done = relevantTasks.filter((task) => DONE_TASK_STATUSES.has(task.status)).length;
  const target = isManager ? MANAGER_WEEKLY_TARGET : ASSESSOR_WEEKLY_TARGET;
  const pct = target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0;
  const openCount = relevantTasks.filter((task) => OPEN_TASK_STATUSES.has(task.status)).length;

  return {
    done,
    target,
    streak: fallback.streak,
    velDir: done > fallback.done ? 'up' : done < fallback.done ? 'down' : fallback.velDir,
    velLabel: isManager ? fallback.velLabel : `${openCount} open in queue`,
    pct,
  };
}

export function buildLiveMetricBars(
  dataset: SystemDataset,
  scopeCaseIds: string[],
  tasks: Task[],
  profile: UserProfile,
  isManager: boolean,
  fallback: DashboardMetricBar[],
): DashboardMetricBar[] {
  const scope = new Set(scopeCaseIds);
  const scopedReqs = dataset.requirements.filter((requirement) => {
    const caseId = getLinkedCaseId(requirement.linkedObjects);
    return caseId && scope.has(caseId);
  });
  const fulfilledReqs = scopedReqs.filter(
    (requirement) => ['fulfilled', 'waived', 'completed', 'validated', 'done'].includes(requirement.status.toLowerCase()),
  ).length;
  const reqsPct = scopedReqs.length ? Math.round((fulfilledReqs / scopedReqs.length) * 100) : fallback[2]?.bar ?? 49;

  const slaOkCases = scopeCaseIds.filter((caseId) => {
    const record = dataset.cases.find((row) => row.id === caseId);
    const slaSlot = record?.workflowMeta?.contextBar.find((slot) => slot.label.toLowerCase() === 'sla');
    return slaSlot?.valueColor !== 'danger';
  }).length;
  const slaPct = scopeCaseIds.length ? Math.round((slaOkCases / scopeCaseIds.length) * 100) : fallback[0]?.bar ?? 75;

  const scopedTasks = isManager
    ? tasks.filter((task) => task.caseId && scope.has(task.caseId))
    : tasks.filter((task) => taskBelongsToUser(task, profile));
  const aiTasks = scopedTasks.filter((task) => task.aiConfidence != null || task.aiNarrative?.confidence != null);
  const avgAi = aiTasks.length
    ? Math.round(
        aiTasks.reduce(
          (sum, task) => sum + (task.aiConfidence ?? task.aiNarrative?.confidence ?? 0),
          0,
        ) / aiTasks.length,
      )
    : fallback[1]?.bar ?? 91;

  if (isManager) {
    return [
      { label: 'SLA compliance', val: `${slaPct}%`, bar: slaPct, cls: slaPct < 80 ? 'amber' : '' },
      { label: 'Decision velocity', val: fallback[1]?.val ?? '+3', bar: fallback[1]?.bar ?? 60, cls: '' },
      { label: 'AI alignment', val: `${avgAi}%`, bar: avgAi, cls: '' },
    ];
  }

  return [
    { label: 'SLA compliance', val: `${slaPct}%`, bar: slaPct, cls: slaPct < 80 ? 'amber' : '' },
    { label: 'AI alignment', val: `${avgAi}%`, bar: avgAi, cls: '' },
    { label: 'Reqs fulfilled', val: `${reqsPct}%`, bar: reqsPct, cls: reqsPct < 60 ? 'amber' : '' },
  ];
}

import { briefSegmentsToText, buildDailyBriefSegments } from './dailyBrief/segmentBuilder';
import type { DailyBriefFacts } from '../domain/dailyBrief';

export { briefSegmentsToText };

/** @deprecated Prefer buildDailyBrief() — kept for dashboard slice assembly. */
export function buildLiveBriefSegments(
  roleView: RoleView,
  cases: DashboardCaseHealthRow[],
  blocker: DashboardBlockerData,
  focus: DashboardFocusData,
  fallback: string,
): DashboardBriefSegment[] {
  const facts: DailyBriefFacts = {
    roleView,
    subjectMode: 'cases',
    subjectCount: cases.length,
    subjectLabel: 'case',
    scopePhrase: roleView === 'manager' ? 'in flight' : 'on your board',
    teamScope: roleView === 'manager',
    cases,
    blocker,
    focus: { ...focus, linkKind: 'task' },
    fallbackText: fallback,
  };
  if (!cases.length) return [{ type: 'text', value: fallback }];
  return buildDailyBriefSegments(facts);
}

/** @deprecated Use buildLiveBriefSegments */
export function composeLiveBriefText(
  roleView: RoleView,
  cases: DashboardCaseHealthRow[],
  blocker: DashboardBlockerData,
  focus: DashboardFocusData,
  fallback: string,
): string {
  return briefSegmentsToText(buildLiveBriefSegments(roleView, cases, blocker, focus, fallback));
}

export function buildLiveBriefAction(
  roleView: RoleView,
  focus: DashboardFocusData,
  fallback: DashboardBriefAction,
): DashboardBriefAction {
  if (roleView === 'manager') {
    return { label: fallback.label, route: '/tasks' };
  }
  if (focus.caseId) {
    return {
      label: fallback.label,
      route: `/cases/${focus.caseId}`,
      caseKey: focus.caseKey,
    };
  }
  return fallback;
}

export function buildLiveSummaryCards(
  tasks: Task[],
  profile: UserProfile,
  isManager: boolean,
  fallback: DashboardSummaryCard[],
): DashboardSummaryCard[] {
  if (isManager) return fallback;

  const myOpen = tasks.filter(
    (task) => taskBelongsToUser(task, profile) && OPEN_TASK_STATUSES.has(task.status),
  );
  const overdue = myOpen.filter((task) => task.slaStatus === 'danger').length;
  const ready = myOpen.filter((task) =>
    task.taskType.toLowerCase().includes('decision')
    || (task.aiSummary ?? '').toLowerCase().includes('decision'),
  ).length;
  const attention = myOpen.filter(
    (task) => task.slaStatus !== 'normal' || task.alert?.type === 'blocking',
  ).length;
  const atRisk = overdue > 0;

  return [
    {
      ...fallback[0],
      val: String(myOpen.length),
      sub: `${overdue} overdue · ${ready} ready`,
    },
    {
      ...fallback[1],
      val: String(attention),
    },
    {
      ...fallback[2],
      val: atRisk ? 'At risk' : 'On track',
      valCls: atRisk ? 'red' : '',
      sub: atRisk
        ? `Next breach ${myOpen.find((task) => task.slaStatus === 'danger')?.dueDate ?? 'soon'}`
        : 'No SLA breaches today',
    },
  ];
}

function mapActivityActor(
  row: ReturnType<typeof buildDashboardActivityFeed>[number],
  roleView: RoleView,
  userName: string,
): string {
  if (row.type === 'AI' || row.event === 'task' && row.type === 'AI') return 'AI Agent';
  if (row.type === 'Event' && row.status.toLowerCase().includes('system')) return 'System';
  if (roleView === 'assessor' && (row.entity === userName || row.next.toLowerCase().startsWith('you'))) {
    return 'You';
  }
  return row.entity || userName;
}

export function buildLiveActivityRows(
  dataset: SystemDataset,
  roleView: RoleView,
  profile: UserProfile,
): { activity24h: DashboardActivityRow[]; activityWeek: DashboardActivityRow[] } {
  const summaries = listCaseSummaries(dataset);
  const caseById = new Map(summaries.map((row) => [row.id, row]));
  const feed = buildDashboardActivityFeed(dataset, caseById);

  const scopedFeed = feed.filter((row) =>
    row.caseId === '-' || HOME_DASHBOARD_CASE_IDS.includes(row.caseId as typeof HOME_DASHBOARD_CASE_IDS[number]),
  );

  const mapped: DashboardActivityRow[] = scopedFeed.map((row) => ({
    ts: row.time,
    actor: mapActivityActor(row, roleView, profile.name),
    action: row.next,
    case: row.caseId === '-' ? '' : row.caseId,
  }));

  return {
    activity24h: mapped.filter((_, index) => scopedFeed[index]?.period === 'day'),
    activityWeek: mapped.filter((_, index) => {
      const period = scopedFeed[index]?.period;
      return period === 'day' || period === 'week';
    }),
  };
}

export function resolveScopedCaseIds(roleView: RoleView, profile: UserProfile, dataset: SystemDataset): string[] {
  if (roleView === 'manager') return [...HOME_DASHBOARD_CASE_IDS];

  const scoped = HOME_DASHBOARD_CASE_IDS.filter((caseId) => {
    const record = dataset.cases.find((row) => row.id === caseId);
    const assignee =
      record?.workflowMeta?.assignee
      ?? SBLI_CASE_WORKFLOW_GI_RECORDS[caseId]?.workflowMeta.assignee;
    return !assignee || assignee === profile.name || assignee === 'Victor Ramon';
  });
  return scoped.length ? scoped : [...HOME_DASHBOARD_CASE_IDS];
}

export function buildLiveDashboardSlice(
  dataset: SystemDataset,
  roleView: RoleView,
  profile: UserProfile,
  seedFocus: DashboardFocusData,
  seedProgress: DashboardProgressData,
  seedBlocker: DashboardBlockerData,
  seedBrief: string,
  seedBriefAction: DashboardBriefAction,
  seedCards: DashboardSummaryCard[],
  seedMetricBars: DashboardMetricBar[],
) {
  const isManager = roleView === 'manager';
  const scopeCaseIds = resolveScopedCaseIds(roleView, profile, dataset);
  const tasks = listTasks(dataset).filter((task) => task.status !== 'Cancelled');
  const cases = buildLiveCaseHealthRows(dataset, [...HOME_DASHBOARD_CASE_IDS]);
  const blocker = buildLiveBlockerData(dataset, [...HOME_DASHBOARD_CASE_IDS], isManager);
  const focusTask = selectTopFocusTask(
    tasks,
    isManager ? 'all' : profile.name,
    profile,
  );
  const caseSummaries = new Map(listCaseSummaries(dataset).map((row) => [row.id, row]));
  const focusRelatedCase = focusTask?.caseId ? caseSummaries.get(focusTask.caseId) : undefined;
  const focus = buildLiveFocusData(focusTask, seedFocus, roleView, dataset, focusRelatedCase);
  const progress = buildLiveProgressData(tasks, profile, isManager, seedProgress);
  const metricBars = buildLiveMetricBars(
    dataset,
    scopeCaseIds,
    tasks,
    profile,
    isManager,
    seedMetricBars,
  );
  const activity = buildLiveActivityRows(dataset, roleView, profile);

  return {
    cases,
    blocker: blocker.count > 0 ? blocker : seedBlocker,
    focus,
    progress,
    metricBars,
    ...(() => {
      const segments = buildLiveBriefSegments(
        roleView,
        cases,
        blocker.count > 0 ? blocker : seedBlocker,
        focus,
        seedBrief,
      );
      return {
        briefSegments: segments,
        briefText: segments.length ? briefSegmentsToText(segments) : seedBrief,
      };
    })(),
    briefAction: buildLiveBriefAction(roleView, focus, seedBriefAction),
    cards: buildLiveSummaryCards(tasks, profile, isManager, seedCards),
    activity24h: activity.activity24h,
    activityWeek: activity.activityWeek,
  };
}
