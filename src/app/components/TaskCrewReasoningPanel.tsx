import { AlertTriangle, Check, ChevronDown, Info } from 'lucide-react';
import { useState } from 'react';
import type { TaskCrewFinding, TaskCrewFindingTone, TaskCrewStep } from '../types';
import { cn } from './ui/utils';

function formatCrewTimestamp(iso?: string): string {
  if (!iso?.trim()) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function FindingIcon({ tone }: { tone: TaskCrewFindingTone }) {
  if (tone === 'warning') {
    return <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-[#c47f00]" strokeWidth={2.25} aria-hidden />;
  }
  if (tone === 'info') {
    return <Info className="mt-0.5 size-3.5 shrink-0 text-brand-blue" strokeWidth={2.25} aria-hidden />;
  }
  return <Check className="mt-0.5 size-3.5 shrink-0 text-brand-green" strokeWidth={2.5} aria-hidden />;
}

function CrewStepSection({
  step,
  density = 'default',
}: {
  step: TaskCrewStep;
  density?: 'default' | 'compact';
}) {
  const completed = step.status !== 'in_progress' && step.status !== 'pending';
  const agentLine = [step.agent ? `Agent: ${step.agent}` : null, step.completedAt ? formatCrewTimestamp(step.completedAt) : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      className={cn(
        density === 'compact' ? 'py-3 first:pt-0 last:pb-0' : 'py-4 first:pt-3 last:pb-0',
      )}
    >
      <div className="flex items-start gap-2">
        {completed ? (
          <Check className="mt-0.5 size-4 shrink-0 text-brand-green" strokeWidth={2.5} aria-hidden />
        ) : null}
        <div className="min-w-0 flex-1">
          <h4 className="text-[13px] font-semibold leading-snug text-text-heading">{step.title}</h4>
          {agentLine ? <p className="mt-0.5 text-[11px] text-text-muted">{agentLine}</p> : null}

          {step.findings.length ? (
            <ul className="mt-3 space-y-2">
              {step.findings.map((finding) => (
                <li key={`${step.id}-${finding.text}`} className="flex gap-2 text-[12px] leading-relaxed text-text-primary">
                  <FindingIcon tone={finding.tone ?? 'success'} />
                  <span>{finding.text}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {step.rationale ? (
            <p className="mt-3 text-[12px] leading-relaxed text-text-secondary">{step.rationale}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function TaskCrewReasoningPanel({
  steps,
  defaultOpen = false,
  variant = 'inline',
}: {
  steps: TaskCrewStep[];
  defaultOpen?: boolean;
  /** `section` — full-width block with top/bottom dividers (copilot brief). `inline` — task side panel. */
  variant?: 'inline' | 'section';
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (!steps.length) return null;

  const isSection = variant === 'section';
  const stepDensity = isSection ? 'compact' : 'default';

  return (
    <section className={cn('-mx-4 border-t border-border-soft px-4', isSection ? 'mt-3' : 'mt-3 pt-3')}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex w-full items-center justify-between gap-2 text-left',
          isSection ? 'py-2.5' : 'py-0',
        )}
        aria-expanded={open}
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">
          Intelligence reasoning
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-text-muted transition-transform duration-300 ease-out motion-reduce:transition-none',
            open ? 'rotate-180' : 'rotate-0',
          )}
          aria-hidden
        />
      </button>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={cn(
              'divide-y divide-border-soft',
              isSection ? 'pb-3' : 'pt-1',
              open && 'animate-in fade-in duration-200 motion-reduce:animate-none',
            )}
          >
            {steps.map((step) => (
              <CrewStepSection key={step.id} step={step} density={stepDensity} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
