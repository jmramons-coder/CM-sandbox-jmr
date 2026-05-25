import { useNavigate } from 'react-router';
import { SurfaceCard } from '../ds';
import { AiCueSparkle } from '../AiCueSparkle';
import type { DashboardViewModel } from '../../domain/access/roleView';
import { AnimatedDisplayValue } from './dashboardMotion';
import {
  DASHBOARD_LIST_ROW_HOVER,
  MetricBarList,
  VELOCITY_AVATAR_CLASS,
  VELOCITY_TREND_CLASS,
} from './dashboardWidgetUtils';

type DashboardTeamVelocityPanelProps = {
  viewModel: DashboardViewModel;
};

export function DashboardTeamVelocityPanel({ viewModel }: DashboardTeamVelocityPanelProps) {
  const navigate = useNavigate();

  return (
    <SurfaceCard className="px-4 py-3">
      <p className="text-[12px] font-semibold text-text-heading">Team velocity</p>
      <p className="mt-0.5 text-[11px] text-text-secondary">Queue trend this week</p>
      <div className="mt-3 flex flex-col gap-1">
        {viewModel.velocity.map((row) => (
          <button
            key={row.name}
            type="button"
            onClick={() => navigate('/tasks')}
            className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left ${DASHBOARD_LIST_ROW_HOVER}`}
          >
            <div
              className={`flex size-[26px] shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${VELOCITY_AVATAR_CLASS[row.avCls] ?? VELOCITY_AVATAR_CLASS['']}`}
            >
              {row.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-text-primary">{row.name}</p>
              <p className="mt-0.5 text-[10px] text-text-muted">
                <AnimatedDisplayValue value={String(row.tasks)} className="inline" /> tasks ·{' '}
                <AnimatedDisplayValue value={String(row.overdue)} className="inline" /> overdue
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${VELOCITY_TREND_CLASS[row.trend] ?? VELOCITY_TREND_CLASS.flat}`}
            >
              {row.trendLabel}
            </span>
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
