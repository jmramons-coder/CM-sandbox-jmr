import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRight,
  AlertTriangle,
  Briefcase,
  CheckSquare,
  ChevronRight,
  Clock,
  FileText,
  Eye,
  FileWarning,
  History,
  Pencil,
  ShieldCheck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import {
  SurfaceCard,
  FilterChip,
  FilterChipGroup,
  ListRow,
  EmptyState,
  PriorityChip,
} from './ds';
import { DynamicDocumentSidePanel, type DynamicDocumentData } from './DynamicDocumentSidePanel';
import { RequirementContextBody } from './RequirementContextBody';
import { TaskDetailEmbeddedView, type TaskPanelNavigationPayload } from './TaskDetailSidePanel';
import { WorkspaceObjectSidePanel, type WorkspacePanelContext } from './WorkspaceObjectSidePanel';
import { useWorkspacePanelNavigation } from '../hooks/useWorkspacePanelNavigation';
import {
  documentPanelContextId,
  pushWorkspacePanelContext,
  requirementPanelContextId,
  taskPanelContextId,
} from '../utils/workspacePanelContextUtils';
import {
  filterDatasetBySettings,
  getSystemDataset,
  listCaseSummaries,
  listDocuments,
  listRequirements,
  listTasks,
} from '../data/objectRepository';
import { buildDashboardActivityFeed, buildDashboardFollowUps, type DashboardFollowUpRow } from '../utils/dashboardFeed';
import { getDocumentEvidence } from '../data/mock-document-evidence';
import { getDefaultSidePanelWidth } from '../utils/sidepanel-width';
import { WorkspaceAssistantPanel } from './WorkspaceAssistantPanel';
import { useDataSourceSettings } from '../contexts/PlatformSettingsContext';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';
import {
  buildDashboardTaskReason,
  compareDashboardCriticalPathTasks,
  DASHBOARD_TASK_CASE_LINK_CLASS,
  resolveDashboardTaskMetric,
  resolveDashboardTaskPrimaryAction,
  resolveTaskEvidenceButtonLabel,
  resolveTaskEvidencePreview,
} from '../utils/dashboard-task-widget';
import type { CaseDocument, Task } from '../types';

type CasePipeline = 'all' | 'pending' | 'active' | 'recovery' | 'completed';

const CASE_CHIPS: { key: CasePipeline; label: string; dot?: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending', dot: '#f5a200' },
  { key: 'active', label: 'Active', dot: 'var(--brand-primary)' },
  { key: 'recovery', label: 'Recovery', dot: 'var(--brand-accent)' },
  { key: 'completed', label: 'Closed', dot: '#008533' },
];

const CASE_CHIP_ACTIVE_CLASS: Record<CasePipeline, string> = {
  all: 'border-brand-blue-border bg-surface-selected text-brand-blue',
  pending: 'border-[#f5a200]/35 bg-[#fff4e6] text-[#a36d00]',
  active: 'border-brand-blue-border bg-surface-selected text-brand-blue',
  recovery: 'border-brand-accent/30 bg-brand-accent-light text-brand-accent',
  completed: 'border-brand-green/30 bg-[#e5f5ea] text-brand-green',
};

type ActivityPeriod = 'day' | 'week';

const SLA_RISK_SCORE: Record<string, number> = { danger: 3, warning: 2, normal: 1 };
const PRIORITY_SCORE: Record<string, number> = { URGENT: 3, HIGH: 2, NORMAL: 1, LOW: 0 };

type DashboardFollowUpPanel =
  | { kind: 'document'; caseId: string; documentId: string }
  | { kind: 'requirement'; caseId: string; requirementId: string }
  | { kind: 'task'; taskId: string };

export function Dashboard() {
  const navigate = useNavigate();
  const dataSource = useDataSourceSettings();
  const currency = useCurrencyFormatter();
  const [caseFilter, setCaseFilter] = useState<CasePipeline>('all');
  const [activityPeriod, setActivityPeriod] = useState<ActivityPeriod>('day');
  const [activeEvidenceId, setActiveEvidenceId] = useState('');
  const [quickEvidencePreview, setQuickEvidencePreview] = useState<{
    x: number;
    y: number;
    placement: 'top' | 'bottom';
    taskId: string;
  } | null>(null);
  const quickEvidenceCloseTimerRef = useRef<number | null>(null);
  const [evidencePanelWidth, setEvidencePanelWidth] = useState(() => getDefaultSidePanelWidth({ min: 520, max: 1120 }));
  const [evidencePanelResizing, setEvidencePanelResizing] = useState(false);
  const [followUpPanel, setFollowUpPanel] = useState<DashboardFollowUpPanel | null>(null);
  const dashboardPanelNav = useWorkspacePanelNavigation();

  const clearQuickEvidenceCloseTimer = () => {
    if (quickEvidenceCloseTimerRef.current === null) return;
    window.clearTimeout(quickEvidenceCloseTimerRef.current);
    quickEvidenceCloseTimerRef.current = null;
  };

  const activeDataset = useMemo(() => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource), [dataSource]);
  const allCases = listCaseSummaries(activeDataset).filter(
    (c) => c.phase === 'pre-approval' || c.phase === 'post-approval',
  );
  const caseById = useMemo(() => new Map(allCases.map((item) => [item.id, item])), [allCases]);

  const casePipelineCounts = useMemo(() => {
    const pending = allCases.filter((c) => c.status.includes('Pending') || c.status.includes('Awaiting')).length;
    const active = allCases.filter((c) => c.status.startsWith('Active:')).length;
    const recovery = allCases.filter((c) => c.status.includes('Recovery') || c.status.includes('RTW') || c.status.includes('Restoration')).length;
    const completed = allCases.filter((c) => c.status.includes('Terminated') || c.status.includes('Completed')).length;
    return { all: allCases.length, pending, active, recovery, completed };
  }, [allCases]);

  const recentCases = useMemo(() => {
    let filtered = allCases;
    if (caseFilter === 'pending') filtered = filtered.filter((c) => c.status.includes('Pending') || c.status.includes('Awaiting'));
    else if (caseFilter === 'active') filtered = filtered.filter((c) => c.status.startsWith('Active:'));
    else if (caseFilter === 'recovery') filtered = filtered.filter((c) => c.status.includes('Recovery') || c.status.includes('RTW') || c.status.includes('Restoration'));
    else if (caseFilter === 'completed') filtered = filtered.filter((c) => c.status.includes('Terminated') || c.status.includes('Completed'));
    return filtered.slice(0, 5);
  }, [allCases, caseFilter]);

  const allTasks = listTasks(activeDataset).filter((t) => t.status !== 'Completed');

  const criticalPath = useMemo(() => {
    return allTasks
      .filter((task) => task.caseId)
      .map((task) => {
        const relatedCase = task.caseId ? caseById.get(task.caseId) : undefined;
        const monthlyExposure = currency.parse(relatedCase?.benefit);
        const slaScore = SLA_RISK_SCORE[task.slaStatus] ?? 0;
        const priorityScore = PRIORITY_SCORE[task.priority] ?? 0;
        const exposureScore = Math.min(3, monthlyExposure / 3000);
        const rankScore = slaScore * 10 + priorityScore * 5 + exposureScore;
        const isCritical = task.slaStatus === 'danger' || task.priority === 'URGENT';
        const reason = buildDashboardTaskReason(task);
        const metric = resolveDashboardTaskMetric(
          task,
          relatedCase,
          (value, options) => currency.format(value, options),
          (value) => currency.parse(value),
        );
        const primaryAction = resolveDashboardTaskPrimaryAction(task);
        const evidencePreview = resolveTaskEvidencePreview(task, activeDataset);
        return {
          task,
          relatedCase,
          monthlyExposure,
          rankScore,
          priorityLabel: isCritical ? 'Critical' : task.priority === 'HIGH' ? 'High' : 'Normal',
          reason,
          metric,
          primaryAction,
          evidencePreview,
          projectedReduction: Math.round(monthlyExposure * (task.priority === 'URGENT' ? 2.2 : 1.4)),
        };
      })
      .sort((a, b) =>
        compareDashboardCriticalPathTasks(a.task.id, b.task.id, a.rankScore, b.rankScore),
      )
      .slice(0, 4);
  }, [activeDataset, allTasks, caseById, currency]);

  const urgentProjectedReduction = useMemo(() => {
    return allTasks
      .filter((task) => (task.priority === 'URGENT' || task.slaStatus === 'danger') && task.caseId)
      .reduce((sum, task) => {
        const exp = currency.parse(caseById.get(task.caseId!)?.benefit);
        return sum + Math.round(exp * (task.priority === 'URGENT' ? 2.2 : 1.4));
      }, 0);
  }, [allTasks, caseById, currency]);
  const blockedExposure = useMemo(() => {
    return allTasks
      .filter((task) => task.slaStatus === 'danger' && task.caseId)
      .reduce((sum, task) => sum + currency.parse(caseById.get(task.caseId!)?.benefit), 0);
  }, [allTasks, caseById, currency]);
  const decisionReadyCount = useMemo(() => {
    return allTasks.filter((task) => {
      const tt = task.taskType.toLowerCase();
      const sum = (task.aiSummary ?? '').toLowerCase();
      const ctx = (task.panelContext?.contextSummary ?? '').toLowerCase();
      return tt.includes('decision') || sum.includes('decision') || ctx.includes('decision');
    }).length;
  }, [allTasks]);
  const personalOverdue = allTasks.filter((task) => task.slaStatus === 'danger').length;
  const nextBreachTask = useMemo(
    () => allTasks.find((task) => task.slaStatus === 'danger') ?? allTasks.find((task) => task.slaStatus === 'warning'),
    [allTasks],
  );
  const datasetControlGaps = useMemo(() => {
    const requirementGaps = activeDataset.requirements
      .filter((requirement) => ['Pending', 'Overdue'].includes(requirement.status))
      .map((requirement) => {
        const caseId = (requirement.linkedObjects ?? []).find((ref) => ref.kind === 'case')?.id;
        const relatedCase = caseId ? caseById.get(caseId) : undefined;
        return {
          id: requirement.id,
          title: requirement.label,
          owner: `${relatedCase?.claimant ?? 'Dataset case'}${caseId ? ` · ${caseId}` : ''}`,
          impact: requirement.trigger ?? 'Open requirement needs follow-up before the case can progress.',
          action: requirement.followUpDate ? `Follow up ${requirement.followUpDate}` : 'Review requirement',
          tone: requirement.status === 'Overdue' ? 'critical' : 'warning',
        };
      });
    const evidenceGaps = (activeDataset.documentEvidence ?? []).flatMap((evidence) =>
      (evidence.findings ?? []).map((finding) => {
        const caseId = (evidence.linkedObjects ?? []).find((ref) => ref.kind === 'case')?.id;
        const relatedCase = caseId ? caseById.get(caseId) : undefined;
        return {
          id: finding.id,
          title: finding.title,
          owner: `${relatedCase?.claimant ?? evidence.title}${caseId ? ` · ${caseId}` : ''}`,
          impact: finding.impact,
          action: finding.reasoning,
          tone: finding.severity === 'High' ? 'critical' : 'warning',
        };
      }),
    );
    return [...requirementGaps, ...evidenceGaps].slice(0, 3);
  }, [activeDataset, caseById]);
  const controlGaps = datasetControlGaps;
  const attentionCount = controlGaps.length + personalOverdue;
  const slaOnTrack = personalOverdue === 0;
  const activityFeed = useMemo(() => buildDashboardActivityFeed(activeDataset, caseById), [activeDataset, caseById]);
  const visibleActivity = useMemo(() => {
    return activityFeed.filter((row) =>
      activityPeriod === 'day'
        ? row.period === 'day'
        : row.period === 'day' || row.period === 'week',
    );
  }, [activityFeed, activityPeriod]);
  const followUpsDue = useMemo(() => buildDashboardFollowUps(activeDataset, 6), [activeDataset]);

  const activeDashboardTaskId = dashboardPanelNav.activeContextId.startsWith('task:')
    ? dashboardPanelNav.activeContextId.slice('task:'.length)
    : '';
  const followUpDashboardTask = useMemo(() => {
    if (!activeDashboardTaskId) return null;
    return (
      allTasks.find((row) => row.id === activeDashboardTaskId || row.taskId === activeDashboardTaskId)
      ?? listTasks(activeDataset).find(
        (row) => row.id === activeDashboardTaskId || row.taskId === activeDashboardTaskId,
      )
      ?? null
    );
  }, [activeDashboardTaskId, activeDataset, allTasks]);

  const activeDashboardDocumentId = dashboardPanelNav.activeContextId.startsWith('document:')
    ? dashboardPanelNav.activeContextId.slice('document:'.length)
    : '';
  const followUpDocumentData = useMemo<DynamicDocumentData | null>(() => {
    if (!activeDashboardDocumentId) return null;
    return getDocumentEvidence(activeDashboardDocumentId, activeDataset);
  }, [activeDashboardDocumentId, activeDataset]);

  const followUpDocumentRecord = useMemo(() => {
    if (!activeDashboardDocumentId) return undefined;
    return activeDataset.documents.find((row) => row.id === activeDashboardDocumentId);
  }, [activeDashboardDocumentId, activeDataset.documents]);

  const activeDashboardRequirementId = dashboardPanelNav.activeContextId.startsWith('requirement:')
    ? dashboardPanelNav.activeContextId.slice('requirement:'.length)
    : '';
  const followUpRequirement = useMemo(() => {
    if (!activeDashboardRequirementId) return null;
    const caseId = followUpPanel?.caseId
      ?? activeDataset.requirements.find((row) => row.id === activeDashboardRequirementId)?.linkedObjects?.find((ref) => ref.kind === 'case')?.id
      ?? '';
    const rows = listRequirements(activeDataset, caseId);
    return (
      rows.find((row) => row.datasetRequirementId === activeDashboardRequirementId)
      ?? rows.find((row) => String(row.id) === activeDashboardRequirementId)
    );
  }, [activeDashboardRequirementId, activeDataset, followUpPanel?.caseId]);

  const followUpRequirementRecord = useMemo(() => {
    if (!followUpRequirement) return undefined;
    return activeDataset.requirements.find(
      (row) => row.id === (followUpRequirement.datasetRequirementId ?? followUpRequirement.id),
    );
  }, [activeDataset.requirements, followUpRequirement]);

  const followUpRequirementDocuments = useMemo(() => {
    if (!activeDashboardRequirementId || !followUpRequirement) return [];
    const caseId = followUpPanel?.caseId ?? '';
    const ids = new Set(followUpRequirement.linkedDocs ?? followUpRequirementRecord?.linkedDocs ?? []);
    if (!ids.size || !caseId) return [];
    return listDocuments(activeDataset, { caseId }).filter((doc) => ids.has(doc.id));
  }, [activeDashboardRequirementId, activeDataset, followUpPanel?.caseId, followUpRequirement, followUpRequirementRecord]);

  const followUpRequirementTasks = useMemo(() => {
    if (!activeDashboardRequirementId || !followUpRequirement) return [];
    const caseId = followUpPanel?.caseId ?? '';
    const ids = new Set(followUpRequirement.linkedTasks ?? followUpRequirementRecord?.linkedTasks ?? []);
    if (!ids.size || !caseId) return [];
    return listTasks(activeDataset, { caseId }).filter(
      (task) => ids.has(task.id) || Boolean(task.taskId && ids.has(task.taskId)),
    );
  }, [activeDashboardRequirementId, activeDataset, followUpPanel?.caseId, followUpRequirement, followUpRequirementRecord]);

  const followUpCaseScoring = useMemo(() => {
    if (!followUpPanel?.caseId) return undefined;
    return activeDataset.cases.find((row) => row.id === followUpPanel.caseId)?.underwritingScoring;
  }, [activeDataset.cases, followUpPanel?.caseId]);

  const syncDashboardPanelMeta = (contextId: string) => {
    if (contextId.startsWith('task:')) {
      const taskId = contextId.slice('task:'.length);
      setFollowUpPanel({ kind: 'task', taskId });
      return;
    }
    if (contextId.startsWith('document:')) {
      const documentId = contextId.slice('document:'.length);
      const linkedCaseId = activeDataset.documents.find((row) => row.id === documentId)?.linkedObjects?.find((ref) => ref.kind === 'case')?.id;
      setFollowUpPanel({
        kind: 'document',
        caseId: linkedCaseId ?? followUpPanel?.caseId ?? '',
        documentId,
      });
      return;
    }
    if (contextId.startsWith('requirement:')) {
      const requirementId = contextId.slice('requirement:'.length);
      const linkedCaseId = activeDataset.requirements
        .find((row) => row.id === requirementId)
        ?.linkedObjects?.find((ref) => ref.kind === 'case')?.id;
      setFollowUpPanel({
        kind: 'requirement',
        caseId: linkedCaseId ?? followUpPanel?.caseId ?? '',
        requirementId,
      });
    }
  };

  const openDashboardPanelContext = (context: WorkspacePanelContext) => {
    setQuickEvidencePreview(null);
    dashboardPanelNav.openContext(context);
    syncDashboardPanelMeta(context.id);
  };

  const openFollowUpPanel = (item: DashboardFollowUpRow) => {
    if (item.type === 'Document' && item.documentId) {
      const documentData = getDocumentEvidence(item.documentId, activeDataset);
      openDashboardPanelContext({
        id: documentPanelContextId(item.documentId),
        label: documentData?.documentTitle ?? item.label,
        icon: FileText,
        clearable: true,
      });
      return;
    }
    if (item.requirementId) {
      openDashboardPanelContext({
        id: requirementPanelContextId(item.requirementId),
        label: item.label,
        icon: FileWarning,
        clearable: true,
      });
    }
  };

  const closeDashboardPanel = () => {
    dashboardPanelNav.closePanel();
    setFollowUpPanel(null);
  };

  const navigateToCase = (caseId: string, hash = '') => {
    closeDashboardPanel();
    navigate(`/cases/${caseId}${hash}`);
  };

  const quickEvidencePreviewDocument = useMemo(() => {
    if (!quickEvidencePreview) return null;
    const task = allTasks.find((row) => row.id === quickEvidencePreview.taskId);
    if (!task) return null;
    return resolveTaskEvidencePreview(task, activeDataset);
  }, [activeDataset, allTasks, quickEvidencePreview]);

  const openDashboardTaskPanel = (task: Task) => {
    openDashboardPanelContext({
      id: taskPanelContextId(task.id),
      label: task.taskId ?? task.id,
      icon: CheckSquare,
      clearable: true,
    });
  };

  const handleDashboardTaskPanelNavigationChange = (payload: TaskPanelNavigationPayload) => {
    let mergedContexts = dashboardPanelNav.contexts;
    for (const context of payload.contexts) {
      mergedContexts = pushWorkspacePanelContext(mergedContexts, context);
    }
    const activeContext =
      payload.contexts.find((context) => context.id === payload.activeContextId)
      ?? mergedContexts.find((context) => context.id === payload.activeContextId);
    if (activeContext) {
      mergedContexts = pushWorkspacePanelContext(
        mergedContexts.filter((context) => context.id !== activeContext.id),
        activeContext,
      );
    }
    dashboardPanelNav.syncNavigation(mergedContexts, payload.activeContextId);
    syncDashboardPanelMeta(payload.activeContextId);
  };

  const openTaskEvidencePanel = (task: Task, evidenceId?: string) => {
    const evidence = resolveTaskEvidencePreview(task, activeDataset);
    if (!evidence) return;
    clearQuickEvidenceCloseTimer();
    setActiveEvidenceId(evidenceId ?? evidence.evidence[0]?.id ?? '');
    openDashboardPanelContext({
      id: documentPanelContextId(evidence.documentId),
      label: evidence.documentTitle,
      icon: FileText,
      clearable: true,
    });
  };

  const handleDashboardPanelContextChange = (contextId: string) => {
    dashboardPanelNav.activateContext(contextId);
    syncDashboardPanelMeta(contextId);
  };

  const clearDashboardPanelContext = (contextId: string) => {
    const nextContextId = dashboardPanelNav.clearContext(contextId);
    if (nextContextId) {
      syncDashboardPanelMeta(nextContextId);
      return;
    }
    closeDashboardPanel();
  };

  useEffect(() => {
    if (!evidencePanelResizing) return;
    const onMove = (event: MouseEvent) => {
      const nextWidth = window.innerWidth - event.clientX;
      const maxWidth = Math.min(1120, Math.round(window.innerWidth * 0.72));
      setEvidencePanelWidth(Math.max(520, Math.min(nextWidth, maxWidth)));
    };
    const onUp = () => {
      setEvidencePanelResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [evidencePanelResizing]);

  const showQuickEvidencePreview = (event: ReactMouseEvent<HTMLElement>, taskId: string) => {
    clearQuickEvidenceCloseTimer();
    const rect = event.currentTarget.getBoundingClientRect();
    const popupHeight = 330;
    const belowSpace = window.innerHeight - rect.bottom;
    const aboveSpace = rect.top;
    const placement = belowSpace < popupHeight + 22 && aboveSpace > belowSpace ? 'top' : 'bottom';
    setQuickEvidencePreview({
      x: rect.left + rect.width / 2,
      y: placement === 'bottom' ? rect.bottom : rect.top,
      placement,
      taskId,
    });
  };

  const hideQuickEvidencePreview = () => {
    clearQuickEvidenceCloseTimer();
    quickEvidenceCloseTimerRef.current = window.setTimeout(() => {
      setQuickEvidencePreview(null);
      quickEvidenceCloseTimerRef.current = null;
    }, 140);
  };

  useEffect(() => {
    if (!quickEvidencePreview) return;
    const close = () => {
      clearQuickEvidenceCloseTimer();
      setQuickEvidencePreview(null);
    };
    window.addEventListener('scroll', close, true);
    return () => window.removeEventListener('scroll', close, true);
  }, [quickEvidencePreview]);

  useEffect(() => {
    return () => clearQuickEvidenceCloseTimer();
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-surface-primary">
      <div className="mx-auto max-w-[1100px] px-8 pt-[120px] pb-8 space-y-6">

        <section className="overflow-hidden rounded-xl border border-border-default bg-white">
          <div className="flex flex-wrap items-center justify-between gap-1 px-5 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.4px] text-text-heading">Mission control</p>
              <h1 className="mt-0.5 text-[20px] font-semibold text-text-primary">Today’s control priorities</h1>
              <p className="mt-0.5 max-w-[640px] text-[12px] leading-snug text-text-secondary">
                Unblock review, protect SLA, and move decisions forward.
              </p>
            </div>
            <div className="grid w-[500px] shrink-0 grid-cols-3 overflow-hidden rounded-lg border border-border-default bg-surface-primary">
              <div className="flex min-w-[145px] flex-col justify-center px-5 py-2">
                <p className="text-[16px] font-semibold text-brand-red">{currency.format(blockedExposure)}</p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.35px] text-text-muted">Blocked exposure</p>
              </div>
              <div className="flex min-w-[145px] flex-col justify-center border-l border-border-default px-5 py-2">
                <p className="text-[16px] font-semibold text-brand-blue">{decisionReadyCount}</p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.35px] text-text-muted">Ready decisions</p>
              </div>
              <div className="flex min-w-[145px] flex-col justify-center border-l border-border-default px-5 py-2">
                <p className="text-[16px] font-semibold text-brand-green">{currency.format(urgentProjectedReduction)}</p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.35px] text-text-muted">Today’s release</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 border-t border-border-default bg-surface-primary">
            <div className="px-5 py-2.5">
              <div className="grid grid-cols-[16px_minmax(0,1fr)] items-start gap-2">
                <CheckSquare className="mt-[2px] size-3.5 text-text-heading" />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-text-heading">Assigned to me</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <p className="text-[24px] font-semibold leading-none text-text-primary">{allTasks.length}</p>
                    <p className="text-[12px] font-semibold text-text-secondary">open tasks</p>
                  </div>
                  <span className="mt-1 inline-flex rounded-full border border-border-default bg-white px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
                    {personalOverdue} overdue · {decisionReadyCount} ready
                  </span>
                </div>
              </div>
            </div>
            <div className="border-l border-border-default px-5 py-2.5">
              <div className="grid grid-cols-[16px_minmax(0,1fr)] items-start gap-2">
                <AlertTriangle className="mt-[2px] size-3.5 text-text-heading" />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-text-heading">Attention required</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <p className={`text-[24px] font-semibold leading-none ${attentionCount > 0 ? 'text-brand-red' : 'text-brand-green'}`}>{attentionCount}</p>
                    <p className="text-[12px] font-semibold text-text-secondary">items</p>
                  </div>
                  <p className="mt-0.5 text-[11px] text-text-secondary">Controls or missing evidence</p>
                </div>
              </div>
            </div>
            <div className="border-l border-border-default px-5 py-2.5">
              <div className="grid grid-cols-[16px_minmax(0,1fr)] items-start gap-2">
                <Clock className="mt-[2px] size-3.5 text-text-heading" />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-text-heading">SLA health</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <p className={`text-[22px] font-semibold leading-none ${slaOnTrack ? 'text-brand-green' : 'text-brand-orange'}`}>{slaOnTrack ? 'On track' : 'At risk'}</p>
                  </div>
                  <p className="mt-0.5 text-[11px] text-text-secondary">Next breach {nextBreachTask?.slaRemaining ?? '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-[1.1fr_0.8fr] items-stretch gap-4">
          <SurfaceCard className="flex h-[320px] flex-col overflow-hidden">
            <div className="relative z-10 shrink-0 bg-white px-4 pb-2 pt-2">
              <div className="mb-1.5 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="size-4 text-text-heading" />
                    <p className="text-[12px] font-semibold text-text-heading">Case portfolio</p>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-text-secondary">Cases grouped by current lifecycle status.</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/cases')}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-border-default bg-white px-3 py-1.5 text-[11px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                >
                  View more <ArrowRight className="size-3" />
                </button>
              </div>
              <FilterChipGroup className="mt-1 pb-1">
                {CASE_CHIPS.map((chip) => (
                  <FilterChip
                    key={chip.key}
                    active={caseFilter === chip.key}
                    dot={chip.dot}
                    label={chip.label}
                    count={casePipelineCounts[chip.key]}
                    className={`border ${caseFilter === chip.key ? CASE_CHIP_ACTIVE_CLASS[chip.key] : 'border-transparent bg-surface-muted text-text-secondary hover:bg-border-soft'}`}
                    onClick={() => setCaseFilter(chip.key)}
                  />
                ))}
              </FilterChipGroup>
            </div>
            <div className="pointer-events-none relative z-10 h-2.5 shrink-0 bg-gradient-to-b from-white to-white/0" />
            <div className="app-scrollbar -mt-2.5 min-h-0 flex-1 divide-y divide-border-divider overflow-y-auto pt-2.5">
              {recentCases.length === 0 && <EmptyState message="No cases in this stage." />}
              {recentCases.map((c) => (
                <ListRow key={c.id} onClick={() => navigate(`/cases/${c.id}`)}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-text-primary">{c.claimant}</span>
                      <span className="text-[11px] text-text-muted">{c.id}</span>
                    </div>
                    <p className="truncate text-[11px] text-text-secondary">{c.status}</p>
                  </div>
                  <div className="hidden shrink-0 text-right md:block">
                    <p className="text-[11px] font-semibold text-text-primary">{currency.localize(c.benefit)}</p>
                    <p className="text-[10px] text-text-muted">SLA {c.sla}</p>
                  </div>
                </ListRow>
              ))}
            </div>
            <div className="shrink-0 border-t border-border-default bg-surface-primary p-0.5">
              <div className="flex h-4 overflow-hidden rounded-b-[10px] bg-white">
                {(['pending', 'active', 'recovery', 'completed'] as CasePipeline[]).map((key) => {
                  const count = casePipelineCounts[key];
                  const pct = casePipelineCounts.all > 0 ? (count / casePipelineCounts.all) * 100 : 0;
                  const color = CASE_CHIPS.find((chip) => chip.key === key)?.dot ?? '#dbdee1';
                  return (
                    <span
                      key={key}
                      className="h-full"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                      title={`${key}: ${count}`}
                    />
                  );
                })}
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="flex h-[320px] max-h-[320px] min-h-0 flex-col px-4 py-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <History className="size-4 text-text-heading" />
                <p className="text-[12px] font-semibold text-text-heading">Recent activity</p>
              </div>
              <div className="flex overflow-hidden rounded-full border border-border-default bg-white p-0.5">
                {[
                  { id: 'day' as const, label: 'Last 24h' },
                  { id: 'week' as const, label: 'Last week' },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setActivityPeriod(option.id)}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                      activityPeriod === option.id
                        ? 'bg-brand-blue text-white'
                        : 'text-text-secondary hover:bg-surface-muted'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative -mr-3 mt-1 min-h-0 flex-1">
              <div className="app-scrollbar h-full overflow-y-auto pb-8 pr-3">
                <div className="divide-y divide-border-divider">
                  {visibleActivity.length === 0 && (
                    <EmptyState message={activityPeriod === 'day' ? 'No activity in the last 24 hours.' : 'No activity in the last week.'} />
                  )}
                  {visibleActivity.map((item) => {
                    const Icon =
                      item.event === 'view' ? Eye :
                      item.event === 'edit' ? Pencil :
                      item.event === 'task' ? CheckSquare :
                      item.event === 'requirement' ? FileWarning :
                      Briefcase;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigate(item.href)}
                        className="grid w-full grid-cols-[18px_56px_minmax(0,1fr)_auto] items-center gap-2 py-1.5 text-left"
                      >
                        <span className="flex size-4 items-center justify-center rounded bg-surface-muted text-text-secondary">
                          <Icon className="size-3" />
                        </span>
                        <span className="whitespace-nowrap text-[10px] text-text-muted">{item.time}</span>
                        <span className="min-w-0">
                          <span className="block truncate text-[11px] text-text-primary">
                            {item.next}
                            <span className="text-text-muted"> · {item.entity}</span>
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[9px] font-semibold text-text-muted">{item.type}</span>
                          <ChevronRight className="size-3.5 text-text-muted" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-white/0 to-white" />
            </div>
          </SurfaceCard>
        </div>

        <div>
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
              <div>
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckSquare className="size-4 text-text-heading" />
                      <p className="text-[12px] font-semibold text-text-heading">Tasks</p>
                    </div>
                    <p className="mt-0.5 text-[12px] text-text-secondary">Action queue tied to today’s control gaps.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/tasks')}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-border-default bg-white px-3 py-1.5 text-[11px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                  >
                    View more <ArrowRight className="size-3" />
                  </button>
                </div>
                <div className="space-y-2">
                {criticalPath.slice(0, 3).map((item) => (
                  <article
                    key={item.task.id}
                    className="overflow-hidden rounded-lg border border-border-soft bg-white"
                  >
                    <div className="flex items-start gap-3 px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <PriorityChip priority={item.task.priority} />
                        </div>
                        <p className="text-[13px] font-semibold text-text-primary">
                          {item.task.taskType}
                        </p>
                        {item.task.caseId ? (
                          <p className="mt-1">
                            <Link
                              to={`/cases/${item.task.caseId}`}
                              className={DASHBOARD_TASK_CASE_LINK_CLASS}
                            >
                              {item.relatedCase?.claimant ?? item.task.claimantName} · {item.task.caseId}
                            </Link>
                          </p>
                        ) : null}
                      </div>
                      {item.metric.show ? (
                        <div className="hidden shrink-0 text-right lg:block">
                          <p className="text-[13px] font-semibold text-text-primary">{item.metric.value}</p>
                          <p className="text-[10px] text-text-muted">{item.metric.label}</p>
                        </div>
                      ) : null}
                    </div>
                    <div className="border-t border-border-divider px-3 py-2">
                      <p className="line-clamp-2 text-[12px] leading-relaxed text-text-primary">{item.reason}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          data-keep-sidepanel="trigger"
                          onClick={() => openDashboardTaskPanel(item.task)}
                          className="inline-flex items-center rounded-full border border-border-default bg-white px-2.5 py-1 text-[11px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                        >
                          {item.primaryAction.label}
                        </button>
                        {item.evidencePreview ? (
                          <button
                            type="button"
                            data-keep-sidepanel="trigger"
                            onClick={() => openTaskEvidencePanel(item.task)}
                            onMouseEnter={(event) => showQuickEvidencePreview(event, item.task.id)}
                            onMouseLeave={hideQuickEvidencePreview}
                            className="inline-flex items-center gap-1 rounded-full border border-border-default bg-white px-2.5 py-1 text-[11px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                          >
                            <Eye className="size-3" />
                            {resolveTaskEvidenceButtonLabel(item.task, item.evidencePreview)}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-text-heading" />
                  <p className="text-[12px] font-semibold text-text-heading">Documents &amp; requirements</p>
                </div>
                <p className="mt-0.5 text-[11px] text-text-muted">Open requirements and documents needing attention.</p>
                <div className="mt-2 space-y-2">
                  {followUpsDue.length === 0 ? (
                    <EmptyState message="No document or requirement follow-ups right now." />
                  ) : null}
                  {followUpsDue.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      data-keep-sidepanel="trigger"
                      onClick={() => openFollowUpPanel(item)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg border border-border-soft bg-white px-2.5 py-1.5 text-left"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-muted text-text-heading">
                          {item.type === 'Requirement' ? <FileWarning className="size-3.5" /> : <ShieldCheck className="size-3.5" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[12px] font-semibold leading-tight text-text-primary">{item.label}</span>
                          <span className="mt-0.5 block truncate text-[10px] text-text-muted">
                            {item.subtitle ? `${item.subtitle} · ` : ''}
                            {item.caseId}
                          </span>
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          item.tone === 'overdue'
                            ? 'bg-[#fde5e4] text-[#7a1d1a]'
                            : item.tone === 'review'
                              ? 'bg-[#fff4e6] text-[#a36d00]'
                              : 'bg-surface-muted text-text-secondary'
                        }`}
                      >
                        {item.due}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
          </div>
        </div>

        {dashboardPanelNav.isOpen && dashboardPanelNav.activeContextId ? (
          <WorkspaceObjectSidePanel
            contexts={dashboardPanelNav.contexts}
            activeContextId={dashboardPanelNav.activeContextId}
            onChangeContext={handleDashboardPanelContextChange}
            onClearContext={clearDashboardPanelContext}
            onClose={closeDashboardPanel}
            panelWidth={evidencePanelWidth}
            onPanelWidthChange={setEvidencePanelWidth}
            isResizing={evidencePanelResizing}
            onResizeStart={() => setEvidencePanelResizing(true)}
            assistantContent={<WorkspaceAssistantPanel contextId={dashboardPanelNav.activeContextId} />}
          >
            {dashboardPanelNav.activeContextId.startsWith('task:') && followUpDashboardTask ? (
              <TaskDetailEmbeddedView
                task={followUpDashboardTask}
                panelWidth={evidencePanelWidth}
                onPanelWidthChange={setEvidencePanelWidth}
                onResizeStart={() => setEvidencePanelResizing(true)}
                onClose={closeDashboardPanel}
                navigate={navigate}
                queueContext={followUpDashboardTask.queue === 'team_tasks' ? 'team_tasks' : 'my_tasks'}
                panelContexts={dashboardPanelNav.contexts}
                activePanelContextId={dashboardPanelNav.activeContextId}
                onPanelNavigationChange={handleDashboardTaskPanelNavigationChange}
              />
            ) : null}
            {dashboardPanelNav.activeContextId.startsWith('requirement:') && followUpRequirement ? (
              <RequirementContextBody
                requirement={followUpRequirement}
                caseId={followUpPanel?.caseId ?? ''}
                documents={followUpRequirementDocuments}
                tasks={followUpRequirementTasks}
                scoring={followUpCaseScoring}
                onOpenScoring={() => navigateToCase(followUpPanel?.caseId ?? '', '#tab=scoring')}
                onOpenDocument={(document: CaseDocument) => {
                  const documentData = getDocumentEvidence(document.id, activeDataset);
                  openDashboardPanelContext({
                    id: documentPanelContextId(document.id),
                    label: documentData?.documentTitle ?? document.name,
                    icon: FileText,
                    clearable: true,
                  });
                }}
              />
            ) : null}
            {dashboardPanelNav.activeContextId.startsWith('document:') && followUpDocumentData ? (
              followUpDocumentRecord?.fileAvailable === false ? (
                <div className="flex min-h-0 flex-1 flex-col bg-white">
                  <div className="border-b border-border-default px-5 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Document metadata</p>
                    <h3 className="mt-1 text-lg font-semibold text-text-primary">{followUpDocumentRecord.label}</h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      {followUpDocumentRecord.placeholderReason ?? 'The file has not been uploaded yet.'}
                    </p>
                    {followUpPanel?.caseId ? (
                      <button
                        type="button"
                        onClick={() => navigateToCase(followUpPanel.caseId, '#tab=documents')}
                        className="mt-3 text-[12px] font-semibold text-brand-blue hover:text-brand-blue-hover"
                      >
                        Open case documents →
                      </button>
                    ) : null}
                  </div>
                  <div className="flex flex-1 items-center justify-center bg-surface-primary p-8">
                    <div className="max-w-sm rounded-xl border border-dashed border-border-soft bg-white p-6 text-center">
                      <FileText className="mx-auto size-8 text-text-muted" />
                      <p className="mt-3 text-sm font-semibold text-text-primary">File not available</p>
                      <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                        Import or upload the file to unlock preview and AI extraction.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <DynamicDocumentSidePanel
                  embedded
                  open
                  onOpenChange={(open) => {
                    if (!open) {
                      const requirementCtxId = followUpPanel?.kind === 'requirement'
                        ? requirementPanelContextId(followUpPanel.requirementId)
                        : '';
                      if (requirementCtxId && dashboardPanelNav.contexts.some((context) => context.id === requirementCtxId)) {
                        handleDashboardPanelContextChange(requirementCtxId);
                        return;
                      }
                      clearDashboardPanelContext(dashboardPanelNav.activeContextId);
                    }
                  }}
                  document={followUpDocumentData}
                  activeInsightId={activeEvidenceId || (followUpDocumentData.evidence[0]?.id ?? '')}
                  onInsightChange={setActiveEvidenceId}
                  panelWidth={evidencePanelWidth}
                  isResizing={false}
                  onResizeStart={() => undefined}
                />
              )
            ) : null}
          </WorkspaceObjectSidePanel>
        ) : null}

        {quickEvidencePreview && quickEvidencePreviewDocument
          ? createPortal(
              <div
                className="fixed z-[260] w-[400px] rounded-[8px] border border-border-default bg-white p-3 text-left shadow-[0_8px_24px_rgba(27,28,30,0.14)]"
                style={{
                  left: Math.max(16, Math.min(quickEvidencePreview.x - 200, window.innerWidth - 416)),
                  ...(quickEvidencePreview.placement === 'bottom'
                    ? { top: quickEvidencePreview.y + 13 }
                    : { bottom: window.innerHeight - quickEvidencePreview.y + 13 }),
                }}
                onMouseEnter={clearQuickEvidenceCloseTimer}
                onMouseLeave={() => setQuickEvidencePreview(null)}
              >
                <span
                  className={`absolute left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 bg-white ${
                    quickEvidencePreview.placement === 'bottom'
                      ? '-top-[7px] border-l border-t border-border-default'
                      : '-bottom-[7px] border-b border-r border-border-default'
                  }`}
                />
                <p className="text-[14px] font-semibold text-text-primary">
                  {quickEvidencePreviewDocument.documentTitle}
                </p>
                <div className="mt-3 grid grid-cols-[96px_minmax(0,1fr)] gap-3">
                  <div className="h-[128px] overflow-hidden rounded-[6px] border border-border-soft bg-white">
                    <img
                      src={
                        quickEvidencePreviewDocument.pages[0]?.image
                        ?? '/evidence-medical-report-page.png'
                      }
                      alt=""
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                  <div>
                    <div className="rounded-[6px] border border-border-soft bg-surface-primary p-2.5">
                      <p className="text-[12px] font-semibold text-text-heading">Highlighted evidence</p>
                      <p className="mt-1 line-clamp-4 text-[12px] leading-relaxed text-text-secondary">
                        {quickEvidencePreviewDocument.evidence[0]?.quote
                          ? `“${quickEvidencePreviewDocument.evidence[0].quote}”`
                          : quickEvidencePreviewDocument.summary.text}
                      </p>
                    </div>
                    <p className="mt-3 line-clamp-3 text-[12px] leading-relaxed text-text-secondary">
                      {quickEvidencePreviewDocument.evidence[0]?.reasoning
                        ?? quickEvidencePreviewDocument.summary.contextText
                        ?? quickEvidencePreviewDocument.summary.text}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  data-keep-sidepanel="trigger"
                  onClick={() => {
                    const task = allTasks.find((row) => row.id === quickEvidencePreview.taskId);
                    if (task) {
                      openTaskEvidencePanel(
                        task,
                        quickEvidencePreviewDocument.evidence[0]?.id,
                      );
                    }
                  }}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-brand-blue px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-brand-blue-hover"
                >
                  Open evidence review
                </button>
              </div>,
              document.body,
            )
          : null}

      </div>
    </div>
  );
}

