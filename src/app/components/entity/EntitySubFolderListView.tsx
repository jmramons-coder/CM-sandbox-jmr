import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ChevronDown, Plus, Search, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ModuleTablePaginationFooter } from '../ModuleTablePaginationFooter';
import {
  ModuleTableCell,
  ModuleTableHeaderCell,
  ModuleTableScrollArea,
  ModuleTableShell,
} from '../ModuleTableScaffold';
import { ReorderIcon } from '../ReorderIcon';
import { Checkbox } from '../ui/checkbox';
import { SearchBar } from '../ds';
import { MODULE_TEXT, UI_CLASS } from '../../constants/design-tokens';
import { TABLE_LINK_TRUNCATE_CLASS } from '../ModuleCellHelpers';
import type { SortDirection } from '../../types';
import {
  entitySlug,
  entityTypeFromSlug,
  type EntityFolderType,
} from '../../domain/entityFolders';
import {
  AGENT_LIST_ROWS,
  COVERAGE_LIST_ROWS,
  type MockClient,
  PARTICIPANT_LIST_ROWS,
} from '../../data/mock-entity-folders';
import {
  useTranslatedAgentRows,
  useTranslatedCoverageRows,
  useTranslatedEntityFolder,
  useTranslatedParticipantRows,
} from '../../data/useFolders';
import { useFoldersNav } from '../../contexts/FoldersNavContext';
import { useDataSourceSettings } from '../../contexts/PlatformSettingsContext';
import { filterDatasetBySettings, getSystemDataset } from '../../data/objectRepository';
import {
  getPolicyAgentListRows,
  getPolicyParticipantListRows,
} from '../../data/entityReadModels';
import { ClientAdvancedSearchModal } from './ClientAdvancedSearchModal';

type ListColumn = {
  key: string;
  /** i18n key under `folders:entity.subFolderList.columns.<type>.<key>`. */
  labelKey: string;
  sortable?: boolean;
  align?: 'left' | 'right';
  /** Per-column min width (Tailwind class). Drives horizontal scroll behaviour
   * — without these the columns squeeze and crop content on narrow viewports. */
  minWidth?: string;
  className?: string;
};

type ListRow = {
  id: string;
  cells: Record<string, string | undefined>;
};

const AGENT_COLUMNS: ListColumn[] = [
  { key: 'name', labelKey: 'name', sortable: true, minWidth: 'min-w-[220px]' },
  { key: 'roles', labelKey: 'roles', sortable: true, minWidth: 'min-w-[180px]' },
  { key: 'phone', labelKey: 'phone', sortable: true, minWidth: 'min-w-[160px]' },
  { key: 'email', labelKey: 'email', sortable: true, minWidth: 'min-w-[260px]' },
];

const COVERAGE_COLUMNS: ListColumn[] = [
  { key: 'name', labelKey: 'name', sortable: true, minWidth: 'min-w-[220px]' },
  { key: 'type', labelKey: 'type', sortable: true, minWidth: 'min-w-[140px]' },
  { key: 'level', labelKey: 'level', sortable: true, minWidth: 'min-w-[140px]' },
  { key: 'parent', labelKey: 'parent', sortable: true, minWidth: 'min-w-[180px]' },
  { key: 'amount', labelKey: 'amount', sortable: true, align: 'right', minWidth: 'min-w-[140px]' },
  { key: 'annualPremium', labelKey: 'annualPremium', sortable: true, align: 'right', minWidth: 'min-w-[160px]' },
];

const PARTICIPANT_COLUMNS: ListColumn[] = [
  { key: 'name', labelKey: 'name', sortable: true, minWidth: 'min-w-[220px]' },
  { key: 'roles', labelKey: 'roles', sortable: true, minWidth: 'min-w-[180px]' },
  { key: 'phone', labelKey: 'phone', sortable: true, minWidth: 'min-w-[160px]' },
  { key: 'email', labelKey: 'email', sortable: true, minWidth: 'min-w-[260px]' },
];

const COLUMNS_BY_TYPE: Record<EntityFolderType, ListColumn[]> = {
  policy: AGENT_COLUMNS, // not really used (policies are top-level)
  agent: AGENT_COLUMNS,
  coverage: COVERAGE_COLUMNS,
  participant: PARTICIPANT_COLUMNS,
};

/** Hook variant of rowsForType so each row group can flow through the
 * matching translated-rows selector without duplicate plumbing. */
function useRowsForType(parentId: string | undefined, type: EntityFolderType | null): ListRow[] {
  const dataSource = useDataSourceSettings();
  const activeDataset = useMemo(
    () => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource),
    [dataSource],
  );
  const agentRows = useTranslatedAgentRows(AGENT_LIST_ROWS);
  const coverageRows = useTranslatedCoverageRows(COVERAGE_LIST_ROWS);
  const participantRows = useTranslatedParticipantRows(PARTICIPANT_LIST_ROWS);

  return useMemo(() => {
    if (type === 'agent' && parentId) {
      const fromDataset = getPolicyAgentListRows(activeDataset, parentId);
      const rows = fromDataset.length > 0 ? fromDataset : agentRows;
      return rows.map((r) => ({
        id: r.id,
        cells: { name: r.name, roles: r.roles, phone: r.phone, email: r.email },
      }));
    }
    if (type === 'coverage') {
      return coverageRows.map((r) => ({
        id: r.id,
        cells: {
          name: r.name,
          type: r.type,
          level: r.level,
          amount: r.amount,
          annualPremium: r.annualPremium,
        },
      }));
    }
    if (type === 'participant' && parentId) {
      const fromDataset = getPolicyParticipantListRows(activeDataset, parentId);
      const rows = fromDataset.length > 0 ? fromDataset : participantRows;
      return rows.map((r) => ({
        id: r.id,
        cells: { name: r.name, roles: r.roles, phone: r.phone, email: r.email },
      }));
    }
    return [];
  }, [type, parentId, activeDataset, agentRows, coverageRows, participantRows]);
}

/**
 * Generic sub-folder list view: Header + description + search + table.
 * Reads route params, looks up parent + child type, and renders the
 * appropriate column set.
 */
export function EntitySubFolderListView() {
  const { t } = useTranslation('folders');
  const params = useParams();
  const navigate = useNavigate();
  const parentId =
    params.childId ?? params.folderId ?? undefined; // childId when nested one level deep
  const typeSlug = params.nestedType ?? params.childType ?? undefined;
  const type = entityTypeFromSlug(typeSlug);
  const parent = useTranslatedEntityFolder(parentId);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement | null>(null);
  const { addOpenFolder } = useFoldersNav();

  /* Register root entity folder when navigating directly to a sub-folder list. */
  useEffect(() => {
    if (params.folderId) addOpenFolder(params.folderId);
  }, [params.folderId, addOpenFolder]);

  useEffect(() => {
    if (!addMenuOpen) return;
    function handlePointerDown(event: MouseEvent) {
      if (!addMenuRef.current?.contains(event.target as Node)) {
        setAddMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [addMenuOpen]);

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const rows = useRowsForType(parentId, type);
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const base = q
      ? rows.filter((r) =>
          Object.values(r.cells).some((v) => (v ?? '').toLowerCase().includes(q)),
        )
      : rows;
    if (!sortColumn) return base;
    const sorted = [...base].sort((a, b) => {
      const av = (a.cells[sortColumn] ?? '').toLowerCase();
      const bv = (b.cells[sortColumn] ?? '').toLowerCase();
      if (av < bv) return -1;
      if (av > bv) return 1;
      return 0;
    });
    return sortDirection === 'desc' ? sorted.reverse() : sorted;
  }, [rows, searchQuery, sortColumn, sortDirection]);

  if (!type || !parent) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-muted">
        {t('entity.subFolderList.notRecognized')}
      </div>
    );
  }

  const columns = COLUMNS_BY_TYPE[type];
  /* Plural label / column labels come from translated copy so they follow
   * the active language. */
  const pluralLabel = t(`entity.copy.${type}.plural` as never);
  const description = type === 'policy'
    ? ''
    : t(`entity.subFolderList.descriptions.${type}` as never);
  const addLabel = t(`entity.subFolderList.addButton.${type}` as never);
  const columnsForType = type === 'policy' ? 'agent' : type;
  const columnLabel = (key: string) =>
    t(`entity.subFolderList.columns.${columnsForType}.${key}` as never);
  const totalCount =
    parent.subFolderGroups?.find((g) => g.type === type)?.count ?? rows.length;

  const handleAdvancedClientConfirm = (client: MockClient) => {
    navigate(`add?mode=existing&clientId=${encodeURIComponent(client.id)}`);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header zone */}
      <div className="relative z-10 border-b border-border-default bg-surface-primary px-6 pb-4 pt-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className={`${MODULE_TEXT.pageTitle} font-semibold text-text-primary`}>{pluralLabel}</h1>
            {description ? (
              <p className={`mt-1 max-w-[640px] ${MODULE_TEXT.pageMeta} leading-[18px] text-text-muted`}>
                {description}
              </p>
            ) : null}
          </div>
          {type === 'participant' ? (
            <div ref={addMenuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setAddMenuOpen((open) => !open)}
                className={`flex items-center justify-center gap-2 rounded-full bg-brand-blue px-4 py-2 ${MODULE_TEXT.actionButton} font-bold uppercase leading-none tracking-[0.4px] text-white ${UI_CLASS.primaryActionShadow} transition-colors hover:bg-brand-blue-hover`}
              >
                <Plus className="h-4 w-4" />
                {addLabel}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {addMenuOpen ? (
                <div className="absolute right-0 top-full z-50 mt-1 w-[260px] overflow-hidden rounded-lg border border-border-default bg-white py-2 shadow-[0_8px_24px_rgba(27,28,30,0.16)]">
                  <button
                    type="button"
                    onClick={() => {
                      setAddMenuOpen(false);
                      setAdvancedSearchOpen(true);
                    }}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover"
                  >
                    <Search className="mt-0.5 size-4 shrink-0 text-brand-blue" />
                    <span>
                      <span className="block text-sm font-semibold text-text-primary">
                        {t('entity.addParticipant.entry.advancedSearch')}
                      </span>
                      <span className="mt-0.5 block text-xs leading-4 text-text-muted">
                        {t('entity.addParticipant.entry.advancedSearchDescription')}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddMenuOpen(false);
                      navigate('add?mode=quick');
                    }}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover"
                  >
                    <Zap className="mt-0.5 size-4 shrink-0 text-brand-blue" />
                    <span>
                      <span className="block text-sm font-semibold text-text-primary">
                        {t('entity.addParticipant.entry.quickParticipant')}
                      </span>
                      <span className="mt-0.5 block text-xs leading-4 text-text-muted">
                        {t('entity.addParticipant.entry.quickParticipantDescription')}
                      </span>
                    </span>
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              disabled
              className={`flex shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-brand-blue/40 px-4 py-2 ${MODULE_TEXT.actionButton} font-bold uppercase leading-none tracking-[0.4px] text-white`}
            >
              <Plus className="h-4 w-4" />
              {addLabel}
            </button>
          )}
        </div>

        <SearchBar
          containerClassName="mt-4"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('entity.subFolderList.search')}
        />
      </div>

      {type === 'participant' ? (
        <ClientAdvancedSearchModal
          open={advancedSearchOpen}
          onOpenChange={setAdvancedSearchOpen}
          onConfirm={handleAdvancedClientConfirm}
        />
      ) : null}

      {/* Scrollable table area */}
      <ModuleTableScrollArea>
        <ModuleTableShell>
          <thead className="sticky top-0 z-[1] bg-surface-primary">
            <tr>
              <th className="w-12 border-b border-border-default bg-surface-primary pl-6 pr-2 py-3 align-middle">
                <Checkbox className="size-4 rounded-[4px]" aria-label={t('entity.subFolderList.selectAll')} />
              </th>
              {columns.map((col) => (
                <ModuleTableHeaderCell
                  key={col.key}
                  align={col.align === 'right' ? 'right' : 'left'}
                  className={`${col.minWidth ?? ''} text-[13px] font-normal text-text-secondary`}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className={`group inline-flex items-center gap-1 font-normal hover:text-brand-blue ${
                        col.align === 'right' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <p className="leading-[18px]">{columnLabel(col.labelKey)}</p>
                      <ReorderIcon isActive={sortColumn === col.key} />
                    </button>
                  ) : (
                    <p className="leading-[18px]">{columnLabel(col.labelKey)}</p>
                  )}
                </ModuleTableHeaderCell>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const href = `/folders/${parent.id}/${entitySlug(type)}/${row.id}`;
              return (
                <tr key={row.id} className="hover:bg-surface-hover">
                  <td className="border-b border-border-default pl-6 pr-2 py-3 align-middle">
                    <Checkbox
                      className="size-4 rounded-[4px]"
                      aria-label={t('entity.subFolderList.selectRow', { id: row.id })}
                    />
                  </td>
                  {columns.map((col) => {
                    const value = row.cells[col.key];
                    if (col.key === 'name') {
                      return (
                        <td
                          key={col.key}
                          className={`border-b border-border-default px-2 py-3 align-middle text-left ${col.minWidth ?? ''}`}
                        >
                          <Link
                            to={href}
                            className={TABLE_LINK_TRUNCATE_CLASS}
                            title={value || undefined}
                          >
                            {value || t('entity.subFolderList.emptyDash')}
                          </Link>
                        </td>
                      );
                    }
                    return (
                      <ModuleTableCell
                        key={col.key}
                        align={col.align === 'right' ? 'right' : 'left'}
                        className={col.minWidth ?? ''}
                      >
                        {value && value.length > 0 ? (
                          value
                        ) : (
                          <span className="text-text-muted">{t('entity.subFolderList.emptyCell')}</span>
                        )}
                      </ModuleTableCell>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </ModuleTableShell>
      </ModuleTableScrollArea>

      {/* Pagination — always pinned at the bottom */}
      <ModuleTablePaginationFooter total={totalCount} rangeEnd={filtered.length} />
    </div>
  );
}

