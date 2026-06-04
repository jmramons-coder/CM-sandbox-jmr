'use client';

import { useEffect, useState } from 'react';
import { ChevronRight, ClipboardList, Scale } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useStaggeredReveal } from '../../hooks/useStaggeredReveal';
import type {
  CaseNextStepArtifact,
  CaseRequirementsListArtifact,
  CaseTaskQueueArtifact,
} from '../AiCopilotFooter';
import { AiCueSparkle } from '../AiCueSparkle';
import { CaseWorkspaceObjectLink } from './CaseWorkspaceObjectLink';
import { buildCaseWorkspaceObjectHref, type OpenCaseWorkspaceObjectHandler } from '../../utils/openCaseWorkspaceObject';

const cardShellBase =
  'mt-3 rounded-xl border border-border-soft bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]';
const cardTitle = 'mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#8c9199]';

function cardShellClass(introReveal?: boolean): string {
  return introReveal
    ? `${cardShellBase} copilot-artifact-card-reveal`
    : `${cardShellBase} animate-in fade-in zoom-in-[0.98] duration-200`;
}

const taskPriorityClass: Record<string, string> = {
  Urgent: 'bg-[#fde5e4] text-brand-red',
  High: 'bg-[#fff4e0] text-[#9a6700]',
  Normal: 'bg-surface-muted text-text-secondary',
};

const reqStatusClass: Record<string, string> = {
  critical: 'bg-[#fde5e4] text-brand-red',
  warning: 'bg-[#fff4e0] text-[#9a6700]',
  neutral: 'bg-[#f3eef9] text-brand-purple',
};

const taskStatusClass = 'bg-brand-blue-light text-brand-blue';

/** Subtle highlight for the suggested / next task row (lighter than brand-blue-light). */
const taskRowNextClass =
  'border-[#e3edf3] bg-[#f7fafc] hover:border-[#d4e4ee] hover:bg-[#f3f8fb]';

function PurpleRequirementIcon() {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#f3eef9]">
      <ClipboardList className="size-4 text-brand-purple" strokeWidth={2} aria-hidden />
    </span>
  );
}

type FollowUpCardProps = {
  onOpenCaseObject?: OpenCaseWorkspaceObjectHandler;
  introReveal?: boolean;
};

export function CaseTaskQueueCard({
  artifact,
  onOpenCaseObject,
  introReveal = false,
}: { artifact: CaseTaskQueueArtifact } & FollowUpCardProps) {
  const visibleItems = useStaggeredReveal(artifact.items.length, introReveal, 130, 80);
  const items = introReveal ? artifact.items.slice(0, visibleItems) : artifact.items;

  return (
    <div className={`${cardShellClass(introReveal)} p-3`}>
      <div className={cardTitle}>{artifact.title}</div>
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li
            key={item.id}
            className={introReveal ? 'copilot-artifact-row-reveal animate-in fade-in slide-in-from-bottom-1 duration-300' : ''}
            style={
              introReveal
                ? { animationDelay: `${index * 35}ms`, animationFillMode: 'backwards' }
                : undefined
            }
          >
            <CaseWorkspaceObjectLink
              input={{ caseId: artifact.caseId, kind: 'task', objectId: item.id }}
              href={item.href}
              onOpen={onOpenCaseObject}
              className={`group/task flex items-center rounded-lg border px-3 py-2.5 transition-colors ${
                item.isNext
                  ? taskRowNextClass
                  : 'border-transparent hover:border-border-soft hover:bg-[#f8f9fa]'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-text-primary group-hover/task:text-brand-blue">
                    {item.label}
                  </span>
                  {item.isNext ? (
                    <span className="rounded-full bg-brand-blue/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-blue">
                      Next
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${taskStatusClass}`}>
                    {item.status}
                  </span>
                  {item.priority ? (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${taskPriorityClass[item.priority] ?? taskPriorityClass.Normal}`}
                    >
                      {item.priority}
                    </span>
                  ) : null}
                  {item.stage ? (
                    <span className="text-[10px] capitalize text-text-muted">{item.stage.replace(/_/g, ' ')}</span>
                  ) : null}
                </div>
              </div>
              <ChevronRight
                className="size-4 shrink-0 text-[#b7bbc2] transition-transform group-hover/task:translate-x-0.5 group-hover/task:text-brand-blue"
                aria-hidden
              />
            </CaseWorkspaceObjectLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CaseRequirementsListCard({
  artifact,
  onOpenCaseObject,
  introReveal = false,
}: { artifact: CaseRequirementsListArtifact } & FollowUpCardProps) {
  const visibleItems = useStaggeredReveal(artifact.items.length, introReveal, 130, 80);
  const items = introReveal ? artifact.items.slice(0, visibleItems) : artifact.items;

  return (
    <div className={`${cardShellClass(introReveal)} p-3`}>
      <div className={cardTitle}>{artifact.title}</div>
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li
            key={item.id}
            className={introReveal ? 'copilot-artifact-row-reveal animate-in fade-in slide-in-from-bottom-1 duration-300' : ''}
            style={
              introReveal
                ? { animationDelay: `${index * 35}ms`, animationFillMode: 'backwards' }
                : undefined
            }
          >
            <CaseWorkspaceObjectLink
              input={{ caseId: artifact.caseId, kind: 'requirement', objectId: item.id }}
              href={item.href}
              onOpen={onOpenCaseObject}
              className="group/req flex items-center gap-3 rounded-lg border border-transparent px-2.5 py-2.5 transition-colors hover:border-border-soft hover:bg-[#f8f9fa]"
            >
              <PurpleRequirementIcon />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-text-primary group-hover/req:text-brand-blue">
                  {item.name}
                </span>
                <div className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-1 py-0.5 text-[9px] font-semibold leading-none ${reqStatusClass[item.tone ?? 'neutral']}`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
              <ChevronRight
                className="size-4 shrink-0 text-[#b7bbc2] transition-transform group-hover/req:translate-x-0.5 group-hover/req:text-text-secondary"
                aria-hidden
              />
            </CaseWorkspaceObjectLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MiniTaskRow({
  caseId,
  item,
  onOpenCaseObject,
}: {
  caseId: string;
  item: NonNullable<CaseNextStepArtifact['taskItem']>;
  onOpenCaseObject?: OpenCaseWorkspaceObjectHandler;
}) {
  return (
    <CaseWorkspaceObjectLink
      input={{ caseId, kind: 'task', objectId: item.id }}
      href={item.href}
      onOpen={onOpenCaseObject}
      className={`mt-3 flex items-center rounded-lg border px-3 py-2.5 transition-colors ${taskRowNextClass}`}
    >
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-text-primary">{item.label}</div>
        <span className={`mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${taskStatusClass}`}>
          {item.status}
        </span>
      </div>
      <ChevronRight className="size-4 shrink-0 text-brand-blue/70" aria-hidden />
    </CaseWorkspaceObjectLink>
  );
}

function MiniRequirementRows({
  caseId,
  items,
  onOpenCaseObject,
}: {
  caseId: string;
  items: NonNullable<CaseNextStepArtifact['requirementItems']>;
  onOpenCaseObject?: OpenCaseWorkspaceObjectHandler;
}) {
  return (
    <ul className="mt-3 space-y-1">
      {items.map((item) => (
        <li key={item.id}>
          <CaseWorkspaceObjectLink
            input={{ caseId, kind: 'requirement', objectId: item.id }}
            href={item.href}
            onOpen={onOpenCaseObject}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] transition-colors hover:bg-[#f8f9fa]"
          >
            <ClipboardList className="size-3.5 shrink-0 text-brand-purple" strokeWidth={2} aria-hidden />
            <span className="min-w-0 flex-1 truncate font-medium text-text-primary">{item.name}</span>
            <span
              className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${reqStatusClass[item.tone ?? 'neutral']}`}
            >
              {item.status}
            </span>
          </CaseWorkspaceObjectLink>
        </li>
      ))}
    </ul>
  );
}

export function CaseNextStepCard({
  artifact,
  onOpenCaseObject,
  introReveal = false,
}: { artifact: CaseNextStepArtifact } & FollowUpCardProps) {
  const navigate = useNavigate();
  const caseId = artifact.caseId;
  const [revealStep, setRevealStep] = useState(introReveal ? 0 : 3);

  useEffect(() => {
    if (!introReveal) {
      setRevealStep(3);
      return;
    }
    setRevealStep(0);
    const timers = [
      setTimeout(() => setRevealStep(1), 120),
      setTimeout(() => setRevealStep(2), 280),
      setTimeout(() => setRevealStep(3), 480),
    ];
    return () => timers.forEach(clearTimeout);
  }, [introReveal, artifact.caseId, artifact.headline]);

  const Icon = artifact.recommendation === 'decision' ? Scale : ClipboardList;

  const ctaInput =
    artifact.recommendation === 'task' && artifact.taskItem
      ? { caseId, kind: 'task' as const, objectId: artifact.taskItem.id }
      : artifact.recommendation === 'requirements' && artifact.requirementItems?.[0]
        ? { caseId, kind: 'requirement' as const, objectId: artifact.requirementItems[0].id }
        : null;

  return (
    <div className={`${cardShellClass(introReveal)} p-4`}>
      <div className="flex items-start gap-3">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
            artifact.recommendation === 'task' ? 'bg-brand-blue-light' : 'bg-[#f3eef9]'
          }`}
        >
          {artifact.recommendation === 'task' ? (
            <AiCueSparkle size={18} brandGradientFill aria-hidden />
          ) : (
            <Icon className="size-[18px] text-brand-purple" strokeWidth={2} aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-text-primary">{artifact.headline}</p>
          {revealStep >= 1 ? (
            <p className="mt-1 animate-in fade-in slide-in-from-bottom-1 text-[13px] leading-relaxed text-text-secondary duration-300">
              {artifact.detail}
            </p>
          ) : null}
        </div>
      </div>

      {revealStep >= 2 && artifact.taskItem && caseId ? (
        <MiniTaskRow caseId={caseId} item={artifact.taskItem} onOpenCaseObject={onOpenCaseObject} />
      ) : null}
      {revealStep >= 2 && artifact.requirementItems?.length && caseId ? (
        <MiniRequirementRows caseId={caseId} items={artifact.requirementItems} onOpenCaseObject={onOpenCaseObject} />
      ) : null}

      {revealStep >= 3 && ctaInput ? (
        <CaseWorkspaceObjectLink
          input={ctaInput}
          href={buildCaseWorkspaceObjectHref(ctaInput)}
          onOpen={onOpenCaseObject}
          className="copilot-artifact-cta-reveal mt-3 inline-flex animate-in fade-in slide-in-from-bottom-1 items-center gap-1.5 rounded-lg bg-brand-blue px-3.5 py-2 text-[13px] font-semibold text-white transition-colors duration-300 hover:bg-brand-blue-hover"
        >
          {artifact.ctaLabel}
          <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
        </CaseWorkspaceObjectLink>
      ) : revealStep >= 3 ? (
        <a
          href={artifact.href}
          data-keep-sidepanel
          onClick={(event) => {
            event.preventDefault();
            navigate(artifact.href);
          }}
          className="copilot-artifact-cta-reveal mt-3 inline-flex animate-in fade-in slide-in-from-bottom-1 items-center gap-1.5 rounded-lg bg-brand-blue px-3.5 py-2 text-[13px] font-semibold text-white transition-colors duration-300 hover:bg-brand-blue-hover"
        >
          {artifact.ctaLabel}
          <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
        </a>
      ) : null}
    </div>
  );
}
