'use client';

import type { ComponentType } from 'react';
import { AiCueSparkle } from '../AiCueSparkle';
import type { LiveContext } from '../../contexts/LiveContextProvider';

type CopilotPanelTab = 'summary' | 'insights' | 'factors' | 'workspace';
import { GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT } from '../../constants/copilot-prompts';

export type CopilotContextHints = {
  variant: 'default' | 'caseWorkspace' | 'taskReview' | 'requirementReview';
  caseId?: string;
  caseLabel?: string;
  taskId?: string;
  taskLabel?: string;
  taskVerdict?: string;
  taskConfidence?: number;
  requirementId?: string;
  requirementName?: string;
  requirementStatus?: string;
};

export type CopilotExecuteAction =
  | {
      kind: 'task';
      taskId: string;
      actionType: 'complete' | 'request_info';
    }
  | {
      kind: 'apply_requirement_suggestions';
      caseId: string;
      taskId: string;
      requirementIds: string[];
    };

export type CopilotEmptySuggestion = {
  id: string;
  label: string;
  prompt: string;
  tone?: 'primary' | 'secondary' | 'neutral';
  execute?: CopilotExecuteAction;
};

export type CopilotEmptyContent = {
  title: string;
  subtitle: string;
  suggestions: CopilotEmptySuggestion[];
  eyebrow?: string;
};

type QuickActionIcon = ComponentType<{ className?: string; strokeWidth?: number | string }>;

function truncate(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function taskReviewPrompts(taskLabel: string, caseId: string) {
  const subject = taskLabel ? `“${taskLabel}”` : 'this task';
  return {
    approve: `Approve ${subject} on case ${caseId} based on the AI recommendation.`,
    amend: `I want to amend ${subject} on case ${caseId}. What should I change before approving?`,
    reasoning: `Walk me through the AI crew reasoning for ${subject} on case ${caseId}.`,
  };
}

export function resolveCopilotComposerPlaceholder(
  tab: CopilotPanelTab,
  hints?: CopilotContextHints,
): string {
  if (hints?.variant === 'taskReview') {
    return 'Type approve or amend, or ask about the reasoning…';
  }
  if (tab === 'workspace') return 'Ask a question or pick a suggestion below';
  return 'Message Amplify Assistant…';
}

export function resolveCopilotEmptyContent(
  tab: CopilotPanelTab,
  options?: { liveContext?: LiveContext; hints?: CopilotContextHints },
): CopilotEmptyContent {
  const hints = options?.hints;
  const ctx = options?.liveContext;

  if (hints?.variant === 'taskReview' && hints.caseId && hints.taskId) {
    const prompts = taskReviewPrompts(hints.taskLabel ?? hints.taskId, hints.caseId);
    const verdictLine = hints.taskVerdict
      ? truncate(hints.taskVerdict, 160)
      : 'The AI has finished its work and is waiting for your decision.';
    const confidence =
      typeof hints.taskConfidence === 'number'
        ? ` · ${Math.round(hints.taskConfidence * 100)}% confidence`
        : '';

    return {
      eyebrow: `Case ${hints.caseId}`,
      title: hints.taskLabel ? `Review: ${hints.taskLabel}` : 'Review this task',
      subtitle: `**What was done:** ${verdictLine}${confidence}`,
      suggestions: [
        {
          id: 'approve',
          label: 'Approve',
          prompt: prompts.approve,
          tone: 'primary',
          execute: { kind: 'task', taskId: hints.taskId, actionType: 'complete' },
        },
        {
          id: 'amend',
          label: 'Amend',
          prompt: prompts.amend,
          tone: 'secondary',
          execute: { kind: 'task', taskId: hints.taskId, actionType: 'request_info' },
        },
        { id: 'reasoning', label: 'Explain reasoning', prompt: prompts.reasoning, tone: 'neutral' },
      ],
    };
  }

  if (hints?.variant === 'requirementReview' && hints.caseId && hints.requirementName) {
    return {
      eyebrow: `Case ${hints.caseId}`,
      title: hints.requirementName,
      subtitle: `Requirement status: **${hints.requirementStatus ?? 'Open'}**. Ask about linked tasks, documents, or what is needed to fulfill it.`,
      suggestions: [
        {
          id: 'reqs',
          label: 'All open requirements',
          prompt: `Which requirements are still open on case ${hints.caseId}, and what is blocking progress?`,
          tone: 'neutral',
        },
        {
          id: 'next',
          label: 'Next steps',
          prompt: `What are the best next steps on case ${hints.caseId}?`,
          tone: 'neutral',
        },
      ],
    };
  }

  if (hints?.variant === 'caseWorkspace' && hints.caseId) {
    const label = hints.caseLabel?.trim();
    return {
      eyebrow: 'Case workspace',
      title: `You're on ${hints.caseId}`,
      subtitle: label
        ? `Working on **${label}**. Ask for a summary, next steps, or help with requirements and tasks.`
        : 'Ask for a summary, next steps, or help with requirements and tasks on this case.',
      suggestions: [
        {
          id: 'sum',
          label: 'Summarize case',
          prompt: `Give a concise summary of case ${hints.caseId} for handoff.`,
          tone: 'neutral',
        },
        {
          id: 'next',
          label: 'Next steps',
          prompt: `What are the best next steps on case ${hints.caseId}?`,
          tone: 'neutral',
        },
        {
          id: 'reqs',
          label: 'Requirements',
          prompt: `Which requirements are still open on case ${hints.caseId}, and what is blocking progress?`,
          tone: 'neutral',
        },
      ],
    };
  }

  if (tab === 'workspace' && ctx && ctx.kind !== 'copilot') {
    const routeTitle = workspaceTitleForContext(ctx);
    if (routeTitle) {
      return {
        eyebrow: 'amplify assistant',
        title: routeTitle.title,
        subtitle: routeTitle.subtitle,
        suggestions: workspaceSuggestionsForContext(ctx),
      };
    }
  }

  if (tab === 'workspace') {
    return {
      eyebrow: 'amplify assistant',
      title: 'What should we tackle?',
      subtitle: 'Pick a starter below or type your own question about your queue, cases, or tasks.',
      suggestions: [
        {
          id: 'priorities',
          label: "Today's priorities",
          prompt:
            'What should I prioritize in my queue today—overdue items, due today, and anything at risk?',
          tone: 'neutral',
        },
        {
          id: 'cases',
          label: 'Case deadlines',
          prompt: GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT,
          tone: 'neutral',
        },
        {
          id: 'tasks',
          label: 'Open tasks',
          prompt:
            'Summarize my open tasks, due dates, and a sensible order to work through them.',
          tone: 'neutral',
        },
      ],
    };
  }

  if (tab === 'factors') {
    return {
      title: 'Assessment factors',
      subtitle: 'Explore scores, drivers, evidence, or draft a short file note.',
      suggestions: tabSuggestions(tab),
    };
  }

  if (tab === 'summary') {
    return {
      title: 'Case summary',
      subtitle: 'Summarize the profile, prep for contact, or draft neutral notes.',
      suggestions: tabSuggestions(tab),
    };
  }

  return {
    title: 'Case insights',
    subtitle: 'Ask about rationale, evidence gaps, and recommended next steps.',
    suggestions: tabSuggestions(tab),
  };
}

function workspaceTitleForContext(
  ctx: LiveContext,
): { title: string; subtitle: string } | null {
  switch (ctx.kind) {
    case 'dashboard':
      return {
        title: 'Your dashboard',
        subtitle: 'Ask about queue load, team priorities, or what needs attention today.',
      };
    case 'tasks':
    case 'taskDetail':
      return {
        title: 'Your tasks',
        subtitle: 'Plan work, check due dates, or ask what to tackle first.',
      };
    case 'cases':
      return {
        title: 'Your cases',
        subtitle: 'Find deadlines, risks, and cases that need a decision.',
      };
    case 'documents':
    case 'documentDetail':
      return {
        title: 'Documents',
        subtitle: 'Spot gaps, outstanding items, and follow-ups across your work.',
      };
    default:
      return null;
  }
}

function workspaceSuggestionsForContext(ctx: LiveContext): CopilotEmptySuggestion[] {
  switch (ctx.kind) {
    case 'dashboard':
      return [
        {
          id: 'queue',
          label: 'Queue focus',
          prompt:
            'What should I prioritize in my queue today—overdue items, due today, and anything at risk?',
          tone: 'neutral',
        },
        {
          id: 'cases',
          label: 'Case deadlines',
          prompt: GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT,
          tone: 'neutral',
        },
      ];
    case 'tasks':
    case 'taskDetail':
      return [
        {
          id: 'plan',
          label: 'Plan my day',
          prompt:
            'Summarize my open tasks, due dates, and a sensible order to work through them.',
          tone: 'neutral',
        },
        {
          id: 'overdue',
          label: 'Overdue items',
          prompt: 'Which tasks or cases are overdue or at risk right now?',
          tone: 'neutral',
        },
      ];
    case 'cases':
      return [
        { id: 'deadlines', label: 'Deadlines', prompt: GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT, tone: 'neutral' },
        {
          id: 'risks',
          label: 'At-risk cases',
          prompt: 'Which cases have the highest risk or need a decision soon?',
          tone: 'neutral',
        },
      ];
    default:
      return resolveCopilotEmptyContent('workspace').suggestions;
  }
}

function tabSuggestions(tab: CopilotPanelTab): CopilotEmptySuggestion[] {
  if (tab === 'factors') {
    return [
      { id: 'net', label: 'Explain score', prompt: 'Explain the net assessment score for this case.', tone: 'neutral' },
      { id: 'drivers', label: 'Risk drivers', prompt: 'What are the main risk drivers in the factor table?', tone: 'neutral' },
      { id: 'sources', label: 'Sources', prompt: 'Summarize evidence sources behind the scores.', tone: 'neutral' },
    ];
  }
  if (tab === 'summary') {
    return [
      { id: 'sum', label: 'Summarize', prompt: 'Give a concise case summary for handoff.', tone: 'neutral' },
      { id: 'contact', label: 'Contact prep', prompt: 'Prep talking points for the next claimant call.', tone: 'neutral' },
      { id: 'cover', label: 'Cover check', prompt: 'Relate key facts to policy cover.', tone: 'neutral' },
    ];
  }
  return [
    { id: 'why', label: 'Why approve?', prompt: 'Why does the AI recommend this outcome?', tone: 'neutral' },
    { id: 'gaps', label: 'Evidence gaps', prompt: 'What evidence gaps would change confidence?', tone: 'neutral' },
    { id: 'next', label: 'Next steps', prompt: 'What are the best next steps on this case?', tone: 'neutral' },
  ];
}

function suggestionClass(tone: CopilotEmptySuggestion['tone']): string {
  const base =
    'inline-flex items-center justify-center rounded-full border px-4 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/35';
  if (tone === 'primary') {
    return `${base} border-brand-accent/30 bg-brand-accent text-white hover:bg-brand-accent/90`;
  }
  if (tone === 'secondary') {
    return `${base} border-border-default bg-white text-text-primary hover:border-brand-accent/40 hover:bg-surface-selected-alt`;
  }
  return `${base} border-[#ededed] bg-white text-[#525252] hover:border-[#d8d8d8] hover:bg-surface-primary`;
}

function renderSubtitle(subtitle: string) {
  const parts = subtitle.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-text-secondary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function CopilotChatEmptyState({
  tab,
  hints,
  liveContext,
  onSuggestionClick,
  onExecuteAction,
}: {
  tab: CopilotPanelTab;
  hints?: CopilotContextHints;
  liveContext?: LiveContext;
  onSuggestionClick: (prompt: string) => void;
  onExecuteAction?: (action: CopilotExecuteAction) => void;
}) {
  const content = resolveCopilotEmptyContent(tab, { liveContext, hints });
  const isTaskReview = hints?.variant === 'taskReview';

  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center px-4 py-8 text-center">
      <div className="mb-5 flex items-center gap-2 animate-in fade-in duration-500">
        <AiCueSparkle size={18} className="!text-brand-accent" />
        {content.eyebrow ? (
          <span className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
            {content.eyebrow}
          </span>
        ) : null}
      </div>

      <h3 className="mb-2 max-w-[380px] text-[20px] font-semibold tracking-tight text-text-primary animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:80ms] [animation-fill-mode:backwards]">
        {content.title}
      </h3>

      <p
        className={`mb-7 max-w-[400px] text-[14px] leading-relaxed text-text-muted animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:160ms] [animation-fill-mode:backwards] ${
          isTaskReview ? 'text-left' : ''
        }`}
      >
        {renderSubtitle(content.subtitle)}
      </p>

      <div
        className={`flex max-w-[420px] animate-in fade-in slide-in-from-bottom-3 duration-500 [animation-delay:240ms] [animation-fill-mode:backwards] ${
          isTaskReview ? 'w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center' : 'flex-wrap justify-center gap-2'
        }`}
      >
        {content.suggestions.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              if (s.execute && onExecuteAction) {
                onExecuteAction(s.execute);
                return;
              }
              onSuggestionClick(s.prompt);
            }}
            className={suggestionClass(s.tone)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
