import { ExternalLink } from 'lucide-react';
import {
  MODULE_TABLE_ROW_KEBAB_ENABLED,
  moduleTableStatusStickyRightClass,
} from '../../constants/moduleTableRowActions';
import type { CaseRequirement } from '../../types';
import { formatStageSlugForDisplay } from '../../utils/caseStageLens';
import type { TableHorizontalScrollState } from '../../hooks/useTableHorizontalScroll';
import {
  MODULE_TABLE_LAYOUT_CLASS,
  MODULE_TABLE_ROW_INTERACTIVE_CLASS,
  MODULE_TABLE_TD_STICKY_EDGE_CLASS,
  MODULE_TABLE_TH_SCROLL_CLASS,
  MODULE_TABLE_TH_STICKY_EDGE_CLASS,
  MODULE_TABLE_THEAD_CLASS,
  moduleTableRowSurface,
  moduleTableScrollContainerClass,
} from '../../utils/module-table-scroll';
import { ModuleTablePaginationFooter } from '../ModuleTablePaginationFooter';
import { getRequirementStatusLozengeType } from '../../utils/status-display';
import { requirementExternalCode, requirementExternalHref } from '../../utils/caseViewRequirementUtils';
import { LozengeTag } from '../LozengeTag';
import { isRequirementAiSourced, TableFirstColumnContent } from '../ModuleCellHelpers';
import { requirementReceivedDateLabel } from '../../utils/requirement-dates';

const REQ_TABLE_MIN_WIDTH = 1360;

type CaseRequirementsTableProps = {
  caseId: string;
  rows: CaseRequirement[];
  totalRows: number;
  selectedRequirementId?: CaseRequirement['id'];
  tableScroll: TableHorizontalScrollState;
  setScrollEl: (el: HTMLDivElement | null) => void;
  onOpenRequirement: (row: CaseRequirement) => void;
  followUpDateColumnLabel?: string;
};

export function CaseRequirementsTable({
  caseId,
  rows,
  totalRows,
  selectedRequirementId,
  tableScroll,
  setScrollEl,
  onOpenRequirement,
  followUpDateColumnLabel = 'Follow-Up',
}: CaseRequirementsTableProps) {
  const { showLeftStickyEdge, showRightStickyEdge } = tableScroll;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
      <div
        ref={setScrollEl}
        className={moduleTableScrollContainerClass(tableScroll.hasHorizontalOverflow, 'min-h-0 flex-1')}
      >
        <table className={MODULE_TABLE_LAYOUT_CLASS} style={{ minWidth: REQ_TABLE_MIN_WIDTH }}>
          <thead className={MODULE_TABLE_THEAD_CLASS}>
            <tr>
              <th
                className={`relative min-w-[280px] w-[320px] border-b border-border-default pl-6 pr-3 py-2 text-left align-middle text-sm font-medium text-text-secondary sticky left-0 ${MODULE_TABLE_TH_STICKY_EDGE_CLASS} ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
              >
                <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-[0] h-full w-[calc(100%+3px)] bg-surface-primary" />
                <span className="relative z-[1]">Name</span>
              </th>
              <th className={`${MODULE_TABLE_TH_SCROLL_CLASS} px-3 py-2 text-left text-sm font-medium text-text-secondary whitespace-nowrap`}>Category</th>
              <th className={`${MODULE_TABLE_TH_SCROLL_CLASS} px-3 py-2 text-left text-sm font-medium text-text-secondary whitespace-nowrap`}>Stage</th>
              <th className={`${MODULE_TABLE_TH_SCROLL_CLASS} px-3 py-2 text-left text-sm font-medium text-text-secondary whitespace-nowrap`}>Due Date</th>
              <th className={`${MODULE_TABLE_TH_SCROLL_CLASS} px-3 py-2 text-left text-sm font-medium text-text-secondary whitespace-nowrap`}>{followUpDateColumnLabel}</th>
              <th className={`${MODULE_TABLE_TH_SCROLL_CLASS} px-3 py-2 text-left text-sm font-medium text-text-secondary whitespace-nowrap`}>Received</th>
              <th className={`max-w-[160px] ${MODULE_TABLE_TH_SCROLL_CLASS} px-3 py-2 text-left text-sm font-medium text-text-secondary whitespace-nowrap`}>Notes</th>
              <th className={`${MODULE_TABLE_TH_SCROLL_CLASS} px-3 py-2 text-left text-sm font-medium text-text-secondary whitespace-nowrap`}>External Source</th>
              <th
                className={`relative border-b border-border-default py-2 pl-2 pr-2 text-left align-middle text-sm font-medium text-text-secondary ${moduleTableStatusStickyRightClass(64)} ${MODULE_TABLE_TH_STICKY_EDGE_CLASS} ${showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
              >
                {showRightStickyEdge ? (
                  <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                ) : null}
                Status
              </th>
              {MODULE_TABLE_ROW_KEBAB_ENABLED ? (
                <th className={`relative h-10 w-[64px] min-h-10 min-w-[64px] max-w-[64px] p-0 align-middle sticky right-0 ${MODULE_TABLE_TH_STICKY_EDGE_CLASS}`}>
                  <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-[9] h-full min-h-10 w-[calc(100%+3px)] border-b border-border-default bg-surface-primary" />
                  <span className="sr-only">Actions</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={MODULE_TABLE_ROW_KEBAB_ENABLED ? 10 : 9} className="px-6 py-16 text-center">
                  <p className="text-sm font-medium text-text-muted">
                    {totalRows === 0 ? 'No requirements yet' : 'No requirements match your search'}
                  </p>
                </td>
              </tr>
            ) : null}
            {rows.map((row) => {
              const isSelected = selectedRequirementId === row.id;
              const cellSurface = moduleTableRowSurface({ selected: isSelected });
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
                  className={`${MODULE_TABLE_ROW_INTERACTIVE_CLASS} border-b border-border-default`}
                >
                  <td
                    className={`relative min-w-[280px] w-[320px] border-b border-border-default py-3 pl-6 pr-3 text-sm font-medium text-text-primary sticky left-0 z-[6] ${cellSurface} ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                  >
                    {showLeftStickyEdge ? (
                      <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                    ) : null}
                    <TableFirstColumnContent aiSourced={isRequirementAiSourced(row)} className="break-words">
                      {row.name}
                    </TableFirstColumnContent>
                  </td>
                  <td className={`border-b border-border-default px-3 py-3 text-sm ${cellSurface}`}>{row.category}</td>
                  <td className={`border-b border-border-default px-3 py-3 text-sm ${cellSurface}`}>
                    {row.stage ? formatStageSlugForDisplay(row.stage) : '—'}
                  </td>
                  <td className={`border-b border-border-default px-3 py-3 text-sm ${cellSurface}`}>{row.dueDate}</td>
                  <td className={`border-b border-border-default px-3 py-3 text-sm ${cellSurface}`}>{row.followUpDate}</td>
                  <td className={`border-b border-border-default px-3 py-3 text-sm whitespace-nowrap ${cellSurface}`}>
                    {requirementReceivedDateLabel(row)}
                  </td>
                  <td className={`max-w-[160px] border-b border-border-default px-3 py-3 text-sm ${cellSurface}`}>
                    <span className="block truncate text-[12px] text-text-secondary">{row.notes ?? '—'}</span>
                  </td>
                  <td className={`border-b border-border-default px-3 py-3 text-sm ${cellSurface}`} onClick={(e) => e.stopPropagation()}>
                    <a href={requirementExternalHref(caseId, row)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-mono text-[13px] font-medium text-brand-blue underline">
                      {requirementExternalCode(row)}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                    </a>
                  </td>
                  <td
                    className={`relative border-b border-border-default py-3 pl-2 pr-2 text-sm ${moduleTableStatusStickyRightClass(64)} z-[6] ${cellSurface} ${showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                  >
                    {showRightStickyEdge ? (
                      <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                    ) : null}
                    <LozengeTag label={row.status} type={getRequirementStatusLozengeType(row.status, 'caseTable')} subtle />
                  </td>
                  {MODULE_TABLE_ROW_KEBAB_ENABLED ? (
                    <td className={`relative box-border min-h-12 w-[64px] min-w-[64px] max-w-[64px] border-b border-border-default p-0 align-middle sticky right-0 z-[6] ${cellSurface}`}>
                      <span aria-hidden className={`pointer-events-none absolute inset-y-0 left-0 z-[7] h-full w-[calc(100%+3px)] ${cellSurface}`} />
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ModuleTablePaginationFooter total={totalRows} />
    </div>
  );
}
