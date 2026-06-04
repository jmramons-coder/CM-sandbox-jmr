import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { Plus, X, Clock, FileText, UserRound, ClipboardCheck, MessageSquare, Briefcase } from 'lucide-react';
import { type NavigateFunction } from 'react-router';
import type { Task, TaskPanelAction, AddressChangeDurationKind } from '../types';
import type { DatasetRequirementRecord } from '../data/multi-case-dataset';
import { AiCueSparkle } from './AiCueSparkle';
import { AiCopilotDock, type ChatTurn } from './AiCopilotFooter';
import { useCopilot } from '../contexts/CopilotContext';
import { DynamicDocumentSidePanel, type DynamicDocumentData } from './DynamicDocumentSidePanel';
import { WorkspaceObjectSidePanel, type WorkspacePanelContext } from './WorkspaceObjectSidePanel';
import { CollapsibleDetailSection } from './CollapsibleDetailSection';
import { DEFAULT_DATASET_ID } from '../domain/objectRefs';
import { getDocumentEvidence } from '../data/mock-document-evidence';
import { filterDatasetBySettings, getSystemDataset } from '../data/objectRepository';
import { updateDocumentStatus } from '../data/datasetMutations';
import { useActiveUser } from '../contexts/ActiveUserContext';
import { useDataSourceSettings, usePlatformSettings } from '../contexts/PlatformSettingsContext';
import { formatDocumentFileInfo } from '../data/documentMetadata';
import { appToast } from '../utils/app-toast';
import { ScoringMiniWidget } from './ScoringMiniWidget';
import { isTaskAiSourced, SidePanelAiPriorityRow } from './ModuleCellHelpers';
import { TaskReviewBody } from './TaskReviewBody';
import { buildInitialSuggestedRequirementSelection } from './tasks/TaskSuggestedRequirementsSection';
import { buildInitialAddressDecisionSelection, TaskAddressDecisionSection } from './tasks/TaskAddressDecisionSection';
import {
  buildInitialAddressPolicyScopeSelection,
  TaskAddressPolicyScopeSection,
} from './tasks/TaskAddressPolicyScopeSection';
import { TaskOfacScreeningSection } from './tasks/TaskOfacScreeningSection';
import { isNb66RecommendRequirementsTask } from '../data/nb66RequirementGatheringActions';
import { TaskPanelLeanContext } from './TaskPanelLeanContext';
import { TaskEvidencePreviewCard } from './TaskEvidencePreviewCard';
import { SidePanelHeaderTag } from './SidePanelHeaderTag';
import { LozengeTag } from './LozengeTag';
import { getRequirementStatusLozengeType } from '../utils/status-display';
import {
  formatTaskStage,
  inferTaskExecutionModeFromTask,
  isSemiAutoTask,
  isTaskStatusCompleted,
  resolveTaskPanelActions,
  resolveTaskReviewFromTask,
} from '../utils/taskReviewProjection';
import {
  documentIdFromPanelContext,
  documentPanelContextId,
  mergeTaskAndDocumentContexts,
  parseTaskPanelView,
  pushWorkspacePanelContext,
  requirementPanelContextId,
  taskPanelContextId,
} from '../utils/workspacePanelContextUtils';
import { resolveDocumentSidePanelWidth } from '../utils/sidepanel-width';
import { resolveDocumentPreviewUrl } from '../utils/sbli-document-assets';
import { listDatasetPlatformUsers } from '../data/datasetUsers';
import {
  resolveTaskAssigneeDisplayName,
  resolveTaskClaimantDisplayName,
} from '../utils/task-assignees';
import {
  resolveTaskEvidenceButtonLabel,
  resolveTaskEvidenceDocumentIds,
} from '../utils/dashboard-task-widget';

export type TaskPanelNavigationPayload = {
  contexts: WorkspacePanelContext[];
  activeContextId: string;
};

export type TaskDetailSidePanelProps = {
  task: Task;
  panelWidth: number;
  onPanelWidthChange?: (width: number) => void;
  onResizeStart: () => void;
  onClose: () => void;
  navigate: NavigateFunction;
  queueContext: 'my_tasks' | 'team_tasks';
  variant?: 'module' | 'case';
  caseFileId?: string;
  fixedOverlay?: boolean;
  onPickUp?: (task: Task, e?: MouseEvent) => void;
  onRelease?: (task: Task, e?: MouseEvent) => void;
  onManagerRelease?: (task: Task, e?: MouseEvent) => void;
  currentUserIsManager?: boolean;
  onAcceptMeeting?: (task: Task) => void;
  onCompleteTask?: (task: Task, options?: {
    requirementIds?: string[];
    addressOptionId?: string;
    addressPolicyIds?: string[];
    addressDuration?: AddressChangeDurationKind;
  }) => void;
  onTaskAction?: (task: Task, actionType: string) => void;
  panelContexts?: WorkspacePanelContext[];
  activePanelContextId?: string;
  onPanelNavigationChange?: (payload: TaskPanelNavigationPayload) => void;
  onOpenCaseScoring?: () => void;
};
export type TaskDetailEmbeddedViewProps = TaskDetailSidePanelProps;

const FALLBACK_DOCUMENT_ID = 'DOC-1001';

function actionButtonClass(action: TaskPanelAction, amend = false) {
  if (amend) {
    return 'inline-flex w-full items-center justify-center rounded-full border border-brand-red px-4 py-2 text-sm font-semibold leading-none text-brand-red transition-colors hover:bg-[#fde5e4]';
  }
  if (action.isPrimary || action.type === 'complete') {
    return 'inline-flex w-full items-center justify-center rounded-full bg-brand-navy px-4 py-2.5 text-sm font-semibold leading-none text-white transition-colors hover:bg-brand-blue-hover';
  }
  return 'inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-brand-blue px-4 py-2 text-sm font-semibold leading-none text-brand-blue transition-colors hover:bg-surface-selected';
}


export function TaskDetailSidePanel({
  task,
  panelWidth,
  onPanelWidthChange,
  onResizeStart,
  onClose,
  navigate,
  queueContext,
  variant = 'module',
  caseFileId,
  fixedOverlay = false,
  onPickUp,
  onRelease,
  onManagerRelease,
  currentUserIsManager = false,
  onAcceptMeeting,
  onCompleteTask,
}: TaskDetailSidePanelProps) {
  return (
    <EmpowerTaskDetailSidePanel
      task={task}
      panelWidth={panelWidth}
      onPanelWidthChange={onPanelWidthChange}
      onResizeStart={onResizeStart}
      onClose={onClose}
      navigate={navigate}
      queueContext={queueContext}
      variant={variant}
      caseFileId={caseFileId}
      fixedOverlay={fixedOverlay}
      onPickUp={onPickUp}
      onRelease={onRelease}
      onManagerRelease={onManagerRelease}
      currentUserIsManager={currentUserIsManager}
      onAcceptMeeting={onAcceptMeeting}
      onCompleteTask={onCompleteTask}
    />
  );
}

export function TaskDetailEmbeddedView(props: TaskDetailEmbeddedViewProps) {
  return <EmpowerTaskDetailContent {...props} />;
}

function EmpowerTaskDetailContent({
  task,
  panelWidth,
  onPanelWidthChange,
  onResizeStart,
  onClose,
  navigate,
  queueContext,
  variant = 'module',
  caseFileId,
  onPickUp,
  onManagerRelease,
  currentUserIsManager = false,
  onAcceptMeeting,
  onCompleteTask,
  onTaskAction,
  panelContexts,
  activePanelContextId,
  onPanelNavigationChange,
  onOpenCaseScoring,
}: TaskDetailSidePanelProps) {
  const isPanelNavControlled = Boolean(onPanelNavigationChange);
  const [internalActiveContextId, setInternalActiveContextId] = useState(() => taskPanelContextId(task.id));
  const activeContextId = isPanelNavControlled
    ? (activePanelContextId ?? taskPanelContextId(task.id))
    : internalActiveContextId;
  const activeView = parseTaskPanelView(activeContextId);
  const dataSource = useDataSourceSettings();
  const { updateDataSource } = usePlatformSettings();
  const { profile } = useActiveUser();
  const activeDataset = useMemo(() => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource), [dataSource]);
  const handleDocumentWorkflow = (actionId: string, documentId: string) => {
    if (actionId !== 'mark-reviewed' && actionId !== 'review-dataset-evidence') return;
    const result = updateDocumentStatus(dataSource.activeDatasetId, documentId, 'Validated', {
      name: profile.name,
    });
    updateDataSource({ activeDatasetId: result.datasetId });
    appToast.success('Document marked as reviewed');
  };
  const evidenceDocumentIds = useMemo(
    () => resolveTaskEvidenceDocumentIds(task, activeDataset),
    [activeDataset, task],
  );
  const [activeEvidenceDocumentId, setActiveEvidenceDocumentId] = useState(evidenceDocumentIds[0]);
  useEffect(() => {
    setActiveEvidenceDocumentId((current) => current && evidenceDocumentIds.includes(current) ? current : evidenceDocumentIds[0]);
  }, [evidenceDocumentIds]);
  const linkedDocumentId = activeEvidenceDocumentId;
  const isKnownLegacyTask = task.id === 'IT-5198' || task.id === 'IT-5202' || task.id === 'IT-5204';
  const evidenceDocumentId = linkedDocumentId ?? (dataSource.legacyMockOverlayEnabled && isKnownLegacyTask ? FALLBACK_DOCUMENT_ID : undefined);
  const taskDocumentData = getDocumentEvidence(evidenceDocumentId, activeDataset);
  const viewingDocumentId = documentIdFromPanelContext(activeContextId) ?? activeEvidenceDocumentId;
  const viewingDocumentData = getDocumentEvidence(viewingDocumentId, activeDataset);
  const [activeEvidenceId, setActiveEvidenceId] = useState(taskDocumentData?.evidence[0]?.id ?? '');
  useEffect(() => {
    const source = viewingDocumentData ?? taskDocumentData;
    setActiveEvidenceId(source?.evidence[0]?.id ?? '');
  }, [taskDocumentData, viewingDocumentData?.documentId]);
  const { activeMessages, sendMessage } = useCopilot();

  useEffect(() => {
    if (isPanelNavControlled) return;
    setInternalActiveContextId(taskPanelContextId(task.id));
  }, [isPanelNavControlled, task.id]);
  const isOnTeamTasks = variant !== 'case' && queueContext === 'team_tasks';
  const isInterview =
    task.taskType === 'Restoration Plan Interview' ||
    task.id === 'IT-5198' ||
    task.taskType.includes('Restoration plan review') ||
    task.taskType.includes('Review proposed appointment');
  const isTeamTaskAvailable = isOnTeamTasks && !task.pickedUpBy;
  const isTeamTaskLocked = isOnTeamTasks && !!task.pickedUpBy;
  const isCompletedTask = isTaskStatusCompleted(task.status);
  const executionMode = inferTaskExecutionModeFromTask(task);
  const taskReview = resolveTaskReviewFromTask(task);
  const suggestedProposals = taskReview.suggestedRequirements;
  const hasSuggestedRequirements = Boolean(suggestedProposals?.length);
  const addressDecision = taskReview.addressDecision;
  const hasAddressDecision = Boolean(addressDecision?.options.length);
  const addressPolicyScope = taskReview.addressPolicyScope;
  const hasAddressPolicyScope = Boolean(addressPolicyScope?.policies.length);
  const ofacScreening = taskReview.ofacScreening;
  const hasOfacScreening = Boolean(ofacScreening);
  const hideAddressChangeDetailsSections =
    (dataSource.activeDatasetId === DEFAULT_DATASET_ID
      || dataSource.activeDatasetId.startsWith(`${DEFAULT_DATASET_ID}-workspace-copy-`))
    && (hasAddressPolicyScope || hasAddressDecision);
  const nb66GatheringApprove = isNb66RecommendRequirementsTask(task.taskId ?? task.id);
  const [selectedRequirementIds, setSelectedRequirementIds] = useState<Set<string>>(() =>
    buildInitialSuggestedRequirementSelection(suggestedProposals ?? []),
  );
  const [selectedAddressOptionId, setSelectedAddressOptionId] = useState(() =>
    addressDecision ? buildInitialAddressDecisionSelection(addressDecision) : '',
  );
  const [selectedAddressPolicyIds, setSelectedAddressPolicyIds] = useState<Set<string>>(() =>
    addressPolicyScope ? buildInitialAddressPolicyScopeSelection(addressPolicyScope) : new Set(),
  );
  const [addressDuration, setAddressDuration] = useState<AddressChangeDurationKind>(
    () => addressPolicyScope?.duration ?? 'permanent',
  );
  const suggestionSelectionKey =
    suggestedProposals?.map((row) => row.id).join('|') ?? '';
  const addressSelectionKey =
    addressDecision?.options.map((row) => row.id).join('|') ?? '';
  const addressPolicySelectionKey =
    addressPolicyScope?.policies.map((row) => row.id).join('|') ?? '';
  useEffect(() => {
    setSelectedRequirementIds(buildInitialSuggestedRequirementSelection(suggestedProposals ?? []));
  }, [task.id, suggestionSelectionKey]);
  useEffect(() => {
    if (!addressDecision) {
      setSelectedAddressOptionId('');
      return;
    }
    setSelectedAddressOptionId(buildInitialAddressDecisionSelection(addressDecision));
  }, [task.id, addressSelectionKey, addressDecision]);
  useEffect(() => {
    if (!addressPolicyScope) {
      setSelectedAddressPolicyIds(new Set());
      setAddressDuration('permanent');
      return;
    }
    setSelectedAddressPolicyIds(buildInitialAddressPolicyScopeSelection(addressPolicyScope));
    setAddressDuration(addressPolicyScope.duration);
  }, [task.id, addressPolicySelectionKey, addressPolicyScope]);
  const semiAuto = isSemiAutoTask(task);
  const evidenceActionLabel = resolveTaskEvidenceButtonLabel(task, taskDocumentData);
  const panelActions = resolveTaskPanelActions(task, {
    isCompleted: isCompletedTask,
    hasEvidence: evidenceDocumentIds.length > 0,
  });

  const caseId = task.caseId || 'N/A';
  const taskCaseRecord = activeDataset.cases.find((item) => item.id === caseId);
  const userRoster = useMemo(
    () => listDatasetPlatformUsers(activeDataset).map((user) => ({ id: user.id, name: user.name })),
    [activeDataset],
  );
  const assigneeLabel = resolveTaskAssigneeDisplayName(task, {
    currentUserName: profile.name,
    roster: userRoster,
  });
  const claimantName = resolveTaskClaimantDisplayName(task, taskCaseRecord, activeDataset.clients);
  const caseTagLabel = `${caseId} · ${claimantName} · ${formatTaskStage(task.stage)}`;
  const activeRequirementRecord = activeDataset.requirements.find((requirement) =>
    task.linkedObjects?.some((item) => item.kind === 'requirement' && item.id === requirement.id),
  );
  const evidencePreviews = useMemo(() => {
    const byId = new Map((task.evidenceDocuments ?? []).map((document) => [document.id, document]));
    evidenceDocumentIds.forEach((id) => {
      if (byId.has(id)) return;
      const document = activeDataset.documents.find((row) => row.id === id);
      if (document) {
        byId.set(id, {
          id,
          name: document.label,
          size: document.fileSize,
          category: document.category,
          aiSummary: document.aiSummary,
          followUps: document.followUps,
        });
      }
    });
    return Array.from(byId.values());
  }, [activeDataset.documents, evidenceDocumentIds, task.evidenceDocuments]);
  const pushPanelNavigation = (payload: TaskPanelNavigationPayload) => {
    if (onPanelNavigationChange) {
      onPanelNavigationChange(payload);
      return;
    }
    setInternalActiveContextId(payload.activeContextId);
  };

  const taskContext = (): WorkspacePanelContext => ({
    id: taskPanelContextId(task.id),
    label: task.taskId ?? task.id,
    icon: ClipboardCheck,
    clearable: true,
  });

  const openDocumentView = (documentId = activeEvidenceDocumentId) => {
    if (documentId && documentId !== activeEvidenceDocumentId) setActiveEvidenceDocumentId(documentId);
    const documentData = getDocumentEvidence(documentId, activeDataset);
    if (!documentData) return;
    if (typeof window !== 'undefined') {
      onPanelWidthChange?.(resolveDocumentSidePanelWidth(panelWidth));
    }
    const resolvedDocumentId = documentId ?? documentData.documentId;
    const docContext: WorkspacePanelContext = {
      id: documentPanelContextId(resolvedDocumentId),
      label: documentData.documentTitle ?? 'Document',
      icon: FileText,
      clearable: true,
    };
    const { contexts, activeContextId: nextActiveId } = mergeTaskAndDocumentContexts(
      panelContexts ?? [taskContext()],
      taskContext(),
      docContext,
    );
    pushPanelNavigation({ contexts, activeContextId: nextActiveId });
  };

  const clearDocumentView = () => {
    const taskCtxId = taskPanelContextId(task.id);
    const contexts = (panelContexts ?? [taskContext()]).filter((item) => !item.id.startsWith('document:'));
    pushPanelNavigation({ contexts, activeContextId: taskCtxId });
  };

  const openRequirementView = () => {
    const linkedRequirement = task.linkedObjects?.find((item) => item.kind === 'requirement');
    const requirementId = linkedRequirement?.id ?? activeRequirementRecord?.id;
    if (!requirementId) return;
    const reqContext: WorkspacePanelContext = {
      id: requirementPanelContextId(requirementId),
      label: linkedRequirement?.label ?? activeRequirementRecord?.label ?? 'Requirement',
      icon: ClipboardCheck,
      clearable: true,
    };
    const contexts = pushWorkspacePanelContext(panelContexts ?? [taskContext()], reqContext);
    pushPanelNavigation({ contexts, activeContextId: reqContext.id });
  };

  const panelBody = activeView === 'document' ? (
    viewingDocumentData ? (
        <DynamicDocumentSidePanel
          embedded
          open
          onOpenChange={(nextOpen) => {
            if (!nextOpen) clearDocumentView();
          }}
          document={viewingDocumentData}
          activeInsightId={activeEvidenceId}
          onInsightChange={setActiveEvidenceId}
          panelWidth={panelWidth}
          isResizing={false}
          onResizeStart={() => undefined}
          onDocumentAction={handleDocumentWorkflow}
        />
    ) : null
      ) : activeView === 'assistant' ? (
        <EmpowerAssistantView
          activeMessages={activeMessages}
          contextId={task.id}
          onSendMessage={sendMessage}
        />
      ) : activeView === 'requirement' ? (
        <EmpowerRequirementView
          caseId={caseId}
          claimantName={claimantName}
          requirement={activeRequirementRecord}
          evidenceDocument={taskDocumentData}
          onOpenDocument={openDocumentView}
          navigate={navigate}
        />
      ) : (
      <>
      <div className="shrink-0 border-b border-border-default bg-white px-6 py-4">
        <div className="flex w-full items-start justify-between gap-4">
          <SidePanelAiPriorityRow
            aiSourced={isTaskAiSourced(task) || semiAuto}
            status={task.status}
            priority={task.priority}
            className="!mb-0 min-w-0 flex-1"
          />
          <span className="shrink-0 pt-0.5 text-[12px] font-semibold leading-none text-text-muted/70">
            {task.taskId ?? task.id}
          </span>
        </div>
        <h2 className="mt-2 text-[18px] font-semibold leading-tight text-text-heading">{task.taskType}</h2>

        <dl className="mt-3 flex flex-wrap gap-2">
          <SidePanelHeaderTag
            icon={Briefcase}
            label={caseTagLabel}
            title={caseTagLabel}
            onClick={() => navigate(`/cases/${caseId}`)}
          />
          <SidePanelHeaderTag icon={Clock} label={`Due ${task.slaRemaining || 'Today'}`} />
          <SidePanelHeaderTag icon={UserRound} label={assigneeLabel} />
        </dl>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-surface-primary">
        <div className="app-scrollbar h-full overflow-y-auto px-5 py-4">
          <TaskReviewBody
            task={task}
            executionMode={executionMode}
            review={taskReview}
            selectedRequirementIds={hasSuggestedRequirements ? selectedRequirementIds : undefined}
            onSelectedRequirementIdsChange={
              hasSuggestedRequirements ? setSelectedRequirementIds : undefined
            }
            hideAddressChangeDetailsSections={hideAddressChangeDetailsSections}
          />

          <TaskPanelLeanContext task={task} />

          {hasOfacScreening && ofacScreening ? (
            <TaskOfacScreeningSection screening={ofacScreening} className="mt-4" />
          ) : null}

          {hasAddressPolicyScope && addressPolicyScope && !hideAddressChangeDetailsSections ? (
            <TaskAddressPolicyScopeSection
              className="mt-4"
              scope={addressPolicyScope}
              selectedPolicyIds={selectedAddressPolicyIds}
              onSelectedPolicyIdsChange={setSelectedAddressPolicyIds}
              duration={addressDuration}
              onDurationChange={setAddressDuration}
            />
          ) : null}

          {!semiAuto ? (
            <ScoringMiniWidget
              scoring={taskCaseRecord?.underwritingScoring}
              onOpenScoring={
                onOpenCaseScoring
                ?? (caseId ? () => navigate(`/cases/${caseId}#tab=scoring`) : undefined)
              }
            />
          ) : null}

          {evidencePreviews.length ? (
          <section className="mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">
              References · {evidencePreviews.length}
            </p>
            <div className="mt-2 space-y-2">
              {evidencePreviews.map((document) => {
                const documentData = getDocumentEvidence(document.id, activeDataset);
                const datasetDoc = activeDataset.documents.find((row) => row.id === document.id);
                const previewUrl = documentData
                  ? resolveDocumentPreviewUrl({
                      documentId: document.id,
                      filename: datasetDoc?.filename,
                      fileUrl: datasetDoc?.fileUrl,
                      fileAvailable: datasetDoc?.fileAvailable,
                      pageImage: documentData.pages[0]?.image,
                    })
                  : '';
                return (
                  <TaskEvidencePreviewCard
                    key={document.id}
                    title={document.name ?? documentData?.documentTitle ?? document.id}
                    fileType={documentData?.fileType}
                    fileSize={document.size ?? documentData?.fileSize}
                    previewUrl={previewUrl}
                    documentData={documentData}
                    fallbackSummary={document.aiSummary}
                    onOpen={() => openDocumentView(document.id)}
                    disabled={!documentData}
                  />
                );
              })}
            </div>
          </section>
          ) : null}

          {hasAddressDecision && addressDecision && !hideAddressChangeDetailsSections ? (
            <TaskAddressDecisionSection
              className="mt-4"
              decision={addressDecision}
              selectedOptionId={selectedAddressOptionId}
              onSelectionChange={setSelectedAddressOptionId}
            />
          ) : null}

        </div>
      </div>

      <div className="shrink-0 space-y-2 border-t border-border-default bg-white p-4">
        {isTeamTaskAvailable ? (
          <button onClick={() => onPickUp?.(task)} className="inline-flex w-full items-center justify-center rounded-full bg-brand-blue px-4 py-2.5 text-sm font-semibold leading-none text-white transition-colors hover:bg-brand-blue-hover">
            Pick up
          </button>
        ) : isTeamTaskLocked && currentUserIsManager ? (
          <button onClick={() => onManagerRelease?.(task)} className="inline-flex w-full items-center justify-center rounded-full border border-border-default px-4 py-2 text-sm font-semibold leading-none text-text-secondary transition-colors hover:bg-surface-muted">
            Release
          </button>
        ) : isInterview ? (
          <>
            <button onClick={() => onAcceptMeeting?.(task)} className="inline-flex w-full items-center justify-center rounded-full bg-[#008533] px-4 py-2.5 text-sm font-semibold leading-none text-white transition-colors hover:bg-[#006b29]">
              Accept meeting
            </button>
            <button className="inline-flex w-full items-center justify-center rounded-full border border-[#cd2c23] px-4 py-2 text-sm font-semibold leading-none text-brand-red transition-colors hover:bg-[#fde5e4]">
              Reject meeting
            </button>
          </>
        ) : (
          <>
            {evidenceDocumentIds.length && !isCompletedTask && !semiAuto ? (
              <button
                type="button"
                onClick={() => openDocumentView()}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-brand-blue px-4 py-2 text-sm font-semibold leading-none text-brand-blue transition-colors hover:bg-surface-selected"
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                {evidenceActionLabel}
              </button>
            ) : null}
            {panelActions.map((action) => (
              <button
                key={`${action.type}-${action.label}`}
                type="button"
                onClick={() => {
                  if (
                    evidenceDocumentIds.length
                    && isCompletedTask
                    && (action.type === 'complete' || action.label.toLowerCase().includes('view'))
                  ) {
                    openDocumentView();
                    return;
                  }
                  if (action.type === 'complete' || action.type === 'complete_return' || action.type === 'send_approver') {
                    onCompleteTask?.(task, {
                      requirementIds:
                        nb66GatheringApprove && hasSuggestedRequirements
                          ? [...selectedRequirementIds]
                          : undefined,
                      addressOptionId: hasAddressDecision ? selectedAddressOptionId : undefined,
                      addressPolicyIds: hasAddressPolicyScope ? [...selectedAddressPolicyIds] : undefined,
                      addressDuration: hasAddressPolicyScope ? addressDuration : undefined,
                    });
                    return;
                  }
                  onTaskAction?.(task, action.type);
                }}
                className={actionButtonClass(action, action.type === 'request_info' && action.label === 'Amend')}
              >
                {action.type === 'add_requirement' ? <Plus className="h-3.5 w-3.5 shrink-0" /> : null}
                {evidenceDocumentIds.length
                && isCompletedTask
                && (action.type === 'complete' || action.label.toLowerCase().includes('view'))
                  ? evidenceActionLabel
                  : action.label}
              </button>
            ))}
          </>
        )}
      </div>
      </>
      );

  return <>{panelBody}</>;
}

function EmpowerTaskDetailSidePanel(props: TaskDetailSidePanelProps) {
  const { task } = props;
  const taskCtxId = taskPanelContextId(task.id);
  const initialTaskContext: WorkspacePanelContext = {
    id: taskCtxId,
    label: task.taskId ?? task.id,
    icon: ClipboardCheck,
    clearable: true,
  };
  const [panelContexts, setPanelContexts] = useState<WorkspacePanelContext[]>([initialTaskContext]);
  const [activePanelContextId, setActivePanelContextId] = useState(taskCtxId);

  useEffect(() => {
    setPanelContexts([{
      id: taskPanelContextId(task.id),
      label: task.taskId ?? task.id,
      icon: ClipboardCheck,
      clearable: true,
    }]);
    setActivePanelContextId(taskPanelContextId(task.id));
  }, [task.id, task.taskId]);

  const handlePanelNavigationChange = (payload: TaskPanelNavigationPayload) => {
    setPanelContexts(payload.contexts);
    setActivePanelContextId(payload.activeContextId);
  };

  const handleChangeContext = (contextId: string) => {
    setActivePanelContextId(contextId);
  };

  const handleClearContext = (contextId: string) => {
    let nextContextId: string | undefined;
    setPanelContexts((current) => {
      const index = current.findIndex((context) => context.id === contextId);
      const next = index >= 0 ? current[index + 1] ?? current[index - 1] : undefined;
      nextContextId = next?.id;
      return current.filter((context) => context.id !== contextId);
    });
    setActivePanelContextId(nextContextId ?? taskCtxId);
  };

  return (
    <WorkspaceObjectSidePanel
      contexts={panelContexts}
      activeContextId={activePanelContextId}
      onChangeContext={handleChangeContext}
      onClearContext={handleClearContext}
      onClose={props.onClose}
      panelWidth={props.panelWidth}
      onPanelWidthChange={props.onPanelWidthChange}
      onResizeStart={props.onResizeStart}
    >
      <EmpowerTaskDetailContent
        {...props}
        panelContexts={panelContexts}
        activePanelContextId={activePanelContextId}
        onPanelNavigationChange={handlePanelNavigationChange}
      />
    </WorkspaceObjectSidePanel>
  );
}

function EmpowerAssistantView({
  activeMessages,
  contextId,
  onSendMessage,
}: {
  activeMessages: ChatTurn[];
  contextId: string;
  onSendMessage: (message: string) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="shrink-0 border-b border-border-default px-5 py-4">
        <div className="flex items-center gap-2">
          <AiCueSparkle size={16} className="!text-brand-accent" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">Amplify Assistant</span>
        </div>
        <p className="mt-1 pl-6 text-[14px] font-semibold text-text-primary">Assistant for task {contextId}</p>
      </div>
      <AiCopilotDock
        layout="panel"
        data={{ id: contextId }}
        messages={activeMessages}
        onSendMessage={onSendMessage}
        aiPanelTab="workspace"
      />
    </div>
  );
}

function EmpowerRequirementView({
  caseId,
  claimantName,
  requirement,
  evidenceDocument,
  onOpenDocument,
  navigate,
}: {
  caseId: string;
  claimantName: string;
  requirement?: DatasetRequirementRecord;
  evidenceDocument: DynamicDocumentData | null;
  onOpenDocument: () => void;
  navigate: NavigateFunction;
}) {
  const requirementName = requirement?.label ?? 'Requirement';
  const requirementStatus = requirement?.status ?? 'Unknown';
  const requirementRef = requirement ? `R-${requirement.id}` : undefined;
  const stageLabel = requirement?.stage ? formatTaskStage(requirement.stage) : undefined;
  const caseTagLabel = stageLabel
    ? `${caseId} · ${claimantName} · ${stageLabel}`
    : `${caseId} · ${claimantName}`;
  const requirementSummary = requirement
    ? `${requirement.category} requirement from ${requirement.source ?? requirement.trigger ?? 'the active case context'}${requirement.dueDate ? `, due ${requirement.dueDate}` : ''}.`
    : 'No requirement record is linked to this task in the active dataset.';

  return (
    <>
      <div className="shrink-0 border-b border-border-default bg-white px-6 py-4">
        <div className="flex w-full items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <LozengeTag
              label={requirementStatus}
              type={getRequirementStatusLozengeType(requirementStatus, 'panel')}
              subtle
            />
            {requirement?.category ? <LozengeTag label={requirement.category} type="Neutral" subtle /> : null}
          </div>
          {requirementRef ? (
            <span className="shrink-0 pt-0.5 text-[12px] font-semibold leading-none text-text-muted/70">
              {requirementRef}
            </span>
          ) : null}
        </div>
        <h2 className="mt-2 text-[18px] font-semibold leading-tight text-text-heading">{requirementName}</h2>
        <dl className="mt-3 flex flex-wrap gap-2">
          <SidePanelHeaderTag
            icon={Briefcase}
            label={caseTagLabel}
            title={caseTagLabel}
            onClick={() => navigate(`/cases/${caseId}#tab=requirements`)}
          />
          {requirement?.dueDate ? (
            <SidePanelHeaderTag icon={Clock} label={`Due ${requirement.dueDate}`} />
          ) : null}
        </dl>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-surface-primary">
        <div className="app-scrollbar h-full overflow-y-auto px-5 py-4">
          <CollapsibleDetailSection title="Summary" defaultOpen>
            <div className="flex items-start gap-3">
              <ClipboardCheck className="mt-0.5 size-5 text-text-heading" />
              <div>
                <p className="text-[13px] font-semibold text-text-primary">Requirement context</p>
                <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">{requirementSummary}</p>
                {requirement?.followUpDate || requirement?.workflowStepId ? (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                    {requirement.workflowStepId ? (
                      <div className="rounded-lg border border-border-soft bg-[#fbfcfd] px-3 py-2">
                        <p className="text-text-muted">Workflow step</p>
                        <p className="mt-0.5 font-semibold text-text-primary">{requirement.workflowStepId}</p>
                      </div>
                    ) : null}
                    {requirement.followUpDate ? (
                      <div className="rounded-lg border border-border-soft bg-[#fbfcfd] px-3 py-2">
                        <p className="text-text-muted">Follow-up date</p>
                        <p className="mt-0.5 font-semibold text-text-primary">{requirement.followUpDate}</p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </CollapsibleDetailSection>

          {evidenceDocument ? (
          <CollapsibleDetailSection title="Linked evidence" className="mt-3" defaultOpen>
            <button
              type="button"
              onClick={onOpenDocument}
              className="flex w-full rounded-lg border border-border-soft bg-[#fbfcfd] px-3 py-2 text-left transition-colors hover:border-brand-blue/40"
            >
              <span className="min-w-0">
                <span className="block text-[12px] font-semibold text-text-primary">{evidenceDocument.documentTitle}</span>
                <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                  {formatDocumentFileInfo(evidenceDocument.fileType, evidenceDocument.fileSize)}
                </span>
                <span className="mt-0.5 block text-[11px] text-text-secondary">Open AI evidence anchors</span>
              </span>
            </button>
          </CollapsibleDetailSection>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 space-y-2 border-t border-border-default bg-white p-4">
        <button className="inline-flex w-full items-center justify-center rounded-full bg-brand-navy px-4 py-2.5 text-sm font-semibold leading-none text-white transition-colors hover:bg-brand-blue-hover">
          Mark fulfilled
        </button>
        <button className="inline-flex w-full items-center justify-center rounded-full border border-border-default px-4 py-2 text-sm font-semibold leading-none text-text-secondary transition-colors hover:bg-surface-muted">
          Add note
        </button>
      </div>
    </>
  );
}

