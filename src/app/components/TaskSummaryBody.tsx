import type { Task, TaskContextCard } from '../types';
import { resolveAiSummaryPresentation } from '../utils/aiSummaryPresentation';
import { isSimpleServiceTask } from '../utils/taskSimpleService';
import { SidePanelSummaryBox } from './AiSummaryWithConfidenceCard';

export { isSimpleServiceTask } from '../utils/taskSimpleService';

function SimpleServiceContextCard({ card }: { card: TaskContextCard }) {
  return (
    <div className="mt-3 rounded-[6px] border border-border-soft bg-[#fbfcfd] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">
        {card.contextLabel ?? 'Contextual content'}
      </p>
      {card.title ? <p className="mt-1 text-[13px] font-semibold text-text-primary">{card.title}</p> : null}
      {card.description ? (
        <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">{card.description}</p>
      ) : null}
      {card.listItems?.length ? (
        <ul className="mt-3 space-y-2">
          {card.listItems.map((item) => (
            <li key={item.title} className="rounded-md border border-border-soft bg-white px-3 py-2">
              <p className="text-[12px] font-semibold text-text-primary">{item.title}</p>
              {item.detail ? <p className="mt-0.5 text-[11px] text-text-secondary">{item.detail}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {card.kv?.length ? (
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          {card.kv.map((row) => (
            <div key={row.label} className="rounded-md border border-border-soft bg-white px-2.5 py-2">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.2px] text-text-muted">{row.label}</dt>
              <dd className="mt-0.5 text-[12px] font-medium text-text-primary">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

function SuggestedNextSteps({ items }: { items: string[] }) {
  return (
    <div className="mt-3 rounded-[6px] border border-border-soft bg-[#fbfcfd] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">Suggested next steps</p>
      <ul className="mt-3 space-y-1.5 text-[12px] text-text-secondary">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-text-muted" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DefaultTaskContext({
  task,
  isInterview,
  suppressIntro = false,
}: {
  task: Task;
  isInterview: boolean;
  suppressIntro?: boolean;
}) {
  const steps =
    task.summary?.checklist ?? task.panelContext?.suggestions ??
    (isInterview
      ? ['Confirm selected meeting time', 'Review agenda and RTW guardrails', 'Send confirmation to claimant']
      : ['Review case context', 'Take the next action', 'Document the outcome']);

  return (
    <>
      {!suppressIntro && !task.aiNarrative?.text ? (
        <p className="text-[12px] leading-relaxed text-text-secondary">
          {task.summary?.description ?? task.panelContext?.contextSummary ??
            (isInterview
              ? 'The restoration plan is approved, but the case cannot move cleanly into follow-up until the claimant meeting time is validated and the appointment trail is closed.'
              : 'This task was created because the case has a pending control point that needs human validation before the workflow can move forward.')}
        </p>
      ) : null}
      <div className={`rounded-[6px] border border-border-soft bg-[#fbfcfd] p-3 ${task.aiNarrative?.text ? 'mt-3' : 'mt-3'}`}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">{task.summary?.contextLabel ?? 'Task context'}</p>
        <p className="mt-1 text-[13px] font-semibold text-text-primary">
          {task.summary?.title ?? task.panelContext?.contextTitle ?? (isInterview ? 'Meeting validation' : 'Case control requirement')}
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
          {task.summary?.description ?? (isInterview
            ? 'Confirm the selected slot, meeting agenda, and reminder flow before closing the scheduling task.'
            : 'Validate the linked requirement or evidence gap before marking the task complete.')}
        </p>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">Suggested next steps</p>
        <ul className="mt-3 space-y-1.5 text-[12px] text-text-secondary">
          {steps.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-text-muted" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export function TaskSummaryBody({ task, isInterview }: { task: Task; isInterview: boolean }) {
  const simpleService = isSimpleServiceTask(task);
  const aiText = task.aiNarrative?.text ?? (simpleService ? undefined : task.aiSummary);
  const resolvedAi = aiText
    ? resolveAiSummaryPresentation(aiText, task.aiNarrative?.confidence ?? task.aiConfidence)
    : null;
  const steps =
    task.summary?.checklist ?? task.panelContext?.suggestions ??
    (isInterview
      ? ['Confirm selected meeting time', 'Review agenda and RTW guardrails', 'Send confirmation to claimant']
      : ['Review case context', 'Take the next action', 'Document the outcome']);

  return (
    <SidePanelSummaryBox>
      {task.alert ? (
        <div className={`mb-3 rounded-md border border-border-soft border-l-4 px-3 py-2 ${taskAlertClass(task.alert.type)}`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24px]">{task.alert.type}</p>
          <p className="mt-1 text-[12px] leading-relaxed">{task.alert.message}</p>
        </div>
      ) : null}

      {resolvedAi?.text ? (
        <p className="text-[12px] leading-relaxed text-text-primary">{resolvedAi.text}</p>
      ) : null}

      {simpleService ? (
        <div className={resolvedAi?.text ? 'mt-3' : ''}>
          {task.contextCards?.map((card) => (
            <SimpleServiceContextCard key={`${card.title}-${card.type}`} card={card} />
          ))}
          <SuggestedNextSteps items={steps} />
        </div>
      ) : (
        <div className={resolvedAi?.text ? 'mt-3' : ''}>
          <DefaultTaskContext task={task} isInterview={isInterview} suppressIntro={Boolean(resolvedAi?.text)} />
        </div>
      )}
    </SidePanelSummaryBox>
  );
}

function taskAlertClass(type: string) {
  if (type === 'blocking' || type === 'overdue') return 'border-l-brand-red bg-[#fde5e4] text-[#7a1d1a]';
  if (type === 'warning') return 'border-l-[#f5a200] bg-[#fff4e6] text-[#633806]';
  return 'border-l-brand-blue bg-surface-selected text-brand-blue';
}
