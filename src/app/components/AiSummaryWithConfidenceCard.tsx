import type { ReactNode } from 'react';
import { resolveAiSummaryPresentation } from '../utils/aiSummaryPresentation';
import { AiCueSparkle } from './AiCueSparkle';

/** Bordered summary block with standard side-panel label (no AI sparkle tag). */
export function SidePanelSummaryBox({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-border-soft bg-white px-4 py-3 ${className}`}>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">Summary</p>
      {children}
    </div>
  );
}

const RING_SIZE = 56;
const RING_STROKE = 4;
const RING_ACCENT = 'var(--brand-accent, #602fa0)';
const RING_TRACK = 'color-mix(in srgb, var(--brand-accent, #602fa0) 14%, white)';

function clampConfidence(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function AiConfidenceKpi({
  value,
  label = 'AI confidence',
  description,
  tone = 'accent',
}: {
  value: number;
  label?: string;
  description?: string;
  tone?: 'accent' | 'blue';
}) {
  const pct = clampConfidence(value);
  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const strokeColor = tone === 'blue' ? 'var(--brand-blue, #005a8c)' : RING_ACCENT;
  const trackColor = tone === 'blue' ? 'color-mix(in srgb, var(--brand-blue, #005a8c) 14%, white)' : RING_TRACK;
  const iconWrapClass =
    tone === 'blue' ? 'bg-brand-blue/10 text-brand-blue' : 'bg-brand-accent/12 text-brand-accent';

  return (
    <div className="flex items-center gap-3" aria-label={`${pct}% ${label}`}>
      <div className="relative shrink-0" style={{ width: RING_SIZE, height: RING_SIZE }}>
        <svg width={RING_SIZE} height={RING_SIZE} className="block" aria-hidden>
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={RING_STROKE}
          />
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
          />
        </svg>
        <div
          className={`absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ${iconWrapClass}`}
        >
          <AiCueSparkle size={16} className="!text-current" />
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-[22px] font-bold leading-none tracking-tight text-text-heading">{pct}%</p>
        <p className="mt-1 max-w-[132px] text-[11px] leading-snug text-text-muted">{description ?? label}</p>
      </div>
    </div>
  );
}

export function AiSummaryWithConfidenceCard({
  text,
  confidence,
  generatedAt,
  generatedBy,
  variant = 'neutral',
  confidenceLabel = 'AI confidence',
  confidenceDescription = 'Model confidence in this summary',
  confidenceTone = 'accent',
  sectionLabel,
  showConfidence = true,
}: {
  text: string;
  confidence?: number | null;
  generatedAt?: string;
  generatedBy?: string;
  variant?: 'neutral' | 'accent';
  sectionLabel?: string;
  confidenceLabel?: string;
  confidenceDescription?: string;
  confidenceTone?: 'accent' | 'blue';
  showConfidence?: boolean;
}) {
  const headingLabel = sectionLabel ?? 'Summary';
  const showConfidenceKpi = showConfidence && confidence != null && !Number.isNaN(confidence);
  const outerClass =
    variant === 'accent'
      ? 'border-brand-accent/20 bg-brand-accent-light'
      : 'border-border-soft bg-white';

  return (
    <div className={`flex overflow-hidden rounded-lg border ${outerClass}`}>
      <div className="min-w-0 flex-1 px-4 py-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          {variant === 'accent' ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.3px] text-brand-accent">
              <AiCueSparkle size={12} />
              {headingLabel}
            </span>
          ) : (
            <span className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">{headingLabel}</span>
          )}
          {generatedAt ? (
            <span className="ml-auto rounded-full border border-border-soft bg-white px-2 py-0.5 text-[11px] font-medium text-text-secondary">
              {generatedAt}
            </span>
          ) : null}
        </div>
        <p
          className={
            variant === 'accent'
              ? 'text-sm leading-relaxed text-text-primary'
              : 'text-[12px] leading-relaxed text-text-primary'
          }
        >
          {text}
        </p>
        {generatedBy ? <p className="mt-2 text-[11px] text-text-muted">Generated by {generatedBy}</p> : null}
      </div>
      {showConfidenceKpi ? (
        <>
          <div className="w-px shrink-0 self-stretch bg-border-soft" aria-hidden />
          <div className="flex shrink-0 items-center px-5 py-3">
            <AiConfidenceKpi
              value={confidence}
              label={confidenceLabel}
              description={confidenceDescription}
              tone={confidenceTone}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

type SidePanelAiSummaryProps = Omit<
  Parameters<typeof AiSummaryWithConfidenceCard>[0],
  'confidence' | 'showConfidence'
> & {
  text: string;
  confidence?: number | null;
};

/** Side-panel summary: text only — no confidence KPI ring or “Generated by” footer. */
export function SidePanelAiSummary({ text, confidence, generatedBy: _generatedBy, generatedAt, ...rest }: SidePanelAiSummaryProps) {
  const resolved = resolveAiSummaryPresentation(text, confidence);
  if (!resolved.text) return null;

  return (
    <AiSummaryWithConfidenceCard
      {...rest}
      text={resolved.text}
      generatedAt={generatedAt}
      showConfidence={false}
    />
  );
}
