import { useNavigate } from 'react-router';
import { AiCueSparkle } from '../AiCueSparkle';
import type { DashboardViewModel } from '../../domain/access/roleView';

type DashboardAiBriefProps = {
  viewModel: DashboardViewModel;
};

export function DashboardAiBrief({ viewModel }: DashboardAiBriefProps) {
  const navigate = useNavigate();

  return (
    <section className="rounded-xl border border-brand-accent/20 bg-brand-accent-light/40 px-4 py-3 sm:px-5">
      <div className="mb-1.5 flex items-center gap-2">
        <AiCueSparkle size={14} className="!text-brand-accent" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.35px] text-brand-accent">
          AI daily brief
        </p>
      </div>
      <p className="text-[12px] leading-relaxed text-text-secondary">{viewModel.briefText}</p>
      <button
        type="button"
        onClick={() => navigate(viewModel.briefAction.route)}
        className="mt-2 text-[11px] font-semibold text-brand-accent transition-colors hover:text-brand-accent-hover"
      >
        {viewModel.briefAction.label}
      </button>
    </section>
  );
}
