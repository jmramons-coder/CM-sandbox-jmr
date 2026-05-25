import { ArrowRight, ListTodo } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { PriorityChip, SurfaceCard } from '../ds';
import type { DashboardViewModel } from '../../domain/access/roleView';
import { DASHBOARD_TASK_CASE_LINK_CLASS } from '../../utils/dashboard-task-widget';
import { DashboardEvidencePreviewButton } from './DashboardEvidencePreviewButton';

type DashboardFocusCardProps = {
  viewModel: DashboardViewModel;
};

export function DashboardFocusCard({ viewModel }: DashboardFocusCardProps) {
  const navigate = useNavigate();
  const { focus } = viewModel;

  return (
    <SurfaceCard className="overflow-visible">
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <ListTodo className="size-4 text-text-heading" />
          <p className="text-[12px] font-semibold text-text-heading">{viewModel.focusTitle}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/tasks')}
          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-brand-blue hover:text-brand-blue-hover"
        >
          All tasks <ArrowRight className="size-3" />
        </button>
      </div>

      <div className="min-w-0 px-3 py-2">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <PriorityChip priority={focus.priority} />
              {focus.conf ? (
                <span className="rounded-full bg-[#e5f5ea] px-2 py-0.5 text-[10px] font-semibold text-brand-green">
                  {focus.conf}
                </span>
              ) : null}
            </div>
            <p className="break-words text-[13px] font-semibold text-text-primary">{focus.title}</p>
            {focus.caseId ? (
              <p className="mt-1 min-w-0">
                <Link
                  to={`/cases/${focus.caseId}`}
                  className={`${DASHBOARD_TASK_CASE_LINK_CLASS} block truncate`}
                >
                  {focus.claimantName || focus.link.split(' · ')[0]} · {focus.caseId}
                </Link>
              </p>
            ) : null}
          </div>
          {focus.metric?.show ? (
            <div className="flex shrink-0 items-baseline gap-2 border-t border-border-divider pt-2 sm:flex-col sm:items-end sm:border-0 sm:pt-0 sm:text-right">
              <p className="text-[13px] font-semibold text-text-primary">{focus.metric.value}</p>
              <p className="text-[10px] text-text-muted">{focus.metric.label}</p>
            </div>
          ) : null}
        </div>

        <div className="mt-2 min-w-0 border-t border-border-divider pt-2">
          <p className="line-clamp-3 break-words text-[12px] leading-relaxed text-text-secondary">
            {focus.reason}
          </p>
          <div className="mt-2 flex min-w-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate(focus.primaryRoute)}
              className="inline-flex max-w-full items-center rounded-full border border-border-default bg-white px-2.5 py-1 text-[11px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
            >
              {focus.ctaLabel}
            </button>
            {focus.evidenceRoute && focus.evidenceLabel ? (
              <DashboardEvidencePreviewButton
                label={focus.evidenceLabel}
                route={focus.evidenceRoute}
                previewUrl={focus.evidencePreviewUrl}
                previewTitle={focus.evidencePreviewTitle}
                onNavigate={navigate}
              />
            ) : null}
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
