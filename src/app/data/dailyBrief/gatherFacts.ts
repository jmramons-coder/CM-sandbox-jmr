import type { SystemDataset } from '../multi-case-dataset';
import { listAiActions, listCaseSummaries, listDocuments, listRequests, listTasks } from '../objectRepository';
import type { BuildDailyBriefParams, DailyBriefFacts } from '../../domain/dailyBrief';
import type { DashboardBlockerData, DashboardFocusData, RoleView, UserProfile } from '../../domain/access/roleView';
import type { CaseDocument, ServiceRequest, Task } from '../../types';
import {
  buildLiveBlockerData,
  buildLiveCaseHealthRows,
  buildLiveFocusData,
  HOME_CASE_KEY_BY_ID,
  HOME_DASHBOARD_CASE_IDS,
  resolveScopedCaseIds,
  selectTopFocusTask,
} from '../dashboardLiveProjection';
import { DEMO_CASE_IDS } from '../demoCaseIds';

const OPEN_TASK_STATUSES = new Set(['Open', 'In Progress', 'Pending', 'Awaiting Review', 'Ready']);

function emptyBlocker(): DashboardBlockerData {
  return { count: 0, val: '$0', items: '', primaryCaseKey: 'bb' };
}

function emptyFocus(): DashboardFocusData {
  return {
    tid: '',
    priority: 'NORMAL',
    prio: 'Normal',
    conf: '',
    title: '',
    link: '',
    claimantName: '',
    caseKey: '',
    caseId: '',
    ai: '',
    reason: '',
    ctaLabel: '',
    primaryRoute: '/tasks',
    metric: { show: false, value: '', label: '' },
  };
}

function uniqueCaseIds(ids: string[]): string[] {
  return [...new Set(ids.filter(Boolean))];
}

function resolveModuleCaseScope(dataset: SystemDataset, roleView: RoleView, profile: UserProfile): string[] {
  const summaries = listCaseSummaries(dataset);
  if (roleView === 'manager') return summaries.map((row) => row.id);
  return resolveScopedCaseIds(roleView, profile, dataset);
}

function gatherCaseCentricFacts(
  dataset: SystemDataset,
  roleView: RoleView,
  profile: UserProfile,
  scopeCaseIds: string[],
  subjectMode: DailyBriefFacts['subjectMode'],
  subjectCount: number,
  subjectLabel: string,
  scopePhrase: string,
  fallbackText: string,
  seedFocus?: DashboardFocusData,
  seedBlocker?: DashboardBlockerData,
): DailyBriefFacts {
  const isManager = roleView === 'manager';
  const tasks = listTasks(dataset).filter((task) => task.status !== 'Cancelled');
  const cases = buildLiveCaseHealthRows(dataset, scopeCaseIds);
  const blockerLive = buildLiveBlockerData(dataset, scopeCaseIds, isManager);
  const blocker = blockerLive.count > 0 ? blockerLive : seedBlocker ?? emptyBlocker();
  const focusTask = selectTopFocusTask(tasks, isManager ? 'all' : profile.name, profile);
  const caseSummaries = new Map(listCaseSummaries(dataset).map((row) => [row.id, row]));
  const focusRelatedCase = focusTask?.caseId ? caseSummaries.get(focusTask.caseId) : undefined;
  const focusBuilt = buildLiveFocusData(focusTask, seedFocus ?? emptyFocus(), roleView, dataset, focusRelatedCase);

  return {
    roleView,
    subjectMode,
    subjectCount: subjectCount || cases.length,
    subjectLabel,
    scopePhrase,
    teamScope: isManager && subjectMode === 'cases',
    cases,
    blocker,
    focus: { ...focusBuilt, linkKind: 'task' },
    fallbackText,
  };
}

function taskBelongsToUser(task: Task, profile: UserProfile): boolean {
  if (task.assignedTo === profile.name) return true;
  if (task.assignedTo === 'Me' && profile.role === 'assessor') return true;
  return false;
}

function gatherTasksFacts(
  dataset: SystemDataset,
  roleView: RoleView,
  profile: UserProfile,
  fallbackText: string,
  seedFocus?: DashboardFocusData,
  seedBlocker?: DashboardBlockerData,
): DailyBriefFacts {
  const isManager = roleView === 'manager';
  const tasks = listTasks(dataset).filter(
    (task) => OPEN_TASK_STATUSES.has(task.status) && (isManager || taskBelongsToUser(task, profile)),
  );
  const caseIds = uniqueCaseIds(tasks.map((task) => task.caseId ?? ''));
  const base = gatherCaseCentricFacts(
    dataset,
    roleView,
    profile,
    caseIds.length ? caseIds : [...HOME_DASHBOARD_CASE_IDS],
    'tasks',
    tasks.length,
    'task',
    'in your queue',
    fallbackText,
    seedFocus,
    seedBlocker,
  );
  return base;
}

function isOpenRequest(request: ServiceRequest): boolean {
  const status = request.status.toLowerCase();
  return !['completed', 'cancelled', 'closed', 'fulfilled'].includes(status);
}

function requestPriorityRank(request: ServiceRequest): number {
  const priority = request.priority?.toLowerCase() ?? '';
  if (priority.includes('urgent') || priority.includes('high')) return 0;
  if (priority.includes('normal')) return 1;
  return 2;
}

function gatherRequestsFacts(
  dataset: SystemDataset,
  roleView: RoleView,
  profile: UserProfile,
  fallbackText: string,
): DailyBriefFacts {
  const requests = listRequests(dataset).filter(isOpenRequest);
  const overdue = requests.filter((row) => row.status.toLowerCase() === 'overdue');
  const caseIds = uniqueCaseIds(requests.map((row) => row.caseId ?? ''));
  const cases = buildLiveCaseHealthRows(dataset, caseIds.length ? caseIds : [...HOME_DASHBOARD_CASE_IDS]);
  const summaries = new Map(listCaseSummaries(dataset).map((row) => [row.id, row]));
  const blockedExposure = overdue.reduce((sum, row) => {
    const benefit = summaries.get(row.caseId ?? '')?.benefit ?? '0';
    const numeric = Number(String(benefit).replace(/[^0-9.]/g, ''));
    return sum + (Number.isFinite(numeric) ? numeric : 0);
  }, 0);
  const topRequest = [...requests].sort((a, b) => requestPriorityRank(a) - requestPriorityRank(b))[0];
  const primaryCaseId = topRequest?.caseId ?? requests[0]?.caseId ?? DEMO_CASE_IDS.wopClaim;

  const focus: DailyBriefFacts['focus'] = topRequest
    ? {
        ...emptyFocus(),
        title: topRequest.title,
        caseId: topRequest.caseId ?? '',
        caseKey: HOME_CASE_KEY_BY_ID[topRequest.caseId ?? ''] ?? '',
        claimantName: summaries.get(topRequest.caseId ?? '')?.claimant ?? '',
        primaryRoute: `/requests?request=${encodeURIComponent(topRequest.id)}`,
        linkKind: 'request',
        reason: topRequest.summary ?? topRequest.aiSummary ?? '',
      }
    : emptyFocus();

  return {
    roleView,
    subjectMode: 'requests',
    subjectCount: requests.length,
    subjectLabel: 'request',
    scopePhrase: 'in this module',
    teamScope: false,
    cases,
    blocker: {
      count: overdue.length,
      val: blockedExposure > 0 ? `$${(blockedExposure / 1_000_000).toFixed(1)}M` : '$0',
      items: overdue.map((row) => row.title).slice(0, 3).join(' · '),
      primaryCaseKey: HOME_CASE_KEY_BY_ID[primaryCaseId] ?? 'bb',
    },
    focus,
    fallbackText,
  };
}

function isPendingDocument(doc: CaseDocument): boolean {
  const status = doc.status?.toLowerCase() ?? '';
  return ['in_review', 'pending', 'received', 'awaiting review', 'open'].includes(status);
}

function gatherDocumentsFacts(dataset: SystemDataset, roleView: RoleView, fallbackText: string): DailyBriefFacts {
  const documents = listDocuments(dataset);
  const pending = documents.filter(isPendingDocument);
  const withInsight = pending.filter((doc) => doc.aiInsight || doc.aiSummary);
  const top = (withInsight[0] ?? pending[0]) as CaseDocument | undefined;
  const caseIds = uniqueCaseIds(pending.map((doc) => doc.caseId ?? ''));

  const focus: DailyBriefFacts['focus'] = top
    ? {
        ...emptyFocus(),
        title: top.name ?? top.id,
        caseId: top.caseId ?? '',
        primaryRoute: `/documents?doc=${encodeURIComponent(top.id)}`,
        linkKind: 'document',
        reason: top.aiSummary ?? 'Review evidence before the case moves forward.',
      }
    : emptyFocus();

  const baseScope = caseIds.length ? caseIds : [...HOME_DASHBOARD_CASE_IDS];
  const cases = buildLiveCaseHealthRows(dataset, baseScope);
  const blocker = buildLiveBlockerData(dataset, baseScope, roleView === 'manager');

  return {
    roleView,
    subjectMode: 'documents',
    subjectCount: pending.length,
    subjectLabel: 'document',
    scopePhrase: 'awaiting review in this module',
    teamScope: false,
    cases,
    blocker,
    focus,
    fallbackText,
  };
}

function actionNeedsAttention(action: ReturnType<typeof listAiActions>[number]): boolean {
  return ['suggested', 'failed', 'rejected', 'in_progress'].includes(action.status);
}

function gatherAiActionsFacts(dataset: SystemDataset, roleView: RoleView, fallbackText: string): DailyBriefFacts {
  const actions = listAiActions(dataset).filter(actionNeedsAttention);
  const top = [...actions].sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))[0];
  const linkedCase = top?.linkedObjects.find((ref) => ref.kind === 'case');
  const caseIds = uniqueCaseIds(
    actions.map((row) => row.linkedObjects.find((ref) => ref.kind === 'case')?.id ?? '').filter(Boolean),
  );

  const focus: DailyBriefFacts['focus'] = top
    ? {
        ...emptyFocus(),
        title: top.title,
        caseId: linkedCase?.id ?? '',
        primaryRoute: linkedCase ? `/cases/${encodeURIComponent(linkedCase.id)}` : '/ai-actions',
        linkKind: 'task',
        reason: top.rationale ?? top.summary ?? '',
      }
    : emptyFocus();

  const scope = caseIds.length ? caseIds : [...HOME_DASHBOARD_CASE_IDS];
  const cases = buildLiveCaseHealthRows(dataset, scope);
  const blocker = buildLiveBlockerData(dataset, scope, roleView === 'manager');

  return {
    roleView,
    subjectMode: 'actions',
    subjectCount: actions.length,
    subjectLabel: 'action',
    scopePhrase: 'need attention in AI Actions',
    teamScope: roleView === 'manager',
    cases,
    blocker,
    focus,
    fallbackText,
  };
}

const DEFAULT_FALLBACK =
  'Review your queue for SLA deadlines, open blockers, and the highest-priority next step.';

export function gatherDailyBriefFacts(
  dataset: SystemDataset,
  profile: UserProfile,
  params: BuildDailyBriefParams,
): DailyBriefFacts {
  const { contextId, roleView, fallbackText = DEFAULT_FALLBACK, seedFocus, seedBlocker } = params;
  const isManager = roleView === 'manager';

  switch (contextId) {
    case 'home': {
      const scopeCaseIds = resolveScopedCaseIds(roleView, profile, dataset);
      return gatherCaseCentricFacts(
        dataset,
        roleView,
        profile,
        scopeCaseIds,
        'cases',
        scopeCaseIds.length,
        'case',
        'on your board',
        fallbackText,
        seedFocus,
        seedBlocker,
      );
    }
    case 'cases': {
      const scopeCaseIds = resolveModuleCaseScope(dataset, roleView, profile);
      return gatherCaseCentricFacts(
        dataset,
        roleView,
        profile,
        scopeCaseIds,
        'cases',
        scopeCaseIds.length,
        'case',
        'in this module',
        fallbackText,
        seedFocus,
        seedBlocker,
      );
    }
    case 'tasks':
      return gatherTasksFacts(dataset, roleView, profile, fallbackText, seedFocus, seedBlocker);
    case 'requests':
      return gatherRequestsFacts(dataset, roleView, profile, fallbackText);
    case 'documents':
      return gatherDocumentsFacts(dataset, roleView, fallbackText);
    case 'ai-actions':
      return gatherAiActionsFacts(dataset, roleView, fallbackText);
    default:
      return gatherCaseCentricFacts(
        dataset,
        roleView,
        profile,
        [...HOME_DASHBOARD_CASE_IDS],
        'cases',
        HOME_DASHBOARD_CASE_IDS.length,
        'case',
        isManager ? 'across the team' : 'on your board',
        fallbackText,
        seedFocus,
        seedBlocker,
      );
  }
}
