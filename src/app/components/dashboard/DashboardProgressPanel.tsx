import { ArrowRight, CircleGauge, Flame, TrendingDown, TrendingUp } from 'lucide-react';
import { SurfaceCard } from '../ds';
import type { DashboardViewModel } from '../../domain/access/roleView';
import { MetricBarList, progressRingColor } from './dashboardWidgetUtils';

const RING_RADIUS = 28;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function VelocityIcon({ dir }: { dir: string }) {
  if (dir === 'up') return <TrendingUp className="size-3.5 text-brand-green" />;
  if (dir === 'down') return <TrendingDown className="size-3.5 text-brand-red" />;
  return <ArrowRight className="size-3.5 text-text-muted" />;
}

type DashboardProgressPanelProps = {
  viewModel: DashboardViewModel;
};

export function DashboardProgressPanel({ viewModel }: DashboardProgressPanelProps) {
  const { progress } = viewModel;
  const dashOffset = RING_CIRCUMFERENCE - (progress.pct / 100) * RING_CIRCUMFERENCE;
  const ringColor = progressRingColor(progress.pct);

  return (
    <SurfaceCard className="px-4 py-3">
      <div className="flex items-center gap-2">
        <CircleGauge className="size-4 shrink-0 text-text-heading" />
        <p className="text-[12px] font-semibold text-text-heading">{viewModel.progressTitle}</p>
      </div>
      <div className="mt-3 flex items-center gap-4">
        <svg viewBox="0 0 68 68" className="size-[68px] shrink-0" aria-hidden>
          <circle cx="34" cy="34" r={RING_RADIUS} fill="none" stroke="var(--surface-muted, #eef2f6)" strokeWidth="6" />
          <circle
            cx="34"
            cy="34"
            r={RING_RADIUS}
            fill="none"
            stroke={ringColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 34 34)"
          />
          <text x="34" y="38" textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="600">
            {progress.pct}%
          </text>
        </svg>
        <div className="min-w-0">
          <p className="text-[22px] font-semibold leading-none text-text-primary">
            {progress.done}
            <span className="text-[14px] font-medium text-text-muted"> / {progress.target}</span>
          </p>
          <p className="mt-1 text-[11px] text-text-secondary">{viewModel.progressLabel}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {progress.streak > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#fff4e6] px-2 py-0.5 text-[10px] font-semibold text-[#a36d00]">
                <Flame className="size-3" />
                {progress.streak}-day streak
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary">
              <VelocityIcon dir={progress.velDir} />
              {progress.velLabel}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 border-t border-border-default pt-3">
        <MetricBarList bars={viewModel.metricBars} />
      </div>
    </SurfaceCard>
  );
}
