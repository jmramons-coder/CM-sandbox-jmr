import type { DashboardMetricBar } from '../../domain/access/roleView';
import { AnimatedDisplayValue, AnimatedFillBar, useMountProgress } from './dashboardMotion';

const BAR_FILL_CLASS: Record<string, string> = {
  '': 'bg-brand-blue',
  amber: 'bg-brand-orange',
  red: 'bg-brand-red',
};

type MetricBarRowProps = {
  bar: DashboardMetricBar;
  index: number;
  sharedProgress?: number;
};

function MetricBarRow({ bar, index, sharedProgress }: MetricBarRowProps) {
  const ownProgress = useMountProgress(480, index * 70);
  const progress = sharedProgress ?? ownProgress;

  return (
    <div className="grid grid-cols-[100px_minmax(0,1fr)_auto] items-center gap-2">
      <span className="truncate text-[11px] text-text-secondary">{bar.label}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <AnimatedFillBar
          percent={bar.bar}
          progress={progress}
          className={`block h-full rounded-full ${BAR_FILL_CLASS[bar.cls] ?? BAR_FILL_CLASS['']}`}
        />
      </div>
      <AnimatedDisplayValue
        value={bar.val}
        progress={progress}
        className="text-[11px] font-semibold text-text-primary"
      />
    </div>
  );
}

type MetricBarListProps = {
  bars: DashboardMetricBar[];
  className?: string;
  /** When set, all bars share one progress (e.g. synced with a ring). */
  sharedProgress?: number;
};

export function MetricBarList({ bars, className = '', sharedProgress }: MetricBarListProps) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {bars.map((bar, index) => (
        <MetricBarRow key={bar.label} bar={bar} index={index} sharedProgress={sharedProgress} />
      ))}
    </div>
  );
}

export function progressRingColor(pct: number): string {
  if (pct >= 80) return 'var(--brand-green, #008533)';
  if (pct >= 50) return 'var(--brand-primary, #006296)';
  return '#f5a200';
}

export const KPI_TREND_TEXT_CLASS: Record<string, string> = {
  up: 'text-brand-red',
  down: 'text-brand-green',
  ok: 'text-brand-green',
};

export const SLA_TEXT_CLASS: Record<string, string> = {
  red: 'text-brand-red',
  amber: 'text-brand-orange',
  grn: 'text-brand-green',
};

export const ACTIVITY_DOT_CLASS: Record<string, string> = {
  ai: 'bg-[#602fa0]',
  system: 'bg-[#d7dde3]',
  human: 'bg-brand-blue',
};

export const VELOCITY_TREND_CLASS: Record<string, string> = {
  warn: 'bg-[#fde5e4] text-[#7a1d1a]',
  ok: 'bg-[#e5f5ea] text-brand-green',
  flat: 'bg-surface-muted text-text-secondary',
};

export const VELOCITY_AVATAR_CLASS: Record<string, string> = {
  '': 'bg-[#eef2f6] text-[#1B1C1E]',
  amber: 'bg-[#F7E8DF] text-[#1B1C1E]',
  green: 'bg-[#E5F2F4] text-[#1B1C1E]',
};

/** Shared interactive row hover for dashboard list widgets (inset within card padding). */
export const DASHBOARD_LIST_ROW_HOVER =
  'rounded-xl transition-colors hover:bg-surface-muted active:bg-surface-muted/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/25';

