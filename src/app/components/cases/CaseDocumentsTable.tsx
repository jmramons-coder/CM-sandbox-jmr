import {
  MODULE_TABLE_ROW_KEBAB_ENABLED,
} from '../../constants/moduleTableRowActions';
import type { CaseDocument } from '../../types';
import { formatStageSlugForDisplay } from '../../utils/caseStageLens';
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
import { ModuleTablePaginationFooter } from '../ModuleTablePaginationFooter';
import { DocumentMiniPreviewThumb } from '../DocumentMiniPreviewThumb';
import { LozengeTag } from '../LozengeTag';
import {
  DocumentSourceTag,
  MiniAiSourceBadge,
  TABLE_CELL_ALIGN_CLASS,
  TABLE_LINK_CLASS,
  TABLE_TEXT_CLASS,
  TableTruncatedLabel,
} from '../ModuleCellHelpers';

const DOC_TABLE_NAME_COL_WIDTH = 280;
const DOC_TABLE_ACTIONS_COL_WIDTH = 64;
const DOC_TABLE_ACTIONS_EFFECTIVE_WIDTH = MODULE_TABLE_ROW_KEBAB_ENABLED ? DOC_TABLE_ACTIONS_COL_WIDTH : 0;

const DOC_TABLE_MIN_WIDTH =
  DOC_TABLE_NAME_COL_WIDTH +
  200 +
  140 +
  120 +
  120 +
  120 +
  180 +
  DOC_TABLE_ACTIONS_EFFECTIVE_WIDTH;

function documentHasAiInsight(doc: Pick<CaseDocument, 'aiSummary' | 'insight' | 'aiAction' | 'aiInsight'>) {
  return Boolean(doc.aiInsight || doc.aiSummary || doc.insight || doc.aiAction);
}

function documentTableDescription(doc: Pick<CaseDocument, 'reqContext' | 'aiSummary' | 'insight'>): string {
  return doc.reqContext?.trim() || doc.aiSummary?.trim() || doc.insight?.trim() || '—';
}

type CaseDocumentsTableProps = {
  rows: CaseDocument[];
  totalRows: number;
  selectedDocumentName?: string;
  tableScroll: TableHorizontalScrollState;
  setScrollEl: (el: HTMLDivElement | null) => void;
  onOpenDocument: (row: CaseDocument) => void;
  onOpenRequirementTab?: () => void;
};

export function CaseDocumentsTable({
  rows,
  totalRows,
  selectedDocumentName,
  tableScroll,
  setScrollEl,
  onOpenDocument,
  onOpenRequirementTab,
}: CaseDocumentsTableProps) {
  const { showLeftStickyEdge } = tableScroll;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
      <div
        ref={setScrollEl}
        className={moduleTableScrollContainerClass(tableScroll.hasHorizontalOverflow, 'min-h-0 flex-1')}
      >
        <table className={MODULE_TABLE_LAYOUT_CLASS} style={{ minWidth: DOC_TABLE_MIN_WIDTH }}>
          <thead className={MODULE_TABLE_THEAD_CLASS}>
            <tr>
              <th
                className={`relative min-w-[280px] w-[280px] border-b border-border-default pl-6 pr-4 py-3 text-left align-middle text-sm font-medium text-text-secondary sticky left-0 ${MODULE_TABLE_TH_STICKY_EDGE_CLASS} ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
              >
                {showLeftStickyEdge ? (
                  <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                ) : null}
                Document
              </th>
              <th className={`min-w-[200px] ${MODULE_TABLE_TH_SCROLL_CLASS} pl-5 pr-2 py-3 text-left align-middle text-sm font-medium text-text-secondary`}>
                Description
              </th>
              <th className={`min-w-[140px] ${MODULE_TABLE_TH_SCROLL_CLASS} px-2 py-3 text-left text-sm font-medium text-text-secondary whitespace-nowrap`}>
                Insured
              </th>
              <th className={`${MODULE_TABLE_TH_SCROLL_CLASS} px-2 py-3 text-left text-sm font-medium text-text-secondary whitespace-nowrap`}>Stage</th>
              <th className={`${MODULE_TABLE_TH_SCROLL_CLASS} px-2 py-3 text-left text-sm font-medium text-text-secondary whitespace-nowrap`}>Uploaded</th>
              <th className={`${MODULE_TABLE_TH_SCROLL_CLASS} px-2 py-3 text-left text-sm font-medium text-text-secondary whitespace-nowrap`}>Source</th>
              <th className={`min-w-[180px] ${MODULE_TABLE_TH_SCROLL_CLASS} px-2 py-3 text-left text-sm font-medium text-text-secondary whitespace-nowrap`}>Linked Requirement</th>
              {MODULE_TABLE_ROW_KEBAB_ENABLED ? (
                <th className={`relative h-12 w-[64px] min-h-12 min-w-[64px] max-w-[64px] p-0 align-middle sticky right-0 ${MODULE_TABLE_TH_STICKY_EDGE_CLASS}`}>
                  <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-[9] h-full min-h-12 w-[calc(100%+3px)] border-b border-border-default bg-surface-primary" />
                  <span className="sr-only">Actions</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={MODULE_TABLE_ROW_KEBAB_ENABLED ? 8 : 7} className="px-6 py-16 text-center">
                  <p className="text-sm font-medium text-text-muted">
                    {totalRows === 0 ? 'No documents yet' : 'No documents match your search'}
                  </p>
                </td>
              </tr>
            ) : null}
            {rows.map((row) => {
              const selected = selectedDocumentName === row.name;
              const cellSurface = moduleTableRowSurface({ selected });
              return (
                <tr
                  key={row.id ?? row.name}
                  data-keep-sidepanel="row"
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenDocument(row)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenDocument(row);
                    }
                  }}
                  className={`${MODULE_TABLE_ROW_INTERACTIVE_CLASS} border-b border-border-default`}
                >
                  <td
                    className={`relative min-w-[280px] w-[280px] border-b border-border-default pl-6 pr-4 py-3 align-middle sticky left-0 z-[6] ${cellSurface} ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                  >
                    {showLeftStickyEdge ? (
                      <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                    ) : null}
                    <div className="flex min-w-0 max-w-full items-stretch gap-2.5">
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {documentHasAiInsight(row) ? <MiniAiSourceBadge /> : null}
                          <LozengeTag label={row.category} type="Neutral" subtle size="compact" />
                        </div>
                        <TableTruncatedLabel
                          text={row.name}
                          className="w-full max-w-full text-[13px] font-semibold text-text-primary"
                        />
                      </div>
                      <DocumentMiniPreviewThumb
                        documentId={row.id}
                        filename={row.filename ?? row.name}
                        fileUrl={row.fileUrl}
                        fileAvailable={row.fileAvailable}
                        className="ml-auto shrink-0"
                      />
                    </div>
                  </td>
                  <td className={`border-b border-border-default pl-5 pr-2 py-3 align-top ${TABLE_CELL_ALIGN_CLASS} ${cellSurface}`}>
                    <TableTruncatedLabel
                      text={documentTableDescription(row)}
                      className="text-[13px] text-text-secondary"
                    />
                  </td>
                  <td className={`border-b border-border-default px-2 py-3 align-top ${TABLE_TEXT_CLASS} ${cellSurface}`}>
                    {row.claimant ? (
                      <span className="font-medium text-text-primary">{row.claimant}</span>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className={`border-b border-border-default px-2 py-3 whitespace-nowrap ${TABLE_TEXT_CLASS} ${cellSurface}`}>
                    {row.stage ? (
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-text-secondary">
                        {formatStageSlugForDisplay(row.stage)}
                      </span>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className={`border-b border-border-default px-2 py-3 whitespace-nowrap ${TABLE_TEXT_CLASS} ${cellSurface}`}>
                    {row.uploaded || '—'}
                  </td>
                  <td className={`border-b border-border-default px-2 py-3 ${TABLE_CELL_ALIGN_CLASS} ${cellSurface}`}>
                    <DocumentSourceTag source={row.source} />
                  </td>
                  <td className={`border-b border-border-default px-2 py-3 align-top ${TABLE_CELL_ALIGN_CLASS} ${cellSurface}`} onClick={(e) => e.stopPropagation()}>
                    {row.linkedRequirement && row.linkedRequirement !== 'No linked requirement' ? (
                      <button
                        type="button"
                        onClick={() => onOpenRequirementTab?.()}
                        className={`text-left ${TABLE_LINK_CLASS}`}
                      >
                        {row.linkedRequirement}
                      </button>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
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
