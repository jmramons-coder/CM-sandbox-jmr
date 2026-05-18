import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronUp, SquarePen } from 'lucide-react';
import { useLiveContext, type LiveContext } from '../contexts/LiveContextProvider';
import { useCopilot, newChatDefaultTitle } from '../contexts/CopilotContext';

function relativeTime(at: number): string {
  const diff = Date.now() - at;
  if (diff < 30_000) return 'just now';
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function CrumbsLine({ crumbs }: { crumbs: string[] }) {
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-1 text-[12px] text-text-secondary">
      {crumbs.map((c, i) => (
        <span key={`${c}-${i}`} className="flex items-center gap-1">
          {i > 0 ? <span className="text-[#b7bbc2]">›</span> : null}
          <span className={i === crumbs.length - 1 ? 'font-medium text-text-primary' : 'text-text-secondary'}>{c}</span>
        </span>
      ))}
    </span>
  );
}

export function AiContextPill() {
  const { current, sessionHistory } = useLiveContext();
  const { setIsOpen, sessions, activeSessionId, createSession } = useCopilot();
  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const sessionTitle = activeSession?.title || newChatDefaultTitle();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleNavigate = useCallback(
    (ctx: LiveContext) => {
      setOpen(false);
      // Keep the chat open after navigation so the user can keep the conversation going.
      setIsOpen(true);
      if (ctx.href && ctx.href !== '#') navigate(ctx.href);
    },
    [navigate, setIsOpen],
  );

  // The Assistant module itself is not a meaningful "work context" — when the
  // live context resolves to /copilot we fall back to the most recent real
  // context recorded for this session (or a neutral placeholder).
  const isOnAssistant = current.kind === 'copilot';
  const fallback = sessionHistory[0];
  const displayCtx = isOnAssistant && fallback ? fallback : current;
  const Icon = displayCtx.icon;
  const displayLabel = isOnAssistant
    ? fallback
      ? fallback.label
      : 'No active context'
    : displayCtx.label;
  const items = sessionHistory;

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={current.crumbs.join(' › ')}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`group inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
          open
            ? 'border-brand-blue/40 bg-surface-selected-alt text-text-heading'
            : 'border-[#e5e7eb] bg-[#f5f7f9] text-text-secondary hover:border-[#d0d4d9] hover:bg-[#eef1f4]'
        }`}
      >
        <Icon className="h-3 w-3 shrink-0 text-text-muted group-hover:text-text-secondary" strokeWidth={1.75} />
        <span className={`max-w-[220px] truncate ${isOnAssistant && !fallback ? 'italic text-text-muted' : ''}`}>
          {displayLabel}
        </span>
        <ChevronUp
          className={`h-3 w-3 shrink-0 opacity-60 transition-transform ${open ? '' : 'rotate-180'}`}
          strokeWidth={2}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute bottom-[calc(100%+6px)] left-0 z-[80] w-[320px] overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] animate-in fade-in slide-in-from-bottom-1 duration-150"
        >
          <div className="border-b border-[#f0f0f0] px-3 pb-2 pt-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              Conversation
            </div>
            <div className="mt-0.5 truncate text-[13px] font-semibold text-text-heading" title={sessionTitle}>
              {sessionTitle}
            </div>
          </div>
          <div className="px-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
            Contexts visited
          </div>
          <ul className="max-h-[260px] overflow-y-auto p-1">
            {items.length === 0 ? (
              <li className="px-2 py-2 text-[11px] text-text-muted">No contexts visited yet in this conversation.</li>
            ) : null}
            {items.map((ctx, i) => {
              const ItemIcon = ctx.icon;
              const isCurrent = i === 0 && !isOnAssistant && ctx.id === current.id;
              return (
                <li key={`${ctx.id}-${i}`}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(ctx)}
                    className={`flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[#f7f8fa] ${
                      isCurrent ? 'bg-surface-selected-alt' : ''
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                        isCurrent ? 'bg-surface-selected text-brand-blue' : 'bg-surface-muted text-text-secondary'
                      }`}
                    >
                      <ItemIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <CrumbsLine crumbs={ctx.crumbs} />
                      <span className="text-[10px] text-text-muted">
                        {isCurrent ? 'Current context' : relativeTime(ctx.enteredAt)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-[#f0f0f0] p-1">
            <button
              type="button"
              onClick={() => {
                createSession();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] font-medium text-text-secondary transition-colors hover:bg-[#f7f8fa]"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-muted text-text-secondary">
                <SquarePen className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[12px] font-medium text-text-primary">New conversation</span>
                <span className="text-[10px] text-text-muted">Start fresh — current context will carry over</span>
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Compact inline chip for use above user message bubbles. */
export function AiContextChip({ context }: { context: LiveContext }) {
  const Icon = context.icon;
  return (
    <span
      className="mb-1 inline-flex max-w-full items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-text-secondary"
      title={context.crumbs.join(' › ')}
    >
      <Icon className="h-2.5 w-2.5 text-text-muted" strokeWidth={1.75} />
      <span className="max-w-[200px] truncate">{context.label}</span>
    </span>
  );
}
