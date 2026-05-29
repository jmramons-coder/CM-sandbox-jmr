import { Users } from 'lucide-react';
import { useNavigate } from 'react-router';
import { userId } from '../../data/userDirectory';
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
      <div className="flex items-start gap-2">
        <Users className="size-4 shrink-0 text-text-heading" aria-hidden />
        <div>
          <p className="text-[12px] font-semibold text-text-heading">Team velocity</p>
          <p className="mt-0.5 text-[11px] text-text-secondary">Pace, issues & capacity</p>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-1">
        {viewModel.velocity.map((row) => (
          <button
            key={row.name}
            type="button"
            onClick={() => navigate(`/team?user=${encodeURIComponent(userId(row.name))}`)}
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
                <AnimatedDisplayValue value={String(row.tasks)} className="inline" /> open
                {row.inProgress > 0 ? (
                  <>
                    {' '}
                    · <AnimatedDisplayValue value={String(row.inProgress)} className="inline" /> in progress
                  </>
                ) : null}
                {' '}
                · <AnimatedDisplayValue value={String(row.capacityPct)} className="inline" />% capacity
                {row.overdue > 0 ? (
                  <>
                    {' '}
                    · <span className="font-semibold text-brand-red">
                      <AnimatedDisplayValue value={String(row.overdue)} className="inline" /> overdue
                    </span>
                  </>
                ) : null}
              </p>
            </div>
            <span
              className={`max-w-[108px] shrink-0 truncate rounded-full px-2 py-0.5 text-[10px] font-semibold ${VELOCITY_TREND_CLASS[row.trend] ?? VELOCITY_TREND_CLASS.flat}`}
              title={row.trendLabel}
            >
              {row.trendLabel}
            </span>
          </button>
        ))}
      </div>
      {viewModel.velocity.length > 0 ? (
        <button
          type="button"
          onClick={() => navigate('/team')}
          className="mt-2 w-full text-left text-[11px] font-semibold text-brand-blue hover:text-brand-blue-hover"
        >
          View full team
        </button>
      ) : null}
    </SurfaceCard>
  );
}

type DashboardAiHealthPanelProps = {
  viewModel: DashboardViewModel;
};

export function DashboardAiHealthPanel({ viewModel }: DashboardAiHealthPanelProps) {
  return (
    <SurfaceCard className="px-4 py-3">
      <div className="flex items-start gap-2">
        <AiCueSparkle size={16} className="!mt-0.5 shrink-0 !text-text-heading" aria-hidden />
        <div>
          <p className="text-[12px] font-semibold text-text-heading">Intelligence health</p>
          <p className="mt-0.5 text-[11px] text-text-secondary">Portfolio</p>
        </div>
      </div>
      <MetricBarList bars={viewModel.aiHealthBars} className="mt-3" />
    </SurfaceCard>
  );
}
