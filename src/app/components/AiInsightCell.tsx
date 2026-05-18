import { stripSummaryTitleDecorators } from '../utils/summaryText';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { MiniAiSourceBadge } from './ModuleCellHelpers';

const AI_ACTION_LABELS: Record<string, string> = {
  Approve: 'Approve now',
  Close: 'Close case',
  Monitor: 'Monitor',
  Pending: 'Await info',
};

function getActionLabel(value: string) {
  return AI_ACTION_LABELS[value] ?? value;
}

function getActionLozengeClasses(_value: string) {
  return 'border-brand-accent/30 bg-brand-accent-light text-brand-accent';
}

export type AiInsightCellProps = {
  summary?: string;
  action?: string;
};

export function AiInsightCell({ summary, action }: AiInsightCellProps) {
  if (!summary && !action) return null;

  const displaySummary = summary ? stripSummaryTitleDecorators(summary) : undefined;

  return (
    <Tooltip disableHoverableContent>
      <TooltipTrigger asChild>
        <div className="w-[260px] truncate text-sm leading-snug text-text-secondary">
          {displaySummary}
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        sideOffset={6}
        className="pointer-events-none max-w-[320px] rounded-lg border border-brand-accent/20 bg-brand-accent-light px-3 py-2.5 text-sm leading-relaxed text-brand-accent shadow-sm"
        arrowClassName="bg-brand-accent-light fill-brand-accent-light border-brand-accent/20"
      >
        {displaySummary}
      </TooltipContent>
    </Tooltip>
  );
}

export function AiInsightInline({ summary, action }: { summary?: string; action?: string }) {
  if (!summary && !action) return null;

  const displaySummary = summary ? stripSummaryTitleDecorators(summary) : undefined;

  return (
    <div className="flex max-w-[320px] flex-col gap-1.5">
      {displaySummary && (
        <div className="flex items-start gap-1.5 text-sm text-text-secondary">
          <MiniAiSourceBadge />
          <span className="line-clamp-2 whitespace-normal break-words leading-snug">{displaySummary}</span>
        </div>
      )}
      {action && (
        <span
          className={`inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${getActionLozengeClasses(action)}`}
        >
          {getActionLabel(action)}
        </span>
      )}
    </div>
  );
}
