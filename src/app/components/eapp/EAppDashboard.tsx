import { useMemo, useState } from 'react';
import { Plus, Clock, FileText, Send, Timer } from 'lucide-react';
import { useNavigate } from 'react-router';
import { MOCK_EAPPS, EAPP_KPIS, type EAppSummary, type EAppStatus } from '../../data/mock-eapp';
import { LozengeTag } from '../LozengeTag';
import {
  ModuleTableCard,
  ModuleTableCardScrollArea,
  ModuleTableCell,
  ModuleTableHeaderCell,
  ModuleTableShell,
} from '../ModuleTableScaffold';
import { ModuleTablePaginationFooter } from '../ModuleTablePaginationFooter';
import { ReorderIcon } from '../ReorderIcon';
import { SearchBar, StatCard } from '../ds';
import { UI_CLASS } from '../../constants/design-tokens';
import type { SortDirection } from '../../types';
import { EAppTemplateModal } from './EAppTemplateModal';
import { TABLE_LINK_CLASS } from '../ModuleCellHelpers';

const STATUS_LOZENGE: Record<EAppStatus, { label: string; type: 'Success' | 'Warning' | 'Alert' | 'Neutral' | 'Discovery' | 'Informative' }> = {
  Draft: { label: 'Draft', type: 'Neutral' },
  'In Progress': { label: 'In Progress', type: 'Informative' },
  'Under Review': { label: 'Under Review', type: 'Warning' },
  Submitted: { label: 'Submitted', type: 'Discovery' },
  Approved: { label: 'Approved', type: 'Success' },
  Declined: { label: 'Declined', type: 'Alert' },
};

const KPI_ICONS = [FileText, Clock, Send, Timer];

type EAppSortColumn =
  | 'id'
  | 'templateName'
  | 'applicantName'
  | 'status'
  | 'createdDate'
  | 'lastModified'
  | 'completionPct';

const COLUMNS: { key: EAppSortColumn; label: string; sortable: boolean; align?: 'left' | 'right'; minWidth?: string }[] = [
  { key: 'id', label: 'App ID', sortable: true, minWidth: 'min-w-[140px]' },
  { key: 'templateName', label: 'Template', sortable: true, minWidth: 'min-w-[220px]' },
  { key: 'applicantName', label: 'Applicant', sortable: true, minWidth: 'min-w-[180px]' },
  { key: 'status', label: 'Status', sortable: true, minWidth: 'min-w-[160px]' },
  { key: 'createdDate', label: 'Created', sortable: true, minWidth: 'min-w-[140px]' },
  { key: 'lastModified', label: 'Last modified', sortable: true, minWidth: 'min-w-[160px]' },
  { key: 'completionPct', label: 'Progress', sortable: true, minWidth: 'min-w-[180px]' },
];

function getSortValue(app: EAppSummary, column: EAppSortColumn): string | number {
  if (column === 'completionPct') return app.completionPct;
  return (app[column] ?? '').toString();
}

function compareApps(a: EAppSummary, b: EAppSummary, column: EAppSortColumn, direction: SortDirection) {
  const av = getSortValue(a, column);
  const bv = getSortValue(b, column);
  let comparison = 0;
  if (typeof av === 'number' && typeof bv === 'number') {
    comparison = av - bv;
  } else {
    comparison = String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
  }
  return direction === 'asc' ? comparison : -comparison;
}

export function EAppDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<EAppSortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const rows = MOCK_EAPPS.filter((app) => {
      const text = `${app.id} ${app.applicantName} ${app.templateName}`.toLowerCase();
      return !query || text.includes(query);
    });
    if (!sortColumn) return rows;
    return [...rows].sort((a, b) => compareApps(a, b, sortColumn, sortDirection));
  }, [searchQuery, sortColumn, sortDirection]);

  const handleSort = (column: EAppSortColumn) => {
    if (sortColumn === column) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortColumn(column);
    setSortDirection('asc');
  };

  return (
    <div className="min-h-full bg-surface-primary">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-6 pb-10 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-text-primary">Electronic applications</h1>
            <span className="rounded-full border border-[#b7bbc2] bg-surface-muted px-2 py-0.5 text-xs font-semibold text-text-secondary">
              {filtered.length} applications
            </span>
          </div>
          <button
            type="button"
            onClick={() => setTemplateModalOpen(true)}
            className={`flex items-center justify-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-xs font-bold uppercase leading-none tracking-[0.4px] text-white ${UI_CLASS.primaryActionShadow} transition-colors hover:bg-brand-blue-hover`}
          >
            <Plus className="h-4 w-4" />
            CREATE NEW EAPP
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {EAPP_KPIS.map((kpi, i) => (
            <StatCard
              key={i}
              icon={KPI_ICONS[i]}
              value={kpi.value}
              label={kpi.label}
              trendPositive={kpi.trendPositive}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, app ID, or template..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>

        <ModuleTableCard>
          <ModuleTableCardScrollArea>
            <ModuleTableShell minWidth="min-w-[1100px]">
              <thead className="bg-white">
                <tr>
                  {COLUMNS.map((column, index) => {
                    const firstColumnPadding = index === 0 ? 'pl-5 pr-2' : 'px-2';
                    return (
                      <ModuleTableHeaderCell
                        key={column.key}
                        className={`${column.minWidth} ${firstColumnPadding} pb-3 pt-5 text-[12px] font-normal text-text-secondary`}
                      >
                        {column.sortable ? (
                          <button
                            type="button"
                            onClick={() => handleSort(column.key)}
                            className="group inline-flex items-center gap-1 font-normal hover:text-brand-blue"
                          >
                            <span className="leading-[16px]">{column.label}</span>
                            <ReorderIcon isActive={sortColumn === column.key} />
                          </button>
                        ) : (
                          <span className="leading-[16px]">{column.label}</span>
                        )}
                      </ModuleTableHeaderCell>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="[&>tr:last-child>td]:border-b-0">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="px-4 py-10 text-center text-[13px] text-text-muted">
                      No applications match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((app) => {
                    const loz = STATUS_LOZENGE[app.status];
                    return (
                      <tr
                        key={app.id}
                        onClick={() => navigate(`/eapp/${app.id}`)}
                        className="group cursor-pointer transition-colors hover:bg-surface-hover"
                      >
                        <ModuleTableCell className="pl-5 pr-2 font-semibold">
                          <span className={TABLE_LINK_CLASS}>{app.id}</span>
                        </ModuleTableCell>
                        <ModuleTableCell>{app.templateName}</ModuleTableCell>
                        <ModuleTableCell>{app.applicantName}</ModuleTableCell>
                        <ModuleTableCell>
                          <LozengeTag label={loz.label} type={loz.type} subtle />
                        </ModuleTableCell>
                        <ModuleTableCell className="text-text-secondary">{app.createdDate}</ModuleTableCell>
                        <ModuleTableCell className="text-text-secondary">{app.lastModified}</ModuleTableCell>
                        <ModuleTableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#ececec]">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${app.completionPct}%`,
                                  backgroundColor:
                                    app.completionPct === 100
                                      ? '#008533'
                                      : app.completionPct > 50
                                        ? 'var(--brand-primary)'
                                        : '#a36d00',
                                }}
                              />
                            </div>
                            <span className="text-xs text-text-secondary">{app.completionPct}%</span>
                          </div>
                        </ModuleTableCell>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </ModuleTableShell>
          </ModuleTableCardScrollArea>

          {filtered.length > 0 ? (
            <ModuleTablePaginationFooter total={filtered.length} rangeEnd={filtered.length} />
          ) : null}
        </ModuleTableCard>
      </div>

      <EAppTemplateModal open={templateModalOpen} onOpenChange={setTemplateModalOpen} />
    </div>
  );
}
