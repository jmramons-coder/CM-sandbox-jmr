import { useEffect, useMemo, useState, type ComponentType, type MouseEvent, type ReactNode } from 'react';
import { Plus, X, Clock, FileText, UserRound, ClipboardCheck, MessageSquare, Link2, Briefcase } from 'lucide-react';
import { Link, type NavigateFunction } from 'react-router';
import type { Task, TaskPanelAction } from '../types';
import type { DatasetRequirementRecord } from '../data/multi-case-dataset';
import { AiCueSparkle } from './AiCueSparkle';
import { AiCopilotDock, type ChatTurn } from './AiCopilotFooter';
import { useCopilot } from '../contexts/CopilotContext';
import { DynamicDocumentSidePanel, type DynamicDocumentData } from './DynamicDocumentSidePanel';
import { WorkspaceObjectSidePanel, type WorkspacePanelContext } from './WorkspaceObjectSidePanel';
import { CollapsibleDetailSection } from './CollapsibleDetailSection';
import { getDocumentEvidence } from '../data/mock-document-evidence';
import { filterDatasetBySettings, getSystemDataset } from '../data/objectRepository';
import { useDataSourceSettings } from '../contexts/PlatformSettingsContext';
import { formatDocumentFileInfo } from '../data/documentMetadata';
import { resolveObjectLocation } from '../domain/objectRefs';
import { ScoringMiniWidget } from './ScoringMiniWidget';
import { isTaskAiSourced, SidePanelAiPriorityRow } from './ModuleCellHelpers';
import { TaskSummaryBody } from './TaskSummaryBody';
import {
  documentIdFromPanelContext,
  documentPanelContextId,
  mergeTaskAndDocumentContexts,
  parseTaskPanelView,
  pushWorkspacePanelContext,
  requirementPanelContextId,
  taskPanelContextId,
} from '../utils/workspacePanelContextUtils';
import { resolveDocumentPreviewUrl } from '../utils/sbli-document-assets';

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
  onCompleteTask?: (task: Task) => void;
  panelContexts?: WorkspacePanelContext[];
  activePanelContextId?: string;
  onPanelNavigationChange?: (payload: TaskPanelNavigationPayload) => void;
};
export type TaskDetailEmbeddedViewProps = TaskDetailSidePanelProps;

const FALLBACK_DOCUMENT_ID = 'DOC-1001';

function actionButtonClass(action: TaskPanelAction) {
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
  panelContexts,
  activePanelContextId,
  onPanelNavigationChange,
}: TaskDetailSidePanelProps) {
  const isPanelNavControlled = Boolean(onPanelNavigationChange);
  const [internalActiveContextId, setInternalActiveContextId] = useState(() => taskPanelContextId(task.id));
  const activeContextId = isPanelNavControlled
    ? (activePanelContextId ?? taskPanelContextId(task.id))
    : internalActiveContextId;
  const activeView = parseTaskPanelView(activeContextId);
  const dataSource = useDataSourceSettings();
  const activeDataset = useMemo(() => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource), [dataSource]);
  const evidenceDocumentIds = useMemo(() => {
    const ids = [
      ...(task.evidenceDocuments?.map((document) => document.id) ?? []),
      task.panelContext?.evidenceDocumentId,
      task.linkedObjects?.find((item) => item.kind === 'document')?.id,
    ].filter((id): id is string => Boolean(id));
    return Array.from(new Set(ids));
  }, [task.evidenceDocuments, task.linkedObjects, task.panelContext?.evidenceDocumentId]);
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

  const caseId = task.caseId || 'N/A';
  const claimantName = task.claimantName || (dataSource.legacyMockOverlayEnabled ? 'Billy Bud' : 'N/A');
  const taskCaseRecord = activeDataset.cases.find((item) => item.id === caseId);
  const linkedPolicyIds = new Set(taskCaseRecord?.linkedObjects.filter((ref) => ref.kind === 'policy').map((ref) => ref.id) ?? []);
  const derivedPolicyRole = taskCaseRecord?.primaryParty.kind === 'client'
    ? activeDataset.policies
      .filter((policy) => linkedPolicyIds.has(policy.id))
      .flatMap((policy) => policy.participants)
      .filter((participant) => participant.clientId === taskCaseRecord.primaryParty.id)
      .map((participant) => participant.role)
      .find((role) => role === 'insured' || role === 'beneficiary')
    : undefined;
  const claimantPolicyRole = task.claimantPolicyRole ?? taskCaseRecord?.primaryParty.policyRole ?? derivedPolicyRole?.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  const claimantLabel = claimantPolicyRole ? `${claimantName} (${claimantPolicyRole})` : claimantName;
  const activeRequirementRecord = activeDataset.requirements.find((requirement) =>
    task.linkedObjects?.some((item) => item.kind === 'requirement' && item.id === requirement.id),
  );
  const statusItems: Array<{ label: string; value: ReactNode; icon: ComponentType<{ className?: string }> }> = [
    { label: 'Case stage', value: task.origin || 'Assistant', icon: AiCueSparkle },
    { label: 'Assignee', value: task.assignedTo || task.pickedUpBy || 'Unassigned', icon: UserRound },
    { label: 'Due window', value: task.slaRemaining || 'Today', icon: Clock },
    { label: 'Case', value: <HeaderObjectLink label={caseId} onClick={() => navigate(`/cases/${caseId}`)} />, icon: Briefcase },
    { label: 'Claimant', value: <HeaderObjectLink label={claimantLabel} onClick={() => navigate(`/cases/${caseId}`)} />, icon: UserRound },
    { label: 'Linked', value: `${task.linkedObjects?.length ?? 0} objects`, icon: Link2 },
  ];
  const linkedObjects = task.linkedObjects ?? [];
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
      const targetWidth = Math.min(Math.round(window.innerWidth * 0.75), Math.max(860, panelWidth));
      onPanelWidthChange?.(targetWidth);
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

  const handleLinkedObjectClick = (id: string) => {
    const target = linkedObjects.find((item) => item.id === id || item.kind === id);
    if (target?.kind === 'case' || target?.kind === 'client') {
      navigate(target.href ?? (task.caseId ? `/cases/${task.caseId}` : '/cases'));
      return;
    }
    if (target?.kind === 'document') {
      openDocumentView();
      return;
    }
    if (target?.kind === 'requirement') {
      openRequirementView();
    }
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
        />
      ) : (
      <>
      <div className="shrink-0 border-b border-border-default bg-white px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <SidePanelAiPriorityRow
              aiSourced={isTaskAiSourced(task)}
              status={task.status}
              priority={task.priority}
              objectId={task.taskId ?? task.id}
            />
            <h2 className="text-[18px] font-semibold leading-tight text-text-heading">{task.taskType}</h2>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 overflow-visible rounded-lg border border-border-soft bg-[#fbfcfd] text-[12px] md:grid-cols-3">
          {statusItems.map(({ label, value, icon: Icon }) => (
            <div key={label} className="group relative min-w-0 border-b border-border-soft px-3 py-2 sm:border-b-0 sm:border-r sm:last:border-r-0">
              <dt className="flex items-center gap-1.5 text-[11px] text-text-muted">
                <Icon className="size-3.5 shrink-0" />
                {label}
              </dt>
              <dd className="mt-0.5 truncate font-semibold text-text-primary">{value}</dd>
              {label === 'Linked' ? (
                <div className="absolute right-0 top-full z-30 hidden w-[240px] pt-2 text-left group-hover:block">
                  <div className="rounded-lg border border-border-default bg-white p-2 shadow-[0_8px_24px_rgba(27,28,30,0.14)]">
                    <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">Linked objects</p>
                    <div className="space-y-1">
                      {linkedObjects.map((item) => {
                        const href = item.href ?? resolveObjectLocation(item);
                        const content = (
                          <>
                            <p className="text-[10px] text-text-muted">{item.kind}</p>
                            <p className="truncate text-[12px] font-semibold text-text-primary">{item.label}</p>
                          </>
                        );
                        return href ? (
                          <Link
                            key={`${item.kind}-${item.id}`}
                            to={href}
                            data-keep-sidepanel="link"
                            className="block w-full rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface-muted hover:text-brand-blue"
                          >
                            {content}
                          </Link>
                        ) : (
                          <button
                            key={`${item.kind}-${item.id}`}
                            type="button"
                            data-keep-sidepanel="context"
                            onClick={() => handleLinkedObjectClick(item.id)}
                            className="w-full rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface-muted"
                          >
                            {content}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </dl>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-surface-primary">
        <div className="app-scrollbar h-full overflow-y-auto px-5 py-4">
          <TaskSummaryBody task={task} isInterview={isInterview} />

          <ScoringMiniWidget scoring={taskCaseRecord?.underwritingScoring} onOpenScoring={() => navigate(`/cases/${caseId}#tab=scoring`)} />

          {evidencePreviews.length ? (
          <CollapsibleDetailSection
            title="Evidence preview"
            subtitle="AI-parsed document anchors"
            className="mt-3"
            defaultOpen
          >
            <div className="space-y-2">
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
                  <button
                    key={document.id}
                    type="button"
                    onClick={() => openDocumentView(document.id)}
                    disabled={!documentData}
                    className="flex w-full items-stretch rounded-lg border border-border-soft bg-white p-2 text-left transition-colors hover:border-brand-blue/40 disabled:cursor-default disabled:hover:border-border-soft"
                  >
                    <span className="relative flex w-22 shrink-0 self-stretch overflow-hidden rounded-[5px] border border-border-soft bg-[#f7f8fa] min-h-[68px]">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt=""
                          className="h-full w-full object-cover object-top"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center">
                          <FileText className="size-5 text-text-muted" aria-hidden />
                        </span>
                      )}
                    </span>
                    <span className="mx-2 w-px shrink-0 self-stretch bg-border-soft" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-semibold text-text-primary">{document.name ?? documentData?.documentTitle ?? document.id}</span>
                      <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                        {formatDocumentFileInfo(documentData?.fileType ?? 'PDF', document.size ?? documentData?.fileSize)}
                      </span>
                      <span className="mt-1 block text-[11px] leading-relaxed text-text-secondary">
                        {document.aiSummary ?? documentData?.summary.text ?? 'Document metadata is linked to this task.'}
                      </span>
                      <span className="mt-2 inline-flex rounded-full bg-[#fff4e6] px-2 py-0.5 text-[10px] font-semibold text-[#8a5a00]">
                        {document.followUps ?? documentData?.evidence.length ?? 0} follow-ups
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </CollapsibleDetailSection>
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
            {(task.actions?.length ? task.actions : [
              { type: 'complete' as const, label: 'Complete', isPrimary: true },
              { type: 'add_requirement' as const, label: 'Add requirement' },
            ]).map((action) => (
              <button
                key={action.type}
                onClick={() => {
                  if (action.type === 'complete' || action.type === 'complete_return' || action.type === 'send_approver') {
                    onCompleteTask?.(task);
                  }
                }}
                className={actionButtonClass(action)}
              >
                {action.type === 'add_requirement' ? <Plus className="h-3.5 w-3.5 shrink-0" /> : null}
                {action.label}
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

function HeaderObjectLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      data-keep-sidepanel="link"
      onClick={onClick}
      className="inline-block max-w-full truncate p-0 text-left align-bottom text-[12px] font-semibold leading-snug text-brand-blue underline underline-offset-2 hover:text-brand-blue-hover"
    >
      {label}
    </button>
  );
}

function EmpowerRequirementView({
  caseId,
  claimantName,
  requirement,
  evidenceDocument,
  onOpenDocument,
}: {
  caseId: string;
  claimantName: string;
  requirement?: DatasetRequirementRecord;
  evidenceDocument: DynamicDocumentData | null;
  onOpenDocument: () => void;
}) {
  const requirementName = requirement?.label ?? 'Requirement';
  const requirementStatus = requirement?.status ?? 'Unknown';
  const requirementSummary = requirement
    ? `${requirement.category} requirement from ${requirement.source ?? requirement.trigger ?? 'the active case context'}${requirement.dueDate ? `, due ${requirement.dueDate}` : ''}.`
    : 'No requirement record is linked to this task in the active dataset.';

  return (
    <>
      <div className="shrink-0 border-b border-border-default bg-white px-6 py-4">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25px]">
          <span className={requirementStatus === 'Fulfilled' ? 'text-brand-green' : 'text-brand-orange'}>{requirementStatus}</span>
        </div>
        <h2 className="text-[18px] font-semibold leading-tight text-text-heading">{requirementName}</h2>
        <p className="mt-1 text-[12px] text-text-secondary">{claimantName} · {caseId}</p>
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

