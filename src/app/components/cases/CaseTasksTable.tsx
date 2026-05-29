import { ListChecks } from 'lucide-react';
import {
  MODULE_TABLE_ROW_KEBAB_ENABLED,
  moduleTableStatusStickyRightClass,
} from '../../constants/moduleTableRowActions';
import type { CaseOverview, Task } from '../../types';
import type { TableHorizontalScrollState } from '../../hooks/useTableHorizontalScroll';
import {
  MODULE_TABLE_LAYOUT_CLASS,
  MODULE_TABLE_ROW_INTERACTIVE_CLASS,
  MODULE_TABLE_TH_SCROLL_CLASS,
  MODULE_TABLE_TH_STICKY_EDGE_CLASS,
  MODULE_TABLE_THEAD_CLASS,
  moduleTableRowSurface,
  moduleTableScrollContainerClass,
} from '../../utils/module-table-scroll';
import { resolveTaskForCaseContextRow } from '../../utils/caseContextualTask';
import { getStatusLozengeType } from '../../utils/status-display';
import { PriorityChip } from '../ds';
import { LozengeTag } from '../LozengeTag';
import { ModuleTablePaginationFooter } from '../ModuleTablePaginationFooter';
import { SummaryTableColumnHeader, TaskTableFirstColumnCell } from '../ModuleCellHelpers';
import type { CaseContextTaskRow } from './CaseTabMobileCards';

const CASE_TASKS_TABLE_MIN_WIDTH = 1120;

type CaseTasksTableProps = {
  rows: CaseContextTaskRow[];
  totalRows: number;
  data: CaseOverview;
  selectedTaskId?: string;
  tableScroll: TableHorizontalScrollState;
  setScrollEl: (el: HTMLDivElement | null) => void;
  onOpenTask: (task: Task) => void;
};

export function CaseTasksTable({
  rows,
  totalRows,
  data,
  selectedTaskId,
  tableScroll,
  setScrollEl,
  onOpenTask,
}: CaseTasksTableProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
      <div
        ref={setScrollEl}
        className={moduleTableScrollContainerClass(tableScroll.hasHorizontalOverflow, 'min-h-0 flex-1')}
      >
        <table className={MODULE_TABLE_LAYOUT_CLASS} style={{ minWidth: CASE_TASKS_TABLE_MIN_WIDTH }}>
          <thead className={MODULE_TABLE_THEAD_CLASS}>
            <tr>
              <th
                className={`relative min-w-[220px] w-[240px] border-b border-border-default pl-6 pr-2 py-3 text-left align-middle text-sm font-medium text-text-secondary sticky left-0 ${MODULE_TABLE_TH_STICKY_EDGE_CLASS} ${tableScroll.showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
              >
                {tableScroll.showLeftStickyEdge ? (
                  <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                ) : null}
                Task
              </th>
              <th className={`${MODULE_TABLE_TH_SCROLL_CLASS} px-2 py-3 text-left align-middle whitespace-nowrap text-sm font-medium text-text-secondary`}>
                <SummaryTableColumnHeader className="text-sm font-medium text-text-secondary" />
              </th>
              <th className={`${MODULE_TABLE_TH_SCROLL_CLASS} px-2 py-3 text-left text-sm font-medium text-text-secondary whitespace-nowrap`}>Stage</th>
              <th className={`${MODULE_TABLE_TH_SCROLL_CLASS} px-2 py-3 text-left text-sm font-medium text-text-secondary whitespace-nowrap`}>Priority</th>
              <th className={`${MODULE_TABLE_TH_SCROLL_CLASS} px-2 py-3 text-left text-sm font-medium text-text-secondary whitespace-nowrap`}>Due Date</th>
              <th className={`${MODULE_TABLE_TH_SCROLL_CLASS} px-2 py-3 text-left text-sm font-medium text-text-secondary whitespace-nowrap`}>Assignee</th>
              <th
                className={`relative border-b border-border-default py-3 pl-2 pr-2 text-left align-middle text-sm font-medium text-text-secondary ${moduleTableStatusStickyRightClass(64)} ${MODULE_TABLE_TH_STICKY_EDGE_CLASS} ${tableScroll.showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
              >
                {tableScroll.showRightStickyEdge ? (
                  <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                ) : null}
                Status
              </th>
              {MODULE_TABLE_ROW_KEBAB_ENABLED ? (
                <th className={`relative h-12 w-[64px] min-h-12 min-w-[64px] max-w-[64px] p-0 align-middle sticky right-0 ${MODULE_TABLE_TH_STICKY_EDGE_CLASS}`}>
                  <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-[9] h-full min-h-12 w-[calc(100%+3px)] border-b border-border-default bg-surface-primary" />
                  <span className="sr-only">Actions</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={MODULE_TABLE_ROW_KEBAB_ENABLED ? 8 : 7} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <ListChecks className="h-8 w-8 text-[#dbdee1]" />
                    <p className="text-sm font-medium text-text-muted">
                      {totalRows === 0 ? 'No tasks yet' : 'No tasks match your search'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const resolved = row.task ?? resolveTaskForCaseContextRow(row, data);
              const selected = selectedTaskId === resolved.id;
              const cellSurface = moduleTableRowSurface({ selected });
              return (
                <tr
                  key={row.id}
                  data-keep-sidepanel="row"
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenTask(resolved)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenTask(resolved);
                    }
                  }}
                  className={`${MODULE_TABLE_ROW_INTERACTIVE_CLASS} border-b border-border-default`}
                >
                  <td
                    className={`relative min-w-[220px] w-[240px] border-b border-border-default pl-6 pr-2 py-3 align-middle sticky left-0 z-[6] ${cellSurface} ${tableScroll.showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                  >
                    {tableScroll.showLeftStickyEdge ? (
                      <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                    ) : null}
                    <TaskTableFirstColumnCell
                      taskId={resolved.taskId ?? row.id}
                      taskName={row.taskType}
                      aiSourced={Boolean(row.aiGenerated)}
                    />
                  </td>
                  <td className={`border-b border-border-default px-2 py-3 text-sm text-text-primary ${cellSurface}`}>
                    <span className="line-clamp-2">{row.task?.aiSummary ?? row.task?.description ?? '—'}</span>
                  </td>
                  <td className={`border-b border-border-default px-2 py-3 whitespace-nowrap text-sm text-text-primary ${cellSurface}`}>
                    {row.stage ? <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-text-secondary">{row.stage}</span> : <span className="text-text-muted">—</span>}
                  </td>
                  <td className={`border-b border-border-default px-2 py-3 whitespace-nowrap ${cellSurface}`}>
                    <PriorityChip priority={row.priority} />
                  </td>
                  <td className={`border-b border-border-default px-2 py-3 whitespace-nowrap text-sm text-text-primary ${cellSurface}`}>{row.dueDate}</td>
                  <td className={`border-b border-border-default px-2 py-3 whitespace-nowrap text-sm text-text-primary ${cellSurface}`}>{row.assignee}</td>
                  <td
                    className={`relative border-b border-border-default py-3 pl-2 pr-2 align-top text-sm ${moduleTableStatusStickyRightClass(64)} z-[6] ${cellSurface} ${tableScroll.showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                  >
                    {tableScroll.showRightStickyEdge ? (
                      <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                    ) : null}
                    <LozengeTag label={row.status} type={getStatusLozengeType(row.status, 'task')} subtle />
                  </td>
                  {MODULE_TABLE_ROW_KEBAB_ENABLED ? (
                    <td className={`relative box-border min-h-12 w-[64px] min-w-[64px] max-w-[64px] border-b border-border-default p-0 align-middle sticky right-0 z-[6] ${cellSurface}`}>
                      <span aria-hidden className={`pointer-events-none absolute inset-y-0 left-0 z-[7] h-full w-[calc(100%+3px)] ${cellSurface}`} />
                      <div className="relative z-10 flex h-full min-h-12 items-center justify-center px-1">
                        <span className="sr-only">Actions</span>
                      </div>
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
