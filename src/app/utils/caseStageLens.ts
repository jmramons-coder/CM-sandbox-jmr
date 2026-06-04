import type { CaseWorkflowStageState } from '../domain/objectRefs';
import type { CaseOverview } from '../types';

export type WorkflowLensStep = {
  order: number;
  slug: string;
  name: string;
  state: CaseWorkflowStageState;
  subLabel?: string | null;
};

export function isStepSelectable(state: CaseWorkflowStageState): boolean {
  return state === 'done' || state === 'active';
}

export function formatStageSlugForDisplay(stage?: string): string {
  if (!stage?.trim()) return '—';
  return stage.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function slugifyLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

export function resolveWorkflowSteps(data: Pick<
  CaseOverview,
  'workflowMeta' | 'workflowState' | 'phase' | 'preApprovalStages' | 'postApprovalStages'
>): WorkflowLensStep[] {
  const subway = data.workflowMeta?.subwayStages;
  if (subway?.length) {
    return [...subway]
      .sort((a, b) => a.order - b.order)
      .map((stage) => ({
        order: stage.order,
        slug: stage.slug,
        name: stage.name,
        state: stage.state,
        subLabel: stage.subLabel,
      }));
  }

  const workflowSteps = data.workflowState?.steps;
  if (workflowSteps?.length) {
    return workflowSteps.map((step, index) => ({
      order: index + 1,
      slug: step.id,
      name: step.label,
      state: step.status === 'completed'
        ? 'done'
        : step.status === 'active'
          ? 'active'
          : 'next',
    }));
  }

  const labels = data.phase === 'post-approval' ? data.postApprovalStages : data.preApprovalStages;
  return labels.map((label, index) => ({
    order: index + 1,
    slug: slugifyLabel(label),
    name: label,
    state: 'next' as CaseWorkflowStageState,
  }));
}

export function resolveProgressOrder(data: Pick<CaseOverview, 'activeStage'>): number {
  return Math.max(1, data.activeStage);
}

/** Apply done/active/next to legacy label-only steps using progress order. */
export function enrichLegacyStepStates(
  steps: WorkflowLensStep[],
  progressOrder: number,
): WorkflowLensStep[] {
  if (steps.some((step) => step.state !== 'next')) return steps;
  return steps.map((step) => ({
    ...step,
    state: step.order < progressOrder
      ? 'done'
      : step.order === progressOrder
        ? 'active'
        : 'next',
  }));
}

export function resolveStageOrder(stage: string | undefined, steps: WorkflowLensStep[]): number | null {
  if (!stage?.trim() || !steps.length) return null;
  const normalized = stage.trim().toLowerCase();
  const bySlug = steps.find(
    (step) => step.slug.toLowerCase() === normalized || slugifyLabel(step.slug) === normalized,
  );
  if (bySlug) return bySlug.order;

  const byName = steps.find(
    (step) =>
      step.name.toLowerCase() === normalized
      || slugifyLabel(step.name) === normalized
      || slugifyLabel(step.name) === slugifyLabel(stage),
  );
  if (byName) return byName.order;

  return null;
}

export function resolveMaxWorkflowStepOrder(steps: WorkflowLensStep[]): number {
  return Math.max(...steps.map((step) => step.order), 1);
}

/** Active step and final pipeline step use exact match; earlier steps are cumulative. */
export function usesExactStageLens(
  lensOrder: number,
  progressOrder: number,
  steps: WorkflowLensStep[],
): boolean {
  const maxOrder = resolveMaxWorkflowStepOrder(steps);
  return lensOrder === progressOrder || lensOrder === maxOrder;
}

export function matchesStageLens(
  row: { stage?: string },
  lensOrder: number | null,
  steps: WorkflowLensStep[],
  progressOrder: number,
): boolean {
  if (lensOrder == null) return true;
  const rowOrder = resolveStageOrder(row.stage, steps);
  if (rowOrder == null) return false;
  if (usesExactStageLens(lensOrder, progressOrder, steps)) {
    return rowOrder === lensOrder;
  }
  return rowOrder <= lensOrder;
}

/** @deprecated Use matchesStageLens */
export function matchesCumulativeStageLens(
  row: { stage?: string },
  lensOrder: number | null,
  steps: WorkflowLensStep[],
): boolean {
  const progressOrder = Math.max(
    ...steps.filter((step) => step.state === 'active').map((step) => step.order),
    steps.filter((step) => step.state === 'done').map((step) => step.order).at(-1) ?? 1,
  );
  return matchesStageLens(row, lensOrder, steps, progressOrder);
}

export function resolveLensStepLabel(steps: WorkflowLensStep[], lensOrder: number | null): string | null {
  if (lensOrder == null) return null;
  return steps.find((step) => step.order === lensOrder)?.name ?? formatStageSlugForDisplay(
    steps.find((step) => step.order === lensOrder)?.slug,
  );
}

export function resolveLensBannerMode(
  lensOrder: number | null,
  steps: WorkflowLensStep[],
  progressOrder: number,
): 'at' | 'through' | null {
  if (lensOrder == null) return null;
  return usesExactStageLens(lensOrder, progressOrder, steps) ? 'at' : 'through';
}
