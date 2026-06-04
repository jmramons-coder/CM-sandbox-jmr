import { describe, expect, it } from 'vitest';
import type { CaseOverview } from '../types';
import {
  enrichLegacyStepStates,
  isStepSelectable,
  matchesStageLens,
  resolveStageOrder,
  resolveWorkflowSteps,
  usesExactStageLens,
} from './caseStageLens';

const subwayCase = {
  workflowMeta: {
    subwayStages: [
      { order: 1, name: 'FNOL received', slug: 'fnol_received', state: 'done' as const, subLabel: null },
      { order: 2, name: 'Initial triage', slug: 'initial_triage', state: 'done' as const, subLabel: null },
      { order: 3, name: 'Req. gathering', slug: 'req_gathering', state: 'active' as const, subLabel: null },
      { order: 4, name: 'Medical review', slug: 'medical_review', state: 'next' as const, subLabel: null },
    ],
  },
  phase: 'pre-approval' as const,
  preApprovalStages: [],
  postApprovalStages: [],
  activeStage: 3,
} satisfies Pick<CaseOverview, 'workflowMeta' | 'phase' | 'preApprovalStages' | 'postApprovalStages' | 'activeStage'>;

describe('caseStageLens', () => {
  it('resolves subway workflow steps', () => {
    const steps = resolveWorkflowSteps(subwayCase);
    expect(steps).toHaveLength(4);
    expect(steps[2]?.slug).toBe('req_gathering');
  });

  it('isStepSelectable allows done and active only', () => {
    expect(isStepSelectable('done')).toBe(true);
    expect(isStepSelectable('active')).toBe(true);
    expect(isStepSelectable('next')).toBe(false);
  });

  it('uses exact lens for active and final pipeline step', () => {
    const steps = resolveWorkflowSteps(subwayCase);
    expect(usesExactStageLens(3, 3, steps)).toBe(true);
    expect(usesExactStageLens(4, 3, steps)).toBe(true);
    expect(usesExactStageLens(2, 3, steps)).toBe(false);
  });

  it('matches cumulative lens for earlier stages', () => {
    const steps = resolveWorkflowSteps(subwayCase);
    expect(matchesStageLens({ stage: 'fnol_received' }, 2, steps, 3)).toBe(true);
    expect(matchesStageLens({ stage: 'req_gathering' }, 2, steps, 3)).toBe(false);
    expect(matchesStageLens({ stage: 'req_gathering' }, 3, steps, 3)).toBe(true);
    expect(matchesStageLens({ stage: 'fnol_received' }, 3, steps, 3)).toBe(false);
    expect(matchesStageLens({ stage: undefined }, 2, steps, 3)).toBe(false);
    expect(matchesStageLens({ stage: 'fnol_received' }, null, steps, 3)).toBe(true);
  });

  it('resolveStageOrder matches slug and label', () => {
    const steps = resolveWorkflowSteps(subwayCase);
    expect(resolveStageOrder('fnol_received', steps)).toBe(1);
    expect(resolveStageOrder('FNOL received', steps)).toBe(1);
    expect(resolveStageOrder('unknown', steps)).toBeNull();
  });

  it('enrichLegacyStepStates derives state from progress order', () => {
    const legacy = resolveWorkflowSteps({
      phase: 'pre-approval',
      preApprovalStages: ['A', 'B', 'C'],
      postApprovalStages: [],
      workflowMeta: undefined,
      workflowState: undefined,
    });
    const enriched = enrichLegacyStepStates(legacy, 2);
    expect(enriched[0]?.state).toBe('done');
    expect(enriched[1]?.state).toBe('active');
    expect(enriched[2]?.state).toBe('next');
  });
});
