import { useCallback, useMemo, useState } from 'react';
import type { ChatTurn } from '../components/AiCopilotFooter';
import { newChatDefaultTitle, type CopilotSession } from '../contexts/CopilotContext';
import { clearCaseBriefIntroPlayed } from './useCaseBriefIntroSequence';

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export type CaseCopilotCaseStore = {
  sessions: CopilotSession[];
  activeSessionId: string;
};

function createEmptySession(): CopilotSession {
  const id = `case-session-${uid()}`;
  return {
    id,
    title: newChatDefaultTitle(),
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    titleIsDefault: true,
  };
}

function createInitialStore(): CaseCopilotCaseStore {
  const session = createEmptySession();
  return { sessions: [session], activeSessionId: session.id };
}

export function useCaseCopilotSessions(caseId: string) {
  const [stores, setStores] = useState<Record<string, CaseCopilotCaseStore>>({});

  const ensureStore = useCallback(() => {
    setStores((prev) => {
      if (prev[caseId]) return prev;
      return { ...prev, [caseId]: createInitialStore() };
    });
  }, [caseId]);

  const store = stores[caseId] ?? createInitialStore();

  const persistStore = useCallback(
    (next: CaseCopilotCaseStore) => {
      setStores((prev) => ({ ...prev, [caseId]: next }));
    },
    [caseId],
  );

  const activeSession = useMemo(
    () => store.sessions.find((s) => s.id === store.activeSessionId) ?? store.sessions[0],
    [store],
  );

  const activeMessages = activeSession?.messages ?? [];

  const createSession = useCallback(() => {
    const session = createEmptySession();
    persistStore({
      sessions: [session, ...store.sessions],
      activeSessionId: session.id,
    });
    return session.id;
  }, [persistStore, store.sessions]);

  const switchSession = useCallback(
    (sessionId: string) => {
      if (!store.sessions.some((s) => s.id === sessionId)) return;
      persistStore({ ...store, activeSessionId: sessionId });
    },
    [persistStore, store],
  );

  const deleteSession = useCallback(
    (sessionId: string) => {
      const remaining = store.sessions.filter((s) => s.id !== sessionId);
      if (!remaining.length) {
        const fresh = createEmptySession();
        persistStore({ sessions: [fresh], activeSessionId: fresh.id });
        return fresh.id;
      }
      persistStore({
        sessions: remaining,
        activeSessionId:
          store.activeSessionId === sessionId ? remaining[0].id : store.activeSessionId,
      });
      return remaining[0].id;
    },
    [persistStore, store],
  );

  const updateSession = useCallback(
    (sessionId: string, updater: (session: CopilotSession) => CopilotSession) => {
      persistStore({
        ...store,
        sessions: store.sessions.map((s) => (s.id === sessionId ? updater(s) : s)),
      });
    },
    [persistStore, store],
  );

  const appendTurns = useCallback(
    (sessionId: string, turns: ChatTurn[]) => {
      updateSession(sessionId, (session) => ({
        ...session,
        messages: [...session.messages, ...turns],
        updatedAt: Date.now(),
      }));
    },
    [updateSession],
  );

  const injectBriefingIfEmpty = useCallback(
    (sessionId: string, briefingTurn: ChatTurn) => {
      const target = store.sessions.find((s) => s.id === sessionId);
      if (!target || target.messages.length > 0) return false;
      if (briefingTurn.artifact?.kind === 'case-brief') {
        clearCaseBriefIntroPlayed(briefingTurn.artifact.caseId);
      }
      updateSession(sessionId, (session) => ({
        ...session,
        messages: [briefingTurn],
        updatedAt: Date.now(),
      }));
      return true;
    },
    [store.sessions, updateSession],
  );

  const prependCaseBriefing = useCallback(
    (sessionId: string, briefingTurn: ChatTurn) => {
      if (briefingTurn.artifact?.kind !== 'case-brief') return false;
      const target = store.sessions.find((s) => s.id === sessionId);
      if (!target) return false;
      const briefCaseId = briefingTurn.artifact.caseId;
      const hasBrief = target.messages.some(
        (row) => row.artifact?.kind === 'case-brief' && row.artifact.caseId === briefCaseId,
      );
      if (hasBrief) return false;
      clearCaseBriefIntroPlayed(briefCaseId);
      updateSession(sessionId, (session) => ({
        ...session,
        messages: [briefingTurn, ...session.messages],
        updatedAt: Date.now(),
      }));
      return true;
    },
    [store.sessions, updateSession],
  );

  const replaceCaseBriefing = useCallback(
    (sessionId: string, briefingTurn: ChatTurn) => {
      const target = store.sessions.find((s) => s.id === sessionId);
      if (
        !target
        || target.messages.length !== 1
        || target.messages[0]?.artifact?.kind !== 'case-brief'
      ) {
        return false;
      }
      if (briefingTurn.artifact?.kind === 'case-brief') {
        clearCaseBriefIntroPlayed(briefingTurn.artifact.caseId);
      }
      updateSession(sessionId, (session) => ({
        ...session,
        messages: [briefingTurn],
        updatedAt: Date.now(),
      }));
      return true;
    },
    [store.sessions, updateSession],
  );

  return {
    sessions: store.sessions,
    activeSessionId: store.activeSessionId,
    activeSession,
    activeMessages,
    createSession,
    switchSession,
    deleteSession,
    appendTurns,
    injectBriefingIfEmpty,
    prependCaseBriefing,
    replaceCaseBriefing,
    updateSession,
    ensureStore,
  };
}
