'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Maximize2, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { CaseOverview, CaseRequirement, Task } from '../../types';
import type { CaseBriefContent } from '../../domain/caseBrief';
import { AiCueSparkle } from '../AiCueSparkle';
import { AiCopilotDock, type CopilotExecuteAction } from '../AiCopilotFooter';
import { useActiveUser } from '../../contexts/ActiveUserContext';
import { usePlatformSettings, useResolvedSystemDataset } from '../../contexts/PlatformSettingsContext';
import { resolveCaseCopilotContext } from '../../domain/caseCopilotContext';
import {
  buildCaseCopilotBriefSnapshot,
  buildCaseCopilotBriefTurn,
} from '../../domain/buildCaseCopilotBrief';
import { buildCaseAssistantReply } from '../../domain/caseAssistantReplyBuilder';
import { buildAssistantReply } from '../../domain/assistantReplyBuilder';
import { copilotClaimContextHint } from '../../domain/claimSubTypeContent';
import {
  approveNb66RequirementGatheringPackage,
  isNb66RecommendRequirementsTask,
} from '../../data/nb66RequirementGatheringActions';
import { isEquisoftNb66GatheringDemo } from '../../data/equisoftNb66ReqGatheringOverlay';
import { isTaskCompleteActionSuccess, runTaskWorkflowAction } from '../../data/workflowActions';
import { listTasks } from '../../data/objectRepository';
import {
  applyTaskOutcomeToMessages,
  shouldReplayCaseBriefIntro,
  stripBriefRefreshTurns,
} from '../../domain/copilotSessionMessages';
import { resolveTaskForCaseContextRow } from '../../utils/caseContextualTask';
import { appToast } from '../../utils/app-toast';
import { isSemiAutoTask } from '../../utils/taskReviewProjection';
import { useCaseCopilotSessions } from '../../hooks/useCaseCopilotSessions';
import { newChatDefaultTitle } from '../../contexts/CopilotContext';
import type { OpenCaseWorkspaceObjectHandler } from '../../utils/openCaseWorkspaceObject';

type ContextualTaskRow = {
  id: string;
  task?: Task;
  taskType?: string;
  status?: string;
  aiGenerated?: boolean;
};

export type CaseCopilotPanelProps = {
  data: CaseOverview;
  caseBrief: CaseBriefContent | null;
  contextualTasks: ContextualTaskRow[];
  selectedCaseTask: Task | null;
  selectedRequirement: CaseRequirement | null;
  clientHeadline: string;
  onClose: () => void;
  onTaskActionComplete?: () => void;
  onApplyTaskAction?: (taskId: string, actionType: string) => boolean;
  onOpenCaseWorkspaceObject?: OpenCaseWorkspaceObjectHandler;
};

export function CaseCopilotPanel({
  data,
  caseBrief,
  contextualTasks,
  selectedCaseTask,
  selectedRequirement,
  clientHeadline,
  onClose,
  onTaskActionComplete,
  onApplyTaskAction,
  onOpenCaseWorkspaceObject,
}: CaseCopilotPanelProps) {
  const navigate = useNavigate();
  const { profile } = useActiveUser();
  const { dataSource, updateDataSource, settings: platformSettings } = usePlatformSettings();
  const activeDataset = useResolvedSystemDataset();

  const {
    sessions,
    activeSessionId,
    activeMessages,
    createSession,
    switchSession,
    appendTurns,
    injectBriefingIfEmpty,
    prependCaseBriefing,
    replaceCaseBriefing,
    updateSession,
    ensureStore,
  } = useCaseCopilotSessions(data.id);

  const [briefIntroReplayKey, setBriefIntroReplayKey] = useState(0);

  useEffect(() => {
    ensureStore();
  }, [ensureStore]);

  useEffect(() => {
    if (shouldReplayCaseBriefIntro(activeMessages)) {
      setBriefIntroReplayKey((key) => key + 1);
    }
  }, [activeSessionId, activeMessages]);

  const caseCopilotContext = useMemo(
    () =>
      resolveCaseCopilotContext({
        caseId: data.id,
        caseLabel: data.claimantName ?? data.primaryPartyName,
        requirements: data.requirements.map((req) => ({
          id: req.id,
          datasetRequirementId: req.datasetRequirementId,
          name: req.name,
          status: req.status,
          linkedTasks: req.linkedTasks,
          blockingImpact: req.blockingImpact,
        })),
        tasks: contextualTasks.map((row) => ({
          id: row.id,
          label: row.task?.taskType ?? row.taskType ?? row.id,
          status: row.status ?? 'Open',
          aiGenerated: row.aiGenerated ?? row.task?.aiGenerated,
        })),
        contextualTasks,
        resolveContextTask: (row) => resolveTaskForCaseContextRow(row, data),
        selectedTask: selectedCaseTask,
        selectedRequirement,
        caseBrief,
      }),
    [caseBrief, contextualTasks, data, selectedCaseTask, selectedRequirement],
  );

  const briefingInput = useMemo(
    () => ({
      greetingName: profile.name,
      caseId: data.id,
      clientHeadline,
      aiSummary: data.generalInformation?.aiSummary,
      requirements: data.requirements.map((req) => ({
        id: req.id,
        datasetRequirementId: req.datasetRequirementId,
        name: req.name,
        status: req.status,
        linkedTasks: req.linkedTasks,
        blockingImpact: req.blockingImpact,
      })),
      tasks: contextualTasks.map((row) => ({
        id: row.id,
        label: row.task?.taskType ?? row.taskType ?? row.id,
        status: row.status ?? 'Open',
        aiGenerated: row.aiGenerated ?? row.task?.aiGenerated,
      })),
      copilotContext: caseCopilotContext,
    }),
    [caseCopilotContext, clientHeadline, contextualTasks, data, profile.name],
  );

  const ensureCaseBriefing = useCallback(
    (sessionId: string) => {
      const turn = buildCaseCopilotBriefTurn(briefingInput);
      const session = store.sessions.find((row) => row.id === sessionId);
      if (!session) return;
      const hasBrief = session.messages.some((row) => row.artifact?.kind === 'case-brief');
      if (session.messages.length === 0) {
        injectBriefingIfEmpty(sessionId, turn);
        return;
      }
      if (!hasBrief) {
        prependCaseBriefing(sessionId, turn);
        return;
      }
      if (session.messages.length === 1 && session.messages[0]?.artifact?.kind === 'case-brief') {
        const existing = session.messages[0].artifact;
        if (existing.kind === 'case-brief' && !existing.focusTask?.taskOutcome) {
          replaceCaseBriefing(sessionId, turn);
        }
      }
    },
    [briefingInput, injectBriefingIfEmpty, prependCaseBriefing, replaceCaseBriefing, store.sessions],
  );

  useEffect(() => {
    ensureCaseBriefing(activeSessionId);
  }, [activeSessionId, briefingSnapshotKey(briefingInput), ensureCaseBriefing]);

  const applyCopilotTaskAction = useCallback(
    (taskId: string, actionType: string): string | null => {
      const result = runTaskWorkflowAction(dataSource.activeDatasetId, taskId, actionType, {
        name: profile.name,
      });
      if (!result) {
        return onApplyTaskAction?.(taskId, actionType) ? dataSource.activeDatasetId : null;
      }
      if (actionType === 'complete' && !isTaskCompleteActionSuccess(result, taskId)) {
        return null;
      }
      if (actionType !== 'complete' && !result.record.task) {
        return null;
      }
      updateDataSource({ activeDatasetId: result.datasetId });
      onTaskActionComplete?.();
      return result.datasetId;
    },
    [dataSource.activeDatasetId, onTaskActionComplete, onApplyTaskAction, profile.name, updateDataSource],
  );

  const deliverReply = useCallback(
    (userText: string, replyPrompt: string, options?: { skipTaskAction?: boolean }) => {
      updateSession(activeSessionId, (session) => ({
        ...session,
        messages: stripBriefRefreshTurns(session.messages),
      }));

      const now = Date.now();
      appendTurns(activeSessionId, [{ id: `u-${now}`, role: 'user', text: userText, at: now }]);

      window.setTimeout(() => {
        const hint = copilotClaimContextHint(data.caseKind, data.claimSubType);
        const caseReply = buildCaseAssistantReply(activeDataset, replyPrompt, caseCopilotContext);
        const datasetReply =
          caseReply ?? buildAssistantReply(activeDataset, replyPrompt, `case:${data.id}`);
        const body =
          datasetReply?.text ??
          `I can help with tasks, requirements, and next steps on case ${data.id}.`;

        if (!options?.skipTaskAction && caseReply?.sideEffect?.kind === 'task_action') {
          const refreshedDatasetId = applyCopilotTaskAction(
            caseReply.sideEffect.taskId,
            caseReply.sideEffect.actionType,
          );
          if (refreshedDatasetId) {
            const outcome =
              caseReply.sideEffect.actionType === 'complete' ? 'accepted' : 'amended';
            updateSession(activeSessionId, (session) => ({
              ...session,
              messages: applyTaskOutcomeToMessages(session.messages, caseReply.sideEffect!.taskId, outcome),
            }));
            const taskLabel =
              caseCopilotContext.focus.kind === 'task'
                ? caseCopilotContext.focus.task.taskType
                : caseReply.sideEffect.taskId;
            appToast.success(
              caseReply.sideEffect.actionType === 'complete'
                ? `Task ${taskLabel} approved`
                : `Amend recorded on ${taskLabel}`,
            );
          }
        }

        const replyText = hint ? `${hint}\n\n${body}` : body;
        appendTurns(activeSessionId, [
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            text: replyText,
            at: Date.now() + 1,
            artifact: datasetReply?.artifact,
            followUps: datasetReply?.followUps,
            revealIntro: datasetReply?.artifact?.kind !== 'case-brief',
          },
        ]);

        updateSession(activeSessionId, (session) => {
          const shouldAutoTitle = session.messages.length <= 1 && session.titleIsDefault !== false;
          return shouldAutoTitle
            ? { ...session, title: userText.slice(0, 50), titleIsDefault: false }
            : session;
        });

      }, 420);
    },
    [
      activeDataset,
      activeSessionId,
      appendTurns,
      applyCopilotTaskAction,
      caseCopilotContext,
      data.caseKind,
      data.claimSubType,
      data.id,
      updateSession,
    ],
  );

  const handleSend = useCallback((text: string) => deliverReply(text, text), [deliverReply]);

  const handleExecute = useCallback(
    (action: CopilotExecuteAction) => {
      if (action.kind === 'apply_requirement_suggestions') {
        if (!isEquisoftNb66GatheringDemo(action.caseId)) {
          appToast.error('Requirement suggestions are only available for the NB66 Equisoft demo case.');
          return;
        }
        const result = approveNb66RequirementGatheringPackage(
          dataSource.activeDatasetId,
          action.caseId,
          action.taskId,
          action.requirementIds,
          { name: profile.name },
          platformSettings.activeDemoConfigurationId,
        );
        if (!result) {
          appToast.error('Could not approve requirement package. Try again.');
          return;
        }
        updateDataSource({ activeDatasetId: result.datasetId });
        onTaskActionComplete?.();
        const added = result.addedCount;
        appToast.success(
          added === 1
            ? `1 requirement added to ${action.caseId}`
            : `${added} requirements added to ${action.caseId}`,
        );
        deliverReply(
          `Approve ${added} selected requirement${added === 1 ? '' : 's'}`,
          `Added ${added} requirements to case ${data.id}.`,
          { skipTaskAction: true },
        );
        return;
      }

      if (
        action.actionType === 'complete' &&
        isNb66RecommendRequirementsTask(action.taskId)
      ) {
        deliverReply(
          'Accept AI recommend-requirements task',
          `Approve AI recommend-requirements on case ${data.id}.`,
          { skipTaskAction: true },
        );
        return;
      }

      const taskLabel =
        caseCopilotContext.focus.kind === 'task'
          ? caseCopilotContext.focus.task.taskType
          : action.taskId;
      const outcome = action.actionType === 'complete' ? 'accepted' : 'amended';
      const refreshedDatasetId = applyCopilotTaskAction(action.taskId, action.actionType);
      if (!refreshedDatasetId) {
        appToast.error(
          action.actionType === 'complete'
            ? `Could not approve ${taskLabel}. Try again.`
            : `Could not record amend on ${taskLabel}. Try again.`,
        );
        return;
      }
      updateSession(activeSessionId, (session) => ({
        ...session,
        messages: applyTaskOutcomeToMessages(session.messages, action.taskId, outcome),
      }));
      appToast.success(
        action.actionType === 'complete'
          ? `Task ${taskLabel} approved`
          : `Amend recorded on ${taskLabel}`,
      );
      const userText = action.actionType === 'complete' ? `Accept ${taskLabel}` : `Amend ${taskLabel}`;
      const replyPrompt =
        action.actionType === 'complete'
          ? `Approve ${taskLabel} on case ${data.id} based on the AI recommendation.`
          : `I want to amend ${taskLabel} on case ${data.id}. What should I change before approving?`;
      deliverReply(userText, replyPrompt, { skipTaskAction: true });
    },
    [
      activeSessionId,
      applyCopilotTaskAction,
      caseCopilotContext,
      data.id,
      dataSource.activeDatasetId,
      deliverReply,
      onTaskActionComplete,
      updateDataSource,
      updateSession,
    ],
  );

  const handleNewChat = useCallback(() => {
    const id = createSession();
    setBriefIntroReplayKey((key) => key + 1);
    window.setTimeout(() => ensureCaseBriefing(id), 0);
  }, [createSession, ensureCaseBriefing]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-border-default px-4 py-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <AiCueSparkle size={16} className="!text-brand-accent" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">Assistant</p>
              <p className="truncate text-[14px] font-semibold text-text-primary">{data.id}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={handleNewChat}
              className="inline-flex items-center gap-1 rounded-full border border-border-default px-2.5 py-1 text-[11px] font-semibold text-text-secondary hover:border-brand-blue hover:text-brand-blue"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/copilot');
              }}
              className="rounded-full p-1.5 text-text-secondary hover:bg-surface-muted"
              title="Open full page"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button type="button" onClick={onClose} className="rounded-full p-1.5 text-text-secondary hover:bg-surface-muted">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sessions.map((session) => {
            const active = session.id === activeSessionId;
            return (
              <button
                key={session.id}
                type="button"
                onClick={() => switchSession(session.id)}
                className={`shrink-0 rounded-t-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  active
                    ? 'bg-surface-primary text-text-primary shadow-[inset_0_-2px_0_0_var(--color-brand-blue)]'
                    : 'text-text-muted hover:bg-surface-muted hover:text-text-secondary'
                }`}
              >
                {session.titleIsDefault !== false && session.messages.length === 0
                  ? newChatDefaultTitle(new Date(session.createdAt))
                  : session.title}
              </button>
            );
          })}
        </div>
      </div>

      <AiCopilotDock
        layout="panel"
        data={{ id: data.id }}
        messages={activeMessages}
        onSendMessage={handleSend}
        onExecuteAction={handleExecute}
        aiPanelTab="workspace"
        hideEmptyState
        composerPlaceholder="Ask about this case, a task, or a requirement…"
        onOpenCaseObject={onOpenCaseWorkspaceObject}
        caseBriefIntroReplayKey={briefIntroReplayKey}
      />
    </div>
  );
}

function briefingSnapshotKey(input: Parameters<typeof buildCaseCopilotBriefSnapshot>[0]) {
  return buildCaseCopilotBriefSnapshot(input);
}
