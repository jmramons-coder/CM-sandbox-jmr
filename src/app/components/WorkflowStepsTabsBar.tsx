import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import type { CaseWorkflowStageState } from '../domain/objectRefs';
import { useHorizontalScrollNav } from '../hooks/useHorizontalScrollNav';
import { AiCueSparkle } from './AiCueSparkle';

export type WorkflowStepTabItem = {
  id: string;
  order: number;
  label: string;
  state: CaseWorkflowStageState;
  subLabel?: string | null;
  showAiCue?: boolean;
  disabled?: boolean;
};

type WorkflowStepsTabsBarProps = {
  steps: WorkflowStepTabItem[];
  activeOrder: number;
  onChange: (order: number) => void;
  bleed?: boolean;
  className?: string;
  disabled?: boolean;
};

const stepButtonBase =
  'group/step relative z-0 shrink-0 whitespace-nowrap px-3 pb-2 pt-3 text-sm font-semibold transition-colors rounded-t-md enabled:hover:bg-surface-muted';

function StepIndicator({
  order,
  state,
  showAiCue,
}: {
  order: number;
  state: CaseWorkflowStageState;
  showAiCue?: boolean;
}) {
  const done = state === 'done';
  const active = state === 'active';

  return (
    <span
      className={`relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold leading-none ${
        done
          ? 'bg-[#008533] text-white'
          : active
            ? 'bg-brand-blue text-white'
            : 'border border-[#b7bbc2] bg-white text-text-muted'
      }`}
    >
      {active ? (
        <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-brand-blue opacity-60 animate-ping" />
      ) : null}
      {done ? '✓' : order}
      {showAiCue ? (
        <span className="absolute -right-0.5 -top-0.5 inline-flex h-3 w-3 items-center justify-center rounded-full border border-white bg-brand-accent shadow-sm">
          <AiCueSparkle size={6} className="!text-white" aria-hidden />
        </span>
      ) : null}
    </span>
  );
}

function StepSuffix({ state, subLabel }: { state: CaseWorkflowStageState; subLabel?: string | null }) {
  if (state === 'active' && subLabel) {
    return (
      <span className="rounded-full bg-surface-selected px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-blue">
        {subLabel}
      </span>
    );
  }
  return null;
}

/** Mobile-friendly workflow step rail — same horizontal scroll + chevrons as ModuleTabsBar. */
export function WorkflowStepsTabsBar({
  steps,
  activeOrder,
  onChange,
  bleed = false,
  className = '',
  disabled = false,
}: WorkflowStepsTabsBarProps) {
  const {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    hasOverflow,
    scrollToEdge,
    scrollItemIntoViewIfNeeded,
  } = useHorizontalScrollNav(steps.length);

  useEffect(() => {
    scrollItemIntoViewIfNeeded(`[data-workflow-step-order="${activeOrder}"]`);
  }, [activeOrder, scrollItemIntoViewIfNeeded, steps.length]);

  const rootClass = `${bleed ? '-mx-6 px-6' : 'w-full'} relative border-b border-border-default ${className}`;
  const scrollClass = `touch-pan-x overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
    hasOverflow ? 'px-9' : ''
  }`;

  return (
    <div className={rootClass}>
      {canScrollLeft ? (
        <button
          type="button"
          aria-label="Scroll workflow steps left"
          onClick={() => scrollToEdge('left')}
          className="absolute bottom-0 left-0 top-0 z-20 flex w-9 items-center justify-center border-r border-border-default bg-surface-primary text-text-secondary transition-colors hover:bg-surface-muted hover:text-brand-blue"
        >
          <ChevronLeft className="size-4" />
        </button>
      ) : null}
      {canScrollRight ? (
        <button
          type="button"
          aria-label="Scroll workflow steps right"
          onClick={() => scrollToEdge('right')}
          className="absolute bottom-0 right-0 top-0 z-20 flex w-9 items-center justify-center border-l border-border-default bg-surface-primary text-text-secondary transition-colors hover:bg-surface-muted hover:text-brand-blue"
        >
          <ChevronRight className="size-4" />
        </button>
      ) : null}
      <div ref={scrollRef} className={scrollClass} role="tablist" aria-label="Workflow steps">
        <div className="flex w-max flex-nowrap gap-0">
          {steps.map((step) => {
            const active = activeOrder === step.order;
            const stepDisabled = disabled || step.disabled || step.state === 'next';
            const toneClass = stepDisabled
              ? 'cursor-not-allowed text-[#b7bbc2]'
              : active
                ? step.state === 'done'
                  ? 'text-brand-green'
                  : 'text-text-heading'
                : step.state === 'done'
                  ? 'text-brand-green'
                  : 'text-text-secondary';

            return (
              <button
                key={step.id}
                type="button"
                role="tab"
                data-workflow-step-order={step.order}
                aria-selected={active}
                aria-disabled={stepDisabled}
                title={step.label}
                disabled={stepDisabled}
                onClick={() => {
                  if (!stepDisabled) onChange(step.order);
                }}
                className={`${stepButtonBase} ${toneClass}`}
              >
                <span className="inline-flex max-w-[11rem] items-center gap-1.5 sm:max-w-none">
                  <StepIndicator order={step.order} state={step.state} showAiCue={step.showAiCue} />
                  <span className="truncate">{step.label}</span>
                  <StepSuffix state={step.state} subLabel={step.subLabel} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
