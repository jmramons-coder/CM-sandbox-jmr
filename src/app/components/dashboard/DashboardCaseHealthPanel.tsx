import { Activity, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { EmptyState, SurfaceCard } from '../ds';
import type { DashboardCaseHealthRow, DashboardViewModel } from '../../domain/access/roleView';
import { AnimatedDisplayValue, useMountProgress } from './dashboardMotion';
import { DASHBOARD_LIST_ROW_HOVER, SLA_TEXT_CLASS } from './dashboardWidgetUtils';

function StageTrack({
  stages,
  rowIndex,
}: {
  stages: DashboardCaseHealthRow['stages'];
  rowIndex: number;
}) {
  const segments = Array.from({ length: stages.total }, (_, index) => {
    if (index < stages.done) return 'done';
    if (index === stages.done && stages.active > 0) return 'active';
    return 'pending';
  });
  const rowProgress = useMountProgress(480, rowIndex * 90);

  return (
    <div className="mt-2 flex h-1.5 gap-[3px]">
      {segments.map((state, index) => {
        if (state === 'pending') {
          return (
            <span key={index} className="h-full flex-1 rounded-[3px] bg-border-default" />
          );
        }

        const fillClass = state === 'done' ? 'bg-brand-green' : 'bg-brand-blue';
        const segmentProgress = Math.min(1, Math.max(0, rowProgress * segments.length - index));

        return (
          <span key={index} className="h-full flex-1 overflow-hidden rounded-[3px] bg-border-default">
            <span
              className={`block h-full w-full origin-left ${fillClass}`}
              style={{ transform: `scaleX(${segmentProgress})` }}
            />
          </span>
        );
      })}
    </div>
  );
}

type DashboardCaseHealthPanelProps = {
  viewModel: DashboardViewModel;
};

export function DashboardCaseHealthPanel({ viewModel }: DashboardCaseHealthPanelProps) {
  const navigate = useNavigate();
  const primaryCaseId =
    viewModel.cases.find((row) => row.key === viewModel.blocker.primaryCaseKey)?.id ?? viewModel.cases[0]?.id;

  return (
    <SurfaceCard className="overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="flex items-start gap-2">
          <Activity className="size-4 shrink-0 text-text-heading" />
          <div>
            <p className="text-[12px] font-semibold text-text-heading">{viewModel.caseHealthTitle}</p>
            <p className="mt-0.5 text-[11px] text-text-secondary">Stage progress across active cases.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/cases')}
          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-brand-blue hover:text-brand-blue-hover"
        >
          All cases <ArrowRight className="size-3" />
        </button>
      </div>

      <div className="flex flex-col gap-1 px-4 pb-3">
        {viewModel.cases.length === 0 ? (
          <EmptyState message="No cases to display." />
        ) : null}
        {viewModel.cases.map((row, rowIndex) => (
          <button
            key={row.key}
            type="button"
            onClick={() => navigate(`/cases/${row.id}`)}
            className={`block w-full px-3 py-2.5 text-left ${DASHBOARD_LIST_ROW_HOVER}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12px] font-semibold text-text-primary">{row.name}</span>
                  <span className="text-[11px] text-text-muted">{row.id}</span>
                </div>
                {viewModel.showAssigneeOnCases ? (
                  <p className="mt-0.5 text-[10px] text-text-muted">{row.assignee}</p>
                ) : null}
              </div>
              <span className={`shrink-0 text-[10px] font-semibold ${SLA_TEXT_CLASS[row.slaCls] ?? 'text-text-secondary'}`}>
                {row.sla}
              </span>
            </div>
            <StageTrack stages={row.stages} rowIndex={rowIndex} />
            <p className="mt-1.5 text-[11px] text-text-muted">
              {row.status} ·{' '}
              <AnimatedDisplayValue
                value={String(row.stages.done)}
                className="inline"
              />
              /{row.stages.total} stages complete
            </p>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 border-t border-brand-red/30 bg-[#fde5e4] px-4 py-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-red text-white">
          <AlertTriangle className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-[#7a1d1a]">
            <AnimatedDisplayValue value={String(viewModel.blocker.count)} className="inline" /> items holding{' '}
            {viewModel.blocker.val} in decisions
          </p>
          <p className="mt-0.5 truncate text-[11px] text-[#7a1d1a]/80">{viewModel.blocker.items}</p>
        </div>
        <button
          type="button"
          onClick={() => primaryCaseId && navigate(`/cases/${primaryCaseId}`)}
          className="shrink-0 text-[11px] font-semibold text-[#7a1d1a] hover:underline"
        >
          Review →
        </button>
      </div>
    </SurfaceCard>
  );
}
