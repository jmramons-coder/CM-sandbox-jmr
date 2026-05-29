import type { CSSProperties } from 'react';
import { MoreVertical } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import {
  MODULE_TABLE_ROW_KEBAB_ENABLED,
  moduleTableStatusStickyRightPx,
} from '../../constants/moduleTableRowActions';
import { LozengeTag, ReorderIcon } from '../index';
import { ModuleTableCheckboxColumnCell } from '../ModuleTableCheckboxColumn';
import {
  MODULE_TABLE_CHECKBOX_COL_WIDTH,
  MODULE_TABLE_FIRST_STICKY_COL_PADDING_CLASS,
  TABLE_CELL_ALIGN_CLASS,
  TABLE_SUBTEXT_CLASS,
  TABLE_TEXT_CLASS,
} from '../ModuleCellHelpers';
import type { UserDirectoryRow, UserSortableColumn } from '../../domain/access/platformUser';
import type { PlatformUserRole } from '../../domain/access/platformUser';
import {
  MODULE_TABLE_LAYOUT_CLASS,
  MODULE_TABLE_ROW_INTERACTIVE_CLASS,
  MODULE_TABLE_TH_SCROLL_CLASS,
  moduleTableRowSurface,
  moduleTableScrollContainerClass,
} from '../../utils/module-table-scroll';
import { VELOCITY_TREND_CLASS } from '../dashboard/dashboardWidgetUtils';
import { USER_INITIALS_AVATAR_CLASS } from './userAvatarStyles';

const USER_TABLE_NAME_COL_WIDTH = 240;
const USER_TABLE_SCROLL_COL_MIN = 112;
const USER_TABLE_CAPACITY_COL_WIDTH = 132;
const USER_TABLE_STATUS_COL_WIDTH = 120;
const USER_TABLE_ACTIONS_COL_WIDTH = 48;
const USER_TABLE_ACTIONS_EFFECTIVE_WIDTH = MODULE_TABLE_ROW_KEBAB_ENABLED ? USER_TABLE_ACTIONS_COL_WIDTH : 0;

export const USER_TABLE_MIN_WIDTH =
  MODULE_TABLE_CHECKBOX_COL_WIDTH +
  USER_TABLE_NAME_COL_WIDTH +
  USER_TABLE_SCROLL_COL_MIN * 6 +
  USER_TABLE_CAPACITY_COL_WIDTH +
  USER_TABLE_STATUS_COL_WIDTH +
  USER_TABLE_ACTIONS_EFFECTIVE_WIDTH;

const thStyle =
  "flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-medium justify-center leading-[0] text-text-primary text-[14px] whitespace-nowrap";
const fontVar: CSSProperties = { fontVariationSettings: "'wdth' 100" };

function roleLabel(role: PlatformUserRole): string {
  switch (role) {
    case 'senior_assessor':
      return 'Senior assessor';
    case 'team_lead':
      return 'Team lead';
    case 'operations_admin':
      return 'Admin';
    default:
      return role.charAt(0).toUpperCase() + role.slice(1);
  }
}

function slaLabel(health: UserDirectoryRow['workload']['slaHealth']): string {
  if (health === 'critical') return 'Critical';
  if (health === 'at_risk') return 'At risk';
  return 'OK';
}

function userStatusType(row: UserDirectoryRow) {
  if (row.blockedToday) return 'Warning' as const;
  if (row.trainingAlert) return 'Warning' as const;
  return 'Success' as const;
}

function userStatusLabel(row: UserDirectoryRow) {
  if (row.blockedToday) return 'Away';
  if (row.trainingAlert) return 'Training';
  return 'Active';
}

type UsersTableProps = {
  rows: UserDirectoryRow[];
  sortColumn: UserSortableColumn | null;
  onSort: (column: UserSortableColumn) => void;
  selectedUserId?: string;
  onSelectUser: (row: UserDirectoryRow) => void;
  tableRightSticky: boolean;
  setScrollEl: (el: HTMLDivElement | null) => void;
  showLeftStickyEdge: boolean;
  showRightStickyEdge: boolean;
  hasHorizontalOverflow: boolean;
};

export function UsersTable({
  rows,
  sortColumn,
  onSort,
  selectedUserId,
  onSelectUser,
  tableRightSticky,
  setScrollEl,
  showLeftStickyEdge,
  showRightStickyEdge,
  hasHorizontalOverflow,
}: UsersTableProps) {
  const scrollColumns: { key: UserSortableColumn; label: string; minWidth?: number }[] = [
    { key: 'role', label: 'Role' },
    { key: 'team', label: 'Team' },
    { key: 'openTasks', label: 'Open tasks' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'cases', label: 'Cases' },
    { key: 'sla', label: 'SLA' },
    { key: 'capacity', label: 'Capacity', minWidth: USER_TABLE_CAPACITY_COL_WIDTH },
  ];

  return (
    <div
      ref={setScrollEl}
      className={moduleTableScrollContainerClass(hasHorizontalOverflow, 'min-h-0 flex-1 bg-white')}
    >
      <table className={MODULE_TABLE_LAYOUT_CLASS} style={{ minWidth: USER_TABLE_MIN_WIDTH }}>
        <colgroup>
          <col style={{ width: MODULE_TABLE_CHECKBOX_COL_WIDTH }} />
          <col style={{ width: USER_TABLE_NAME_COL_WIDTH }} />
          {scrollColumns.map((col) => (
            <col key={col.key} style={{ width: col.minWidth ?? USER_TABLE_SCROLL_COL_MIN }} />
          ))}
          <col style={{ width: USER_TABLE_STATUS_COL_WIDTH }} />
          {MODULE_TABLE_ROW_KEBAB_ENABLED ? (
            <col style={{ width: USER_TABLE_ACTIONS_COL_WIDTH }} />
          ) : null}
        </colgroup>
        <thead className="sticky top-0 z-[30] bg-surface-primary">
          <tr>
            <ModuleTableCheckboxColumnCell as="th" className="z-[34] bg-surface-primary">
              <Checkbox className="size-4 rounded-[4px]" aria-label="Select all users" />
            </ModuleTableCheckboxColumnCell>
            <th
              className={`relative sticky top-0 z-[35] overflow-hidden border-b border-border-default bg-surface-primary py-3 text-left align-middle ${MODULE_TABLE_FIRST_STICKY_COL_PADDING_CLASS} pr-2 ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
              style={{
                left: MODULE_TABLE_CHECKBOX_COL_WIDTH,
                width: USER_TABLE_NAME_COL_WIDTH,
                minWidth: USER_TABLE_NAME_COL_WIDTH,
                maxWidth: USER_TABLE_NAME_COL_WIDTH,
              }}
            >
              {showLeftStickyEdge ? (
                <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
              ) : null}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 z-[0] h-full w-[calc(100%+3px)] bg-surface-primary"
              />
              <button
                type="button"
                onClick={() => onSort('name')}
                className="group relative z-[1] flex min-w-0 items-center gap-1 hover:text-brand-blue"
              >
                <div className={thStyle} style={fontVar}>
                  <p className="leading-[20px]">User</p>
                </div>
                <ReorderIcon isActive={sortColumn === 'name'} />
              </button>
            </th>
            {scrollColumns.map((col) => (
              <th
                key={col.key}
                className={`${MODULE_TABLE_TH_SCROLL_CLASS} px-2 py-3 text-left align-middle`}
                style={{ minWidth: col.minWidth ?? USER_TABLE_SCROLL_COL_MIN }}
              >
                <button
                  type="button"
                  onClick={() => onSort(col.key)}
                  className="group flex items-center gap-1 hover:text-brand-blue"
                >
                  <div className={thStyle} style={fontVar}>
                    <p className="leading-[20px]">{col.label}</p>
                  </div>
                  <ReorderIcon isActive={sortColumn === col.key} />
                </button>
              </th>
            ))}
            <th
              className={`relative border-b border-border-default bg-surface-primary px-2 py-3 text-left align-middle ${
                tableRightSticky ? `sticky top-0 z-[34] ${showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}` : 'sticky top-0 z-[30]'
              }`}
              style={{
                width: USER_TABLE_STATUS_COL_WIDTH,
                minWidth: USER_TABLE_STATUS_COL_WIDTH,
                ...(tableRightSticky ? { right: moduleTableStatusStickyRightPx(USER_TABLE_ACTIONS_COL_WIDTH) } : {}),
              }}
            >
              {tableRightSticky && showRightStickyEdge ? (
                <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
              ) : null}
              <button
                type="button"
                onClick={() => onSort('status')}
                className="group flex items-center gap-1 hover:text-brand-blue"
              >
                <div className={thStyle} style={fontVar}>
                  <p className="leading-[20px]">Status</p>
                </div>
                <ReorderIcon isActive={sortColumn === 'status'} />
              </button>
            </th>
            {MODULE_TABLE_ROW_KEBAB_ENABLED ? (
              <th
                className={`relative h-12 min-h-12 border-b border-border-default bg-surface-primary p-0 align-middle ${
                  tableRightSticky ? 'sticky top-0 right-0 z-[34] w-12 min-w-12 max-w-12' : 'w-12 min-w-12 max-w-12'
                }`}
                style={{
                  width: USER_TABLE_ACTIONS_COL_WIDTH,
                  minWidth: USER_TABLE_ACTIONS_COL_WIDTH,
                  maxWidth: USER_TABLE_ACTIONS_COL_WIDTH,
                }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 z-[9] h-full min-h-12 w-[calc(100%+3px)] bg-surface-primary"
                />
                <span className="sr-only">Actions</span>
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const selected = selectedUserId === row.id;
            const cellSurface = moduleTableRowSurface({ selected });
            const stickyRowSurface = selected
              ? 'bg-surface-selected-alt group-hover:bg-surface-selected-alt'
              : 'bg-white group-hover:bg-surface-hover';

            return (
              <tr
                key={row.id}
                data-keep-sidepanel="row"
                onClick={() => onSelectUser(row)}
                className={`${MODULE_TABLE_ROW_INTERACTIVE_CLASS} active:scale-[0.995]`}
              >
                <ModuleTableCheckboxColumnCell
                  as="td"
                  className="z-[14]"
                  surfaceClassName={cellSurface}
                  onClick={(event) => event.stopPropagation()}
                >
                  <Checkbox
                    className="size-4 rounded-[4px]"
                    onClick={(event) => event.stopPropagation()}
                    aria-label={`Select ${row.name}`}
                  />
                </ModuleTableCheckboxColumnCell>
                <td
                  className={`relative sticky z-[15] overflow-hidden border-b border-border-default py-3 ${MODULE_TABLE_FIRST_STICKY_COL_PADDING_CLASS} pr-2 ${TABLE_CELL_ALIGN_CLASS} ${cellSurface} ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                  style={{
                    left: MODULE_TABLE_CHECKBOX_COL_WIDTH,
                    width: USER_TABLE_NAME_COL_WIDTH,
                    minWidth: USER_TABLE_NAME_COL_WIDTH,
                    maxWidth: USER_TABLE_NAME_COL_WIDTH,
                  }}
                >
                  {showLeftStickyEdge ? (
                    <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                  ) : null}
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${USER_INITIALS_AVATAR_CLASS}`}
                    >
                      {row.initials}
                    </div>
                    <div className="min-w-0">
                      <p className={`truncate font-semibold ${TABLE_TEXT_CLASS}`}>{row.name}</p>
                      <p className={`truncate ${TABLE_SUBTEXT_CLASS}`}>{row.email}</p>
                    </div>
                  </div>
                </td>
                <td className={`border-b border-border-default px-2 py-3 whitespace-nowrap ${TABLE_TEXT_CLASS} ${cellSurface}`}>
                  {roleLabel(row.role)}
                </td>
                <td className={`border-b border-border-default px-2 py-3 ${TABLE_CELL_ALIGN_CLASS} ${cellSurface}`}>
                  <span className={`block max-w-[140px] truncate ${TABLE_TEXT_CLASS}`}>{row.teamLabels[0] ?? '—'}</span>
                </td>
                <td className={`border-b border-border-default px-2 py-3 whitespace-nowrap ${TABLE_TEXT_CLASS} ${cellSurface}`}>
                  {row.workload.openTasks}
                </td>
                <td className={`border-b border-border-default px-2 py-3 whitespace-nowrap ${cellSurface}`}>
                  <span className={row.workload.overdueTasks ? 'text-sm font-semibold text-brand-red' : TABLE_TEXT_CLASS}>
                    {row.workload.overdueTasks}
                  </span>
                </td>
                <td className={`border-b border-border-default px-2 py-3 whitespace-nowrap ${TABLE_TEXT_CLASS} ${cellSurface}`}>
                  {row.workload.activeCases}
                </td>
                <td className={`border-b border-border-default px-2 py-3 ${TABLE_CELL_ALIGN_CLASS} ${cellSurface}`}>
                  <LozengeTag
                    label={slaLabel(row.workload.slaHealth)}
                    type={
                      row.workload.slaHealth === 'critical'
                        ? 'Alert'
                        : row.workload.slaHealth === 'at_risk'
                          ? 'Warning'
                          : 'Success'
                    }
                    subtle
                  />
                </td>
                <td className={`border-b border-border-default px-2 py-3 ${TABLE_CELL_ALIGN_CLASS} ${cellSurface}`}>
                  <div className="flex min-w-[100px] items-center gap-2">
                    <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className={`h-full rounded-full ${row.workload.capacityPct > 100 ? 'bg-brand-orange' : 'bg-brand-blue'}`}
                        style={{ width: `${Math.min(100, row.workload.capacityPct)}%` }}
                      />
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${VELOCITY_TREND_CLASS[row.workload.trend] ?? ''}`}
                    >
                      {row.workload.capacityPct}%
                    </span>
                  </div>
                </td>
                <td
                  className={`relative border-b border-border-default px-2 py-3 ${TABLE_CELL_ALIGN_CLASS} ${
                    tableRightSticky
                      ? `sticky z-[14] ${stickyRowSurface} ${showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.12)]' : ''}`
                      : cellSurface
                  }`}
                  style={{
                    width: USER_TABLE_STATUS_COL_WIDTH,
                    minWidth: USER_TABLE_STATUS_COL_WIDTH,
                    ...(tableRightSticky ? { right: moduleTableStatusStickyRightPx(USER_TABLE_ACTIONS_COL_WIDTH) } : {}),
                  }}
                >
                  {tableRightSticky && showRightStickyEdge ? (
                    <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/80" />
                  ) : null}
                  {tableRightSticky ? (
                    <span
                      aria-hidden
                      className={`pointer-events-none absolute inset-y-0 left-0 z-[0] h-full w-[calc(100%+3px)] ${stickyRowSurface}`}
                    />
                  ) : null}
                  <div className={tableRightSticky ? 'relative z-[1]' : undefined}>
                    <LozengeTag label={userStatusLabel(row)} type={userStatusType(row)} subtle />
                  </div>
                </td>
                {MODULE_TABLE_ROW_KEBAB_ENABLED ? (
                <td
                  className={`relative box-border min-h-12 border-b border-border-default p-0 align-middle ${
                    tableRightSticky
                      ? `sticky right-0 z-[14] w-12 min-w-12 max-w-12 ${stickyRowSurface}`
                      : `w-12 min-w-12 max-w-12 ${cellSurface}`
                  }`}
                  onClick={(event) => event.stopPropagation()}
                >
                  {tableRightSticky ? (
                    <span
                      aria-hidden
                      className={`pointer-events-none absolute inset-y-0 left-0 z-[0] h-full w-[calc(100%+3px)] ${stickyRowSurface}`}
                    />
                  ) : null}
                  <div className="relative z-10 flex h-full w-full items-center justify-center">
                    <button
                      type="button"
                      className="text-text-secondary hover:text-text-primary"
                      aria-label={`More actions for ${row.name}`}
                    >
                      <MoreVertical className="size-4" />
                    </button>
                  </div>
                </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
