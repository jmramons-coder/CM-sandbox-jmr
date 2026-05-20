import { AlertTriangle, Check, Circle, ClipboardList, Clock, Database, FileText, Link2, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { CaseDocument, CaseRequirement, RequirementContextType, RequirementHistoryDot, Task } from '../types';
import type { UnderwritingScoring } from '../domain/objectRefs';
import { CollapsibleDetailSection } from './CollapsibleDetailSection';
import { isRequirementAiSourced, MiniAiSourceBadge } from './ModuleCellHelpers';
import { getRequirementStatusLozengeType } from '../utils/status-display';
import { LozengeTag } from './LozengeTag';
import { ScoringMiniWidget } from './ScoringMiniWidget';

function statusLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function sourceLabel(source: string) {
  return source.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatStage(stage?: string) {
  return stage ? sourceLabel(stage) : 'Not assigned';
}

function isFulfilledStatus(status: CaseRequirement['status']) {
  return status === 'Fulfilled' || status === 'Waived' || status === 'Completed' || status === 'fulfilled';
}

function isOverdueStatus(status: CaseRequirement['status']) {
  return status === 'Overdue' || status === 'overdue';
}

function dotClass(dot: RequirementHistoryDot) {
  if (dot === 'green') return 'bg-brand-green';
  if (dot === 'amber') return 'bg-[#f5a200]';
  return 'bg-brand-blue';
}

function blockingClass(severity?: string) {
  if (severity === 'high') return 'border-l-[#f5a200] bg-[#fff4e6] text-[#633806]';
  if (severity === 'medium') return 'border-l-brand-blue bg-surface-selected text-brand-blue';
  return 'border-l-border-default bg-surface-muted text-text-secondary';
}

function contextIcon(type?: RequirementContextType) {
  if (type === 'person') return UserRound;
  if (type === 'policy') return FileText;
  if (type === 'application') return ClipboardList;
  return Database;
}

function actionLabels(status: CaseRequirement['status']) {
  switch (status) {
    case 'Overdue':
    case 'overdue':
      return { primary: 'Send chase request', secondary: ['Upload document', 'Extend due date'] };
    case 'In Queue':
    case 'not_started':
      return { primary: 'Initiate requirement', secondary: ['Upload document'] };
    case 'Ordered':
    case 'scheduled':
      return { primary: 'Mark fulfilled', secondary: ['Reschedule', 'Cancel appointment'] };
    case 'Pending':
    case 'pending':
      return { primary: 'Mark as received', secondary: ['Upload document'] };
    case 'in_review':
      return { primary: 'Clear & mark fulfilled', secondary: ['Send to approver', 'Flag discrepancy'] };
    case 'Fulfilled':
    case 'Waived':
    case 'Completed':
    case 'fulfilled':
      return { primary: 'View full record', secondary: ['Re-open requirement'] };
    default:
      return { primary: 'Review requirement', secondary: ['Upload document'] };
  }
}

function AiSummaryBanner({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-border-soft bg-white px-4 py-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">Summary</span>
      </div>
      <p className="text-[12px] leading-relaxed text-text-primary">{text}</p>
    </div>
  );
}

export function RequirementContextBody({
  caseId,
  documents = [],
  onOpenDocument,
  onOpenScoring,
  onOpenTask,
  requirement,
  scoring,
  tasks = [],
}: {
  caseId: string;
  documents?: CaseDocument[];
  onOpenScoring?: () => void;
  onOpenDocument?: (document: CaseDocument) => void;
  onOpenTask?: (task: Task) => void;
  requirement: CaseRequirement;
  scoring?: UnderwritingScoring;
  tasks?: Task[];
}) {
  const fulfilled = isFulfilledStatus(requirement.status);
  const overdue = isOverdueStatus(requirement.status);
  const actions = actionLabels(requirement.status);
  const ContextIcon = contextIcon(requirement.context?.type);
  const history = [...(requirement.history ?? [])].sort((a, b) => b.date.localeCompare(a.date));
  const criteria = requirement.fulfillmentCriteria ?? [];
  const requirementId = String(requirement.datasetRequirementId ?? requirement.id);

  return (
    <>
      <div className="shrink-0 border-b border-border-default bg-white px-6 py-4">
        <div className="mb-2 flex w-full min-w-0 items-center gap-2">
          {isRequirementAiSourced(requirement.source) ? <MiniAiSourceBadge /> : null}
          <LozengeTag label={requirement.category} type="Neutral" subtle />
          <LozengeTag label={statusLabel(requirement.status)} type={getRequirementStatusLozengeType(requirement.status, 'panel')} subtle />
          <span className="ml-auto shrink-0 font-mono text-[12px] font-semibold text-text-muted/70">{requirementId}</span>
        </div>
        <h2 className="text-[18px] font-semibold leading-tight text-text-heading">{requirement.name}</h2>
        <dl className="mt-4 grid overflow-hidden rounded-lg border border-border-soft bg-[#fbfcfd] text-[12px] sm:grid-cols-4">
          <MetaItem
            icon={<ClipboardList className="size-3" />}
            label="Stage"
            value={(
              <span className="block min-w-0">
                <span className="block truncate">{formatStage(requirement.stage)}</span>
                <span className="mt-0.5 block truncate text-[11px] font-medium text-text-secondary">
                  Case{' '}
                  <Link
                    to={`/cases/${caseId}#tab=requirements`}
                    data-keep-sidepanel="link"
                    className="font-semibold text-brand-blue underline underline-offset-2 hover:text-brand-blue-hover"
                  >
                    {caseId}
                  </Link>
                </span>
              </span>
            )}
          />
          <MetaItem icon={<Clock className="size-3" />} label="Due date" value={requirement.dueDate} urgent={overdue} />
          <MetaItem icon={<UserRound className="size-3" />} label="Responsible" value={requirement.responsibleParty ?? 'Not assigned'} />
          <MetaItem icon={<Database className="size-3" />} label="Source" value={sourceLabel(requirement.source)} />
        </dl>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-surface-primary">
        <div className="app-scrollbar h-full overflow-y-auto px-5 py-4">
          <CollapsibleDetailSection title="Summary" defaultOpen>
            {requirement.blockingImpact ? (
              <div className={`mb-3 rounded-md border border-border-soft border-l-4 px-3 py-2 text-[12px] leading-relaxed ${blockingClass(requirement.blockingImpact.severity)}`}>
                <div className="flex items-start gap-2 font-semibold">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  <span>Blocking: {formatStage(requirement.blockingImpact.stage)}</span>
                </div>
                <p className="mt-1">{requirement.blockingImpact.impact}</p>
              </div>
            ) : null}
            <AiSummaryBanner text={requirement.aiSummary ?? requirement.notes ?? 'Review this requirement and its linked evidence before progressing the case.'} />
            <div className="mt-3 grid gap-2 rounded-lg border border-border-soft bg-white p-3 text-[12px] sm:grid-cols-2">
              <DetailItem label="Category" value={requirement.category} />
              <DetailItem label="Stage" value={formatStage(requirement.stage)} />
              <DetailItem label="Due date" value={requirement.dueDate} urgent={overdue} />
              <DetailItem label="Source system" value={sourceLabel(requirement.source)} />
              <DetailItem label="Responsible party" value={requirement.responsibleParty ?? 'Not assigned'} span />
              {requirement.notes ? <DetailItem label="Notes" value={requirement.notes} span /> : null}
            </div>
          </CollapsibleDetailSection>

          <ScoringMiniWidget scoring={scoring} onOpenScoring={onOpenScoring} />

          <CollapsibleDetailSection
            title="Fulfilment criteria"
            subtitle={criteria.length ? `${criteria.length} criteria` : 'No criteria recorded'}
            className="mt-3"
            headerAction={(
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${fulfilled ? 'bg-[#e5f5ea] text-brand-green' : 'bg-[#fff4e6] text-[#8a5a00]'}`}>
                {fulfilled ? 'All met' : 'Pending'}
              </span>
            )}
          >
            <div className="space-y-2">
              {(criteria.length ? criteria : ['No fulfilment criteria recorded for this requirement.']).map((criterion) => (
                <div key={criterion} className="flex gap-2 rounded-md border border-border-soft bg-surface-muted px-3 py-2 text-[12px]">
                  {fulfilled ? <Check className="mt-0.5 size-3.5 shrink-0 text-brand-green" /> : <Circle className="mt-0.5 size-3.5 shrink-0 text-text-muted" />}
                  <span className={fulfilled ? 'text-text-primary' : 'text-text-secondary'}>{criterion}</span>
                </div>
              ))}
            </div>
          </CollapsibleDetailSection>

          <CollapsibleDetailSection title="Context" subtitle={requirement.context?.label ?? 'Requirement context'} className="mt-3">
            {requirement.context ? (
              <div className="overflow-hidden rounded-lg border border-border-soft bg-white">
                <div className="flex items-center gap-2 bg-surface-muted px-3 py-2 text-[12px] font-semibold text-text-primary">
                  <ContextIcon className="size-3.5 text-brand-blue" />
                  {requirement.context.label}
                </div>
                <div className="p-3">
                  <p className="text-[12px] leading-relaxed text-text-secondary">{requirement.context.description}</p>
                  {requirement.context.kv.length ? (
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {requirement.context.kv.map((item) => (
                        <div key={`${item.label}-${item.value}`} className="rounded-md border border-border-soft bg-[#fbfcfd] px-2.5 py-2">
                          <div className="text-[10px] text-text-muted">{item.label}</div>
                          <div className="mt-0.5 text-[12px] font-semibold text-text-primary">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </CollapsibleDetailSection>

          {documents.length ? (
            <CollapsibleDetailSection title="Evidence" subtitle={`${documents.length} linked document(s)`} className="mt-3">
              <div className="space-y-2">
                {documents.map((document) => (
                  <button
                    key={document.id}
                    type="button"
                    onClick={() => onOpenDocument?.(document)}
                    className="w-full rounded-lg border border-border-soft bg-white p-3 text-left transition-colors hover:border-brand-blue/40 hover:bg-surface-hover"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[13px] font-semibold text-text-primary">
                          <FileText className="size-4 shrink-0 text-brand-blue" />
                          <span className="truncate">{document.filename ?? document.name}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-text-muted">
                          {document.fileType ?? 'Document'} · {document.fileSize} · Uploaded {document.uploaded}
                        </p>
                        <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-text-secondary">{document.aiSummary}</p>
                      </div>
                      <LozengeTag label={document.status} type={document.status === 'Validated' ? 'Success' : 'Warning'} subtle />
                    </div>
                    {document.insights?.length ? (
                      <div className="mt-3 space-y-1.5">
                        {document.insights.slice(0, 2).map((insight, index) => (
                          <div key={`${document.id}-${insight.anchor}`} className="rounded-md border border-[#f5a200]/30 bg-[#fff8e8] px-2.5 py-2 text-[11px] text-[#633806]">
                            <span className="mr-2 inline-flex size-4 items-center justify-center rounded-full bg-[#f5a200] text-[10px] font-semibold text-white">{index + 1}</span>
                            <span className="font-semibold">{insight.title}</span>
                            <span className="ml-2 text-[10px] text-text-muted">{insight.confidence} · {insight.anchor}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </button>
                ))}
              </div>
            </CollapsibleDetailSection>
          ) : null}

          {tasks.length ? (
            <CollapsibleDetailSection title="Linked tasks" subtitle={`${tasks.length} task(s)`} className="mt-3">
              <div className="space-y-2">
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => onOpenTask?.(task)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-border-soft bg-white px-3 py-2 text-left transition-colors hover:border-brand-blue/40 hover:bg-surface-hover"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={`flex size-7 shrink-0 items-center justify-center rounded-md ${task.assignedTo === 'AI Agent' ? 'bg-brand-accent-light text-brand-accent' : 'bg-surface-muted text-text-secondary'}`}>
                        <ClipboardList className="size-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-semibold text-text-primary">{task.taskType}</span>
                        <span className="block text-[11px] text-text-muted">{task.taskId ?? task.id} · {formatStage(task.stage)} · {task.status}</span>
                      </span>
                    </span>
                    <Link2 className="size-3.5 shrink-0 text-text-muted" />
                  </button>
                ))}
              </div>
            </CollapsibleDetailSection>
          ) : null}

          <CollapsibleDetailSection title="Audit trail" subtitle={history.length ? `${history.length} event(s)` : 'No events'} className="mt-3">
            <div className="space-y-3 text-[12px]">
              {(history.length ? history : [{ date: requirement.dueDate, action: 'Requirement created from dataset record', user: 'System', dot: 'blue' as const }]).map((event) => (
                <div key={`${event.date}-${event.action}`} className="flex items-start gap-3">
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${dotClass(event.dot)}`} />
                  <span>
                    <span className="block font-semibold text-text-primary">{event.action}</span>
                    <span className="block text-text-secondary">{event.date} · {event.user}</span>
                  </span>
                </div>
              ))}
            </div>
          </CollapsibleDetailSection>
        </div>
      </div>

      <div className="shrink-0 space-y-2 border-t border-border-default bg-white p-4">
        <button className="inline-flex w-full items-center justify-center rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold leading-none text-white transition-colors hover:bg-brand-blue-hover">
          {actions.primary}
        </button>
        {actions.secondary.map((label) => (
          <button key={label} className="inline-flex w-full items-center justify-center rounded-full border border-border-default px-4 py-2 text-sm font-semibold leading-none text-text-secondary transition-colors hover:bg-surface-muted">
            {label}
          </button>
        ))}
      </div>
    </>
  );
}

function MetaItem({ icon, label, urgent = false, value }: { icon: ReactNode; label: string; urgent?: boolean; value: ReactNode }) {
  return (
    <div className="min-w-0 border-b border-border-soft px-3 py-2 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <dt className="flex items-center gap-1.5 text-[11px] text-text-muted">{icon}{label}</dt>
      <dd className={`mt-0.5 min-w-0 font-semibold ${urgent ? 'text-brand-red' : 'text-text-primary'}`}>{value}</dd>
    </div>
  );
}

function DetailItem({ label, span = false, urgent = false, value }: { label: string; span?: boolean; urgent?: boolean; value: string }) {
  return (
    <div className={span ? 'sm:col-span-2' : undefined}>
      <div className="text-[10px] uppercase tracking-[0.3px] text-text-muted">{label}</div>
      <div className={`mt-0.5 font-semibold ${urgent ? 'text-brand-red' : 'text-text-primary'}`}>{value}</div>
    </div>
  );
}
