import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ChatTurn, ChatArtifact } from '../components/AiCopilotFooter';
import type { LiveContext } from './LiveContextProvider';
import {
  applyTaskOutcomeToMessages,
  stripBriefRefreshTurns,
  type CopilotTaskOutcome,
} from '../domain/copilotSessionMessages';
import { clearCaseBriefIntroPlayed } from '../hooks/useCaseBriefIntroSequence';

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
  registerSideEffectHandler: (handler: CopilotSideEffectHandler | null) => void;
  /** LiveContextProvider registers a getter so sendMessage can stamp the current context onto user turns. */
  registerContextSource: (source: ContextSource | null) => void;
  injectBriefingIfEmpty: (sessionId: string, turn: ChatTurn) => boolean;
  replaceCaseBriefing: (sessionId: string, turn: ChatTurn) => boolean;
  appendTurns: (sessionId: string, turns: ChatTurn[]) => void;
  patchSessionForTaskOutcome: (
    sessionId: string,
    taskId: string,
    outcome: CopilotTaskOutcome,
    alternateTaskIds?: string[],
  ) => void;
};

export type CopilotTaskSideEffect = {
  kind: 'task_action';
  taskId: string;
  actionType: 'complete' | 'request_info';
};

export type ReplyHandlerResult = {
  text: string;
  artifact?: ChatArtifact;
  followUps?: string[];
  sideEffect?: CopilotTaskSideEffect;
};

export type ReplyHandler = (
  text: string,
  context?: LiveContext,
) => ReplyHandlerResult | null;

export type CopilotSideEffectHandler = (effect: CopilotTaskSideEffect) => boolean;

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
      {
        id: 'seed-1-u1',
        role: 'user',
        text: 'Which of my cases need attention this week, and what should I do first on each?',
        at: Date.now() - 86400000 * 2,
      },
      {
        id: 'seed-1-a1',
        role: 'assistant',
        text:
          'Priority order: **CD26-5546112 · Billy Bud** (WOP decision, SLA breached), then **CD44-6679812 · Marie Dupont** (death benefit sign-off), then **NB66-7622343 · Marc Tremblay** (APS outstanding), then **NB98-9989870 · Elena Rossi** (tele-interview).',
        at: Date.now() - 86400000 * 2 + 1000,
      },
    ],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    pinned: true,
  },
  {
    id: 'seed-2',
    title: 'Dupont contestability sign-off',
    messages: [
      {
        id: 'seed-2-u1',
        role: 'user',
        text: 'Explain the contestability review for this case.',
        at: Date.now() - 86400000,
      },
      {
        id: 'seed-2-a1',
        role: 'assistant',
        text:
          'MIB vs application comparison for **CD44-6679812** shows no material misrepresentation. APS and toxicology support cause of death — recommend $500,000 ACH to Marie Dupont after human sign-off.',
        at: Date.now() - 86400000 + 1000,
      },
    ],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'seed-3',
    title: 'Marc Tremblay underwriting timeline',
    messages: [
      {
        id: 'seed-3-u1',
        role: 'user',
        text: "Show me Marc Tremblay's rehabilitation timeline",
        at: Date.now() - 3600000 * 5,
      },
      {
        id: 'seed-3-a1',
        role: 'assistant',
        text:
          'Marc Tremblay (**NB66-7622343**) is on a new-business underwriting track: MIB prior decline blocks accelerated UW; paramedical exam May 19; APS still outstanding before rated offer.',
        at: Date.now() - 3600000 * 5 + 1000,
      },
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
  const sideEffectHandlerRef = useRef<CopilotSideEffectHandler | null>(null);
  const contextSourceRef = useRef<ContextSource | null>(null);

  const registerReplyHandler = useCallback((handler: ReplyHandler) => {
    setReplyHandler(() => handler);
  }, []);

  const registerContextSource = useCallback((source: ContextSource | null) => {
    contextSourceRef.current = source;
  }, []);

  const registerSideEffectHandler = useCallback((handler: CopilotSideEffectHandler | null) => {
    sideEffectHandlerRef.current = handler;
  }, []);

  const updateSession = useCallback(
    (sessionId: string, updater: (session: CopilotSession) => CopilotSession) => {
      setSessions((prev) =>
        prev.map((session) => (session.id === sessionId ? updater(session) : session)),
      );
    },
    [],
  );

  const appendTurns = useCallback(
    (sessionId: string, turns: ChatTurn[]) => {
      if (!turns.length) return;
      updateSession(sessionId, (session) => ({
        ...session,
        messages: [...session.messages, ...turns],
        updatedAt: Date.now(),
      }));
    },
    [updateSession],
  );

  const patchSessionForTaskOutcome = useCallback(
    (sessionId: string, taskId: string, outcome: CopilotTaskOutcome, alternateTaskIds: string[] = []) => {
      updateSession(sessionId, (session) => ({
        ...session,
        messages: applyTaskOutcomeToMessages(session.messages, taskId, outcome, alternateTaskIds),
        updatedAt: Date.now(),
      }));
    },
    [updateSession],
  );

  const injectBriefingIfEmpty = useCallback(
    (sessionId: string, turn: ChatTurn) => {
      let injected = false;
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== sessionId || session.messages.length > 0) return session;
          injected = true;
          if (turn.artifact?.kind === 'case-brief') {
            clearCaseBriefIntroPlayed(turn.artifact.caseId);
          }
          return {
            ...session,
            messages: [turn],
            updatedAt: Date.now(),
          };
        }),
      );
      return injected;
    },
    [],
  );

  const prependCaseBriefing = useCallback((sessionId: string, turn: ChatTurn) => {
    if (turn.artifact?.kind !== 'case-brief') return false;
    let prepended = false;
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;
        const briefCaseId = turn.artifact.caseId;
        const hasBrief = session.messages.some(
          (row) => row.artifact?.kind === 'case-brief' && row.artifact.caseId === briefCaseId,
        );
        if (hasBrief) return session;
        prepended = true;
        clearCaseBriefIntroPlayed(turn.artifact.caseId);
        return {
          ...session,
          messages: [turn, ...session.messages],
          updatedAt: Date.now(),
        };
      }),
    );
    return prepended;
  }, []);

  const replaceCaseBriefing = useCallback((sessionId: string, turn: ChatTurn) => {
    let replaced = false;
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;
        const onlyBrief =
          session.messages.length === 1 && session.messages[0]?.artifact?.kind === 'case-brief';
        if (!onlyBrief) return session;
        replaced = true;
        if (turn.artifact?.kind === 'case-brief') {
          clearCaseBriefIntroPlayed(turn.artifact.caseId);
        }
        return {
          ...session,
          messages: [turn],
          updatedAt: Date.now(),
        };
      }),
    );
    return replaced;
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

      const mock = replyHandler?.(text, ctx ?? undefined);
      if (mock?.sideEffect) {
        sideEffectHandlerRef.current?.(mock.sideEffect);
      }
      const assistantTurn: ChatTurn = mock
        ? {
            id: `a-${uid()}`,
            role: 'assistant',
            text: mock.text,
            at: now + 1,
            artifact: mock.artifact,
            followUps: mock.followUps,
            revealIntro: mock.artifact?.kind !== 'case-brief',
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
          const cleaned = stripBriefRefreshTurns(s.messages);
          const msgs = [...cleaned, userTurn, assistantTurn];
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
      registerSideEffectHandler,
      registerContextSource,
      injectBriefingIfEmpty,
      prependCaseBriefing,
      replaceCaseBriefing,
      appendTurns,
      patchSessionForTaskOutcome,
    }),
    [
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
      registerReplyHandler,
      registerSideEffectHandler,
      registerContextSource,
      injectBriefingIfEmpty,
      prependCaseBriefing,
      replaceCaseBriefing,
      appendTurns,
      patchSessionForTaskOutcome,
    ],
  );

  return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>;
}

export function useCopilot() {
  const ctx = useContext(CopilotContext);
  if (!ctx) throw new Error('useCopilot must be used inside CopilotProvider');
  return ctx;
}
