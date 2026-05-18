import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Upload, LayoutGrid, List, Download, ExternalLink, FileText } from 'lucide-react';
import { useLiveContextOverlay } from '../contexts/LiveContextProvider';
import { AiInsightInline, FilterDropdown, LozengeTag, ModuleTablePaginationFooter, ReorderIcon } from './index';
import { SearchBar } from './ds';
import { ModuleTabsBar } from './ModuleTabsBar';
import { Checkbox } from './ui/checkbox';
import { useTableHorizontalScroll } from '../hooks/useTableHorizontalScroll';
import { moduleTableScrollContainerClass } from '../utils/module-table-scroll';
import { filterDatasetBySettings, getSystemDataset, listDocuments } from '../data/objectRepository';
import { UI_CLASS } from '../constants/design-tokens';
import { getStatusLozengeType } from '../utils/status-display';
import type { CaseDocument, ViewMode, DocSortableColumn, DocTabType, SortDirection, DocumentStatus } from '../types';
import { WorkspaceObjectSidePanel, type WorkspacePanelContext } from './WorkspaceObjectSidePanel';
import { documentPanelContextId, pushWorkspacePanelContext } from '../utils/workspacePanelContextUtils';
import { DynamicDocumentSidePanel, type DynamicDocumentData } from './DynamicDocumentSidePanel';
import { getDocumentEvidence } from '../data/mock-document-evidence';
import { resolveDocumentPreviewUrl } from '../utils/sbli-document-assets';
import { formatDocumentFileInfo, getDocumentFileType } from '../data/documentMetadata';
import { getDefaultSidePanelWidth } from '../utils/sidepanel-width';
import { WorkspaceAssistantPanel } from './WorkspaceAssistantPanel';
import { useDataSourceSettings } from '../contexts/PlatformSettingsContext';
import type { SystemDataset } from '../data/multi-case-dataset';
import { deriveDocumentSummaryTitle, documentSummarySubtitle } from '../utils/summaryText';
import { ModuleTableCheckboxColumnCell } from './ModuleTableCheckboxColumn';
import {
  MODULE_TABLE_CHECKBOX_COL_WIDTH,
  SummaryTableColumnHeader,
  TABLE_CELL_ALIGN_CLASS,
  TABLE_LINK_CLASS,
  TABLE_SUBTEXT_CLASS,
  TABLE_TEXT_CLASS,
  DocumentSourceTag,
  getDocumentSourceLabel,
  TableTruncatedLabel,
  TwoLineSummaryCell,
} from './ModuleCellHelpers';
import { DocumentMiniPreviewThumb } from './DocumentMiniPreviewThumb';

const DOC_TABLE_CHECKBOX_COL_WIDTH = MODULE_TABLE_CHECKBOX_COL_WIDTH;
const DOC_TABLE_NAME_COL_WIDTH = 320;
const DOC_TABLE_STATUS_COL_WIDTH = 120;
const DOC_TABLE_ACTIONS_COL_WIDTH = 80;
const DOC_TABLE_ACTIONS_CELL_CLASS = 'pl-2 pr-5';
/** Extra gap between sticky Document column and Summary. */
const DOC_TABLE_DOCUMENT_COL_CLASS = 'pl-1 pr-4';
const DOC_TABLE_SUMMARY_COL_CLASS = 'pl-5 pr-2';

function docTableRowSurface(selected: boolean) {
  return selected
    ? 'bg-surface-selected-alt group-hover:bg-surface-selected-alt'
    : 'bg-white group-hover:bg-surface-hover';
}

function sortDocuments(docs: CaseDocument[], column: DocSortableColumn | null, direction: SortDirection): CaseDocument[] {
  if (!column) return docs;
  return [...docs].sort((a, b) => {
    const aVal = column === 'caseId' ? (a.caseId ?? '') : String(a[column] ?? '');
    const bVal = column === 'caseId' ? (b.caseId ?? '') : String(b[column] ?? '');
    const cmp = aVal.localeCompare(bVal);
    return direction === 'asc' ? cmp : -cmp;
  });
}

function toDynamicDocumentData(document: CaseDocument, dataset?: SystemDataset): DynamicDocumentData {
  const evidence = getDocumentEvidence(document.id, dataset);
  if (evidence) return evidence;
  return {
    documentId: document.id,
    documentTitle: document.name,
    category: `${document.category} document`,
    status: document.fileAvailable === false ? 'File pending' : document.status,
    fileSize: document.fileSize,
    fileType: document.fileType ?? getDocumentFileType(document.name),
    caseId: document.caseId ?? document.linkedCase,
    caseReference: document.linkedCase,
    claimant: document.claimantName,
    source: getDocumentSourceLabel(document.source),
    linkedRequirement: document.linkedRequirement,
    linkedRequirementHref: document.caseId ? `/cases/${document.caseId}#tab=requirements` : '/documents',
    received: document.uploaded,
    totalPages: 1,
    pages: [
      {
        number: 1,
        image: resolveDocumentPreviewUrl({
          documentId: document.id,
          filename: document.filename,
          fileUrl: document.fileUrl,
          fileAvailable: document.fileAvailable,
        }),
        label: document.name,
      },
    ],
    summary: {
      label: 'Summary',
      status: document.status,
      text: document.fileAvailable === false
        ? (document.placeholderReason ?? 'Document metadata exists, but no file has been provided yet.')
        : document.aiSummary,
    },
    evidence: [],
    scoringContext: document.scoringContext,
    actions: [
      { id: 'download', label: 'Download' },
      { id: 'open', label: 'Open', variant: 'primary' },
    ],
  };
}

export function DocumentModule() {
  const navigate = useNavigate();
  const location = useLocation();
  const dataSource = useDataSourceSettings();
  const activeDataset = useMemo(() => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource), [dataSource]);
  const documents = useMemo(
    () => listDocuments(activeDataset),
    [activeDataset],
  );
  const [selectedDocument, setSelectedDocument] = useState<CaseDocument | null>(documents[0] ?? null);
  const [panelContexts, setPanelContexts] = useState<WorkspacePanelContext[]>([]);
  const [activePanelContextId, setActivePanelContextId] = useState('');
  const docTabs = useMemo<{ id: DocTabType; label: string; count?: number }[]>(
    () => [
      { id: 'all', label: 'All documents', count: documents.length },
      { id: 'medical', label: 'Medical', count: documents.filter(d => d.category === 'Medical' || d.category === 'Rehabilitation' || d.category === 'Pharmacy' || d.category === 'medical').length },
      { id: 'legal', label: 'Legal', count: documents.filter(d => d.category === 'Legal' || d.category === 'identity').length },
      { id: 'financial', label: 'Financial', count: documents.filter(d => d.category === 'Financial' || d.category === 'financial').length },
    ],
    [documents],
  );

  const docOverlay = useMemo(
    () =>
      selectedDocument
        ? {
            id: `documents:open:${selectedDocument.id}`,
            kind: 'documentDetail' as const,
            icon: FileText,
            crumbs: ['Documents', selectedDocument.id],
            label: `Doc ${selectedDocument.id}`,
            href: `/documents#doc=${selectedDocument.id}`,
          }
        : null,
    [selectedDocument],
  );
  useLiveContextOverlay(docOverlay);

  const selectDocument = (doc: CaseDocument) => {
    setSelectedDocument(doc);
    const data = toDynamicDocumentData(doc, activeDataset);
    const context: WorkspacePanelContext = {
      id: documentPanelContextId(data.documentId),
      label: data.documentTitle,
      icon: FileText,
      clearable: true,
    };
    setPanelContexts((current) => pushWorkspacePanelContext(current, context));
    setActivePanelContextId(context.id);
  };

  const closeDocumentPanel = () => {
    setSelectedDocument(null);
    setPanelContexts([]);
    setActivePanelContextId('');
  };

  const handleDocumentPanelContextChange = (contextId: string) => {
    setActivePanelContextId(contextId);
    if (!contextId.startsWith('document:')) return;
    const docId = contextId.slice('document:'.length);
    const found = documents.find((document) => document.id === docId);
    if (found) setSelectedDocument(found);
  };

  const clearDocumentPanelContext = (contextId: string) => {
    let nextContextId: string | undefined;
    setPanelContexts((current) => {
      const index = current.findIndex((context) => context.id === contextId);
      const next = index >= 0 ? current[index + 1] ?? current[index - 1] : undefined;
      nextContextId = next?.id;
      return current.filter((context) => context.id !== contextId);
    });
    if (nextContextId) {
      handleDocumentPanelContextChange(nextContextId);
      return;
    }
    closeDocumentPanel();
  };

  useEffect(() => {
    const hash = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash;
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const docId = params.get('doc');
    if (!docId) return;
    const found = documents.find((d) => d.id === docId);
    if (found) selectDocument(found);
  }, [activeDataset, documents, location.hash]);
  useEffect(() => {
    if (selectedDocument && !documents.some((doc) => doc.id === selectedDocument.id)) {
      setSelectedDocument(documents[0] ?? null);
    }
  }, [documents, selectedDocument]);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<DocSortableColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [activeTab, setActiveTab] = useState<DocTabType>('all');

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');

  const [panelWidth, setPanelWidth] = useState(() => getDefaultSidePanelWidth({ min: 400 }));
  const [isResizing, setIsResizing] = useState(false);
  const [docTableScrollEl, setDocTableScrollEl] = useState<HTMLDivElement | null>(null);
  const { showLeftStickyEdge, showRightStickyEdge, hasHorizontalOverflow } =
    useTableHorizontalScroll(docTableScrollEl);

  const sortedDocuments = sortDocuments(documents, sortColumn, sortDirection);
  const selectedDocumentData = useMemo(() => {
    if (activePanelContextId.startsWith('document:')) {
      const docId = activePanelContextId.slice('document:'.length);
      const doc = documents.find((row) => row.id === docId) ?? selectedDocument;
      return doc ? toDynamicDocumentData(doc, activeDataset) : null;
    }
    return selectedDocument ? toDynamicDocumentData(selectedDocument, activeDataset) : null;
  }, [activeDataset, activePanelContextId, documents, selectedDocument]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      const maxWidth = Math.round(window.innerWidth * 0.75);
      if (newWidth >= 400 && newWidth <= maxWidth) {
        setPanelWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleSort = (column: DocSortableColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <div className={`flex h-full min-h-0 flex-col ${UI_CLASS.workspaceTopLeftRadius} overflow-hidden`}>
      {/* Header */}
      <div className="relative z-10 border-b border-border-default bg-surface-primary px-6 pb-0 pt-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="pl-[14px] text-2xl font-semibold text-text-primary">Documents</h1>
          <button className={`flex items-center justify-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-xs font-bold uppercase leading-none tracking-[0.4px] text-white ${UI_CLASS.primaryActionShadow} transition-colors hover:bg-brand-blue-hover`} style={{ fontVariationSettings: "'wdth' 100" }}>
            <Upload className="h-4 w-4" />
            UPLOAD DOCUMENT
          </button>
        </div>

        <ModuleTabsBar
          tabs={docTabs.map(({ id, label, count }) => ({ id, label, count }))}
          activeId={activeTab}
          onChange={setActiveTab}
        />

        {/* Search + Filters + View Toggle */}
        <div className="flex w-full flex-wrap items-center gap-3 pb-4 pt-4 xl:flex-nowrap">
          <SearchBar
            containerClassName="order-1"
            value={searchQuery}
            onChange={setSearchQuery}
          />

          <div className="order-3 flex w-full flex-wrap items-center gap-3 xl:order-2 xl:w-auto xl:flex-none">
            <FilterDropdown label="Category" options={['All', 'Medical', 'Rehabilitation', 'Pharmacy', 'Legal', 'Financial']} value={categoryFilter} onChange={setCategoryFilter} />
            <FilterDropdown label="Status" options={['All', 'Validated', 'Pending Review', 'Rejected', 'Processing']} value={statusFilter} onChange={setStatusFilter} />
            <FilterDropdown label="Source" options={['All', 'Hospital Feed', 'Physio Portal', 'Pharmacy Check', 'Employer Portal', 'Claimant Upload', 'Specialist Upload']} value={sourceFilter} onChange={setSourceFilter} />
          </div>

          <div className="order-2 ml-auto flex shrink-0 overflow-hidden rounded-md border border-border-default xl:order-3">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 transition-colors ${viewMode === 'card' ? 'bg-brand-blue text-white' : 'bg-white text-text-secondary hover:bg-surface-muted'}`}
              title="Card view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`border-l border-border-default p-2 transition-colors ${viewMode === 'table' ? 'bg-brand-blue text-white' : 'bg-white text-text-secondary hover:bg-surface-muted'}`}
              title="Table view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* List + Side Panel Container */}
      <div className="relative z-0 flex min-h-0 flex-1 overflow-hidden">
        {/* Document List */}
        <div className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col bg-white transition-all">
          {viewMode === 'card' ? (
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-3">
                {sortedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    data-keep-sidepanel="card"
                    onClick={() => selectDocument(doc)}
                    className={`cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md active:scale-[0.99] ${
                      selectedDocument?.id === doc.id ? 'border-brand-blue bg-surface-selected-alt' : 'border-border-default bg-white'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <LozengeTag label={doc.status} type={getStatusLozengeType(doc.status, 'document')} subtle />
                      <span className="text-xs text-text-muted">{formatDocumentFileInfo(doc.fileType ?? getDocumentFileType(doc.name), doc.fileSize)}</span>
                    </div>

                    <div className="mb-2">
                      <LozengeTag label={doc.category} type="Neutral" subtle />
                      <h3 className="mt-1 text-sm font-semibold text-text-heading">{doc.name}</h3>
                    </div>

                    <div className="mb-3">
                      <AiInsightInline summary={doc.aiSummary} action={doc.aiAction} />
                    </div>

                    <div className="mb-3 flex flex-wrap gap-4 text-xs text-text-muted">
                      {doc.caseId && (
                        <span>Case: <button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/cases/${doc.caseId}`); }} className={TABLE_LINK_CLASS}>{doc.caseId}</button></span>
                      )}
                      <span>Claimant: <span className="font-semibold text-text-primary">{doc.claimantName}</span></span>
                      <span className="inline-flex items-center gap-1.5">
                        Source: <DocumentSourceTag source={doc.source} />
                      </span>
                    </div>

                    <div className="text-xs text-text-muted">Uploaded {doc.uploaded}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div
                ref={setDocTableScrollEl}
                className={moduleTableScrollContainerClass(hasHorizontalOverflow, 'flex-1 bg-white')}
              >
                {/*
                  Column order matches Case documents tab: left stickies, scrollable middle,
                  then Status + Actions stickied on the right (must be last in DOM order).
                */}
                <table className="w-full table-fixed border-separate border-spacing-0">
                  <colgroup>
                    <col style={{ width: DOC_TABLE_CHECKBOX_COL_WIDTH }} />
                  </colgroup>
                  <thead className="sticky top-0 z-[30] bg-surface-primary">
                    <tr>
                      <ModuleTableCheckboxColumnCell as="th" className="z-[34] bg-surface-primary">
                        <Checkbox className="size-4 rounded-[4px]" />
                      </ModuleTableCheckboxColumnCell>
                      <th
                        className={`relative sticky z-[35] border-b border-border-default bg-surface-primary ${DOC_TABLE_DOCUMENT_COL_CLASS} py-3 text-left align-middle text-sm font-normal text-text-secondary ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                        style={{
                          left: DOC_TABLE_CHECKBOX_COL_WIDTH,
                          width: DOC_TABLE_NAME_COL_WIDTH,
                          minWidth: DOC_TABLE_NAME_COL_WIDTH,
                          maxWidth: DOC_TABLE_NAME_COL_WIDTH,
                        }}
                      >
                        {showLeftStickyEdge ? (
                          <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                        ) : null}
                        <button type="button" onClick={() => handleSort('name')} className="group flex items-center gap-1 hover:text-brand-blue">
                          Document
                          <ReorderIcon isActive={sortColumn === 'name'} />
                        </button>
                      </th>
                      <th className={`min-w-[320px] border-b border-border-default bg-surface-primary ${DOC_TABLE_SUMMARY_COL_CLASS} py-3 text-left align-middle text-sm font-normal text-text-secondary`}>
                        <SummaryTableColumnHeader className="text-sm font-normal leading-[20px] text-text-secondary" />
                      </th>
                      <th className="border-b border-border-default bg-surface-primary px-2 py-3 text-left align-middle text-sm font-normal text-text-secondary">
                        <button type="button" onClick={() => handleSort('caseId')} className="group flex items-center gap-1 hover:text-brand-blue">
                          Case
                          <ReorderIcon isActive={sortColumn === 'caseId'} />
                        </button>
                      </th>
                      <th className="border-b border-border-default bg-surface-primary px-2 py-3 text-left align-middle text-sm font-normal text-text-secondary">
                        <button type="button" onClick={() => handleSort('uploaded')} className="group flex items-center gap-1 hover:text-brand-blue">
                          Uploaded
                          <ReorderIcon isActive={sortColumn === 'uploaded'} />
                        </button>
                      </th>
                      <th className="border-b border-border-default bg-surface-primary px-2 py-3 text-left align-middle text-sm font-normal text-text-secondary">
                        <button type="button" onClick={() => handleSort('source')} className="group flex items-center gap-1 hover:text-brand-blue">
                          Source
                          <ReorderIcon isActive={sortColumn === 'source'} />
                        </button>
                      </th>
                      <th
                        className={`relative sticky z-[34] border-b border-border-default bg-surface-primary py-3 pl-2 pr-1 text-left align-middle text-sm font-normal text-text-secondary ${showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                        style={{
                          right: DOC_TABLE_ACTIONS_COL_WIDTH,
                          width: DOC_TABLE_STATUS_COL_WIDTH,
                          minWidth: DOC_TABLE_STATUS_COL_WIDTH,
                          maxWidth: DOC_TABLE_STATUS_COL_WIDTH,
                        }}
                      >
                        {showRightStickyEdge ? (
                          <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                        ) : null}
                        <button type="button" onClick={() => handleSort('status')} className="group flex items-center gap-1 hover:text-brand-blue">
                          Status
                          <ReorderIcon isActive={sortColumn === 'status'} />
                        </button>
                      </th>
                      <th
                        className={`relative sticky right-0 z-[34] h-12 min-h-12 border-b border-border-default bg-surface-primary py-0 align-middle ${DOC_TABLE_ACTIONS_CELL_CLASS}`}
                        style={{ width: DOC_TABLE_ACTIONS_COL_WIDTH, minWidth: DOC_TABLE_ACTIONS_COL_WIDTH, maxWidth: DOC_TABLE_ACTIONS_COL_WIDTH }}
                      >
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-y-0 left-0 z-[9] h-full min-h-12 w-[calc(100%+3px)] bg-surface-primary"
                        />
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDocuments.map((doc) => {
                      const selected = selectedDocument?.id === doc.id;
                      const stickyRowSurface = docTableRowSurface(selected);
                      return (
                        <tr
                          key={doc.id}
                          data-keep-sidepanel="row"
                          onClick={() => selectDocument(doc)}
                          className={`group cursor-pointer transition-colors active:scale-[0.995] ${stickyRowSurface}`}
                        >
                          <ModuleTableCheckboxColumnCell
                            as="td"
                            className="z-[14]"
                            surfaceClassName={stickyRowSurface}
                          >
                            <Checkbox className="size-4 rounded-[4px]" onClick={(e) => e.stopPropagation()} />
                          </ModuleTableCheckboxColumnCell>
                          <td
                            className={`relative sticky z-[15] overflow-hidden border-b border-border-default ${DOC_TABLE_DOCUMENT_COL_CLASS} py-3 ${TABLE_CELL_ALIGN_CLASS} ${stickyRowSurface} ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                            style={{
                              left: DOC_TABLE_CHECKBOX_COL_WIDTH,
                              width: DOC_TABLE_NAME_COL_WIDTH,
                              minWidth: DOC_TABLE_NAME_COL_WIDTH,
                              maxWidth: DOC_TABLE_NAME_COL_WIDTH,
                            }}
                          >
                            {showLeftStickyEdge ? (
                              <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                            ) : null}
                            <div className="flex min-w-0 max-w-full items-stretch gap-2.5">
                              <div className="flex min-w-0 flex-1 flex-col gap-1">
                                <LozengeTag label={doc.category} type="Neutral" subtle className="max-w-full shrink-0" />
                                <TableTruncatedLabel
                                  text={doc.name}
                                  className="w-full max-w-full text-[13px] font-semibold text-text-primary"
                                />
                              </div>
                              <DocumentMiniPreviewThumb
                                documentId={doc.id}
                                filename={doc.filename}
                                fileUrl={doc.fileUrl}
                                fileAvailable={doc.fileAvailable}
                                className="ml-auto shrink-0"
                              />
                            </div>
                          </td>
                          <td className={`min-w-[320px] border-b border-border-default bg-inherit ${DOC_TABLE_SUMMARY_COL_CLASS} py-3 align-top ${TABLE_CELL_ALIGN_CLASS}`}>
                            <TwoLineSummaryCell
                              title={deriveDocumentSummaryTitle(doc.name, doc.aiSummary)}
                              summary={documentSummarySubtitle(doc.name, doc.aiSummary)}
                            />
                          </td>
                          <td className={`border-b border-border-default bg-inherit px-2 py-3 align-top ${TABLE_CELL_ALIGN_CLASS}`}>
                            {doc.caseId ? (
                              <div className="min-w-[150px]">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/cases/${doc.caseId}`);
                                  }}
                                  className={`block whitespace-nowrap ${TABLE_LINK_CLASS}`}
                                >
                                  {doc.caseId}
                                </button>
                                <span className={`mt-0.5 block truncate ${TABLE_SUBTEXT_CLASS}`}>
                                  {doc.primaryPartyName ?? doc.claimantName}
                                </span>
                              </div>
                            ) : (
                              <div className="min-w-[150px]">
                                <span className={TABLE_SUBTEXT_CLASS}>—</span>
                                <span className={`mt-0.5 block truncate ${TABLE_SUBTEXT_CLASS}`}>
                                  {doc.primaryPartyName ?? doc.claimantName}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className={`border-b border-border-default bg-inherit px-2 py-3 whitespace-nowrap ${TABLE_TEXT_CLASS}`}>
                            {doc.uploaded}
                          </td>
                          <td className={`border-b border-border-default bg-inherit px-2 py-3 ${TABLE_CELL_ALIGN_CLASS}`}>
                            <DocumentSourceTag source={doc.source} />
                          </td>
                          <td
                            className={`relative sticky z-[14] border-b border-border-default py-3 pl-2 pr-1 align-top ${stickyRowSurface} ${showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                            style={{
                              right: DOC_TABLE_ACTIONS_COL_WIDTH,
                              width: DOC_TABLE_STATUS_COL_WIDTH,
                              minWidth: DOC_TABLE_STATUS_COL_WIDTH,
                              maxWidth: DOC_TABLE_STATUS_COL_WIDTH,
                            }}
                          >
                            {showRightStickyEdge ? (
                              <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                            ) : null}
                            <LozengeTag label={doc.status} type={getStatusLozengeType(doc.status, 'document')} subtle />
                          </td>
                          <td
                            className={`relative sticky right-0 z-[14] box-border min-h-12 border-b border-border-default py-0 align-middle ${DOC_TABLE_ACTIONS_CELL_CLASS} ${stickyRowSurface}`}
                            style={{ width: DOC_TABLE_ACTIONS_COL_WIDTH, minWidth: DOC_TABLE_ACTIONS_COL_WIDTH, maxWidth: DOC_TABLE_ACTIONS_COL_WIDTH }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span
                              aria-hidden
                              className={`pointer-events-none absolute inset-y-0 left-0 z-[0] h-full w-[calc(100%+3px)] ${stickyRowSurface}`}
                            />
                            <div className="relative z-10 flex h-full min-h-12 items-center justify-end gap-0.5">
                              <button
                                type="button"
                                className="rounded p-1 text-text-secondary hover:bg-surface-muted hover:text-text-heading"
                                title="Download"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="rounded p-1 text-text-secondary hover:bg-surface-muted hover:text-text-heading"
                                title="Open in new tab"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <ModuleTablePaginationFooter total={sortedDocuments.length} />
            </div>
          )}
        </div>

        {/* Detail Side Panel */}
        {selectedDocumentData && panelContexts.length > 0 && (
          <WorkspaceObjectSidePanel
            contexts={panelContexts}
            activeContextId={activePanelContextId || documentPanelContextId(selectedDocumentData.documentId)}
            onChangeContext={handleDocumentPanelContextChange}
            onClearContext={clearDocumentPanelContext}
            onClose={closeDocumentPanel}
            panelWidth={panelWidth}
            onPanelWidthChange={setPanelWidth}
            isResizing={isResizing}
            onResizeStart={() => setIsResizing(true)}
            assistantContent={<WorkspaceAssistantPanel contextId={`document:${selectedDocument.id}`} />}
          >
            {selectedDocument?.fileAvailable === false ? (
              <div className="flex min-h-0 flex-1 flex-col bg-white">
                <div className="border-b border-border-default px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Document metadata</p>
                  <h3 className="mt-1 text-lg font-semibold text-text-primary">{selectedDocument.name}</h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    {selectedDocument.placeholderReason ?? 'The dataset includes this document record, but the actual file has not been provided yet.'}
                  </p>
                </div>
                <div className="flex flex-1 items-center justify-center bg-surface-primary p-8">
                  <div className="max-w-sm rounded-xl border border-dashed border-border-soft bg-white p-6 text-center">
                    <FileText className="mx-auto size-8 text-text-muted" />
                    <p className="mt-3 text-sm font-semibold text-text-primary">File not available</p>
                    <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                      Import or upload the actual file to unlock document preview, page evidence, and AI extraction.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <DynamicDocumentSidePanel
                embedded
                open
                onOpenChange={(open) => {
                  if (!open) clearDocumentPanelContext(activePanelContextId || documentPanelContextId(selectedDocumentData.documentId));
                }}
                document={selectedDocumentData}
                activeInsightId={selectedDocumentData.evidence[0]?.id ?? ''}
                onInsightChange={() => undefined}
                panelWidth={panelWidth}
                isResizing={false}
                onResizeStart={() => undefined}
              />
            )}
          </WorkspaceObjectSidePanel>
        )}
      </div>
    </div>
  );
}
