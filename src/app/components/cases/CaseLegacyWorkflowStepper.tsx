import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { useMemo, useRef } from 'react';
import type { CaseOverview, CasePhase } from '../../types';
import { AiCueSparkle } from '../AiCueSparkle';
import { WorkflowStepsTabsBar, type WorkflowStepTabItem } from '../WorkflowStepsTabsBar';
import {
  getDeathClaimPreApprovalStepTooltip,
  getNewBusinessPreApprovalStepTooltip,
  getPostApprovalStepTooltip,
  getPreApprovalStepTooltip,
} from '../stepperStepTooltips';
import {
  WORKFLOW_MAP_CONNECTOR_BASE,
  WORKFLOW_MAP_STEP_BADGE,
  WORKFLOW_MAP_STEP_LABEL,
  WORKFLOW_MAP_STEP_ROW,
  WORKFLOW_MAP_TRACK_ROW,
} from './CaseWorkflowMap';

export type CaseLegacyWorkflowStepperProps = {
  data: CaseOverview;
  effectivePhase: CasePhase;
  isCompactShell: boolean;
  isTerminated: boolean;
  isDecisionStep: boolean;
  activeStepForPhase: number;
  phaseTransition: 'idle' | 'completing' | 'scrolling';
  hasSubwayStages: boolean;
  onStageSelect: (order: number) => void;
  isStepperBusy: boolean;
};

export function CaseLegacyWorkflowStepper({
  data,
  effectivePhase,
  isCompactShell,
  isTerminated,
  isDecisionStep,
  activeStepForPhase,
  phaseTransition,
  hasSubwayStages,
  onStageSelect,
  isStepperBusy,
}: CaseLegacyWorkflowStepperProps) {
  const stepperViewportRef = useRef<HTMLDivElement>(null);
  const preStepClusterRef = useRef<HTMLDivElement>(null);
  const postStepClusterRef = useRef<HTMLDivElement>(null);

  const legacyWorkflowSteps = useMemo((): WorkflowStepTabItem[] => {
    if (hasSubwayStages) return [];

    const labels = effectivePhase === 'pre-approval' ? data.preApprovalStages : data.postApprovalStages;
    return labels.map((label, idx) => {
      const step = idx + 1;
      const isDone =
        isTerminated
        || step < activeStepForPhase
        || (phaseTransition === 'completing' && step === activeStepForPhase)
        || (step === activeStepForPhase && data.decisionTabState === 'completed');
      const isActive =
        !isTerminated
        && step === activeStepForPhase
        && (effectivePhase === 'pre-approval'
          ? activeStepForPhase <= data.preApprovalStages.length
          : activeStepForPhase >= 1)
        && phaseTransition !== 'completing'
        && data.decisionTabState !== 'completed';
      const isDecisionActive = isActive && effectivePhase === 'pre-approval' && isDecisionStep;

      return {
        id: `${effectivePhase}-${step}`,
        order: step,
        label,
        state: isDone ? 'done' : isActive ? 'active' : 'next',
        subLabel: isDecisionActive ? 'Ready' : isActive ? 'Pending' : null,
      };
    });
  }, [
    activeStepForPhase,
    data.decisionTabState,
    data.preApprovalStages,
    data.postApprovalStages,
    effectivePhase,
    hasSubwayStages,
    isDecisionStep,
    isTerminated,
    phaseTransition,
  ]);

  return (
    <div className={`w-full overflow-visible rounded-b-lg ${isTerminated ? 'bg-surface-muted/60' : 'bg-[rgba(250,250,250,0.8)]'}`}>
      <div className={`${hasSubwayStages ? 'hidden' : ''} mx-auto w-full max-w-full pb-4 pt-3 sm:pb-5 sm:pt-4`}>
        {isCompactShell && legacyWorkflowSteps.length > 0 ? (
          <WorkflowStepsTabsBar
            steps={legacyWorkflowSteps}
            activeOrder={activeStepForPhase}
            onChange={onStageSelect}
            disabled={isStepperBusy}
            className="mb-1 lg:hidden"
          />
        ) : null}
        <div className={`${isCompactShell ? 'hidden lg:block' : 'block'} flex min-h-0 min-w-0 flex-1 flex-col px-[4px]`}>
          <div ref={stepperViewportRef} className="relative min-w-0 w-full overflow-visible">
            <div className="min-w-0 w-full overflow-x-clip overflow-y-visible py-1">
              <div className={WORKFLOW_MAP_TRACK_ROW}>
                <TooltipPrimitive.Provider delayDuration={350} skipDelayDuration={200}>
                  {effectivePhase === 'pre-approval' && (
                    <div className="flex w-full shrink-0 min-w-0 flex-col justify-center">
                      <div className="no-scrollbar -mx-1 min-w-0 touch-pan-x overflow-x-auto overflow-y-visible overscroll-x-contain px-1 py-1.5">
                        <div className="inline-flex min-w-full justify-center">
                          <div ref={preStepClusterRef} className="flex w-max shrink-0 items-center py-0.5">
                            {data.preApprovalStages.map((label, idx) => {
                              const step = idx + 1;
                              const isDone = isTerminated || step < activeStepForPhase || (phaseTransition === 'completing' && step === activeStepForPhase) || (step === activeStepForPhase && data.decisionTabState === 'completed');
                              const isActive = !isTerminated && step === activeStepForPhase && activeStepForPhase <= data.preApprovalStages.length && phaseTransition !== 'completing' && data.decisionTabState !== 'completed';
                              const isDecisionActive = isActive && isDecisionStep;
                              const isDeathClaimWorkflow = data.workflowTemplateId === 'claim-death-benefit';
                              const aiMode = isDeathClaimWorkflow
                                ? step === 2
                                  ? 'Semi-auto'
                                  : step === 3
                                    ? 'Semi-auto'
                                    : step === 4
                                      ? 'Manual'
                                      : null
                                : step === 2
                                  ? 'Auto'
                                  : step === 3
                                    ? 'Semi-auto'
                                    : step === 4
                                      ? 'Semi-auto'
                                      : step === 5
                                        ? 'Manual'
                                        : null;
                              const preTip =
                                data.caseKind === 'new_business'
                                  ? getNewBusinessPreApprovalStepTooltip(
                                      idx,
                                      isDone,
                                      isActive,
                                      data.decisionTabState,
                                      isDecisionStep,
                                    )
                                  : isDeathClaimWorkflow
                                    ? getDeathClaimPreApprovalStepTooltip(
                                        idx,
                                        isDone,
                                        isActive,
                                        data.decisionTabState,
                                        isDecisionStep,
                                      )
                                    : getPreApprovalStepTooltip(
                                        idx,
                                        isDone,
                                        isActive,
                                        data.decisionTabState,
                                        isDecisionStep,
                                        aiMode,
                                      );
                              return (
                                <TooltipPrimitive.Root key={label}>
                                  <TooltipPrimitive.Trigger asChild>
                                    <div
                                      tabIndex={0}
                                      className="flex shrink-0 cursor-default items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
                                    >
                                      {idx > 0 ? (
                                        <div
                                          className={`${WORKFLOW_MAP_CONNECTOR_BASE} ${
                                            isDone || (idx < activeStepForPhase || (phaseTransition === 'completing' && idx === activeStepForPhase))
                                              ? isTerminated ? 'bg-[#b7bbc2]' : 'bg-[#008533]'
                                              : 'bg-[#dbdee1]'
                                          }`}
                                        />
                                      ) : null}
                                      <div className={WORKFLOW_MAP_STEP_ROW}>
                                        <div className={`${WORKFLOW_MAP_STEP_BADGE} ${
                                          isTerminated
                                            ? 'bg-[#b7bbc2] text-white'
                                            : isDecisionActive
                                              ? 'bg-brand-blue text-white'
                                              : isActive
                                                ? 'bg-brand-blue text-white'
                                                : isDone
                                                  ? 'bg-[#008533] text-white'
                                                  : 'bg-white border border-[#b7bbc2] text-text-muted'
                                        }`}>
                                          {!isTerminated && isDecisionActive ? (
                                            <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-brand-blue opacity-60 animate-ping" />
                                          ) : !isTerminated && isActive ? (
                                            <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-brand-blue opacity-60 animate-ping" />
                                          ) : null}
                                          {isDone ? '✓' : step}
                                          {!isTerminated && aiMode ? (
                                            <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-white bg-brand-accent shadow-sm">
                                              <AiCueSparkle size={8} className="!text-white" aria-hidden />
                                            </span>
                                          ) : null}
                                        </div>
                                        <span
                                          className={`${WORKFLOW_MAP_STEP_LABEL} ${
                                            isTerminated
                                              ? 'text-text-muted'
                                              : isDecisionActive
                                                ? 'font-semibold text-brand-blue'
                                                : isActive
                                                  ? 'font-semibold text-text-heading'
                                                  : isDone
                                                    ? 'font-semibold text-brand-green'
                                                    : 'text-text-muted'
                                          }`}
                                        >
                                          <span className="block max-sm:truncate" title={label}>
                                            {label}
                                          </span>
                                          {!isTerminated && isDecisionActive ? (
                                            <span className="mt-1 inline-flex rounded-full bg-surface-selected px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-blue sm:ml-1.5 sm:mt-0">
                                              Ready
                                            </span>
                                          ) : !isTerminated && isActive ? (
                                            <span className="mt-1 inline-flex rounded-full bg-surface-selected px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-blue sm:ml-1.5 sm:mt-0">
                                              Pending
                                            </span>
                                          ) : null}
                                        </span>
                                      </div>
                                    </div>
                                  </TooltipPrimitive.Trigger>
                                  <TooltipPrimitive.Portal>
                                    <TooltipPrimitive.Content
                                      side="top"
                                      align="center"
                                      sideOffset={10}
                                      collisionPadding={16}
                                      className="z-[300] max-w-[min(288px,calc(100vw-32px))] rounded-lg border border-[#e8eaed] bg-white px-3 py-2.5 text-left shadow-[0_8px_30px_rgba(27,28,30,0.1)] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
                                    >
                                      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{label}</p>
                                      <p className="mt-1.5 text-[11px] leading-relaxed text-text-secondary">
                                        <span className="text-text-secondary">{preTip.title}</span>
                                        {' — '}
                                        {preTip.body}
                                      </p>
                                    </TooltipPrimitive.Content>
                                  </TooltipPrimitive.Portal>
                                </TooltipPrimitive.Root>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {effectivePhase === 'post-approval' && (
                    <div className="flex w-full shrink-0 min-w-0 flex-col justify-center">
                      <div className="no-scrollbar -mx-1 min-w-0 touch-pan-x overflow-x-auto overflow-y-visible overscroll-x-contain px-1 py-1.5">
                        <div className="inline-flex min-w-full justify-center">
                          <div ref={postStepClusterRef} className="flex w-max shrink-0 items-center py-0.5">
                            {data.postApprovalStages.map((label, idx) => {
                              const step = idx + 1;
                              const isDone = isTerminated || step < activeStepForPhase;
                              const isActive = !isTerminated && step === activeStepForPhase && activeStepForPhase >= 1;
                              const postTip = getPostApprovalStepTooltip(idx, isDone, isActive);
                              return (
                                <TooltipPrimitive.Root key={label}>
                                  <TooltipPrimitive.Trigger asChild>
                                    <div
                                      tabIndex={0}
                                      className="flex shrink-0 cursor-default items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
                                    >
                                      {idx > 0 ? (
                                        <div
                                          className={`${WORKFLOW_MAP_CONNECTOR_BASE} ${
                                            isDone || idx < activeStepForPhase
                                              ? isTerminated ? 'bg-[#b7bbc2]' : 'bg-[#008533]'
                                              : 'bg-[#dbdee1]'
                                          }`}
                                        />
                                      ) : null}
                                      <div className={WORKFLOW_MAP_STEP_ROW}>
                                        <div className={`${WORKFLOW_MAP_STEP_BADGE} ${
                                          isTerminated
                                            ? 'bg-[#b7bbc2] text-white'
                                            : isActive
                                              ? 'bg-brand-blue text-white'
                                              : isDone
                                                ? 'bg-[#008533] text-white'
                                                : 'bg-white border border-[#b7bbc2] text-text-muted'
                                        }`}>
                                          {!isTerminated && isActive && (
                                            <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-brand-blue opacity-60 animate-ping" />
                                          )}
                                          {isDone ? '✓' : step}
                                        </div>
                                        <span
                                          className={`${WORKFLOW_MAP_STEP_LABEL} ${
                                            isTerminated
                                              ? 'text-text-muted'
                                              : isActive
                                                ? 'font-semibold text-text-heading'
                                                : isDone
                                                  ? 'font-semibold text-brand-green'
                                                  : 'text-text-muted'
                                          }`}
                                        >
                                          <span className="block max-sm:truncate" title={label}>
                                            {label}
                                          </span>
                                          {!isTerminated && isActive && (
                                            <span className="mt-1 inline-flex rounded-full bg-surface-selected px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-blue sm:ml-1.5 sm:mt-0">
                                              Pending
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </TooltipPrimitive.Trigger>
                                  <TooltipPrimitive.Portal>
                                    <TooltipPrimitive.Content
                                      side="top"
                                      align="center"
                                      sideOffset={10}
                                      collisionPadding={16}
                                      className="z-[300] max-w-[min(288px,calc(100vw-32px))] rounded-lg border border-[#e8eaed] bg-white px-3 py-2.5 text-left shadow-[0_8px_30px_rgba(27,28,30,0.1)] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
                                    >
                                      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{label}</p>
                                      <p className="mt-1.5 text-[11px] leading-relaxed text-text-secondary">
                                        <span className="text-text-secondary">{postTip.title}</span>
                                        {' — '}
                                        {postTip.body}
                                      </p>
                                    </TooltipPrimitive.Content>
                                  </TooltipPrimitive.Portal>
                                </TooltipPrimitive.Root>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </TooltipPrimitive.Provider>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
