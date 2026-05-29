import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { MODULE_TABLE_ROW_KEBAB_ENABLED } from '../../constants/moduleTableRowActions';
import { useTranslation } from 'react-i18next';
import type { EntityPagination, EntityTableSection } from '../../domain/entityFolders';
import { getStatusLozengeType } from '../../utils/status-display';
import { LozengeTag } from '../LozengeTag';
import { ModuleTableHeaderCell, ModuleTableShell } from '../ModuleTableScaffold';
import { EntitySectionCard } from './EntitySectionCard';

/** Status pill for table cells like "ACTIVE" / "IN QUEUE" / "INACTIVE". */
function StatusPill({ value }: { value: string }) {
  const upper = value.toUpperCase();
  if (upper === 'ACTIVE' || upper === 'INACTIVE' || upper === 'TERMINATED' || upper === 'IN QUEUE')
    return <LozengeTag label={upper} type={getStatusLozengeType(upper, 'entityTable')} subtle />;
  return <span className="text-[13px] text-text-primary">{value}</span>;
}

const STATUS_KEYS = new Set(['status']);

/**
 * Information card that renders a table. Supports right-aligned columns,
 * pagination footer, and an empty state.
 */
export function EntityTableSectionCard({ section }: { section: EntityTableSection }) {
  const { t } = useTranslation('folders');
  const isEmpty = section.rows.length === 0;
  return (
    <EntitySectionCard
      title={section.title}
      actions={section.actions}
      showKebab={!section.actions || section.actions.length === 0}
      bodyClassName="px-0 pb-0 pt-0"
      footer={
        section.pagination && !isEmpty ? <Pagination pagination={section.pagination} /> : null
      }
    >
      {isEmpty ? (
        <EmptyState message={section.emptyState?.message ?? t('entity.table.empty')} />
      ) : (
        <div className="overflow-x-auto">
          <ModuleTableShell minWidth="">
            <thead>
              <tr>
                {section.columns.map((col) => (
                  <ModuleTableHeaderCell
                    key={col.key}
                    align={col.align === 'right' ? 'right' : 'left'}
                    className="border-border-soft bg-white px-4 py-2 text-[12px] font-medium leading-[16px] text-text-secondary"
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.sortable ? (
                        <span aria-hidden className="text-text-muted">⇅</span>
                      ) : null}
                      {col.label}
                    </span>
                  </ModuleTableHeaderCell>
                ))}
                {MODULE_TABLE_ROW_KEBAB_ENABLED ? (
                  <th
                    aria-hidden
                    className="w-[36px] border-b border-border-soft bg-white px-2 py-2"
                  />
                ) : null}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-hover">
                  {section.columns.map((col) => {
                    const value = row.cells[col.key];
                    return (
                      <td
                        key={col.key}
                        className={`whitespace-nowrap border-b border-border-soft px-4 py-3 text-[13px] text-text-primary ${
                          col.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {STATUS_KEYS.has(col.key) && typeof value === 'string' ? (
                          <StatusPill value={value} />
                        ) : value === '' || value === null || value === undefined ? (
                          <span className="text-text-muted">-</span>
                        ) : (
                          value
                        )}
                      </td>
                    );
                  })}
                  {MODULE_TABLE_ROW_KEBAB_ENABLED ? (
                    <td className="border-b border-border-soft px-2 py-3 text-right">
                      <span className="sr-only">{t('entity.table.rowActions')}</span>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </ModuleTableShell>
        </div>
      )}
    </EntitySectionCard>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-8 text-center">
      <p className="whitespace-pre-line text-[12px] leading-[18px] text-text-secondary">
        {message}
      </p>
    </div>
  );
}

function Pagination({ pagination }: { pagination: EntityPagination }) {
  const { t } = useTranslation('folders');
  const { perPage, total } = pagination;
  const end = Math.min(perPage, total);
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="flex items-center justify-between gap-4 border-t border-border-soft px-4 py-2.5">
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-text-secondary">{t('entity.table.rowsPerPage')}</span>
        <div className="relative">
          <select
            defaultValue={perPage}
            className="cursor-pointer appearance-none rounded border border-border-default bg-white px-2 py-0.5 pr-6 text-[12px] text-text-primary"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-1 top-1/2 size-3.5 -translate-y-1/2 text-text-secondary" />
        </div>
        <span className="text-[12px] text-text-secondary">
          {t('entity.table.results', { end, total })}
        </span>
      </div>
      <div className="flex items-center gap-1 text-text-secondary">
        <PagerButton aria-label={t('entity.table.firstPage')} disabled>
          <ChevronsLeft className="size-3.5" />
        </PagerButton>
        <PagerButton aria-label={t('entity.table.previousPage')} disabled>
          <ChevronLeft className="size-3.5" />
        </PagerButton>
        <span className="rounded-full border border-brand-blue/40 bg-surface-selected px-2 text-[12px] font-semibold text-brand-navy">
          1
        </span>
        <PagerButton aria-label={t('entity.table.nextPage')} disabled={totalPages <= 1}>
          <ChevronRight className="size-3.5" />
        </PagerButton>
        <PagerButton aria-label={t('entity.table.lastPage')} disabled={totalPages <= 1}>
          <ChevronsRight className="size-3.5" />
        </PagerButton>
      </div>
    </div>
  );
}

function PagerButton({
  children,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      disabled={disabled}
      {...rest}
      className="rounded p-1 hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
