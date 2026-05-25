import { useNavigate } from 'react-router';
import { SurfaceCard } from '../ds';
import { AiCueSparkle } from '../AiCueSparkle';
import type { DashboardViewModel } from '../../domain/access/roleView';
import { MetricBarList, VELOCITY_AVATAR_CLASS, VELOCITY_TREND_CLASS } from './dashboardWidgetUtils';

type DashboardTeamVelocityPanelProps = {
  viewModel: DashboardViewModel;
};

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-5 items-end gap-[2px]">
      {values.map((value, index) => {
        const height = (value / max) * 16 + 4;
        const isLast = index === values.length - 1;
        return (
          <span
            key={index}
            className={`w-[5px] rounded-sm bg-brand-blue ${isLast ? 'opacity-100' : 'opacity-60'}`}
            style={{ height }}
          />
        );
      })}
    </div>
  );
}

export function DashboardTeamVelocityPanel({ viewModel }: DashboardTeamVelocityPanelProps) {
  const navigate = useNavigate();

  return (
    <SurfaceCard className="px-4 py-3">
      <p className="text-[12px] font-semibold text-text-heading">Team velocity</p>
      <p className="mt-0.5 text-[11px] text-text-secondary">Queue trend this week</p>
      <div className="mt-3 divide-y divide-border-divider">
        {viewModel.velocity.map((row) => (
          <button
            key={row.name}
            type="button"
            onClick={() => navigate('/tasks')}
            className="flex w-full items-center gap-2.5 py-2.5 text-left transition-colors hover:bg-surface-muted"
          >
            <div
              className={`flex size-[26px] shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${VELOCITY_AVATAR_CLASS[row.avCls] ?? VELOCITY_AVATAR_CLASS['']}`}
            >
              {row.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-text-primary">{row.name}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-text-muted">{row.tasks} tasks</span>
                <span className="text-[10px] text-text-muted">{row.overdue} overdue</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${VELOCITY_TREND_CLASS[row.trend] ?? VELOCITY_TREND_CLASS.flat}`}>
                  {row.trendLabel}
                </span>
              </div>
            </div>
            <Sparkline values={row.spark} />
          </button>
        ))}
      </div>
    </SurfaceCard>
  );
}

type DashboardAiHealthPanelProps = {
  viewModel: DashboardViewModel;
};

export function DashboardAiHealthPanel({ viewModel }: DashboardAiHealthPanelProps) {
  return (
    <SurfaceCard className="px-4 py-3">
      <div className="flex items-center gap-2">
        <AiCueSparkle size={16} className="!text-text-heading" />
        <div>
          <p className="text-[12px] font-semibold text-text-heading">AI health</p>
          <p className="text-[11px] text-text-secondary">Portfolio</p>
        </div>
      </div>
      <MetricBarList bars={viewModel.aiHealthBars} className="mt-3" />
    </SurfaceCard>
  );
}
