import { useMemo, useState, type CSSProperties } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MOCK_CLIENTS, type MockClient } from '../../data/mock-entity-folders';
import { useTableHorizontalScroll } from '../../hooks/useTableHorizontalScroll';
import { moduleTableScrollContainerClass } from '../../utils/module-table-scroll';
import { FilterMulti, InitialsAvatar, RadioButton, type FilterMultiOption } from '../ds';
import { LozengeTag } from '../LozengeTag';
import { ModuleTablePaginationFooter } from '../ModuleTablePaginationFooter';
import { ReorderIcon } from '../ReorderIcon';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';

type ClientStatus = NonNullable<MockClient['status']>;
type SortColumn = 'displayName' | 'status' | 'email' | 'phone' | 'dob' | 'address';
type SortDirection = 'asc' | 'desc';

const STATUS_VALUES: ClientStatus[] = ['active', 'inactive'];
const MIN_BIRTH_YEAR = 1900;
const CURRENT_YEAR = new Date().getFullYear();
const BIRTH_YEAR_VALUES = Array.from(
  { length: CURRENT_YEAR - MIN_BIRTH_YEAR + 1 },
  (_, index) => String(CURRENT_YEAR - index),
);
const TABLE_COLUMNS: { key: SortColumn; labelKey: string; className: string }[] = [
  { key: 'displayName', labelKey: 'displayName', className: 'sticky left-[48px] z-[22] w-[212px] min-w-[212px] bg-white pl-2 pr-2' },
  { key: 'status', labelKey: 'status', className: 'sticky left-[260px] z-[22] w-[92px] min-w-[92px] bg-white px-2' },
  { key: 'email', labelKey: 'email', className: 'px-2' },
  { key: 'phone', labelKey: 'phone', className: 'min-w-[120px] px-2' },
  { key: 'dob', labelKey: 'dob', className: 'px-2' },
  { key: 'address', labelKey: 'address', className: 'px-2' },
];

export function ClientAdvancedSearchModal({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (client: MockClient) => void;
}) {
  const { t } = useTranslation('folders');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [birthYearFilter, setBirthYearFilter] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [tableScrollEl, setTableScrollEl] = useState<HTMLDivElement | null>(null);
  const { showLeftStickyEdge, hasHorizontalOverflow } = useTableHorizontalScroll(tableScrollEl);
  const thStyle = "flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-medium justify-center leading-[0] text-text-primary text-[14px] whitespace-nowrap";
  const fontVar: CSSProperties = { fontVariationSettings: "'wdth' 100" };

  const visibleClients = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filteredClients = MOCK_CLIENTS.filter((client) => {
      const searchable = [
        client.name,
        client.email,
        client.phone,
        client.dob,
        client.address,
        client.parish,
        client.taxId,
        client.status ? t(`entity.advancedClientSearch.filters.status.${client.status}` as never) : '',
        client.category ? t(`entity.advancedClientSearch.filters.category.${client.category}` as never) : '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      const birthYear = getBirthYear(client.dob);
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(client.status ?? 'active');
      const matchesBirthYear =
        birthYearFilter.length === 0 ||
        (birthYear !== null && birthYearFilter.includes(String(birthYear)));
      const matchesFilters = matchesStatus && matchesBirthYear;
      return matchesSearch && matchesFilters;
    });

    if (!sortColumn) return filteredClients;

    return [...filteredClients].sort((a, b) => {
      const comparison = getClientSortValue(a, sortColumn).localeCompare(
        getClientSortValue(b, sortColumn),
        undefined,
        { numeric: true, sensitivity: 'base' },
      );
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [birthYearFilter, search, sortColumn, sortDirection, statusFilter, t]);

  const selectedClient = MOCK_CLIENTS.find((client) => client.id === selectedId) ?? null;
  const statusOptions = useMemo<FilterMultiOption[]>(
    () =>
      STATUS_VALUES.map((status) => ({
        value: status,
        label: t(`entity.advancedClientSearch.filters.status.${status}` as never),
      })),
    [t],
  );
  const birthYearOptions = useMemo<FilterMultiOption[]>(
    () =>
      BIRTH_YEAR_VALUES.map((year) => ({
        value: year,
        label: year,
      })),
    [],
  );

  const close = () => {
    onOpenChange(false);
    setSearch('');
    setStatusFilter([]);
    setBirthYearFilter([]);
    setSelectedId(null);
  };

  const confirm = () => {
    if (!selectedClient) return;
    onConfirm(selectedClient);
    close();
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortColumn(column);
    setSortDirection('asc');
  };

  const handleStatusFilterChange = (nextValue: string[]) => {
    setStatusFilter(nextValue.length === STATUS_VALUES.length ? [] : nextValue);
  };

  const handleBirthYearFilterChange = (nextValue: string[]) => {
    setBirthYearFilter(nextValue.length === BIRTH_YEAR_VALUES.length ? [] : nextValue);
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : close())}>
      <DialogContent
        layout="auto"
        className="z-[1110] flex flex-col gap-0 overflow-hidden p-0 max-lg:h-full max-lg:max-h-none max-lg:w-full max-lg:max-w-none max-lg:rounded-none lg:h-[640px] lg:w-[920px] lg:sm:max-w-[920px]"
      >
        <div className="shrink-0 px-6 pb-4 pt-5">
          <DialogTitle className="text-[18px] font-semibold text-text-primary">
            {t('entity.advancedClientSearch.title')}
          </DialogTitle>
          <p className="mt-0.5 text-[12px] text-text-secondary">
            {t('entity.advancedClientSearch.description')}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-[13px] font-semibold text-text-primary">
              {t('entity.advancedClientSearch.searchLabel')}
            </span>
            <span className="shrink-0 rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-text-secondary">
              {t('entity.advancedClientSearch.clientCount', { count: visibleClients.length })}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
              <input
                id="advanced-client-search-input"
                type="text"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('entity.advancedClientSearch.searchPlaceholder')}
                className="h-9 w-full rounded-lg border border-border-default bg-white pl-9 pr-3 text-[13px] text-text-primary outline-none placeholder:text-text-placeholder focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20"
              />
            </div>
            <FilterMulti
              label={t('entity.advancedClientSearch.filters.status.label')}
              options={statusOptions}
              value={statusFilter}
              onChange={handleStatusFilterChange}
              onRemove={statusFilter.length > 0 ? () => setStatusFilter([]) : undefined}
              clearLabel={t('entity.advancedClientSearch.clearFilters')}
              selectLabel={t('entity.advancedClientSearch.selectFilters')}
              className="shrink-0"
            />
            <FilterMulti
              label={t('entity.advancedClientSearch.filters.birthYear.label')}
              options={birthYearOptions}
              value={birthYearFilter}
              onChange={handleBirthYearFilterChange}
              selectionMode="single"
              onRemove={birthYearFilter.length > 0 ? () => setBirthYearFilter([]) : undefined}
              clearLabel={t('entity.advancedClientSearch.clearFilters')}
              selectLabel={t('entity.advancedClientSearch.selectFilters')}
              className="mr-2 shrink-0"
              buttonClassName="min-w-[132px]"
            />
          </div>
        </div>

        <div
          ref={setTableScrollEl}
          className={moduleTableScrollContainerClass(
            hasHorizontalOverflow,
            'flex-1 overscroll-x-contain overscroll-y-contain bg-white',
          )}
        >
          {visibleClients.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <Search className="size-8 text-text-placeholder" />
              <p className="text-[13px] font-medium text-text-secondary">
                {t('entity.advancedClientSearch.emptyTitle')}
              </p>
              <p className="text-[11px] text-text-muted">
                {t('entity.advancedClientSearch.emptyDescription')}
              </p>
            </div>
          ) : (
            <table className="w-full border-separate border-spacing-0">
              <thead className="sticky top-0 z-[20] bg-white">
                <tr>
                  <th className="sticky left-0 z-[22] w-12 min-w-12 border-y border-border-default bg-white px-4 py-3 align-middle">
                    <span className="sr-only">{t('entity.advancedClientSearch.selectPrompt')}</span>
                  </th>
                  {TABLE_COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      className={`border-y border-border-default bg-white py-3 text-left align-middle ${column.className} ${column.key === 'status' ? 'relative before:absolute before:left-[-1px] before:top-0 before:h-full before:w-px before:bg-inherit' : ''}`}
                    >
                      {column.key === 'status' && showLeftStickyEdge ? (
                        <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleSort(column.key)}
                        className="group flex items-center gap-1 hover:text-brand-blue"
                      >
                        <div className={thStyle} style={fontVar}>
                          <p className="leading-[20px]">
                            {t(`entity.advancedClientSearch.columns.${column.labelKey}` as never)}
                          </p>
                        </div>
                        <ReorderIcon isActive={sortColumn === column.key} />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&>tr:last-child>td]:border-b-0">
                {visibleClients.map((client) => (
                  <ClientSearchRow
                    key={client.id}
                    client={client}
                    selected={client.id === selectedId}
                    showStickyEdge={showLeftStickyEdge}
                    onSelect={() => setSelectedId(client.id)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {visibleClients.length > 0 ? (
          <ModuleTablePaginationFooter total={visibleClients.length} labelStyle={fontVar} variant="compact" />
        ) : null}

        <div className="shrink-0 rounded-b-lg border-t border-border-default bg-surface-primary px-6 py-3">
          <div className="flex items-center justify-end gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={close}
                className="rounded-full border border-border-default bg-white px-4 py-2 text-[12px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted"
              >
                {t('entity.advancedClientSearch.cancel')}
              </button>
              <button
                type="button"
                disabled={!selectedClient}
                onClick={confirm}
                className="flex items-center gap-1.5 rounded-full bg-brand-blue px-5 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-brand-blue-hover disabled:opacity-40"
              >
                {t('entity.advancedClientSearch.confirm')}
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ClientSearchRow({
  client,
  selected,
  showStickyEdge,
  onSelect,
}: {
  client: MockClient;
  selected: boolean;
  showStickyEdge: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation('folders');
  const cellSurface = selected ? 'bg-surface-selected-alt group-hover:bg-surface-selected-alt' : 'bg-white group-hover:bg-surface-hover';

  return (
    <tr
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      className="group cursor-pointer text-[12px]"
    >
      <td className={`sticky left-0 z-[4] w-12 min-w-12 border-b border-border-default px-4 py-3 align-middle ${cellSurface}`}>
        <RadioButton
          checked={selected}
          aria-label={t('entity.advancedClientSearch.selectClient', { name: client.name })}
        />
      </td>
      <td className={`sticky left-[48px] z-[4] w-[212px] min-w-[212px] border-b border-border-default py-3 pl-2 pr-2 ${cellSurface}`}>
        <div className="flex items-center gap-2">
          <InitialsAvatar
            name={client.name}
            initials={client.initials}
            seed={client.id}
            backgroundColor={client.avatarColor}
            textColor={client.avatarTextColor}
            size="sm"
          />
          <span className="whitespace-nowrap font-semibold text-text-primary">{client.name}</span>
        </div>
      </td>
      <td className={`sticky left-[260px] z-[6] w-[92px] min-w-[92px] border-b border-border-default px-2 py-3 text-text-secondary ${cellSurface} relative before:absolute before:left-[-1px] before:top-0 before:h-full before:w-px before:bg-inherit`}>
        {showStickyEdge ? (
          <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
        ) : null}
        <LozengeTag
          label={t(`entity.advancedClientSearch.filters.status.${client.status ?? 'active'}` as never)}
          type={(client.status ?? 'active') === 'active' ? 'Success' : 'Neutral'}
          subtle
        />
      </td>
      <td className={`border-b border-border-default px-2 py-3 text-text-secondary ${cellSurface}`}>{client.email || '-'}</td>
      <td className={`whitespace-nowrap border-b border-border-default px-2 py-3 text-text-secondary ${cellSurface}`}>{client.phone || '-'}</td>
      <td className={`border-b border-border-default px-2 py-3 text-text-secondary ${cellSurface}`}>{client.dob || '-'}</td>
      <td className={`border-b border-border-default px-2 py-3 text-text-secondary ${cellSurface}`}>
        {[client.address, client.parish].filter(Boolean).join(', ') || '-'}
      </td>
    </tr>
  );
}

function getClientSortValue(client: MockClient, column: SortColumn) {
  if (column === 'displayName') return client.name;
  if (column === 'status') return client.status || 'active';
  if (column === 'email') return client.email || '';
  if (column === 'phone') return client.phone || '';
  if (column === 'dob') return client.dob || '';
  if (column === 'address') return [client.address, client.parish].filter(Boolean).join(', ');
  return '';
}

function getBirthYear(dob: string | undefined): number | null {
  if (!dob) return null;
  const year = Number(dob.slice(0, 4));
  return Number.isFinite(year) ? year : null;
}
