'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router';
import { ClipboardCheck, ClipboardList, FileText, Gauge, Maximize2, MessageSquare, Pencil, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  AiCopilotDock,
  type CopilotExecuteAction,
} from '../AiCopilotFooter';
import { DynamicDocumentSidePanel } from '../DynamicDocumentSidePanel';
import { RequirementContextBody } from '../RequirementContextBody';
import { CaseScoringSidePanel } from '../cases/CaseScoringSidePanel';
import { TaskDetailEmbeddedView } from '../TaskDetailSidePanel';
import { MiniAiSourceBadge } from '../ModuleCellHelpers';
import { WorkspaceObjectSidePanel, type WorkspacePanelContext } from '../WorkspaceObjectSidePanel';
import { documentToCaseContextRow, type CaseDocumentContextRow } from '../cases/caseViewTypes';
import { APP_EVENTS, STORAGE_KEYS } from '../../constants/storage-keys';
import {
  approveNb66RequirementGatheringPackage,
  isNb66RecommendRequirementsTask,
} from '../../data/nb66RequirementGatheringActions';
import { isTaskCompleteActionSuccess, runTaskWorkflowAction } from '../../data/workflowActions';
import { filterDatasetBySettings, getSystemDataset, listDocuments, listTasks } from '../../data/objectRepository';
import { getCaseOverview } from '../../data/mock-cases';
import type { CaseRequirement, Task } from '../../types';
import type { UnderwritingScoring } from '../../domain/objectRefs';
import { buildCaseDocumentPanelData } from '../../utils/buildCaseDocumentPanelData';
import {
  setGlobalCopilotCaseOwner,
  type GlobalCopilotTaskOutcomeDetail,
} from '../../utils/caseGlobalCopilotFocus';
import {
  buildCaseWorkspaceObjectHref,
  buildCaseWorkspaceReturnHref,
  openCaseWorkspaceObject,
  type CaseWorkspaceObjectFocus,
  type OpenCaseWorkspaceObjectHandler,
} from '../../utils/openCaseWorkspaceObject';
import { appToast } from '../../utils/app-toast';
import { isSemiAutoTask } from '../../utils/taskReviewProjection';
import { useCopilot } from '../../contexts/CopilotContext';
import { taskOutcomeAlternateIds } from '../../domain/copilotSessionMessages';
import { matchesCaseWorkspaceInteraction } from '../../utils/caseWorkspaceSurface';
import {
  documentPanelContextId,
  pushWorkspacePanelContext,
  requirementPanelContextId,
  taskPanelContextId,
} from '../../utils/workspacePanelContextUtils';
import {
  scoringPanelContextId,
  usesScoringSidePanel,
} from '../../utils/underwritingScoringPresentation';
import { useDataSourceSettings, usePlatformSettings } from '../../contexts/PlatformSettingsContext';
import { useActiveUser } from '../../contexts/ActiveUserContext';
import type { ChatTurn } from '../AiCopilotFooter';

const ASSISTANT_CONTEXT_ID = 'assistant';

function InlineTitleEditor({
  value,
  editing,
  onEditingChange,
  onCommit,
}: {
  value: string;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  onCommit: (next: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    const next = draft.trim();
    onEditingChange(false);
    if (next && next !== value) onCommit(next);
    else setDraft(value);
  };

  if (editing) {
    const ch = Math.min(Math.max(draft.length + 1, 10), 42);
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            setDraft(value);
            onEditingChange(false);
          }
        }}
        style={{ width: `${ch}ch` }}
        className="inline-block max-w-full min-w-0 rounded-md border border-brand-blue/40 bg-white px-1.5 py-0.5 text-[15px] font-semibold leading-tight tracking-tight text-text-heading outline-none focus:border-brand-blue"
      />
    );
  }

  return (
    <span
      className="inline-block min-w-0 max-w-full truncate align-middle text-[15px] font-semibold leading-tight tracking-tight text-text-heading"
      title={value}
    >
      {value}
    </span>
  );
}

type GlobalAiCopilotSidePanelProps = {
  briefingCaseId: string | null;
  isCaseContext: boolean;
  panelWidth: number;
  isResizing: boolean;
  onPanelWidthChange: (width: number) => void;
  onResizeStart: () => void;
  onClose: () => void;
  activeSessionTitle: string;
  activeSessionId: string;
  onRenameSession: (sessionId: string, title: string) => void;
  onCreateSession: () => void;
  globalContextId: string;
  messages: ChatTurn[];
  onSendMessage: (text: string) => void;
  onExecuteAction?: (action: CopilotExecuteAction) => void;
  caseBriefIntroReplayKey?: number;
};

export function GlobalAiCopilotSidePanel({
  briefingCaseId,
  isCaseContext,
  panelWidth,
  isResizing,
  onPanelWidthChange,
  onResizeStart,
  onClose,
  activeSessionTitle,
  activeSessionId,
  onRenameSession,
  onCreateSession,
  globalContextId,
  messages,
  onSendMessage,
  onExecuteAction,
  caseBriefIntroReplayKey = 0,
}: GlobalAiCopilotSidePanelProps) {
  const { t } = useTranslation('nav');
  const navigate = useNavigate();
  const [renamingConversation, setRenamingConversation] = useState(false);
  const [panelContexts, setPanelContexts] = useState<WorkspacePanelContext[]>([]);
  const [activeContextId, setActiveContextId] = useState(ASSISTANT_CONTEXT_ID);
  const [panelTask, setPanelTask] = useState<Task | null>(null);
  const [panelRequirement, setPanelRequirement] = useState<CaseRequirement | null>(null);
  const [panelDocument, setPanelDocument] = useState<CaseDocumentContextRow | null>(null);
  const [scoringDraft, setScoringDraft] = useState<UnderwritingScoring | undefined>(undefined);
  const [activeDocumentInsightId, setActiveDocumentInsightId] = useState('');
  const [assistantViewLocked, setAssistantViewLocked] = useState(false);
  const suppressCopilotObjectFocusRef = useRef(false);

  const dataSource = useDataSourceSettings();
  const { settings: platformSettings, updateDataSource } = usePlatformSettings();
  const { patchSessionForTaskOutcome } = useCopilot();
  const activeDemoConfigurationId = platformSettings.activeDemoConfigurationId;
  const { profile } = useActiveUser();
  const activeDataset = useMemo(
    () => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource),
    [dataSource],
  );

  const caseOverview = useMemo(() => {
    if (!briefingCaseId) return null;
    return getCaseOverview(briefingCaseId, activeDataset, dataSource.legacyMockOverlayEnabled, {
      anatomy: platformSettings.anatomy,
      enabledObjectDomains: dataSource.enabledObjectDomains,
    });
  }, [
    activeDataset,
    briefingCaseId,
    dataSource.enabledObjectDomains,
    dataSource.legacyMockOverlayEnabled,
    platformSettings.anatomy,
  ]);

  useEffect(() => {
    setScoringDraft(caseOverview?.underwritingScoring);
  }, [briefingCaseId, caseOverview?.underwritingScoring]);

  const scoringSidePanelEnabled = usesScoringSidePanel(scoringDraft);
  const scoringPanelContext = useMemo((): WorkspacePanelContext | null => {
    if (!briefingCaseId || !scoringSidePanelEnabled || !scoringDraft) return null;
    return {
      id: scoringPanelContextId(briefingCaseId),
      label: 'Scoring',
      icon: Gauge,
      clearable: false,
    };
  }, [briefingCaseId, scoringDraft, scoringSidePanelEnabled]);

  const panelContextsWithScoring = useMemo(() => {
    if (!scoringPanelContext || panelContexts.length === 0) return panelContexts;
    if (panelContexts.some((ctx) => ctx.id === scoringPanelContext.id)) return panelContexts;
    return [...panelContexts, scoringPanelContext];
  }, [panelContexts, scoringPanelContext]);

  const resetPanelStack = useCallback(() => {
    setAssistantViewLocked(false);
    setPanelContexts([
      {
        id: ASSISTANT_CONTEXT_ID,
        label: activeSessionTitle.slice(0, 28),
        icon: MessageSquare,
        clearable: false,
      },
    ]);
    setActiveContextId(ASSISTANT_CONTEXT_ID);
    setPanelTask(null);
    setPanelRequirement(null);
    setPanelDocument(null);
  }, [activeSessionTitle]);

  useEffect(() => {
    setPanelContexts([
      {
        id: ASSISTANT_CONTEXT_ID,
        label: activeSessionTitle.slice(0, 28),
        icon: MessageSquare,
        clearable: false,
      },
    ]);
    setActiveContextId(ASSISTANT_CONTEXT_ID);
    setPanelTask(null);
    setPanelRequirement(null);
    setPanelDocument(null);
    // Intentionally mount-only: panel remounts when the global AI drawer opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setGlobalCopilotCaseOwner(briefingCaseId);
    return () => setGlobalCopilotCaseOwner(null);
  }, [briefingCaseId]);

  useEffect(() => {
    setPanelContexts((current) =>
      current.map((context) =>
        context.id === ASSISTANT_CONTEXT_ID
          ? { ...context, label: activeSessionTitle.slice(0, 28) }
          : context,
      ),
    );
  }, [activeSessionTitle]);

  const resolvePanelContext = useCallback(
    (contextId: string) => {
      if (assistantViewLocked && contextId !== ASSISTANT_CONTEXT_ID) {
        return;
      }
      setActiveContextId(contextId);
      if (!briefingCaseId) return;
      if (contextId === ASSISTANT_CONTEXT_ID) {
        setPanelTask(null);
        setPanelRequirement(null);
        setPanelDocument(null);
        return;
      }
      if (contextId.startsWith('task:')) {
        const id = contextId.slice('task:'.length);
        const found = listTasks(activeDataset, { caseId: briefingCaseId }).find(
          (task) => task.id === id || task.taskId === id,
        );
        if (found) {
          setPanelTask(found);
          setPanelRequirement(null);
          setPanelDocument(null);
        }
        return;
      }
      if (contextId.startsWith('requirement:')) {
        const id = contextId.slice('requirement:'.length);
        const found = caseOverview?.requirements.find(
          (requirement) =>
            String(requirement.id) === id || String(requirement.datasetRequirementId ?? '') === id,
        );
        if (found) {
          setPanelRequirement(found);
          setPanelTask(null);
          setPanelDocument(null);
        }
        return;
      }
      if (contextId.startsWith('document:')) {
        const id = contextId.slice('document:'.length);
        const found = listDocuments(activeDataset, { caseId: briefingCaseId }).find(
          (document) => document.id === id || document.name === id,
        );
        if (found) {
          setPanelDocument(documentToCaseContextRow(found));
          setPanelTask(null);
          setPanelRequirement(null);
        }
        return;
      }
      if (contextId.startsWith('scoring:')) {
        return;
      }
    },
    [activeDataset, assistantViewLocked, briefingCaseId, caseOverview?.requirements],
  );

  const openScoringPanel = useCallback(() => {
    if (!scoringPanelContext) return;
    setPanelContexts((current) => pushWorkspacePanelContext(current, scoringPanelContext));
    resolvePanelContext(scoringPanelContext.id);
  }, [resolvePanelContext, scoringPanelContext]);

  const handlePanelContextChange = useCallback(
    (contextId: string) => {
      resolvePanelContext(contextId);
    },
    [resolvePanelContext],
  );

  const handleClearPanelContext = useCallback(
    (contextId: string) => {
      let nextContextId: string | undefined;
      setPanelContexts((current) => {
        const index = current.findIndex((context) => context.id === contextId);
        const next = index >= 0 ? current[index + 1] ?? current[index - 1] : undefined;
        nextContextId = next?.id;
        return current.filter((context) => context.id !== contextId);
      });
      if (contextId.startsWith('task:')) setPanelTask(null);
      if (contextId.startsWith('requirement:')) setPanelRequirement(null);
      if (contextId.startsWith('document:')) setPanelDocument(null);
      if (nextContextId) {
        queueMicrotask(() => resolvePanelContext(nextContextId!));
        return;
      }
      resetPanelStack();
    },
    [resetPanelStack, resolvePanelContext],
  );

  const markCopilotFocusTaskOutcome = useCallback(
    (task: Task, outcome: GlobalCopilotTaskOutcomeDetail['outcome']) => {
      patchSessionForTaskOutcome(
        activeSessionId,
        task.id,
        outcome,
        taskOutcomeAlternateIds(task),
      );
    },
    [activeSessionId, patchSessionForTaskOutcome],
  );

  const returnToCopilotAssistant = useCallback(() => {
    suppressCopilotObjectFocusRef.current = true;
    if (briefingCaseId) {
      try {
        sessionStorage.setItem(STORAGE_KEYS.suppressCaseHashTaskFocus, briefingCaseId);
      } catch {
        /* ignore */
      }
      const nextHref = buildCaseWorkspaceReturnHref(briefingCaseId);
      window.history.replaceState(window.history.state, '', nextHref);
      navigate(nextHref, { replace: true });
    }
    flushSync(() => {
      setAssistantViewLocked(true);
      setPanelContexts([
        {
          id: ASSISTANT_CONTEXT_ID,
          label: activeSessionTitle.slice(0, 28),
          icon: MessageSquare,
          clearable: false,
        },
      ]);
      setActiveContextId(ASSISTANT_CONTEXT_ID);
      setPanelTask(null);
      setPanelRequirement(null);
      setPanelDocument(null);
    });
    window.setTimeout(() => {
      suppressCopilotObjectFocusRef.current = false;
      if (briefingCaseId) {
        try {
          sessionStorage.removeItem(STORAGE_KEYS.suppressCaseHashTaskFocus);
        } catch {
          /* ignore */
        }
      }
    }, 250);
  }, [activeSessionTitle, briefingCaseId, navigate]);

  const finishTaskPanelOutcome = useCallback(
    (task: Task, outcome: GlobalCopilotTaskOutcomeDetail['outcome']) => {
      markCopilotFocusTaskOutcome(task, outcome);
      returnToCopilotAssistant();
    },
    [markCopilotFocusTaskOutcome, returnToCopilotAssistant],
  );

  const openInCopilotPanel = useCallback(
    (input: CaseWorkspaceObjectFocus) => {
      if (!briefingCaseId || input.caseId !== briefingCaseId) {
        openCaseWorkspaceObject(navigate, input);
        return;
      }
      if (suppressCopilotObjectFocusRef.current) {
        return;
      }

      setAssistantViewLocked(false);
      setGlobalCopilotCaseOwner(briefingCaseId);
      navigate(buildCaseWorkspaceObjectHref(input), { replace: false });

      if (input.kind === 'task') {
        const task = listTasks(activeDataset, { caseId: briefingCaseId }).find(
          (row) => row.id === input.objectId || row.taskId === input.objectId,
        );
        if (!task) return;
        const context: WorkspacePanelContext = {
          id: taskPanelContextId(task.id),
          label: (task.taskId ?? task.taskType).slice(0, 28),
          icon: ClipboardList,
          clearable: true,
        };
        setPanelContexts((current) => pushWorkspacePanelContext(current, context));
        setPanelTask(task);
        setPanelRequirement(null);
        setPanelDocument(null);
        setActiveContextId(context.id);
        return;
      }

      if (input.kind === 'requirement') {
        const requirement = caseOverview?.requirements.find(
          (row) =>
            String(row.id) === input.objectId || String(row.datasetRequirementId ?? '') === input.objectId,
        );
        if (!requirement) return;
        const reqId = String(requirement.datasetRequirementId ?? requirement.id);
        const context: WorkspacePanelContext = {
          id: requirementPanelContextId(reqId),
          label: `R-${reqId}`.slice(0, 28),
          icon: ClipboardCheck,
          clearable: true,
        };
        setPanelContexts((current) => pushWorkspacePanelContext(current, context));
        setPanelRequirement(requirement);
        setPanelTask(null);
        setPanelDocument(null);
        setActiveContextId(context.id);
        return;
      }

      const document = listDocuments(activeDataset, { caseId: briefingCaseId }).find(
        (row) => row.id === input.objectId || row.name === input.objectId,
      );
      if (!document) return;
      const docKey = document.id ?? document.name;
      const context: WorkspacePanelContext = {
        id: documentPanelContextId(docKey),
        label: document.name.slice(0, 28),
        icon: FileText,
        clearable: true,
      };
      setPanelContexts((current) => pushWorkspacePanelContext(current, context));
      setPanelDocument(documentToCaseContextRow(document));
      setPanelTask(null);
      setPanelRequirement(null);
      setActiveContextId(context.id);
    },
    [activeDataset, briefingCaseId, caseOverview?.requirements, navigate],
  );

  useEffect(() => {
    const onFocus = (event: Event) => {
      const detail = (event as CustomEvent<CaseWorkspaceObjectFocus>).detail;
      if (!detail || !briefingCaseId || detail.caseId !== briefingCaseId) return;
      openInCopilotPanel(detail);
    };
    const onReturnToAssistant = () => returnToCopilotAssistant();
    const onTaskOutcome = (event: Event) => {
      const detail = (event as CustomEvent<GlobalCopilotTaskOutcomeDetail>).detail;
      if (!detail?.taskId) return;
      patchSessionForTaskOutcome(
        activeSessionId,
        detail.taskId,
        detail.outcome,
        detail.alternateTaskIds ?? [],
      );
      returnToCopilotAssistant();
    };
    window.addEventListener(APP_EVENTS.focusGlobalCopilotCaseObject, onFocus);
    window.addEventListener(APP_EVENTS.copilotReturnToAssistant, onReturnToAssistant);
    window.addEventListener(APP_EVENTS.copilotTaskOutcome, onTaskOutcome);
    return () => {
      window.removeEventListener(APP_EVENTS.focusGlobalCopilotCaseObject, onFocus);
      window.removeEventListener(APP_EVENTS.copilotReturnToAssistant, onReturnToAssistant);
      window.removeEventListener(APP_EVENTS.copilotTaskOutcome, onTaskOutcome);
    };
  }, [
    activeSessionId,
    briefingCaseId,
    openInCopilotPanel,
    patchSessionForTaskOutcome,
    returnToCopilotAssistant,
  ]);

  const selectedRequirementRecord = useMemo(() => {
    if (!panelRequirement || !briefingCaseId) return undefined;
    const requirementRef = activeDataset.requirements.find(
      (requirement) =>
        requirement.id === panelRequirement.datasetRequirementId
        || requirement.label === panelRequirement.name,
    );
    return requirementRef;
  }, [activeDataset.requirements, briefingCaseId, panelRequirement]);

  const panelRequirementDocuments = useMemo(() => {
    if (!panelRequirement || !briefingCaseId) return [];
    const ids = new Set(panelRequirement.linkedDocs ?? selectedRequirementRecord?.linkedDocs ?? []);
    if (!ids.size) return [];
    return listDocuments(activeDataset, { caseId: briefingCaseId }).filter((document) => ids.has(document.id));
  }, [activeDataset, briefingCaseId, panelRequirement, selectedRequirementRecord]);

  const panelRequirementTasks = useMemo(() => {
    if (!panelRequirement || !briefingCaseId) return [];
    const ids = new Set(panelRequirement.linkedTasks ?? selectedRequirementRecord?.linkedTasks ?? []);
    if (!ids.size) return [];
    return listTasks(activeDataset, { caseId: briefingCaseId }).filter(
      (task) => ids.has(task.id) || Boolean(task.taskId && ids.has(task.taskId)),
    );
  }, [activeDataset, briefingCaseId, panelRequirement, selectedRequirementRecord]);

  const panelDocumentData = useMemo(() => {
    if (!panelDocument || !briefingCaseId || !caseOverview) return null;
    return buildCaseDocumentPanelData(
      panelDocument,
      {
        caseId: briefingCaseId,
        claimantName: caseOverview.claimantName ?? caseOverview.primaryPartyName ?? briefingCaseId,
        policyNumber: caseOverview.policyNumber,
      },
      activeDataset,
      dataSource.legacyMockOverlayEnabled,
    );
  }, [
    activeDataset,
    briefingCaseId,
    caseOverview,
    dataSource.legacyMockOverlayEnabled,
    panelDocument,
  ]);

  useEffect(() => {
    setActiveDocumentInsightId(panelDocumentData?.evidence[0]?.id ?? '');
  }, [panelDocumentData?.documentId]);

  const handlePanelNavigationChange = useCallback(
    (payload: { contexts: WorkspacePanelContext[]; activeContextId: string }) => {
      if (assistantViewLocked) return;
      setPanelContexts(payload.contexts);
      resolvePanelContext(payload.activeContextId);
    },
    [assistantViewLocked, resolvePanelContext],
  );

  const handleClosePanel = useCallback(() => {
    resetPanelStack();
    onClose();
  }, [onClose, resetPanelStack]);

  const showAssistant = assistantViewLocked || activeContextId === ASSISTANT_CONTEXT_ID;

  const showTask = !assistantViewLocked && activeContextId.startsWith('task:') && panelTask;
  const showRequirement = activeContextId.startsWith('requirement:') && panelRequirement;
  const showDocument = activeContextId.startsWith('document:') && panelDocumentData;
  const showScoring = activeContextId.startsWith('scoring:') && scoringDraft;

  const preserveOnOutsideClick = useCallback(
    (target: Element) => {
      if (!briefingCaseId) return false;
      return matchesCaseWorkspaceInteraction(target, briefingCaseId);
    },
    [briefingCaseId],
  );

  return (
    <WorkspaceObjectSidePanel
      contexts={panelContextsWithScoring}
      activeContextId={activeContextId}
      onChangeContext={handlePanelContextChange}
      onClearContext={handleClearPanelContext}
      onClose={handleClosePanel}
      preserveOnOutsideClick={preserveOnOutsideClick}
      panelWidth={panelWidth}
      onPanelWidthChange={onPanelWidthChange}
      isResizing={isResizing}
      onResizeStart={onResizeStart}
      actions={
        <>
          <button
            type="button"
            onClick={onCreateSession}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-default bg-white px-2.5 py-1 text-[11px] font-semibold text-text-secondary transition-colors hover:border-brand-blue hover:text-brand-blue"
            aria-label={t('aiPanel.newConversation')}
            title={t('aiPanel.newConversation')}
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
            {t('aiPanel.newChat')}
          </button>
          <button
            type="button"
            onClick={() => {
              handleClosePanel();
              navigate('/copilot');
            }}
            className="shrink-0 rounded-full p-1.5 text-text-secondary hover:bg-surface-muted"
            aria-label={t('aiPanel.openFullPage')}
            title={t('aiPanel.openFullPage')}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </>
      }
    >
      <div
        className={
          showAssistant
            ? 'flex min-h-0 flex-1 flex-col overflow-hidden'
            : 'pointer-events-none hidden'
        }
        aria-hidden={!showAssistant}
      >
        <AiCopilotDock
          layout="panel"
          data={{ id: globalContextId }}
          messages={messages}
          onSendMessage={onSendMessage}
          onExecuteAction={onExecuteAction}
          onOpenCaseObject={briefingCaseId ? openInCopilotPanel : undefined}
          aiPanelTab="workspace"
          hideEmptyState={isCaseContext}
          composerPlaceholder={
            isCaseContext ? 'Ask about this case, a task, or a requirement…' : undefined
          }
          caseBriefIntroReplayKey={caseBriefIntroReplayKey}
          panelHeader={
            <div className="px-5 pb-3 pt-3">
              <div className="flex items-center gap-1.5">
                <MiniAiSourceBadge size="compact" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                  {t('aiPanel.eyebrow')}
                </span>
              </div>
              <div className="mt-1 flex min-w-0 items-center gap-1.5">
                <InlineTitleEditor
                  value={activeSessionTitle}
                  editing={renamingConversation}
                  onEditingChange={setRenamingConversation}
                  onCommit={(next) => onRenameSession(activeSessionId, next)}
                />
                {renamingConversation ? null : (
                  <button
                    type="button"
                    onClick={() => setRenamingConversation(true)}
                    className="shrink-0 rounded-md p-1 text-[#a9aeb5] transition-colors hover:bg-surface-muted hover:text-text-secondary"
                    aria-label={t('aiPanel.renameConversation')}
                    title={t('aiPanel.renameConversation')}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          }
        />
      </div>

      {showTask && panelTask && briefingCaseId ? (
        <TaskDetailEmbeddedView
          task={panelTask}
          panelWidth={panelWidth}
          onPanelWidthChange={onPanelWidthChange}
          onResizeStart={onResizeStart}
          onClose={() => handleClearPanelContext(activeContextId)}
          navigate={navigate}
          queueContext="my_tasks"
          variant="case"
          caseFileId={briefingCaseId}
          fixedOverlay
          panelContexts={panelContextsWithScoring}
          activePanelContextId={activeContextId}
          onPanelNavigationChange={handlePanelNavigationChange}
          scoringPanelContext={scoringPanelContext}
          onOpenCaseScoring={scoringSidePanelEnabled ? openScoringPanel : undefined}
          onCompleteTask={(task, options) => {
            const taskRef = task.taskId ?? task.id;
            const caseId = briefingCaseId ?? task.caseId;
            if (caseId && isNb66RecommendRequirementsTask(taskRef)) {
              const packageResult = approveNb66RequirementGatheringPackage(
                dataSource.activeDatasetId,
                caseId,
                taskRef,
                options?.requirementIds ?? [],
                { name: profile.name },
                activeDemoConfigurationId,
              );
              if (!packageResult) {
                appToast.error('Could not approve requirement package. Try again.');
                return;
              }
              finishTaskPanelOutcome(task, 'accepted');
              updateDataSource({ activeDatasetId: packageResult.datasetId });
              const added = packageResult.addedCount;
              appToast.success(
                added > 0
                  ? `Task approved — ${added} requirement${added === 1 ? '' : 's'} added to ${caseId}`
                  : `Task approved on ${caseId}`,
              );
              return;
            }
            try {
              const result = runTaskWorkflowAction(
                dataSource.activeDatasetId,
                taskRef,
                'complete',
                { name: profile.name },
              );
              if (!result || !isTaskCompleteActionSuccess(result, taskRef)) {
                appToast.error(`Could not complete task ${task.taskId ?? task.id}. Try again.`);
                return;
              }
              finishTaskPanelOutcome(task, 'accepted');
              updateDataSource({ activeDatasetId: result.datasetId });
              appToast.success(
                isSemiAutoTask(task) ? `Task ${task.taskId ?? task.id} approved` : `Task ${task.taskId ?? task.id} completed`,
              );
            } catch {
              appToast.alert(`Could not complete task ${task.taskId ?? task.id}. Try again.`);
            }
          }}
          onTaskAction={(task, actionType) => {
            try {
              const result = runTaskWorkflowAction(
                dataSource.activeDatasetId,
                task.taskId ?? task.id,
                actionType,
                { name: profile.name },
              );
              if (!result?.record.task) {
                appToast.error(`Could not update task ${task.taskId ?? task.id}. Try again.`);
                return;
              }
              if (actionType === 'request_info') {
                finishTaskPanelOutcome(task, 'amended');
              } else {
                returnToCopilotAssistant();
              }
              updateDataSource({ activeDatasetId: result.datasetId });
              appToast.success(`Action recorded on ${task.taskId ?? task.id}`);
            } catch {
              appToast.alert(`Could not update task ${task.taskId ?? task.id}. Try again.`);
            }
          }}
        />
      ) : null}

      {showRequirement && panelRequirement && briefingCaseId ? (
        <RequirementContextBody
          requirement={panelRequirement}
          caseId={briefingCaseId}
          documents={panelRequirementDocuments}
          evidenceDataset={activeDataset}
          tasks={panelRequirementTasks}
          scoring={scoringDraft}
          hideScoringWidget={scoringSidePanelEnabled}
          onOpenScoring={scoringSidePanelEnabled ? openScoringPanel : undefined}
          onOpenDocument={(document) => {
            openInCopilotPanel({
              caseId: briefingCaseId,
              kind: 'document',
              objectId: document.id ?? document.name,
            });
          }}
          onOpenTask={(task) => {
            openInCopilotPanel({ caseId: briefingCaseId, kind: 'task', objectId: task.id });
          }}
        />
      ) : null}

      {showDocument && panelDocumentData && briefingCaseId ? (
        <DynamicDocumentSidePanel
          embedded
          open
          onOpenChange={(open) => {
            if (!open) handleClearPanelContext(activeContextId);
          }}
          document={panelDocumentData}
          activeInsightId={activeDocumentInsightId}
          onInsightChange={setActiveDocumentInsightId}
          panelWidth={panelWidth}
          isResizing={false}
          onResizeStart={() => undefined}
        />
      ) : null}

      {showScoring && scoringDraft ? (
        <CaseScoringSidePanel
          scoring={scoringDraft}
          onChange={(next) => {
            setScoringDraft(next);
            if (caseOverview) caseOverview.underwritingScoring = next;
          }}
        />
      ) : null}
    </WorkspaceObjectSidePanel>
  );
}
