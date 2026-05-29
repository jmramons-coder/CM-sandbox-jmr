import { Link } from 'react-router';
import { Plus } from 'lucide-react';
import { MODULE_TABLE_ROW_KEBAB_ENABLED } from '../../constants/moduleTableRowActions';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ModuleTablePaginationFooter } from '../ModuleTablePaginationFooter';
import {
  ModuleTableCell,
  ModuleTableHeaderCell,
  ModuleTableScrollArea,
  ModuleTableShell,
} from '../ModuleTableScaffold';
import { ReorderIcon } from '../ReorderIcon';
import { SearchBar } from '../ds';
import { LozengeTag } from '../LozengeTag';
import { TABLE_LINK_CLASS } from '../ModuleCellHelpers';
import type { SortDirection } from '../../types';
import { entitySlug, type EntityFolderType } from '../../domain/entityFolders';
import type { EntityRelationshipRow, RelationshipFolderType } from '../../data/mock-entity-folders';

type SortColumn = 'folderName' | 'folderType' | 'relationship' | 'effectiveDate' | 'expirationDate' | 'status';

const COLUMNS: { key: SortColumn; labelKey: string; minWidth: string }[] = [
  { key: 'folderName', labelKey: 'folderName', minWidth: 'min-w-[220px]' },
  { key: 'folderType', labelKey: 'folderType', minWidth: 'min-w-[160px]' },
  { key: 'relationship', labelKey: 'relationship', minWidth: 'min-w-[180px]' },
  { key: 'effectiveDate', labelKey: 'effectiveDate', minWidth: 'min-w-[160px]' },
  { key: 'expirationDate', labelKey: 'expirationDate', minWidth: 'min-w-[160px]' },
  { key: 'status', labelKey: 'status', minWidth: 'min-w-[140px]' },
];

export function EntityRelationshipTab({
  entityId,
  rows,
  onAddRelationship,
}: {
  entityId: string;
  rows: EntityRelationshipRow[];
  onAddRelationship: () => void;
}) {
  const { t } = useTranslation('folders');
  const [search, setSearch] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      const haystack = [
        row.folderName,
        row.folderType,
        row.relationship,
        row.effectiveDate,
        row.expirationDate,
        row.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return !query || haystack.includes(query);
    });

    if (!sortColumn) return filtered;

    return [...filtered].sort((a, b) => {
      const comparison = relationshipValue(a, sortColumn).localeCompare(
        relationshipValue(b, sortColumn),
        undefined,
        { numeric: true, sensitivity: 'base' },
      );
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [rows, search, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortColumn(column);
    setSortDirection('asc');
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-white">
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border-default bg-surface-primary px-5 py-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={t('entity.relationship.search')}
          containerClassName="max-w-[520px]"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={onAddRelationship}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-blue px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-brand-blue-hover"
        >
          <Plus className="size-3.5" />
          {t('entity.relationship.add')}
        </button>
      </div>

      {rows.length === 0 ? (
        <RelationshipEmptyState onAddRelationship={onAddRelationship} />
      ) : (
        <>
          <ModuleTableScrollArea>
            <ModuleTableShell>
              <thead className="sticky top-0 z-[1] bg-surface-primary">
                <tr>
                  {COLUMNS.map((column) => (
                    <ModuleTableHeaderCell
                      key={column.key}
                      className={`${column.minWidth} text-[13px] font-normal text-text-secondary`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSort(column.key)}
                        className="group inline-flex items-center gap-1 font-normal hover:text-brand-blue"
                      >
                        <p className="leading-[18px]">
                          {t(`entity.relationship.columns.${column.labelKey}` as never)}
                        </p>
                        <ReorderIcon isActive={sortColumn === column.key} />
                      </button>
                    </ModuleTableHeaderCell>
                  ))}
                  {MODULE_TABLE_ROW_KEBAB_ENABLED ? (
                    <th className="w-12 border-b border-border-default bg-surface-primary px-3 py-3" />
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id} className="group hover:bg-surface-hover">
                    <ModuleTableCell className="min-w-[220px]">
                      <Link
                        to={relationshipHref(entityId, row)}
                        className={TABLE_LINK_CLASS}
                      >
                        {row.folderName}
                      </Link>
                    </ModuleTableCell>
                    <ModuleTableCell className="min-w-[160px]">{row.folderType}</ModuleTableCell>
                    <ModuleTableCell className="min-w-[180px]">{row.relationship}</ModuleTableCell>
                    <ModuleTableCell className="min-w-[160px]">{row.effectiveDate || '-'}</ModuleTableCell>
                    <ModuleTableCell className="min-w-[160px]">{row.expirationDate || '-'}</ModuleTableCell>
                    <ModuleTableCell className="min-w-[140px]">
                      <LozengeTag
                        label={row.status}
                        type={row.status === 'ACTIVE' ? 'Success' : 'Neutral'}
                        subtle
                      />
                    </ModuleTableCell>
                    {MODULE_TABLE_ROW_KEBAB_ENABLED ? (
                      <td className="w-12 border-b border-border-default px-3 py-3 text-right text-text-secondary" />
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </ModuleTableShell>
          </ModuleTableScrollArea>
          <ModuleTablePaginationFooter total={rows.length} rangeEnd={filteredRows.length} />
        </>
      )}
    </div>
  );
}

function RelationshipEmptyState({ onAddRelationship }: { onAddRelationship: () => void }) {
  const { t } = useTranslation('folders');
  return (
    <div className="flex min-h-[420px] flex-1 flex-col items-center justify-center px-6 text-center">
      <img
        src="/relationship-empty-state.png"
        alt=""
        className="mb-5 h-[156px] w-[214px] object-contain"
      />
      <h3 className="text-[14px] font-semibold text-brand-blue">{t('entity.relationship.emptyTitle')}</h3>
      <p className="mt-1 text-[12px] text-text-secondary">{t('entity.relationship.emptyDescription')}</p>
      <button
        type="button"
        onClick={onAddRelationship}
        className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-brand-blue px-4 py-2 text-[12px] font-semibold text-brand-blue transition-colors hover:bg-brand-blue/5"
      >
        <Plus className="size-3.5" />
        {t('entity.relationship.add')}
      </button>
    </div>
  );
}

function relationshipValue(row: EntityRelationshipRow, column: SortColumn) {
  return row[column] || '';
}

function relationshipHref(entityId: string, row: EntityRelationshipRow) {
  const type = relationshipFolderTypeToEntityType(row.folderType);
  return `/folders/${entityId}/${entitySlug(type)}/${row.folderId}`;
}

function relationshipFolderTypeToEntityType(type: RelationshipFolderType): EntityFolderType {
  if (type === 'Policy') return 'policy';
  if (type === 'Client') return 'client';
  if (type === 'Agent') return 'agent';
  if (type === 'Coverage') return 'coverage';
  return 'participant';
}
