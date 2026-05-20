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
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { getCaseOverview } from '../data/mock-cases';
import { resolveCaseRouteId } from '../data/demoCaseIds';
import { deleteEntity, upsertRequirement } from '../data/datasetMutations';
import { useCasesNav } from '../contexts/CasesNavContext';
import { AiCueSparkle } from './AiCueSparkle';
import { AiInsightCell, AiInsightInline } from './index';
import { LozengeTag } from './LozengeTag';
import { Checkbox } from './ui/checkbox';
import { DecisionTab } from './DecisionTab';
import { getInsightBundle } from './caseInsightsData';
import { AiClientProfilePanel } from './AiClientProfilePanel';
import { AiCopilotDock, type ChatTurn } from './AiCopilotFooter';
import { CaseInsightsPanel } from './CaseInsightsPanel';
import type { CaseDocument, CaseOverview, CasePhase, CaseRequirement, HumanDecision, Task } from '../types';
import type { UnderwritingScoring, UnderwritingScoringItem } from '../domain/objectRefs';
import { resolveTaskForCaseContextRow } from '../utils/caseContextualTask';
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
import { getDocumentEvidence } from '../data/mock-document-evidence';
import { getDocumentFileType } from '../data/documentMetadata';
import { AiActivityToast, type AiActivitySequence } from './AiActivityToast';
import { deleteScoringItem, upsertScoringItem, type ScoringItemType } from '../domain/scoring';
import { useLiveContextOverlay } from '../contexts/LiveContextProvider';
import { getDefaultSidePanelWidth } from '../utils/sidepanel-width';
import { useDataSourceSettings, usePlatformSettings } from '../contexts/PlatformSettingsContext';
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
import { AI_PANEL_MIN_WIDTH, clampAiPanelWidth, defaultAiPanelWidth } from '../utils/caseViewAiPanelUtils';
import { APP_EVENTS, STORAGE_KEYS } from '../constants/storage-keys';
import {
  CaseDocumentMobileCard,
  CaseRequirementMobileCard,
  CaseTaskMobileCard,
} from './cases/CaseTabMobileCards';
import { CaseDocumentsTable } from './cases/CaseDocumentsTable';
import { CaseRequirementsTable } from './cases/CaseRequirementsTable';
import { CaseTasksTable } from './cases/CaseTasksTable';
import { CaseOverviewTab } from './cases/CaseOverviewTab';
import { CaseRequirementModal } from './cases/CaseRequirementModal';
import { ScoreItemModal, UnderwritingScoringTab } from './cases/CaseScoringPanel';
import { CaseLegacyWorkflowStepper } from './cases/CaseLegacyWorkflowStepper';
import { CaseCommunicationsList, CaseHistoryEventsList, CaseRelationshipsList } from './cases/CaseSecondaryTabLists';
import { CaseTabToolbar } from './cases/CaseTabToolbar';
import { WorkflowMetaSubway } from './cases/CaseWorkflowMap';
import {
  CASE_TAB_ORDER,
  caseTabFromWorkflowLabel,
  documentToCaseContextRow,
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
  isRequirementAiSourced,
  SummaryTableColumnHeader,
  TABLE_LINK_CLASS,
  TABLE_SUBTEXT_CLASS,
  TABLE_TEXT_CLASS,
  TableFirstColumnContent,
  TaskTableFirstColumnCell,
  TwoLineSummaryCell,
} from './ModuleCellHelpers';
import { getStatusLozengeType } from '../utils/status-display';
import { filterDatasetBySettings, getSystemDataset, listActivityEvents, listCaseSummaries, listCommunications, listDocuments, listRequirements, listTasks } from '../data/objectRepository';
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
  const [stageFilters, setStageFilters] = useState<Record<string, string>>({});
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
  const [aiPanelTab, setAiPanelTab] = useState<AIPanelTab>('insights');
  const [aiCopilotMessages, setAiCopilotMessages] = useState<ChatTurn[]>([]);
  const [copilotSurfaceOpen, setCopilotSurfaceOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'neutral' } | null>(null);
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
  const [docDetailPanelWidth, setDocDetailPanelWidth] = useState(() => getDefaultSidePanelWidth({ min: 480 }));
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
  const openCaseTaskPanel = useCallback((task: Task | null) => {
    if (!task) {
      closeCaseSidePanel();
      return;
    }
    setSelectedCaseTask(task);
    openCasePanelContext({
      id: taskPanelContextId(task.id),
      label: task.taskId ?? task.id,
      icon: ClipboardList,
      clearable: true,
    });
  }, [closeCaseSidePanel, openCasePanelContext]);
  const openRequirementPanel = useCallback((requirement: CaseRequirement | null) => {
    if (!requirement) {
      setSelectedRequirement(null);
      return;
    }
    setSelectedRequirement(requirement);
    openCasePanelContext({
      id: requirementPanelContextId(String(requirement.datasetRequirementId ?? requirement.id)),
      label: `R-${requirement.datasetRequirementId ?? requirement.id}`,
      icon: ClipboardCheck,
      clearable: true,
    });
  }, [openCasePanelContext]);
  const openCaseDocumentPanel = useCallback((document: CaseDocumentContextRow | null) => {
    if (!document) {
      setSelectedCaseDocument(null);
      return;
    }
    setSelectedCaseDocument(document);
    openCasePanelContext({
      id: documentPanelContextId(document.id ?? document.name),
      label: document.name,
      icon: FileText,
      clearable: true,
    });
  }, [openCasePanelContext]);
  const [aiActivitySeq, setAiActivitySeq] = useState<AiActivitySequence | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const bumpData = useCallback(() => setDataVersion((v) => v + 1), []);
  const { isCompactShell } = useViewportLayout();
  const caseCardListTabs = new Set<CaseTab>(['tasks', 'documents', 'requirements']);
  const forceCaseCardList = isCompactShell && caseCardListTabs.has(activeTab);
  const showCaseTabList =
    forceCaseCardList
    || tabViews[activeTab as Exclude<CaseTab, 'overview' | 'decision'>] === 'list'
    || !CASE_TABS_WITH_TABLE.has(activeTab);
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
  const currency = useCurrencyFormatter();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const activeDataset = useMemo(
    () => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource),
    [dataSource],
  );
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
  const [scoringDraft, setScoringDraft] = useState(data.underwritingScoring);
  const [scoreModal, setScoreModal] = useState<{ type: ScoringItemType; item?: UnderwritingScoringItem } | null>(null);
  useEffect(() => {
    setScoringDraft(data.underwritingScoring);
  }, [data.id, data.underwritingScoring]);
  const updateScoring = useCallback((next: UnderwritingScoring) => {
    setScoringDraft(next);
    data.underwritingScoring = next;
    bumpData();
  }, [bumpData, data]);
  const openScoreModal = useCallback((type: ScoringItemType, item?: UnderwritingScoringItem) => {
    setScoreModal({ type, item });
  }, []);
  const saveScoreItem = useCallback((item: UnderwritingScoringItem) => {
    if (!scoringDraft || !scoreModal) return;
    updateScoring(upsertScoringItem(scoringDraft, scoreModal.type, item));
    setScoreModal(null);
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
  const tabLabel = resolveCaseWorkspaceTabLabel(activeTab, caseAnatomy);
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

  // Restore tab + selection from URL hash so the AI context history can navigate back here.
  useEffect(() => {
    const hash = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash;
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const tab = params.get('tab');
    if (tab === 'activation' && data.caseKind === 'new_business') {
      setActiveTab(data.underwritingScoring ? 'scoring' : 'requirements');
    } else if (tab && RESTORABLE_CASE_TABS.includes(tab as CaseTab)) {
      setActiveTab(tab as CaseTab);
    }
    const reqIdRaw = params.get('req');
    if (reqIdRaw) {
      const found = data.requirements.find((r) => String(r.id) === reqIdRaw || r.datasetRequirementId === reqIdRaw);
      if (found) openRequirementPanel(found);
    }
    // Task restoration is best-effort: if the contextual task list contains it.
    // (The case-task data source lives below; we leave the overlay's own setter to handle it.)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.caseKind, data.underwritingScoring, location.hash, caseId]);

  useEffect(() => {
    if (data.caseKind === 'new_business' && activeTab === 'activation') {
      setActiveTab(data.underwritingScoring ? 'scoring' : 'requirements');
    }
  }, [activeTab, data.caseKind, data.underwritingScoring]);

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

  const handleWorkflowStepSelect = useCallback(
    (order: number) => {
      if (isStepperBusy) return;
      data.activeStage = order;
      bumpData();
    },
    [bumpData, data, isStepperBusy],
  );

  useEffect(() => {
    if (!dataOverride) addOpenCase(caseId);
    const phase = singlePhase ?? (data.phase === 'post-approval' ? 'post-approval' : 'pre-approval');
    setReqPhaseTab(phase);
    setSelectedRequirementIds([]);
  }, [caseId, addOpenCase, data.phase, dataOverride, singlePhase]);

  useEffect(() => {
    if (!toast) return;
    const ms = toast.tone === 'success' ? 4500 : 4000;
    const timer = setTimeout(() => setToast(null), ms);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!showAIPanel) setCopilotSurfaceOpen(false);
  }, [showAIPanel]);

  useEffect(() => {
    if (!casesAiAssistantEnabled) {
      setShowAIPanel(false);
      setAiPanelExiting(false);
      setCopilotSurfaceOpen(false);
    }
  }, [casesAiAssistantEnabled]);

  const openAiPanel = useCallback(() => {
    if (!casesAiAssistantEnabled) return;
    setAiPanelExiting(false);
    setShowAIPanel(true);
  }, [casesAiAssistantEnabled]);

  const closeAiPanel = useCallback(() => {
    setCopilotSurfaceOpen(false);
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
    closeCaseSidePanel();
  }, [activeTab, data.id, closeCaseSidePanel]);

  useEffect(() => {
    setActiveTab('overview');
  }, [caseId]);

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

  const handleCopilotSend = useCallback((text: string) => {
    const uid = `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setAiCopilotMessages((m) => [...m, { id: uid, role: 'user', text, at: Date.now() }]);
    const short = text.length > 80 ? `${text.slice(0, 80)}…` : text;
    const hint = copilotClaimContextHint(data.caseKind, data.claimSubType);
    const datasetReply = buildAssistantReply(activeDataset, text, `case:${data.id}`);
    const fallback = `Preview — copilot would respond about “${short}” using case ${data.id} and this workspace. A live integration would stream an answer with citations, policy hooks, and suggested follow-ups.`;
    const body = datasetReply?.text ?? fallback;
    const replyText = hint ? `${hint}\n\n${body}` : body;
    window.setTimeout(() => {
      const aid = `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setAiCopilotMessages((m) => [
        ...m,
        {
          id: aid,
          role: 'assistant',
          text: replyText,
          at: Date.now(),
          artifact: datasetReply?.artifact,
          followUps: datasetReply?.followUps,
        },
      ]);
    }, 420);
  }, [activeDataset, data.id, data.caseKind, data.claimSubType]);

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

  useEffect(() => {
    const hash = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash;
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const taskId = params.get('task');
    if (!taskId) return;
    const found = contextualTasks.find((row) => row.id === taskId);
    if (!found) return;
    setActiveTab('tasks');
    setTabViews((prev) => ({ ...prev, tasks: 'table' }));
    openCaseTaskPanel(found.task ?? resolveTaskForCaseContextRow(found, data));
  }, [contextualTasks, data, location.hash, openCaseTaskPanel]);

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
    [activeDataset, canUseLegacyCaseFallbacks, data.claimantName, data.id]
  );
  const selectedCaseDocumentData = useMemo<DynamicDocumentData | null>(() => {
    if (!selectedCaseDocument) return null;
    const datasetEvidence = getDocumentEvidence(selectedCaseDocument.id, activeDataset);
    if (datasetEvidence) return datasetEvidence;
    return {
      documentId: selectedCaseDocument.name.replace(/\.[^.]+$/, '').slice(0, 12).toUpperCase(),
      documentTitle: selectedCaseDocument.name,
      category: `${selectedCaseDocument.category} document`,
      status: selectedCaseDocument.status,
      fileSize: selectedCaseDocument.fileSize ?? 'No file',
      fileType: selectedCaseDocument.fileType ?? getDocumentFileType(selectedCaseDocument.name),
      caseId: data.id,
      caseReference: data.policyNumber ?? data.id,
      claimant: data.claimantName,
      source: selectedCaseDocument.source,
      linkedRequirement: selectedCaseDocument.linkedRequirement,
      linkedRequirementHref: `/cases/${data.id}#tab=requirements`,
      received: selectedCaseDocument.uploaded,
      totalPages: 12,
      pages: [
        { number: 2, image: '/evidence-medical-report-page-2.png', label: 'Physical examination' },
        { number: 3, image: '/evidence-medical-report-page.png', label: 'Medical history and plan' },
      ],
      summary: {
        label: 'Summary',
        status: 'Review evidence',
        text: selectedCaseDocument.aiSummary,
      },
      evidence: dataSource.legacyMockOverlayEnabled === false ? [] : [
        {
          id: 'treatment-gap',
          marker: 1,
          page: 3,
          severity: 'Medium',
          title: 'Confirm treatment continuity',
          quote: 'He has attended physiotherapy intermittently and was prescribed NSAIDs for pain relief.',
          reasoning: 'The report says physiotherapy was intermittent, but does not confirm visit frequency, duration, or adherence.',
          impact: 'Ask for treatment frequency before using this as recovery evidence.',
          tone: 'warning',
          highlight: { top: '35.0%', left: '2.4%', width: '93%', height: '3.2%' },
        },
        {
          id: 'rtw-gap',
          marker: 2,
          page: 3,
          severity: 'High',
          title: 'Request return-to-work plan',
          quote: 'Patient reports difficulty with prolonged sitting (>30 mins) and bending. Capable of light duties with restrictions.',
          reasoning: 'Restrictions are documented, but there is no timeline, activity plan, or employer accommodation path.',
          impact: 'Do not close the control gap until an RTW plan is requested.',
          tone: 'danger',
          highlight: { top: '64.3%', left: '2.4%', width: '93%', height: '6.2%' },
        },
      ],
      actions: [
        { id: 'review-requirement', label: 'Review requirement' },
        { id: 'create-follow-up', label: 'Create follow-up', variant: 'primary' },
      ],
    };
  }, [activeDataset, data.claimantName, data.id, data.policyNumber, dataSource.legacyMockOverlayEnabled, selectedCaseDocument]);
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

  const stageOptionsFor = useCallback(<T extends { stage?: string }>(rows: T[]) => {
    return Array.from(new Set(rows.map((row) => row.stage).filter((stage): stage is string => Boolean(stage)))).sort();
  }, []);
  const stageMatches = useCallback(<T extends { stage?: string }>(tab: string, row: T) => {
    const selectedStage = stageFilters[tab];
    return !selectedStage || row.stage === selectedStage;
  }, [stageFilters]);
  const stagedTasks = useMemo(() => contextualTasks.filter((row) => stageMatches('tasks', row)), [contextualTasks, stageMatches]);
  const stagedRequirements = useMemo(() => data.requirements.filter((row) => stageMatches('requirements', row)), [data.requirements, stageMatches]);
  const requirementSearchQuery = (tabSearchQueries.requirements ?? '').trim().toLowerCase();
  const searchedRequirements = useMemo(() => {
    if (!requirementSearchQuery) return stagedRequirements;
    return stagedRequirements.filter((row) => {
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
  }, [stagedRequirements, requirementSearchQuery]);
  const stagedDocuments = useMemo(() => documents.filter((row) => stageMatches('documents', row)), [documents, stageMatches]);
  const taskSearchQuery = (tabSearchQueries.tasks ?? '').trim().toLowerCase();
  const searchedTasks = useMemo(() => {
    if (!taskSearchQuery) return stagedTasks;
    return stagedTasks.filter((row) => {
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
  }, [stagedTasks, taskSearchQuery]);
  const documentSearchQuery = (tabSearchQueries.documents ?? '').trim().toLowerCase();
  const searchedDocuments = useMemo(() => {
    if (!documentSearchQuery) return stagedDocuments;
    return stagedDocuments.filter((row) => {
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
  }, [stagedDocuments, documentSearchQuery]);
  const stagedCommunications = useMemo(() => communications.filter((row) => stageMatches('communications', row)), [communications, stageMatches]);
  const stagedHistoryEvents = useMemo(() => historyEvents.filter((row) => stageMatches('history', row)), [historyEvents, stageMatches]);
  const activeStageOptions = useMemo(() => {
    if (activeTab === 'tasks') return stageOptionsFor(contextualTasks);
    if (activeTab === 'requirements') return stageOptionsFor(data.requirements);
    if (activeTab === 'documents') return stageOptionsFor(documents);
    if (activeTab === 'communications') return stageOptionsFor(communications);
    if (activeTab === 'history') return stageOptionsFor(historyEvents);
    return [];
  }, [activeTab, communications, contextualTasks, data.requirements, documents, historyEvents, stageOptionsFor]);

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
    if (hasUnderwritingScoring && !effectiveCaseTabOrder.includes('scoring')) {
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
  const effectiveCaseTabOrderWithDecision = [
    ...effectiveCaseTabOrder.filter((tab) => tab !== 'decision'),
    'decision' as CaseTab,
  ];

  const decisionActionLabel =
    workflowMeta?.headerActions.find((action) => action.type === 'primary')?.label.toUpperCase()
    ?? resolveCaseWorkspaceTabLabel('decision', caseAnatomy).toUpperCase();
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
  const decisionButtonClass = `group/dec relative inline-flex items-center justify-center rounded-full transition-colors ${
    data.decisionTabState === 'completed'
      ? 'border border-[#008533] bg-[#e5f5ea] text-brand-green'
      : data.decisionTabState === 'locked' && data.phase !== 'post-approval'
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
    const isDecisionLocked = tab === 'decision' && data.decisionTabState === 'locked' && data.phase !== 'post-approval';
    const isDecisionCompleted = tab === 'decision' && data.decisionTabState === 'completed';

    const label =
      workflowMeta?.tabs.find((workflowLabel) => caseTabFromWorkflowLabel(workflowLabel) === tab) ??
      resolveCaseWorkspaceTabLabel(tab, caseAnatomy);

    return {
      id: tab,
      label,
      icon: resolveCaseWorkspaceTabIcon(tab, label, data.caseKind, caseAnatomy),
      count: tab === 'related_cases' && relationshipRows.length > 0 ? relationshipRows.length : null,
      disabled: isDecisionLocked,
      title: isDecisionLocked ? 'Requirements must be met before making a decision' : undefined,
      suffix: (
        <>
          {tab === 'requirements' ? (
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-bold leading-none shadow-sm ${
              requirementCompletionPct === 100
                ? 'border-[#a8d6b8] bg-[#e5f5ea] text-brand-green'
                : reqCountByStatus.Overdue > 0
                  ? 'border-[#f3b6b1] bg-[#fde5e4] text-brand-red'
                  : 'border-[#f1cf93] bg-[#fff4e6] text-[#8a5a00]'
            }`}>
              {requirementCompletedCount}/{requirementTotalCount}
            </span>
          ) : null}
          {tab === 'tasks' && contextualTasks.length > 0 ? (
            <span className={`inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-full border px-1.5 text-[11px] font-bold leading-none shadow-sm ${
              newTaskBadge ? 'animate-pulse border-[#cd2c23] bg-[#cd2c23] text-white' : 'border-border-soft bg-white text-text-secondary'
            }`}>
              {contextualTasks.length}
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
    <div className="relative flex h-full min-h-0 min-w-0 overflow-x-hidden bg-surface-primary">
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
                data.decisionTabState === 'locked' && data.phase !== 'post-approval'
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
              {data.decisionTabState === 'completed' && (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-green text-white ring-2 ring-white">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden />
                </span>
              )}
              {data.decisionTabState === 'locked' && data.phase !== 'post-approval' && (
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
              {data.decisionTabState === 'completed' && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />}
              {data.decisionTabState === 'locked' && data.phase !== 'post-approval' && (
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
              {workflowContextSlots.map((slot) => (
                <div key={slot.slot} className="flex min-w-0 flex-col justify-center px-4 py-3 sm:px-5">
                  <SectionLabel>{slot.label}</SectionLabel>
                    <span className={`text-[15px] font-semibold ${richValueClass(slot.valueColor)}`}>{slot.value}</span>
                    {slot.sub ? (
                      <span className={`mt-0.5 text-[11px] ${slot.subType === 'reference_link' ? 'text-brand-blue underline underline-offset-2' : 'text-text-muted'}`}>
                        {slot.sub}
                      </span>
                    ) : null}
                </div>
              ))}
            </div>
          ) : null}
          <div className={`${workflowContextSlots.length ? 'hidden' : 'grid'} grid-cols-2 divide-x divide-y divide-[#e8eaed] rounded-t-lg bg-white lg:grid-cols-4 lg:divide-y-0`}>
          <div className="flex min-w-0 flex-col justify-center px-4 py-3">
            <SectionLabel>{primaryPartyMetric?.label ?? 'Applicant'}</SectionLabel>
            <span className="text-[15px] font-semibold text-text-primary">{primaryPartyMetric?.value ?? primaryPartyDisplayName}</span>
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
              activeOrder={data.activeStage}
              onStageSelect={handleWorkflowStepSelect}
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
            phaseTransition={phaseTransition}
            hasSubwayStages={Boolean(workflowMeta?.subwayStages?.length)}
            onStageSelect={handleWorkflowStepSelect}
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
              if (data.phase === 'pre-approval' && data.preApprovalStages.length > 0) {
                data.activeStage = data.preApprovalStages.length;
              }
              const label = decision.decisionOutcome?.title ?? decision.decisionTitle ?? (decision.decisionType === 'approve' ? 'Approved' : decision.decisionType === 'decline' ? 'Declined' : decision.decisionType === 'close_case' ? 'Recovery Complete' : decision.decisionType === 'modified_offer' ? 'Modified Offer' : 'Info Requested');
              if (caseSummary) caseSummary.status = `Closed: ${label}`;
              data.caseStatus = `Closed: ${label}`;
              setActiveTab('decision');
              bumpData();
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
              setAiPanelTab('factors');
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
            aiSummary={data.generalInformation?.aiSummary}
            richCards={richGeneralInfoCards}
            richCollapsibles={richGeneralInfoCollapsibles}
            structuredSections={structuredGeneralSections}
            hasDatasetGeneralInformation={hasDatasetGeneralInformation}
            scoring={scoringDraft}
            onScoreAdd={(type) => openScoreModal(type)}
            onScoreFullView={() => setActiveTab('scoring')}
            onScoreRowClick={(row) => openScoreModal(row.type, row)}
          />
        )}

        {activeTab !== 'overview' && activeTab !== 'decision' && (
          <div className="flex min-h-0 flex-1 flex-col bg-white">
            <CaseTabToolbar
              activeTab={activeTab}
              isCompactShell={isCompactShell}
              caseAnatomy={caseAnatomy}
              tabSearchQuery={tabSearchQueries[activeTab] ?? ''}
              onTabSearchChange={(value) => setTabSearchQueries((prev) => ({ ...prev, [activeTab]: value }))}
              activeStageOptions={activeStageOptions}
              stageFilter={stageFilters[activeTab] ?? ''}
              onStageFilterChange={(value) => setStageFilters((prev) => ({ ...prev, [activeTab]: value }))}
              tabView={tabViews[activeTab as Exclude<CaseTab, 'overview' | 'decision'>]}
              onTabViewChange={(view) => setTabViews((prev) => ({ ...prev, [activeTab]: view }))}
              onAddRequirement={() => setShowAddReqModal(true)}
              requirementCompletionPct={requirementCompletionPct}
              requirementKpis={requirementKpis}
              requirementTotalCount={requirementTotalCount}
            />

            {activeTab === 'scoring' && (
              <UnderwritingScoringTab
                caseId={data.id}
                scoring={scoringDraft}
                onChange={updateScoring}
                onOpenScoreModal={openScoreModal}
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
                            {contextualTasks.length === 0 ? 'No tasks yet' : 'No tasks match your search'}
                          </p>
                        </div>
                      )}
                      {searchedTasks.map((row) => {
                        const resolved = row.task ?? resolveTaskForCaseContextRow(row, data);
                        const selected = selectedCaseTask?.id === resolved.id;
                        return (
                          <CaseTaskMobileCard key={row.id} row={row} selected={selected} onSelect={() => openCaseTaskPanel(resolved)} />
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
                        {data.requirements.length === 0 ? 'No requirements yet' : 'No requirements match your search'}
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
                        {documents.length === 0 ? 'No documents yet' : 'No documents match your search'}
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
          contexts={casePanelContexts}
          activeContextId={activeCasePanelContextId}
          onChangeContext={handleCasePanelContextChange}
          onClearContext={clearCasePanelContext}
          onClose={closeCaseSidePanel}
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
              panelContexts={casePanelContexts}
              activePanelContextId={activeCasePanelContextId}
              onPanelNavigationChange={handleCasePanelNavigationChange}
              onCompleteTask={(t) => {
                const ct = contextualTasks.find((x) => x.id === t.id);
                if (ct) ct.status = 'Completed';
                if (t.id === 'TSK-BB-OD-01') setOverdueTaskCompleted(true);
                closeCaseSidePanel();
                bumpData();
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
              tasks={selectedRequirementTasks}
              scoring={scoringDraft}
              onOpenScoring={() => setActiveTab('scoring')}
              onOpenDocument={(document) => {
                openCaseDocumentPanel(documentToCaseContextRow(document));
              }}
              onOpenTask={(task) => {
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
              activeInsightId={selectedCaseDocumentData.evidence[0]?.id ?? ''}
              onInsightChange={() => undefined}
              panelWidth={taskDetailPanelWidth}
              isResizing={false}
              onResizeStart={() => undefined}
            />
          ) : null}
        </WorkspaceObjectSidePanel>
      ) : null}
      {casesAiAssistantEnabled && showAIPanel && (
          <aside
            ref={aiPanelAsideRef}
            className={`fixed right-0 z-20 flex flex-col overflow-hidden border-l border-t border-border-default bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.08)] motion-reduce:animate-none ${
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
            <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="shrink-0 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-start gap-0">
                    <div>
                      <p className="text-[10px] font-normal leading-tight tracking-wide text-text-muted">amplify</p>
                      <h2 className="text-lg font-semibold leading-snug text-text-primary">Assistant</h2>
                    </div>
                    <span className="ml-1 mt-0.5 flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full bg-brand-accent">
                      <AiCueSparkle size={8} className="!text-white" />
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => { closeAiPanel(); navigate('/copilot'); }}
                    className="rounded-full p-1.5 text-text-secondary hover:bg-surface-muted"
                    title="Open full page"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                  <button onClick={closeAiPanel} className="rounded-full p-1.5 text-text-secondary hover:bg-surface-muted">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              </div>

              <div className="shrink-0 border-b border-border-default bg-white px-6">
              <div className="flex gap-6">
                {([
                  ['insights', 'Case overview'],
                  ['summary', 'Client profile'],
                  ['factors', 'Assessment Factors'],
                ] as const).map(([tabId, label]) => (
                  <button
                    key={tabId}
                    type="button"
                    onClick={() => setAiPanelTab(tabId)}
                    className={`relative z-0 pb-3 pt-4 px-3 text-sm font-semibold transition-colors rounded-t-md hover:bg-surface-muted ${
                      aiPanelTab === tabId ? 'text-text-heading' : 'text-text-secondary'
                    }`}
                  >
                    {aiPanelTab === tabId ? (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute bottom-0 left-1/2 z-[1] h-1 w-[calc(100%+28px)] max-w-none -translate-x-1/2 bg-brand-blue"
                      />
                    ) : null}
                    <span className="relative z-[2] inline-flex items-center gap-2">
                      <span>{label}</span>
                      {tabId === 'factors' && (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-[#b7bbc2] bg-surface-muted px-1.5 text-[11px] font-bold text-text-secondary">
                          {data.assessmentFactors.length}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
              </div>

              <div className="relative flex min-h-0 min-w-0 flex-1 flex-col pb-[min(280px,36vh)]">
              {aiPanelTab === 'insights' ? (
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <CaseInsightsPanel
                    activeStage={data.activeStage}
                    bundle={insightBundle}
                    onTextMouseUp={handleSummarySelection}
                    onCopilotToast={(msg) => setToast({ message: msg, tone: 'neutral' })}
                  />
                </div>
              ) : (
                <div className="h-full min-h-0 flex-1 overflow-y-auto">
                  {aiPanelTab === 'summary' && (
                    <AiClientProfilePanel data={data} onMouseUp={handleSummarySelection} />
                  )}

                  {aiPanelTab === 'factors' && (
                    <div className="px-6 py-5">
                      <h3 className="mb-4 text-sm font-semibold text-text-heading">Assessment Factors</h3>
                      <table className="w-full text-[13px]">
                        <thead>
                          <tr className="border-b border-border-default">
                            <th className="pb-2 pr-3 text-left font-medium text-text-secondary">Category</th>
                            <th className="pb-2 pr-3 text-left font-medium text-text-secondary">Item</th>
                            <th className="pb-2 pr-3 text-right font-medium text-text-secondary">Score</th>
                            <th className="pb-2 text-left font-medium text-text-secondary">Source</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.assessmentFactors.map((factor, idx) => (
                            <tr key={idx} className="border-b border-border-divider">
                              <td className="py-2.5 pr-3 text-text-secondary">{factor.category}</td>
                              <td className="py-2.5 pr-3 text-text-secondary">{factor.item}</td>
                              <td className={`py-2.5 pr-3 text-right font-semibold ${factor.score < 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                                {factor.score > 0 ? `+${factor.score}` : factor.score}
                              </td>
                              <td className="py-2.5 font-mono text-[11px] text-text-muted">{factor.source}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-border-default">
                            <td colSpan={2} className="py-3 text-sm font-semibold text-text-primary">
                              <div className="flex gap-6">
                                <span>Total Positive: <span className="text-brand-red">+{data.assessmentFactors.filter((f) => f.score > 0).reduce((s, f) => s + f.score, 0)}</span></span>
                                <span>Total Negative: <span className="text-brand-green">{data.assessmentFactors.filter((f) => f.score < 0).reduce((s, f) => s + f.score, 0)}</span></span>
                              </div>
                            </td>
                            <td className="py-3 text-right text-sm font-bold text-text-primary">{data.netAssessmentScore}</td>
                            <td className="py-3 text-[11px] text-text-muted">Net Score</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              )}
                {/* Full-width fades only for Client profile / Factors (Case overview handles fades inside narrative column) */}
                {aiPanelTab !== 'insights' ? (
                  <>
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-0 z-[8] h-[4.75rem] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.42)_32%,rgba(255,255,255,0.14)_62%,rgba(255,255,255,0.03)_88%,transparent_100%)]"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-0 z-[8] h-[6.5rem] bg-[linear-gradient(to_top,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.4)_30%,rgba(255,255,255,0.12)_58%,rgba(255,255,255,0.03)_85%,transparent_100%)]"
                    />
                  </>
                ) : null}
              </div>

              <div
                className={`pointer-events-none absolute inset-0 z-[12] bg-[#9ca3af]/18 transition-opacity duration-300 ease-in-out motion-reduce:transition-none motion-reduce:duration-0 ${
                  copilotSurfaceOpen ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden={!copilotSurfaceOpen}
              />
            </div>

            <AiCopilotDock
              data={data}
              messages={aiCopilotMessages}
              onSendMessage={handleCopilotSend}
              aiPanelTab={aiPanelTab}
              onSurfaceOpenChange={setCopilotSurfaceOpen}
            />
            {/* Resize handle + grab dot */}
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
      {casesAiAssistantEnabled && selectionMenu.visible && showAIPanel && (aiPanelTab === 'summary' || aiPanelTab === 'insights') && (
        <div
          data-ai-panel-ignore-outside
          className="fixed z-[90] -translate-x-1/2 -translate-y-full rounded-lg border border-border-default bg-white p-1 shadow-[0_8px_24px_rgba(27,28,30,0.18)]"
          style={{ left: `${selectionMenu.x}px`, top: `${selectionMenu.y}px` }}
        >
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setAiPanelTab('insights');
                hideSelectionMenu();
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded text-text-secondary hover:bg-surface-muted hover:text-text-heading"
              title="Dig deeper"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setAiPanelTab('insights');
                hideSelectionMenu();
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded text-text-secondary hover:bg-surface-muted hover:text-text-heading"
              title="Explain"
            >
              <MessageSquareText className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setAiPanelTab('insights');
                hideSelectionMenu();
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded text-text-secondary hover:bg-surface-muted hover:text-text-heading"
              title="Suggest"
            >
              <Lightbulb className="h-4 w-4" />
            </button>
            <div className="mx-1 h-6 w-px bg-[#dbdee1]" />
            <button
              onClick={() => {
                setActiveTab('tasks');
                closeAiPanel();
                hideSelectionMenu();
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded text-text-secondary hover:bg-surface-muted hover:text-text-heading"
              title="Open tasks"
            >
              <ListChecks className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setActiveTab('requirements');
                closeAiPanel();
                hideSelectionMenu();
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded text-text-secondary hover:bg-surface-muted hover:text-text-heading"
              title="Open requirements"
            >
              <ClipboardList className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                navigate(`/cases/${data.id}`);
                closeAiPanel();
                hideSelectionMenu();
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded text-text-secondary hover:bg-surface-muted hover:text-text-heading"
              title="Open case"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {/* Toast — bottom-right; vivid green for confirmations, slate for copilot previews */}
      {toast && (
        <div
          data-ai-panel-ignore-outside
          className="fixed bottom-6 right-6 z-[200] max-w-[min(440px,calc(100vw-3rem))] animate-[fadeInUp_0.35s_ease-out]"
          role="status"
          aria-live="polite"
        >
          <div
            className={`flex items-start gap-3 rounded-lg border-2 px-5 py-4 ${
              toast.tone === 'success'
                ? 'border-white/30 bg-[#00a651] shadow-[0_12px_40px_rgba(0,133,65,0.5),0_4px_12px_rgba(0,0,0,0.15)]'
                : 'border-white/15 bg-[#2d3748] shadow-[0_12px_40px_rgba(0,0,0,0.22),0_4px_12px_rgba(0,0,0,0.12)]'
            }`}
          >
            <span
              className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
                toast.tone === 'success' ? 'bg-white/20' : 'bg-white/10'
              }`}
            >
              {toast.tone === 'success' ? (
                <Check className="h-6 w-6 text-white" strokeWidth={2.5} aria-hidden />
              ) : (
                <MessageSquareText className="h-5 w-5 text-white/90" strokeWidth={2} aria-hidden />
              )}
            </span>
            <span className="min-w-0 pt-0.5 text-base font-semibold leading-snug text-white">{toast.message}</span>
          </div>
        </div>
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
