import { useEffect } from 'react';
import { DEMO_CASE_IDS } from '../data/demoCaseIds';
import {
  WOP_APPOINTMENT_TASK_ROW,
  WOP_APPROVED_DECISION,
  WOP_POST_APPROVAL_REQUIREMENTS,
} from '../data/wopClaimDemoOverlay';
import type { CaseOverview, CasePhase, HumanDecision, Task } from '../types';
import { resolveTaskForCaseContextRow } from '../utils/caseContextualTask';

type GuideCaseTab = 'overview' | 'tasks' | 'requirements' | 'decision';

export type CaseViewGuideActions = {
  setActiveTab: (tab: GuideCaseTab) => void;
  setBenefitIncrease: (value: boolean) => void;
  setBenefitPopupForced: (value: boolean) => void;
  setBenefitSeen: (value: boolean) => void;
  setReqPhaseTab: (phase: CasePhase) => void;
  setNewCaseTaskReady: (value: boolean) => void;
  setNewTaskBadge: (value: boolean) => void;
  openCaseTaskPanel: (task: Task | null) => void;
  bumpData: () => void;
};

function createGuideScheduler() {
  let cancelled = false;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const schedule = (fn: () => void, ms: number) => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (!cancelled) fn();
    }, ms);
    timers.add(timer);
  };
  const cleanup = () => {
    cancelled = true;
    timers.forEach(clearTimeout);
  };
  return { schedule, cleanup };
}

/**
 * Platform-guide preview hooks. CaseView is embedded in guide iframes;
 * `?guide=...` pre-selects case state for walkthrough steps without mutating
 * the canonical demo flow.
 */
export function useCaseViewGuideEffects(
  search: string,
  data: CaseOverview,
  actions: CaseViewGuideActions,
) {
  const {
    setActiveTab,
    setBenefitIncrease,
    setBenefitPopupForced,
    setBenefitSeen,
    setReqPhaseTab,
    setNewCaseTaskReady,
    setNewTaskBadge,
    openCaseTaskPanel,
    bumpData,
  } = actions;

  useEffect(() => {
    const params = new URLSearchParams(search);
    const guide = params.get('guide');
    if (!guide) return;

    if (guide === 'confirm-plan' && data.phase === 'post-approval') {
      data.activeStage = 2;
      bumpData();
      const { schedule, cleanup } = createGuideScheduler();
      const cycleMs = 7000;
      const advanceAt = 2500;
      const cycle = () => {
        data.activeStage = 2;
        bumpData();
        schedule(() => {
          data.activeStage = 3;
          bumpData();
        }, advanceAt);
        schedule(cycle, cycleMs);
      };
      cycle();
      return cleanup;
    }

    if (guide === 'benefit-bump') {
      setBenefitIncrease(true);
      const { schedule, cleanup } = createGuideScheduler();
      const cycleMs = 7000;
      const showAt = 2500;
      const hideAt = 5500;
      const cycle = () => {
        setBenefitPopupForced(false);
        setBenefitSeen(false);
        schedule(() => {
          setBenefitPopupForced(true);
          setBenefitSeen(true);
        }, showAt);
        schedule(() => setBenefitPopupForced(false), hideAt);
        schedule(cycle, cycleMs);
      };
      cycle();
      return cleanup;
    }

    if (guide === 'task-pushed' && data.id === DEMO_CASE_IDS.wopClaim) {
      if (data.requirements.length === 0) {
        data.requirements = [...WOP_POST_APPROVAL_REQUIREMENTS];
      }
      data.activeStage = 2;
      setReqPhaseTab('post-approval');
      openCaseTaskPanel(null);
      bumpData();
      const { schedule, cleanup } = createGuideScheduler();
      const cycleMs = 8000;
      const reqAt = 2000;
      const badgeAt = 5000;
      const cycle = () => {
        setActiveTab('overview');
        setNewCaseTaskReady(false);
        setNewTaskBadge(false);
        schedule(() => setActiveTab('requirements'), reqAt);
        schedule(() => {
          setNewCaseTaskReady(true);
          setNewTaskBadge(true);
        }, badgeAt);
        schedule(cycle, cycleMs);
      };
      cycle();
      return cleanup;
    }

    if (guide === 'accept-meeting' && data.id === DEMO_CASE_IDS.wopClaim) {
      setNewCaseTaskReady(true);
      setActiveTab('overview');
      const apptTask = resolveTaskForCaseContextRow(WOP_APPOINTMENT_TASK_ROW, data);
      const { schedule, cleanup } = createGuideScheduler();
      const cycleMs = 9000;
      const showTasksAt = 1500;
      const openPanelAt = 3500;
      const cycle = () => {
        setActiveTab('overview');
        openCaseTaskPanel(null);
        schedule(() => setActiveTab('tasks'), showTasksAt);
        schedule(() => openCaseTaskPanel(apptTask), openPanelAt);
        schedule(cycle, cycleMs);
      };
      cycle();
      return cleanup;
    }

    if (guide === 'approve-flow' && data.id === DEMO_CASE_IDS.wopClaim) {
      const { schedule, cleanup } = createGuideScheduler();
      const cycleMs = 9000;
      const requirementsAt = 1000;
      const decisionAt = 3400;
      const approveAt = 6300;
      const initialDecisionTabState = data.decisionTabState;
      const approvedDecision: HumanDecision = { ...WOP_APPROVED_DECISION, recordedAt: new Date().toISOString() };
      const cycle = () => {
        data.humanDecision = undefined;
        data.decisionTabState = initialDecisionTabState;
        setActiveTab('overview');
        bumpData();
        schedule(() => setActiveTab('requirements'), requirementsAt);
        schedule(() => setActiveTab('decision'), decisionAt);
        schedule(() => {
          data.humanDecision = approvedDecision;
          data.decisionTabState = 'completed';
          bumpData();
        }, approveAt);
        schedule(cycle, cycleMs);
      };
      cycle();
      return cleanup;
    }

    if (guide === 'new-case-appears' && data.id === DEMO_CASE_IDS.wopClaim) {
      data.humanDecision = { ...WOP_APPROVED_DECISION, recordedAt: new Date().toISOString() };
      data.decisionTabState = 'completed';
      setActiveTab('overview');
      bumpData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, data.id]);
}
