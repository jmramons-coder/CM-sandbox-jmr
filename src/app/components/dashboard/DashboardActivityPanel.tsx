import { useState } from 'react';
import { History } from 'lucide-react';
import { useNavigate } from 'react-router';
import { EmptyState, SurfaceCard } from '../ds';
import { classifyActivityDot, type DashboardViewModel } from '../../domain/access/roleView';
import { ACTIVITY_DOT_CLASS } from './dashboardWidgetUtils';

type ActivityPeriod = 'day' | 'week';

type DashboardActivityPanelProps = {
  viewModel: DashboardViewModel;
};

export function DashboardActivityPanel({ viewModel }: DashboardActivityPanelProps) {
  const navigate = useNavigate();
  const [activityPeriod, setActivityPeriod] = useState<ActivityPeriod>('week');

  const visibleActivity =
    activityPeriod === 'day' ? viewModel.activity24h : viewModel.activityWeek;

  return (
    <SurfaceCard className="flex flex-col px-4 py-3">
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="flex items-center gap-2">
          <History className="size-4 text-text-heading" />
          <p className="text-[12px] font-semibold text-text-heading">{viewModel.activityPanelTitle}</p>
        </div>
        <div className="flex overflow-hidden rounded-full border border-border-default bg-white p-0.5">
          {[
            { id: 'day' as const, label: 'Last 24h' },
            { id: 'week' as const, label: 'Last week' },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setActivityPeriod(option.id)}
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                activityPeriod === option.id
                  ? 'bg-brand-blue text-white'
                  : 'text-text-secondary hover:bg-surface-muted'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[280px] min-h-0 overflow-y-auto">
        <div className="divide-y divide-border-divider">
          {visibleActivity.length === 0 ? (
            <EmptyState
              message={
                activityPeriod === 'day'
                  ? 'No activity yet today.'
                  : 'No activity in the last week.'
              }
            />
          ) : null}
          {visibleActivity.map((item, index) => {
            const dotClass = ACTIVITY_DOT_CLASS[classifyActivityDot(item.actor)];
            return (
              <button
                key={`${item.ts}-${item.case}-${index}`}
                type="button"
                onClick={() => item.case && item.case !== '-' && navigate(`/cases/${item.case}`)}
                disabled={!item.case || item.case === '-'}
                className="flex w-full gap-2 py-2.5 text-left transition-colors hover:bg-surface-muted disabled:cursor-default disabled:hover:bg-transparent"
              >
                <span className={`mt-[5px] size-[7px] shrink-0 rounded-full ${dotClass}`} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] leading-snug text-text-primary">{item.action}</span>
                  <span className="mt-0.5 block text-[10px] text-text-muted">
                    {item.ts} · {item.actor}
                    {' · '}
                    <span className="text-brand-blue">{item.case}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </SurfaceCard>
  );
}
