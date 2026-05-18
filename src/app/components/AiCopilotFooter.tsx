'use client';

import { useCallback, useEffect, useId, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { Link } from 'react-router';
import {
  ArrowDown,
  Briefcase,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Lightbulb,
  ListTodo,
  Mail,
  Mic,
  PenLine,
  Plus,
  RotateCcw,
  Send,
  Share2,
  SquarePen,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import { useCasesNav } from '../contexts/CasesNavContext';
import { Checkbox } from './ui/checkbox';
import { AiCueSparkle } from './AiCueSparkle';
import { AiContextChip, AiContextPill } from './AiContextPill';
import type { LiveContext } from '../contexts/LiveContextProvider';

import { GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT } from '../constants/copilot-prompts';

export { GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT };

/* ─── Artifact types ─── */

export type CaseLinksArtifact = {
  kind: 'case-links';
  title: string;
  items: { caseId: string; claimant: string; summary: string; tone?: 'critical' | 'warning' | 'neutral' }[];
};

export type TaskListArtifact = {
  kind: 'task-list';
  title: string;
  items: { id: string; label: string; done: boolean; caseId?: string; dueDate?: string; priority?: 'High' | 'Normal' | 'Low' }[];
};

export type ActionCardArtifact = {
  kind: 'action-card';
  title: string;
  description: string;
  actions: { id: string; label: string; variant: 'primary' | 'secondary' | 'danger'; prompt?: string }[];
};

export type TimelineArtifact = {
  kind: 'timeline';
  title: string;
  events: { date: string; label: string; status: 'done' | 'active' | 'upcoming'; detail?: string }[];
};

export type DraftArtifact = {
  kind: 'draft';
  title: string;
  subject?: string;
  body: string;
  actions: { id: string; label: string; prompt?: string }[];
};

export type ChatArtifact = CaseLinksArtifact | TaskListArtifact | ActionCardArtifact | TimelineArtifact | DraftArtifact;

export type ChatTurn = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  at: number;
  artifact?: ChatArtifact;
  followUps?: string[];
  /** Live context the user was in when this turn was sent (user turns only). */
  context?: LiveContext;
};

export type AIPanelTab = 'summary' | 'insights' | 'factors' | 'workspace';
type QuickActionIcon = ComponentType<{ className?: string; strokeWidth?: number | string }>;

function AiCueQuickActionIcon({ className }: { className?: string; strokeWidth?: number | string }) {
  return <AiCueSparkle size={14} className={className} />;
}

/* ─── Quick actions ─── */

function quickActionsForTab(tab: AIPanelTab): { id: string; label: string; prompt: string; icon: QuickActionIcon }[] {
  if (tab === 'workspace') {
    return [
      { id: 'queue', label: 'Queue focus', prompt: 'What should I prioritize in my queue today\u2014overdue items, due today, and anything at risk?', icon: LayoutDashboard },
      { id: 'cases', label: 'Case priorities', prompt: GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT, icon: FolderOpen },
      { id: 'tasks', label: 'My tasks', prompt: 'Help me plan my work: summarize my open tasks, due dates, and suggested order to tackle them.', icon: ListTodo },
      { id: 'documents', label: 'Documents', prompt: 'How can I spot missing or outstanding documents and follow-ups across my cases?', icon: FileText },
    ];
  }
  if (tab === 'factors') {
    return [
      { id: 'net', label: 'Explain score', prompt: 'Explain the net assessment score for this case.', icon: AiCueQuickActionIcon },
      { id: 'drivers', label: 'Risk drivers', prompt: 'What are the main risk drivers in the factor table?', icon: Lightbulb },
      { id: 'sources', label: 'Sources', prompt: 'Summarize evidence sources behind the scores.', icon: Briefcase },
      { id: 'note', label: 'File note', prompt: 'Draft a short internal file note from the factors.', icon: PenLine },
    ];
  }
  if (tab === 'summary') {
    return [
      { id: 'sum', label: 'Summarize', prompt: 'Give a concise case summary for handoff.', icon: AiCueQuickActionIcon },
      { id: 'contact', label: 'Contact prep', prompt: 'Prep talking points for the next claimant call.', icon: Briefcase },
      { id: 'cover', label: 'Cover check', prompt: 'Relate key facts to policy cover.', icon: PenLine },
      { id: 'write', label: 'Write', prompt: 'Help me write a neutral case note.', icon: Lightbulb },
    ];
  }
  return [
    { id: 'why', label: 'Why approve?', prompt: 'Why does the AI recommend this outcome?', icon: Lightbulb },
    { id: 'gaps', label: 'Gaps', prompt: 'What evidence gaps would change confidence?', icon: AiCueQuickActionIcon },
    { id: 'next', label: 'Next steps', prompt: 'What are the best next steps on this case?', icon: Briefcase },
    { id: 'write', label: 'Write', prompt: 'Help me write a professional file update.', icon: PenLine },
  ];
}

function copilotEmptyContextLine(tab: AIPanelTab): string {
  if (tab === 'workspace') return 'Get quick guidance on your dashboard, cases, tasks, and documents\u2014or tap a shortcut below to start.';
  if (tab === 'factors') return 'Explore assessment scores, risk drivers, evidence behind the numbers, or draft a concise file note.';
  if (tab === 'summary') return 'Summarize the client profile, prep for calls, relate facts to cover, or polish neutral case notes.';
  return 'Ask about the overview, AI rationale, evidence gaps, and the best next steps for this case.';
}

/* ─── Markdown-lite renderer ─── */

function renderMarkdownLite(text: string): ReactNode {
  const lines = text.split('\n');
  const elements: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line === '---') {
      elements.push(<hr key={i} className="my-3 border-t border-[#e0e0e0]" />);
      i++;
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-1.5 ml-4 list-decimal space-y-1 text-[15px] leading-relaxed">
          {listItems.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
        </ol>,
      );
      continue;
    }

    if (/^[•\-]\s/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[•\-]\s/.test(lines[i])) {
        listItems.push(lines[i].replace(/^[•\-]\s/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-1.5 ml-4 list-disc space-y-1 text-[15px] leading-relaxed">
          {listItems.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
        </ul>,
      );
      continue;
    }

    if (line === '') {
      elements.push(<br key={i} />);
    } else {
      elements.push(<span key={i}>{renderInline(line)}{'\n'}</span>);
    }
    i++;
  }

  return <>{elements}</>;
}

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

/* ─── Typing indicator ─── */

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 rounded-[1.25rem] bg-[#efefef] px-4 py-3">
      <span className="h-2 w-2 rounded-full bg-[#8c8c8c] animate-bounce [animation-delay:0ms]" />
      <span className="h-2 w-2 rounded-full bg-[#8c8c8c] animate-bounce [animation-delay:150ms]" />
      <span className="h-2 w-2 rounded-full bg-[#8c8c8c] animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

/* ─── Empty state ─── */

const emptyStateCards = [
  { Icon: LayoutDashboard, label: 'Dashboard', desc: 'Queue and priority overview' },
  { Icon: Briefcase, label: 'Cases', desc: 'Status, risks, and next actions' },
  { Icon: ListTodo, label: 'Tasks', desc: 'Plan, delegate, and track work' },
  { Icon: FileText, label: 'Documents', desc: 'Gaps, follow-ups, and drafts' },
];

function CopilotChatEmptyState({ tab }: { tab: AIPanelTab }) {
  const title = tab === 'workspace' ? 'How can I help?' : 'Ask Amplify Assistant';
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center px-4 text-center">
      {tab === 'workspace' ? (
        <>
          <div className="mb-6 flex items-center gap-2 animate-in fade-in duration-500">
            <AiCueSparkle size={20} className="!text-brand-accent" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">amplify assistant</span>
          </div>
          <h3 className="mb-2 text-[22px] font-semibold tracking-tight text-text-primary animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:100ms] [animation-fill-mode:backwards]">
            {title}
          </h3>
          <p className="mb-8 max-w-[340px] text-[14px] leading-relaxed text-text-muted animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:200ms] [animation-fill-mode:backwards]">
            {copilotEmptyContextLine(tab)}
          </p>
          <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-3 duration-500 [animation-delay:350ms] [animation-fill-mode:backwards]">
            {emptyStateCards.map(({ Icon, label, desc }) => (
              <div
                key={label}
                className="group flex flex-col items-center gap-2 rounded-xl border border-[#f0f0f0] bg-white px-5 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-[#d8c7f1] hover:shadow-[0_2px_8px_rgba(96,47,160,0.1)]"
              >
                <Icon className="h-5 w-5 text-[#b7bbc2] transition-colors group-hover:text-brand-accent" strokeWidth={1.5} />
                <span className="text-[12px] font-semibold text-text-secondary">{label}</span>
                <span className="text-[11px] leading-snug text-text-muted">{desc}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="mb-2 inline-flex items-start gap-0 animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:100ms] [animation-fill-mode:backwards]">
            <h3 className="text-[18px] font-semibold tracking-tight text-text-primary">
              {title}
            </h3>
            <span className="ml-1 mt-0.5 flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full bg-brand-accent">
              <AiCueSparkle size={8} className="!text-white" />
            </span>
          </div>
          <p className="mb-5 max-w-[300px] text-[13px] leading-relaxed text-text-muted animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:200ms] [animation-fill-mode:backwards]">
            {copilotEmptyContextLine(tab)}
          </p>
          <div className="flex flex-wrap justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:350ms] [animation-fill-mode:backwards]">
            {quickActionsForTab(tab).map((a) => (
              <span key={a.id} className="inline-flex items-center gap-1.5 rounded-full border border-[#f0f0f0] bg-white px-3 py-1.5 text-[12px] font-medium text-text-secondary">
                <a.icon className="h-3 w-3 text-[#b7bbc2]" strokeWidth={1.75} />
                {a.label}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Utilities ─── */

function formatTurnTime(at: number): string {
  const d = new Date(at);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
}

/* ─── Message action bars ─── */

function CopilotAssistantActions({ text, at }: { text: string; at: number }) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const copyReply = useCallback(async () => { try { await navigator.clipboard.writeText(text); } catch { /* */ } }, [text]);
  const shareReply = useCallback(async () => { try { if (navigator.share) await navigator.share({ text }); else await navigator.clipboard.writeText(text); } catch { /* */ } }, [text]);
  const btn = 'rounded-md p-1.5 text-[#a8a8a8] transition-colors hover:bg-black/[0.04] hover:text-[#525252]';
  return (
    <div className="mt-2 flex items-center gap-1 text-[#8c8c8c] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
      <span className="pr-1 text-[11px]">{formatTurnTime(at)}</span>
      <button type="button" className={btn} onClick={copyReply} title="Copy"><Copy className="h-4 w-4" strokeWidth={1.75} /></button>
      <button type="button" className={btn} onClick={() => setVote((v) => (v === 'up' ? null : 'up'))} title="Helpful" aria-pressed={vote === 'up'}>
        <ThumbsUp className={`h-4 w-4 ${vote === 'up' ? 'text-brand-blue' : ''}`} strokeWidth={1.75} />
      </button>
      <button type="button" className={btn} onClick={() => setVote((v) => (v === 'down' ? null : 'down'))} title="Not helpful" aria-pressed={vote === 'down'}>
        <ThumbsDown className={`h-4 w-4 ${vote === 'down' ? 'text-brand-red' : ''}`} strokeWidth={1.75} />
      </button>
      <button type="button" className={btn} onClick={shareReply} title="Share"><Share2 className="h-4 w-4" strokeWidth={1.75} /></button>
    </div>
  );
}

function UserBubbleActions({ text, at }: { text: string; at: number }) {
  const copyReply = useCallback(async () => { try { await navigator.clipboard.writeText(text); } catch { /* */ } }, [text]);
  const btn = 'rounded-md p-1.5 text-[#8c8c8c] transition-colors hover:bg-black/[0.04] hover:text-[#525252]';
  return (
    <div className="mt-2 flex items-center justify-end gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
      <span className="pr-1 text-[11px] text-[#8c8c8c]">{formatTurnTime(at)}</span>
      <button type="button" className={btn} title="Retry"><RotateCcw className="h-4 w-4" strokeWidth={1.75} /></button>
      <button type="button" className={btn} title="Edit"><SquarePen className="h-4 w-4" strokeWidth={1.75} /></button>
      <button type="button" className={btn} onClick={copyReply} title="Copy"><Copy className="h-4 w-4" strokeWidth={1.75} /></button>
    </div>
  );
}

/* ─── Artifact renderers ─── */

const artifactCard = 'mt-3 rounded-xl border border-border-soft bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] animate-in fade-in zoom-in-[0.98] duration-200';
const artifactTitle = 'mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#8c9199]';

function CaseLinksCard({ artifact, onAction }: { artifact: CaseLinksArtifact; onAction?: (prompt: string) => void }) {
  const { addOpenCase } = useCasesNav();
  const toneDot: Record<string, string> = { critical: 'bg-[#cd2c23]', warning: 'bg-[#f5a200]', neutral: 'bg-[#60666e]' };
  return (
    <div className={`${artifactCard} p-3`}>
      <div className={artifactTitle}>{artifact.title}</div>
      <ul className="space-y-0.5">
        {artifact.items.map((item) => (
          <li key={item.caseId}>
            <Link
              to={`/cases/${item.caseId}`}
              onClick={() => addOpenCase(item.caseId)}
              className="group/link flex w-full min-w-0 items-center gap-3 rounded-lg border border-transparent px-2 py-2 text-left transition-colors hover:border-border-soft hover:bg-[#f8f9fa]"
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${toneDot[item.tone ?? 'neutral']}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-brand-blue group-hover/link:underline">{item.caseId}</div>
                <div className="truncate text-[12px] text-text-secondary">{item.claimant}</div>
                <div className="text-[12px] leading-snug text-text-secondary">{item.summary}</div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#b7bbc2] transition-transform group-hover/link:translate-x-0.5 group-hover/link:text-text-secondary" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TaskListCard({ artifact }: { artifact: TaskListArtifact }) {
  const [items, setItems] = useState(artifact.items);
  const toggle = (id: string) => setItems((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const priorityPill: Record<string, string> = { High: 'bg-[#fde5e4] text-brand-red', Normal: 'bg-surface-muted text-text-secondary', Low: 'bg-surface-selected text-brand-blue' };

  return (
    <div className={`${artifactCard} p-3`}>
      <div className={artifactTitle}>{artifact.title}</div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-surface-primary">
            <Checkbox
              checked={item.done}
              onCheckedChange={() => toggle(item.id)}
              className="mt-0.5 size-4 rounded-[4px]"
            />
            <div className="min-w-0 flex-1">
              <span className={`text-[13px] leading-snug ${item.done ? 'text-[#8c8c8c] line-through' : 'text-text-primary'}`}>
                {item.label}
              </span>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                {item.priority && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${priorityPill[item.priority] ?? priorityPill.Normal}`}>
                    {item.priority}
                  </span>
                )}
                {item.dueDate && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
                    <Clock className="h-3 w-3" />
                    {item.dueDate}
                  </span>
                )}
                {item.caseId && (
                  <Link to={`/cases/${item.caseId}`} className="text-[10px] font-medium text-brand-blue hover:underline">{item.caseId}</Link>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-2 border-t border-[#f0f0f0] pt-2 text-center text-[11px] text-[#8c8c8c]">
        {items.filter((t) => t.done).length}/{items.length} completed
      </div>
    </div>
  );
}

function ActionCardComponent({ artifact, onAction }: { artifact: ActionCardArtifact; onAction: (prompt: string) => void }) {
  const variantClass: Record<string, string> = {
    primary: 'bg-brand-blue text-white hover:bg-brand-blue-hover',
    secondary: 'border border-border-default bg-white text-text-secondary hover:bg-[#f8f9fa]',
    danger: 'border border-[#cd2c23]/20 bg-white text-brand-red hover:bg-[#fde5e4]',
  };
  return (
    <div className={`${artifactCard} p-4`}>
      <div className="mb-1 text-[14px] font-semibold text-text-primary">{artifact.title}</div>
      <p className="mb-3 text-[13px] leading-relaxed text-text-secondary">{artifact.description}</p>
      <div className="flex flex-wrap gap-2">
        {artifact.actions.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => a.prompt && onAction(a.prompt)}
            className={`rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors ${variantClass[a.variant] ?? variantClass.secondary}`}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TimelineCard({ artifact }: { artifact: TimelineArtifact }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const statusIcon = (status: string) => {
    if (status === 'done') return <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />;
    if (status === 'active') return <Circle className="h-2.5 w-2.5 text-white" fill="currentColor" />;
    return <Circle className="h-2.5 w-2.5 text-[#b7bbc2]" strokeWidth={1.5} />;
  };
  const dotBg = (status: string) => {
    if (status === 'done') return 'bg-[#b7bbc2]';
    if (status === 'active') return 'bg-brand-blue';
    return 'bg-white border border-border-default';
  };
  return (
    <div className={`${artifactCard} p-4`}>
      <div className={artifactTitle}>{artifact.title}</div>
      <div className="relative ml-3">
        <div className="absolute left-[9px] top-3 bottom-3 w-px bg-[#e0e4e8]" />
        <ul className="space-y-0">
          {artifact.events.map((ev, idx) => (
            <li
              key={idx}
              className="relative flex items-start gap-3 py-1.5 cursor-pointer"
              onClick={() => ev.detail && setExpanded(expanded === `${idx}` ? null : `${idx}`)}
            >
              <span className={`relative z-10 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${dotBg(ev.status)}`}>
                {statusIcon(ev.status)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-text-muted">{ev.date}</span>
                  <span className={`text-[13px] ${ev.status === 'done' ? 'text-text-secondary' : ev.status === 'active' ? 'font-medium text-text-primary' : 'text-text-muted'}`}>
                    {ev.label}
                  </span>
                </div>
                {expanded === `${idx}` && ev.detail && (
                  <p className="mt-1 text-[12px] leading-relaxed text-text-secondary animate-in fade-in duration-150">{ev.detail}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DraftCard({ artifact, onAction }: { artifact: DraftArtifact; onAction: (prompt: string) => void }) {
  const copyBody = useCallback(async () => {
    try { await navigator.clipboard.writeText(artifact.body); } catch { /* */ }
  }, [artifact.body]);

  return (
    <div className={`${artifactCard} overflow-hidden`}>
      <div className="flex items-center gap-2 border-b border-[#f0f0f0] bg-surface-primary px-4 py-2.5">
        <Mail className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
        <span className="text-[13px] font-semibold text-text-primary">{artifact.title}</span>
      </div>
      {artifact.subject && (
        <div className="border-b border-[#f0f0f0] px-4 py-2">
          <span className="text-[11px] font-medium text-text-muted">Subject: </span>
          <span className="text-[12px] text-text-primary">{artifact.subject}</span>
        </div>
      )}
      <div className="max-h-[240px] overflow-y-auto px-4 py-3">
        <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-text-secondary">{artifact.body}</pre>
      </div>
      <div className="flex items-center gap-2 border-t border-[#f0f0f0] bg-surface-primary px-4 py-2.5">
        <button type="button" onClick={copyBody} className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-white px-3 py-1.5 text-[12px] font-medium text-text-secondary transition-colors hover:bg-[#f8f9fa]">
          <Copy className="h-3.5 w-3.5" />
          Copy
        </button>
        {artifact.actions.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => a.prompt && onAction(a.prompt)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-white px-3 py-1.5 text-[12px] font-medium text-brand-blue transition-colors hover:bg-surface-selected-alt"
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ArtifactRenderer({ artifact, onAction }: { artifact: ChatArtifact; onAction: (prompt: string) => void }) {
  switch (artifact.kind) {
    case 'case-links':
      return <CaseLinksCard artifact={artifact} onAction={onAction} />;
    case 'task-list':
      return <TaskListCard artifact={artifact} />;
    case 'action-card':
      return <ActionCardComponent artifact={artifact} onAction={onAction} />;
    case 'timeline':
      return <TimelineCard artifact={artifact} />;
    case 'draft':
      return <DraftCard artifact={artifact} onAction={onAction} />;
    default:
      return null;
  }
}

/* ─── Main AiCopilotDock ─── */

export function AiCopilotDock({
  data,
  messages,
  onSendMessage,
  aiPanelTab = 'insights',
  onSurfaceOpenChange,
  layout = 'dock',
}: {
  data: { id: string };
  messages: ChatTurn[];
  onSendMessage: (text: string) => void;
  aiPanelTab?: AIPanelTab;
  onSurfaceOpenChange?: (open: boolean) => void;
  layout?: 'dock' | 'panel';
}) {
  const formId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState('');
  const [surfaceOpen, setSurfaceOpen] = useState(false);
  const [surfacePx, setSurfacePx] = useState(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isDockResizing, setIsDockResizing] = useState(false);
  const isPanel = layout === 'panel';

  const quickActions = quickActionsForTab(aiPanelTab);

  const targetHeight = useCallback(() => {
    if (typeof window === 'undefined') return 400;
    return Math.floor(window.innerHeight * 0.55);
  }, []);

  useEffect(() => {
    if (isPanel) return;
    setSurfacePx(surfaceOpen ? targetHeight() : 0);
  }, [surfaceOpen, targetHeight, isPanel]);

  useEffect(() => {
    if (isPanel || !surfaceOpen) return;
    const onResize = () => setSurfacePx(targetHeight());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [surfaceOpen, targetHeight, isPanel]);

  useEffect(() => {
    if (messages.length === 0) return;
    if (!isPanel && !surfaceOpen) return;
    const t = setTimeout(() => {
      const container = listRef.current;
      if (!container) return;
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === 'assistant') {
        const el = container.querySelector(`[data-message-id="${lastMsg.id}"]`);
        if (el) {
          const containerRect = container.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          const scrollOffset = elRect.top - containerRect.top + container.scrollTop - 60;
          container.scrollTo({ top: scrollOffset, behavior: 'smooth' });
          return;
        }
      }
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }, 80);
    return () => clearTimeout(t);
  }, [messages, surfaceOpen, isPanel]);

  useEffect(() => {
    if (isPanel) { onSurfaceOpenChange?.(false); return; }
    onSurfaceOpenChange?.(surfaceOpen);
  }, [surfaceOpen, onSurfaceOpenChange, isPanel]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(distFromBottom > 120);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isDockResizing || isPanel) return;
    const onMove = (e: MouseEvent) => {
      const newHeight = window.innerHeight - e.clientY;
      const min = 120;
      const max = Math.floor(window.innerHeight * 0.65);
      setSurfacePx(Math.max(min, Math.min(max, newHeight)));
    };
    const onUp = () => setIsDockResizing(false);
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDockResizing, isPanel]);

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, []);

  const openSurface = useCallback(() => setSurfaceOpen(true), []);

  const handleSend = useCallback(() => {
    const t = draft.trim();
    if (!t) return;
    onSendMessage(t);
    setDraft('');
    if (!isPanel) setSurfaceOpen(true);
  }, [draft, onSendMessage, isPanel]);

  const onDraftChange = (v: string) => {
    setDraft(v);
    if (!isPanel && v.trim().length > 0) setSurfaceOpen(true);
  };

  const toggleSurface = () => setSurfaceOpen((o) => !o);

  return (
    <div
      className={
        isPanel
          ? 'pointer-events-auto flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-surface-primary'
          : 'pointer-events-auto absolute bottom-0 left-0 right-0 z-[35] flex min-w-0 flex-col overflow-visible rounded-t-2xl border-t border-[#ececec] bg-surface-primary shadow-[0_-4px_20px_rgba(0,0,0,0.04),0_-1px_6px_rgba(0,0,0,0.03)]'
      }
    >
      {/* Dock top border: resize strip + toggle button */}
      {!isPanel && (
        <>
          <div
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize chat"
            className={`absolute left-0 right-0 top-0 z-[39] h-[4px] -translate-y-1/2 cursor-ns-resize transition-colors ${
              isDockResizing ? 'bg-brand-blue' : 'bg-transparent hover:bg-brand-blue'
            }`}
            onMouseDown={(e) => {
              e.preventDefault();
              if (!surfaceOpen) setSurfaceOpen(true);
              setIsDockResizing(true);
            }}
          />
          <button
            type="button"
            onClick={toggleSurface}
            className="absolute left-1/2 top-0 z-[50] flex h-6 w-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[6px] border border-border-default bg-white text-text-secondary shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow hover:border-[#c5ccd4] hover:shadow-[0_3px_12px_rgba(0,0,0,0.08)]"
            title={surfaceOpen ? 'Minimize chat' : 'Expand chat'}
          >
            <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${surfaceOpen ? '' : 'rotate-180'}`} strokeWidth={2.25} />
          </button>
        </>
      )}

      {/* Transcript */}
      <div
        className={`relative ${isPanel ? 'min-h-0 flex-1 overflow-hidden' : `min-h-0 overflow-hidden rounded-t-2xl ${isDockResizing ? '' : 'transition-[height] duration-300 ease-out motion-reduce:transition-none'}`}`}
        style={isPanel ? undefined : { height: surfaceOpen ? surfacePx : 0 }}
      >
        <div ref={listRef} className="h-full min-h-0 min-w-0 overflow-y-auto overscroll-contain bg-surface-primary px-10 pb-3 pt-7">
          {messages.length === 0 ? (
            <CopilotChatEmptyState tab={aiPanelTab} />
          ) : (
            <div className="mx-auto min-w-0 max-w-[720px] space-y-5">
              {messages.map((m) =>
                m.role === 'user' ? (
                  <div key={m.id} className="group flex flex-col items-end animate-in fade-in slide-in-from-bottom-2 duration-200">
                    {m.context && m.context.kind !== 'copilot' ? <AiContextChip context={m.context} /> : null}
                    <div className="max-w-[85%] rounded-[1.25rem] bg-[#f0f0f0] px-4 py-2.5 text-left text-[15px] leading-relaxed text-[#171717]">
                      {m.text}
                    </div>
                    <UserBubbleActions text={m.text} at={m.at} />
                  </div>
                ) : (
                  <div key={m.id} data-message-id={m.id} className="group min-w-0 max-w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="py-2 text-[15px] leading-relaxed text-[#171717]">
                      {renderMarkdownLite(m.text)}
                    </div>
                    {m.artifact ? <ArtifactRenderer artifact={m.artifact} onAction={onSendMessage} /> : null}
                    {m.followUps && m.followUps.length > 0 ? (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {m.followUps.map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => { onSendMessage(f); if (!isPanel) setSurfaceOpen(true); }}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-white px-3 py-1.5 text-[12px] font-medium text-brand-blue transition-colors hover:border-brand-blue/30 hover:bg-surface-selected-alt"
                          >
                            <ChevronRight className="h-3 w-3 opacity-60" />
                            {f}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <CopilotAssistantActions text={m.text} at={m.at} />
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* Scroll to bottom FAB */}
        {showScrollBtn && messages.length > 0 && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-border-soft bg-white p-2.5 text-text-secondary shadow-[0_2px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:border-brand-blue/30 hover:text-brand-blue hover:shadow-[0_4px_16px_var(--color-brand-blue-ring)] animate-in fade-in zoom-in-75 duration-200"
            title="Scroll to latest"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Composer */}
      <div className={`shrink-0 px-6 pb-5 ${isPanel ? 'border-t border-[#ececec] pt-4' : 'pt-4'}`}>
        <div className="mx-auto max-w-[720px]">
          <div className="rounded-[18px] border border-[#f0f0f0] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_10px_rgba(0,0,0,0.03)]">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
              <div className="mb-3 flex items-center">
                <AiContextPill />
              </div>
              <label htmlFor={`${formId}-input`} className="sr-only">Message Amplify Assistant</label>
              <textarea
                id={`${formId}-input`}
                rows={2}
                value={draft}
                onChange={(e) => onDraftChange(e.target.value)}
                onFocus={() => !isPanel && openSurface()}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="How can I help you today?"
                className="w-full resize-none border-0 bg-transparent text-[15px] leading-relaxed text-[#171717] outline-none placeholder:text-[#8c8c8c]"
                autoComplete="off"
              />
              <div className="mt-3 flex items-center justify-between border-t border-[#f0f0f0] pt-3">
                <button type="button" className="rounded-lg p-2 text-[#737373] hover:bg-[#f5f5f5]" aria-label="Add">
                  <Plus className="h-5 w-5" strokeWidth={1.75} />
                </button>
                <div className="flex items-center gap-2">
                  <button type="button" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] font-medium text-[#737373] hover:bg-[#f5f5f5]">
                    <AiCueSparkle size={12} className="!text-brand-accent" />
                    Amplify Assistant
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </button>
                  <span className="text-[#e5e5e5]">|</span>
                  <button type="button" className="rounded-lg p-2 text-[#737373] hover:bg-[#f5f5f5]" aria-label="Voice">
                    <Mic className="h-5 w-5" strokeWidth={1.75} />
                  </button>
                  <button type="submit" disabled={!draft.trim()} className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#171717] text-white hover:opacity-90 disabled:pointer-events-none disabled:opacity-25" aria-label="Send">
                    <Send className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="mx-auto mt-4 flex flex-wrap justify-center gap-2">
            {quickActions.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => { onSendMessage(a.prompt); if (!isPanel) setSurfaceOpen(true); }}
                className="inline-flex items-center gap-2 rounded-full border border-[#ededed] bg-white px-3.5 py-2 text-[13px] font-medium text-[#525252] transition-colors hover:border-[#e3e3e3] hover:bg-surface-primary"
              >
                <a.icon className="h-3.5 w-3.5 text-[#737373]" strokeWidth={2} />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
