import { useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router';
import type { ChatTurn } from '../components/AiCopilotFooter';
import { useCopilot } from '../contexts/CopilotContext';
import { useLiveContext } from '../contexts/LiveContextProvider';
import {
  buildCaseCopilotBriefSnapshot,
  buildCaseCopilotBriefTurn,
} from '../domain/buildCaseCopilotBrief';
import {
  extractCaseIdFromLiveContext,
  extractCaseIdFromPath,
} from '../domain/extractCaseIdFromContext';
import { resolveCaseCopilotBriefInput } from '../domain/resolveCaseCopilotBriefInput';
import { clearCaseBriefIntroPlayed } from './useCaseBriefIntroSequence';
import type { CaseAnatomySettings } from '../domain/dataArchitecture';
import type { SystemDataset } from '../data/multi-case-dataset';

type UseCaseContextBriefingOptions = {
  greetingName: string;
  dataset: SystemDataset;
  anatomy?: CaseAnatomySettings;
  enabledObjectDomains?: string[];
  legacyMockOverlayEnabled?: boolean;
  /** When true, inject / refresh briefing turns for empty or brief-only sessions. */
  enabled?: boolean;
};

function isCaseBriefOnly(messages: ChatTurn[]): boolean {
  return messages.length === 1 && messages[0]?.artifact?.kind === 'case-brief';
}

export function useCaseContextBriefing(options: UseCaseContextBriefingOptions) {
  const { pathname, hash } = useLocation();
  const { current: liveContext } = useLiveContext();
  const {
    activeSessionId,
    sessions,
    injectBriefingIfEmpty,
    prependCaseBriefing,
    replaceCaseBriefing,
  } = useCopilot();

  const hashParams = useMemo(
    () => new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash),
    [hash],
  );

  const caseId = useMemo(() => {
    return extractCaseIdFromLiveContext(liveContext) ?? extractCaseIdFromPath(pathname);
  }, [liveContext, pathname]);

  const briefingInput = useMemo(() => {
    if (!caseId || options.enabled === false) return null;
    return resolveCaseCopilotBriefInput(caseId, {
      greetingName: options.greetingName,
      dataset: options.dataset,
      anatomy: options.anatomy,
      enabledObjectDomains: options.enabledObjectDomains,
      legacyMockOverlayEnabled: options.legacyMockOverlayEnabled,
      selectedTaskId: hashParams.get('task'),
      selectedRequirementId: hashParams.get('req'),
    });
  }, [
    caseId,
    hashParams,
    options.anatomy,
    options.dataset,
    options.enabled,
    options.enabledObjectDomains,
    options.greetingName,
    options.legacyMockOverlayEnabled,
  ]);

  const briefingSnapshot = useMemo(
    () => (briefingInput ? buildCaseCopilotBriefSnapshot(briefingInput) : null),
    [briefingInput],
  );

  const syncBriefing = useCallback(() => {
    if (!briefingInput || !caseId) return;
    const session = sessions.find((row) => row.id === activeSessionId);
    if (!session) return;

    const turn = buildCaseCopilotBriefTurn(briefingInput);
    const hasCaseBrief = session.messages.some(
      (row) => row.artifact?.kind === 'case-brief' && row.artifact.caseId === caseId,
    );

    if (!hasCaseBrief) {
      clearCaseBriefIntroPlayed(caseId);
      if (session.messages.length === 0) {
        injectBriefingIfEmpty(activeSessionId, turn);
      } else {
        prependCaseBriefing(activeSessionId, turn);
      }
      return;
    }

    if (isCaseBriefOnly(session.messages)) {
      const existing = session.messages[0]?.artifact;
      if (
        existing?.kind === 'case-brief' &&
        existing.caseId !== caseId &&
        !existing.focusTask?.taskOutcome
      ) {
        replaceCaseBriefing(activeSessionId, turn);
      }
    }
  }, [
    activeSessionId,
    briefingInput,
    caseId,
    injectBriefingIfEmpty,
    prependCaseBriefing,
    replaceCaseBriefing,
    sessions,
  ]);

  useEffect(() => {
    syncBriefing();
  }, [activeSessionId, briefingSnapshot, syncBriefing]);

  return {
    caseId,
    briefingInput,
    copilotContext: briefingInput?.copilotContext ?? null,
    isCaseContext: Boolean(caseId),
    syncBriefing,
  };
}
