import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Archive,
  MoreVertical,
  PenLine,
  Pin,
  Plus,
  Search,
  Share2,
  Trash2,
} from 'lucide-react';
import { useCopilot, newChatDefaultTitle, type CopilotSession } from '../contexts/CopilotContext';
import { UI_CLASS } from '../constants/design-tokens';
import { useResizableSidePanel } from '../hooks/useResizableSidePanel';
import { AiCopilotDock } from './AiCopilotFooter';
import { AiCueSparkle } from './AiCueSparkle';
import {
  SidePanelResizeStrip,
  SidePanelToggle,
} from './WorkspaceSidePanelChrome';

export function CopilotFullPage() {
  const navigate = useNavigate();
  const { sessions, activeSessionId, activeMessages, sendMessage, switchSession, createSession, deleteSession, renameSession, togglePin, setIsOpen } = useCopilot();

  const {
    panelWidth,
    sidePanelOpen,
    setSidePanelOpen,
    isResizing,
    setIsResizing,
  } = useResizableSidePanel();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const sessionTitle = activeSession?.title || newChatDefaultTitle();

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [menuOpen]);

  useEffect(() => {
    if (renaming) renameRef.current?.focus();
  }, [renaming]);

  const filtered = search
    ? sessions.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()))
    : sessions;
  const pinnedSessions = filtered.filter((s) => s.pinned);
  const recentSessions = filtered.filter((s) => !s.pinned);

  const renderSessionRow = (session: CopilotSession) => {
    const active = session.id === activeSessionId;
    const isRenaming = renaming === session.id;

    return (
      <div
        key={session.id}
        role="button"
        tabIndex={0}
        onClick={() => !isRenaming && switchSession(session.id)}
        onKeyDown={(e) => {
          if (!isRenaming && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            switchSession(session.id);
          }
        }}
        className={`group flex w-full cursor-pointer items-center gap-1.5 rounded-[8px] border px-2.5 py-1.5 text-left text-sm transition-colors ${
          active
            ? 'border-brand-blue-border bg-white text-brand-blue'
            : 'border-transparent text-brand-navy hover:border-brand-blue-border hover:bg-surface-selected-alt'
        }`}
      >
        {session.pinned && !isRenaming && (
          <Pin className="h-3 w-3 shrink-0 text-text-muted" />
        )}
        {isRenaming ? (
          <input
            ref={renameRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onBlur={() => {
              if (renameValue.trim()) renameSession(session.id, renameValue.trim());
              setRenaming(null);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') {
                if (renameValue.trim()) renameSession(session.id, renameValue.trim());
                setRenaming(null);
              }
              if (e.key === 'Escape') setRenaming(null);
            }}
            className="min-w-0 flex-1 rounded bg-surface-muted px-1.5 py-0.5 text-[13px] text-text-primary outline-none selection:bg-brand-blue/20"
          />
        ) : (
          <span className="min-w-0 flex-1 truncate">{session.title}</span>
        )}
        <div className="relative shrink-0" ref={menuOpen === session.id ? menuRef : undefined}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(menuOpen === session.id ? null : session.id);
            }}
            className={`rounded p-1 text-text-muted transition-colors hover:bg-border-soft hover:text-text-secondary ${
              menuOpen === session.id ? 'bg-[#e0e4e8] text-text-secondary' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
          {menuOpen === session.id && (
            <div className="absolute right-0 top-full z-[90] mt-1 w-[170px] rounded-xl border border-border-soft bg-white py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen(null); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-text-secondary hover:bg-surface-muted">
                <Share2 className="h-3.5 w-3.5 text-text-secondary" />
                Share
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); setRenameValue(session.title); setRenaming(session.id); setMenuOpen(null); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-text-secondary hover:bg-surface-muted">
                <PenLine className="h-3.5 w-3.5 text-text-secondary" />
                Rename
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); togglePin(session.id); setMenuOpen(null); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-text-secondary hover:bg-surface-muted">
                <Pin className="h-3.5 w-3.5 text-text-secondary" />
                {session.pinned ? 'Unpin chat' : 'Pin chat'}
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen(null); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-text-secondary hover:bg-surface-muted">
                <Archive className="h-3.5 w-3.5 text-text-secondary" />
                Archive
              </button>
              <div className="mx-2.5 my-1 h-px bg-[#f0f0f0]" />
              <button type="button" onClick={(e) => { e.stopPropagation(); deleteSession(session.id); setMenuOpen(null); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-brand-red hover:bg-[#fde5e4]">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex h-full min-h-0 min-w-0 overflow-x-visible">
      {/* ─── Session sidebar (mirrors CasesWorkspace aside) ─── */}
      <aside
        className={`relative flex min-h-0 shrink-0 flex-col overflow-x-visible ${UI_CLASS.workspaceTopLeftRadius} ${UI_CLASS.sidePanelBackground} ${sidePanelOpen ? 'z-10 border-r border-border-default' : 'z-0 min-w-0 border-0'}`}
        style={{ width: sidePanelOpen ? panelWidth : 0 }}
      >
        {sidePanelOpen ? (
          <>
            {/* Header */}
            <div className="border-b border-border-default px-5 pb-4 pt-5">
              <div className="mb-5">
                <p className="text-[12px] font-normal leading-tight tracking-wide text-text-muted">amplify</p>
                <div className="flex items-start gap-0">
                  <h2 className="text-3xl font-semibold text-text-primary">Assistant</h2>
                  <span className="group ml-1 mt-0.5 flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full bg-brand-accent">
                    <AiCueSparkle size={9} spinOnParentHover className="!text-white" />
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => createSession()}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-brand-blue px-3 py-1.5 text-xs font-bold uppercase leading-none tracking-wide text-brand-blue transition-colors hover:bg-surface-selected"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                NEW CONVERSATION
              </button>
            </div>

            {/* Search */}
            <div className="shrink-0 px-5 pt-3 pb-1">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full rounded-lg border border-border-soft bg-white py-1.5 pl-8 pr-3 text-[13px] text-text-primary outline-none placeholder:text-[#b7bbc2] focus:border-brand-blue"
                />
              </div>
            </div>

            {/* Session list */}
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-3">
              {pinnedSessions.length > 0 && (
                <div className="mb-3">
                  <div className="px-2.5 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                    Pinned
                  </div>
                  <div className="space-y-0.5">
                    {pinnedSessions.map((session) => renderSessionRow(session))}
                  </div>
                </div>
              )}
              {recentSessions.length > 0 && (
                <div>
                  <div className="px-2.5 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                    Recent
                  </div>
                  <div className="space-y-0.5">
                    {recentSessions.map((session) => renderSessionRow(session))}
                  </div>
                </div>
              )}
              {filtered.length === 0 && (
                <div className="px-3 py-6 text-center text-[13px] text-text-muted">
                  {search ? 'No matching conversations' : 'No conversations yet'}
                </div>
              )}
            </div>

            <SidePanelResizeStrip isResizing={isResizing} onResizePointerDown={() => setIsResizing(true)} />
          </>
        ) : null}
      </aside>
      <SidePanelToggle
        open={sidePanelOpen}
        panelWidth={panelWidth}
        isResizing={isResizing}
        onToggle={() => {
          setIsResizing(false);
          setSidePanelOpen((prev) => !prev);
        }}
        ariaLabelOpen="Open AI panel"
        ariaLabelClose="Close AI panel"
      />

      {/* ─── Chat area ─── */}
      <div className="relative z-0 min-w-0 flex-1 overflow-hidden">
        <div className="flex h-full min-h-0 min-w-0 flex-col bg-surface-primary">
          {/* Top bar */}
          <div className="flex shrink-0 items-center gap-3 border-b border-[#e8eaed] bg-surface-primary px-6 py-3">
            <span className="min-w-0 truncate text-[14px] font-semibold text-text-heading">{sessionTitle}</span>
            {activeSession && activeSession.messages.length > 0 && (
              <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-text-muted">
                {Math.ceil(activeSession.messages.length / 2)} messages
              </span>
            )}
            {activeSession?.visitedContexts && activeSession.visitedContexts.length > 0 ? (
              <div className="ml-auto flex min-w-0 items-center gap-1.5">
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  Contexts
                </span>
                <div className="flex min-w-0 items-center gap-1 overflow-hidden">
                  {activeSession.visitedContexts.slice(0, 6).map((ctx) => {
                    const Icon = ctx.icon;
                    return (
                      <button
                        key={ctx.id}
                        type="button"
                        onClick={() => {
                          if (ctx.href && ctx.href !== '#') {
                            setIsOpen(true);
                            navigate(ctx.href);
                          }
                        }}
                        title={`Open ${ctx.crumbs.join(' › ')}`}
                        className="inline-flex max-w-[160px] shrink-0 items-center gap-1 rounded-full border border-[#e5e7eb] bg-white px-2 py-0.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-brand-blue hover:text-brand-blue"
                      >
                        <Icon className="h-2.5 w-2.5 text-text-muted" strokeWidth={1.75} />
                        <span className="truncate">{ctx.label}</span>
                      </button>
                    );
                  })}
                  {activeSession.visitedContexts.length > 6 ? (
                    <span className="shrink-0 text-[11px] text-text-muted">
                      +{activeSession.visitedContexts.length - 6}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <AiCopilotDock
            layout="panel"
            data={{ id: 'GLOBAL-WORKSPACE' }}
            messages={activeMessages}
            onSendMessage={sendMessage}
            aiPanelTab="workspace"
          />
        </div>
      </div>
    </div>
  );
}
