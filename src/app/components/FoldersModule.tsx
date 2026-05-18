import { useMemo, useState, type CSSProperties } from 'react';
import { FolderOpen, LayoutGrid, List, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { FilterDropdown, LozengeTag, ModuleTablePaginationFooter, ReorderIcon } from './index';
import { TABLE_CELL_ALIGN_CLASS, TABLE_LINK_CLASS, TABLE_LINK_TRUNCATE_CLASS } from './ModuleCellHelpers';
import { SearchBar } from './ds';
import { useTableHorizontalScroll } from '../hooks/useTableHorizontalScroll';
import { moduleTableScrollContainerClass } from '../utils/module-table-scroll';
import { useFoldersNav } from '../contexts/FoldersNavContext';
import { useDataSourceSettings, useEnabledCaseTypes } from '../contexts/PlatformSettingsContext';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';
import { filterDatasetBySettings, getSystemDataset } from '../data/objectRepository';
import { parseCaseTypeCodeFromId } from '../domain/caseTypes';
import { MODULE_TEXT, UI_CLASS } from '../constants/design-tokens';
import { useTranslatedFolders } from '../data/useFolders';
import { useFormatDate } from '../i18n/format';
import { getRagOrder, getStatusLozengeType, getStatusShort } from '../utils/status-display';
import type { FolderSummary, FolderTypeCode, SortDirection } from '../types';

type FolderSortableColumn = 'id' | 'folderType' | 'claimant' | 'product' | 'benefit' | 'status' | 'rag' | 'created';

/** Sticky pack: folder id → entity type (matches Tasks / Requests left pack). */
const FOLDER_TABLE_STICKY_COL = {
  id: { width: 172, left: 0 },
  type: { width: 112, left: 172 },
} as const;

const FOLDER_STATUS_COL_WIDTH = 140;

type FolderHeaderConfig = {
  key: FolderSortableColumn;
  /** i18n key under `folders:module.columns.<key>`. */
  labelKey: string;
  /** Optional i18n key under `folders:module.columns.<key>Tooltip`. */
  tooltipKey?: string;
};

const TH_LABEL_CLASS = `whitespace-nowrap ${MODULE_TEXT.tableHeader} font-medium leading-[20px] text-text-primary font-['Open_Sans:SemiBold',sans-serif]`;
const TH_LABEL_STYLE: CSSProperties = { fontVariationSettings: "'wdth' 100" };

/** Order of filter options for the Type dropdown. The actual labels are looked
 * up at render time so they translate with the active language. */
const FOLDER_TYPE_OPTION_VALUES: FolderTypeCode[] = [
  'case',
  'policy',
  'application',
  'lead',
  'client',
  'agent',
  'contributor',
];

/** Scrollable columns (status is rendered last as a right-sticky column). */
const FOLDER_SCROLL_HEADERS: FolderHeaderConfig[] = [
  { key: 'id', labelKey: 'id', tooltipKey: 'idTooltip' },
  { key: 'folderType', labelKey: 'type' },
  { key: 'claimant', labelKey: 'claimant' },
  { key: 'product', labelKey: 'product' },
  { key: 'benefit', labelKey: 'benefit' },
  { key: 'created', labelKey: 'created', tooltipKey: 'createdTooltip' },
];

const FOLDER_STATUS_HEADER: FolderHeaderConfig = {
  key: 'status',
  labelKey: 'status',
  tooltipKey: 'statusTooltip',
};

function folderTypeForRow(folder: FolderSummary): FolderTypeCode {
  return folder.folderType ?? (folder.kind === 'entity' ? 'client' : 'case');
}

function sortFolders(folders: FolderSummary[], column: FolderSortableColumn | null, direction: SortDirection) {
  if (!column) return folders;
  return [...folders].sort((a, b) => {
    const m = direction === 'asc' ? 1 : -1;
    if (column === 'rag') return (getRagOrder(a.rag) - getRagOrder(b.rag)) * m;
    if (column === 'folderType') {
      const av = folderTypeForRow(a);
      const bv = folderTypeForRow(b);
      if (av < bv) return -1 * m;
      if (av > bv) return 1 * m;
      return 0;
    }
    const av = String(a[column]).toLowerCase();
    const bv = String(b[column]).toLowerCase();
    if (av < bv) return -1 * m;
    if (av > bv) return 1 * m;
    return 0;
  });
}

export function FoldersModule() {
  const { t } = useTranslation('folders');
  const formatDate = useFormatDate();
  const navigate = useNavigate();
  const { addOpenFolder } = useFoldersNav();
  const dataSource = useDataSourceSettings();
  const currency = useCurrencyFormatter();
  const activeDataset = useMemo(() => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource), [dataSource]);
  const translatedFolders = useTranslatedFolders();
  const datasetEntityFolders = useMemo<FolderSummary[]>(() => [
    ...activeDataset.policies.map((policy) => ({
      id: policy.id,
      kind: 'entity' as const,
      folderType: 'policy' as const,
      claimant: policy.participants.map((participant) => activeDataset.clients.find((client) => client.id === participant.clientId)?.name ?? participant.clientId).slice(0, 2).join(', ') || 'Policy',
      product: policy.product,
      benefit: policy.coverageAmount ?? policy.monthlyBenefit ?? '—',
      status: policy.status,
      rag: policy.status.toLowerCase() === 'active' ? 'Green' as const : 'Amber' as const,
      created: policy.issueDate ?? policy.effectiveDate ?? 'Dataset',
      subCases: [],
    })),
    ...activeDataset.clients.map((client) => ({
      id: client.id,
      kind: 'entity' as const,
      folderType: 'client' as const,
      claimant: client.name,
      product: `Client · ${client.category ?? client.type}`,
      benefit: client.linkedObjects?.find((ref) => ref.kind === 'policy')?.label ?? '—',
      status: client.status ?? 'active',
      rag: client.status === 'inactive' ? 'Amber' as const : 'Green' as const,
      created: client.profile?.dob ?? 'Dataset',
      subCases: [],
    })),
    ...activeDataset.agents.map((agent) => ({
      id: agent.id,
      kind: 'entity' as const,
      folderType: 'agent' as const,
      claimant: agent.name,
      product: `Agent · ${agent.agencyName ?? 'Independent'}`,
      benefit: agent.producerCode ?? '—',
      status: agent.status,
      rag: agent.status === 'active' ? 'Green' as const : 'Amber' as const,
      created: agent.licenses[0]?.effectiveDate ?? 'Dataset',
      subCases: [],
    })),
  ], [activeDataset]);
  const folders = useMemo(() => {
    const byId = new Map<string, FolderSummary>();
    translatedFolders.forEach((folder) => byId.set(folder.id, folder));
    datasetEntityFolders.forEach((folder) => byId.set(folder.id, folder));
    return Array.from(byId.values());
  }, [datasetEntityFolders, translatedFolders]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [sortColumn, setSortColumn] = useState<FolderSortableColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [tableScrollEl, setTableScrollEl] = useState<HTMLDivElement | null>(null);
  const { showLeftStickyEdge, showRightStickyEdge, hasHorizontalOverflow } = useTableHorizontalScroll(tableScrollEl);

  const handleSort = (column: FolderSortableColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortColumn(column);
    setSortDirection('asc');
  };

  const enabledCaseTypes = useEnabledCaseTypes();
  const enabledCaseTypeCodes = useMemo(
    () => new Set(enabledCaseTypes.map((c) => c.code.toUpperCase())),
    [enabledCaseTypes],
  );

  /* Resolve translated folder-type labels via t(). The status filter still
   * operates on the (already translated) status strings carried on each
   * folder. */
  const folderTypeLabel = (code: FolderTypeCode) =>
    t(`module.folderTypes.${code}` as never);

  const filteredFolders = useMemo(() => {
    return folders.filter((f) => {
      /* The case-type system (IP/WP/WOP/LI) only governs IP claim folders.
       * Entity folders (Policy, etc.) opt out — their visibility is controlled
       * by the dedicated folder-type filter below. */
      const isEntity = f.kind === 'entity';
      const code = parseCaseTypeCodeFromId(f.id)?.toUpperCase() ?? null;
      const matchesEnabledType =
        isEntity || !code || enabledCaseTypeCodes.has(code);

      const searchText = `${f.id} ${f.claimant} ${f.product}`.toLowerCase();
      const matchesSearch = searchText.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || f.status === statusFilter;

      const folderType = f.folderType ?? 'case';
      const matchesType = typeFilter === 'All' || folderType === typeFilter;

      return matchesEnabledType && matchesSearch && matchesStatus && matchesType;
    });
  }, [folders, searchQuery, statusFilter, typeFilter, enabledCaseTypeCodes]);

  const sortedFolders = useMemo(
    () => sortFolders(filteredFolders, sortColumn, sortDirection),
    [filteredFolders, sortColumn, sortDirection],
  );

  const handleRowClick = (folder: FolderSummary) => {
    addOpenFolder(folder.id);
    navigate(`/folders/${folder.id}`);
  };

  /* Status filter options derived from translated folder data so the
   * dropdown labels match the column values for the active language. */
  const statusOptions = useMemo(
    () => Array.from(new Set(folders.map((f) => f.status))),
    [folders],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header — flows seamlessly into the table header (no bottom divider). */}
      <div className="relative z-10 bg-surface-primary px-6 pb-4 pt-4">
        <div className="mb-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className={`${MODULE_TEXT.pageTitle} font-semibold text-text-primary`}>
              {t('module.title')}
            </h1>
            <span className={`rounded-full border border-[#b7bbc2] bg-surface-muted px-2 py-0.5 ${MODULE_TEXT.pageMeta} font-semibold text-text-secondary`}>
              {t('module.count', { count: sortedFolders.length })}
            </span>
          </div>
          <button className={`flex items-center justify-center gap-2 rounded-full bg-brand-blue px-4 py-2 ${MODULE_TEXT.actionButton} font-bold uppercase leading-none tracking-[0.4px] text-white ${UI_CLASS.primaryActionShadow} transition-colors hover:bg-brand-blue-hover`}>
            <Plus className="h-4 w-4" />
            {t('module.createFolder')}
          </button>
        </div>

          <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:gap-3">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('module.searchPlaceholder')}
            />
            <div className="flex flex-wrap items-center gap-2 md:flex-nowrap md:shrink-0">
              <FilterDropdown
                label={t('module.filters.type')}
                /* Use the raw type codes as option keys so the value passed to
                 * onChange stays stable across languages; the dropdown calls
                 * renderOption for display. */
                options={['All', ...FOLDER_TYPE_OPTION_VALUES]}
                value={typeFilter}
                onChange={setTypeFilter}
                renderOption={(option) =>
                  option === 'All'
                    ? t('module.filters.all')
                    : folderTypeLabel(option as FolderTypeCode)
                }
              />
              <FilterDropdown
                label={t('module.filters.status')}
                options={['All', ...statusOptions]}
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </div>
            {/* View toggle — pushed to the far right edge of the toolbar. */}
            <div className="flex h-9 overflow-hidden rounded-md border border-border-default md:ml-auto md:shrink-0">
              <button
                onClick={() => setViewMode('table')}
                className={`flex h-full items-center px-2 ${viewMode === 'table' ? 'bg-brand-blue text-white' : 'bg-white text-text-secondary hover:bg-surface-muted'}`}
                title={t('module.viewToggle.table')}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex h-full items-center border-l border-border-default px-2 ${viewMode === 'list' ? 'bg-brand-blue text-white' : 'bg-white text-text-secondary hover:bg-surface-muted'}`}
                title={t('module.viewToggle.list')}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
      </div>

      <div className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col bg-white">
        {viewMode === 'table' ? (
          <div
            ref={setTableScrollEl}
            className={moduleTableScrollContainerClass(
              hasHorizontalOverflow,
              'flex-1 border-t border-border-default bg-white',
            )}
          >
            <table className="w-full border-separate border-spacing-0">
              <thead className="sticky top-0 z-[30] bg-surface-primary">
                <tr>
                  {FOLDER_SCROLL_HEADERS.map((header) => (
                    <th
                      key={header.key}
                      className={`whitespace-nowrap border-b border-border-default py-3 text-left align-middle ${
                        header.key === 'id' ? 'pl-6 pr-3' : 'px-3'
                      } ${
                        header.key === 'id'
                          ? 'sticky z-[35] relative bg-surface-primary'
                          : header.key === 'folderType'
                            ? `sticky z-[36] relative bg-surface-primary ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`
                            : 'bg-surface-primary'
                      }`}
                      style={
                        header.key === 'id'
                          ? {
                              left: FOLDER_TABLE_STICKY_COL.id.left,
                              minWidth: FOLDER_TABLE_STICKY_COL.id.width,
                              width: FOLDER_TABLE_STICKY_COL.id.width,
                            }
                          : header.key === 'folderType'
                            ? {
                                left: FOLDER_TABLE_STICKY_COL.type.left,
                                minWidth: FOLDER_TABLE_STICKY_COL.type.width,
                                width: FOLDER_TABLE_STICKY_COL.type.width,
                              }
                            : undefined
                      }
                    >
                      {header.key === 'folderType' && showLeftStickyEdge ? (
                        <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                      ) : null}
                      <button
                        onClick={() => handleSort(header.key)}
                        className="group flex items-center gap-1"
                        title={header.tooltipKey ? t(`module.columns.${header.tooltipKey}` as never) : undefined}
                      >
                        <span className={TH_LABEL_CLASS} style={TH_LABEL_STYLE}>
                          {t(`module.columns.${header.labelKey}` as never)}
                        </span>
                        <ReorderIcon isActive={sortColumn === header.key} />
                      </button>
                    </th>
                  ))}
                  <th
                    className={`sticky right-0 z-[34] relative border-b border-border-default bg-surface-primary px-3 py-3 text-left align-middle ${
                      showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.12)]' : ''
                    }`}
                    style={{ width: FOLDER_STATUS_COL_WIDTH, minWidth: FOLDER_STATUS_COL_WIDTH }}
                  >
                    {showRightStickyEdge ? (
                      <span className="pointer-events-none absolute left-0 top-0 z-[8] h-full w-px bg-[#dbdee1]/80" />
                    ) : null}
                    <button
                      onClick={() => handleSort(FOLDER_STATUS_HEADER.key)}
                      className="group flex items-center gap-1"
                      title={
                        FOLDER_STATUS_HEADER.tooltipKey
                          ? t(`module.columns.${FOLDER_STATUS_HEADER.tooltipKey}` as never)
                          : undefined
                      }
                    >
                      <span className={TH_LABEL_CLASS} style={TH_LABEL_STYLE}>
                        {t(`module.columns.${FOLDER_STATUS_HEADER.labelKey}` as never)}
                      </span>
                      <ReorderIcon isActive={sortColumn === FOLDER_STATUS_HEADER.key} />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedFolders.map((folder) => (
                  <tr
                    key={folder.id}
                    className="group cursor-pointer bg-white transition-colors hover:bg-surface-hover"
                    onClick={() => handleRowClick(folder)}
                  >
                    <td
                      className="relative sticky z-[15] border-b border-border-default bg-white py-3 pl-6 pr-3 text-sm transition-colors group-hover:bg-surface-hover whitespace-nowrap"
                      style={{
                        left: FOLDER_TABLE_STICKY_COL.id.left,
                        minWidth: FOLDER_TABLE_STICKY_COL.id.width,
                        width: FOLDER_TABLE_STICKY_COL.id.width,
                      }}
                    >
                      <Link
                        to={`/folders/${folder.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          addOpenFolder(folder.id);
                        }}
                        className={`max-w-[160px] ${TABLE_LINK_TRUNCATE_CLASS}`}
                        title={folder.id}
                      >
                        {folder.id}
                      </Link>
                    </td>
                    <td
                      className={`relative sticky z-[16] border-b border-border-default bg-white px-3 py-3 align-middle transition-colors group-hover:bg-surface-hover ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                      style={{
                        left: FOLDER_TABLE_STICKY_COL.type.left,
                        minWidth: FOLDER_TABLE_STICKY_COL.type.width,
                        width: FOLDER_TABLE_STICKY_COL.type.width,
                      }}
                    >
                      {showLeftStickyEdge ? (
                        <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                      ) : null}
                      <LozengeTag
                        label={folderTypeLabel(folderTypeForRow(folder))}
                        type="Neutral"
                        subtle
                        size="compact"
                      />
                    </td>
                    <td
                      className="max-w-[220px] overflow-hidden text-ellipsis border-b border-border-default bg-white px-3 py-3 text-sm text-text-primary whitespace-nowrap transition-colors group-hover:bg-surface-hover"
                      title={folder.claimant}
                    >
                      {folder.claimant}
                    </td>
                    <td
                      className="max-w-[200px] overflow-hidden text-ellipsis border-b border-border-default bg-white px-3 py-3 text-sm text-text-primary whitespace-nowrap transition-colors group-hover:bg-surface-hover"
                      title={folder.product}
                    >
                      {folder.product}
                    </td>
                    <td
                      className="max-w-[180px] overflow-hidden text-ellipsis border-b border-border-default bg-white px-3 py-3 text-sm text-text-primary whitespace-nowrap transition-colors group-hover:bg-surface-hover"
                      title={currency.localize(folder.benefit)}
                    >
                      {currency.localize(folder.benefit)}
                    </td>
                    <td
                      className="max-w-[120px] overflow-hidden text-ellipsis border-b border-border-default bg-white px-3 py-3 text-sm text-text-primary whitespace-nowrap transition-colors group-hover:bg-surface-hover"
                      title={folder.created}
                    >
                      {formatDate(folder.created) || folder.created}
                    </td>
                    <td
                      className={`sticky right-0 z-[14] relative border-b border-border-default bg-white px-3 py-3 ${TABLE_CELL_ALIGN_CLASS} transition-colors group-hover:bg-surface-hover ${
                        showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.12)]' : ''
                      }`}
                      style={{ width: FOLDER_STATUS_COL_WIDTH, minWidth: FOLDER_STATUS_COL_WIDTH }}
                    >
                      {showRightStickyEdge ? (
                        <span className="pointer-events-none absolute left-0 top-0 z-[8] h-full w-px bg-[#dbdee1]/80" />
                      ) : null}
                      <LozengeTag
                        label={getStatusShort(folder.status)}
                        type={getStatusLozengeType(folder.status, folder.kind === 'entity' ? 'entityTable' : 'case')}
                        subtle
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {sortedFolders.map((folder) => (
                <div
                  key={folder.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRowClick(folder);
                    }
                  }}
                  onClick={() => handleRowClick(folder)}
                  className="w-full cursor-pointer rounded-lg border border-border-default bg-white p-4 text-left transition-colors hover:bg-surface-hover"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/folders/${folder.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          addOpenFolder(folder.id);
                        }}
                        className={`flex items-center gap-2 ${TABLE_LINK_CLASS}`}
                      >
                        <FolderOpen className="h-4 w-4 shrink-0" />
                        {folder.id}
                      </Link>
                    </div>
                  </div>
                  <div className="mb-2 text-sm text-text-primary">{folder.claimant} · {folder.product} · {currency.localize(folder.benefit)}</div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <LozengeTag
                        label={folderTypeLabel(folderTypeForRow(folder))}
                        type="Neutral"
                        subtle
                        size="compact"
                      />
                      <LozengeTag
                        label={getStatusShort(folder.status)}
                        type={getStatusLozengeType(folder.status, folder.kind === 'entity' ? 'entityTable' : 'case')}
                        subtle
                      />
                    </div>
                    <span className="text-text-primary">
                      {formatDate(folder.created) || folder.created}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <ModuleTablePaginationFooter total={sortedFolders.length} labelStyle={TH_LABEL_STYLE} />
      </div>
    </div>
  );
}
