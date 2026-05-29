import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  AlertCircle,
  Briefcase,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  Hourglass,
  Inbox,
  LayoutGrid,
  Link2,
  List,
  Loader2,
  Mail,
  MailQuestion,
  Phone,
  Plus,
  ShieldCheck,
  Upload,
  UserRound,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { AiCueSparkle } from './AiCueSparkle';
import { SidePanelSummaryBox } from './AiSummaryWithConfidenceCard';
import { useLiveContextOverlay } from '../contexts/LiveContextProvider';
import { filterDatasetBySettings, getSystemDataset, listRequests, listRequirements, listTasks } from '../data/objectRepository';
import {
  buildRequestActionContext,
  executePanelAction,
  pickAccomplishmentTask,
  resolveRequestPanelActions,
  tasksForRequest,
  type PanelAction,
} from '../domain/objectWorkflow';
import { ObjectPanelFooter } from './ObjectPanelFooter';
import { useActiveUser } from '../contexts/ActiveUserContext';
import { getDocumentEvidence } from '../data/mock-document-evidence';
import type {
  RequestSortableColumn,
  RequestSourceChannel,
  RequestSystemStep,
  RequestSystemStepKind,
  RequestSystemStepStatus,
  RequestTabType,
  CaseRequirement,
  ServiceRequest,
  SortDirection,
  Task,
  ViewMode,
} from '../types';
import { PriorityChip, SearchBar } from './ds';
import { ModuleTabsBar } from './ModuleTabsBar';
import { Checkbox } from './ui/checkbox';
import { LozengeTag, ModuleTablePaginationFooter, ReorderIcon } from './index';
import { getStatusLozengeType } from '../utils/status-display';
import { sortRequestsByRelevance } from '../utils/module-relevance-sort';
import { WorkspaceObjectSidePanel, type WorkspacePanelContext } from './WorkspaceObjectSidePanel';
import { documentPanelContextId, pushWorkspacePanelContext, requestPanelContextId } from '../utils/workspacePanelContextUtils';
import { DynamicDocumentSidePanel, type DynamicDocumentData } from './DynamicDocumentSidePanel';
import { getDefaultSidePanelWidth } from '../utils/sidepanel-width';
import { WorkspaceAssistantPanel } from './WorkspaceAssistantPanel';
import { useDataSourceSettings, usePlatformSettings } from '../contexts/PlatformSettingsContext';
import { CreateRequestModal } from './CreateRequestModal';
import { SmartRequestModal } from './requests/SmartRequestModal';
import { ModuleTableCheckboxColumnCell } from './ModuleTableCheckboxColumn';
import {
  MODULE_TABLE_CHECKBOX_COL_WIDTH,
  MODULE_TABLE_FIRST_STICKY_COL_PADDING_CLASS,
  SummaryTableColumnHeader,
  TABLE_CELL_ALIGN_CLASS,
  TABLE_LINK_CLASS,
  TABLE_LINK_TRUNCATE_CLASS,
  TABLE_SUBTEXT_CLASS,
  TABLE_TEXT_CLASS,
  TwoLineSummaryCell,
} from './ModuleCellHelpers';
import { useTableHorizontalScroll } from '../hooks/useTableHorizontalScroll';
import {
  MODULE_TABLE_LAYOUT_CLASS,
  MODULE_TABLE_SUMMARY_COL_CLASS,
  moduleTableScrollContainerClass,
} from '../utils/module-table-scroll';

/** Request ID + case share one sticky cell so the left pack scrolls as a unit. */
const REQUEST_TABLE_REQUEST_COL_WIDTH = 168;
const REQUEST_TABLE_CASE_COL_WIDTH = 132;
const REQUEST_TABLE_LEFT_PACK_WIDTH = REQUEST_TABLE_REQUEST_COL_WIDTH + REQUEST_TABLE_CASE_COL_WIDTH;
const REQUEST_TABLE_LEFT_PACK_GRID_STYLE = {
  gridTemplateColumns: `${REQUEST_TABLE_REQUEST_COL_WIDTH}px ${REQUEST_TABLE_CASE_COL_WIDTH}px`,
} as const;

const REQUEST_TABLE_STICKY_COL = {
  checkboxWidth: MODULE_TABLE_CHECKBOX_COL_WIDTH,
  packLeft: MODULE_TABLE_CHECKBOX_COL_WIDTH,
  packWidth: REQUEST_TABLE_LEFT_PACK_WIDTH,
} as const;

const REQUEST_SUMMARY_COL_WIDTH = 400;
const REQUEST_SCROLL_COL_MIN = 112;
const REQUEST_REQUESTER_COL_WIDTH = 140;
const REQUEST_STATUS_ACTIONS_WIDTH = 190;
const REQUEST_SUMMARY_COL_CLASS = `${MODULE_TABLE_SUMMARY_COL_CLASS} min-w-[400px]`;
const REQUEST_TABLE_MIN_WIDTH =
  REQUEST_TABLE_STICKY_COL.checkboxWidth +
  REQUEST_TABLE_STICKY_COL.packWidth +
  REQUEST_SUMMARY_COL_WIDTH +
  REQUEST_SCROLL_COL_MIN * 2 +
  REQUEST_REQUESTER_COL_WIDTH +
  REQUEST_STATUS_ACTIONS_WIDTH;

function sortRequests(rows: ServiceRequest[], column: RequestSortableColumn | null, direction: SortDirection) {
  if (!column) return sortRequestsByRelevance(rows);
  return [...rows].sort((a, b) => {
    const cmp = String(a[column] ?? '').localeCompare(String(b[column] ?? ''));
    return direction === 'asc' ? cmp : -cmp;
  });
}

type RequestPanelTab = 'overview' | 'form' | 'activity' | 'links';

function requestStatusType(status: ServiceRequest['status']) {
  if (status === 'Completed') return 'Success' as const;
  if (status === 'Rejected' || status === 'Cancelled') return 'Alert' as const;
  if (status === 'Pending Info' || status === 'Awaiting info') return 'Warning' as const;
  if (status === 'New') return 'Discovery' as const;
  return 'Informative' as const;
}

function requestCategoryType(category: ServiceRequest['category']) {
  return 'Neutral' as const;
}

function requestInitials(request: ServiceRequest) {
  if (request.requesterInitials) return request.requesterInitials;
  return request.requester.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function timelineDotClass(dotCls: string) {
  if (dotCls === 'rp-tl-dot-ai') return 'bg-brand-accent';
  if (dotCls === 'rp-tl-dot-human') return 'bg-brand-blue';
  if (dotCls === 'rp-tl-dot-success') return 'bg-brand-green';
  if (dotCls === 'rp-tl-dot-warn') return 'bg-[#f5a200]';
  return 'bg-text-muted';
}

export function RequestsModule() {
  const navigate = useNavigate();
  const location = useLocation();
  const dataSource = useDataSourceSettings();
  const { updateDataSource } = usePlatformSettings();
  const { profile } = useActiveUser();

  const refreshSelectedRequest = (datasetId: string, requestId: string) => {
    const nextDataSource = { ...dataSource, activeDatasetId: datasetId };
    const refreshed = listRequests(filterDatasetBySettings(getSystemDataset(datasetId), nextDataSource)).find(
      (row) => row.id === requestId,
    );
    updateDataSource({ activeDatasetId: datasetId });
    if (refreshed) setSelectedRequest(refreshed);
  };

  const workflowActor = useMemo(() => ({ name: profile.name }), [profile.name]);

  const handleRequestPanelAction = (requestId: string, action: PanelAction) => {
    const result = executePanelAction(dataSource.activeDatasetId, action, workflowActor);
    refreshSelectedRequest(result.datasetId, requestId);
  };

  const handleDocumentWorkflow = (actionId: string, documentId: string) => {
    if (actionId !== 'mark-reviewed' && actionId !== 'review-dataset-evidence') return;
    handleRequestPanelAction(selectedRequest?.id ?? '', {
      id: 'doc-mark-reviewed',
      label: 'Mark evidence reviewed',
      variant: 'secondary',
      execution: { type: 'mutation', action: 'mark_document_reviewed', documentId },
    });
  };

  const activeDataset = useMemo(() => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource), [dataSource]);
  const requests = useMemo(
    () => listRequests(activeDataset),
    [activeDataset],
  );
  const requestTabs = useMemo<{ id: RequestTabType; label: string; count?: number }[]>(
    () => [
      { id: 'all', label: 'All requests', count: requests.length },
      { id: 'claims', label: 'Claims', count: requests.filter((r) => r.category === 'Claims').length },
      { id: 'new_business', label: 'New business', count: requests.filter((r) => r.category === 'New business' || r.category === 'New Business').length },
    ],
    [requests],
  );
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<RequestSortableColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [activeTab, setActiveTab] = useState<RequestTabType>('all');
  const [panelWidth, setPanelWidth] = useState(() => getDefaultSidePanelWidth({ min: 420 }));
  const [requestsTableScrollEl, setRequestsTableScrollEl] = useState<HTMLDivElement | null>(null);
  const { showLeftStickyEdge, showRightStickyEdge, hasHorizontalOverflow } =
    useTableHorizontalScroll(requestsTableScrollEl);
  const [isResizing, setIsResizing] = useState(false);
  const [activeEvidenceId, setActiveEvidenceId] = useState('');
  const requestContextId = selectedRequest ? requestPanelContextId(selectedRequest.id) : '';
  const [panelContexts, setPanelContexts] = useState<WorkspacePanelContext[]>([]);
  const [activePanelContextId, setActivePanelContextId] = useState('');
  const [createRequestOpen, setCreateRequestOpen] = useState(false);
  const [smartRequestOpen, setSmartRequestOpen] = useState(false);
  const evidenceDocumentId = selectedRequest?.linkedObjects.find((item) => item.kind === 'document')?.id;
  const evidenceDocument = getDocumentEvidence(evidenceDocumentId, activeDataset);
  const documentContextId = evidenceDocument ? documentPanelContextId(evidenceDocument.documentId) : '';
  const selectedRequestTasks = useMemo(
    () => selectedRequest ? listTasks(activeDataset).filter((task) => selectedRequest.linkedTasks?.includes(task.id) || task.objectRefs?.some((ref) => ref.kind === 'request' && ref.id === selectedRequest.id)) : [],
    [activeDataset, selectedRequest],
  );
  const selectedRequestRequirements = useMemo(
    () => selectedRequest?.caseId
      ? listRequirements(activeDataset, selectedRequest.caseId).filter((requirement) => selectedRequest.linkedReqs?.includes(String(requirement.datasetRequirementId ?? requirement.id)))
      : [],
    [activeDataset, selectedRequest],
  );

  const requestOverlay = useMemo(
    () =>
      selectedRequest
        ? {
            id: `request:${selectedRequest.id}`,
            kind: 'requestDetail' as const,
            icon: Inbox,
            crumbs: ['Requests', selectedRequest.id],
            label: `Request ${selectedRequest.id}`,
            href: `/requests#request=${encodeURIComponent(selectedRequest.id)}`,
          }
        : null,
    [selectedRequest],
  );
  useLiveContextOverlay(requestOverlay);

  const selectRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    const context: WorkspacePanelContext = {
      id: requestPanelContextId(request.id),
      label: request.id,
      icon: Inbox,
      clearable: true,
    };
    setPanelContexts((current) => pushWorkspacePanelContext(current, context));
    setActivePanelContextId(context.id);
  };

  const closeRequestPanel = () => {
    setSelectedRequest(null);
    setPanelContexts([]);
    setActivePanelContextId('');
  };

  const handleRequestPanelContextChange = (contextId: string) => {
    setActivePanelContextId(contextId);
    if (contextId.startsWith('request:')) {
      const requestId = contextId.slice('request:'.length);
      const found = requests.find((request) => request.id === requestId);
      if (found) setSelectedRequest(found);
    }
  };

  const clearRequestPanelContext = (contextId: string) => {
    let nextContextId: string | undefined;
    setPanelContexts((current) => {
      const index = current.findIndex((context) => context.id === contextId);
      const next = index >= 0 ? current[index + 1] ?? current[index - 1] : undefined;
      nextContextId = next?.id;
      return current.filter((context) => context.id !== contextId);
    });
    if (nextContextId) {
      handleRequestPanelContextChange(nextContextId);
      return;
    }
    closeRequestPanel();
  };

  useEffect(() => {
    const hash = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash;
    if (!hash) return;
    const searchParams = new URLSearchParams(location.search);
    const requestId = new URLSearchParams(hash).get('request') ?? searchParams.get('object');
    const found = requestId ? requests.find((request) => request.id === requestId) : null;
    if (found) selectRequest(found);
  }, [location.hash, location.search, requests]);

  useEffect(() => {
    if (selectedRequest && !requests.some((request) => request.id === selectedRequest.id)) {
      setSelectedRequest(null);
      setPanelContexts([]);
      setActivePanelContextId('');
    }
  }, [requests, selectedRequest]);

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (event: MouseEvent) => {
      const nextWidth = window.innerWidth - event.clientX;
      const maxWidth = Math.round(window.innerWidth * 0.75);
      if (nextWidth >= 420 && nextWidth <= maxWidth) setPanelWidth(nextWidth);
    };
    const handleMouseUp = () => {
      setIsResizing(false);
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
  }, [isResizing]);

  useEffect(() => {
    if (evidenceDocument?.evidence[0]) setActiveEvidenceId(evidenceDocument.evidence[0].id);
  }, [evidenceDocument?.documentId]);

  const openEvidenceDocument = () => {
    if (!evidenceDocument || !selectedRequest) return;
    const documentContext: WorkspacePanelContext = {
      id: documentContextId,
      label: evidenceDocument.documentTitle,
      icon: FileText,
      clearable: true,
    };
    const requestContext: WorkspacePanelContext = {
      id: requestPanelContextId(selectedRequest.id),
      label: selectedRequest.id,
      icon: Inbox,
      clearable: true,
    };
    setPanelContexts((current) => {
      const withRequest = current.some((context) => context.id === requestContext.id)
        ? current
        : [...current, requestContext];
      return pushWorkspacePanelContext(withRequest, documentContext);
    });
    setActivePanelContextId(documentContextId);
  };

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return requests.filter((request) => {
      if (activeTab === 'claims' && request.category !== 'Claims') return false;
      if (activeTab === 'new_business' && request.category !== 'New business' && request.category !== 'New Business') return false;
      if (!query) return true;
      return [
        request.id,
        request.title,
        request.subtype,
        request.channel,
        request.category,
        request.status,
        request.requester,
        request.requesterRole,
        request.caseId,
        request.policyNumber,
      ].some((value) => String(value ?? '').toLowerCase().includes(query));
    });
  }, [activeTab, requests, searchQuery]);

  const sortedRequests = sortRequests(filteredRequests, sortColumn, sortDirection);

  const handleSort = (column: RequestSortableColumn) => {
    if (sortColumn === column) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="relative z-10 border-b border-border-default bg-surface-primary px-6 pb-0 pt-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="pl-[14px] text-2xl font-semibold text-text-primary">Requests</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSmartRequestOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-brand-accent/35 bg-brand-accent-light px-4 py-2 text-sm font-bold text-brand-accent shadow-sm transition-colors hover:bg-brand-accent/15"
            >
              <span className="relative mr-0.5 inline-flex shrink-0 pr-1.5 pt-1.5">
                <Upload className="size-4" aria-hidden />
                <span
                  className="absolute -right-0.5 -top-0.5 flex h-[14px] w-[14px] items-center justify-center rounded-full bg-brand-accent ring-[1.5px] ring-brand-accent-light"
                  aria-hidden
                >
                  <AiCueSparkle size={8} className="!text-white" />
                </span>
              </span>
              Smart Request
            </button>
            <button
              type="button"
              onClick={() => setCreateRequestOpen(true)}
              className="flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-brand-blue-hover"
            >
              <Plus className="size-4" />
              New request
            </button>
          </div>
        </div>
        <ModuleTabsBar tabs={requestTabs} activeId={activeTab} onChange={setActiveTab} />
      </div>

      <div className="relative z-0 flex min-h-0 flex-1 overflow-hidden">
        <div className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col bg-white transition-all">
          <div className="flex items-center justify-between gap-3 border-b border-border-default bg-surface-primary px-6 py-4">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search requests..." className="max-w-[340px]" />
            <div className="flex overflow-hidden rounded-full border border-border-default bg-white p-0.5">
              <button onClick={() => setViewMode('card')} className={`rounded-full p-1.5 ${viewMode === 'card' ? 'bg-brand-blue text-white' : 'text-text-secondary hover:bg-surface-muted'}`} title="Card view">
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode('table')} className={`rounded-full p-1.5 ${viewMode === 'table' ? 'bg-brand-blue text-white' : 'text-text-secondary hover:bg-surface-muted'}`} title="Table view">
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {viewMode === 'card' ? (
            <div className="min-h-0 flex-1 overflow-y-auto bg-white p-6">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {sortedRequests.map((request) => (
                  <RequestCard key={request.id} request={request} selected={selectedRequest?.id === request.id} onSelect={() => selectRequest(request)} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div
                ref={setRequestsTableScrollEl}
                className={moduleTableScrollContainerClass(hasHorizontalOverflow, 'flex-1 bg-white')}
              >
                <table className={MODULE_TABLE_LAYOUT_CLASS} style={{ minWidth: REQUEST_TABLE_MIN_WIDTH }}>
                  <colgroup>
                    <col style={{ width: REQUEST_TABLE_STICKY_COL.checkboxWidth }} />
                    <col style={{ width: REQUEST_TABLE_STICKY_COL.packWidth }} />
                    <col style={{ minWidth: REQUEST_SUMMARY_COL_WIDTH }} />
                    <col style={{ width: REQUEST_SCROLL_COL_MIN }} />
                    <col style={{ width: REQUEST_SCROLL_COL_MIN }} />
                    <col style={{ width: REQUEST_REQUESTER_COL_WIDTH }} />
                    <col style={{ width: REQUEST_STATUS_ACTIONS_WIDTH }} />
                  </colgroup>
                  <thead className="sticky top-0 z-[30] bg-surface-primary">
                    <tr>
                      <ModuleTableCheckboxColumnCell as="th" className="z-[34] bg-surface-primary text-left">
                        <Checkbox className="size-4 rounded-[4px]" />
                      </ModuleTableCheckboxColumnCell>
                      <th
                        className={`relative sticky top-0 z-[35] overflow-hidden border-b border-border-default bg-surface-primary py-3 text-left align-middle ${MODULE_TABLE_FIRST_STICKY_COL_PADDING_CLASS} pr-2 ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                        style={{
                          left: REQUEST_TABLE_STICKY_COL.packLeft,
                          width: REQUEST_TABLE_STICKY_COL.packWidth,
                          minWidth: REQUEST_TABLE_STICKY_COL.packWidth,
                          maxWidth: REQUEST_TABLE_STICKY_COL.packWidth,
                        }}
                      >
                        {showLeftStickyEdge ? (
                          <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                        ) : null}
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-y-0 left-0 z-[0] h-full w-[calc(100%+3px)] bg-surface-primary"
                        />
                        <div className="relative z-[1] grid min-w-0" style={REQUEST_TABLE_LEFT_PACK_GRID_STYLE}>
                          <button type="button" onClick={() => handleSort('id')} className="group flex min-w-0 items-center gap-1 text-sm font-medium text-text-secondary hover:text-brand-blue">
                            Request
                            <ReorderIcon isActive={sortColumn === 'id'} />
                          </button>
                          <button type="button" onClick={() => handleSort('caseId')} className="group flex min-w-0 items-center gap-1 px-2 text-sm font-medium text-text-secondary hover:text-brand-blue">
                            Case
                            <ReorderIcon isActive={sortColumn === 'caseId'} />
                          </button>
                        </div>
                      </th>
                      <th className={`sticky top-0 border-b border-border-default bg-surface-primary px-2 py-3 text-left align-middle ${REQUEST_SUMMARY_COL_CLASS}`}>
                        <button type="button" onClick={() => handleSort('title')} className="group flex items-center gap-1 hover:text-brand-blue">
                          <SummaryTableColumnHeader className="text-sm font-medium text-text-secondary" />
                          <ReorderIcon isActive={sortColumn === 'title'} />
                        </button>
                      </th>
                      {(
                        [
                          ['priority', 'Priority', REQUEST_SCROLL_COL_MIN],
                          ['received', 'Received', REQUEST_SCROLL_COL_MIN],
                          ['requester', 'Requester', REQUEST_REQUESTER_COL_WIDTH],
                        ] as const
                      ).map(([column, label, colWidth]) => (
                        <th
                          key={column}
                          className="sticky top-0 border-b border-border-default bg-surface-primary px-2 py-3 text-left align-middle"
                          style={{ minWidth: colWidth, width: colWidth }}
                        >
                          <button type="button" onClick={() => handleSort(column)} className="group flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-brand-blue">
                            {label}
                            <ReorderIcon isActive={sortColumn === column} />
                          </button>
                        </th>
                      ))}
                      <th
                        className={`relative sticky top-0 right-0 z-[34] border-b border-border-default bg-surface-primary px-3 py-3 text-left align-middle ${
                          showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.12)]' : ''
                        }`}
                        style={{
                          width: REQUEST_STATUS_ACTIONS_WIDTH,
                          minWidth: REQUEST_STATUS_ACTIONS_WIDTH,
                          maxWidth: REQUEST_STATUS_ACTIONS_WIDTH,
                        }}
                      >
                        {showRightStickyEdge ? (
                          <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/80" />
                        ) : null}
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-y-0 left-0 z-[0] h-full w-[calc(100%+3px)] bg-surface-primary"
                        />
                        <button type="button" onClick={() => handleSort('status')} className="group relative z-[1] flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-brand-blue">
                          Status
                          <ReorderIcon isActive={sortColumn === 'status'} />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRequests.map((request) => {
                      const stickyRowSurface =
                        selectedRequest?.id === request.id
                          ? 'bg-surface-selected-alt group-hover:bg-surface-selected-alt'
                          : 'bg-white group-hover:bg-surface-hover';

                      return (
                        <tr
                          key={request.id}
                          data-keep-sidepanel="row"
                          onClick={() => selectRequest(request)}
                          className="group cursor-pointer transition-colors"
                        >
                          <ModuleTableCheckboxColumnCell
                            as="td"
                            className={`z-[14] ${TABLE_CELL_ALIGN_CLASS}`}
                            surfaceClassName={stickyRowSurface}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Checkbox className="size-4 rounded-[4px]" />
                          </ModuleTableCheckboxColumnCell>
                          <td
                            className={`relative sticky z-[15] overflow-hidden border-b border-border-default py-3 ${TABLE_CELL_ALIGN_CLASS} ${MODULE_TABLE_FIRST_STICKY_COL_PADDING_CLASS} pr-2 ${stickyRowSurface} ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                            style={{
                              left: REQUEST_TABLE_STICKY_COL.packLeft,
                              width: REQUEST_TABLE_STICKY_COL.packWidth,
                              minWidth: REQUEST_TABLE_STICKY_COL.packWidth,
                              maxWidth: REQUEST_TABLE_STICKY_COL.packWidth,
                            }}
                          >
                            {showLeftStickyEdge ? (
                              <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                            ) : null}
                            <span
                              aria-hidden
                              className={`pointer-events-none absolute inset-y-0 left-0 z-[0] h-full w-[calc(100%+3px)] ${stickyRowSurface}`}
                            />
                            <div className="relative z-[1] grid min-w-0" style={REQUEST_TABLE_LEFT_PACK_GRID_STYLE}>
                              <div className="min-w-0 pr-1">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    selectRequest(request);
                                  }}
                                  className={TABLE_LINK_TRUNCATE_CLASS}
                                  title={request.id}
                                >
                                  {request.id}
                                </button>
                                <LozengeTag
                                  label={request.category}
                                  type={requestCategoryType(request.category)}
                                  subtle
                                  size="compact"
                                  className="mt-1.5"
                                />
                              </div>
                              <div className="flex min-w-0 items-center px-2">
                                <div className="min-w-0">
                                  {request.caseId ? (
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        navigate(`/cases/${request.caseId}`);
                                      }}
                                      className={`block whitespace-nowrap ${TABLE_LINK_CLASS}`}
                                      title={request.caseId}
                                    >
                                      {request.caseId}
                                    </button>
                                  ) : (
                                    <span className={TABLE_SUBTEXT_CLASS}>—</span>
                                  )}
                                  <span
                                    className={`mt-0.5 block truncate ${TABLE_SUBTEXT_CLASS}`}
                                    title={request.primaryPartyName}
                                  >
                                    {request.primaryPartyName ?? '—'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className={`border-b border-border-default px-2 py-3 ${TABLE_CELL_ALIGN_CLASS} ${stickyRowSurface} ${REQUEST_SUMMARY_COL_CLASS}`}>
                            <TwoLineSummaryCell
                              title={request.title}
                              summary={`${request.subtype ?? request.category} · ${request.channel ?? request.source}`}
                              titleMaxLines={2}
                              className="max-w-none"
                            />
                          </td>
                          <td
                            className={`border-b border-border-default px-2 py-3 ${TABLE_CELL_ALIGN_CLASS} ${stickyRowSurface}`}
                            style={{ minWidth: REQUEST_SCROLL_COL_MIN, width: REQUEST_SCROLL_COL_MIN }}
                          >
                            <PriorityChip priority={request.priority} />
                          </td>
                          <td
                            className={`border-b border-border-default px-2 py-3 whitespace-nowrap ${TABLE_CELL_ALIGN_CLASS} ${stickyRowSurface} ${TABLE_TEXT_CLASS}`}
                            style={{ minWidth: REQUEST_SCROLL_COL_MIN, width: REQUEST_SCROLL_COL_MIN }}
                          >
                            {request.received}
                          </td>
                          <td
                            className={`border-b border-border-default px-2 py-3 ${TABLE_CELL_ALIGN_CLASS} ${stickyRowSurface}`}
                            style={{ minWidth: REQUEST_REQUESTER_COL_WIDTH, width: REQUEST_REQUESTER_COL_WIDTH }}
                          >
                            <span className="flex items-center gap-2">
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-selected text-[10px] font-semibold text-brand-blue">
                                {requestInitials(request)}
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate text-[13px] font-semibold text-text-primary">{request.requester}</span>
                                <span className={`block truncate ${TABLE_SUBTEXT_CLASS}`}>{request.requesterRole ?? 'Requester'}</span>
                              </span>
                            </span>
                          </td>
                          <td
                            className={`relative sticky right-0 z-[14] border-b border-border-default px-3 py-3 ${TABLE_CELL_ALIGN_CLASS} ${stickyRowSurface} ${
                              showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.12)]' : ''
                            }`}
                            style={{
                              width: REQUEST_STATUS_ACTIONS_WIDTH,
                              minWidth: REQUEST_STATUS_ACTIONS_WIDTH,
                              maxWidth: REQUEST_STATUS_ACTIONS_WIDTH,
                            }}
                            onClick={(event) => event.stopPropagation()}
                          >
                            {showRightStickyEdge ? (
                              <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/80" />
                            ) : null}
                            <span
                              aria-hidden
                              className={`pointer-events-none absolute inset-y-0 left-0 z-[0] h-full w-[calc(100%+3px)] ${stickyRowSurface}`}
                            />
                            <div className="relative z-[1] flex items-center">
                              <LozengeTag label={request.status} type={requestStatusType(request.status)} subtle />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <ModuleTablePaginationFooter total={sortedRequests.length} />
            </div>
          )}
        </div>

        {selectedRequest && panelContexts.length > 0 && (
          <WorkspaceObjectSidePanel
            contexts={panelContexts}
            activeContextId={activePanelContextId || requestContextId}
            onChangeContext={handleRequestPanelContextChange}
            onClearContext={clearRequestPanelContext}
            onClose={closeRequestPanel}
            panelWidth={panelWidth}
            onPanelWidthChange={setPanelWidth}
            isResizing={isResizing}
            onResizeStart={() => setIsResizing(true)}
            assistantContent={<WorkspaceAssistantPanel contextId={`request:${selectedRequest.id}`} />}
          >
            {activePanelContextId === documentContextId && evidenceDocument ? (
              <DynamicDocumentSidePanel
                embedded
                open
                onOpenChange={(open) => {
                  if (!open && requestContextId) {
                    setActivePanelContextId(requestContextId);
                  }
                }}
                document={evidenceDocument}
                activeInsightId={activeEvidenceId}
                onInsightChange={setActiveEvidenceId}
                panelWidth={panelWidth}
                isResizing={false}
                onResizeStart={() => undefined}
                onDocumentAction={handleDocumentWorkflow}
              />
            ) : (
              <RequestDetailBody
                evidenceDocument={evidenceDocument}
                onOpenEvidence={openEvidenceDocument}
                request={selectedRequest}
                linkedTasks={selectedRequestTasks}
                linkedRequirements={selectedRequestRequirements}
                onNavigate={navigate}
                onPanelAction={(action) => handleRequestPanelAction(selectedRequest.id, action)}
                onNavigateToPath={navigate}
              />
            )}
          </WorkspaceObjectSidePanel>
        )}
      </div>
      <SmartRequestModal open={smartRequestOpen} onOpenChange={setSmartRequestOpen} />
      <CreateRequestModal
        open={createRequestOpen}
        onOpenChange={setCreateRequestOpen}
        dataSource={dataSource}
        onCreated={({ datasetId, requestId }) => {
          const nextDataSource = { ...dataSource, activeDatasetId: datasetId };
          const createdRequest = listRequests(filterDatasetBySettings(getSystemDataset(datasetId), nextDataSource)).find((request) => request.id === requestId);
          updateDataSource({ activeDatasetId: datasetId });
          setActiveTab('all');
          setSearchQuery('');
          setSortColumn(null);
          setSortDirection('asc');
          if (createdRequest) setSelectedRequest(createdRequest);
          navigate(`/requests#request=${encodeURIComponent(requestId)}`);
        }}
      />
    </div>
  );
}

function RequestCard({ onSelect, request, selected }: { onSelect: () => void; request: ServiceRequest; selected: boolean }) {
  return (
    <button data-keep-sidepanel="card" onClick={onSelect} className={`rounded-lg border p-4 text-left transition-colors ${selected ? 'border-brand-blue bg-surface-selected-alt' : 'border-border-default bg-white hover:border-brand-blue-border hover:shadow-md'}`}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">{request.title}</p>
          <p className="mt-1 text-xs text-text-muted">{request.id} · {request.category}</p>
        </div>
        <LozengeTag label={request.status} type={requestStatusType(request.status)} subtle />
      </div>
      <p className="line-clamp-2 text-sm text-text-secondary">{request.aiSummary}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
        <span>{request.requester}</span>
        <span>{request.due}</span>
      </div>
    </button>
  );
}

function RequestDetailBody({
  evidenceDocument,
  onOpenEvidence,
  onNavigate,
  onNavigateToPath,
  onPanelAction,
  request,
  linkedTasks,
  linkedRequirements,
}: {
  evidenceDocument: DynamicDocumentData | null;
  linkedTasks: Task[];
  linkedRequirements: CaseRequirement[];
  onOpenEvidence: () => void;
  onNavigate: (path: string) => void;
  onNavigateToPath: (path: string) => void;
  onPanelAction: (action: PanelAction) => void;
  request: ServiceRequest;
}) {
  const [activeTab, setActiveTab] = useState<RequestPanelTab>('overview');
  const panelActions = useMemo(() => {
    const ctx = buildRequestActionContext(request, linkedTasks, evidenceDocument);
    return resolveRequestPanelActions(ctx);
  }, [evidenceDocument, linkedTasks, request]);
  const allActions = [...(request.aiActions ?? []), ...(request.humanActions ?? [])]
    .sort((a, b) => String(b.ts).localeCompare(String(a.ts)));
  const stats = [
    { label: 'Case created', value: request.linkedCase?.id ?? request.caseId ?? 'N/A', href: request.caseId ? `/cases/${request.caseId}` : undefined },
    { label: 'Current stage', value: request.linkedCase?.stage ?? 'N/A' },
    { label: 'Requirements', value: `${request.linkedReqs?.length ?? linkedRequirements.length} generated` },
    { label: 'Tasks created', value: `${request.linkedTasks?.length ?? linkedTasks.length} created` },
    { label: 'AI crew actions', value: `${request.aiActions?.length ?? 0} steps` },
    { label: 'Human actions', value: `${request.humanActions?.length ?? 0} recorded` },
  ];

  return (
    <>
      <div className="shrink-0 bg-white px-6">
        <div className="py-4">
          <div className="mb-2 flex w-full flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25px]">
          <LozengeTag label={request.category} type={requestCategoryType(request.category)} subtle />
          <PriorityChip priority={request.priority} />
          <LozengeTag label={request.status} type={requestStatusType(request.status)} subtle />
          <span className="ml-auto shrink-0 text-text-muted">#{request.id}</span>
        </div>
        <h2 className="text-[18px] font-semibold leading-tight text-text-heading">{request.title}</h2>
        <dl className="mt-4 grid grid-cols-3 overflow-hidden rounded-lg border border-border-soft bg-[#fbfcfd] text-[12px]">
          <MetaItem icon={<ClipboardCheck className="size-3.5" />} label="Sub-type" value={request.subtype ?? request.category} />
          <MetaItem icon={<CalendarDays className="size-3.5" />} label="Received" value={`${request.received}${request.receivedTime ? ` · ${request.receivedTime}` : ''}`} />
          <MetaItem icon={<Globe className="size-3.5" />} label="Channel" value={request.channel ?? request.source} />
          <MetaItem icon={<UserRound className="size-3.5" />} label="Assignee" value={request.assignedTo} />
          <MetaItem icon={<UserRound className="size-3.5" />} label="Requester" value={request.requester} />
          <MetaItem icon={<ShieldCheck className="size-3.5" />} label="Role" value={request.requesterRole ?? 'Requester'} />
        </dl>
        </div>
        <ModuleTabsBar
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'form', label: 'Submitted form' },
            { id: 'activity', label: 'Activity log' },
            { id: 'links', label: 'Linked records' },
          ]}
          activeId={activeTab}
          onChange={setActiveTab}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-surface-primary">
        <div className="app-scrollbar h-full overflow-y-auto px-5 py-4">
          {activeTab === 'overview' ? (
            <div className="space-y-3">
              {request.systemSteps?.length ? (
                <SystemInitiatedStepsSection request={request} onNavigate={onNavigate} />
              ) : null}
              <SidePanelSummaryBox>
                <p className="text-[12px] leading-relaxed text-text-primary">{request.summary ?? request.aiSummary}</p>
              </SidePanelSummaryBox>
              <div className="grid gap-2 sm:grid-cols-2">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-border-soft bg-white p-3">
                    <p className="text-[10px] uppercase tracking-[0.3px] text-text-muted">{stat.label}</p>
                    {stat.href ? (
                      <button type="button" onClick={() => onNavigate(stat.href!)} className="mt-1 text-[13px] font-semibold text-brand-blue underline underline-offset-2">{stat.value}</button>
                    ) : (
                      <p className="mt-1 text-[13px] font-semibold text-text-primary">{stat.value}</p>
                    )}
                  </div>
                ))}
              </div>
              <TimelineSection title="Recent activity" actions={allActions.slice(0, 3)} />
            </div>
          ) : null}
          {activeTab === 'form' && request.form ? <RequestFormTab request={request} /> : null}
          {activeTab === 'activity' ? (
            <div className="space-y-3">
              <TimelineSection title="AI crew actions" subtitle={`${request.aiActions?.length ?? 0} automated steps`} actions={request.aiActions ?? []} />
              <TimelineSection title="Human actions" subtitle={`${request.humanActions?.length ?? 0} actions`} actions={request.humanActions ?? []} />
            </div>
          ) : null}
          {activeTab === 'links' ? (
            <div className="space-y-3">
              <LinkedRequestCaseSection request={request} onNavigate={onNavigate} />
              <LinkedRequestTasksSection request={request} linkedTasks={linkedTasks} onNavigate={onNavigate} />
              <LinkedRequestRequirementsSection linkedRequirements={linkedRequirements} caseId={request.caseId} onNavigate={onNavigate} />
              {evidenceDocument ? (
                <EvidenceSnapshotCard document={evidenceDocument} onOpen={onOpenEvidence} />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <ObjectPanelFooter
        panel={panelActions}
        onNavigate={onNavigateToPath}
        onOpenDocument={() => onOpenEvidence()}
        onAction={onPanelAction}
      />
    </>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0 border-b border-r border-border-soft px-3 py-2 [&:nth-child(3n)]:border-r-0 [&:nth-child(n+4)]:border-b-0">
      <dt className="flex items-center gap-1.5 text-[11px] text-text-muted">{icon}{label}</dt>
      <dd className="mt-0.5 truncate font-semibold text-text-primary">{value}</dd>
    </div>
  );
}

function TimelineSection({ actions, subtitle, title }: { actions: NonNullable<ServiceRequest['aiActions']>; subtitle?: string; title: string }) {
  return (
    <section className="overflow-hidden rounded-lg border border-border-soft bg-white">
      <div className="border-b border-border-soft px-4 py-3">
        <p className="text-[13px] font-semibold text-text-primary">{title}</p>
        {subtitle ? <p className="mt-0.5 text-[11px] text-text-secondary">{subtitle}</p> : null}
      </div>
      <div className="space-y-3 p-4">
        {actions.map((action) => (
          <div key={`${action.ts}-${action.action}`} className="flex gap-3">
            <span className={`mt-1.5 size-2 shrink-0 rounded-full ${timelineDotClass(action.dotCls)}`} />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-text-primary">{action.action}</p>
              <p className="mt-0.5 text-[11px] text-text-muted">{action.ts} · {action.actor}</p>
              <p className="mt-2 rounded-md bg-surface-muted px-2.5 py-2 text-[11px] leading-relaxed text-text-secondary">{action.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RequestFormTab({ request }: { request: ServiceRequest }) {
  if (!request.form) return null;
  return (
    <section className="overflow-hidden rounded-lg border border-border-soft bg-white">
      <div className="border-b border-border-soft px-4 py-3">
        <p className="text-[13px] font-semibold text-text-primary">{request.form.formType}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-surface-selected px-2 py-0.5 text-[10px] font-semibold text-brand-blue">{request.form.channel}</span>
          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-text-secondary">{request.form.submitted}</span>
        </div>
      </div>
      <div className="grid gap-2 p-4">
        {request.form.fields.map((field) => (
          <div key={field.label} className="rounded-md border border-border-soft bg-[#fbfcfd] px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">{field.label}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-text-primary">{field.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function LinkedRequestCaseSection({ onNavigate, request }: { onNavigate: (path: string) => void; request: ServiceRequest }) {
  if (!request.linkedCase) return null;
  return (
    <section className="overflow-hidden rounded-lg border border-border-soft bg-white">
      <button
        type="button"
        onClick={() => onNavigate(`/cases/${request.linkedCase?.id}`)}
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-primary"
      >
        <span className="min-w-0">
          <span className="block text-[12px] font-semibold text-brand-blue">{request.linkedCase.id}</span>
          <span className="mt-0.5 block text-[11px] text-text-secondary">{request.linkedCase.label} · Stage: {request.linkedCase.stage}</span>
        </span>
        <LozengeTag label={request.linkedCase.status} type={requestStatusType(request.status)} subtle />
      </button>
    </section>
  );
}

function LinkedRequestTasksSection({
  request,
  linkedTasks,
  onNavigate,
}: {
  request: ServiceRequest;
  linkedTasks: Task[];
  onNavigate: (path: string) => void;
}) {
  const accomplishment = pickAccomplishmentTask(request, linkedTasks);
  if (!accomplishment) return null;

  const linkedCount = tasksForRequest(request, linkedTasks).length;
  const taskPath = accomplishment.caseId
    ? `/cases/${accomplishment.caseId}#tab=tasks&task=${encodeURIComponent(accomplishment.id)}`
    : `/tasks#task=${encodeURIComponent(accomplishment.id)}`;

  return (
    <section className="mt-3 overflow-hidden rounded-lg border border-border-soft bg-white">
      <div className="border-b border-border-soft px-4 py-3">
        <p className="text-[13px] font-semibold text-text-primary">Task to complete</p>
        <p className="mt-0.5 text-[11px] text-text-secondary">
          {linkedCount > 1
            ? `Primary linked task · ${linkedCount - 1} more in Tasks`
            : 'Linked service task for this request.'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onNavigate(taskPath)}
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-primary"
      >
        <span className="min-w-0">
          <span className="block text-[12px] font-semibold text-text-primary">{accomplishment.taskType}</span>
          <span className="mt-0.5 block text-[11px] text-text-secondary">
            {accomplishment.id} · {accomplishment.status} · {accomplishment.assignedTo}
          </span>
        </span>
        <PriorityChip priority={accomplishment.priority} className="shrink-0" />
      </button>
    </section>
  );
}

function LinkedRequestRequirementsSection({
  caseId,
  linkedRequirements,
  onNavigate,
}: {
  caseId?: string;
  linkedRequirements: CaseRequirement[];
  onNavigate: (path: string) => void;
}) {
  if (!linkedRequirements.length) return null;
  return (
    <section className="overflow-hidden rounded-lg border border-border-soft bg-white">
      <div className="border-b border-border-soft px-4 py-3">
        <p className="text-[13px] font-semibold text-text-primary">Requirements</p>
        <p className="mt-0.5 text-[11px] text-text-secondary">Requirements generated from this request.</p>
      </div>
      <div className="divide-y divide-border-soft">
        {linkedRequirements.map((requirement) => (
          <button
            key={requirement.id}
            type="button"
            onClick={() => caseId && onNavigate(`/cases/${caseId}#tab=requirements&req=${encodeURIComponent(String(requirement.datasetRequirementId ?? requirement.id))}`)}
            className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-primary"
          >
            <span className="min-w-0">
              <span className="block text-[12px] font-semibold text-text-primary">{requirement.name}</span>
              <span className="mt-0.5 block text-[11px] text-text-secondary">{requirement.category} · {requirement.status}</span>
            </span>
            <ExternalLink className="size-3.5 shrink-0 text-text-muted" />
          </button>
        ))}
      </div>
    </section>
  );
}

function EvidenceSnapshotCard({
  document,
  onOpen,
}: {
  document: DynamicDocumentData;
  onOpen: () => void;
}) {
  const firstPage = document.pages[0];
  const previewSrc = firstPage?.image?.trim() ?? '';
  const topInsights = document.evidence.slice(0, 3);

  return (
    <section className="mt-3 overflow-hidden rounded-lg border border-border-soft bg-white">
      <button
        type="button"
        onClick={onOpen}
        className="group flex w-full items-center justify-between gap-3 border-b border-border-soft px-4 py-3 text-left transition-colors hover:bg-surface-primary"
      >
        <span className="min-w-0">
          <span className="block text-[13px] font-semibold text-text-primary group-hover:text-brand-blue">
            Evidence preview
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-text-secondary">
            Open full document review for {document.documentTitle}
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-default bg-white px-2.5 py-1 text-[11px] font-semibold text-brand-blue shadow-sm">
          Open document <ExternalLink className="size-3" />
        </span>
      </button>

      <div className="grid gap-0 md:grid-cols-[minmax(0,0.95fr)_minmax(240px,1fr)]">
        <button
          type="button"
          onClick={onOpen}
          className="group relative flex h-[420px] items-center justify-center overflow-hidden bg-[#dfe3e8] p-5 text-left"
          aria-label={`Open ${document.documentTitle}`}
        >
          {previewSrc ? (
            <img
              src={previewSrc}
              alt=""
              className="max-h-full max-w-full rounded-sm bg-white object-contain shadow-[0_1px_5px_rgba(27,28,30,0.22)] transition-transform group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex max-w-xs flex-col items-center gap-2 px-6 text-center">
              <FileText className="size-10 text-text-muted" aria-hidden />
              <p className="text-sm font-semibold text-text-primary">Preview unavailable</p>
              <p className="text-xs text-text-secondary">Open the document to view metadata and linked evidence.</p>
            </div>
          )}
          <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-text-secondary shadow-sm">
            Snapshot only
          </span>
        </button>

        <div className="flex min-h-0 flex-col gap-3 border-t border-border-soft p-4 md:border-l md:border-t-0">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[13px] font-semibold text-text-primary">{document.summary.label}</p>
              <span className="rounded-full bg-[#fff4e6] px-2 py-0.5 text-[10px] font-semibold text-[#8a5a00]">
                {document.summary.status}
              </span>
            </div>
            <p className="mt-1.5 line-clamp-3 text-[12px] leading-relaxed text-text-secondary">
              {document.summary.text}
            </p>
          </div>

          <div className="rounded-md border border-border-soft bg-[#fbfcfd] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">Context</p>
            <p className="mt-1 text-[12px] font-semibold text-text-primary">
              {document.summary.contextTitle ?? 'Why this document matters'}
            </p>
            <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-text-secondary">
              {document.summary.contextText}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">Insights</p>
            <div className="mt-1.5 space-y-1.5">
              {topInsights.map((insight) => (
                <button
                  key={insight.id}
                  type="button"
                  onClick={onOpen}
                  className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface-muted"
                >
                  <span className={`mt-1 size-1.5 shrink-0 rounded-full ${insight.tone === 'danger' ? 'bg-brand-red' : 'bg-[#f5a200]'}`} />
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-semibold text-text-primary">{insight.title}</span>
                    <span className="block line-clamp-1 text-[11px] text-text-secondary">{insight.impact}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RequestSummarySection({
  onNavigate,
  request,
}: {
  onNavigate: (path: string) => void;
  request: ServiceRequest;
}) {
  const [expanded, setExpanded] = useState(true);
  const sectionId = `request-summary-${request.id}`;

  return (
    <section className="mt-3 overflow-hidden rounded-lg border border-border-soft bg-white">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-controls={sectionId}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-primary"
      >
        <span className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-[13px] font-semibold text-text-primary">Summary</span>
          <span className="rounded-full bg-[#fff4e6] px-2 py-0.5 text-[10px] font-semibold text-[#8a5a00]">
            {request.status}
          </span>
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {expanded ? (
        <div id={sectionId} className="border-t border-border-soft px-4 pb-4 pt-3">
          <p className="text-[12px] leading-relaxed text-text-secondary">{request.aiSummary}</p>
          <div className="mt-3 rounded-[6px] border border-border-soft bg-[#fbfcfd] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">Next action</p>
            <p className="mt-1 text-[13px] font-semibold text-text-primary">{request.nextAction}</p>
            <div className="mt-3 space-y-1">
              {request.linkedObjects.map((item) => (
                <button
                  key={`${item.kind}-${item.id}`}
                  type="button"
                  data-keep-sidepanel={item.href ? 'link' : 'context'}
                  onClick={() => item.href && onNavigate(item.href)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-surface-muted"
                >
                  <span>
                    <span className="block text-[10px] uppercase tracking-[0.3px] text-text-muted">{item.kind}</span>
                    <span className="block text-[12px] font-semibold text-text-primary">{item.label}</span>
                  </span>
                  {item.href ? <ExternalLink className="size-3.5 text-text-muted" /> : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ObjectLink({
  href,
  label,
  onNavigate,
}: {
  href?: string;
  label: string;
  onNavigate: (path: string) => void;
}) {
  if (!href) return <span>{label}</span>;
  return (
    <button
      type="button"
      data-keep-sidepanel="link"
      onClick={() => onNavigate(href)}
      className="inline-block max-w-full truncate p-0 text-left align-baseline [font:inherit] text-brand-blue underline underline-offset-2 hover:text-brand-blue-hover"
    >
      {label}
    </button>
  );
}

const SOURCE_CHANNEL_META: Record<RequestSourceChannel, { label: string; icon: LucideIcon }> = {
  client_portal: { label: 'Client portal', icon: Globe },
  email: { label: 'Email', icon: Mail },
  phone: { label: 'Phone', icon: Phone },
  'Claimant portal': { label: 'Claimant portal', icon: Globe },
  'Broker portal': { label: 'Broker portal', icon: Globe },
  'SBLI broker portal': { label: 'SBLI broker portal', icon: Globe },
  'SBLI.com': { label: 'SBLI.com', icon: Globe },
  Mail: { label: 'Mail', icon: Mail },
  Fax: { label: 'Fax', icon: FileText },
  'Agent portal': { label: 'Agent portal', icon: Globe },
};

const STEP_KIND_META: Record<RequestSystemStepKind, { icon: LucideIcon; label: string }> = {
  review_required: { icon: AlertCircle, label: 'Review required' },
  create_task: { icon: ClipboardCheck, label: 'Task' },
  create_case: { icon: Briefcase, label: 'Case' },
  link_policy: { icon: ShieldCheck, label: 'Policy match' },
  follow_up_client: { icon: MailQuestion, label: 'Follow-up' },
  await_acceptance: { icon: Hourglass, label: 'Awaiting acceptance' },
  start_claim: { icon: FileText, label: 'Start claim' },
  auto_reject: { icon: XCircle, label: 'Auto-reject' },
};

const STEP_STATUS_META: Record<
  RequestSystemStepStatus,
  { label: string; icon: LucideIcon; iconClass: string; pillClass: string }
> = {
  completed: {
    label: 'Done',
    icon: CheckCircle2,
    iconClass: 'text-[#1f8a4d]',
    pillClass: 'bg-[#e7f6ec] text-[#1f8a4d]',
  },
  in_progress: {
    label: 'In progress',
    icon: Loader2,
    iconClass: 'text-brand-blue',
    pillClass: 'bg-[#e7eefb] text-brand-blue',
  },
  awaiting_review: {
    label: 'Awaiting review',
    icon: AlertCircle,
    iconClass: 'text-[#8a5a00]',
    pillClass: 'bg-[#fff4e6] text-[#8a5a00]',
  },
  queued: {
    label: 'Queued',
    icon: Clock,
    iconClass: 'text-text-muted',
    pillClass: 'bg-surface-muted text-text-secondary',
  },
  blocked: {
    label: 'Blocked',
    icon: XCircle,
    iconClass: 'text-brand-red',
    pillClass: 'bg-[#fdecec] text-brand-red',
  },
};

function SystemInitiatedStepsSection({
  onNavigate,
  request,
}: {
  onNavigate: (path: string) => void;
  request: ServiceRequest;
}) {
  const [expanded, setExpanded] = useState(false);
  const channel = SOURCE_CHANNEL_META[request.sourceChannel];
  const ChannelIcon = channel.icon;
  const completed = request.systemSteps.filter((step) => step.status === 'completed').length;
  const stepsTotal = request.systemSteps.length;
  const needsReview = request.systemSteps.some((step) => step.status === 'awaiting_review');
  const sectionId = `system-steps-${request.id}`;

  return (
    <section className="overflow-hidden rounded-lg border border-border-soft bg-white">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-controls={sectionId}
        className="flex w-full items-center gap-3 border-b border-transparent bg-[#f5f7fb] px-4 py-3 text-left transition-colors hover:bg-[#eef2f8]"
      >
        <ChevronDown
          className={`size-4 shrink-0 text-text-secondary transition-transform ${expanded ? 'rotate-0' : '-rotate-90'}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[13px] font-semibold text-text-primary">System initiated steps</p>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-text-secondary ring-1 ring-border-soft">
              {completed}/{stepsTotal} done
            </span>
            {needsReview ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#fff4e6] px-2 py-0.5 text-[10px] font-semibold text-[#8a5a00]">
                <AlertCircle className="size-3" />
                Review needed
              </span>
            ) : null}
          </div>
          {!expanded ? (
            <p className="mt-1 truncate text-[11px] text-text-secondary">
              Automated actions queued when the request was received.
            </p>
          ) : (
            <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
              Automated actions queued by Amplify when the request was received.
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-border-soft bg-white px-2.5 py-1 text-[11px] font-semibold text-text-primary">
          <ChannelIcon className="size-3.5 text-brand-blue" />
          <span className="leading-none">Received via {channel.label}</span>
        </div>
      </button>

      {expanded ? (
        <div id={sectionId}>
          {request.sourceDetail ? (
            <div className="flex items-center gap-2 border-b border-border-soft bg-[#fbfcfd] px-4 py-2 text-[11px] text-text-secondary">
              <Inbox className="size-3.5 text-text-muted" />
              <span className="truncate">{request.sourceDetail}</span>
              <span className="ml-auto text-text-muted">{request.received}</span>
            </div>
          ) : null}

          <ol className="divide-y divide-border-soft">
            {request.systemSteps.map((step, index) => (
              <SystemStepRow
                key={step.id}
                step={step}
                index={index + 1}
                onNavigate={onNavigate}
              />
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}

function SystemStepRow({
  index,
  onNavigate,
  step,
}: {
  index: number;
  onNavigate: (path: string) => void;
  step: RequestSystemStep;
}) {
  const kindMeta = STEP_KIND_META[step.kind];
  const statusMeta = STEP_STATUS_META[step.status];
  const StatusIcon = statusMeta.icon;
  const KindIcon = kindMeta.icon;
  const isLoading = step.status === 'in_progress';

  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <div className="relative flex size-7 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-border-soft">
        {step.status === 'completed' ? (
          <Check className="size-3.5 text-[#1f8a4d]" />
        ) : (
          <KindIcon className="size-3.5 text-brand-blue" />
        )}
        <span className="absolute -bottom-1 -right-1 inline-flex size-4 items-center justify-center rounded-full bg-white text-[9px] font-semibold text-text-muted ring-1 ring-border-soft">
          {index}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[12.5px] font-semibold leading-tight text-text-primary">{step.title}</p>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusMeta.pillClass}`}
          >
            <StatusIcon className={`size-3 ${statusMeta.iconClass} ${isLoading ? 'animate-spin' : ''}`} />
            {statusMeta.label}
          </span>
        </div>
        {step.description ? (
          <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">{step.description}</p>
        ) : null}
        {step.linkedTo ? (
          step.linkedTo.href ? (
            <button
              type="button"
              data-keep-sidepanel="link"
              onClick={() => onNavigate(step.linkedTo!.href!)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border-soft bg-[#fbfcfd] px-2 py-1 text-[11px] font-semibold text-text-primary hover:border-brand-blue-border hover:text-brand-blue"
            >
              {step.linkedTo.hint ? (
                <span className="text-[10px] uppercase tracking-[0.3px] text-text-muted">{step.linkedTo.hint}</span>
              ) : null}
              <span>{step.linkedTo.label}</span>
              <ExternalLink className="size-3 text-text-muted" />
            </button>
          ) : (
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border-soft bg-[#fbfcfd] px-2 py-1 text-[11px] font-semibold text-text-primary">
              {step.linkedTo.hint ? (
                <span className="text-[10px] uppercase tracking-[0.3px] text-text-muted">{step.linkedTo.hint}</span>
              ) : null}
              <span>{step.linkedTo.label}</span>
            </span>
          )
        ) : null}
      </div>
    </li>
  );
}
