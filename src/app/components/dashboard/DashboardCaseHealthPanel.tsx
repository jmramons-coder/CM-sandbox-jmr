import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { EmptyState, SurfaceCard } from '../ds';
import type { DashboardCaseHealthRow, DashboardViewModel } from '../../domain/access/roleView';
import { SLA_TEXT_CLASS } from './dashboardWidgetUtils';

function StageTrack({ stages }: { stages: DashboardCaseHealthRow['stages'] }) {
  const segments = Array.from({ length: stages.total }, (_, index) => {
    if (index < stages.done) return 'done';
    if (index === stages.done && stages.active > 0) return 'active';
    return 'pending';
  });

  return (
    <div className="mt-2 flex h-1.5 gap-[3px]">
      {segments.map((state, index) => (
        <span
          key={index}
          className={`h-full flex-1 rounded-[3px] ${
            state === 'done'
              ? 'bg-brand-green'
              : state === 'active'
                ? 'bg-brand-blue'
                : 'bg-surface-muted'
          }`}
        />
      ))}
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
      <div className="flex items-start justify-between gap-3 border-b border-border-default px-4 py-3">
        <div>
          <p className="text-[12px] font-semibold text-text-heading">{viewModel.caseHealthTitle}</p>
          <p className="mt-0.5 text-[11px] text-text-secondary">Stage progress across active cases.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/cases')}
          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-brand-blue hover:text-brand-blue-hover"
        >
          Cases <ArrowRight className="size-3" />
        </button>
      </div>

      <div className="divide-y divide-border-divider">
        {viewModel.cases.length === 0 ? (
          <EmptyState message="No cases to display." />
        ) : null}
        {viewModel.cases.map((row) => (
          <button
            key={row.key}
            type="button"
            onClick={() => navigate(`/cases/${row.id}`)}
            className="block w-full px-4 py-2.5 text-left transition-colors hover:bg-surface-muted"
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
            <StageTrack stages={row.stages} />
            <p className="mt-1.5 text-[11px] text-text-muted">
              {row.status} · {row.stages.done}/{row.stages.total} stages complete
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
            {viewModel.blocker.count} items holding {viewModel.blocker.val} in decisions
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
