import { ExternalLink } from 'lucide-react';
import type { CaseRequirement } from '../../types';
import type { TableHorizontalScrollState } from '../../hooks/useTableHorizontalScroll';
import {
  MODULE_TABLE_LAYOUT_CLASS,
  moduleTableScrollContainerClass,
} from '../../utils/module-table-scroll';
import { getRequirementStatusLozengeType } from '../../utils/status-display';
import { requirementExternalCode, requirementExternalHref } from '../../utils/caseViewRequirementUtils';
import { LozengeTag } from '../LozengeTag';
import { isRequirementAiSourced, TableFirstColumnContent } from '../ModuleCellHelpers';

const REQ_TABLE_MIN_WIDTH = 1360;

type CaseRequirementsTableProps = {
  caseId: string;
  rows: CaseRequirement[];
  totalRows: number;
  selectedRequirementId?: CaseRequirement['id'];
  tableScroll: TableHorizontalScrollState;
  setScrollEl: (el: HTMLDivElement | null) => void;
  onOpenRequirement: (row: CaseRequirement) => void;
};

function reqTableRowSurface(selected: boolean) {
  return selected
    ? 'bg-surface-selected-alt group-hover:bg-surface-selected-alt'
    : 'bg-white group-hover:bg-surface-hover';
}

export function CaseRequirementsTable({
  caseId,
  rows,
  totalRows,
  selectedRequirementId,
  tableScroll,
  setScrollEl,
  onOpenRequirement,
}: CaseRequirementsTableProps) {
  const { showLeftStickyEdge, showRightStickyEdge } = tableScroll;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden bg-white">
      <div
        ref={setScrollEl}
        className={moduleTableScrollContainerClass(tableScroll.hasHorizontalOverflow, 'flex-1')}
      >
        <table className={MODULE_TABLE_LAYOUT_CLASS} style={{ minWidth: REQ_TABLE_MIN_WIDTH }}>
          <thead className="sticky top-0 z-[1] bg-surface-primary">
            <tr>
              <th
                className={`relative min-w-[280px] w-[320px] border-b border-border-default bg-surface-primary pl-6 pr-3 py-2 text-left align-middle text-sm font-medium text-text-secondary sticky left-0 z-[6] ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
              >
                {showLeftStickyEdge ? (
                  <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                ) : null}
                Name
              </th>
              <th className="border-b border-border-default bg-surface-primary px-3 py-2 text-left text-sm font-medium text-text-secondary whitespace-nowrap">Category</th>
              <th className="border-b border-border-default bg-surface-primary px-3 py-2 text-left text-sm font-medium text-text-secondary whitespace-nowrap">Stage</th>
              <th className="border-b border-border-default bg-surface-primary px-3 py-2 text-left text-sm font-medium text-text-secondary whitespace-nowrap">Due Date</th>
              <th className="border-b border-border-default bg-surface-primary px-3 py-2 text-left text-sm font-medium text-text-secondary whitespace-nowrap">Follow-Up</th>
              <th className="border-b border-border-default bg-surface-primary px-3 py-2 text-left text-sm font-medium text-text-secondary whitespace-nowrap">Source</th>
              <th className="max-w-[160px] border-b border-border-default bg-surface-primary px-3 py-2 text-left text-sm font-medium text-text-secondary whitespace-nowrap">Notes</th>
              <th className="border-b border-border-default bg-surface-primary px-3 py-2 text-left text-sm font-medium text-text-secondary whitespace-nowrap">External Source</th>
              <th
                className={`relative border-b border-border-default bg-surface-primary py-2 pl-2 pr-2 text-left align-middle text-sm font-medium text-text-secondary sticky right-[64px] z-[6] ${showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
              >
                {showRightStickyEdge ? (
                  <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                ) : null}
                Status
              </th>
              <th className="relative h-10 w-[64px] min-h-10 min-w-[64px] max-w-[64px] bg-surface-primary p-0 align-middle sticky right-0 z-[7]">
                <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-[9] h-full min-h-10 w-[calc(100%+3px)] border-b border-border-default bg-surface-primary" />
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-16 text-center">
                  <p className="text-sm font-medium text-text-muted">
                    {totalRows === 0 ? 'No requirements yet' : 'No requirements match your search'}
                  </p>
                </td>
              </tr>
            ) : null}
            {rows.map((row) => {
              const isSelected = selectedRequirementId === row.id;
              const stickyRowSurface = reqTableRowSurface(isSelected);
              return (
                <tr
                  key={row.id}
                  data-keep-sidepanel="row"
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenRequirement(row)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenRequirement(row);
                    }
                  }}
                  className={`group cursor-pointer border-b border-border-default transition-colors ${stickyRowSurface}`}
                >
                  <td
                    className={`relative min-w-[280px] w-[320px] border-b border-border-default py-3 pl-6 pr-3 text-sm font-medium text-text-primary sticky left-0 z-[6] ${stickyRowSurface} ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                  >
                    {showLeftStickyEdge ? (
                      <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                    ) : null}
                    <TableFirstColumnContent aiSourced={isRequirementAiSourced(row.source)} className="break-words">
                      {row.name}
                    </TableFirstColumnContent>
                  </td>
                  <td className="border-b border-border-default bg-inherit px-3 py-3 text-sm">{row.category}</td>
                  <td className="border-b border-border-default bg-inherit px-3 py-3 text-sm">{row.stage ?? '—'}</td>
                  <td className="border-b border-border-default bg-inherit px-3 py-3 text-sm">{row.dueDate}</td>
                  <td className="border-b border-border-default bg-inherit px-3 py-3 text-sm">{row.followUpDate}</td>
                  <td className="border-b border-border-default bg-inherit px-3 py-3 text-sm">{row.source}</td>
                  <td className="max-w-[160px] border-b border-border-default bg-inherit px-3 py-3 text-sm">
                    <span className="block truncate text-[12px] text-text-secondary">{row.notes ?? '—'}</span>
                  </td>
                  <td className="border-b border-border-default bg-inherit px-3 py-3 text-sm" onClick={(e) => e.stopPropagation()}>
                    <a href={requirementExternalHref(caseId, row)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-mono text-[13px] font-medium text-brand-blue underline">
                      {requirementExternalCode(row)}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                    </a>
                  </td>
                  <td
                    className={`relative border-b border-border-default py-3 pl-2 pr-2 text-sm sticky right-[64px] z-[6] ${stickyRowSurface} ${showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                  >
                    {showRightStickyEdge ? (
                      <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                    ) : null}
                    <LozengeTag label={row.status} type={getRequirementStatusLozengeType(row.status, 'caseTable')} subtle />
                  </td>
                  <td className={`relative box-border min-h-12 w-[64px] min-w-[64px] max-w-[64px] border-b border-border-default p-0 align-middle sticky right-0 z-[7] ${stickyRowSurface}`}>
                    <span aria-hidden className={`pointer-events-none absolute inset-y-0 left-0 z-[7] h-full w-[calc(100%+3px)] ${stickyRowSurface}`} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
