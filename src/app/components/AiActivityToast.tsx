import { useEffect, useRef, useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { AiCueSparkle } from './AiCueSparkle';

export type AiActivityStep = {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'done';
};

export type AiActivitySequence = {
  id: string;
  title: string;
  steps: AiActivityStep[];
  stepDelayMs?: number;
  startedAt: number;
};

type Props = {
  sequence: AiActivitySequence | null;
  onDismiss: () => void;
  onStepDone?: (stepId: string) => void;
  /** When set, the toast pauses after this step completes until the prop is cleared. */
  pauseAfterStepId?: string | null;
  /**
   * Override the wrapper className to swap the default viewport-fixed position
   * (used in the live app) for something else — e.g. absolute placement inside
   * the Platform Guide preview frame.
   */
  containerClassName?: string;
};

export function AiActivityToast({
  sequence,
  onDismiss,
  onStepDone,
  pauseAfterStepId,
  containerClassName,
}: Props) {
  const [steps, setSteps] = useState<AiActivityStep[]>([]);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const listRef = useRef<HTMLDivElement>(null);
  const seqIdRef = useRef<string | null>(null);
  const onStepDoneRef = useRef(onStepDone);
  onStepDoneRef.current = onStepDone;
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const allStepsRef = useRef<AiActivityStep[]>([]);
  const currentIdxRef = useRef(0);
  const pausedRef = useRef<string | false>(false);
  const delayRef = useRef(1800);
  const advanceRef = useRef<() => void>(() => {});

  advanceRef.current = () => {
    const allSteps = allStepsRef.current;
    let idx = currentIdxRef.current;

    if (idx < allSteps.length) {
      allSteps[idx].status = 'done';
      onStepDoneRef.current?.(allSteps[idx].id);
    }
    idx++;
    currentIdxRef.current = idx;

    if (idx < allSteps.length) {
      allSteps[idx].status = 'in_progress';
      setSteps(allSteps.slice(0, idx + 1).map((s) => ({ ...s })));

      const justDoneId = allSteps[idx - 1]?.id;
      if (justDoneId && justDoneId === pausedRef.current) {
        return;
      }
      timerRef.current = setTimeout(() => advanceRef.current(), delayRef.current);
    } else {
      setSteps(allSteps.map((s) => ({ ...s })));
    }
  };

  const prevPauseRef = useRef(pauseAfterStepId);
  useEffect(() => {
    const prev = prevPauseRef.current;
    prevPauseRef.current = pauseAfterStepId;
    pausedRef.current = pauseAfterStepId ?? false;

    if (prev !== pauseAfterStepId) {
      const allSteps = allStepsRef.current;
      const idx = currentIdxRef.current;
      if (idx > 0 && idx < allSteps.length && allSteps[idx].status === 'in_progress') {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => advanceRef.current(), delayRef.current);
      }
    }
  }, [pauseAfterStepId]);

  useEffect(() => {
    if (!sequence) {
      seqIdRef.current = null;
      setSteps([]);
      setExiting(false);
      allStepsRef.current = [];
      currentIdxRef.current = 0;
      return;
    }

    if (sequence.id === seqIdRef.current) return;
    seqIdRef.current = sequence.id;
    setExiting(false);

    const allSteps = sequence.steps.map((s) => ({ ...s }));
    allStepsRef.current = allSteps;
    delayRef.current = sequence.stepDelayMs ?? 1800;
    currentIdxRef.current = 0;

    allSteps[0].status = 'in_progress';
    setSteps([{ ...allSteps[0] }]);

    timerRef.current = setTimeout(() => advanceRef.current(), delayRef.current);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sequence]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [steps]);

  if (!sequence || steps.length === 0) return null;

  const positionClass = containerClassName ?? 'fixed bottom-6 left-[92px] z-[200] w-[300px]';

  return (
    <div
      data-ai-panel-ignore-outside
      className={`${positionClass} ${
        exiting
          ? 'animate-[aiActivitySlideOut_0.35s_ease-in_forwards]'
          : 'animate-[fadeInUp_0.35s_ease-out]'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="overflow-hidden rounded-xl border border-border-soft bg-white shadow-[0_16px_48px_rgba(0,0,0,0.14),0_4px_12px_rgba(0,0,0,0.08)]">
        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-[#f0f0f0] bg-surface-primary px-3.5 py-2.5">
          <div className="min-w-0 flex-1 flex items-center gap-2">
            <AiCueSparkle size={16} className="shrink-0 !text-brand-accent" />
            <div className="flex flex-col leading-none">
              <span className="text-[9px] font-normal tracking-wide text-text-muted">amplify</span>
              <span className="text-[12px] font-bold text-brand-accent">AI Feed</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              setExiting(true);
              setTimeout(() => onDismissRef.current(), 400);
            }}
            className="rounded-md p-1 text-[#b7bbc2] transition-colors hover:bg-surface-muted hover:text-text-secondary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Steps */}
        <div ref={listRef} className="max-h-[240px] overflow-y-auto px-3 py-2">
          <div className="space-y-0">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className="flex items-start gap-2 py-1"
                style={{
                  animation: idx === steps.length - 1 ? 'aiActivityFadeIn 0.3s ease-out' : undefined,
                }}
              >
                {/* Icon */}
                <div className="mt-0.5 flex h-[14px] w-[14px] shrink-0 items-center justify-center">
                  {step.status === 'done' ? (
                    <span className="flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#e5f5ea]">
                      <Check className="h-2.5 w-2.5 text-brand-green" strokeWidth={2.5} />
                    </span>
                  ) : (
                    <Loader2
                      className="h-[14px] w-[14px] animate-spin text-brand-accent"
                      strokeWidth={2}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`min-w-0 truncate text-[12px] leading-snug ${
                    step.status === 'done'
                      ? 'text-text-muted'
                      : 'font-medium text-text-primary'
                  }`}
                  title={step.label}
                >
                  {step.label}
                  {step.status === 'in_progress' && (
                    <span
                      className="ml-1 inline-block text-brand-accent"
                      style={{ animation: 'aiActivityPulse 1.4s ease-in-out infinite' }}
                    >
                      ...
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Purple accent bar at bottom */}
        <div className="h-[3px] bg-gradient-to-r from-brand-accent via-brand-accent/60 to-brand-accent" />
      </div>
    </div>
  );
}
