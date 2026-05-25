import homeSeed from './home-dashboard-seed.json';
import {
  DEFAULT_ROLE_VIEW,
  type DashboardBriefAction,
  type DashboardFocusData,
  type DashboardViewModel,
  type RoleView,
} from '../domain/access/roleView';
import { getUserProfile } from './userProfiles';
import { buildDailyBrief } from './dailyBrief';
import { buildLiveBriefSegments, briefSegmentsToText, buildLiveDashboardSlice } from './dashboardLiveProjection';
import type { SystemDataset } from './multi-case-dataset';

type HomeDashRole = (typeof homeSeed.DASH_DATA)['assessor'];
type BriefActionsSeed = typeof homeSeed.inlineData.briefActions;

function projectDashRole(roleView: RoleView): HomeDashRole {
  return homeSeed.DASH_DATA[roleView] as HomeDashRole;
}

function parseBriefAction(action: BriefActionsSeed['assessor'], cases: HomeDashRole['cases']): DashboardBriefAction {
  const fn = action.fn;
  if (fn.includes("go('")) {
    const caseKey = fn.match(/go\('([^']+)'\)/)?.[1] ?? '';
    const caseId = cases.find((row) => row.key === caseKey)?.id ?? '';
    return {
      label: action.label,
      route: caseId ? `/cases/${caseId}` : '/cases',
      caseKey,
    };
  }
  if (fn.includes("switchModule('tasks')")) {
    return { label: action.label, route: '/tasks' };
  }
  return { label: action.label, route: '/cases' };
}

export function buildSeedFocus(roleView: RoleView): DashboardFocusData {
  const focus = homeSeed.inlineData.focusData[roleView];
  const cases = homeSeed.DASH_DATA[roleView].cases;
  const caseId = cases.find((row) => row.key === focus.caseKey)?.id ?? '';
  const [claimantName] = focus.link.split(' · ');
  const priority = focus.prio.toLowerCase() === 'high' ? 'HIGH' : 'NORMAL';
  return {
    ...focus,
    caseId,
    priority,
    claimantName: claimantName ?? '',
    reason: focus.ai,
    primaryRoute: roleView === 'manager' && caseId ? `/cases/${caseId}` : '/tasks',
    metric: { show: false, value: '', label: '' },
  };
}

export function getDashboardViewModel(
  roleView: RoleView = DEFAULT_ROLE_VIEW,
  dataset?: SystemDataset,
): DashboardViewModel {
  const dash = projectDashRole(roleView);
  const user = getUserProfile(roleView);
  const isManager = roleView === 'manager';
  const inline = homeSeed.inlineData;
  const seedBriefAction = parseBriefAction(inline.briefActions[roleView], dash.cases);
  const seedFocus = buildSeedFocus(roleView);
  const seedProgress = inline.progressData[roleView];
  const seedBlocker = inline.blockerData[roleView];
  const seedMetricBars = isManager
    ? inline.metricBars.managerTeamMetrics
    : inline.metricBars.assessorWeekly;

  const live = dataset
    ? buildLiveDashboardSlice(
        dataset,
        roleView,
        user,
        seedFocus,
        seedProgress,
        seedBlocker,
        inline.briefTexts[roleView],
        seedBriefAction,
        dash.cards,
        seedMetricBars,
      )
    : null;

  const cases =
    live?.cases
    ?? dash.cases.map((row) => ({
      ...row,
      stages: {
        total: inline.stageProgress.stagesTotal[row.key as keyof typeof inline.stageProgress.stagesTotal] ?? 5,
        done: inline.stageProgress.stagesDone[row.key as keyof typeof inline.stageProgress.stagesDone] ?? 0,
        active: inline.stageProgress.stagesActive[row.key as keyof typeof inline.stageProgress.stagesActive] ?? 0,
      },
    }));

  const blocker = live?.blocker ?? {
    count: seedBlocker.count,
    val: seedBlocker.val,
    items: seedBlocker.items,
    primaryCaseKey: 'bb',
  };
  const focus = live?.focus ?? seedFocus;
  const progress = live?.progress ?? seedProgress;
  const seedBrief = inline.briefTexts[roleView];
  const briefBundle = dataset
    ? (() => {
        const brief = buildDailyBrief(dataset, user, {
          contextId: 'home',
          roleView,
          fallbackText: seedBrief,
          seedFocus,
          seedBlocker,
        });
        return { briefSegments: brief.segments, briefText: brief.text };
      })()
    : (() => {
        const segments = buildLiveBriefSegments(roleView, cases, blocker, focus, seedBrief);
        return {
          briefSegments: segments,
          briefText: segments.length ? briefSegmentsToText(segments) : seedBrief,
        };
      })();

  return {
    roleView,
    user,
    eyebrow: dash.eyebrow,
    headline: dash.headline,
    sub: dash.sub,
    kpis: dash.kpis,
    kpiTrends: inline.trendArrows[roleView],
    cards: live?.cards ?? dash.cards,
    ...briefBundle,
    briefAction: live?.briefAction ?? seedBriefAction,
    cases,
    showAssigneeOnCases: isManager,
    caseHealthTitle: isManager ? 'Team case health' : 'Case health',
    blocker,
    focus,
    focusTitle: 'Priority task',
    progress,
    progressTitle: isManager ? 'Team progress' : 'Weekly progress',
    progressLabel: isManager ? 'Team tasks this week' : 'Tasks completed this week',
    metricBars: live?.metricBars ?? seedMetricBars,
    velocity: isManager ? inline.velData.assessors : [],
    aiHealthBars: isManager ? inline.metricBars.managerAIHealth : [],
    activity24h: live?.activity24h?.length ? live.activity24h : dash.activity24h,
    activityWeek: live?.activityWeek?.length ? live.activityWeek : dash.activityWeek,
    activityPanelTitle: isManager ? 'Team activity' : 'Recent activity',
  };
}
