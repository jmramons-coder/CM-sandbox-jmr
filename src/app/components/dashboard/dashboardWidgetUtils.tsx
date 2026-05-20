import type { DashboardMetricBar } from '../../domain/access/roleView';

const BAR_FILL_CLASS: Record<string, string> = {
  '': 'bg-brand-blue',
  amber: 'bg-brand-orange',
  red: 'bg-brand-red',
};

type MetricBarListProps = {
  bars: DashboardMetricBar[];
  className?: string;
};

export function MetricBarList({ bars, className = '' }: MetricBarListProps) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {bars.map((bar) => (
        <div key={bar.label} className="grid grid-cols-[100px_minmax(0,1fr)_auto] items-center gap-2">
          <span className="truncate text-[11px] text-text-secondary">{bar.label}</span>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
            <span
              className={`block h-full rounded-full ${BAR_FILL_CLASS[bar.cls] ?? BAR_FILL_CLASS['']}`}
              style={{ width: `${bar.bar}%` }}
            />
          </div>
          <span className="text-[11px] font-semibold text-text-primary">{bar.val}</span>
        </div>
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
  '': 'bg-[#eef2f6] text-text-primary ring-1 ring-[#d7dde3]',
  amber: 'bg-[#fff4e6] text-[#a36d00] ring-2 ring-[#f5a200]/40',
  green: 'bg-[#e5f5ea] text-brand-green ring-2 ring-brand-green/35',
};

