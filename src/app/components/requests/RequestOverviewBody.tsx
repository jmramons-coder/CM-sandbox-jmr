import { Check, Globe, Inbox, Mail, Phone, type LucideIcon } from 'lucide-react';
import { useMemo } from 'react';
import type { CaseRequirement, RequestSourceChannel, ServiceRequest, Task } from '../../types';
import { SidePanelSummaryBox } from '../AiSummaryWithConfidenceCard';

type AuditStep = {
  id: string;
  title: string;
  detail?: string;
  meta?: string;
  href?: string;
  linkLabel?: string;
};

const SOURCE_CHANNEL_ICONS: Record<RequestSourceChannel, { label: string; icon: LucideIcon }> = {
  client_portal: { label: 'Client portal', icon: Globe },
  email: { label: 'Email', icon: Mail },
  phone: { label: 'Phone', icon: Phone },
  'Claimant portal': { label: 'Claimant portal', icon: Globe },
  'Broker portal': { label: 'Broker portal', icon: Globe },
  'SBLI broker portal': { label: 'SBLI broker portal', icon: Globe },
  'SBLI.com': { label: 'SBLI.com', icon: Globe },
  'harborlife.com': { label: 'harborlife.com', icon: Globe },
  Mail: { label: 'Mail', icon: Mail },
  Fax: { label: 'Fax', icon: Inbox },
  'Agent portal': { label: 'Agent portal', icon: Globe },
};

export function resolveRequestSourceChannelMeta(request: Pick<ServiceRequest, 'sourceChannel' | 'channel' | 'source'>) {
  const known = SOURCE_CHANNEL_ICONS[request.sourceChannel];
  if (known) return known;
  const label = request.channel ?? request.source ?? 'Unknown source';
  return { label, icon: Globe };
}

function buildAuditSteps(request: ServiceRequest): AuditStep[] {
  if (request.systemSteps?.length) {
    return request.systemSteps.map((step) => ({
      id: step.id,
      title: step.title,
      detail: step.description,
      href: step.linkedTo?.href,
      linkLabel: step.linkedTo?.label,
    }));
  }
  return (request.aiActions ?? []).map((action, index) => ({
    id: `${action.ts}-${index}`,
    title: action.action,
    detail: action.detail,
    meta: `${action.ts} · ${action.actor}`,
  }));
}

function buildGeneratedOutcomes(
  request: ServiceRequest,
  linkedTasks: Task[],
  linkedRequirements: CaseRequirement[],
): Array<{ label: string; value: string; href?: string }> {
  const caseId = request.linkedCase?.id ?? request.caseId;
  const taskCount = linkedTasks.length || request.linkedTasks?.length || 0;
  const reqCount = linkedRequirements.length || request.linkedReqs?.length || 0;
  const primaryTask = linkedTasks[0];
  const primaryTaskHref = primaryTask
    ? request.caseId
      ? `/cases/${request.caseId}#task=${encodeURIComponent(primaryTask.taskId ?? primaryTask.id)}`
      : `/tasks#task=${encodeURIComponent(primaryTask.taskId ?? primaryTask.id)}`
    : undefined;

  return [
    {
      label: 'Case',
      value: caseId ?? 'None opened',
      href: caseId ? `/cases/${caseId}` : undefined,
    },
    {
      label: 'Tasks',
      value: taskCount === 0 ? 'None' : taskCount === 1 ? (primaryTask?.taskType ?? '1 created') : `${taskCount} created`,
      href: primaryTaskHref,
    },
    {
      label: 'Requirements',
      value: reqCount === 0 ? 'None' : `${reqCount} generated`,
      href:
        reqCount > 0 && request.caseId
          ? `/cases/${request.caseId}#tab=requirements`
          : undefined,
    },
  ];
}

function RequestIntakeAuditList({
  onNavigate,
  steps,
}: {
  onNavigate: (path: string) => void;
  steps: AuditStep[];
}) {
  if (!steps.length) {
    return <p className="text-[12px] text-text-muted">No automated processing steps recorded.</p>;
  }

  return (
    <ol className="space-y-3">
      {steps.map((step) => (
        <li key={step.id} className="flex gap-2">
          <Check className="mt-0.5 size-3.5 shrink-0 text-brand-green" strokeWidth={2.5} aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold leading-snug text-text-primary">{step.title}</p>
            {step.meta ? <p className="mt-0.5 text-[10px] text-text-muted">{step.meta}</p> : null}
            {step.detail ? (
              <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-text-secondary">{step.detail}</p>
            ) : null}
            {step.href && step.linkLabel ? (
              <button
                type="button"
                data-keep-sidepanel="link"
                onClick={() => onNavigate(step.href!)}
                className="mt-1.5 text-[11px] font-semibold text-brand-blue underline underline-offset-2"
              >
                {step.linkLabel}
              </button>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function RequestOverviewBody({
  linkedRequirements,
  linkedTasks,
  onNavigate,
  request,
}: {
  request: ServiceRequest;
  linkedTasks: Task[];
  linkedRequirements: CaseRequirement[];
  onNavigate: (path: string) => void;
}) {
  const summary = request.summary ?? request.aiSummary;
  const auditSteps = useMemo(() => buildAuditSteps(request).slice(0, 4), [request]);
  const hasMoreAuditSteps = (request.systemSteps?.length ?? request.aiActions?.length ?? 0) > auditSteps.length;
  const outcomes = useMemo(
    () => buildGeneratedOutcomes(request, linkedTasks, linkedRequirements),
    [linkedRequirements.length, linkedTasks, request],
  );

  return (
    <div className="space-y-3">
      <SidePanelSummaryBox label="Intake summary">
        <p className="text-[13px] leading-relaxed text-text-primary">{summary}</p>
        {request.nextAction ? (
          <p className="mt-2 text-[11px] font-medium text-text-muted">
            Next: <span className="text-text-secondary">{request.nextAction}</span>
          </p>
        ) : null}
      </SidePanelSummaryBox>

      <SidePanelSummaryBox label="Generated">
        <ul className="space-y-2">
          {outcomes.map((row) => (
            <li key={row.label} className="flex items-start justify-between gap-3 text-[12px]">
              <span className="shrink-0 font-medium text-text-muted">{row.label}</span>
              {row.href ? (
                <button
                  type="button"
                  data-keep-sidepanel="link"
                  onClick={() => onNavigate(row.href!)}
                  className="min-w-0 truncate text-right font-semibold text-brand-blue underline-offset-2 hover:underline"
                >
                  {row.value}
                </button>
              ) : (
                <span className="min-w-0 truncate text-right font-semibold text-text-primary">{row.value}</span>
              )}
            </li>
          ))}
        </ul>
      </SidePanelSummaryBox>

      <SidePanelSummaryBox label="What ran on intake">
        <RequestIntakeAuditList onNavigate={onNavigate} steps={auditSteps} />
        {hasMoreAuditSteps ? (
          <p className="mt-3 text-[11px] text-text-muted">Full AI and human actions are on the Activity log tab.</p>
        ) : null}
      </SidePanelSummaryBox>
    </div>
  );
}
