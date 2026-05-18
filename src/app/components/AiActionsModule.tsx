import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { AlertCircle, Bot, Briefcase, Check, ClipboardList, ExternalLink, FileCheck2, LayoutGrid, List, MessageSquare, MoreVertical, XCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useLiveContextOverlay } from '../contexts/LiveContextProvider';
import { useDataSourceSettings } from '../contexts/PlatformSettingsContext';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';
import { filterDatasetBySettings, getSystemDataset, listAiActions } from '../data/objectRepository';
import type { AiActionRecord, AiActionStatus } from '../data/multi-case-dataset';
import { formatCaseIntelligenceTimestamp, listCaseIntelligence, type CaseIntelligenceRecord, type CaseIntelligenceStep } from '../domain/intelligenceMonitoring';
import { useTableHorizontalScroll } from '../hooks/useTableHorizontalScroll';
import { moduleTableScrollContainerClass } from '../utils/module-table-scroll';
import { UI_CLASS } from '../constants/design-tokens';
import { ModuleTabsBar } from './ModuleTabsBar';
import { SearchBar } from './ds';
import { FilterDropdown, LozengeTag, ReorderIcon } from './index';
import { AiCueSparkle } from './AiCueSparkle';
import { SummaryTableColumnHeader, TABLE_LINK_CLASS, TABLE_LINK_TRUNCATE_CLASS } from './ModuleCellHelpers';
import { WorkspaceAssistantPanel } from './WorkspaceAssistantPanel';
import { WorkspaceObjectSidePanel, type WorkspacePanelContext } from './WorkspaceObjectSidePanel';
import { useWorkspacePanelNavigation } from '../hooks/useWorkspacePanelNavigation';

type AiActionTab = 'by_case' | 'all';
type AiActionViewMode = 'table' | 'card';
type AiActionSortColumn = 'id' | 'title' | 'status' | 'sourceSurface' | 'confidence' | 'createdAt';
type AiActionTypeFilter = 'All' | 'Case/request initiation' | 'Task actions' | 'Requirement actions' | 'Document/evidence actions' | 'Ongoing case actions';
type SelectedIntelligenceContext =
  | { kind: 'action'; action: AiActionRecord }
  | { kind: 'case'; record: CaseIntelligenceRecord };
type CueIconComponent = ComponentType<{ className?: string; size?: number | string; strokeWidth?: number | string }>;

const STATUS_OPTIONS: Array<'All' | AiActionStatus> = ['All', 'suggested', 'in_progress', 'completed', 'accepted', 'rejected', 'failed', 'superseded'];
const ACTION_TYPE_OPTIONS: AiActionTypeFilter[] = ['All', 'Case/request initiation', 'Task actions', 'Requirement actions', 'Document/evidence actions', 'Ongoing case actions'];
const INTELLIGENCE_PANEL_MIN_WIDTH = 440;
const INTELLIGENCE_PANEL_DEFAULT_RATIO = 0.6;

function AiCueIcon({ className, size }: { className?: string; size?: number | string; strokeWidth?: number | string }) {
  return <AiCueSparkle size={typeof size === 'number' ? size : 14} className={className} />;
}

function statusType(status: AiActionStatus) {
  if (status === 'completed' || status === 'accepted') return 'Success' as const;
  if (status === 'failed' || status === 'rejected') return 'Alert' as const;
  if (status === 'in_progress') return 'Informative' as const;
  return 'Warning' as const;
}

function actionTypeMatches(filter: string, row: AiActionRecord) {
  if (filter === 'All') return true;
  const linkedKinds = new Set(row.linkedObjects.map((ref) => ref.kind));
  if (filter === 'Case/request initiation') {
    return row.sourceSurface === 'request' || row.actionType.includes('request') || row.actionType.includes('intake');
  }
  if (filter === 'Task actions') {
    return row.sourceSurface === 'task' || linkedKinds.has('task') || row.actionType.includes('task');
  }
  if (filter === 'Requirement actions') {
    return row.sourceSurface === 'requirement' || linkedKinds.has('requirement') || row.actionType.includes('requirement');
  }
  if (filter === 'Document/evidence actions') {
    return row.sourceSurface === 'document' || row.sourceSurface === 'scoring' || linkedKinds.has('document') || row.actionType.includes('evidence') || row.actionType.includes('document');
  }
  if (filter === 'Ongoing case actions') {
    return row.sourceSurface === 'case' || row.sourceSurface === 'copilot' || row.sourceSurface === 'entity';
  }
  return true;
}

function primaryLinkedObject(row: AiActionRecord) {
  return row.linkedObjects.find((ref) => ref.kind === 'case') ?? row.linkedObjects[0];
}

function objectHref(kind: string, id: string, caseId?: string) {
  if (kind === 'case') return `/cases/${encodeURIComponent(id)}`;
  if (kind === 'task') return `/tasks?task=${encodeURIComponent(id)}`;
  if (kind === 'document') return `/documents?doc=${encodeURIComponent(id)}`;
  if (kind === 'request') return `/requests?request=${encodeURIComponent(id)}`;
  if (kind === 'requirement' && caseId) return `/cases/${encodeURIComponent(caseId)}#tab=requirements&req=${encodeURIComponent(id)}`;
  if (['communication', 'note', 'event'].includes(kind) && caseId) return `/cases/${encodeURIComponent(caseId)}#tab=history&object=${encodeURIComponent(id)}`;
  if (['client', 'policy', 'agent', 'application'].includes(kind)) return `/folders/${encodeURIComponent(id)}`;
  return undefined;
}

function sortRows(rows: AiActionRecord[], column: AiActionSortColumn, direction: 'asc' | 'desc') {
  const multiplier = direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => String(a[column] ?? '').localeCompare(String(b[column] ?? ''), undefined, { numeric: true }) * multiplier);
}

type AiActionStepView = NonNullable<AiActionRecord['steps']>[number];

function getActionStepPreview(action: AiActionRecord): AiActionStepView[] {
  if (action.steps?.length) return action.steps;
  return [{ id: `${action.id}-synthetic`, label: action.title, status: action.status }];
}

function getStepTone(status: string): { dotClass: string; pillClass: string; icon: CueIconComponent } {
  if (status === 'completed' || status === 'accepted' || status === 'done') {
    return { dotClass: 'bg-[#1f8a4d]', pillClass: 'bg-[#e7f6ec] text-[#1f8a4d]', icon: Check };
  }
  if (status === 'failed' || status === 'rejected' || status === 'blocked') {
    return { dotClass: 'bg-brand-red', pillClass: 'bg-[#fdecec] text-brand-red', icon: XCircle };
  }
  if (status === 'in_progress') {
    return { dotClass: 'bg-brand-blue', pillClass: 'bg-[#e7eefb] text-brand-blue', icon: AiCueIcon };
  }
  return { dotClass: 'bg-[#f5a200]', pillClass: 'bg-[#fff4e6] text-[#8a5a00]', icon: AlertCircle };
}

function getStepProgressLabel(action: AiActionRecord) {
  const steps = getActionStepPreview(action);
  if (!action.steps?.length) return steps.length === 1 ? '1 step' : 'No steps';
  const completed = steps.filter((step) => ['completed', 'accepted', 'done'].includes(step.status)).length;
  return `${completed}/${steps.length} done`;
}

function actionNeedsReview(action: AiActionRecord) {
  if (['suggested', 'failed', 'rejected'].includes(action.status)) return true;
  return getActionStepPreview(action).some((step) => ['awaiting_review', 'suggested', 'failed', 'blocked', 'rejected'].includes(step.status));
}

function actorLabel(actor: AiActionRecord['actor']) {
  if (actor === 'ai') return 'AI';
  if (actor === 'system') return 'System';
  return 'Integration';
}

function caseStatusType(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('closed') || normalized.includes('complete') || normalized.includes('approved')) return 'Success' as const;
  if (normalized.includes('overdue') || normalized.includes('failed') || normalized.includes('declined')) return 'Alert' as const;
  if (normalized.includes('pending') || normalized.includes('review')) return 'Warning' as const;
  return 'Informative' as const;
}

function caseSearchText(record: CaseIntelligenceRecord) {
  return [
    record.caseId,
    record.summary.claimant,
    record.summary.primaryPartyName,
    record.summary.product,
    record.summary.status,
    record.summary.aiSummary,
    record.latestSignal,
    record.aiActions.map((action) => `${action.title} ${action.summary}`).join(' '),
    record.tasks.map((task) => `${task.id} ${task.taskType} ${task.aiSummary ?? ''}`).join(' '),
    record.requirements.map((requirement) => `${requirement.name} ${requirement.status}`).join(' '),
  ].filter(Boolean).join(' ').toLowerCase();
}

function AiActionSummaryCell({ action }: { action: AiActionRecord }) {
  const steps = getActionStepPreview(action);
  const preview = steps.slice(0, 3);
  return (
    <div className="max-w-[560px]">
      <p className="truncate text-sm font-semibold text-text-primary">{action.title}</p>
      <p className="mt-0.5 truncate text-xs leading-5 text-text-muted">{action.summary}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-surface-primary px-2 py-0.5 text-[10px] font-semibold text-text-secondary ring-1 ring-border-soft">
          {getStepProgressLabel(action)}
        </span>
        {actionNeedsReview(action) ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#fff4e6] px-2 py-0.5 text-[10px] font-semibold text-[#8a5a00]">
            <AlertCircle className="size-3" />
            Review needed
          </span>
        ) : null}
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-text-secondary ring-1 ring-border-soft">
          {actorLabel(action.actor)}
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        {preview.map((step) => {
          const tone = getStepTone(step.status);
          return (
            <span key={step.id} className="inline-flex items-center gap-1 rounded-full bg-surface-primary px-1.5 py-0.5 text-[10px] text-text-secondary" title={`${step.label} · ${step.status}`}>
              <span className={`size-1.5 rounded-full ${tone.dotClass}`} />
              <span className="max-w-[92px] truncate">{step.label}</span>
            </span>
          );
        })}
        {steps.length > preview.length ? (
          <span className="text-[10px] font-semibold text-text-muted">+{steps.length - preview.length}</span>
        ) : null}
      </div>
    </div>
  );
}

export function AiActionsModule() {
  const navigate = useNavigate();
  const location = useLocation();
  const dataSource = useDataSourceSettings();
  const activeDataset = useMemo(() => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource), [dataSource]);
  const rows = useMemo(() => listAiActions(activeDataset), [activeDataset]);
  const caseRows = useMemo(() => listCaseIntelligence(activeDataset), [activeDataset]);
  const [activeTab, setActiveTab] = useState<AiActionTab>('by_case');
  const [viewMode, setViewMode] = useState<AiActionViewMode>('table');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('All');
  const [sortColumn, setSortColumn] = useState<AiActionSortColumn>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedContext, setSelectedContext] = useState<SelectedIntelligenceContext | null>(null);
  const panelNav = useWorkspacePanelNavigation();
  const [panelWidth, setPanelWidth] = useState(() =>
    typeof window === 'undefined'
      ? INTELLIGENCE_PANEL_MIN_WIDTH
      : Math.max(INTELLIGENCE_PANEL_MIN_WIDTH, Math.round(window.innerWidth * INTELLIGENCE_PANEL_DEFAULT_RATIO)),
  );
  const [isResizing, setIsResizing] = useState(false);
  const [tableScrollEl, setTableScrollEl] = useState<HTMLDivElement | null>(null);
  const { showLeftStickyEdge, showRightStickyEdge, hasHorizontalOverflow } = useTableHorizontalScroll(tableScrollEl);

  useEffect(() => {
    if (!isResizing) return;
    const onMouseMove = (event: MouseEvent) => {
      const nextWidth = window.innerWidth - event.clientX;
      setPanelWidth(Math.min(Math.max(nextWidth, INTELLIGENCE_PANEL_MIN_WIDTH), Math.round(window.innerWidth * 0.75)));
    };
    const onMouseUp = () => setIsResizing(false);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const actionId = params.get('action');
    const caseId = params.get('case');
    if (caseId) {
      const found = caseRows.find((row) => row.caseId === caseId);
      if (found) {
        setActiveTab('by_case');
        setSelectedContext({ kind: 'case', record: found });
        panelNav.openContext({ id: `ai-case:${found.caseId}`, label: found.caseId, icon: Briefcase, clearable: true });
      }
      return;
    }
    if (actionId) {
      const found = rows.find((row) => row.id === actionId);
      if (found) {
        setActiveTab('all');
        setSelectedContext({ kind: 'action', action: found });
        panelNav.openContext({ id: `ai-action:${found.id}`, label: found.id, icon: Bot, clearable: true });
      }
    }
  }, [caseRows, location.search, rows]);

  const tabs = useMemo(() => [
    { id: 'by_case' as const, label: 'Cases intelligence', count: caseRows.length },
    { id: 'all' as const, label: 'All AI actions', count: rows.length },
  ], [caseRows.length, rows]);

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const filtered = rows
      .filter((row) => statusFilter === 'All' || row.status === statusFilter)
      .filter((row) => actionTypeMatches(actionTypeFilter, row))
      .filter((row) => !needle || [row.id, row.title, row.summary, row.rationale, row.sourceSurface, row.linkedObjects.map((ref) => ref.label ?? ref.id).join(' ')].filter(Boolean).join(' ').toLowerCase().includes(needle));
    return sortRows(filtered, sortColumn, sortDirection);
  }, [actionTypeFilter, rows, search, sortColumn, sortDirection, statusFilter]);

  const filteredCaseRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return caseRows.filter((row) => !needle || caseSearchText(row).includes(needle));
  }, [caseRows, search]);

  const isByCaseTab = activeTab === 'by_case';
  const selectedAction = selectedContext?.kind === 'action' ? selectedContext.action : null;
  const selectedCase = selectedContext?.kind === 'case' ? selectedContext.record : null;
  const activeTotal = isByCaseTab ? filteredCaseRows.length : filteredRows.length;
  const activeTotalLabel = isByCaseTab ? `${activeTotal} cases` : `${activeTotal} actions`;

  const overlay = useMemo(() => selectedContext ? {
    id: selectedContext.kind === 'case' ? `ai-case:${selectedContext.record.caseId}` : `ai-action:${selectedContext.action.id}`,
    kind: 'aiAction' as const,
    icon: selectedContext.kind === 'case' ? Briefcase : AiCueIcon,
    crumbs: ['Intelligence monitoring', selectedContext.kind === 'case' ? selectedContext.record.caseId : selectedContext.action.id],
    label: selectedContext.kind === 'case' ? selectedContext.record.summary.title ?? selectedContext.record.caseId : selectedContext.action.title,
    href: selectedContext.kind === 'case'
      ? `/ai-actions?case=${encodeURIComponent(selectedContext.record.caseId)}`
      : `/ai-actions?action=${encodeURIComponent(selectedContext.action.id)}`,
  } : null, [selectedContext]);
  useLiveContextOverlay(overlay);

  const handleSort = (column: AiActionSortColumn) => {
    if (sortColumn === column) {
      setSortDirection((current) => current === 'asc' ? 'desc' : 'asc');
      return;
    }
    setSortColumn(column);
    setSortDirection(column === 'createdAt' ? 'desc' : 'asc');
  };

  const selectAction = (row: AiActionRecord) => {
    setSelectedContext({ kind: 'action', action: row });
    const context: WorkspacePanelContext = {
      id: `ai-action:${row.id}`,
      label: row.id,
      icon: Bot,
      clearable: true,
    };
    panelNav.openContext(context);
    navigate(`/ai-actions?action=${encodeURIComponent(row.id)}`, { replace: true });
  };

  const selectCase = (record: CaseIntelligenceRecord) => {
    setSelectedContext({ kind: 'case', record });
    const context: WorkspacePanelContext = {
      id: `ai-case:${record.caseId}`,
      label: record.caseId,
      icon: Briefcase,
      clearable: true,
    };
    panelNav.openContext(context);
    navigate(`/ai-actions?case=${encodeURIComponent(record.caseId)}`, { replace: true });
  };

  const handleAiPanelContextChange = (contextId: string) => {
    panelNav.activateContext(contextId);
    if (contextId.startsWith('ai-action:')) {
      const actionId = contextId.slice('ai-action:'.length);
      const found = rows.find((row) => row.id === actionId);
      if (found) setSelectedContext({ kind: 'action', action: found });
      return;
    }
    if (contextId.startsWith('ai-case:')) {
      const caseId = contextId.slice('ai-case:'.length);
      const found = caseRows.find((row) => row.caseId === caseId);
      if (found) setSelectedContext({ kind: 'case', record: found });
    }
  };

  const clearAiPanelContext = (contextId: string) => {
    const nextContextId = panelNav.clearContext(contextId);
    if (contextId.startsWith('ai-action:') && selectedContext?.kind === 'action') setSelectedContext(null);
    if (contextId.startsWith('ai-case:') && selectedContext?.kind === 'case') setSelectedContext(null);
    if (nextContextId) {
      handleAiPanelContextChange(nextContextId);
      return;
    }
    setSelectedContext(null);
    navigate('/ai-actions', { replace: true });
  };

  const closeAiPanel = () => {
    panelNav.closePanel();
    setSelectedContext(null);
    navigate('/ai-actions', { replace: true });
  };

  const handleTabChange = (nextTab: AiActionTab) => {
    setActiveTab(nextTab);
    if (nextTab === 'by_case' && selectedContext?.kind === 'case') {
      navigate(`/ai-actions?case=${encodeURIComponent(selectedContext.record.caseId)}`, { replace: true });
      return;
    }
    if (nextTab === 'all' && selectedContext?.kind === 'action') {
      navigate(`/ai-actions?action=${encodeURIComponent(selectedContext.action.id)}`, { replace: true });
      return;
    }
    setSelectedContext(null);
    navigate('/ai-actions', { replace: true });
  };

  return (
    <div className={`flex h-full flex-col ${UI_CLASS.workspaceTopLeftRadius} overflow-hidden`}>
      <div className="relative z-10 bg-surface-primary px-6 pb-4 pt-4">
        <div className="mb-[52px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold text-text-primary">Intelligence monitoring</h1>
            <span className="rounded-full border border-[#b7bbc2] bg-surface-muted px-2 py-0.5 text-[12px] font-semibold text-text-secondary">
              {activeTotalLabel}
            </span>
          </div>
        </div>
        <ModuleTabsBar tabs={tabs} activeId={activeTab} onChange={handleTabChange} />
        <div className="mt-4 flex flex-wrap items-center gap-3 xl:flex-nowrap">
          <SearchBar value={search} onChange={setSearch} placeholder={isByCaseTab ? 'Search cases, people, tasks, or requirements...' : 'Search intelligence activity...'} />
          {!isByCaseTab ? (
            <>
              <FilterDropdown label="Status" options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
              <FilterDropdown label="Action type" options={ACTION_TYPE_OPTIONS} value={actionTypeFilter} onChange={setActionTypeFilter} />
            </>
          ) : null}
          <div className="ml-auto flex shrink-0 overflow-hidden rounded-md border border-border-default">
            <button onClick={() => setViewMode('table')} className={`p-2 ${viewMode === 'table' ? 'bg-brand-blue text-white' : 'bg-white text-text-secondary hover:bg-surface-muted'}`} title="Table view">
              <List className="size-4" />
            </button>
            <button onClick={() => setViewMode('card')} className={`border-l border-border-default p-2 ${viewMode === 'card' ? 'bg-brand-blue text-white' : 'bg-white text-text-secondary hover:bg-surface-muted'}`} title="Card view">
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 bg-white">
        <div className="min-w-0 flex-1 overflow-hidden">
          {isByCaseTab ? (
            viewMode === 'table' ? (
              <CaseIntelligenceTable
                rows={filteredCaseRows}
                selectedCaseId={selectedCase?.caseId}
                onSelect={selectCase}
              />
            ) : (
              <div className="h-full overflow-y-auto p-4">
                <div className="space-y-3">
                  {filteredCaseRows.map((record) => (
                    <CaseIntelligenceCard
                      key={record.caseId}
                      record={record}
                      selected={selectedCase?.caseId === record.caseId}
                      onSelect={() => selectCase(record)}
                    />
                  ))}
                </div>
              </div>
            )
          ) : viewMode === 'table' ? (
            <div
              ref={setTableScrollEl}
              className={moduleTableScrollContainerClass(hasHorizontalOverflow, 'h-full')}
            >
              <table className="w-full border-separate border-spacing-0">
                <thead className="bg-surface-primary">
                  <tr>
                    <th className={`sticky left-0 top-0 z-[15] w-[220px] min-w-[220px] max-w-[220px] border-b border-t border-border-default bg-surface-primary px-3 py-3 text-left align-middle ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}>
                      {showLeftStickyEdge ? (
                        <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                      ) : null}
                      <button type="button" onClick={() => handleSort('id')} className="group flex items-center gap-1 text-sm font-medium text-text-primary">
                      AI action
                        <ReorderIcon isActive={sortColumn === 'id'} />
                      </button>
                    </th>
                    <Header label="Summary" column="title" sortColumn={sortColumn} onSort={handleSort} />
                    <Header label="Source" column="sourceSurface" sortColumn={sortColumn} onSort={handleSort} />
                    <th className="sticky top-0 z-[10] min-w-[180px] border-b border-t border-border-default bg-surface-primary px-3 py-3 text-left text-sm font-medium text-text-secondary whitespace-nowrap">Linked object</th>
                    <Header label="Confidence" column="confidence" sortColumn={sortColumn} onSort={handleSort} />
                    <Header label="Created" column="createdAt" sortColumn={sortColumn} onSort={handleSort} />
                    <th className={`sticky right-[48px] top-0 z-[15] min-w-[140px] border-b border-t border-border-default bg-surface-primary px-3 py-3 text-left align-middle ${showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}>
                      {showRightStickyEdge ? (
                        <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                      ) : null}
                      <button type="button" onClick={() => handleSort('status')} className="group flex items-center gap-1 text-sm font-medium text-text-primary">
                        Status
                        <ReorderIcon isActive={sortColumn === 'status'} />
                      </button>
                    </th>
                    <th className="sticky right-0 top-0 z-[14] w-[48px] min-w-[48px] max-w-[48px] border-b border-t border-border-default bg-surface-primary px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => {
                    const linked = primaryLinkedObject(row);
                    const linkedCaseId = row.linkedObjects.find((ref) => ref.kind === 'case')?.id;
                    return (
                      <tr key={row.id} data-keep-sidepanel="row" onClick={() => selectAction(row)} className={`group cursor-pointer border-b border-border-default ${selectedAction?.id === row.id ? 'bg-surface-selected-alt' : 'bg-white hover:bg-surface-hover'}`}>
                        <td className={`sticky left-0 z-[6] w-[220px] min-w-[220px] max-w-[220px] border-b border-border-default px-3 py-3 align-top ${selectedAction?.id === row.id ? 'bg-surface-selected-alt' : 'bg-white group-hover:bg-surface-hover'} ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}>
                          {showLeftStickyEdge ? (
                            <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                          ) : null}
                          <span className="block max-w-[190px] truncate text-sm font-semibold text-brand-blue" title={row.id}>{row.id}</span>
                        </td>
                        <td className="min-w-[340px] border-b border-border-default px-3 py-3 align-top">
                          <AiActionSummaryCell action={row} />
                        </td>
                        <td className="border-b border-border-default px-3 py-3 align-top text-sm capitalize text-text-primary">{row.sourceSurface}</td>
                        <td className="min-w-[180px] max-w-[220px] border-b border-border-default px-3 py-3 align-top text-sm whitespace-nowrap">
                          {linked ? <Link to={objectHref(linked.kind, linked.id, linkedCaseId) ?? '#'} onClick={(event) => event.stopPropagation()} className={TABLE_LINK_TRUNCATE_CLASS} title={linked.label ?? linked.id}>{linked.label ?? linked.id}</Link> : <span className="text-text-muted">-</span>}
                        </td>
                        <td className="border-b border-border-default px-3 py-3 align-top text-sm text-text-primary">{row.confidence ? `${row.confidence}%` : '-'}</td>
                        <td className="border-b border-border-default px-3 py-3 align-top text-sm text-text-primary">{new Date(row.createdAt).toLocaleDateString()}</td>
                        <td className={`sticky right-[48px] z-[6] min-w-[140px] border-b border-border-default px-3 py-3 align-top ${selectedAction?.id === row.id ? 'bg-surface-selected-alt' : 'bg-white group-hover:bg-surface-hover'} ${showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}>
                          {showRightStickyEdge ? (
                            <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                          ) : null}
                          <LozengeTag label={row.status.replace('_', ' ')} type={statusType(row.status)} subtle />
                        </td>
                        <td className={`sticky right-0 z-[5] w-[48px] min-w-[48px] max-w-[48px] border-b border-border-default px-3 py-3 align-top ${selectedAction?.id === row.id ? 'bg-surface-selected-alt' : 'bg-white group-hover:bg-surface-hover'}`}>
                          <MoreVertical className="size-4 text-text-muted" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-4">
              <div className="space-y-3">
                {filteredRows.map((row) => (
                  <AiActionCard key={row.id} row={row} selected={selectedAction?.id === row.id} onSelect={() => selectAction(row)} />
                ))}
              </div>
            </div>
          )}
          <div className="border-t border-border-default bg-surface-primary px-4 py-2 text-xs font-medium text-text-secondary">
            Showing {activeTotalLabel}
          </div>
        </div>
        {selectedContext && panelNav.isOpen ? (
          <WorkspaceObjectSidePanel
            contexts={panelNav.contexts}
            activeContextId={panelNav.activeContextId}
            onChangeContext={handleAiPanelContextChange}
            onClearContext={clearAiPanelContext}
            onClose={closeAiPanel}
            panelWidth={panelWidth}
            onPanelWidthChange={setPanelWidth}
            isResizing={isResizing}
            onResizeStart={() => setIsResizing(true)}
            assistantContent={<WorkspaceAssistantPanel contextId={selectedContext.kind === 'case' ? `ai-case:${selectedContext.record.caseId}` : `ai-action:${selectedContext.action.id}`} />}
          >
            {selectedContext.kind === 'case' ? (
              <CaseIntelligencePanel record={selectedContext.record} />
            ) : (
              <AiActionDetail action={selectedContext.action} />
            )}
          </WorkspaceObjectSidePanel>
        ) : null}
      </div>
    </div>
  );
}

function Header({ label, column, sortColumn, onSort }: { label: string; column: AiActionSortColumn; sortColumn: AiActionSortColumn; onSort: (column: AiActionSortColumn) => void }) {
  return (
    <th className="sticky top-0 z-[10] border-b border-t border-border-default bg-surface-primary px-3 py-3 text-left align-middle">
      <button type="button" onClick={() => onSort(column)} className="group flex items-center gap-1 text-sm font-medium text-text-primary">
        {label === 'Summary' ? (
          <SummaryTableColumnHeader className="text-sm font-medium text-text-primary" />
        ) : (
          label
        )}
        <ReorderIcon isActive={sortColumn === column} />
      </button>
    </th>
  );
}

function CaseIntelligenceTable({
  rows,
  selectedCaseId,
  onSelect,
}: {
  rows: CaseIntelligenceRecord[];
  selectedCaseId?: string;
  onSelect: (record: CaseIntelligenceRecord) => void;
}) {
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const { hasHorizontalOverflow } = useTableHorizontalScroll(scrollEl);

  return (
    <div ref={setScrollEl} className={moduleTableScrollContainerClass(hasHorizontalOverflow, 'h-full')}>
      <table className="w-full border-separate border-spacing-0">
        <thead className="bg-surface-primary">
          <tr>
            <th className="sticky left-0 top-0 z-[15] w-[240px] min-w-[240px] border-b border-t border-border-default bg-surface-primary px-6 py-3 text-left align-middle text-sm font-medium text-text-primary">
              Case
            </th>
            <th className="sticky top-0 z-[10] min-w-[340px] border-b border-t border-border-default bg-surface-primary px-3 py-3 text-left text-sm font-medium text-text-primary">
              Intelligence summary
            </th>
            <th className="sticky top-0 z-[10] min-w-[140px] border-b border-t border-border-default bg-surface-primary px-3 py-3 text-left text-sm font-medium text-text-primary">
              Status
            </th>
            <th className="sticky top-0 z-[10] min-w-[120px] border-b border-t border-border-default bg-surface-primary px-3 py-3 text-left text-sm font-medium text-text-primary">
              AI actions
            </th>
            <th className="sticky top-0 z-[10] min-w-[120px] border-b border-t border-border-default bg-surface-primary px-3 py-3 text-left text-sm font-medium text-text-primary">
              Tasks
            </th>
            <th className="sticky top-0 z-[10] min-w-[140px] border-b border-t border-border-default bg-surface-primary px-3 py-3 text-left text-sm font-medium text-text-primary">
              Requirements
            </th>
            <th className="sticky top-0 z-[10] min-w-[130px] border-b border-t border-border-default bg-surface-primary px-3 py-3 text-left text-sm font-medium text-text-primary">
              Attention
            </th>
            <th className="sticky right-0 top-0 z-[14] w-[48px] min-w-[48px] max-w-[48px] border-b border-t border-border-default bg-surface-primary px-3 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((record) => (
            <tr
              key={record.caseId}
              data-keep-sidepanel="row"
              onClick={() => onSelect(record)}
              className={`group cursor-pointer ${selectedCaseId === record.caseId ? 'bg-surface-selected-alt' : 'bg-white hover:bg-surface-hover'}`}
            >
              <td className={`sticky left-0 z-[6] border-b border-border-default px-6 py-3 align-top ${selectedCaseId === record.caseId ? 'bg-surface-selected-alt' : 'bg-white group-hover:bg-surface-hover'}`}>
                <Link
                  to={`/cases/${record.caseId}`}
                  onClick={(event) => event.stopPropagation()}
                  className={`max-w-[190px] ${TABLE_LINK_TRUNCATE_CLASS}`}
                  title={record.caseId}
                >
                  {record.caseId}
                </Link>
                <span className="mt-0.5 block max-w-[200px] truncate text-xs text-text-muted" title={record.summary.primaryPartyName ?? record.summary.claimant}>
                  {record.summary.primaryPartyName ?? record.summary.claimant}
                </span>
              </td>
              <td className="min-w-[340px] border-b border-border-default px-3 py-3 align-top">
                <p className="truncate text-sm font-semibold text-text-primary">{record.latestSignal}</p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-text-muted">{record.summary.aiSummary}</p>
              </td>
              <td className="border-b border-border-default px-3 py-3 align-top">
                <LozengeTag label={record.summary.status} type={caseStatusType(record.summary.status)} subtle />
              </td>
              <td className="border-b border-border-default px-3 py-3 align-top text-sm font-semibold text-text-primary">{record.metrics.aiActions}</td>
              <td className="border-b border-border-default px-3 py-3 align-top text-sm font-semibold text-text-primary">{record.metrics.tasks}</td>
              <td className="border-b border-border-default px-3 py-3 align-top text-sm font-semibold text-text-primary">{record.metrics.requirements}</td>
              <td className="border-b border-border-default px-3 py-3 align-top">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${record.metrics.attention > 0 ? 'bg-[#fff4e6] text-[#8a5a00]' : 'bg-[#e7f6ec] text-[#1f8a4d]'}`}>
                  {record.metrics.attention} signals
                </span>
              </td>
              <td className={`sticky right-0 z-[5] w-[48px] min-w-[48px] max-w-[48px] border-b border-border-default px-3 py-3 align-top ${selectedCaseId === record.caseId ? 'bg-surface-selected-alt' : 'bg-white group-hover:bg-surface-hover'}`}>
                <MoreVertical className="size-4 text-text-muted" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CaseIntelligenceCard({ record, selected, onSelect }: { record: CaseIntelligenceRecord; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      data-keep-sidepanel="card"
      onClick={onSelect}
      className={`grid w-full gap-4 rounded-lg border p-4 text-left transition-all xl:grid-cols-[minmax(0,1fr)_360px] ${selected ? 'border-brand-blue bg-surface-selected-alt' : 'border-border-default bg-white hover:shadow-md'}`}
    >
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <LozengeTag label={record.summary.status} type={caseStatusType(record.summary.status)} subtle />
          <span className="rounded-full bg-brand-accent-light px-2 py-0.5 text-[10px] font-semibold text-brand-accent">
            {record.metrics.aiActions} AI actions
          </span>
          {record.metrics.attention > 0 ? (
            <span className="rounded-full bg-[#fff4e6] px-2 py-0.5 text-[10px] font-semibold text-[#8a5a00]">
              {record.metrics.attention} needs attention
            </span>
          ) : null}
        </div>
        <h3 className="text-base font-semibold text-text-heading">{record.caseId}</h3>
        <p className="mt-0.5 text-sm text-text-secondary">{record.summary.primaryPartyName ?? record.summary.claimant}</p>
        <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{record.latestSignal}</p>
      </div>
      <div className="grid grid-cols-4 gap-2 rounded-lg border border-border-soft bg-[#fbfcfd] p-3">
        <MetricTile label="Tasks" value={record.metrics.tasks} />
        <MetricTile label="Reqs" value={record.metrics.requirements} />
        <MetricTile label="Actions" value={record.metrics.aiActions} />
        <MetricTile label="Touchpoints" value={record.metrics.interactions} />
      </div>
    </button>
  );
}

function MetricTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="min-w-0 rounded-md bg-white px-2 py-2 text-center ring-1 ring-border-soft">
      <p className="text-base font-bold text-text-heading">{value}</p>
      <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-text-muted">{label}</p>
    </div>
  );
}

function CaseIntelligencePanel({ record }: { record: CaseIntelligenceRecord }) {
  const currency = useCurrencyFormatter();
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border-default bg-white px-6 py-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-accent-light px-2 py-0.5 text-[10px] font-bold uppercase text-brand-accent">By case</span>
          <LozengeTag label={record.summary.status} type={caseStatusType(record.summary.status)} subtle />
          <span className="text-[11px] text-text-muted">#{record.caseId}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-[18px] font-semibold text-text-heading">{record.summary.title ?? record.caseId}</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {record.summary.primaryPartyName ?? record.summary.claimant} · {record.summary.product}
            </p>
          </div>
          <Link
            to={`/cases/${record.caseId}`}
            data-keep-sidepanel="link"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-default px-2.5 py-1 text-[11px] font-semibold text-text-secondary transition-colors hover:border-brand-blue hover:text-brand-blue"
          >
            Open case
            <ExternalLink className="size-3" />
          </Link>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">{record.summary.aiSummary}</p>
        <div className="mt-4 grid overflow-hidden rounded-lg border border-border-soft bg-[#fbfcfd] sm:grid-cols-4">
          <PanelMetric icon={AiCueIcon} label="AI actions" value={record.metrics.aiActions} />
          <PanelMetric icon={ClipboardList} label="Tasks" value={record.metrics.tasks} />
          <PanelMetric icon={FileCheck2} label="Requirements" value={record.metrics.requirements} />
          <PanelMetric icon={MessageSquare} label="Interactions" value={record.metrics.interactions} />
        </div>
        <p className="mt-2 text-[11px] font-medium text-text-muted">
          {record.metrics.completed} completed item(s) across actions, tasks, requirements, and interactions.
        </p>
      </div>

      <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto bg-surface-primary px-5 py-4">
        <section className="rounded-lg border border-border-soft bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Identification</p>
            <span className="rounded-full bg-surface-primary px-2 py-0.5 text-[10px] font-semibold text-text-secondary ring-1 ring-border-soft">
              {record.summary.phase.replace('-', ' ')}
            </span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoCell label="Primary party" value={record.summary.primaryPartyName ?? record.summary.claimant} />
            <InfoCell label="Product" value={record.summary.product} />
            <InfoCell label="Benefit" value={currency.localize(record.summary.benefit)} />
            <InfoCell label="SLA" value={record.summary.sla} />
          </div>
        </section>

        <div className="mt-3 grid gap-3 xl:grid-cols-2">
          <TimelineSection title="What the AI agent did" steps={record.aiSteps} empty="No AI agent activity has been recorded for this case yet." />
          <TimelineSection title="What the human did" steps={record.humanSteps} empty="No human activity has been recorded for this case yet." />
        </div>

        <div className="mt-3 grid gap-3 xl:grid-cols-2">
          <RelatedList
            title="Tasks added"
            count={record.tasks.length}
            items={record.tasks.map((task) => ({
              id: task.id,
              href: `/tasks?task=${encodeURIComponent(task.id)}`,
              title: task.taskType,
              meta: `${task.status} · ${task.assignedTo ?? 'Unassigned'} · ${task.slaRemaining ?? 'No SLA'}`,
              tone: taskNeedsPanelAttention(task.status, task.priority) ? 'attention' : 'normal',
            }))}
          />
          <RelatedList
            title="Requirements added / updated"
            count={record.requirements.length}
            items={record.requirements.map((requirement) => ({
              id: String(requirement.id),
              href: `/cases/${record.caseId}#tab=requirements&req=${encodeURIComponent(String(requirement.id))}`,
              title: requirement.name,
              meta: `${requirement.status} · ${requirement.category} · due ${requirement.dueDate}`,
              tone: requirement.status === 'Overdue' || requirement.status === 'Pending' ? 'attention' : 'normal',
            }))}
          />
        </div>

        <section className="mt-3 rounded-lg border border-border-soft bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Case intelligence signal</p>
          <p className="mt-2 text-sm font-semibold text-text-primary">{record.latestSignal}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
            This summary is derived from linked AI actions, case tasks, requirements, communications, and activity events in the active dataset.
          </p>
        </section>
      </div>
    </div>
  );
}

function PanelMetric({ icon: Icon, label, value }: { icon: CueIconComponent; label: string; value: number }) {
  return (
    <div className="min-w-0 border-b border-border-soft px-3 py-2.5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
        <Icon className="size-3.5 shrink-0 text-brand-blue" aria-hidden />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1 text-[14px] font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md bg-surface-primary px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-1 truncate text-[12px] font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function TimelineSection({ empty, steps, title }: { empty: string; steps: CaseIntelligenceStep[]; title: string }) {
  return (
    <section className="rounded-lg border border-border-soft bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">{title}</p>
        <span className="rounded-full bg-surface-primary px-2 py-0.5 text-[10px] font-semibold text-text-secondary ring-1 ring-border-soft">
          Recent {steps.length}{steps.length >= 12 ? ' of 12' : ''}
        </span>
      </div>
      {steps.length ? (
        <div className="relative mt-4 space-y-3">
          {steps.map((step, index) => {
            const tone = getStepTone(step.status);
            const StepIcon = tone.icon;
            return (
              <div key={step.id} className="relative flex items-start gap-3">
                {index < steps.length - 1 ? (
                  <span className="absolute left-[13px] top-7 h-[calc(100%+0.25rem)] w-px bg-border-soft" />
                ) : null}
                <span className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-border-soft ${tone.pillClass}`}>
                  <StepIcon className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1 rounded-md bg-surface-primary px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12px] font-semibold text-text-primary">{step.label}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold ${tone.pillClass}`}>
                      {step.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">{step.detail}</p>
                  <p className="mt-1 text-[10px] text-text-muted">
                    {formatCaseIntelligenceTimestamp(step.timestamp) ?? step.source.replace('_', ' ')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 rounded-md bg-surface-primary px-3 py-2 text-[12px] text-text-secondary">{empty}</p>
      )}
    </section>
  );
}

function taskNeedsPanelAttention(status: string, priority: string) {
  const normalized = status.toLowerCase();
  return ['to do', 'todo', 'pending', 'in progress'].includes(normalized) || priority === 'HIGH' || priority === 'URGENT';
}

function RelatedList({
  count,
  items,
  title,
}: {
  count: number;
  items: Array<{ id: string; href: string; title: string; meta: string; tone: 'attention' | 'normal' }>;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-border-soft bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">{title}</p>
        <span className="rounded-full bg-surface-primary px-2 py-0.5 text-[10px] font-semibold text-text-secondary ring-1 ring-border-soft">
          {count}
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {items.length ? items.slice(0, 6).map((item) => (
          <Link
            key={item.id}
            to={item.href}
            data-keep-sidepanel="link"
            className="flex items-start justify-between gap-3 rounded-md bg-surface-primary px-3 py-2 text-sm hover:text-brand-blue"
          >
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-semibold text-text-primary">{item.title}</span>
              <span className="mt-0.5 block truncate text-[11px] text-text-secondary">{item.meta}</span>
            </span>
            <span className={`mt-0.5 size-2 shrink-0 rounded-full ${item.tone === 'attention' ? 'bg-[#f5a200]' : 'bg-[#1f8a4d]'}`} />
          </Link>
        )) : (
          <p className="rounded-md bg-surface-primary px-3 py-2 text-[12px] text-text-secondary">No linked items.</p>
        )}
      </div>
    </section>
  );
}

function AiActionCard({ row, selected, onSelect }: { row: AiActionRecord; selected: boolean; onSelect: () => void }) {
  const linked = primaryLinkedObject(row);
  return (
    <button type="button" data-keep-sidepanel="card" onClick={onSelect} className={`grid w-full gap-4 rounded-lg border p-4 text-left transition-all xl:grid-cols-[minmax(0,1fr)_320px] ${selected ? 'border-brand-blue bg-surface-selected-alt' : 'border-border-default bg-white hover:shadow-md'}`}>
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <LozengeTag label={row.status.replace('_', ' ')} type={statusType(row.status)} subtle />
          <span className="rounded-full bg-brand-accent-light px-2 py-0.5 text-[10px] font-semibold capitalize text-brand-accent">{row.sourceSurface}</span>
          {row.confidence ? <span className="rounded-full bg-surface-primary px-2 py-0.5 text-[10px] font-semibold text-text-muted">{row.confidence}% confidence</span> : null}
        </div>
        <h3 className="text-base font-semibold text-text-heading">{row.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{row.summary}</p>
        {row.rationale ? <p className="mt-2 line-clamp-2 text-xs text-text-muted">{row.rationale}</p> : null}
      </div>
      <div className="rounded-lg border border-border-soft bg-[#fbfcfd] p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Context</p>
        <p className="mt-1 text-[12px] font-semibold text-text-primary">{linked?.label ?? linked?.id ?? 'No linked object'}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {row.linkedObjects.slice(0, 5).map((ref) => (
            <span key={`${ref.kind}-${ref.id}`} className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold capitalize text-text-muted">{ref.kind}</span>
          ))}
        </div>
      </div>
    </button>
  );
}

function AiActionDetail({ action }: { action: AiActionRecord }) {
  const steps = getActionStepPreview(action);
  const completedSteps = steps.filter((step) => ['completed', 'accepted', 'done'].includes(step.status)).length;
  const linkedPrimary = primaryLinkedObject(action);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border-default bg-white px-6 py-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-accent-light px-2 py-0.5 text-[10px] font-bold uppercase text-brand-accent">AI action</span>
          <LozengeTag label={action.status.replace('_', ' ')} type={statusType(action.status)} subtle />
          <span className="text-[11px] text-text-muted">#{action.id}</span>
        </div>
        <h2 className="text-[18px] font-semibold text-text-heading">{action.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">{action.summary}</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-surface-primary px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Progress</p>
            <p className="mt-1 text-[13px] font-semibold text-text-primary">{getStepProgressLabel(action)}</p>
          </div>
          <div className="rounded-lg bg-surface-primary px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Source</p>
            <p className="mt-1 text-[13px] font-semibold capitalize text-text-primary">{action.sourceSurface}</p>
          </div>
          <div className="rounded-lg bg-surface-primary px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Actor</p>
            <p className="mt-1 text-[13px] font-semibold text-text-primary">{actorLabel(action.actor)}</p>
          </div>
        </div>
      </div>
      <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto bg-surface-primary px-5 py-4">
        <section className="rounded-lg border border-border-soft bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">What the AI did</p>
              <p className="mt-1 text-[13px] font-semibold text-text-primary">
                {actionNeedsReview(action) ? 'Prepared an action that needs human review' : 'Completed or recorded an intelligence action'}
              </p>
            </div>
            {action.confidence ? (
              <span className="rounded-full bg-brand-accent-light px-2 py-0.5 text-[10px] font-semibold text-brand-accent">
                {action.confidence}% confidence
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            {action.rationale ?? action.summary}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-md bg-surface-primary px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Primary object</p>
              <p className="mt-1 truncate text-[12px] font-semibold text-text-primary">
                {linkedPrimary ? `${linkedPrimary.kind} · ${linkedPrimary.label ?? linkedPrimary.id}` : 'No linked object'}
              </p>
            </div>
            <div className="rounded-md bg-surface-primary px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Workflow</p>
              <p className="mt-1 truncate text-[12px] font-semibold text-text-primary">{action.workflowTemplateId ?? action.actionType}</p>
            </div>
          </div>
        </section>

        {action.rationale ? (
          <section className="mt-3 rounded-lg border border-border-soft bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Rationale</p>
            <p className="mt-2 text-sm text-text-secondary">{action.rationale}</p>
          </section>
        ) : null}

        <section className="mt-3 rounded-lg border border-border-soft bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Action steps</p>
            <span className="rounded-full bg-surface-primary px-2 py-0.5 text-[10px] font-semibold text-text-secondary ring-1 ring-border-soft">
              {completedSteps}/{steps.length} done
            </span>
            {actionNeedsReview(action) ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#fff4e6] px-2 py-0.5 text-[10px] font-semibold text-[#8a5a00]">
                <AlertCircle className="size-3" />
                Review needed
              </span>
            ) : null}
          </div>
          <div className="relative mt-4 space-y-3">
            {steps.map((step, index) => {
              const tone = getStepTone(step.status);
              const StepIcon = tone.icon;
              return (
                <div key={step.id} className="relative flex items-start gap-3">
                  {index < steps.length - 1 ? (
                    <span className="absolute left-[13px] top-7 h-[calc(100%+0.25rem)] w-px bg-border-soft" />
                  ) : null}
                  <span className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-border-soft ${tone.pillClass}`}>
                    <StepIcon className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1 rounded-md bg-surface-primary px-3 py-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[12px] font-semibold text-text-primary">{step.label}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold ${tone.pillClass}`}>
                        {step.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-text-muted">
                      {step.completedAt ? `Completed ${step.completedAt}` : `Step ${index + 1} of ${steps.length}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-3 rounded-lg border border-border-soft bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Linked objects</p>
          <div className="mt-3 space-y-2">
            {action.linkedObjects.map((ref) => {
              const linkedCaseId = action.linkedObjects.find((item) => item.kind === 'case')?.id;
              const href = objectHref(ref.kind, ref.id, linkedCaseId);
              return (
                <Link key={`${ref.kind}-${ref.id}`} to={href ?? '#'} className="flex items-center justify-between rounded-md bg-surface-primary px-3 py-2 text-sm hover:text-brand-blue">
                  <span><span className="capitalize text-text-muted">{ref.kind}</span> · <span className="font-semibold">{ref.label ?? ref.id}</span></span>
                  <ExternalLink className="size-3.5" />
                </Link>
              );
            })}
          </div>
        </section>
        <section className="mt-3 rounded-lg border border-border-soft bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Human follow-up</p>
          <div className="mt-3 grid gap-2">
            <div className="rounded-md bg-surface-primary px-3 py-2">
              <p className="text-[12px] font-semibold text-text-primary">
                {actionNeedsReview(action) ? 'Review and confirm the AI action' : 'No immediate review blocker'}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
                {actionNeedsReview(action)
                  ? 'Use the linked object and step trail above to validate the action before marking it reviewed or rejecting the suggestion.'
                  : 'This action is recorded for monitoring and audit. You can still inspect the linked objects or open Copilot with this context.'}
              </p>
            </div>
          </div>
        </section>
        {action.payload ? (
          <section className="mt-3 rounded-lg border border-border-soft bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Payload</p>
            <pre className="mt-2 max-h-[180px] overflow-auto rounded-md bg-surface-primary p-3 text-[10px] text-text-secondary">{JSON.stringify(action.payload, null, 2)}</pre>
          </section>
        ) : null}
      </div>
      <div className="space-y-2 border-t border-border-default bg-white p-4">
        <button className="inline-flex w-full items-center justify-center rounded-full bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-hover">Mark reviewed</button>
        <button className="inline-flex w-full items-center justify-center rounded-full border border-border-default px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-muted">Reject suggestion</button>
      </div>
    </div>
  );
}
