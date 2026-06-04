import { ClipboardList } from 'lucide-react';
import type { Task, TaskExecutionMode, TaskReviewPayload } from '../types';
import { resolveAiSummaryPresentation } from '../utils/aiSummaryPresentation';
import { SidePanelSummaryBox } from './AiSummaryWithConfidenceCard';
import { TaskCrewReasoningPanel } from './TaskCrewReasoningPanel';
import { TaskSuggestedRequirementsSection } from './tasks/TaskSuggestedRequirementsSection';

function TaskAlertBanner({ type, message }: { type: string; message: string }) {
  const toneClass =
    type === 'blocking' || type === 'overdue' || type === 'sla'
      ? 'border-l-brand-red bg-[#fde5e4] text-[#7a1d1a]'
      : type === 'warning'
        ? 'border-l-[#f5a200] bg-[#fff4e6] text-[#633806]'
        : 'border-l-brand-blue bg-surface-selected text-brand-blue';

  return (
    <div className={`mb-3 rounded-md border border-border-soft border-l-4 px-3 py-2 ${toneClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24px]">{type}</p>
      <p className="mt-1 text-[12px] leading-relaxed">{message}</p>
    </div>
  );
}

function RequirementCountTag({ count }: { count: number }) {
  return (
    <span className="mx-0.5 inline-flex items-center gap-1 rounded-full border border-brand-blue/20 bg-brand-blue-light px-2 py-0.5 align-middle text-[12px] font-semibold leading-none text-brand-blue">
      <ClipboardList className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
      {count} requirement{count === 1 ? '' : 's'}
    </span>
  );
}

function SemiAutoWhatWasDone({
  review,
  showExceptionAlert,
  alert,
  hideAddressChangeDetailsSections = false,
}: {
  review: TaskReviewPayload;
  showExceptionAlert: boolean;
  alert?: Task['alert'];
  hideAddressChangeDetailsSections?: boolean;
}) {
  const presentation = resolveAiSummaryPresentation(review.verdict, review.confidence);
  const proposalCount = review.suggestedRequirements?.length ?? 0;
  const addressDecision = review.addressDecision;
  const registryName = addressDecision?.registryName ?? 'National Address Registry';

  return (
    <>
      {showExceptionAlert && alert ? <TaskAlertBanner type={alert.type} message={alert.message} /> : null}
      {proposalCount > 0 ? (
        <p className="text-[13px] leading-relaxed text-text-primary">
          After reviewing the case file, the agent recommends{' '}
          <RequirementCountTag count={proposalCount} /> for req. gathering. Select which to include in{' '}
          <span className="font-semibold">AI suggested requirements</span> below, then{' '}
          <span className="font-semibold">Approve</span> this task to add them to the case.
        </p>
      ) : addressDecision && !hideAddressChangeDetailsSections ? (
        <p className="text-[13px] leading-relaxed text-text-primary">
          Verified the submitted address against the{' '}
          <span className="font-semibold">{registryName}</span>. Select which policies should receive the update and
          confirm duration in <span className="font-semibold">Policies & duration</span> below, then choose the address
          to apply in <span className="font-semibold">Address decision</span> before you{' '}
          <span className="font-semibold">Approve</span>.
        </p>
      ) : (
        <p className="text-[13px] leading-relaxed text-text-primary">{presentation.text}</p>
      )}
    </>
  );
}

function ManualTaskBody({
  review,
  alert,
}: {
  review: TaskReviewPayload;
  alert?: Task['alert'];
}) {
  const presentation = resolveAiSummaryPresentation(review.verdict, review.confidence);
  const steps = review.reasoning?.slice(0, 3) ?? [];

  return (
    <>
      {alert ? <TaskAlertBanner type={alert.type} message={alert.message} /> : null}
      <p className="text-[13px] leading-relaxed text-text-primary">{presentation.text}</p>
      {steps.length ? (
        <ul className="mt-3 space-y-1.5 text-[12px] text-text-secondary">
          {steps.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-text-muted" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

export function TaskReviewBody({
  task,
  executionMode,
  review,
  selectedRequirementIds,
  onSelectedRequirementIdsChange,
  hideAddressChangeDetailsSections = false,
}: {
  task: Task;
  executionMode: TaskExecutionMode;
  review: TaskReviewPayload;
  selectedRequirementIds?: Set<string>;
  onSelectedRequirementIdsChange?: (ids: Set<string>) => void;
  hideAddressChangeDetailsSections?: boolean;
}) {
  const semiAuto = executionMode === 'semi_auto' || executionMode === 'exception';
  const hasCrewSteps = Boolean(review.crewSteps?.length);
  const hasSuggestions = Boolean(review.suggestedRequirements?.length);

  if (!semiAuto) {
    return (
      <SidePanelSummaryBox label="What was done">
        <ManualTaskBody review={review} alert={task.alert ?? undefined} />
      </SidePanelSummaryBox>
    );
  }

  return (
    <>
      <SidePanelSummaryBox label="What was done">
        <SemiAutoWhatWasDone
          review={review}
          showExceptionAlert={executionMode === 'exception'}
          alert={task.alert ?? undefined}
          hideAddressChangeDetailsSections={hideAddressChangeDetailsSections}
        />
        {hasCrewSteps ? <TaskCrewReasoningPanel steps={review.crewSteps ?? []} /> : null}
      </SidePanelSummaryBox>

      {hasSuggestions && selectedRequirementIds && onSelectedRequirementIdsChange ? (
        <TaskSuggestedRequirementsSection
          className="mt-4"
          proposals={review.suggestedRequirements!}
          selectedIds={selectedRequirementIds}
          onSelectionChange={onSelectedRequirementIdsChange}
        />
      ) : null}
    </>
  );
}
