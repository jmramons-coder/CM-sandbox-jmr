import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ChatTurn, ChatArtifact } from '../components/AiCopilotFooter';
import type { LiveContext } from './LiveContextProvider';

export type CopilotSession = {
  id: string;
  title: string;
  messages: ChatTurn[];
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  /** Deduped, most-recent-first list of contexts visited while this session was active. */
  visitedContexts?: LiveContext[];
  /**
   * When true, the title is an auto-generated placeholder and should be replaced
   * by the first user message. Becomes false as soon as the user renames the
   * session manually.
   */
  titleIsDefault?: boolean;
};

export type ContextSource = () => LiveContext | null;

type CopilotContextValue = {
  sessions: CopilotSession[];
  activeSessionId: string;
  activeMessages: ChatTurn[];
  sendMessage: (text: string) => void;
  createSession: () => string;
  switchSession: (id: string) => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, title: string) => void;
  togglePin: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  registerReplyHandler: (handler: ReplyHandler) => void;
  /** LiveContextProvider registers a getter so sendMessage can stamp the current context onto user turns. */
  registerContextSource: (source: ContextSource | null) => void;
};

export type ReplyHandler = (text: string) => {
  text: string;
  artifact?: ChatArtifact;
  followUps?: string[];
} | null;

const CopilotContext = createContext<CopilotContextValue | null>(null);

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Auto-generated placeholder title for a fresh conversation, e.g. "New chat · Apr 13". */
export function newChatDefaultTitle(d: Date = new Date()): string {
  return `New chat · ${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`;
}

const SEED_SESSIONS: CopilotSession[] = [
  {
    id: 'seed-1',
    title: 'Case priorities for this week',
    messages: [
      { id: 'seed-1-u1', role: 'user', text: 'Which of my cases need attention this week?', at: Date.now() - 86400000 * 2 },
      { id: 'seed-1-a1', role: 'assistant', text: 'Based on your current caseload, Sarah Dupont (IP44-6679812) needs immediate attention due to overdue documents, followed by Billy Bud\'s pending decision.', at: Date.now() - 86400000 * 2 + 1000 },
    ],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    pinned: true,
  },
  {
    id: 'seed-2',
    title: 'Draft escalation for provider',
    messages: [
      { id: 'seed-2-u1', role: 'user', text: 'Help me draft an escalation email for the overdue surgical report', at: Date.now() - 86400000 },
      { id: 'seed-2-a1', role: 'assistant', text: 'Here\'s a professional escalation email for Dr. Moreau regarding the outstanding surgical report and APS for Sarah Dupont\'s claim.', at: Date.now() - 86400000 + 1000 },
    ],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'seed-3',
    title: 'Marc Tremblay rehab timeline',
    messages: [
      { id: 'seed-3-u1', role: 'user', text: 'Show me Marc Tremblay\'s rehabilitation timeline', at: Date.now() - 3600000 * 5 },
      { id: 'seed-3-a1', role: 'assistant', text: 'Marc Tremblay\'s rehabilitation is progressing well. He\'s completed 3 of his scheduled PT sessions with good ROM improvement.', at: Date.now() - 3600000 * 5 + 1000 },
    ],
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 5,
  },
];

export function CopilotProvider({ children }: React.PropsWithChildren) {
  const [sessions, setSessions] = useState<CopilotSession[]>(() => {
    const initial: CopilotSession = {
      id: 'default',
      title: newChatDefaultTitle(),
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      titleIsDefault: true,
    };
    return [initial, ...SEED_SESSIONS];
  });
  const [activeSessionId, setActiveSessionId] = useState('default');
  const [isOpen, setIsOpen] = useState(false);
  const [replyHandler, setReplyHandler] = useState<ReplyHandler | null>(null);
  const contextSourceRef = useRef<ContextSource | null>(null);

  const registerReplyHandler = useCallback((handler: ReplyHandler) => {
    setReplyHandler(() => handler);
  }, []);

  const registerContextSource = useCallback((source: ContextSource | null) => {
    contextSourceRef.current = source;
  }, []);

  const activeMessages = useMemo(
    () => sessions.find((s) => s.id === activeSessionId)?.messages ?? [],
    [sessions, activeSessionId],
  );

  const sendMessage = useCallback(
    (text: string) => {
      const now = Date.now();
      const ctx = contextSourceRef.current?.() ?? undefined;
      const userTurn: ChatTurn = { id: `u-${uid()}`, role: 'user', text, at: now, context: ctx ?? undefined };

      const mock = replyHandler?.(text);
      const assistantTurn: ChatTurn = mock
        ? {
            id: `a-${uid()}`,
            role: 'assistant',
            text: mock.text,
            at: now + 1,
            artifact: mock.artifact,
            followUps: mock.followUps,
          }
        : {
            id: `a-${uid()}`,
            role: 'assistant',
            text: `I've looked across your workload for context on "${text.length > 60 ? text.slice(0, 60) + '\u2026' : text}"\n\nIn a live environment, I'd pull from your case files, task queues, document repositories, and policy systems to give you a sourced answer with clear next actions.\n\nTry one of the quick prompts below, or ask about a specific case, task, or document.`,
            at: now + 1,
            followUps: [
              'Which of my cases need attention this week, and what should I do first on each?',
              'Help me plan my work: summarize my open tasks, due dates, and suggested order to tackle them.',
            ],
          };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSessionId) return s;
          const msgs = [...s.messages, userTurn, assistantTurn];
          // Only overwrite the title when it is still the auto-generated placeholder
          // (preserves any manual rename the user did before sending the first message).
          const shouldAutoTitle = s.messages.length === 0 && s.titleIsDefault !== false;
          const title = shouldAutoTitle ? text.slice(0, 50) : s.title;
          const titleIsDefault = shouldAutoTitle ? false : s.titleIsDefault;
          let visited = s.visitedContexts ?? [];
          if (ctx && ctx.kind !== 'copilot') {
            visited = [ctx, ...visited.filter((c) => c.id !== ctx.id)].slice(0, 24);
          }
          return { ...s, messages: msgs, title, updatedAt: now, visitedContexts: visited, titleIsDefault };
        }),
      );
    },
    [activeSessionId, replyHandler],
  );

  const createSession = useCallback(() => {
    const id = `session-${uid()}`;
    const session: CopilotSession = {
      id,
      title: newChatDefaultTitle(),
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      titleIsDefault: true,
    };
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(id);
    return id;
  }, []);

  const switchSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const next = prev.filter((s) => s.id !== id);
        if (next.length === 0) {
          const fresh: CopilotSession = { id: `session-${uid()}`, title: newChatDefaultTitle(), messages: [], createdAt: Date.now(), updatedAt: Date.now(), titleIsDefault: true };
          return [fresh];
        }
        return next;
      });
      if (activeSessionId === id) {
        setSessions((prev) => {
          setActiveSessionId(prev[0]?.id ?? 'default');
          return prev;
        });
      }
    },
    [activeSessionId],
  );

  const renameSession = useCallback((id: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title: trimmed, titleIsDefault: false } : s)));
  }, []);

  const togglePin = useCallback((id: string) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s)));
  }, []);

  const value = useMemo(
    (): CopilotContextValue => ({
      sessions,
      activeSessionId,
      activeMessages,
      sendMessage,
      createSession,
      switchSession,
      deleteSession,
      renameSession,
      togglePin,
      isOpen,
      setIsOpen,
      registerReplyHandler,
      registerContextSource,
    }),
    [sessions, activeSessionId, activeMessages, sendMessage, createSession, switchSession, deleteSession, renameSession, togglePin, isOpen, registerReplyHandler, registerContextSource],
  );

  return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>;
}

export function useCopilot() {
  const ctx = useContext(CopilotContext);
  if (!ctx) throw new Error('useCopilot must be used inside CopilotProvider');
  return ctx;
}
