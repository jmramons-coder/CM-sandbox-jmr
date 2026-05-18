import { useMemo, useState, type CSSProperties } from 'react';
import { LayoutGrid, List, MoreVertical, Plus, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { AiInsightInline, FilterDropdown, LozengeTag, ModuleTablePaginationFooter, ReorderIcon } from './index';
import { PriorityChip, SearchBar } from './ds';
import { filterDatasetBySettings, getSystemDataset, listCaseSummaries } from '../data/objectRepository';
import { useTableHorizontalScroll } from '../hooks/useTableHorizontalScroll';
import { moduleTableScrollContainerClass } from '../utils/module-table-scroll';
import { useCasesNav } from '../contexts/CasesNavContext';
import { useDataSourceSettings, usePlatformSettings } from '../contexts/PlatformSettingsContext';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';
import { getWorkflowByKind } from '../domain/workflows';
import { UI_CLASS } from '../constants/design-tokens';
import { getRagOrder, getStatusLozengeType, getStatusShort } from '../utils/status-display';
import type { CaseSummary, SortDirection } from '../types';
import type { CaseKind, ClaimSubType } from '../domain/objectRefs';
import { claimSubTypeLabel } from '../domain/claimSubTypes';
import { isCaseAiSourced, SummaryTableColumnHeader, TABLE_CELL_ALIGN_CLASS, TABLE_LINK_CLASS, TABLE_SUBTEXT_CLASS, TABLE_TEXT_CLASS, TableFirstColumnContent, TwoLineSummaryCell } from './ModuleCellHelpers';
import { CreateCaseModal } from './CreateCaseModal';

type CasesSortableColumn =
  | 'id'
  | 'claimSubType'
  | 'claimant'
  | 'product'
  | 'benefit'
  | 'status'
  | 'rag'
  | 'aiRecommendation'
  | 'priority'
  | 'sla'
  | 'created';

type CaseHeaderConfig = {
  key: CasesSortableColumn;
  label: string;
  tooltip?: string;
  accent?: 'ai';
};

/** Matches TaskModule / DocumentModule table header label typography */
const CASES_TH_LABEL_CLASS =
  "whitespace-nowrap text-[14px] font-medium leading-[20px] text-text-primary font-['Open_Sans:SemiBold',sans-serif]";
const CASES_TH_LABEL_STYLE: CSSProperties = { fontVariationSettings: "'wdth' 100" };

const priorityOrder: Record<string, number> = { High: 2, Normal: 1 };
const aiOrder: Record<string, number> = { Pending: 4, Monitor: 3, Approve: 2, Close: 1 };

/** Sticky Case column — wide enough for case ID + optional AI badge on one line. */
const CASE_TABLE_CASE_COL_WIDTH = 220;

/** Column order: case identity → AI insight → operational triage → plan detail → audit. */
const CASE_HEADERS: CaseHeaderConfig[] = [
  { key: 'id', label: 'Case', tooltip: 'Unique case reference number and claimant.' },
  {
    key: 'claimSubType',
    label: 'Claim sub-type',
    tooltip: 'Death benefit vs disability benefit (and future claim variants).',
  },
  {
    key: 'aiRecommendation',
    label: 'Summary',
    tooltip: 'AI-generated summary and recommended next action.',
    accent: 'ai',
  },
  { key: 'priority', label: 'Priority' },
  { key: 'sla', label: 'SLA Remaining', tooltip: 'Time left before service-level deadline.' },
  { key: 'product', label: 'Product' },
  { key: 'benefit', label: 'Benefit' },
  { key: 'created', label: 'Created', tooltip: 'Case creation date.' },
];

function sortCases(cases: CaseSummary[], column: CasesSortableColumn | null, direction: SortDirection) {
  if (!column) return cases;
  return [...cases].sort((a, b) => {
    const multiplier = direction === 'asc' ? 1 : -1;
    switch (column) {
      case 'priority':
        return (priorityOrder[a.priority] - priorityOrder[b.priority]) * multiplier;
      case 'rag':
        return (getRagOrder(a.rag) - getRagOrder(b.rag)) * multiplier;
      case 'aiRecommendation':
        return (aiOrder[a.aiRecommendation] - aiOrder[b.aiRecommendation]) * multiplier;
      case 'claimSubType': {
        const aLabel =
          a.caseKind === 'claim' && a.claimSubType ? claimSubTypeLabel(a.claimSubType) : '\u007f';
        const bLabel =
          b.caseKind === 'claim' && b.claimSubType ? claimSubTypeLabel(b.claimSubType) : '\u007f';
        if (aLabel < bLabel) return -1 * multiplier;
        if (aLabel > bLabel) return 1 * multiplier;
        return 0;
      }
      default: {
        const aValue = String(a[column as keyof CaseSummary] ?? '').toLowerCase();
        const bValue = String(b[column as keyof CaseSummary] ?? '').toLowerCase();
        if (aValue < bValue) return -1 * multiplier;
        if (aValue > bValue) return 1 * multiplier;
        return 0;
      }
    }
  });
}

export function CasesModule() {
  const navigate = useNavigate();
  const { addOpenCase } = useCasesNav();
  const { updateDataSource } = usePlatformSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [productFilter, setProductFilter] = useState('All');
  const [claimSubTypeFilter, setClaimSubTypeFilter] = useState<string>('All');
  const [businessLineTab, setBusinessLineTab] = useState<'all' | CaseKind>('all');
  const [createCaseOpen, setCreateCaseOpen] = useState(false);
  const dataSource = useDataSourceSettings();
  const currency = useCurrencyFormatter();
  const caseSummaries = useMemo(
    () => listCaseSummaries(filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource)),
    [dataSource],
  );
  const enabledBusinessLineKinds = useMemo(
    () => new Set(dataSource.enabledWorkflows),
    [dataSource.enabledWorkflows],
  );
  const businessLineTabs = useMemo(() => {
    const seen = new Set<CaseKind>();
    return caseSummaries
      .filter((item) => item.caseKind && enabledBusinessLineKinds.has(item.caseKind))
      .filter((item) => {
        if (!item.caseKind || seen.has(item.caseKind)) return false;
        seen.add(item.caseKind);
        return true;
      })
      .map((item) => ({
        kind: item.caseKind as CaseKind,
        /** Use canonical workflow list titles so tabs stay correct even when saved case-type copy is stale. */
        label: getWorkflowByKind(item.caseKind as CaseKind).listTitle,
      }));
  }, [caseSummaries, enabledBusinessLineKinds]);
  const effectiveBusinessLineTab = businessLineTabs.some((item) => item.kind === businessLineTab)
    ? businessLineTab
    : 'all';
  const caseCountByBusinessLine = useMemo(
    () =>
      caseSummaries.reduce<Record<string, number>>((counts, item) => {
        const key = item.caseKind ?? 'unknown';
        counts[key] = (counts[key] ?? 0) + 1;
        return counts;
      }, {}),
    [caseSummaries],
  );
  const [sortColumn, setSortColumn] = useState<CasesSortableColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [casesTableScrollEl, setCasesTableScrollEl] = useState<HTMLDivElement | null>(null);
  const { showLeftStickyEdge, showRightStickyEdge, hasHorizontalOverflow } =
    useTableHorizontalScroll(casesTableScrollEl);
  const claimSubTypeOptions = useMemo(
    () => [
      'All',
      ...Array.from(new Set(caseSummaries
        .filter((item) => item.caseKind === 'claim' && item.claimSubType)
        .map((item) => item.claimSubType as string))),
    ],
    [caseSummaries],
  );

  const handleSort = (column: CasesSortableColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortColumn(column);
    setSortDirection('asc');
  };

  const filteredCases = useMemo(() => {
    return caseSummaries.filter((item) => {
      const matchesEnabledBusinessLine = !item.caseKind || enabledBusinessLineKinds.has(item.caseKind);
      const matchesBusinessLineTab =
        effectiveBusinessLineTab === 'all' || item.caseKind === effectiveBusinessLineTab;
      const searchText = `${item.id} ${item.claimant} ${item.product} ${item.claimSubType ? claimSubTypeLabel(item.claimSubType) : ''}`.toLowerCase();
      const matchesSearch = searchText.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter;
      const matchesProduct = productFilter === 'All' || item.product === productFilter;
      const matchesClaimSubType =
        claimSubTypeFilter === 'All' ||
        (item.caseKind === 'claim' && item.claimSubType === claimSubTypeFilter);
      return (
        matchesEnabledBusinessLine &&
        matchesBusinessLineTab &&
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesProduct &&
        matchesClaimSubType
      );
    });
  }, [caseSummaries, searchQuery, statusFilter, priorityFilter, productFilter, claimSubTypeFilter, effectiveBusinessLineTab, enabledBusinessLineKinds]);

  const sortedCases = useMemo(
    () => sortCases(filteredCases, sortColumn, sortDirection),
    [filteredCases, sortColumn, sortDirection]
  );

  return (
    <div className="flex h-full flex-col bg-surface-primary">
      <div className="relative z-20 min-h-[160px] bg-surface-primary px-6 pt-5 pb-4">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-text-primary">All cases</h1>
            <span className="rounded-full border border-[#b7bbc2] bg-surface-muted px-2 py-0.5 text-xs font-semibold text-text-secondary">
              {sortedCases.length} cases
            </span>
          </div>
          <button onClick={() => setCreateCaseOpen(true)} className={`flex items-center justify-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-xs font-bold uppercase leading-none tracking-[0.4px] text-white ${UI_CLASS.primaryActionShadow} transition-colors hover:bg-brand-blue-hover`}>
            <Plus className="h-4 w-4" />
            CREATE CASE
          </button>
        </div>

        {businessLineTabs.length > 1 ? (
          <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border-default">
            <button
              type="button"
              onClick={() => setBusinessLineTab('all')}
              className={`shrink-0 border-b-2 px-3 py-2 text-[12px] font-semibold transition-colors ${
                effectiveBusinessLineTab === 'all'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              All
              <span className="ml-1 rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] text-text-muted">
                {caseSummaries.length}
              </span>
            </button>
            {businessLineTabs.map((line) => (
              <button
                key={line.kind}
                type="button"
                onClick={() => setBusinessLineTab(line.kind)}
                className={`shrink-0 border-b-2 px-3 py-2 text-[12px] font-semibold capitalize transition-colors ${
                  effectiveBusinessLineTab === line.kind
                    ? 'border-brand-blue text-brand-blue'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {line.label}
                <span className="ml-1 rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] text-text-muted">
                  {caseCountByBusinessLine[line.kind] ?? 0}
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-2 xl:flex-nowrap">
          <SearchBar
            containerClassName="order-1"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, case #, or product..."
          />
          <div className="order-3 flex w-full flex-wrap items-center gap-3 xl:order-2 xl:w-auto xl:flex-none">
            <FilterDropdown label="Status" options={['All', ...new Set(caseSummaries.map((i) => i.status))]} value={statusFilter} onChange={setStatusFilter} />
            <FilterDropdown label="Priority" options={['All', 'High', 'Normal']} value={priorityFilter} onChange={setPriorityFilter} />
            <FilterDropdown label="Product" options={['All', ...new Set(caseSummaries.map((i) => i.product))]} value={productFilter} onChange={setProductFilter} />
            <FilterDropdown
              label="Claim sub-type"
              options={claimSubTypeOptions}
              value={claimSubTypeFilter}
              onChange={setClaimSubTypeFilter}
              renderOption={(opt) => (opt === 'All' ? opt : claimSubTypeLabel(opt as ClaimSubType))}
            />
          </div>
          <div className="order-2 ml-auto flex shrink-0 items-center gap-2 xl:order-3">
            <div className="overflow-hidden rounded-md border border-border-default">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 ${viewMode === 'table' ? 'bg-brand-blue text-white' : 'bg-white text-text-secondary hover:bg-surface-muted'}`}
                title="Table view"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`border-l border-border-default p-2 ${viewMode === 'list' ? 'bg-brand-blue text-white' : 'bg-white text-text-secondary hover:bg-surface-muted'}`}
                title="List view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
            <button className="rounded-full border border-border-default p-2 text-text-secondary hover:bg-surface-muted">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col bg-white">
        {viewMode === 'table' ? (
          <div
            ref={setCasesTableScrollEl}
            className={moduleTableScrollContainerClass(
              hasHorizontalOverflow,
              'flex-1 border-t border-border-default bg-white',
            )}
          >
            <table className="w-full border-separate border-spacing-0">
            <thead className="sticky top-0 z-10 bg-surface-primary">
              <tr>
                {CASE_HEADERS.map((header) => (
                  <th
                    key={header.key}
                    style={
                      header.key === 'id'
                        ? { minWidth: CASE_TABLE_CASE_COL_WIDTH, width: CASE_TABLE_CASE_COL_WIDTH }
                        : undefined
                    }
                    className={`whitespace-nowrap border-b border-border-default py-3 text-left align-middle ${
                      header.key === 'id' ? 'pl-6 pr-3' : 'px-3'
                    } ${
                      header.key === 'aiRecommendation' ? 'min-w-[260px] max-w-[320px]' : ''
                    } ${
                      header.key === 'id'
                        ? `sticky left-0 z-[6] relative bg-surface-primary ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`
                        : ''
                    }`}
                  >
                    {header.key === 'id' && showLeftStickyEdge ? (
                      <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                    ) : null}
                    <button
                      onClick={() => handleSort(header.key)}
                      className="group flex items-center gap-1"
                      title={header.tooltip}
                    >
                      {header.accent === 'ai' ? (
                        <SummaryTableColumnHeader
                          className={`${CASES_TH_LABEL_CLASS} text-text-primary`}
                          style={CASES_TH_LABEL_STYLE}
                          label={header.label}
                        />
                      ) : (
                        <span className={CASES_TH_LABEL_CLASS} style={CASES_TH_LABEL_STYLE}>
                          {header.label}
                        </span>
                      )}
                      <ReorderIcon isActive={sortColumn === header.key} />
                    </button>
                  </th>
                ))}
                <th
                  className={`sticky right-0 z-[6] w-[190px] min-w-[190px] relative border-b border-border-default bg-surface-primary px-3 py-3 text-left align-middle ${
                    showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.12)]' : ''
                  }`}
                >
                  {showRightStickyEdge ? (
                    <span className="pointer-events-none absolute left-0 top-0 z-[8] h-full w-px bg-[#dbdee1]/80" />
                  ) : null}
                  <span className={CASES_TH_LABEL_CLASS} style={CASES_TH_LABEL_STYLE}>Status</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCases.map((item) => (
                <tr
                  key={item.id}
                  className="group cursor-pointer bg-white transition-colors hover:bg-surface-hover"
                  onClick={() => {
                    addOpenCase(item.id);
                    navigate(`/cases/${item.id}`);
                  }}
                >
                  <td
                    style={{ minWidth: CASE_TABLE_CASE_COL_WIDTH, width: CASE_TABLE_CASE_COL_WIDTH }}
                    className={`sticky left-0 z-[6] relative border-b border-border-default bg-white pl-6 pr-3 py-3 ${TABLE_CELL_ALIGN_CLASS} transition-colors group-hover:bg-surface-hover ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                  >
                    {showLeftStickyEdge ? (
                      <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                    ) : null}
                    <TableFirstColumnContent aiSourced={isCaseAiSourced(item)}>
                      <div className="min-w-0">
                        <Link
                          to={`/cases/${item.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            addOpenCase(item.id);
                          }}
                          className={`block whitespace-nowrap ${TABLE_LINK_CLASS}`}
                          title={item.id}
                        >
                          {item.id}
                        </Link>
                        <span className={`mt-0.5 block truncate ${TABLE_SUBTEXT_CLASS}`} title={item.claimant}>
                          {item.claimant}
                        </span>
                      </div>
                    </TableFirstColumnContent>
                  </td>
                  <td className={`whitespace-nowrap border-b border-border-default px-3 py-3 ${TABLE_CELL_ALIGN_CLASS} ${TABLE_TEXT_CLASS}`}>
                    {item.caseKind === 'claim' && item.claimSubType ? claimSubTypeLabel(item.claimSubType) : '—'}
                  </td>
                  <td className={`min-w-[320px] max-w-[420px] border-b border-border-default px-3 py-3 ${TABLE_CELL_ALIGN_CLASS}`}>
                    <TwoLineSummaryCell
                      className="max-w-[420px]"
                      title={item.aiRecommendation === 'Approve'
                        ? 'Approval ready'
                        : item.aiRecommendation === 'Close'
                          ? 'Closure ready'
                          : item.aiRecommendation === 'Monitor'
                            ? 'Monitor next action'
                            : 'Review required'}
                      summary={item.aiSummary}
                    />
                  </td>
                  <td className={`border-b border-border-default px-3 py-3 whitespace-nowrap ${TABLE_CELL_ALIGN_CLASS}`}>
                    <PriorityChip priority={item.priority} />
                  </td>
                  <td className={`border-b border-border-default px-3 py-3 whitespace-nowrap ${TABLE_CELL_ALIGN_CLASS} ${TABLE_TEXT_CLASS}`}>{item.sla}</td>
                  <td
                    className={`max-w-[200px] overflow-hidden text-ellipsis border-b border-border-default px-3 py-3 whitespace-nowrap ${TABLE_CELL_ALIGN_CLASS} ${TABLE_TEXT_CLASS}`}
                    title={item.product}
                  >
                    {item.product}
                  </td>
                  <td
                    className={`max-w-[180px] overflow-hidden text-ellipsis border-b border-border-default px-3 py-3 whitespace-nowrap ${TABLE_CELL_ALIGN_CLASS} ${TABLE_TEXT_CLASS}`}
                    title={currency.localize(item.benefit)}
                  >
                    {currency.localize(item.benefit)}
                  </td>
                  <td
                    className={`max-w-[120px] overflow-hidden text-ellipsis border-b border-border-default px-3 py-3 whitespace-nowrap ${TABLE_CELL_ALIGN_CLASS} ${TABLE_TEXT_CLASS}`}
                    title={item.created}
                  >
                    {item.created}
                  </td>
                  <td
                    className={`sticky right-0 z-[5] w-[190px] min-w-[190px] relative border-b border-border-default bg-white px-3 py-3 ${TABLE_CELL_ALIGN_CLASS} transition-colors group-hover:bg-surface-hover ${
                      showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.12)]' : ''
                    }`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {showRightStickyEdge ? (
                      <span className="pointer-events-none absolute left-0 top-0 z-[8] h-full w-px bg-[#dbdee1]/80" />
                    ) : null}
                    <div className="flex items-center justify-between gap-2">
                      <LozengeTag label={getStatusShort(item.status)} type={getStatusLozengeType(item.status, 'case')} subtle />
                      <button
                        type="button"
                        className="inline-flex size-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                        aria-label={`More actions for ${item.id}`}
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {sortedCases.map((item) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      addOpenCase(item.id);
                      navigate(`/cases/${item.id}`);
                    }
                  }}
                  onClick={() => {
                    addOpenCase(item.id);
                    navigate(`/cases/${item.id}`);
                  }}
                  className="w-full cursor-pointer rounded-lg border border-border-default bg-white p-4 text-left transition-colors hover:bg-surface-hover"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/cases/${item.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          addOpenCase(item.id);
                        }}
                        className={TABLE_LINK_CLASS}
                      >
                        {item.id}
                      </Link>
                    </div>
                    <span className="text-sm text-text-primary">SLA: {item.sla}</span>
                  </div>
                  <div className="mb-2 text-sm text-text-primary">
                    {item.claimant}
                    {' '}· {item.product} · {currency.localize(item.benefit)}
                  </div>
                  {item.caseKind === 'claim' && item.claimSubType ? (
                    <div className="mb-2 text-xs text-text-secondary">
                      Claim sub-type: {claimSubTypeLabel(item.claimSubType)}
                    </div>
                  ) : null}
                  <div className="mb-2">
                    <AiInsightInline summary={item.aiSummary} action={item.aiRecommendation} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <LozengeTag label={getStatusShort(item.status)} type={getStatusLozengeType(item.status, 'case')} subtle />
                    </div>
                    <span className="inline-flex items-center gap-2 text-text-primary">
                      <PriorityChip priority={item.priority} />
                      <span>{item.created}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <ModuleTablePaginationFooter total={sortedCases.length} labelStyle={CASES_TH_LABEL_STYLE} />
      </div>
      <CreateCaseModal
        open={createCaseOpen}
        onOpenChange={setCreateCaseOpen}
        dataSource={dataSource}
        onCreated={({ datasetId, caseId }) => {
          const nextDataSource = { ...dataSource, activeDatasetId: datasetId };
          const createdCaseSummary = listCaseSummaries(filterDatasetBySettings(getSystemDataset(datasetId), nextDataSource)).find((item) => item.id === caseId);
          updateDataSource({ activeDatasetId: datasetId });
          addOpenCase(caseId, createdCaseSummary);
        }}
      />
    </div>
  );
}
