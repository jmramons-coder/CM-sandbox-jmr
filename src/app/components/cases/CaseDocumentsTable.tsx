import { MoreVertical } from 'lucide-react';
import type { CaseDocument } from '../../types';
import type { TableHorizontalScrollState } from '../../hooks/useTableHorizontalScroll';
import {
  MODULE_TABLE_LAYOUT_CLASS,
  MODULE_TABLE_SUMMARY_COL_CLASS,
  moduleTableScrollContainerClass,
} from '../../utils/module-table-scroll';
import { deriveDocumentSummaryTitle, documentSummarySubtitle } from '../../utils/summaryText';
import { getStatusLozengeType } from '../../utils/status-display';
import { DocumentMiniPreviewThumb } from '../DocumentMiniPreviewThumb';
import { LozengeTag } from '../LozengeTag';
import {
  DocumentSourceTag,
  MiniAiSourceBadge,
  SummaryTableColumnHeader,
  TABLE_CELL_ALIGN_CLASS,
  TABLE_LINK_CLASS,
  TABLE_TEXT_CLASS,
  TableTruncatedLabel,
  TwoLineSummaryCell,
} from '../ModuleCellHelpers';

const DOC_TABLE_NAME_COL_WIDTH = 300;
const DOC_TABLE_ACTIONS_COL_WIDTH = 64;
const DOC_TABLE_DOCUMENT_COL_CLASS = 'pl-6 pr-4';
const DOC_TABLE_SUMMARY_COL_CLASS = 'pl-5 pr-2';

const DOC_TABLE_MIN_WIDTH =
  DOC_TABLE_NAME_COL_WIDTH +
  320 +
  120 +
  120 +
  120 +
  180 +
  120 +
  DOC_TABLE_ACTIONS_COL_WIDTH;

function documentHasAiInsight(doc: Pick<CaseDocument, 'aiSummary' | 'insight' | 'aiAction'>) {
  return Boolean(doc.aiSummary || doc.insight || doc.aiAction);
}

function docTableRowSurface(selected: boolean) {
  return selected
    ? 'bg-surface-selected-alt group-hover:bg-surface-selected-alt'
    : 'bg-white group-hover:bg-surface-hover';
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
  const { showLeftStickyEdge, showRightStickyEdge } = tableScroll;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden bg-white">
      <div
        ref={setScrollEl}
        className={moduleTableScrollContainerClass(tableScroll.hasHorizontalOverflow, 'flex-1')}
      >
        <table className={MODULE_TABLE_LAYOUT_CLASS} style={{ minWidth: DOC_TABLE_MIN_WIDTH }}>
          <thead className="sticky top-0 z-[1] bg-surface-primary">
            <tr>
              <th
                className={`relative min-w-[300px] w-[300px] border-b border-border-default bg-surface-primary ${DOC_TABLE_DOCUMENT_COL_CLASS} py-3 text-left align-middle text-sm font-medium text-text-secondary sticky left-0 z-[6] ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
              >
                {showLeftStickyEdge ? (
                  <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                ) : null}
                Document
              </th>
              <th className={`border-b border-border-default bg-surface-primary ${MODULE_TABLE_SUMMARY_COL_CLASS} ${DOC_TABLE_SUMMARY_COL_CLASS} py-3 text-left align-middle text-sm font-medium text-text-secondary`}>
                <SummaryTableColumnHeader className="text-sm font-medium text-text-secondary" />
              </th>
              <th className="border-b border-border-default bg-surface-primary px-2 py-3 text-left text-sm font-medium text-text-secondary whitespace-nowrap">Stage</th>
              <th className="border-b border-border-default bg-surface-primary px-2 py-3 text-left text-sm font-medium text-text-secondary whitespace-nowrap">Uploaded</th>
              <th className="border-b border-border-default bg-surface-primary px-2 py-3 text-left text-sm font-medium text-text-secondary whitespace-nowrap">Source</th>
              <th className="min-w-[180px] border-b border-border-default bg-surface-primary px-2 py-3 text-left text-sm font-medium text-text-secondary whitespace-nowrap">Linked Requirement</th>
              <th
                className={`relative border-b border-border-default bg-surface-primary py-3 pl-2 pr-2 text-left align-middle text-sm font-medium text-text-secondary sticky right-[64px] z-[6] ${showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
              >
                {showRightStickyEdge ? (
                  <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                ) : null}
                Status
              </th>
              <th className="relative h-12 w-[64px] min-h-12 min-w-[64px] max-w-[64px] bg-surface-primary p-0 align-middle sticky right-0 z-[7]">
                <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-[9] h-full min-h-12 w-[calc(100%+3px)] border-b border-border-default bg-surface-primary" />
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center">
                  <p className="text-sm font-medium text-text-muted">
                    {totalRows === 0 ? 'No documents yet' : 'No documents match your search'}
                  </p>
                </td>
              </tr>
            ) : null}
            {rows.map((row) => {
              const selected = selectedDocumentName === row.name;
              const stickyRowSurface = docTableRowSurface(selected);
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
                  className={`group cursor-pointer border-b border-border-default transition-colors ${stickyRowSurface}`}
                >
                  <td
                    className={`relative min-w-[300px] w-[300px] border-b border-border-default ${DOC_TABLE_DOCUMENT_COL_CLASS} py-3 align-middle sticky left-0 z-[6] ${stickyRowSurface} ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
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
                  <td className={`border-b border-border-default bg-inherit ${MODULE_TABLE_SUMMARY_COL_CLASS} ${DOC_TABLE_SUMMARY_COL_CLASS} py-3 align-top ${TABLE_CELL_ALIGN_CLASS}`}>
                    <TwoLineSummaryCell
                      title={deriveDocumentSummaryTitle(row.name, row.aiSummary ?? row.insight)}
                      summary={documentSummarySubtitle(row.name, row.aiSummary ?? row.insight)}
                    />
                  </td>
                  <td className={`border-b border-border-default bg-inherit px-2 py-3 whitespace-nowrap ${TABLE_TEXT_CLASS}`}>
                    {row.stage ? (
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-text-secondary">{row.stage}</span>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className={`border-b border-border-default bg-inherit px-2 py-3 whitespace-nowrap ${TABLE_TEXT_CLASS}`}>
                    {row.uploaded || '—'}
                  </td>
                  <td className={`border-b border-border-default bg-inherit px-2 py-3 ${TABLE_CELL_ALIGN_CLASS}`}>
                    <DocumentSourceTag source={row.source} />
                  </td>
                  <td className={`border-b border-border-default bg-inherit px-2 py-3 align-top ${TABLE_CELL_ALIGN_CLASS}`} onClick={(e) => e.stopPropagation()}>
                    {row.linkedRequirement ? (
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
                  <td
                    className={`relative border-b border-border-default py-3 pl-2 pr-2 align-top sticky right-[64px] z-[6] ${stickyRowSurface} ${showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                  >
                    {showRightStickyEdge ? (
                      <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                    ) : null}
                    <LozengeTag label={row.status} type={getStatusLozengeType(row.status, 'document')} subtle />
                  </td>
                  <td className={`relative box-border min-h-12 w-[64px] min-w-[64px] max-w-[64px] border-b border-border-default p-0 align-middle sticky right-0 z-[7] ${stickyRowSurface}`}>
                    <span aria-hidden className={`pointer-events-none absolute inset-y-0 left-0 z-[7] h-full w-[calc(100%+3px)] ${stickyRowSurface}`} />
                    <div className="relative z-10 flex h-full min-h-12 items-center justify-center px-1">
                      <MoreVertical className="h-4 w-4 text-text-secondary" />
                    </div>
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
