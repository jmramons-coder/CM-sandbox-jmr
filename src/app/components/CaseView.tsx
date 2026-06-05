import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTableHorizontalScroll } from '../hooks/useTableHorizontalScroll';
import { moduleTableScrollContainerClass } from '../utils/module-table-scroll';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import {
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  History,
  Maximize2,
  X,
  Clock,
  Search,
  MessageSquareText,
  Lightbulb,
  ListChecks,
  ClipboardList,
  ExternalLink,
  Download,
  Check,
  MoreVertical,
  Pencil,
  Trash2,
  Briefcase,
  ClipboardCheck,
  FileText,
  Save,
  Scale,
  Gauge,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { getCaseOverview } from '../data/mock-cases';
import { resolveCaseRouteId } from '../data/demoCaseIds';
import { deleteEntity, upsertRequirement } from '../data/datasetMutations';
import { approveNb66RequirementGatheringPackage, isNb66RecommendRequirementsTask } from '../data/nb66RequirementGatheringActions';
import { isTaskCompleteActionSuccess, runTaskWorkflowAction } from '../data/workflowActions';
import { useActiveUser } from '../contexts/ActiveUserContext';
import { useCasesNav } from '../contexts/CasesNavContext';
import { AiCueSparkle } from './AiCueSparkle';
import { AiInsightCell, AiInsightInline } from './index';
import { LozengeTag } from './LozengeTag';
import { Checkbox } from './ui/checkbox';
import { DecisionTab } from './DecisionTab';
import { getInsightBundle } from './caseInsightsData';
import { AiClientProfilePanel } from './AiClientProfilePanel';
import { CaseCopilotPanel } from './copilot/CaseCopilotPanel';
import { CaseInsightsPanel } from './CaseInsightsPanel';
import type { CaseDocument, CaseOverview, CasePhase, CaseRequirement, HumanDecision, Task } from '../types';
import type { UnderwritingScoring, UnderwritingScoringItem } from '../domain/objectRefs';
import { resolveTaskForCaseContextRow } from '../utils/caseContextualTask';
import { appToast } from '../utils/app-toast';
import { applyDecisionToCaseWorkflow } from '../utils/applyDecisionToCaseWorkflow';
import { isSemiAutoTask } from '../utils/taskReviewProjection';
import { TaskDetailEmbeddedView, TaskDetailSidePanel, type TaskPanelNavigationPayload } from './TaskDetailSidePanel';
import {
  documentIdFromPanelContext,
  documentPanelContextId,
  pushWorkspacePanelContext,
  requirementPanelContextId,
  taskPanelContextId,
} from '../utils/workspacePanelContextUtils';
import { CreateTaskModal } from './CreateTaskModal';
import { RequirementContextBody } from './RequirementContextBody';
import { WorkspaceObjectSidePanel, type WorkspacePanelContext } from './WorkspaceObjectSidePanel';
import { DynamicDocumentSidePanel, type DynamicDocumentData } from './DynamicDocumentSidePanel';
import { AiActivityToast, type AiActivitySequence } from './AiActivityToast';
import { deleteScoringItem, upsertScoringItem, type ScoringItemType } from '../domain/scoring';
import { useLiveContextOverlay } from '../contexts/LiveContextProvider';
import { buildCaseDocumentPanelData } from '../utils/buildCaseDocumentPanelData';
import { getDefaultSidePanelWidth, getDocumentSidePanelWidth, resolveDocumentSidePanelWidth } from '../utils/sidepanel-width';
import { useDataSourceSettings, usePlatformSettings, useResolvedSystemDataset } from '../contexts/PlatformSettingsContext';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';
import { getCaseType, parseCaseTypeCodeFromId, resolveCopy } from '../domain/caseTypes';
import { claimSubTypeLabel, resolveClaimSubType } from '../domain/claimSubTypes';
import { copilotClaimContextHint } from '../domain/claimSubTypeContent';
import { buildAssistantReply } from '../domain/assistantReplyBuilder';
import { DEFAULT_DEMO_CASE_ID, DEMO_CASE_IDS } from '../data/demoCaseIds';
import {
  applyWopPostApprovalRestore,
  buildWopOverlayContextualTasks,
  WOP_FALLBACK_COMMUNICATIONS,
} from '../data/wopClaimDemoOverlay';
import { useCaseViewGuideEffects } from '../hooks/useCaseViewGuideEffects';
import { PriorityChip, SectionLabel } from './ds';
import { WorkspaceAssistantPanel } from './WorkspaceAssistantPanel';
import { ModuleTabsBar } from './ModuleTabsBar';
import { useViewportLayout } from '../hooks/useViewportLayout';
import { setCaseCopilotPanelOpenAttribute } from '../hooks/useCaseBriefCompanionPanelOpen';
import { AI_PANEL_MIN_WIDTH, clampAiPanelWidth, defaultAiPanelWidth } from '../utils/caseViewAiPanelUtils';
import { APP_EVENTS, STORAGE_KEYS } from '../constants/storage-keys';
import { isGlobalCopilotOwningCase, notifyGlobalCopilotTaskOutcome, requestGlobalCopilotCaseFocus } from '../utils/caseGlobalCopilotFocus';
import { caseWorkspaceIdsMatch } from '../utils/caseWorkspaceSurface';
import { taskOutcomeAlternateIds } from '../domain/copilotSessionMessages';
import {
  scoringPanelContextId,
  usesScoringSidePanel,
} from '../utils/underwritingScoringPresentation';
import {
  buildCaseWorkspaceObjectHref,
  openCaseWorkspaceObject,
  type FocusCaseWorkspaceObjectDetail,
  type OpenCaseWorkspaceObjectHandler,
  type OpenCaseWorkspaceObjectInput,
} from '../utils/openCaseWorkspaceObject';
import {
  CaseDocumentMobileCard,
  CaseRequirementMobileCard,
  CaseTaskMobileCard,
} from './cases/CaseTabMobileCards';
import { CaseDocumentsTable } from './cases/CaseDocumentsTable';
import { CaseRequirementsTable } from './cases/CaseRequirementsTable';
import { CaseTasksTable } from './cases/CaseTasksTable';
import { CaseOverviewTab } from './cases/CaseOverviewTab';
import { buildCaseBrief } from '../data/caseBrief';
import { CaseRequirementModal } from './cases/CaseRequirementModal';
import { ScoreItemModal, UnderwritingScoringTab } from './cases/CaseScoringPanel';
import { CaseScoringApplicantAffordance, CaseScoringSidePanel } from './cases/CaseScoringSidePanel';
import { CaseLegacyWorkflowStepper } from './cases/CaseLegacyWorkflowStepper';
import { CaseCommunicationsList, CaseHistoryEventsList, CaseRelationshipsList } from './cases/CaseSecondaryTabLists';
import { CaseStageLensBanner } from './cases/CaseStageLensBanner';
import { CaseTabToolbar } from './cases/CaseTabToolbar';
import { WorkflowMetaSubway } from './cases/CaseWorkflowMap';
import {
  enrichLegacyStepStates,
  isStepSelectable,
  matchesStageLens,
  resolveLensBannerMode,
  resolveLensStepLabel,
  resolveProgressOrder,
  resolveWorkflowSteps,
  usesExactStageLens,
} from '../utils/caseStageLens';
import {
  CASE_TAB_ORDER,
  caseTabFromWorkflowLabel,
  documentToCaseContextRow,
  resolveCaseTabDisplayLabel,
  resolveCaseWorkspaceTabIcon,
  resolveCaseWorkspaceTabLabel,
  RESTORABLE_CASE_TABS,
  richValueClass,
  type CaseDocumentContextRow,
  type CaseRelationshipRow,
  type CaseTab,
} from './cases/caseViewTypes';

/** Desktop tabs that render a data table (others are list/card-only). */
const CASE_TABS_WITH_TABLE = new Set<CaseTab>(['tasks', 'requirements', 'documents']);
import { requirementExternalCode, requirementExternalHref } from '../utils/caseViewRequirementUtils';
import { deriveDocumentSummaryTitle, documentSummarySubtitle } from '../utils/summaryText';
import {
  SummaryTableColumnHeader,
  TABLE_LINK_CLASS,
  TABLE_SUBTEXT_CLASS,
  TABLE_TEXT_CLASS,
  TableFirstColumnContent,
  TaskTableFirstColumnCell,
  TwoLineSummaryCell,
} from './ModuleCellHelpers';
import { getStatusLozengeType } from '../utils/status-display';
import {
  sortCaseDocumentsByRelevance,
  sortCaseTaskRowsByRelevance,
  sortRequirementsByRelevance,
} from '../utils/module-relevance-sort';
import {
  filterDatasetBySettings,
  getSystemDataset,
  listActivityEvents,
  listCaseSummaries,
  listCommunications,
  listDocuments,
  listRequirements,
  listTasks,
} from '../data/objectRepository';
import { isEntityEnabled, resolveEffectiveCaseTypeAnatomy } from '../domain/runtimeDataConfig';

export function CaseView({
  dataOverride,
  singlePhase,
  breadcrumb,
}: {
  dataOverride?: CaseOverview;
  singlePhase?: CasePhase;
  breadcrumb?: React.ReactNode;
} = {}) {
  const { caseId: routeCaseId = DEFAULT_DEMO_CASE_ID } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addOpenCase } = useCasesNav();
  const [activeTab, setActiveTab] = useState<CaseTab>('overview');
  const prevCaseTabRef = useRef(activeTab);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPanelExiting, setAiPanelExiting] = useState(false);
  const [tabViews, setTabViews] = useState<Record<Exclude<CaseTab, 'overview' | 'decision'>, 'table' | 'list'>>({
    tasks: 'table',
    requirements: 'table',
    communications: 'table',
    documents: 'table',
    requests: 'table',
    related_cases: 'table',
    history: 'table',
  scoring: 'table',
  licensing: 'table',
  contracts: 'table',
  activation: 'table',
  });
  const [stageLensOrder, setStageLensOrder] = useState<number | null>(null);
  const [tabSearchQueries, setTabSearchQueries] = useState<Partial<Record<'tasks' | 'documents' | 'requirements', string>>>({});
  const [selectedRequirementIds, setSelectedRequirementIds] = useState<Array<number | string>>([]);
  const [reqPhaseTab, setReqPhaseTab] = useState<'pre-approval' | 'post-approval'>('pre-approval');
  const [showAddReqModal, setShowAddReqModal] = useState(false);
  const [editingReq, setEditingReq] = useState<CaseRequirement | null>(null);
  const [reqKebabOpen, setReqKebabOpen] = useState<number | null>(null);
  const [panelWidth, setPanelWidth] = useState(() =>
    typeof window !== 'undefined' ? defaultAiPanelWidth(window.innerWidth) : AI_PANEL_MIN_WIDTH,
  );
  const [isResizing, setIsResizing] = useState(false);
  const [phaseTransition, setPhaseTransition] = useState<'idle' | 'completing' | 'scrolling'>('idle');
  const [selectionMenu, setSelectionMenu] = useState<{ visible: boolean; x: number; y: number; text: string }>({
    visible: false,
    x: 0,
    y: 0,
    text: '',
  });
  const [expandedSections, setExpandedSections] = useState({
    claimantPlan: true,
    insured: false,
    beneficiary: false,
    benefits: false,
  });
  const [tasksTableScrollEl, setTasksTableScrollEl] = useState<HTMLDivElement | null>(null);
  const [requirementsTableScrollEl, setRequirementsTableScrollEl] = useState<HTMLDivElement | null>(null);
  const [documentsTableScrollEl, setDocumentsTableScrollEl] = useState<HTMLDivElement | null>(null);
  const tasksTableScroll = useTableHorizontalScroll(tasksTableScrollEl);
  const requirementsTableScroll = useTableHorizontalScroll(requirementsTableScrollEl);
  const documentsTableScroll = useTableHorizontalScroll(documentsTableScrollEl);
  const [selectedCaseTask, setSelectedCaseTask] = useState<Task | null>(null);
  const [taskDetailPanelWidth, setTaskDetailPanelWidth] = useState(() => getDefaultSidePanelWidth({ min: 420 }));
  const [taskDetailPanelResizing, setTaskDetailPanelResizing] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<CaseRequirement | null>(null);
  const [selectedCaseDocument, setSelectedCaseDocument] = useState<CaseDocumentContextRow | null>(null);
  const [reqDetailPanelWidth, setReqDetailPanelWidth] = useState(() => getDefaultSidePanelWidth({ min: 420 }));
  const [reqDetailPanelResizing, setReqDetailPanelResizing] = useState(false);
  const [docDetailPanelWidth, setDocDetailPanelWidth] = useState(() => getDocumentSidePanelWidth());
  const [docDetailPanelResizing, setDocDetailPanelResizing] = useState(false);
  const [casePanelContexts, setCasePanelContexts] = useState<WorkspacePanelContext[]>([]);
  const [activeCasePanelContextId, setActiveCasePanelContextId] = useState('');
  const openCasePanelContext = useCallback((context: WorkspacePanelContext) => {
    setCasePanelContexts((current) => pushWorkspacePanelContext(current, context));
    setActiveCasePanelContextId(context.id);
  }, []);
  const closeCaseSidePanel = useCallback(() => {
    setCasePanelContexts([]);
    setActiveCasePanelContextId('');
    setSelectedCaseTask(null);
    setSelectedRequirement(null);
    setSelectedCaseDocument(null);
  }, []);
  const [aiActivitySeq, setAiActivitySeq] = useState<AiActivitySequence | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const bumpData = useCallback(() => setDataVersion((v) => v + 1), []);
  const { isCompactShell } = useViewportLayout();
  const caseCardListTabs = new Set<CaseTab>(['tasks', 'documents', 'requirements']);
  const forceCaseCardList = isCompactShell && caseCardListTabs.has(activeTab);
  /** Tabs that render their own full main area (not the shared card/list scroll region). */
  const caseTabsWithDedicatedMain = new Set<CaseTab>(['scoring']);
  const showCaseTabList =
    forceCaseCardList
    || tabViews[activeTab as Exclude<CaseTab, 'overview' | 'decision'>] === 'list'
    || (!CASE_TABS_WITH_TABLE.has(activeTab) && !caseTabsWithDedicatedMain.has(activeTab));
  const [decisionModalSignal, setDecisionModalSignal] = useState(0);
  const [newCaseTaskReady, setNewCaseTaskReady] = useState(false);
  const [newTaskBadge, setNewTaskBadge] = useState(false);
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null);
  const [benefitIncrease, setBenefitIncrease] = useState(false);
  const [benefitSeen, setBenefitSeen] = useState(false);
  const [benefitPopupForced, setBenefitPopupForced] = useState(false);
  const [overdueTaskReady, setOverdueTaskReady] = useState(false);
  const [overdueTaskCompleted, setOverdueTaskCompleted] = useState(false);
  const [reqCascadeStarted, setReqCascadeStarted] = useState(false);
  const [aiActivityEnabled, setAiActivityEnabled] = useState(() => {
    try { return sessionStorage.getItem(STORAGE_KEYS.aiActivityEnabled) !== '0'; } catch { return true; }
  });
  useEffect(() => {
    const sync = () => {
      try { setAiActivityEnabled(sessionStorage.getItem(STORAGE_KEYS.aiActivityEnabled) !== '0'); } catch { /* */ }
    };
    window.addEventListener(APP_EVENTS.aiActivityToggle, sync);
    return () => window.removeEventListener(APP_EVENTS.aiActivityToggle, sync);
  }, []);

  const { settings: platformSettings, updateDataSource } = usePlatformSettings();
  const dataSource = useDataSourceSettings();
  const { profile: activeProfile } = useActiveUser();
  const currency = useCurrencyFormatter();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const activeDataset = useResolvedSystemDataset();
  const caseId = useMemo(
    () => resolveCaseRouteId(routeCaseId, activeDataset),
    [routeCaseId, activeDataset],
  );

  useEffect(() => {
    if (dataOverride) return;
    if (caseId !== routeCaseId) {
      navigate(`/cases/${caseId}${location.search}`, { replace: true });
    }
  }, [caseId, routeCaseId, dataOverride, location.search, navigate]);
  const data = useMemo(
    () =>
      dataOverride ??
      getCaseOverview(caseId, activeDataset, false, {
        anatomy: platformSettings.anatomy,
        enabledObjectDomains: dataSource.enabledObjectDomains,
      }),
    [
      caseId,
      dataOverride,
      activeDataset,
      dataSource.enabledObjectDomains,
      platformSettings.anatomy,
    ],
  );

  const openCaseTaskPanel = useCallback((task: Task | null) => {
    if (!task) {
      closeCaseSidePanel();
      return;
    }
    if (requestGlobalCopilotCaseFocus({ caseId: data.id, kind: 'task', objectId: task.id })) return;
    setSelectedCaseTask(task);
    openCasePanelContext({
      id: taskPanelContextId(task.id),
      label: task.taskId ?? task.id,
      icon: ClipboardList,
      clearable: true,
    });
  }, [closeCaseSidePanel, data.id, openCasePanelContext]);

  const openRequirementPanel = useCallback((requirement: CaseRequirement | null) => {
    if (!requirement) {
      setSelectedRequirement(null);
      return;
    }
    const reqId = String(requirement.datasetRequirementId ?? requirement.id);
    if (requestGlobalCopilotCaseFocus({ caseId: data.id, kind: 'requirement', objectId: reqId })) return;
    setSelectedRequirement(requirement);
    openCasePanelContext({
      id: requirementPanelContextId(String(requirement.datasetRequirementId ?? requirement.id)),
      label: `R-${requirement.datasetRequirementId ?? requirement.id}`,
      icon: ClipboardCheck,
      clearable: true,
    });
  }, [closeCaseSidePanel, data.id, openCasePanelContext]);

  const openCaseDocumentPanel = useCallback((document: CaseDocumentContextRow | null) => {
    if (!document) {
      setSelectedCaseDocument(null);
      return;
    }
    const docId = document.id ?? document.name;
    if (requestGlobalCopilotCaseFocus({ caseId: data.id, kind: 'document', objectId: docId })) return;
    setDocDetailPanelWidth((current) => resolveDocumentSidePanelWidth(current));
    setSelectedCaseDocument(document);
    openCasePanelContext({
      id: documentPanelContextId(document.id ?? document.name),
      label: document.name,
      icon: FileText,
      clearable: true,
    });
  }, [closeCaseSidePanel, data.id, openCasePanelContext]);

  const [scoringDraft, setScoringDraft] = useState(data.underwritingScoring);
  const scoringSidePanelEnabled = usesScoringSidePanel(scoringDraft);
  const scoringPanelActive =
    Boolean(activeCasePanelContextId)
    && activeCasePanelContextId === scoringPanelContextId(data.id);

  const scoringPanelContext = useMemo((): WorkspacePanelContext | null => {
    if (!scoringSidePanelEnabled || !scoringDraft) return null;
    return {
      id: scoringPanelContextId(data.id),
      label: 'Scoring',
      icon: Gauge,
      clearable: false,
    };
  }, [data.id, scoringDraft, scoringSidePanelEnabled]);

  const openScoringPanel = useCallback(() => {
    if (!scoringPanelContext) return;
    openCasePanelContext(scoringPanelContext);
  }, [openCasePanelContext, scoringPanelContext]);

  const casePanelContextsWithScoring = useMemo(() => {
    if (!scoringPanelContext || casePanelContexts.length === 0) return casePanelContexts;
    if (casePanelContexts.some((ctx) => ctx.id === scoringPanelContext.id)) return casePanelContexts;
    return [...casePanelContexts, scoringPanelContext];
  }, [casePanelContexts, scoringPanelContext]);
  const [scoreModal, setScoreModal] = useState<{ type: ScoringItemType; item?: UnderwritingScoringItem } | null>(null);
  useEffect(() => {
    setScoringDraft(data.underwritingScoring);
  }, [data.id, data.underwritingScoring]);
  const updateScoring = useCallback((next: UnderwritingScoring) => {
    setScoringDraft(next);
    data.underwritingScoring = next;
    bumpData();
  }, [bumpData, data]);
  const updateRequirementNotes = useCallback((requirementId: CaseRequirement['id'], notes: string) => {
    const target = data.requirements.find((row) => row.id === requirementId);
    if (target) target.notes = notes || undefined;
    setSelectedRequirement((prev) => (
      prev && prev.id === requirementId ? { ...prev, notes: notes || undefined } : prev
    ));
    bumpData();
  }, [bumpData, data]);
  const openScoreModal = useCallback((type: ScoringItemType, item?: UnderwritingScoringItem) => {
    setScoreModal({ type, item });
  }, []);
  const saveScoreItem = useCallback((item: UnderwritingScoringItem) => {
    if (!scoringDraft || !scoreModal) return;
    updateScoring(upsertScoringItem(scoringDraft, scoreModal.type, item));
    setScoreModal(null);
    appToast.success('Scoring factor saved');
  }, [scoreModal, scoringDraft, updateScoring]);
  const deleteScoreItem = useCallback(() => {
    if (!scoringDraft || !scoreModal?.item) return;
    updateScoring(deleteScoringItem(scoringDraft, scoreModal.type, scoreModal.item.id));
    setScoreModal(null);
  }, [scoreModal, scoringDraft, updateScoring]);
  const caseSummary = useMemo(
    () => listCaseSummaries(activeDataset).find((item) => item.id === caseId),
    [activeDataset, caseId],
  );

  /* Resolve case type from the id prefix and look it up in the registry. */
  const casesAiAssistantEnabled = platformSettings.preferences.casesAiAssistantEnabled !== false;
  const caseType = useMemo(
    () => getCaseType(parseCaseTypeCodeFromId(caseId), platformSettings.caseTypes),
    [caseId, platformSettings.caseTypes],
  );
  const caseTypeCopy = useMemo(() => resolveCopy(caseType), [caseType]);
  const caseAnatomy = useMemo(
    () => resolveEffectiveCaseTypeAnatomy(data.caseKind, platformSettings.anatomy, dataSource.enabledObjectDomains),
    [data.caseKind, platformSettings.anatomy, dataSource.enabledObjectDomains],
  );

  // Live context: case + active tab; refines further when a task or requirement is opened.
  const tabLabel = resolveCaseTabDisplayLabel(activeTab, {
    anatomy: caseAnatomy,
    workflowTabLabels: data.workflowMeta?.tabs,
  });
  const baseHref = `/cases/${caseId}${activeTab === 'overview' ? '' : `#tab=${activeTab}`}`;
  const caseTabOverlay = useMemo(
    () => ({
      id: `case:${caseId}:${activeTab}`,
      kind: activeTab === 'overview' ? ('caseDetail' as const) : ('caseTab' as const),
      icon: Briefcase,
      crumbs: activeTab === 'overview' ? ['Cases', caseId] : ['Cases', caseId, tabLabel],
      label: activeTab === 'overview' ? caseId : `${caseId} · ${tabLabel}`,
      href: baseHref,
    }),
    [caseId, activeTab, tabLabel, baseHref],
  );
  useLiveContextOverlay(caseTabOverlay);

  const taskOverlay = useMemo(
    () =>
      selectedCaseTask
        ? {
            id: `case:${caseId}:task:${selectedCaseTask.id}`,
            kind: 'caseTask' as const,
            icon: ClipboardList,
            crumbs: ['Cases', caseId, 'Tasks', selectedCaseTask.id],
            label: `${caseId} · Task ${selectedCaseTask.id}`,
            href: `/cases/${caseId}#tab=tasks&task=${selectedCaseTask.id}`,
          }
        : null,
    [caseId, selectedCaseTask],
  );
  useLiveContextOverlay(taskOverlay);

  const requirementOverlay = useMemo(
    () =>
      selectedRequirement
        ? {
            id: `requirement:${selectedRequirement.datasetRequirementId ?? selectedRequirement.id}`,
            kind: 'caseRequirement' as const,
            icon: ClipboardCheck,
            crumbs: ['Cases', caseId, 'Requirements', String(selectedRequirement.datasetRequirementId ?? selectedRequirement.id)],
            label: `${caseId} · ${selectedRequirement.name}`,
            href: `/cases/${caseId}#tab=requirements&req=${encodeURIComponent(String(selectedRequirement.datasetRequirementId ?? selectedRequirement.id))}`,
          }
        : null,
    [caseId, selectedRequirement],
  );
  useLiveContextOverlay(requirementOverlay);

  useEffect(() => {
    if (data.caseKind === 'new_business' && activeTab === 'activation') {
      setActiveTab(scoringSidePanelEnabled || !data.underwritingScoring ? 'requirements' : 'scoring');
    }
  }, [activeTab, data.caseKind, data.underwritingScoring, scoringSidePanelEnabled]);

  useCaseViewGuideEffects(location.search, data, {
    setActiveTab,
    setBenefitIncrease,
    setBenefitPopupForced,
    setBenefitSeen,
    setReqPhaseTab,
    setNewCaseTaskReady,
    setNewTaskBadge,
    openCaseTaskPanel,
    bumpData,
  });

  const [aiToastPauseAfter, setAiToastPauseAfter] = useState<string | null>('create-case');
  useEffect(() => {
    if (caseId === DEMO_CASE_IDS.wopClaim && aiToastPauseAfter === 'create-case') {
      const timer = setTimeout(() => setAiToastPauseAfter('nc-restore'), 500);
      return () => clearTimeout(timer);
    }
  }, [caseId, aiToastPauseAfter]);
  useEffect(() => {
    if (caseId === DEMO_CASE_IDS.wopClaim && activeTab === 'requirements' && aiToastPauseAfter === 'nc-restore') {
      const timer = setTimeout(() => setAiToastPauseAfter(null), 300);
      return () => clearTimeout(timer);
    }
  }, [caseId, activeTab, aiToastPauseAfter]);

  useEffect(() => {
    if (caseId !== DEMO_CASE_IDS.wopClaim || !overdueTaskCompleted || reqCascadeStarted) return;
    if (activeTab !== 'requirements') return;
    setReqCascadeStarted(true);
    const reqs = data.requirements;
    const pending = reqs.filter((r) => r.status !== 'Fulfilled' && r.status !== 'Completed');
    let idx = 0;
    const cascadeNext = () => {
      if (idx >= pending.length) {
        data.activeStage = 4;
        data.decisionTabState = 'active';
        if (caseSummary) caseSummary.status = 'Active: Case Completion';
        data.caseStatus = 'Active: Case Completion';
        bumpData();
        if (aiActivityEnabled) {
          setAiActivitySeq({
            id: `completion-${Date.now()}`,
            title: 'AI Crew — Case Completion',
            stepDelayMs: 700,
            startedAt: Date.now(),
            steps: [
              { id: 'cc-verify', label: 'Verifying all requirements fulfilled', status: 'pending' },
              { id: 'cc-assess', label: 'Running final recovery assessment — 94% confidence', status: 'pending' },
              { id: 'cc-rtw', label: 'Return-to-work confirmation received from employer', status: 'pending' },
              { id: 'cc-rec', label: 'Recommendation: Close Case — recovery complete', status: 'pending' },
              { id: 'cc-ready', label: 'Decision tab unlocked — ready for final review', status: 'pending' },
            ],
          });
        }
        return;
      }
      pending[idx].status = 'Fulfilled';
      pending[idx].rag = 'Green';
      idx++;
      bumpData();
      setTimeout(cascadeNext, 800);
    };
    const timer = setTimeout(cascadeNext, 1500);
    return () => clearTimeout(timer);
  }, [caseId, activeTab, overdueTaskCompleted, reqCascadeStarted, data, caseSummary, bumpData]);

  const relatedCases = useMemo(
    () => listCaseSummaries(activeDataset).filter((c) => c.claimant === data.claimantName && c.id !== data.id),
    [activeDataset, data.claimantName, data.id],
  );
  const workflowMeta = data.workflowMeta;
  const workflowContextSlots = workflowMeta?.contextBar ? [...workflowMeta.contextBar].sort((a, b) => a.slot - b.slot) : [];
  const isScoringContextSlot = (label: string) => {
    const normalized = label.trim().toLowerCase();
    return normalized === 'scoring' || normalized === 'decision';
  };
  const richGeneralInfoCards = data.generalInformation?.cards ?? [];
  const richGeneralInfoCollapsibles = data.generalInformation?.collapsibles ?? [];
  const structuredGeneralSections =
    data.generalInformation?.sections?.filter((section) => section.enabled !== false) ?? [];
  /** Dataset-driven GI (SBLI / Guardian): skip hardcoded anatomy / Claimant & Plan fallbacks. */
  const hasDatasetGeneralInformation =
    richGeneralInfoCards.length > 0 ||
    richGeneralInfoCollapsibles.length > 0 ||
    Boolean(data.generalInformation?.aiSummary?.text) ||
    structuredGeneralSections.length > 0;
  const contextMetrics = data.contextCard?.headlineMetrics ?? [];
  const contextMetric = (id: string) => contextMetrics.find((metric) => metric.id === id);
  const primaryPartyMetric = contextMetric('primary-party');
  const planMetric = contextMetric('plan');
  const benefitMetric = contextMetric('monthly-benefit');
  const productMetric = contextMetric('product');
  const primaryPartyDisplayName = data.primaryPartyPolicyRole
    ? `${data.claimantName} (${data.primaryPartyPolicyRole})`
    : data.claimantName;
  const relationshipRows = useMemo<CaseRelationshipRow[]>(() => {
    const rows: CaseRelationshipRow[] = [];
    const addRef = (ref: NonNullable<CaseOverview['linkedObjects']>[number] | CaseOverview['primaryParty'], fallbackRelationship: string) => {
      if (!['case', 'client', 'policy', 'agent', 'application'].includes(ref.kind)) return;
      if (ref.kind === 'case' && ref.id === data.id) return;
      const id = `${ref.kind}-${ref.id}`;
      if (rows.some((row) => row.id === id)) return;
      rows.push({
        id,
        kind: ref.kind as CaseRelationshipRow['kind'],
        label: ref.label ?? ref.id,
        relationship: ref.role ?? fallbackRelationship,
        status: ref.kind === 'case' ? listCaseSummaries(activeDataset).find((item) => item.id === ref.id)?.status : undefined,
        details: ref.summary,
        href: ref.href ?? (ref.kind === 'case' ? `/cases/${encodeURIComponent(ref.id)}` : `/folders/${encodeURIComponent(ref.id)}`),
      });
    };
    if (data.primaryParty) addRef(data.primaryParty, data.primaryPartyLabel ?? 'Primary party');
    data.participants?.forEach((ref) => addRef(ref, ref.role ?? 'Participant'));
    data.linkedObjects?.forEach((ref) => addRef(ref, 'Linked entity'));
    relatedCases.forEach((related) => {
      const id = `case-${related.id}`;
      if (rows.some((row) => row.id === id)) return;
      rows.push({
        id,
        kind: 'case',
        label: related.id,
        relationship: 'Related case for same primary party',
        status: related.status,
        details: `${related.product} · ${currency.localize(related.benefit)}`,
        href: `/cases/${encodeURIComponent(related.id)}`,
      });
    });
    return rows;
  }, [activeDataset, data.id, data.linkedObjects, data.participants, data.primaryParty, data.primaryPartyLabel, relatedCases]);
  const preApprovalReqs = useMemo(() => data.requirements.filter((r) => r.phase === 'pre-approval'), [data.requirements]);
  const postApprovalReqs = useMemo(() => data.requirements.filter((r) => r.phase === 'post-approval'), [data.requirements]);
  const selectedRequirementRecord = useMemo(() => {
    if (!selectedRequirement) return undefined;
    if (selectedRequirement.datasetRequirementId) {
      return activeDataset.requirements.find((requirement) => requirement.id === selectedRequirement.datasetRequirementId);
    }
    const requirementRef = selectedRequirement.objectRefs?.find((ref) => ref.kind === 'requirement');
    if (requirementRef) {
      return activeDataset.requirements.find((requirement) => requirement.id === requirementRef.id);
    }
    return activeDataset.requirements.find((requirement) =>
      requirement.label === selectedRequirement.name &&
      requirement.linkedObjects.some((ref) => ref.kind === 'case' && ref.id === data.id),
    );
  }, [activeDataset.requirements, data.id, selectedRequirement]);
  const selectedRequirementDocuments = useMemo(() => {
    if (!selectedRequirement) return [];
    const ids = new Set(selectedRequirement.linkedDocs ?? selectedRequirementRecord?.linkedDocs ?? []);
    if (!ids.size) return [];
    return listDocuments(activeDataset, { caseId: data.id }).filter((document) => ids.has(document.id));
  }, [activeDataset, data.id, selectedRequirement, selectedRequirementRecord]);
  const selectedRequirementTasks = useMemo(() => {
    if (!selectedRequirement) return [];
    const ids = new Set(selectedRequirement.linkedTasks ?? selectedRequirementRecord?.linkedTasks ?? []);
    if (!ids.size) return [];
    return listTasks(activeDataset, { caseId: data.id }).filter((task) => ids.has(task.id) || Boolean(task.taskId && ids.has(task.taskId)));
  }, [activeDataset, data.id, selectedRequirement, selectedRequirementRecord]);
  const filteredRequirements = reqPhaseTab === 'pre-approval' ? preApprovalReqs : postApprovalReqs;

  const requirementTotalCount = data.requirements.length;
  const requirementCompletedCount = data.requirements.filter((item) => item.status === 'Fulfilled' || item.status === 'Waived').length;
  const requirementCompletionPct = requirementTotalCount > 0 ? Math.round((requirementCompletedCount / requirementTotalCount) * 100) : 0;

  const phaseReqTotal = filteredRequirements.length;
  const phaseReqCompleted = filteredRequirements.filter((r) => r.status === 'Fulfilled' || r.status === 'Waived').length;
  const phaseReqPct = phaseReqTotal > 0 ? Math.round((phaseReqCompleted / phaseReqTotal) * 100) : 0;
  const phaseReqBarColor = phaseReqPct >= 60 ? '#008533' : '#f5a200';

  const preReqCompleted = preApprovalReqs.filter((r) => r.status === 'Fulfilled' || r.status === 'Waived').length;
  const preReqPct = preApprovalReqs.length > 0 ? Math.round((preReqCompleted / preApprovalReqs.length) * 100) : 0;
  const postReqCompleted = postApprovalReqs.filter((r) => r.status === 'Fulfilled' || r.status === 'Waived').length;
  const postReqPct = postApprovalReqs.length > 0 ? Math.round((postReqCompleted / postApprovalReqs.length) * 100) : 0;

  const isPostApprovalPhase = data.phase === 'post-approval';
  const hasPostApprovalReqs = postApprovalReqs.length > 0;

  const reqCountByStatus = useMemo(() => {
    const counts: Record<string, number> = { Fulfilled: 0, Pending: 0, Overdue: 0, Waived: 0, Completed: 0 };
    for (const r of filteredRequirements) counts[r.status] = (counts[r.status] || 0) + 1;
    return counts;
  }, [filteredRequirements]);
  const requirementKpis = useMemo(() => {
    const completed = data.requirements.filter((item) =>
      item.status === 'Fulfilled' || item.status === 'Waived' || item.status === 'Completed',
    ).length;
    const overdue = data.requirements.filter((item) => item.status === 'Overdue').length;
    const pending = data.requirements.filter((item) => item.status === 'Pending').length;
    const ordered = data.requirements.filter((item) => item.status === 'Ordered').length;
    const needsAttention = overdue + pending;
    return { completed, overdue, pending, ordered, needsAttention };
  }, [data.requirements]);
  const reqBarColor = requirementCompletionPct >= 60 ? '#008533' : requirementCompletionPct >= 25 ? '#f5a200' : '#f5a200';

  const fullCaseStatus = workflowMeta?.status ?? caseSummary?.status ?? data.caseStatus;
  const caseStatusShort = fullCaseStatus.startsWith('Closed:') ? fullCaseStatus : fullCaseStatus.split(':')[0]?.trim() || data.caseStatus;
  const caseStatusLozengeType = (() => {
    const fullStatus = caseSummary?.status ?? data.caseStatus;
    if (fullStatus === 'Declined' || fullStatus === 'Terminated: Declined') return 'Alert' as const;
    if (fullStatus.startsWith('Terminated:')) return 'Neutral' as const;
    if (fullStatus.startsWith('Closed:')) return 'Neutral' as const;
    if (fullStatus === 'Approved') return 'Success' as const;
    if (fullStatus.startsWith('Active')) return 'Informative' as const;
    if (fullStatus === 'Pending Requirements' || fullStatus === 'Pending Decision' || fullStatus === 'In Progress') return 'Warning' as const;
    return 'Informative' as const;
  })();

  const aiBanner = useMemo(() => {
    const completed = data.decisionTabState === 'completed';
    const human = data.humanDecision?.decisionType;

    if (data.phase === 'post-approval' && completed && human === 'approve') {
      if (data.activeStage === 1) {
        return {
          contextLabel: 'Restoration planning',
          narrative:
            'Claim approved — meet with the client to review the Guardian restoration plan (physician cadence, PT, RTW guardrails) before Recovery Underway. AI proposes three interview slots from your calendar; the claimant picks a time on the portal or email, and the matching task appears in My Tasks when they respond.',
          badgeLabel: 'Schedule meeting',
          badgeTone: 'success' as const,
        };
      }
      return {
        contextLabel: 'Case monitoring',
        narrative: `Post-approval journey in progress for ${data.claimantName}. Follow tasks and requirements through Recovery, Monitoring, and RTW planning — AI surfaces risks and milestones as the case evolves.`,
        badgeLabel: 'Monitor',
        badgeTone: 'info' as const,
      };
    }

    if (data.phase === 'post-approval' && completed && human && human !== 'approve') {
      return {
        contextLabel: 'Claims Analysis',
        narrative:
          human === 'decline'
            ? 'Decision recorded. Complete claimant communications and closure tasks per policy workflow — review tasks and the Communications tab for next steps.'
            : human === 'modified_offer'
              ? 'Modified offer recorded. Notify the claimant and track acceptance through tasks and communications.'
              : 'Information request recorded. Gather outstanding items from tasks before revisiting the decision.',
        badgeLabel: human === 'decline' ? 'Declined' : human === 'modified_offer' ? 'Modified offer' : 'Info request',
        badgeTone: human === 'decline' ? ('danger' as const) : ('warning' as const),
      };
    }

    if (data.phase === 'pre-approval' && completed && human === 'approve') {
      return {
        contextLabel: 'Restoration planning',
        narrative:
          'Claim approved — moving to post-approval. Your next priority is the restoration plan interview: schedule with the claimant to align on the plan before Recovery Underway (see My Tasks).',
        badgeLabel: 'Approved',
        badgeTone: 'success' as const,
      };
    }

    if (data.phase === 'pre-approval' && !completed) {
      const locked = data.decisionTabState === 'locked';
      return {
        contextLabel: 'Claims Analysis',
        narrative: locked
          ? (data.headerCallout ?? 'Complete outstanding requirements before opening the Decision tab.')
          : data.aiNarrative,
        badgeLabel: data.aiRecommendation,
        badgeTone:
          data.aiRecommendation === 'Approve'
            ? ('success' as const)
            : data.aiRecommendation === 'Close'
              ? ('info' as const)
              : ('warning' as const),
      };
    }

    return {
      contextLabel: 'Claims Analysis',
      narrative: data.aiNarrative,
      badgeLabel: data.aiRecommendation,
      badgeTone:
        data.aiRecommendation === 'Approve'
          ? ('success' as const)
          : data.aiRecommendation === 'Close'
            ? ('info' as const)
            : ('warning' as const),
    };
  }, [
    data.phase,
    data.decisionTabState,
    data.activeStage,
    data.aiNarrative,
    data.aiRecommendation,
    data.headerCallout,
    data.claimantName,
    data.humanDecision?.decisionType,
  ]);

  const isDecisionStep =
    data.phase === 'pre-approval' &&
    data.preApprovalStages.length > 0 &&
    data.activeStage === data.preApprovalStages.length;
  const effectivePhase = singlePhase ?? data.phase;
  const isStepperBusy = phaseTransition !== 'idle';
  const activeStepForPhase = data.activeStage;
  const isTerminated = (caseSummary?.status ?? data.caseStatus).startsWith('Terminated:');

  const workflowLensSteps = useMemo(
    () => enrichLegacyStepStates(resolveWorkflowSteps(data), resolveProgressOrder(data)),
    [data],
  );

  const handleStageLensSelect = useCallback(
    (order: number) => {
      if (isStepperBusy) return;
      const step = workflowLensSteps.find((item) => item.order === order);
      if (!step || !isStepSelectable(step.state)) return;
      setStageLensOrder((current) => (current === order ? null : order));
    },
    [isStepperBusy, workflowLensSteps],
  );

  useEffect(() => {
    if (!dataOverride) addOpenCase(caseId);
    const phase = singlePhase ?? (data.phase === 'post-approval' ? 'post-approval' : 'pre-approval');
    setReqPhaseTab(phase);
    setSelectedRequirementIds([]);
    setStageLensOrder(null);
  }, [caseId, addOpenCase, data.phase, dataOverride, singlePhase]);

  useEffect(() => {
    if (!casesAiAssistantEnabled) {
      setShowAIPanel(false);
      setAiPanelExiting(false);
    }
  }, [casesAiAssistantEnabled]);

  const openAiPanel = useCallback(() => {
    if (!casesAiAssistantEnabled) return;
    setAiPanelExiting(false);
    setShowAIPanel(true);
  }, [casesAiAssistantEnabled]);

  const closeAiPanel = useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShowAIPanel(false);
      setAiPanelExiting(false);
      return;
    }
    setAiPanelExiting(true);
  }, []);

  useEffect(() => {
    if (!aiPanelExiting) return;
    const id = window.setTimeout(() => {
      setShowAIPanel(false);
      setAiPanelExiting(false);
    }, 300);
    return () => clearTimeout(id);
  }, [aiPanelExiting]);

  useEffect(() => {
    const open = casesAiAssistantEnabled && showAIPanel && !aiPanelExiting;
    setCaseCopilotPanelOpenAttribute(open);
    return () => setCaseCopilotPanelOpenAttribute(false);
  }, [casesAiAssistantEnabled, showAIPanel, aiPanelExiting]);

  useEffect(() => {
    if (!showAIPanel || aiPanelExiting) return;

    const onPointerDown = (e: PointerEvent) => {
      const aside = aiPanelAsideRef.current;
      if (!aside) return;
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (aside.contains(target)) return;
      const el = target instanceof Element ? target : null;
      if (el?.closest('[data-ai-panel-ignore-outside]')) return;
      // Bubble phase + double rAF: let the browser finish this gesture frame and paint before
      // starting slideOut / overlay fade (capture pointerdown was competing and felt like a flash).
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          closeAiPanel();
        });
      });
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [showAIPanel, aiPanelExiting, closeAiPanel]);

  useEffect(() => {
    if (phaseTransition === 'idle') return;
    let timer: ReturnType<typeof setTimeout>;
    if (phaseTransition === 'completing') {
      timer = setTimeout(() => {
        data.phase = 'post-approval';
        data.stageLabels = data.postApprovalStages;
        data.activeStage = 1;
        setReqPhaseTab('post-approval');
        setPhaseTransition('scrolling');
      }, 1200);
    } else if (phaseTransition === 'scrolling') {
      timer = setTimeout(() => setPhaseTransition('idle'), 700);
    }
    return () => clearTimeout(timer);
  }, [phaseTransition, data]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (event: MouseEvent) => {
      const nextWidth = window.innerWidth - event.clientX;
      setPanelWidth(clampAiPanelWidth(window.innerWidth, nextWidth));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    if (!taskDetailPanelResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      const maxWidth = Math.min(1200, Math.round(window.innerWidth * 0.75));
      if (newWidth >= 420 && newWidth <= maxWidth) setTaskDetailPanelWidth(newWidth);
    };
    const handleMouseUp = () => {
      setTaskDetailPanelResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [taskDetailPanelResizing]);

  useEffect(() => {
    const ctx = activeCasePanelContextId;
    if (!ctx) {
      prevCaseTabRef.current = activeTab;
      return;
    }
    const tabChanged = prevCaseTabRef.current !== activeTab;
    prevCaseTabRef.current = activeTab;
    if (!tabChanged) return;
    if (ctx.startsWith('document:') && activeTab === 'documents') return;
    if (ctx.startsWith('task:') && activeTab === 'tasks') return;
    if (ctx.startsWith('requirement:') && activeTab === 'requirements') return;
    if (ctx.startsWith('scoring:') && (activeTab === 'scoring' || scoringSidePanelEnabled)) return;
    closeCaseSidePanel();
  }, [activeCasePanelContextId, activeTab, closeCaseSidePanel, scoringSidePanelEnabled]);

  useEffect(() => {
    setActiveTab('overview');
    prevCaseTabRef.current = 'overview';
    closeCaseSidePanel();
  }, [caseId, closeCaseSidePanel]);

  useEffect(() => {
    if (!reqDetailPanelResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      const maxWidth = Math.min(1000, Math.round(window.innerWidth * 0.72));
      if (newWidth >= 420 && newWidth <= maxWidth) setReqDetailPanelWidth(newWidth);
    };
    const handleMouseUp = () => setReqDetailPanelResizing(false);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [reqDetailPanelResizing]);

  useEffect(() => {
    if (!docDetailPanelResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      const maxWidth = Math.min(1200, Math.round(window.innerWidth * 0.75));
      if (newWidth >= 520 && newWidth <= maxWidth) setDocDetailPanelWidth(newWidth);
    };
    const handleMouseUp = () => {
      setDocDetailPanelResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [docDetailPanelResizing]);

  useEffect(() => {
    const onResize = () => {
      setPanelWidth((w) => clampAiPanelWidth(window.innerWidth, w));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const handleGlobalMouseDown = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) hideSelectionMenu();
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hideSelectionMenu();
    };
    document.addEventListener('mousedown', handleGlobalMouseDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleGlobalMouseDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hideSelectionMenu = () => {
    setSelectionMenu({ visible: false, x: 0, y: 0, text: '' });
  };

  const handleSummarySelection = (event: React.MouseEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      hideSelectionMenu();
      return;
    }
    const text = selection.toString().trim();
    if (!text) {
      hideSelectionMenu();
      return;
    }
    const anchorNode = selection.anchorNode;
    if (!anchorNode || !event.currentTarget.contains(anchorNode)) {
      hideSelectionMenu();
      return;
    }
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    if (!rect.width && !rect.height) {
      hideSelectionMenu();
      return;
    }
    setSelectionMenu({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      text,
    });
  };

  const insightBundle = useMemo(
    () =>
      getInsightBundle(
        data.id,
        data.phase,
        data.preApprovalStages,
        data.postApprovalStages,
        data.decisionTabState,
        { claimSubType: data.claimSubType, caseKind: data.caseKind },
      ),
    [data.id, data.phase, data.preApprovalStages, data.postApprovalStages, data.decisionTabState, data.claimSubType, data.caseKind],
  );

  const canUseLegacyCaseFallbacks =
    dataSource.legacyMockOverlayEnabled && data.id === DEMO_CASE_IDS.wopClaim;

  const contextualTasks = useMemo(() => {
    const prioritizeCreatedTask = <T extends { id: string }>(rows: T[]) => {
      if (!createdTaskId) return rows;
      const created = rows.find((row) => row.id === createdTaskId);
      if (!created) return rows;
      return [created, ...rows.filter((row) => row.id !== createdTaskId)];
    };
    const datasetRows = listTasks(activeDataset, { caseId: data.id }).map((task) => ({
      id: task.id,
      taskType: task.taskType,
      priority: task.priority === 'URGENT' ? 'Urgent' : task.priority === 'HIGH' ? 'High' : 'Normal',
      status: task.status,
      dueDate: task.slaRemaining,
      stage: task.stage,
      aiGenerated: task.aiGenerated,
      aiConfidence: task.aiConfidence,
      assignee: task.assignedTo || 'Unassigned',
      task,
    }));
    if (!canUseLegacyCaseFallbacks) return prioritizeCreatedTask(datasetRows);
    if (data.id === DEMO_CASE_IDS.wopClaim) {
      return buildWopOverlayContextualTasks({
        data,
        datasetRows,
        overdueTaskReady,
        overdueTaskCompleted,
        newCaseTaskReady,
        prioritizeCreatedTask,
      });
    }
    return prioritizeCreatedTask(datasetRows);
  }, [activeDataset, canUseLegacyCaseFallbacks, data.id, data.phase, data.decisionTabState, newCaseTaskReady, overdueTaskReady, overdueTaskCompleted, dataVersion, createdTaskId]);

  const documents = useMemo(
    () => {
      const datasetRows = listDocuments(activeDataset, { caseId: data.id });
      if (!canUseLegacyCaseFallbacks) return datasetRows;
      return datasetRows.length ? datasetRows : [
        {
          id: 'doc-fallback-1',
          name: 'Orthopaedic surgical report.pdf',
          category: 'Medical',
          status: 'Validated' as const,
          uploaded: 'Feb 4, 2026',
          source: 'hospital_feed',
          aiSummary: 'Consistent surgical findings, no complications, expected recovery trajectory confirmed',
          linkedRequirement: 'Surgical Follow-Up',
          linkedCase: data.id,
          claimantName: data.claimantName,
          fileSize: '—',
        },
        {
          id: 'doc-fallback-2',
          name: 'PT session notes week-03.pdf',
          category: 'Rehabilitation',
          status: 'Validated' as const,
          uploaded: 'Mar 6, 2026',
          source: 'physio_portal',
          aiSummary: 'Minor setback detected — increased knee pain, physiotherapist recommends reduced intensity for 2 weeks',
          linkedRequirement: 'Physical Therapy Appt. (Mar 6)',
          linkedCase: data.id,
          claimantName: data.claimantName,
          fileSize: '—',
        },
        {
          id: 'doc-fallback-3',
          name: 'Medication compliance summary.pdf',
          category: 'Pharmacy',
          status: 'Validated' as const,
          uploaded: 'Mar 12, 2026',
          source: 'pharmacy_check',
          aiSummary: 'Insulin and GLP-1 compliance confirmed via pharmacy records, dietary adherence unverified',
          linkedRequirement: 'Physician Follow-Up',
          linkedCase: data.id,
          claimantName: data.claimantName,
          fileSize: '—',
        },
      ];
    },
    [activeDataset, canUseLegacyCaseFallbacks, data.claimantName, data.id],
  );

  const focusCaseWorkspaceObject = useCallback(
    (input: OpenCaseWorkspaceObjectInput) => {
      if (input.caseId !== data.id) return;
      if (isGlobalCopilotOwningCase(data.id)) {
        requestGlobalCopilotCaseFocus(input);
        return;
      }
      if (input.kind === 'task') {
        setActiveTab('tasks');
        setTabViews((prev) => ({ ...prev, tasks: 'table' }));
        const found = contextualTasks.find((row) => row.id === input.objectId);
        if (found) openCaseTaskPanel(found.task ?? resolveTaskForCaseContextRow(found, data));
        return;
      }
      if (input.kind === 'document') {
        setActiveTab('documents');
        const found = documents.find(
          (row) => row.id === input.objectId || row.name === input.objectId,
        );
        if (found) openCaseDocumentPanel(documentToCaseContextRow(found));
        return;
      }
      setActiveTab('requirements');
      const found = data.requirements.find(
        (row) =>
          String(row.id) === input.objectId
          || String(row.datasetRequirementId ?? '') === input.objectId,
      );
      if (found) openRequirementPanel(found);
    },
    [contextualTasks, data, documents, openCaseDocumentPanel, openCaseTaskPanel, openRequirementPanel],
  );

  const handleOpenCaseWorkspaceObject = useCallback<OpenCaseWorkspaceObjectHandler>(
    (input) => {
      if (input.caseId !== data.id) {
        openCaseWorkspaceObject(navigate, input);
        return;
      }
      navigate(buildCaseWorkspaceObjectHref(input), { replace: false });
      focusCaseWorkspaceObject(input);
    },
    [data.id, focusCaseWorkspaceObject, navigate],
  );

  const caseBrief = useMemo(() => {
    const primarySlot = data.workflowMeta?.contextBar?.[0];
    const clientHeadline = [
      primarySlot?.value ?? data.primaryPartyName ?? data.claimantName,
      data.workflowMeta?.breadcrumb?.replace(/^Claim ·\s*/i, '') ?? data.caseTypeLabel,
    ]
      .filter(Boolean)
      .join(' · ');

    return buildCaseBrief({
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
        label:
          (row.task as { label?: string } | undefined)?.label ??
          row.task?.taskType ??
          row.taskType ??
          row.id,
        status: row.status,
        aiGenerated: row.aiGenerated ?? row.task?.aiGenerated,
      })),
    });
  }, [contextualTasks, data]);

  const caseClientHeadline = useMemo(() => {
    const primarySlot = data.workflowMeta?.contextBar?.[0];
    return [
      primarySlot?.value ?? data.primaryPartyName ?? data.claimantName,
      data.workflowMeta?.breadcrumb?.replace(/^Claim ·\s*/i, '') ?? data.caseTypeLabel,
    ]
      .filter(Boolean)
      .join(' · ');
  }, [data]);

  useEffect(() => {
    const onFocus = (event: Event) => {
      const detail = (event as CustomEvent<FocusCaseWorkspaceObjectDetail>).detail;
      if (!detail || detail.caseId !== data.id) return;
      focusCaseWorkspaceObject(detail);
      detail.handled = true;
    };
    window.addEventListener(APP_EVENTS.focusCaseWorkspaceObject, onFocus);
    return () => window.removeEventListener(APP_EVENTS.focusCaseWorkspaceObject, onFocus);
  }, [data.id, focusCaseWorkspaceObject]);

  // Restore tab + selection from URL hash (deep links from copilot, tables, etc.).
  useEffect(() => {
    const hash = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash;
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const tab = params.get('tab');
    if (tab === 'activation' && data.caseKind === 'new_business') {
      setActiveTab(scoringSidePanelEnabled || !data.underwritingScoring ? 'requirements' : 'scoring');
    } else if (tab === 'scoring' && scoringSidePanelEnabled) {
      openScoringPanel();
    } else if (tab && RESTORABLE_CASE_TABS.includes(tab as CaseTab)) {
      setActiveTab(tab as CaseTab);
    }
    const taskId = params.get('task');
    if (taskId) {
      try {
        const suppressCaseId = sessionStorage.getItem(STORAGE_KEYS.suppressCaseHashTaskFocus);
        if (suppressCaseId && caseWorkspaceIdsMatch(suppressCaseId, data.id)) {
          return;
        }
      } catch {
        /* ignore */
      }
      focusCaseWorkspaceObject({ caseId: data.id, kind: 'task', objectId: taskId });
      return;
    }
    const docId = params.get('doc');
    if (docId) {
      focusCaseWorkspaceObject({ caseId: data.id, kind: 'document', objectId: docId });
      return;
    }
    const reqIdRaw = params.get('req');
    if (reqIdRaw) {
      focusCaseWorkspaceObject({ caseId: data.id, kind: 'requirement', objectId: reqIdRaw });
    }
  }, [data.caseKind, data.id, data.underwritingScoring, focusCaseWorkspaceObject, location.hash, openScoringPanel, scoringSidePanelEnabled]);

  const communications = useMemo(
    () => {
      const datasetRows = listCommunications(activeDataset, data.id).map((row) => ({
        date: row.createdAt ? new Date(row.createdAt).toLocaleDateString() : row.id,
        channel: row.channel,
        direction: row.direction,
        contact: row.contact ?? row.linkedObjects.find((ref) => ref.kind === 'client')?.label ?? data.claimantName,
        summary: row.subject,
        owner: row.assignee ?? row.status,
        stage: row.stage,
      }));
      if (!canUseLegacyCaseFallbacks) return datasetRows;
      return datasetRows.length ? datasetRows : WOP_FALLBACK_COMMUNICATIONS.map((row) => ({
        ...row,
        contact: row.contact || data.claimantName,
      }));
    },
    [activeDataset, canUseLegacyCaseFallbacks, data.claimantName, data.id]
  );

  const selectedCaseDocumentData = useMemo<DynamicDocumentData | null>(() => {
    if (!selectedCaseDocument) return null;
    return buildCaseDocumentPanelData(
      selectedCaseDocument,
      { caseId: data.id, claimantName: data.claimantName, policyNumber: data.policyNumber },
      activeDataset,
      dataSource.legacyMockOverlayEnabled,
    );
  }, [activeDataset, data.claimantName, data.id, data.policyNumber, dataSource.legacyMockOverlayEnabled, selectedCaseDocument]);
  const [activeDocumentInsightId, setActiveDocumentInsightId] = useState('');
  useEffect(() => {
    setActiveDocumentInsightId(selectedCaseDocumentData?.evidence[0]?.id ?? '');
  }, [selectedCaseDocumentData?.documentId]);
  const resolveCasePanelContext = useCallback((contextId: string) => {
    setActiveCasePanelContextId(contextId);
    if (contextId.startsWith('task:')) {
      const id = contextId.slice('task:'.length);
      const found = listTasks(activeDataset, { caseId: data.id }).find((task) => task.id === id || task.taskId === id);
      if (found) setSelectedCaseTask(found);
      return;
    }
    if (contextId.startsWith('requirement:')) {
      const id = contextId.slice('requirement:'.length);
      const found = data.requirements.find((requirement) => String(requirement.id) === id || String(requirement.datasetRequirementId) === id);
      if (found) setSelectedRequirement(found);
      return;
    }
    if (contextId.startsWith('document:')) {
      const id = documentIdFromPanelContext(contextId) ?? contextId.slice('document:'.length);
      const found = documents.find((document) => document.id === id || document.name === id);
      if (found) setSelectedCaseDocument(found);
      return;
    }
    if (contextId.startsWith('scoring:')) {
      return;
    }
  }, [activeDataset, data.id, data.requirements, documents]);
  const handleCasePanelContextChange = useCallback((contextId: string) => {
    resolveCasePanelContext(contextId);
  }, [resolveCasePanelContext]);
  const clearCasePanelContext = useCallback((contextId: string) => {
    let nextContextId: string | undefined;
    setCasePanelContexts((current) => {
      const index = current.findIndex((context) => context.id === contextId);
      const next = index >= 0 ? current[index + 1] ?? current[index - 1] : undefined;
      nextContextId = next?.id;
      return current.filter((context) => context.id !== contextId);
    });
    if (contextId.startsWith('task:')) setSelectedCaseTask(null);
    if (contextId.startsWith('requirement:')) setSelectedRequirement(null);
    if (contextId.startsWith('document:')) setSelectedCaseDocument(null);
    if (nextContextId) {
      queueMicrotask(() => resolveCasePanelContext(nextContextId!));
      return;
    }
    closeCaseSidePanel();
  }, [closeCaseSidePanel, resolveCasePanelContext]);
  const handleCasePanelNavigationChange = useCallback((payload: TaskPanelNavigationPayload) => {
    setCasePanelContexts(payload.contexts);
    resolveCasePanelContext(payload.activeContextId);
  }, [resolveCasePanelContext]);

  const historyEvents = useMemo(
    () => {
      const datasetRows = listActivityEvents(activeDataset, data.id).map((event) => ({
        date: new Date(event.timestamp).toLocaleDateString(),
        event: event.label,
        detail: event.detail ?? `${event.actor} event linked to ${event.linkedObjects.length} entities.`,
        stage: event.stage,
      }));
      if (!canUseLegacyCaseFallbacks) return datasetRows;
      return datasetRows.length ? datasetRows : [
        { date: 'Mar 26, 2026', event: 'AI recommendation refreshed', detail: 'Confidence updated to 91% after latest PT notes.' },
        { date: 'Mar 12, 2026', event: 'Medical setback flagged', detail: 'Potential knee reinjury detected during rehab monitoring.' },
        { date: 'Feb 26, 2026', event: 'Restoration plan initiated', detail: 'AI rule engine generated weekly PT + physician cadence.' },
      ];
    },
    [activeDataset, canUseLegacyCaseFallbacks, data.id]
  );

  const progressOrder = resolveProgressOrder(data);
  const stageLensMatches = useCallback(
    <T extends { stage?: string }>(row: T) =>
      matchesStageLens(row, stageLensOrder, workflowLensSteps, progressOrder),
    [progressOrder, stageLensOrder, workflowLensSteps],
  );
  const stagedTasks = useMemo(() => contextualTasks.filter(stageLensMatches), [contextualTasks, stageLensMatches]);
  const stagedRequirements = useMemo(() => data.requirements.filter(stageLensMatches), [data.requirements, stageLensMatches]);
  const requirementSearchQuery = (tabSearchQueries.requirements ?? '').trim().toLowerCase();
  const searchedRequirements = useMemo(() => {
    const filtered = !requirementSearchQuery
      ? stagedRequirements
      : stagedRequirements.filter((row) => {
          const sourceLabel =
            row.source === 'ai_rule_engine' ? 'AI Rule Engine' :
            row.source === 'id_verification' ? 'ID Verification' :
            row.source === 'employer_portal' ? 'Employer Portal' :
            row.source === 'pharmacy_check' ? 'Pharmacy Check' :
            row.source;
          const haystack = [
            row.name,
            row.category,
            row.stage,
            row.status,
            row.dueDate,
            row.followUpDate,
            row.source,
            sourceLabel,
            row.notes,
            row.trigger,
            row.phase,
            row.aiSummary,
            row.responsibleParty,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return haystack.includes(requirementSearchQuery);
        });
    return sortRequirementsByRelevance(filtered);
  }, [stagedRequirements, requirementSearchQuery]);
  const stagedDocuments = useMemo(() => documents.filter(stageLensMatches), [documents, stageLensMatches]);
  const taskSearchQuery = (tabSearchQueries.tasks ?? '').trim().toLowerCase();
  const searchedTasks = useMemo(() => {
    const filtered = !taskSearchQuery
      ? stagedTasks
      : stagedTasks.filter((row) => {
          const haystack = [
            row.id,
            row.task?.taskId,
            row.taskType,
            row.status,
            row.priority,
            row.assignee,
            row.stage,
            row.dueDate,
            row.task?.aiSummary,
            row.task?.description,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return haystack.includes(taskSearchQuery);
        });
    return sortCaseTaskRowsByRelevance(filtered);
  }, [stagedTasks, taskSearchQuery]);
  const documentSearchQuery = (tabSearchQueries.documents ?? '').trim().toLowerCase();
  const searchedDocuments = useMemo(() => {
    const filtered = !documentSearchQuery
      ? stagedDocuments
      : stagedDocuments.filter((row) => {
          const haystack = [
            row.name,
            row.category,
            row.stage,
            row.insight,
            row.aiSummary,
            row.uploaded,
            row.source,
            row.linkedRequirement,
            row.status,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return haystack.includes(documentSearchQuery);
        });
    return sortCaseDocumentsByRelevance(filtered);
  }, [stagedDocuments, documentSearchQuery]);
  const stagedCommunications = useMemo(() => communications.filter(stageLensMatches), [communications, stageLensMatches]);
  const stagedHistoryEvents = useMemo(() => historyEvents.filter(stageLensMatches), [historyEvents, stageLensMatches]);

  const lensAwareTabStats = useMemo(() => {
    const requirementCompleted = stagedRequirements.filter(
      (item) => item.status === 'Fulfilled' || item.status === 'Waived',
    ).length;
    const requirementTotal = stagedRequirements.length;
    const requirementCompletionPct = requirementTotal > 0
      ? Math.round((requirementCompleted / requirementTotal) * 100)
      : 0;
    const reqCountByStatus: Record<string, number> = {
      Fulfilled: 0,
      Pending: 0,
      Overdue: 0,
      Waived: 0,
      Completed: 0,
    };
    for (const row of stagedRequirements) {
      reqCountByStatus[row.status] = (reqCountByStatus[row.status] || 0) + 1;
    }
    const completed = stagedRequirements.filter(
      (item) => item.status === 'Fulfilled' || item.status === 'Waived' || item.status === 'Completed',
    ).length;
    const overdue = stagedRequirements.filter((item) => item.status === 'Overdue').length;
    const pending = stagedRequirements.filter((item) => item.status === 'Pending').length;
    const ordered = stagedRequirements.filter((item) => item.status === 'Ordered').length;
    return {
      tasks: stagedTasks.length,
      documents: stagedDocuments.length,
      communications: stagedCommunications.length,
      history: stagedHistoryEvents.length,
      requirementCompleted,
      requirementTotal,
      requirementCompletionPct,
      reqCountByStatus,
      requirementKpis: {
        completed,
        overdue,
        pending,
        ordered,
        needsAttention: overdue + pending,
      },
    };
  }, [stagedCommunications, stagedDocuments, stagedHistoryEvents, stagedRequirements, stagedTasks]);

  const stageLensLabel = useMemo(
    () => resolveLensStepLabel(workflowLensSteps, stageLensOrder),
    [stageLensOrder, workflowLensSteps],
  );
  const stageLensBannerMode = useMemo(
    () => resolveLensBannerMode(stageLensOrder, workflowLensSteps, progressOrder),
    [progressOrder, stageLensOrder, workflowLensSteps],
  );
  const emptyLensMessage = useCallback(
    (entityLabel: string, totalCount: number, searchActive: boolean) => {
      if (totalCount === 0) return `No ${entityLabel} yet`;
      if (searchActive) return `No ${entityLabel} match your search`;
      if (stageLensLabel && stageLensOrder != null) {
        const exact = usesExactStageLens(stageLensOrder, progressOrder, workflowLensSteps);
        return exact
          ? `No ${entityLabel} at ${stageLensLabel}`
          : `No ${entityLabel} recorded through ${stageLensLabel}`;
      }
      return `No ${entityLabel} match your filters`;
    },
    [progressOrder, stageLensLabel, stageLensOrder, workflowLensSteps],
  );

  const workflowMetaTabOrder = workflowMeta?.tabs
    .map(caseTabFromWorkflowLabel)
    .filter((tab): tab is CaseTab => Boolean(tab));
  const anatomyTabIds = new Set<CaseTab>([
    'overview',
    'scoring',
    ...(caseAnatomy?.tabs.map((tab) => (tab.caseTabId ?? tab.id) as CaseTab) ?? []),
    'requirements',
    'decision',
    'tasks',
    'documents',
    'communications',
    'related_cases',
    'history',
  ]);
  const candidateCaseTabOrder = [
    ...CASE_TAB_ORDER,
    ...(caseAnatomy?.tabs.map((tab) => (tab.caseTabId ?? tab.id) as CaseTab) ?? []),
  ]
    .filter((tab, index, arr) => arr.indexOf(tab) === index && anatomyTabIds.has(tab));
  const hasUnderwritingScoring = Boolean(data.underwritingScoring ?? scoringDraft);
  let effectiveCaseTabOrder = workflowMetaTabOrder?.length
    ? workflowMetaTabOrder
    : candidateCaseTabOrder.includes('scoring')
    ? candidateCaseTabOrder.filter((tab) => tab !== 'scoring').flatMap((tab) => tab === 'requirements' ? [tab, 'scoring' as CaseTab] : [tab])
    : candidateCaseTabOrder;
  if (data.caseKind === 'new_business') {
    effectiveCaseTabOrder = effectiveCaseTabOrder.filter((tab) => tab !== 'activation');
    if (hasUnderwritingScoring && !scoringSidePanelEnabled && !effectiveCaseTabOrder.includes('scoring')) {
      const requirementsIndex = effectiveCaseTabOrder.indexOf('requirements');
      effectiveCaseTabOrder = requirementsIndex >= 0
        ? [
            ...effectiveCaseTabOrder.slice(0, requirementsIndex + 1),
            'scoring',
            ...effectiveCaseTabOrder.slice(requirementsIndex + 1),
          ]
        : ['overview', 'requirements', 'scoring', ...effectiveCaseTabOrder.filter((tab) => tab !== 'overview' && tab !== 'requirements')];
    }
  }
  if (scoringSidePanelEnabled) {
    effectiveCaseTabOrder = effectiveCaseTabOrder.filter((tab) => tab !== 'scoring');
  }
  const effectiveCaseTabOrderWithDecision = [
    ...effectiveCaseTabOrder.filter((tab) => tab !== 'decision'),
    'decision' as CaseTab,
  ];

  const hasDecisionFlow = Boolean(data.decisionFlow);
  const decisionActionLabel = hasDecisionFlow
    ? 'DECISION'
    : (
      workflowMeta?.headerActions.find((action) => action.type === 'primary')?.label.toUpperCase()
      ?? resolveCaseWorkspaceTabLabel('decision', caseAnatomy).toUpperCase()
    );
  const createTaskActionLabel =
    workflowMeta?.headerActions.find((action) => action.label.toLowerCase().includes('task'))?.label.toUpperCase()
    ?? 'CREATE TASK';
  const decisionTabLabel = resolveCaseWorkspaceTabLabel('decision', caseAnatomy);
  const decisionHeaderIcon = resolveCaseWorkspaceTabIcon(
    'decision',
    decisionTabLabel,
    data.caseKind,
    caseAnatomy,
  );
  const isDecisionTabLocked =
    !hasDecisionFlow && data.decisionTabState === 'locked' && data.phase !== 'post-approval';
  const decisionButtonClass = `group/dec relative inline-flex items-center justify-center rounded-full transition-colors ${
    isDecisionTabLocked
      ? 'cursor-not-allowed border border-[#e8eaed] text-[#b7bbc2]'
      : 'border border-brand-blue text-brand-blue hover:bg-surface-selected'
  }`;
  const openDecisionTab = () => {
    setActiveTab('decision');
    setDecisionModalSignal((value) => value + 1);
  };
  const caseStatusLozenge = (
    <LozengeTag label={caseStatusShort} type={caseStatusLozengeType} subtle />
  );

  const caseTabs = effectiveCaseTabOrderWithDecision
    .filter((tab) => {
      if (tab === 'tasks') return isEntityEnabled(dataSource, 'task');
      if (tab === 'documents') return isEntityEnabled(dataSource, 'document');
      if (tab === 'communications') return isEntityEnabled(dataSource, 'communication');
      if (tab === 'history') return isEntityEnabled(dataSource, 'event');
      if (tab === 'requirements') return isEntityEnabled(dataSource, 'requirement');
      if (tab === 'requests') return isEntityEnabled(dataSource, 'request');
      return true;
    })
    .map((tab) => {
    const isDecisionLocked = tab === 'decision' && isDecisionTabLocked;
    const isDecisionCompleted = tab === 'decision' && data.decisionTabState === 'completed';

    const label = resolveCaseTabDisplayLabel(tab, {
      anatomy: caseAnatomy,
      workflowTabLabels: workflowMeta?.tabs,
    });

    return {
      id: tab,
      label,
      icon: resolveCaseWorkspaceTabIcon(tab, label, data.caseKind, caseAnatomy),
      count:
        tab === 'documents' && lensAwareTabStats.documents > 0
          ? lensAwareTabStats.documents
          : tab === 'communications' && lensAwareTabStats.communications > 0
            ? lensAwareTabStats.communications
            : tab === 'history' && lensAwareTabStats.history > 0
              ? lensAwareTabStats.history
              : tab === 'related_cases' && relationshipRows.length > 0
                ? relationshipRows.length
                : null,
      disabled: isDecisionLocked,
      title: isDecisionLocked ? 'Requirements must be met before making a decision' : undefined,
      suffix: (
        <>
          {tab === 'requirements' && lensAwareTabStats.requirementTotal > 0 ? (
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-bold leading-none shadow-sm ${
              lensAwareTabStats.requirementCompletionPct === 100
                ? 'border-[#a8d6b8] bg-[#e5f5ea] text-brand-green'
                : (lensAwareTabStats.reqCountByStatus.Overdue ?? 0) > 0
                  ? 'border-[#f3b6b1] bg-[#fde5e4] text-brand-red'
                  : 'border-[#f1cf93] bg-[#fff4e6] text-[#8a5a00]'
            }`}>
              {lensAwareTabStats.requirementCompleted}/{lensAwareTabStats.requirementTotal}
            </span>
          ) : null}
          {tab === 'tasks' && lensAwareTabStats.tasks > 0 ? (
            <span className={`inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-full border px-1.5 text-[11px] font-bold leading-none shadow-sm ${
              newTaskBadge ? 'animate-pulse border-[#cd2c23] bg-[#cd2c23] text-white' : 'border-border-soft bg-white text-text-secondary'
            }`}>
              {lensAwareTabStats.tasks}
            </span>
          ) : null}
          {isDecisionCompleted ? (
            <span className="inline-flex items-center justify-center rounded-full bg-[#e5f5ea] p-1 text-brand-green">
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
          ) : null}
        </>
      ),
    };
  });

  const caseTypeBadge = (
    <span
      className="inline-flex h-[20px] items-center gap-1 rounded-[6px] border border-[#d0d5dd] bg-white px-[6px] text-xs font-semibold text-text-secondary"
      title={caseType?.description ?? `${data.caseTypeLabel} · ${data.lineOfBusiness}`}
    >
      {workflowMeta?.breadcrumb ? (
        <span>{workflowMeta.breadcrumb}</span>
      ) : (
        <>
          <span>{caseTypeCopy.caseNoun}</span>
          <span className="text-[#a9aeb5]">·</span>
          <span>
            {data.identification?.caseTypeLabel
              ?? (data.caseKind === 'claim'
                ? claimSubTypeLabel(
                    resolveClaimSubType({
                      caseKind: 'claim',
                      caseTypeCode: data.caseTypeCode ?? '',
                      claimDetails: data.claimSubType ? { claimSubType: data.claimSubType } : undefined,
                    }),
                  ) || undefined
                : undefined)
              ?? caseType?.label
              ?? data.caseTypeLabel
              ?? data.lineOfBusiness}
          </span>
        </>
      )}
    </span>
  );

  return (
    <div
      className="relative flex h-full min-h-0 min-w-0 overflow-x-hidden bg-surface-primary"
      data-case-workspace={data.id}
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="bg-surface-primary px-4 py-3 lg:px-6">
        <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-start justify-between gap-2 lg:hidden">
              {caseTypeBadge}
              <div className="flex shrink-0 items-center gap-2">
            {data.phase === 'post-approval' && data.activeStage === 2 && (
              <button
                type="button"
                onClick={() => {
                  data.activeStage = 3;
                  if (caseSummary) caseSummary.status = 'Active: Recovery Underway';
                  data.caseStatus = 'Active: Recovery Underway';
                  const firstReq = data.requirements.find((r) => r.name === 'Restoration Plan Interview');
                  if (firstReq) {
                    firstReq.status = 'Fulfilled';
                    firstReq.rag = 'Green';
                  }
                  bumpData();
                  setTimeout(() => {
                    const overdueReq = data.requirements.find((r) => r.name === 'Weekly PT Sessions');
                    if (overdueReq) {
                      overdueReq.status = 'Overdue';
                      overdueReq.rag = 'Red';
                    }
                    setOverdueTaskReady(true);
                    setNewTaskBadge(true);
                    bumpData();
                    if (aiActivityEnabled) {
                      setAiActivitySeq({
                        id: `overdue-${Date.now()}`,
                        title: 'AI Crew — Monitoring',
                        stepDelayMs: 800,
                        startedAt: Date.now(),
                        steps: [
                          { id: 'od-detect', label: 'Overdue requirement detected — Weekly PT Sessions', status: 'pending' },
                          { id: 'od-task', label: 'Task created: Follow up on overdue requirement', status: 'pending' },
                        ],
                      });
                    }
                  }, 4000);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#008533] bg-[#e5f5ea] px-3 py-1.5 text-xs font-bold uppercase leading-none tracking-wide text-brand-green transition-colors hover:bg-[#d0edda]"
              >
                <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                CONFIRM PLAN
              </button>
            )}
            <button
              type="button"
              onClick={openDecisionTab}
              className={`${decisionButtonClass} group/dec relative min-h-[40px] min-w-[40px] gap-0 px-0`}
              aria-label={decisionActionLabel}
              title={
                isDecisionTabLocked
                  ? 'Requirements must be met before making a decision'
                  : decisionActionLabel
              }
              disabled={false}
            >
              {decisionHeaderIcon ? (
                <span className="[&_svg]:size-5">{decisionHeaderIcon}</span>
              ) : (
                <Scale className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden />
              )}
              {isDecisionTabLocked && (
                <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded border border-border-default bg-white px-2.5 py-1.5 text-[11px] font-medium text-text-secondary shadow-[0_4px_10px_rgba(27,28,30,0.12)] group-hover/dec:inline-flex">
                  Requirements must be met before making a decision
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setCreateTaskOpen(true)}
              className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-full border border-brand-blue px-2.5 py-1.5 text-[11px] font-bold uppercase leading-none tracking-wide text-brand-blue transition-colors hover:bg-surface-selected"
              aria-label={createTaskActionLabel}
            >
              <Plus className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="max-[380px]:sr-only">{createTaskActionLabel}</span>
            </button>
              </div>
            </div>
            <div className="mb-2 hidden flex-wrap items-center gap-2 lg:flex">
              {caseTypeBadge}
              {caseStatusLozenge}
            </div>
            <h1 className="text-xl font-semibold leading-tight text-text-primary lg:text-2xl">
              {data.identification?.caseId ?? data.id}
            </h1>
            <div className="mt-2 lg:hidden">{caseStatusLozenge}</div>
          </div>
          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            {data.phase === 'post-approval' && data.activeStage === 2 && (
              <button
                type="button"
                onClick={() => {
                  data.activeStage = 3;
                  if (caseSummary) caseSummary.status = 'Active: Recovery Underway';
                  data.caseStatus = 'Active: Recovery Underway';
                  const firstReq = data.requirements.find((r) => r.name === 'Restoration Plan Interview');
                  if (firstReq) {
                    firstReq.status = 'Fulfilled';
                    firstReq.rag = 'Green';
                  }
                  bumpData();
                  setTimeout(() => {
                    const overdueReq = data.requirements.find((r) => r.name === 'Weekly PT Sessions');
                    if (overdueReq) {
                      overdueReq.status = 'Overdue';
                      overdueReq.rag = 'Red';
                    }
                    setOverdueTaskReady(true);
                    setNewTaskBadge(true);
                    bumpData();
                    if (aiActivityEnabled) {
                      setAiActivitySeq({
                        id: `overdue-${Date.now()}`,
                        title: 'AI Crew — Monitoring',
                        stepDelayMs: 800,
                        startedAt: Date.now(),
                        steps: [
                          { id: 'od-detect', label: 'Overdue requirement detected — Weekly PT Sessions', status: 'pending' },
                          { id: 'od-task', label: 'Task created: Follow up on overdue requirement', status: 'pending' },
                        ],
                      });
                    }
                  }, 4000);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#008533] bg-[#e5f5ea] px-3 py-1.5 text-xs font-bold uppercase leading-none tracking-wide text-brand-green transition-colors hover:bg-[#d0edda]"
              >
                <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                CONFIRM PLAN
              </button>
            )}
            <button
              type="button"
              onClick={openDecisionTab}
              className={`${decisionButtonClass} group/dec gap-1.5 px-3 py-1.5 text-xs font-bold uppercase leading-none tracking-wide`}
              disabled={false}
            >
              {decisionActionLabel}
              {isDecisionTabLocked && (
                <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded border border-border-default bg-white px-2.5 py-1.5 text-[11px] font-medium text-text-secondary shadow-[0_4px_10px_rgba(27,28,30,0.12)] group-hover/dec:inline-flex">
                  Requirements must be met before making a decision
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setCreateTaskOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-brand-blue px-3 py-1.5 text-xs font-bold uppercase leading-none tracking-wide text-brand-blue transition-colors hover:bg-surface-selected"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              {createTaskActionLabel}
            </button>
          </div>
        </div>
        <div className="mb-3 flex items-start justify-end gap-4">
          {casesAiAssistantEnabled ? (
            <button
              type="button"
              onClick={() => {
                openAiPanel();
              }}
              className="group relative ml-auto flex shrink-0 cursor-pointer items-center gap-3.5 rounded-xl border border-[#e8eaed] bg-white px-5 py-3.5 text-left shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all hover:border-[#d8c7f1] hover:bg-[#fcfbff] hover:shadow-[0_4px_14px_rgba(96,47,160,0.14)] ml-6"
            >
              <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-brand-accent">
                <AiCueSparkle size={13} className="!text-white" spinOnParentHover aria-hidden />
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-[9px] font-normal tracking-wide text-text-muted">amplify</span>
                <span className="text-[13px] font-bold text-brand-accent">Assistant</span>
              </span>
              <ChevronRight className="h-5 w-5 text-brand-accent transition-colors group-hover:text-brand-accent-hover" strokeWidth={2} />
            </button>
          ) : null}
        </div>
        <div className="mb-4 rounded-lg border border-[#e8eaed] bg-white">
          {workflowContextSlots.length ? (
            <div className="grid grid-cols-2 divide-x divide-y divide-[#e8eaed] rounded-t-lg bg-white lg:grid-cols-4 lg:divide-y-0">
              {workflowContextSlots.map((slot) => {
                if (scoringSidePanelEnabled && scoringDraft && isScoringContextSlot(slot.label)) {
                  return (
                    <div key={slot.slot} className="flex min-w-0 flex-col justify-center px-4 py-3 sm:px-5">
                      <CaseScoringApplicantAffordance
                        scoring={scoringDraft}
                        onOpen={openScoringPanel}
                        active={scoringPanelActive}
                      />
                    </div>
                  );
                }
                return (
                <div key={slot.slot} className="flex min-w-0 flex-col justify-center px-4 py-3 sm:px-5">
                  <SectionLabel>{slot.label}</SectionLabel>
                    <span className={`text-[15px] font-semibold ${richValueClass(slot.valueColor)}`}>{slot.value}</span>
                    {slot.sub ? (
                      <span className={`mt-0.5 text-[11px] ${slot.subType === 'reference_link' ? 'text-brand-blue underline underline-offset-2' : 'text-text-muted'}`}>
                        {slot.sub}
                      </span>
                    ) : null}
                </div>
                );
              })}
            </div>
          ) : null}
          <div className={`${workflowContextSlots.length ? 'hidden' : 'grid'} grid-cols-2 divide-x divide-y divide-[#e8eaed] rounded-t-lg bg-white lg:grid-cols-4 lg:divide-y-0`}>
          <div className={`${workflowContextSlots.length ? 'hidden' : ''} flex min-w-0 flex-col justify-center px-4 py-3`}>
            <SectionLabel>{primaryPartyMetric?.label ?? 'Applicant'}</SectionLabel>
            <span className="block truncate text-[15px] font-semibold text-text-primary">
              {primaryPartyMetric?.value ?? primaryPartyDisplayName}
            </span>
          </div>
          <div className="flex min-w-0 flex-col justify-center px-4 py-3">
            <SectionLabel>{planMetric?.label ?? 'Plan'}</SectionLabel>
            <span className="text-[15px] font-semibold text-text-primary">{planMetric?.value ?? productMetric?.value ?? data.productName}</span>
            <a href="#" onClick={(e) => e.preventDefault()} className="mt-0.5 inline-flex items-center gap-1 text-xs text-brand-blue underline underline-offset-2 hover:underline">
              {data.policyNumber}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div
            className="group/benefit relative flex min-w-0 flex-col justify-center px-4 py-3"
            onMouseEnter={() => setBenefitSeen(true)}
          >
            <SectionLabel>{benefitMetric?.label ?? 'Monthly Benefit'}</SectionLabel>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-text-primary">
                {benefitIncrease
                  ? currency.format(6562)
                  : currency.localize(benefitMetric?.value ?? data.monthlyBenefit)}
              </span>
              {benefitIncrease && (
                <span className={`inline-flex items-center gap-1 text-[15px] font-bold text-[#a36d00] ${!benefitSeen ? 'animate-pulse' : ''}`}>
                  ↑ +{currency.format(312)} · 5%
                </span>
              )}
            </div>
            {benefitIncrease && (
              <div className={`pointer-events-none absolute left-0 top-full z-[60] mt-1 w-[280px] rounded-lg border border-border-soft bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)] ${benefitPopupForced ? 'block' : 'hidden group-hover/benefit:block'}`}>
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="inline-flex h-[6px] w-[6px] rounded-full bg-[#f5a200]" />
                  <span className="text-[11px] font-bold text-[#a36d00]">Benefit Change Detected</span>
                </div>
                <p className="mb-2 text-[10px] leading-snug text-text-secondary">Automatically detected via eLISSIA policy administration system.</p>
                <dl className="space-y-1 text-[11px]">
                  <div className="flex justify-between"><dt className="text-text-muted">Effective Date</dt><dd className="font-semibold text-text-primary">Apr 1, 2026</dd></div>
                  <div className="flex justify-between"><dt className="text-text-muted">Reason</dt><dd className="font-semibold text-text-primary">CPI indexation — auto-applied</dd></div>
                  <div className="flex justify-between"><dt className="text-text-muted">Previous Amount</dt><dd className="text-text-primary">{currency.format(6250)}</dd></div>
                  <div className="flex justify-between"><dt className="text-text-muted">New Amount</dt><dd className="font-semibold text-brand-green">{currency.format(6562)}</dd></div>
                  <div className="flex justify-between"><dt className="text-text-muted">Increase</dt><dd className="font-semibold text-brand-green">+{currency.format(312)} (5%)</dd></div>
                </dl>
                <a href="#" onClick={(e) => e.preventDefault()} className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-blue underline underline-offset-2 hover:underline">
                  View in eLISSIA <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-col justify-center px-4 py-3">
            <SectionLabel>SLA</SectionLabel>
            <span className="flex items-center gap-1.5 text-[15px] font-semibold text-text-primary">
              <Clock className="h-4 w-4 shrink-0 text-text-muted" />
              {data.contextCard?.sla?.label ?? caseSummary?.sla ?? '—'}
            </span>
          </div>
          
        </div>
          <div className="h-px w-full bg-[#e8eaed]" />
          {workflowMeta?.subwayStages?.length ? (
            <WorkflowMetaSubway
              stages={workflowMeta.subwayStages}
              mobileTabs={isCompactShell}
              progressOrder={resolveProgressOrder(data)}
              lensOrder={stageLensOrder}
              onStageSelect={handleStageLensSelect}
              disabled={isStepperBusy}
            />
          ) : null}
          <CaseLegacyWorkflowStepper
            data={data}
            effectivePhase={effectivePhase}
            isCompactShell={isCompactShell}
            isTerminated={isTerminated}
            isDecisionStep={isDecisionStep}
            activeStepForPhase={activeStepForPhase}
            lensOrder={stageLensOrder}
            phaseTransition={phaseTransition}
            hasSubwayStages={Boolean(workflowMeta?.subwayStages?.length)}
            onStageSelect={handleStageLensSelect}
            isStepperBusy={isStepperBusy}
          />
        </div>
      </div>

      <div className="bg-surface-primary px-6">
        <ModuleTabsBar
          tabs={caseTabs}
          activeId={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'tasks') setNewTaskBadge(false);
          }}
        />
      </div>

      <div className={activeTab === 'overview' || activeTab === 'decision' ? 'flex-1 overflow-y-auto p-6' : 'flex min-h-0 flex-1 flex-col'}>
        {activeTab === 'decision' && (
          <DecisionTab
            caseData={data}
            decisionTabState={data.decisionTabState}
            openSignal={decisionModalSignal}
            onDecisionRecorded={(decision) => {
              data.humanDecision = decision;
              data.decisionTabState = 'completed';
              applyDecisionToCaseWorkflow(data, decision);
              const label = decision.decisionOutcome?.title ?? decision.decisionTitle ?? (decision.decisionType === 'approve' ? 'Approved' : decision.decisionType === 'decline' ? 'Declined' : decision.decisionType === 'close_case' ? 'Recovery Complete' : decision.decisionType === 'modified_offer' ? 'Modified Offer' : 'Info Requested');
              if (caseSummary) caseSummary.status = data.caseStatus;
              setActiveTab('decision');
              bumpData();
              appToast.success(`Decision recorded — ${label}`);
              if (aiActivityEnabled && caseId === DEMO_CASE_IDS.wopClaim && decision.decisionType === 'approve') {
                setTimeout(() => {
                  setAiActivitySeq({
                    id: `decision-${Date.now()}`,
                    title: 'AI Crew — Post-Approval Setup',
                    stepDelayMs: 800,
                    startedAt: Date.now(),
                    steps: [
                      { id: 'create-case', label: `Creating post-approval case ${DEMO_CASE_IDS.wopClaim}`, status: 'pending' },
                      { id: 'nc-restore', label: 'Building restoration plan & generating requirements', status: 'pending' },
                      { id: 'nc-schedule', label: 'Scheduling client meeting — 3 time slots proposed', status: 'pending' },
                      { id: 'nc-confirm', label: 'Billy Bud confirmed preferred time slot', status: 'pending' },
                      { id: 'nc-task', label: 'Task created: Review proposed appointment — validate meeting time', status: 'pending' },
                    ],
                  });
                }, 500);
              }
            }}
            onOpenAIFactors={() => {
              if (!casesAiAssistantEnabled) return;
              openAiPanel();
            }}
          />
        )}
        {['licensing', 'contracts', 'activation'].includes(activeTab) && (
          <div className="rounded-xl border border-border-default bg-white p-6">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              Case type anatomy
            </p>
            <h2 className="mt-2 text-xl font-semibold text-text-primary">{resolveCaseWorkspaceTabLabel(activeTab, caseAnatomy)}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
              This tab is enabled by the {data.caseTypeLabel} business-line anatomy. The full tab content renderer is the next step; for now this confirms the runtime can conditionally expose case-type-specific features.
            </p>
          </div>
        )}
        {activeTab === 'overview' && (
          <CaseOverviewTab
            richCards={richGeneralInfoCards}
            richCollapsibles={richGeneralInfoCollapsibles}
            structuredSections={structuredGeneralSections}
            hasDatasetGeneralInformation={hasDatasetGeneralInformation}
            scoring={scoringDraft}
            onScoreAdd={(type) => openScoreModal(type)}
            onScoreFullView={() => (scoringSidePanelEnabled ? openScoringPanel() : setActiveTab('scoring'))}
            onScoreRowClick={(row) => openScoreModal(row.type, row)}
          />
        )}

        {activeTab !== 'overview' && activeTab !== 'decision' && (
          <div className="flex min-h-0 flex-1 flex-col bg-white">
            {stageLensLabel && stageLensBannerMode ? (
              <CaseStageLensBanner
                stageLabel={stageLensLabel}
                mode={stageLensBannerMode}
                onClear={() => setStageLensOrder(null)}
              />
            ) : null}
            <CaseTabToolbar
              activeTab={activeTab}
              isCompactShell={isCompactShell}
              caseAnatomy={caseAnatomy}
              workflowTabLabels={workflowMeta?.tabs}
              tabSearchQuery={tabSearchQueries[activeTab] ?? ''}
              onTabSearchChange={(value) => setTabSearchQueries((prev) => ({ ...prev, [activeTab]: value }))}
              tabView={tabViews[activeTab as Exclude<CaseTab, 'overview' | 'decision'>]}
              onTabViewChange={(view) => setTabViews((prev) => ({ ...prev, [activeTab]: view }))}
              onAddRequirement={() => setShowAddReqModal(true)}
              requirementCompletionPct={lensAwareTabStats.requirementCompletionPct}
              requirementKpis={lensAwareTabStats.requirementKpis}
              requirementTotalCount={lensAwareTabStats.requirementTotal}
            />

            {activeTab === 'scoring' && !scoringSidePanelEnabled && (
              <UnderwritingScoringTab
                caseId={data.id}
                scoring={scoringDraft}
                onChange={updateScoring}
                onOpenScoreModal={openScoreModal}
                itemsSectionTitle={`${tabLabel} items`}
              />
            )}

            {(activeTab === 'tasks' && !isCompactShell && tabViews.tasks === 'table') && (
              <CaseTasksTable
                rows={searchedTasks}
                totalRows={contextualTasks.length}
                data={data}
                selectedTaskId={selectedCaseTask?.id}
                tableScroll={tasksTableScroll}
                setScrollEl={setTasksTableScrollEl}
                onOpenTask={openCaseTaskPanel}
              />
            )}

            {(activeTab === 'requirements' && !isCompactShell && tabViews.requirements === 'table') && (
              <CaseRequirementsTable
                caseId={data.id}
                rows={searchedRequirements}
                totalRows={data.requirements.length}
                selectedRequirementId={selectedRequirement?.id}
                tableScroll={requirementsTableScroll}
                setScrollEl={setRequirementsTableScrollEl}
                onOpenRequirement={openRequirementPanel}
                followUpDateColumnLabel={activeDataset.id === 'empire-ca-demo' ? 'Order date' : undefined}
              />
            )}

            {(activeTab === 'documents' && !isCompactShell && tabViews.documents === 'table') && (
              <CaseDocumentsTable
                rows={searchedDocuments}
                totalRows={documents.length}
                selectedDocumentName={selectedCaseDocument?.name}
                tableScroll={documentsTableScroll}
                setScrollEl={setDocumentsTableScrollEl}
                onOpenDocument={(row) => openCaseDocumentPanel(documentToCaseContextRow(row))}
                onOpenRequirementTab={() => setActiveTab('requirements')}
                hideAiBadges={activeDataset.id === 'empire-ca-demo'}
              />
            )}

            {activeTab !== 'overview' && activeTab !== 'decision' && showCaseTabList && (
              activeTab === 'tasks' ? (
                <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
                  <div className={`min-h-0 min-w-0 flex-1 overflow-y-auto py-4 ${isCompactShell ? 'px-4' : 'px-6'}`}>
                    <div className="space-y-3">
                      {searchedTasks.length === 0 && (
                        <div className="flex flex-col items-center gap-2 py-16">
                          <ListChecks className="h-8 w-8 text-[#dbdee1]" />
                          <p className="text-sm font-medium text-text-muted">
                            {emptyLensMessage('tasks', contextualTasks.length, Boolean(taskSearchQuery))}
                          </p>
                        </div>
                      )}
                      {searchedTasks.map((row) => {
                        const resolved = row.task ?? resolveTaskForCaseContextRow(row, data);
                        const selected = selectedCaseTask?.id === resolved.id;
                        return (
                          <CaseTaskMobileCard key={row.id} row={row} task={resolved} selected={selected} onSelect={() => openCaseTaskPanel(resolved)} />
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
              <div className={`min-h-0 flex-1 overflow-y-auto py-4 ${isCompactShell ? 'px-4' : 'px-6'}`}>
                {activeTab === 'requirements' && (
                  <div className="space-y-3">
                    {searchedRequirements.length === 0 ? (
                      <p className="py-16 text-center text-sm font-medium text-text-muted">
                        {emptyLensMessage('requirements', data.requirements.length, Boolean(requirementSearchQuery))}
                      </p>
                    ) : null}
                    {searchedRequirements.map((row) => (
                      <CaseRequirementMobileCard
                        key={row.id}
                        row={row}
                        selected={selectedRequirement?.id === row.id}
                        onSelect={() => openRequirementPanel(row)}
                        kebabOpen={reqKebabOpen === row.id}
                        onKebabToggle={() => setReqKebabOpen(reqKebabOpen === row.id ? null : row.id)}
                        onEdit={() => { setReqKebabOpen(null); setEditingReq(row); }}
                        onDelete={() => {
                          const result = deleteEntity(dataSource.activeDatasetId, { kind: 'requirement', id: row.datasetRequirementId ?? String(row.id), label: row.name });
                          updateDataSource({ activeDatasetId: result.datasetId });
                          data.requirements = data.requirements.filter((r) => r.id !== row.id);
                          setReqKebabOpen(null);
                          bumpData();
                          appToast.success('Requirement removed');
                        }}
                        externalHref={requirementExternalHref(data.id, row)}
                        externalCode={requirementExternalCode(row)}
                      />
                    ))}
                  </div>
                )}
                {activeTab === 'communications' && <CaseCommunicationsList rows={stagedCommunications} />}
                {activeTab === 'documents' && (
                  <div className="space-y-3">
                    {searchedDocuments.length === 0 ? (
                      <p className="py-16 text-center text-sm font-medium text-text-muted">
                        {emptyLensMessage('documents', documents.length, Boolean(documentSearchQuery))}
                      </p>
                    ) : null}
                    {searchedDocuments.map((row) => (
                      <CaseDocumentMobileCard
                        key={row.name}
                        row={row}
                        selected={selectedCaseDocument?.name === row.name}
                        onSelect={() => openCaseDocumentPanel(row)}
                        onOpenRequirementTab={() => setActiveTab('requirements')}
                      />
                    ))}
                  </div>
                )}
                {activeTab === 'related_cases' && <CaseRelationshipsList rows={relationshipRows} />}
                {activeTab === 'history' && <CaseHistoryEventsList rows={stagedHistoryEvents} />}
              </div>
              )
            )}
          </div>
        )}
      </div>

      </div>
      {casePanelContexts.length > 0 && activeCasePanelContextId ? (
        <WorkspaceObjectSidePanel
          contexts={casePanelContextsWithScoring}
          activeContextId={activeCasePanelContextId}
          onChangeContext={handleCasePanelContextChange}
          onClearContext={clearCasePanelContext}
          onClose={closeCaseSidePanel}
          caseWorkspaceId={data.id}
          panelWidth={taskDetailPanelWidth}
          onPanelWidthChange={setTaskDetailPanelWidth}
          isResizing={taskDetailPanelResizing}
          onResizeStart={() => setTaskDetailPanelResizing(true)}
          assistantContent={<WorkspaceAssistantPanel contextId={activeCasePanelContextId} />}
        >
          {activeCasePanelContextId.startsWith('task:') && selectedCaseTask ? (
            <TaskDetailEmbeddedView
              task={selectedCaseTask}
              panelWidth={taskDetailPanelWidth}
              onPanelWidthChange={setTaskDetailPanelWidth}
              onResizeStart={() => setTaskDetailPanelResizing(true)}
              onClose={closeCaseSidePanel}
              navigate={navigate}
              queueContext="my_tasks"
              variant="case"
              caseFileId={data.id}
              fixedOverlay
              panelContexts={casePanelContextsWithScoring}
              activePanelContextId={activeCasePanelContextId}
              onPanelNavigationChange={handleCasePanelNavigationChange}
              scoringPanelContext={scoringSidePanelEnabled ? scoringPanelContext : undefined}
              onOpenCaseScoring={scoringSidePanelEnabled ? openScoringPanel : undefined}
              onCompleteTask={(t, options) => {
                const taskRef = t.taskId ?? t.id;
                if (isNb66RecommendRequirementsTask(taskRef)) {
                  const packageResult = approveNb66RequirementGatheringPackage(
                    dataSource.activeDatasetId,
                    data.id,
                    taskRef,
                    options?.requirementIds ?? [],
                    { name: activeProfile.name },
                    platformSettings.activeDemoConfigurationId,
                  );
                  if (!packageResult) {
                    appToast.error('Could not approve requirement package. Try again.');
                    return;
                  }
                  if (isGlobalCopilotOwningCase(data.id)) {
                    notifyGlobalCopilotTaskOutcome({
                      taskId: t.id,
                      alternateTaskIds: taskOutcomeAlternateIds(t),
                      outcome: 'accepted',
                    });
                  } else {
                    closeCaseSidePanel();
                  }
                  updateDataSource({ activeDatasetId: packageResult.datasetId });
                  const added = packageResult.addedCount;
                  appToast.success(
                    added > 0
                      ? `Task approved — ${added} requirement${added === 1 ? '' : 's'} added to ${data.id}`
                      : `Task approved on ${data.id}`,
                  );
                  bumpData();
                  return;
                }
                try {
                  const result = runTaskWorkflowAction(
                    dataSource.activeDatasetId,
                    taskRef,
                    'complete',
                    { name: activeProfile.name },
                  );
                  if (!result || !isTaskCompleteActionSuccess(result, taskRef)) {
                    appToast.error(`Could not complete task ${t.taskId ?? t.id}. Try again.`);
                    return;
                  }
                  updateDataSource({ activeDatasetId: result.datasetId });
                  appToast.success(
                    isSemiAutoTask(t) ? `Task ${t.taskId ?? t.id} approved` : `Task ${t.taskId ?? t.id} completed`,
                  );
                  closeCaseSidePanel();
                  bumpData();
                } catch {
                  const ct = contextualTasks.find((x) => x.id === t.id);
                  if (ct) {
                    ct.status = 'Completed';
                    if (t.id === 'TSK-BB-OD-01') setOverdueTaskCompleted(true);
                    appToast.success(`Task ${t.id} completed`);
                    closeCaseSidePanel();
                    bumpData();
                    return;
                  }
                  appToast.alert(`Could not complete task ${t.taskId ?? t.id}. Try again.`);
                }
              }}
              onTaskAction={(t, actionType) => {
                const result = runTaskWorkflowAction(
                  dataSource.activeDatasetId,
                  t.taskId ?? t.id,
                  actionType,
                  { name: activeProfile.name },
                );
                if (!result?.record.task) return;
                updateDataSource({ activeDatasetId: result.datasetId });
                appToast.success(`Action recorded on ${t.id}`);
                closeCaseSidePanel();
              }}
              onAcceptMeeting={() => {
                closeCaseSidePanel();
                setAiActivitySeq({
                  id: `accept-meeting-${Date.now()}`,
                  title: 'AI Crew — Meeting Confirmed',
                  stepDelayMs: 700,
                  startedAt: Date.now(),
                  steps: [
                    { id: 'mt-confirm', label: 'Confirming meeting time with Billy Bud', status: 'pending' },
                    { id: 'mt-release', label: 'Releasing 2 alternate calendar holds', status: 'pending' },
                    { id: 'mt-notify', label: 'Sending confirmation email — date, link, and agenda', status: 'pending' },
                    { id: 'mt-reminder', label: 'Scheduling reminders — 2 days and 1 hour before', status: 'pending' },
                    { id: 'mt-benefit', label: 'Benefit change detected — +5% CPI indexation via eLISSIA', status: 'pending' },
                  ],
                });
              }}
            />
          ) : null}
          {activeCasePanelContextId.startsWith('requirement:') && selectedRequirement ? (
            <RequirementContextBody
              requirement={selectedRequirement}
              caseId={data.id}
              documents={selectedRequirementDocuments}
              evidenceDataset={activeDataset}
              tasks={selectedRequirementTasks}
              scoring={scoringDraft}
              hideScoringWidget={scoringSidePanelEnabled}
              requirementActionPreset={activeDataset.id === 'empire-ca-demo' ? 'empire_nb' : undefined}
              onNotesChange={(notes) => updateRequirementNotes(selectedRequirement.id, notes)}
              onOpenScoring={() => openScoringPanel()}
              onOpenDocument={(document) => {
                const row = documentToCaseContextRow(document);
                const docContext: WorkspacePanelContext = {
                  id: documentPanelContextId(row.id ?? row.name),
                  label: row.name,
                  icon: FileText,
                  clearable: true,
                };
                if (casePanelContexts.length > 0) {
                  setDocDetailPanelWidth((current) => resolveDocumentSidePanelWidth(current));
                  setSelectedCaseDocument(row);
                  handleCasePanelNavigationChange({
                    contexts: pushWorkspacePanelContext(casePanelContexts, docContext),
                    activeContextId: docContext.id,
                  });
                  return;
                }
                openCaseDocumentPanel(row);
              }}
              onOpenTask={(task) => {
                const taskContext: WorkspacePanelContext = {
                  id: taskPanelContextId(task.id),
                  label: task.taskId ?? task.id,
                  icon: ClipboardList,
                  clearable: true,
                };
                if (casePanelContexts.length > 0) {
                  setSelectedCaseTask(task);
                  handleCasePanelNavigationChange({
                    contexts: pushWorkspacePanelContext(casePanelContexts, taskContext),
                    activeContextId: taskContext.id,
                  });
                  return;
                }
                openCaseTaskPanel(task);
              }}
            />
          ) : null}
          {activeCasePanelContextId.startsWith('document:') && selectedCaseDocumentData ? (
            <DynamicDocumentSidePanel
              embedded
              open
              onOpenChange={(open) => {
                if (!open) {
                  const taskCtxId = selectedCaseTask ? taskPanelContextId(selectedCaseTask.id) : '';
                  if (taskCtxId && casePanelContexts.some((context) => context.id === taskCtxId)) {
                    resolveCasePanelContext(taskCtxId);
                    return;
                  }
                  clearCasePanelContext(activeCasePanelContextId);
                }
              }}
              document={selectedCaseDocumentData}
              activeInsightId={activeDocumentInsightId}
              onInsightChange={setActiveDocumentInsightId}
              panelWidth={taskDetailPanelWidth}
              isResizing={false}
              onResizeStart={() => undefined}
            />
          ) : null}
          {activeCasePanelContextId.startsWith('scoring:') && scoringDraft ? (
            <CaseScoringSidePanel scoring={scoringDraft} onChange={updateScoring} />
          ) : null}
        </WorkspaceObjectSidePanel>
      ) : null}
      {casesAiAssistantEnabled && showAIPanel && (
          <aside
            ref={aiPanelAsideRef}
            data-case-workspace={data.id}
            className={`fixed right-0 z-20 relative flex flex-col overflow-hidden border-l border-t border-border-default bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.08)] motion-reduce:animate-none ${
              aiPanelExiting
                ? 'animate-[slideOutRight_0.3s_ease-out_forwards]'
                : 'animate-[slideInRight_0.3s_ease-out_forwards]'
            }`}
            style={{
              width: `${panelWidth}px`,
              top: '48px',
              height: 'calc(100dvh - 48px)',
            }}
          >
            <CaseCopilotPanel
              data={data}
              caseBrief={caseBrief}
              contextualTasks={contextualTasks}
              selectedCaseTask={selectedCaseTask}
              selectedRequirement={selectedRequirement}
              clientHeadline={caseClientHeadline}
              onClose={closeAiPanel}
              onOpenCaseWorkspaceObject={handleOpenCaseWorkspaceObject}
              onTaskActionComplete={bumpData}
              onApplyTaskAction={(taskId, actionType) => {
                try {
                  const result = runTaskWorkflowAction(
                    dataSource.activeDatasetId,
                    taskId,
                    actionType,
                    { name: activeProfile.name },
                  );
                  if (!result) return false;
                  if (actionType === 'complete' && !isTaskCompleteActionSuccess(result, taskId)) {
                    return false;
                  }
                  if (actionType !== 'complete' && !result.record.task) {
                    return false;
                  }
                  updateDataSource({ activeDatasetId: result.datasetId });
                  bumpData();
                  return true;
                } catch {
                  /* fall through to legacy demo tasks */
                }
                const legacyRow = contextualTasks.find((row) => row.id === taskId);
                if (!legacyRow) return false;
                legacyRow.status = actionType === 'complete' ? 'Completed' : 'In Progress';
                if (taskId === 'TSK-BB-OD-01' && actionType === 'complete') setOverdueTaskCompleted(true);
                bumpData();
                return true;
              }}
            />
            <button
              type="button"
              aria-label="Resize AI panel"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsResizing(true);
              }}
              className="group pointer-events-auto absolute left-0 top-0 z-[50] flex h-full w-2.5 -translate-x-1/2 cursor-ew-resize items-center justify-center border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/35 focus-visible:ring-offset-0"
            >
              <span
                aria-hidden
                className={`pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 transition-colors ${
                  isResizing ? 'bg-brand-blue' : 'bg-transparent group-hover:bg-brand-blue'
                }`}
              />
              <span
                aria-hidden
                className={`pointer-events-none absolute left-1/2 top-1/2 flex h-9 w-2 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-colors ${
                  isResizing ? 'border-brand-blue' : 'border-border-default group-hover:border-brand-blue'
                }`}
              />
            </button>
          </aside>
      )}
      {(showAddReqModal || editingReq) && createPortal(
        <CaseRequirementModal
          initial={editingReq ? { name: editingReq.name, category: editingReq.category, dueDate: editingReq.dueDate, followUpDate: editingReq.followUpDate, notes: editingReq.notes } : undefined}
          onClose={() => { setShowAddReqModal(false); setEditingReq(null); }}
          onSave={(req) => {
            const result = upsertRequirement(dataSource.activeDatasetId, {
              id: editingReq?.datasetRequirementId ?? (editingReq ? String(editingReq.id) : undefined),
              caseId: data.id,
              label: req.name,
              category: req.category,
              dueDate: req.dueDate,
              followUpDate: req.followUpDate,
              phase: reqPhaseTab,
              notes: req.notes,
            });
            updateDataSource({ activeDatasetId: result.datasetId });
            if (editingReq) {
              const target = data.requirements.find((r) => r.id === editingReq.id);
              if (target) {
                target.name = req.name;
                target.category = req.category;
                target.dueDate = req.dueDate;
                target.followUpDate = req.followUpDate;
                target.notes = req.notes || undefined;
              }
            } else {
              const nextId = data.requirements.length > 0 ? Math.max(...data.requirements.map((r) => r.id)) + 1 : 1;
              data.requirements.push({
                ...req,
                id: nextId,
                rag: 'Amber',
                status: 'Pending',
                source: 'manual',
                trigger: 'Assessor',
                phase: reqPhaseTab,
                notes: req.notes || undefined,
              });
            }
            setShowAddReqModal(false);
            setEditingReq(null);
            bumpData();
            appToast.success(editingReq ? 'Requirement updated' : 'Requirement added');
          }}
        />,
        document.body,
      )}
      <CreateTaskModal
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        dataSource={dataSource}
        initialCaseId={caseId}
        onCreated={({ datasetId, taskId }) => {
          const nextDataSource = { ...dataSource, activeDatasetId: datasetId };
          const createdTask = listTasks(filterDatasetBySettings(getSystemDataset(datasetId), nextDataSource), { caseId }).find((task) => task.id === taskId);
          updateDataSource({ activeDatasetId: datasetId });
          setCreateTaskOpen(false);
          setActiveTab('tasks');
          setTabViews((prev) => ({ ...prev, tasks: 'table' }));
          setCreatedTaskId(taskId);
          setNewTaskBadge(false);
          if (createdTask) openCaseTaskPanel(createdTask);
          navigate(`/cases/${caseId}#tab=tasks&task=${encodeURIComponent(taskId)}`, { replace: true });
          bumpData();
          appToast.success(`Task ${taskId} created`);
        }}
      />
      {scoreModal ? (
        <ScoreItemModal
          type={scoreModal.type}
          initialItem={scoreModal.item}
          onClose={() => setScoreModal(null)}
          onSave={saveScoreItem}
          onDelete={scoreModal.item ? deleteScoreItem : undefined}
        />
      ) : null}
      {aiActivityEnabled && (
        <AiActivityToast
          sequence={aiActivitySeq}
          onDismiss={() => setAiActivitySeq(null)}
          pauseAfterStepId={aiToastPauseAfter}
          onStepDone={(stepId) => {
            if (stepId === 'create-case') {
              addOpenCase(DEMO_CASE_IDS.wopClaim);
            }
            const newCaseData = getCaseOverview(DEMO_CASE_IDS.wopClaim, activeDataset, false, {
              anatomy: platformSettings.anatomy,
              enabledObjectDomains: dataSource.enabledObjectDomains,
            });
            const newCaseSummary = listCaseSummaries(activeDataset).find((c) => c.id === DEMO_CASE_IDS.wopClaim);
            if (stepId === 'nc-restore') {
              applyWopPostApprovalRestore(newCaseData);
              setReqPhaseTab('post-approval');
              bumpData();
            }
            if (stepId === 'nc-task') {
              setNewCaseTaskReady(true);
              setNewTaskBadge(true);
              try {
                sessionStorage.setItem(STORAGE_KEYS.billyPostApproval, '1');
                window.dispatchEvent(new Event(APP_EVENTS.billyFlow));
              } catch { /* */ }
            }
            if (stepId === 'mt-benefit') {
              setBenefitIncrease(true);
              bumpData();
            }
          }}
        />
      )}
    </div>
  );
}
