import type { CaseWorkflowSubwayStage } from '../../domain/objectRefs';
import { isStepSelectable } from '../../utils/caseStageLens';
import { AiCueSparkle } from '../AiCueSparkle';
import { WorkflowStepsTabsBar } from '../WorkflowStepsTabsBar';

/** Shared sizing for the case header workflow map (subway + legacy stepper). */
export const WORKFLOW_MAP_STEP_BADGE =
  'relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors duration-300 sm:mt-0 sm:h-10 sm:w-10';
export const WORKFLOW_MAP_CONNECTOR_BASE =
  'mx-1.5 h-[3px] w-6 shrink-0 transition-colors duration-300 sm:mx-2.5 sm:w-10 md:mx-4 md:w-14';
export const WORKFLOW_MAP_STEP_LABEL = 'min-w-0 flex-1 text-base leading-snug transition-colors duration-300';
export const WORKFLOW_MAP_STEP_ROW = 'flex min-w-0 max-w-[min(100%,13rem)] items-start gap-2 sm:max-w-none sm:items-center sm:gap-2.5';
export const WORKFLOW_MAP_TRACK_ROW = 'flex min-h-[56px] w-full items-center sm:min-h-[64px]';

export function WorkflowMetaSubway({
  stages,
  mobileTabs = false,
  progressOrder,
  lensOrder = null,
  onStageSelect,
  disabled = false,
}: {
  stages: CaseWorkflowSubwayStage[];
  mobileTabs?: boolean;
  progressOrder: number;
  lensOrder?: number | null;
  onStageSelect?: (order: number) => void;
  disabled?: boolean;
}) {
  const ordered = [...stages].sort((a, b) => a.order - b.order);

  if (mobileTabs) {
    return (
      <WorkflowStepsTabsBar
        steps={ordered.map((stage, index) => ({
          id: stage.slug,
          order: stage.order,
          label: stage.name,
          state: stage.state,
          subLabel: stage.subLabel,
          showAiCue: index > 0 && index < ordered.length - 1,
        }))}
        progressOrder={progressOrder}
        lensOrder={lensOrder}
        onChange={(order) => onStageSelect?.(order)}
        disabled={disabled}
        className="rounded-b-lg bg-[rgba(250,250,250,0.8)]"
      />
    );
  }

  return (
    <div className="w-full overflow-visible rounded-b-lg bg-[rgba(250,250,250,0.8)]">
      <div className="no-scrollbar min-w-0 touch-pan-x overflow-x-auto overflow-y-visible overscroll-x-contain px-6 py-4 sm:py-5">
        <div className="inline-flex min-w-full justify-center">
          <div className="flex w-max shrink-0 items-center py-1">
        {ordered.map((stage, index) => {
          const done = stage.state === 'done';
          const active = stage.state === 'active';
          const next = ordered[index + 1];
          const connectorDone = done && next && (next.state === 'done' || next.state === 'active');
          const lensSelected = lensOrder != null && lensOrder === stage.order;
          const stepDisabled = disabled || !isStepSelectable(stage.state);
          const badgeClass = lensSelected
            ? 'bg-white text-brand-blue ring-2 ring-brand-blue ring-offset-2'
            : done
              ? 'bg-[#008533] text-white'
              : active
                ? 'bg-brand-blue text-white'
                : 'border border-[#b7bbc2] bg-white text-text-muted';

          return (
            <div key={stage.slug} className="flex shrink-0 items-center">
              {index > 0 ? (
                <span className={`${WORKFLOW_MAP_CONNECTOR_BASE} ${connectorDone ? 'bg-[#008533]' : 'bg-[#dbdee1]'}`} />
              ) : null}
              <button
                type="button"
                disabled={stepDisabled}
                aria-label={`${stage.name}${lensSelected ? ' — viewing work through this stage' : ''}`}
                aria-pressed={lensSelected}
                onClick={() => {
                  if (!stepDisabled) onStageSelect?.(stage.order);
                }}
                className={`${WORKFLOW_MAP_STEP_ROW} rounded-sm text-left outline-none transition-opacity enabled:cursor-pointer enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span className={`${WORKFLOW_MAP_STEP_BADGE} ${badgeClass}`}>
                  {active ? (
                    <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-brand-blue opacity-60 animate-ping" />
                  ) : null}
                  {done && !lensSelected ? '✓' : stage.order}
                  {index > 0 && index < ordered.length - 1 ? (
                    <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-white bg-brand-accent shadow-sm">
                      <AiCueSparkle size={8} className="!text-white" aria-hidden />
                    </span>
                  ) : null}
                </span>
                <span className={`${WORKFLOW_MAP_STEP_LABEL} ${active ? 'font-semibold text-text-heading' : done ? 'font-semibold text-brand-green' : 'text-text-muted'}`}>
                  <span className="block max-sm:truncate" title={stage.name}>{stage.name}</span>
                  {active && stage.subLabel ? (
                    <span className="mt-1 inline-flex rounded-full bg-surface-selected px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-blue sm:ml-1.5 sm:mt-0">
                      {stage.subLabel}
                    </span>
                  ) : stage.subLabel ? (
                    <span className="mt-0.5 block text-[10px] font-normal text-text-muted">{stage.subLabel}</span>
                  ) : null}
                </span>
              </button>
            </div>
          );
        })}
          </div>
        </div>
      </div>
    </div>
  );
}
