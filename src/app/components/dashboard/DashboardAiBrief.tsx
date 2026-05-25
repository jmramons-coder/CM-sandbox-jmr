import type { DashboardViewModel } from '../../domain/access/roleView';
import { DailyBriefCard } from '../DailyBriefCard';
import type { DailyBriefContent } from '../../domain/dailyBrief';

type DashboardAiBriefProps = {
  viewModel: DashboardViewModel;
};

/** Home dashboard brief — uses the shared DailyBriefCard. */
export function DashboardAiBrief({ viewModel }: DashboardAiBriefProps) {
  const content: DailyBriefContent = {
    contextId: 'home',
    title: 'Daily brief',
    segments: viewModel.briefSegments,
    text: viewModel.briefText,
    source: viewModel.briefSegments.length > 0 ? 'dynamic' : 'fallback',
  };

  return <DailyBriefCard content={content} />;
}
