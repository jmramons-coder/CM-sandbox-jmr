import { AlertCircle, Check } from 'lucide-react';
import type { FormStep } from '../../data/mock-eapp';

type StepStatus = 'active' | 'completed' | 'visited' | 'upcoming';

const BADGE_PX = 32;
const BTN_PAD_X = 4; // px-1

export function EAppStepNav({
  steps,
  currentStepId,
  completedSteps,
  visitedSteps,
  onNavigate,
}: {
  steps: FormStep[];
  currentStepId: string;
  completedSteps: string[];
  visitedSteps: string[];
  onNavigate: (stepId: string) => void;
}) {
  const getStatus = (step: FormStep): StepStatus => {
    if (step.id === currentStepId) return 'active';
    if (completedSteps.includes(step.id)) return 'completed';
    if (visitedSteps.includes(step.id)) return 'visited';
    return 'upcoming';
  };

  const lineColor = (fromStatus: StepStatus) =>
    fromStatus === 'completed' ? 'bg-brand-blue' : 'bg-[#dbdee1]';

  /* The left offset for the connector so it sits at the badge horizontal center.
   * Badge center = BTN_PAD_X + BADGE_PX/2 = 4 + 16 = 20.
   * The line is w-0.5 (2px), so left edge = 20 - 1 = 19. */
  const lineLeft = BTN_PAD_X + BADGE_PX / 2 - 1;

  return (
    <nav className="flex flex-col px-3 py-4" aria-label="Application steps">
      {/* No gap on the list — connectors span continuously between adjacent badges.
          Each <li> is position:relative so the absolute connectors stay contained. */}
      <ul className="relative flex flex-col">
        {steps.map((step, idx) => {
          const status = getStatus(step);
          const canClick = status !== 'upcoming';
          const isLast = idx === steps.length - 1;
          const prevStatus = idx > 0 ? getStatus(steps[idx - 1]) : undefined;

          return (
            <li key={step.id} className="relative">
              {/* Connector from previous badge center → this badge center.
                  Drawn as a single line from top:0 to 50% of this li. */}
              {idx > 0 ? (
                <span
                  aria-hidden
                  className={`absolute top-0 h-1/2 w-0.5 ${lineColor(prevStatus!)}`}
                  style={{ left: lineLeft }}
                />
              ) : null}

              {/* Connector from this badge center → next badge center.
                  Drawn from 50% to bottom of this li. */}
              {!isLast ? (
                <span
                  aria-hidden
                  className={`absolute bottom-0 h-1/2 w-0.5 ${lineColor(status)}`}
                  style={{ left: lineLeft }}
                />
              ) : null}

              <button
                type="button"
                disabled={!canClick}
                onClick={() => canClick && onNavigate(step.id)}
                className={`relative z-[1] flex w-full items-center gap-3 rounded-lg px-1 py-3 text-left transition-colors ${
                  status === 'active'
                    ? 'text-text-heading'
                    : canClick
                      ? 'text-text-primary hover:bg-[#f1f2f2]'
                      : 'text-[#a9aeb5]'
                }`}
              >
                <div
                  className="flex shrink-0 items-center justify-center"
                  style={{ width: BADGE_PX, height: BADGE_PX }}
                >
                  <StepBadge index={idx + 1} status={status} />
                </div>
                <span
                  className={`min-w-0 truncate text-[12px] ${
                    status === 'active' ? 'font-semibold' : 'font-medium'
                  }`}
                >
                  {step.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function StepBadge({ index, status }: { index: number; status: StepStatus }) {
  if (status === 'completed') {
    return (
      <span className="relative flex size-[32px] shrink-0 items-center justify-center">
        <span className="flex size-[28px] items-center justify-center rounded-full border-[3px] border-brand-blue bg-white">
          <span className="text-[11px] font-bold text-brand-blue">{index}</span>
        </span>
        <span className="absolute -right-0.5 -top-0.5 flex size-[14px] items-center justify-center rounded-full bg-[#008533] text-white ring-2 ring-white">
          <Check className="size-2.5" strokeWidth={3} />
        </span>
      </span>
    );
  }

  if (status === 'active') {
    return (
      <span className="flex size-[32px] shrink-0 items-center justify-center rounded-full bg-brand-blue text-[12px] font-bold text-white shadow-[0_0_0_4px_var(--color-brand-blue-ring)]">
        {index}
      </span>
    );
  }

  if (status === 'visited') {
    return (
      <span className="relative flex size-[32px] shrink-0 items-center justify-center">
        <span className="flex size-[28px] items-center justify-center rounded-full border-[3px] border-brand-blue bg-white">
          <span className="text-[11px] font-bold text-brand-blue">{index}</span>
        </span>
        <span className="absolute -right-0.5 -top-0.5 flex size-[14px] items-center justify-center rounded-full bg-[#cd2c23] text-white ring-2 ring-white">
          <AlertCircle className="size-2.5" strokeWidth={3} />
        </span>
      </span>
    );
  }

  return (
    <span className="flex size-[32px] shrink-0 items-center justify-center rounded-full border-2 border-border-default bg-surface-hover text-[12px] font-bold text-[#a9aeb5]">
      {index}
    </span>
  );
}
