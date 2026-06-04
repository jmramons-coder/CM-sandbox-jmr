'use client';

import { useEffect, useRef, useState } from 'react';
import { useCopilotRevealScrollFollow } from '../../hooks/useCopilotRevealScrollFollow';
import { Check } from 'lucide-react';
import type { CaseBriefArtifact, CopilotExecuteAction } from '../AiCopilotFooter';
import { LozengeTag } from '../LozengeTag';
import { TaskCrewReasoningPanel } from '../TaskCrewReasoningPanel';
import { resolveAiSummaryPresentation } from '../../utils/aiSummaryPresentation';
import { getRequirementStatusLozengeType } from '../../utils/status-display';
import { CaseWorkspaceObjectLink } from './CaseWorkspaceObjectLink';
import type { OpenCaseWorkspaceObjectHandler } from '../../utils/openCaseWorkspaceObject';
import { useCaseBriefIntroSequence } from '../../hooks/useCaseBriefIntroSequence';

function formatCaseBriefFocusText(
  fallbackLine: string,
  focusTask?: CaseBriefArtifact['focusTask'],
  focusRequirement?: CaseBriefArtifact['focusRequirement'],
): string {
  if (focusTask && focusRequirement) {
    return `Prioritize ${focusTask.label} to fulfill ${focusRequirement.name}.`;
  }
  if (focusTask) {
    return `Prioritize ${focusTask.label} to move this case forward.`;
  }
  return fallbackLine.replace(/\*\*/g, '');
}

function CaseBriefThinkingIndicator({ label }: { label: string }) {
  return (
    <p className="case-brief-thinking flex items-center gap-2 text-[13px] text-text-muted">
      <span className="case-brief-thinking__dots inline-flex gap-0.5" aria-hidden>
        <span />
        <span />
        <span />
      </span>
      <span key={label} className="case-brief-thinking__label">
        {label}
      </span>
    </p>
  );
}

function CaseBriefFocusLine({
  fallbackLine,
  focusTask,
  focusRequirement,
  className = '',
}: {
  fallbackLine: string;
  focusTask?: CaseBriefArtifact['focusTask'];
  focusRequirement?: CaseBriefArtifact['focusRequirement'];
  className?: string;
}) {
  return (
    <p className={`text-[14px] leading-relaxed text-text-secondary ${className}`.trim()}>
      {formatCaseBriefFocusText(fallbackLine, focusTask, focusRequirement)}
    </p>
  );
}

export function CaseBriefArtifactCard({
  artifact,
  onExecuteAction,
  onOpenCaseObject,
  introReplayKey = 0,
}: {
  artifact: CaseBriefArtifact;
  onExecuteAction?: (action: CopilotExecuteAction) => void;
  onOpenCaseObject?: OpenCaseWorkspaceObjectHandler;
  introReplayKey?: number;
}) {
  const task = artifact.focusTask;
  const crewSteps = task?.crewSteps ?? [];
  const verdictPresentation = task?.verdict
    ? resolveAiSummaryPresentation(task.verdict, task.confidence)
    : null;

  const showGreetingBlock = artifact.showGreeting !== false;
  const intro = useCaseBriefIntroSequence(artifact, showGreetingBlock, introReplayKey);
  const prevOutcomeRef = useRef(task?.taskOutcome);
  const [outcomeJustSet, setOutcomeJustSet] = useState(false);

  useEffect(() => {
    const prev = prevOutcomeRef.current;
    const next = task?.taskOutcome;
    if (!prev && next) {
      setOutcomeJustSet(true);
      const timer = window.setTimeout(() => setOutcomeJustSet(false), 600);
      prevOutcomeRef.current = next;
      return () => window.clearTimeout(timer);
    }
    prevOutcomeRef.current = next;
    return undefined;
  }, [task?.taskOutcome]);

  const requirementsToShow = intro.animateIntro
    ? artifact.openRequirements.slice(0, intro.visibleRequirements)
    : artifact.openRequirements;

  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  useCopilotRevealScrollFollow({
    active: intro.animateIntro || outcomeJustSet,
    followKey: `${intro.phase}:${intro.greetingLength}:${intro.visibleRequirements}:${intro.showFocusLine}:${intro.showFocusCard}:${outcomeJustSet}`,
    anchorRef: scrollAnchorRef,
  });

  return (
    <div className="mt-1 max-w-[520px] space-y-4 text-left">
      {showGreetingBlock ? (
        <div className="min-h-[1.75rem] space-y-1">
          {intro.showThinking ? (
            <CaseBriefThinkingIndicator label={intro.thinkingLabel} />
          ) : null}
          {intro.showGreeting ? (
            intro.greetingComplete ? (
              <p className="case-brief-greeting text-[15px] leading-relaxed text-text-primary animate-in fade-in duration-200">
                Hi <span className="font-semibold">{artifact.greetingName}</span>, you&apos;re on{' '}
                <span className="font-semibold">{artifact.caseId}</span>
                {artifact.clientHeadline ? (
                  <>
                    {' '}
                    · <span className="text-text-secondary">{artifact.clientHeadline}</span>
                  </>
                ) : null}
                .
              </p>
            ) : (
              <p className="text-[15px] leading-relaxed text-text-primary">
                {intro.greetingTyped}
                <span className="case-brief-caret ml-0.5 inline-block w-[2px] animate-pulse text-brand-accent">
                  |
                </span>
              </p>
            )
          ) : null}
        </div>
      ) : null}

      {intro.showRequirementsSection ? (
        artifact.openRequirements.length > 0 ? (
          <div className="case-brief-reveal-block animate-in fade-in slide-in-from-bottom-1 duration-300">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-text-muted">
              Open requirements ({artifact.openRequirements.length})
            </p>
            <ul className="space-y-1.5">
              {requirementsToShow.map((req, index) => (
                <li
                  key={req.id}
                  className="case-brief-req-item animate-in fade-in slide-in-from-bottom-1 duration-300"
                  style={
                    intro.animateIntro
                      ? { animationDelay: `${index * 40}ms`, animationFillMode: 'backwards' }
                      : undefined
                  }
                >
                  <CaseWorkspaceObjectLink
                    input={{ caseId: artifact.caseId, kind: 'requirement', objectId: req.id }}
                    href={req.href}
                    onOpen={onOpenCaseObject}
                    className="group/req -mx-2 flex w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-md px-2 py-1.5 text-[13px] transition-colors hover:bg-[#f8f9fa]"
                  >
                    <span className="min-w-0 flex-1 truncate font-medium text-text-primary underline-offset-2 group-hover/req:text-brand-blue group-hover/req:underline">
                      {req.name}
                    </span>
                    <LozengeTag
                      label={req.status}
                      type={getRequirementStatusLozengeType(req.status, 'panel')}
                      subtle
                      size="micro"
                    />
                  </CaseWorkspaceObjectLink>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="case-brief-reveal-block text-[13px] text-text-muted animate-in fade-in duration-300">
            All requirements are fulfilled or waived.
          </p>
        )
      ) : null}

      {intro.showFocusLine ? (
        <CaseBriefFocusLine
          fallbackLine={artifact.focusLine}
          focusTask={artifact.focusTask}
          focusRequirement={artifact.focusRequirement}
          className="case-brief-reveal-block animate-in fade-in slide-in-from-bottom-1 duration-300"
        />
      ) : null}

      {intro.showFocusCard && task ? (
        <div
          className={`case-brief-focus-card overflow-hidden rounded-xl border border-[#ececec] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${
            intro.animateIntro ? 'animate-in fade-in zoom-in-95 duration-500' : ''
          }`}
        >
          <div className="px-4 pt-4 pb-0">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Focus task</p>
                <CaseWorkspaceObjectLink
                  input={{ caseId: artifact.caseId, kind: 'task', objectId: task.id }}
                  href={task.href}
                  onOpen={onOpenCaseObject}
                  className="mt-0.5 block text-[15px] font-semibold text-brand-blue underline-offset-2 hover:underline"
                >
                  {task.label}
                </CaseWorkspaceObjectLink>
                {artifact.focusRequirement ? (
                  <p className="mt-1 text-[12px] leading-relaxed text-text-muted">
                    Fulfills {artifact.focusRequirement.name}
                  </p>
                ) : null}
              </div>
              {typeof task.confidence === 'number' ? (
                <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-text-secondary">
                  {Math.round(task.confidence)}%
                </span>
              ) : null}
            </div>

            {verdictPresentation ? (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">
                  What was done
                </p>
                <p className="text-[13px] leading-relaxed text-text-primary">{verdictPresentation.text}</p>
              </div>
            ) : null}

            {crewSteps.length > 0 ? (
              <TaskCrewReasoningPanel steps={crewSteps} variant="section" />
            ) : null}
          </div>

          {task.taskOutcome ? (
            <div
              className={`flex items-center gap-2 border-t border-border-soft px-4 py-3 text-[13px] ${
                task.taskOutcome === 'accepted' ? 'text-brand-green' : 'text-amber-800'
              } ${outcomeJustSet ? 'case-brief-outcome-reveal animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-400' : ''}`}
            >
              <Check className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
              <span className="font-semibold">{task.statusLabel ?? 'Accepted'}</span>
              <span className="text-text-muted">
                {task.taskOutcome === 'accepted' ? '· Task completed' : '· Follow-up recorded'}
              </span>
            </div>
          ) : task.semiAuto && onExecuteAction ? (
            <div className="relative z-10 flex flex-wrap gap-2 border-t border-border-soft px-4 py-3 pointer-events-auto">
              <button
                type="button"
                onClick={() =>
                  onExecuteAction({ kind: 'task', taskId: task.id, actionType: 'complete' })
                }
                className="rounded-lg bg-brand-green px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-brand-green/90"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() =>
                  onExecuteAction({ kind: 'task', taskId: task.id, actionType: 'request_info' })
                }
                className="rounded-lg border border-border-default bg-white px-4 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-muted"
              >
                Amend
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      <div ref={scrollAnchorRef} className="h-px w-full shrink-0" aria-hidden />
    </div>
  );
}
