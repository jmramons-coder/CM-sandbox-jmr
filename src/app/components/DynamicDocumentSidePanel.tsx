import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { Briefcase, CalendarDays, Check, ChevronLeft, ChevronRight, ClipboardCheck, Database, FileText, Maximize2, UserRound, X, ZoomIn, ZoomOut } from 'lucide-react';
import { Link } from 'react-router';
import { formatDocumentFileInfo } from '../data/documentMetadata';
import { normalizeDocumentHighlight } from '../utils/document-evidence-highlights';
import { useViewportLayout } from '../hooks/useViewportLayout';
import { CollapsibleDetailSection } from './CollapsibleDetailSection';

export type DynamicDocumentPage = {
  number: number;
  image: string;
  label: string;
};

export type DynamicDocumentInsight = {
  id: string;
  marker: number;
  page: number;
  severity: string;
  title: string;
  quote: string;
  reasoning: string;
  impact: string;
  tone: 'warning' | 'danger';
  highlight: {
    top: string;
    left: string;
    width: string;
    height: string;
  };
};

export type DynamicDocumentAction = {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary';
};

export type DynamicDocumentData = {
  documentId: string;
  documentTitle: string;
  category: string;
  status: string;
  fileSize: string;
  fileType: string;
  caseId: string;
  caseReference: string;
  claimant: string;
  source: string;
  linkedRequirement: string;
  linkedRequirementHref: string;
  received: string;
  totalPages: number;
  pages: DynamicDocumentPage[];
  summary: {
    label: string;
    status: string;
    text: string;
    contextTitle?: string;
    contextText?: string;
  };
  evidence: DynamicDocumentInsight[];
  actions: DynamicDocumentAction[];
  scoringContext?: {
    caseId: string;
    evidenceId?: string;
    netScore: number;
    mappedDecision: string;
    suggestedAdjustments?: string[];
  };
};

type DynamicDocumentSidePanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: DynamicDocumentData;
  activeInsightId: string;
  onInsightChange: (id: string) => void;
  panelWidth: number;
  isResizing: boolean;
  onResizeStart: () => void;
  embedded?: boolean;
  hideHeader?: boolean;
};

export function DynamicDocumentSidePanel({
  open,
  onOpenChange,
  document,
  activeInsightId,
  onInsightChange,
  panelWidth,
  isResizing,
  onResizeStart,
  embedded = false,
  hideHeader = false,
}: DynamicDocumentSidePanelProps) {
  const defaultPageNumber = document.evidence.find((item) => item.id === activeInsightId)?.page ?? document.pages[0]?.number ?? 1;
  const [activePageNumber, setActivePageNumber] = useState(defaultPageNumber);
  const [documentZoom, setDocumentZoom] = useState(0.9);
  const [documentPan, setDocumentPan] = useState({ x: 0, y: 0 });
  const [isDocumentPanning, setIsDocumentPanning] = useState(false);
  const [isAnchorNavigating, setIsAnchorNavigating] = useState(false);
  const [pendingAnchorId, setPendingAnchorId] = useState<string | null>(null);
  const [isRendered, setIsRendered] = useState(open);
  const [isClosing, setIsClosing] = useState(false);
  const { isCompactShell } = useViewportLayout();
  const documentDragRef = useRef<{ pointerId: number; startX: number; startY: number; panX: number; panY: number } | null>(null);
  const documentPanRef = useRef(documentPan);
  const documentPanFrameRef = useRef<number | null>(null);
  const anchorNavigationTimerRef = useRef<number | null>(null);
  const closeAnimationTimerRef = useRef<number | null>(null);
  const connectorRootRef = useRef<HTMLDivElement | null>(null);
  const activeHighlightRef = useRef<HTMLButtonElement | null>(null);
  const activeInsightRef = useRef<HTMLButtonElement | null>(null);
  const [connectorPath, setConnectorPath] = useState<{ d: string; endX: number; endY: number } | null>(null);

  const activePageIndex = document.pages.findIndex((page) => page.number === activePageNumber);
  const activePage = document.pages[activePageIndex] ?? document.pages[0];
  const hasPreviousPage = activePageIndex > 0;
  const hasNextPage = activePageIndex >= 0 && activePageIndex < document.pages.length - 1;
  const visibleEvidence = document.evidence.filter((item) => item.page === activePage?.number);

  const clampDocumentPan = (pan: { x: number; y: number }, zoom = documentZoom) => {
    const maxX = 112 + 380 * Math.max(0, zoom - 1);
    const maxY = 210 + 540 * Math.max(0, zoom - 1);
    return {
      x: Math.max(-maxX, Math.min(maxX, pan.x)),
      y: Math.max(-maxY, Math.min(maxY, pan.y)),
    };
  };

  const applyDocumentZoom = (nextZoom: number, focalPoint?: { x: number; y: number }) => {
    const clampedZoom = Math.max(0.75, Math.min(2.5, Number(nextZoom.toFixed(2))));
    const previousZoom = documentZoom;
    setDocumentZoom(clampedZoom);
    setDocumentPan((current) => {
      const basePan = documentPanRef.current ?? current;
      const nextPan = focalPoint && previousZoom > 0
        ? clampDocumentPan({
            x: focalPoint.x - (clampedZoom / previousZoom) * (focalPoint.x - basePan.x),
            y: focalPoint.y - (clampedZoom / previousZoom) * (focalPoint.y - basePan.y),
          }, clampedZoom)
        : clampDocumentPan(current, clampedZoom);
      documentPanRef.current = nextPan;
      return nextPan;
    });
  };

  const zoomOut = () => applyDocumentZoom(documentZoom - 0.25);
  const zoomIn = () => applyDocumentZoom(documentZoom + 0.25);

  const resetDocumentView = () => {
    setDocumentZoom(0.9);
    documentPanRef.current = { x: 0, y: 0 };
    setDocumentPan({ x: 0, y: 0 });
  };

  const handleDocumentWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    applyDocumentZoom(documentZoom + (event.deltaY > 0 ? -0.1 : 0.1), {
      x: event.clientX - rect.left - rect.width / 2,
      y: event.clientY - rect.top - rect.height / 2,
    });
  };

  const updateDocumentPan = (pan: { x: number; y: number }) => {
    documentPanRef.current = clampDocumentPan(pan);
    if (documentPanFrameRef.current !== null) return;
    documentPanFrameRef.current = window.requestAnimationFrame(() => {
      documentPanFrameRef.current = null;
      setDocumentPan(documentPanRef.current);
    });
  };

  const startDocumentPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    documentDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      panX: documentPanRef.current.x,
      panY: documentPanRef.current.y,
    };
    setIsDocumentPanning(true);
  };

  const moveDocumentPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = documentDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    updateDocumentPan({
      x: drag.panX + event.clientX - drag.startX,
      y: drag.panY + event.clientY - drag.startY,
    });
  };

  const stopDocumentPan = (event?: ReactPointerEvent<HTMLDivElement>) => {
    if (event && documentDragRef.current?.pointerId === event.pointerId && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    documentDragRef.current = null;
    setIsDocumentPanning(false);
  };

  const selectInsight = (insight: DynamicDocumentInsight) => {
    setDocumentZoom(0.9);
    setPendingAnchorId(insight.id);
    setActivePageNumber(insight.page);
    onInsightChange(insight.id);
  };

  useEffect(() => {
    if (!open) {
      setMobilePreviewOpen(false);
      return;
    }
    const firstInsight = document.evidence[0];
    if (!firstInsight) return;
    setDocumentZoom(0.9);
    setPendingAnchorId(firstInsight.id);
    setActivePageNumber(firstInsight.page);
    onInsightChange(firstInsight.id);
  }, [open]);

  const updateConnectorPath = () => {
    const root = connectorRootRef.current;
    const highlight = activeHighlightRef.current;
    const insight = activeInsightRef.current;
    if (!root || !highlight || !insight) {
      setConnectorPath(null);
      return;
    }

    const rootRect = root.getBoundingClientRect();
    const highlightRect = highlight.getBoundingClientRect();
    const insightRect = insight.getBoundingClientRect();
    const startX = highlightRect.right - rootRect.left;
    const startY = highlightRect.top + highlightRect.height / 2 - rootRect.top;
    const endX = insightRect.left - rootRect.left;
    const endY = insightRect.top + insightRect.height / 2 - rootRect.top;

    if (endX <= startX + 24) {
      setConnectorPath(null);
      return;
    }

    const bend = Math.min(160, Math.max(72, (endX - startX) * 0.32));
    setConnectorPath({
      d: `M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`,
      endX,
      endY,
    });
  };

  useEffect(() => {
    const pendingAnchor = pendingAnchorId
      ? document.evidence.find((item) => item.id === pendingAnchorId)
      : null;
    if (pendingAnchor && pendingAnchor.page === activePageNumber) {
      const left = Number.parseFloat(pendingAnchor.highlight.left) / 100;
      const top = Number.parseFloat(pendingAnchor.highlight.top) / 100;
      const width = Number.parseFloat(pendingAnchor.highlight.width) / 100;
      const height = Number.parseFloat(pendingAnchor.highlight.height) / 100;
      const anchorCenter = {
        x: left + width / 2,
        y: top + height / 2,
      };
      const targetZoom = 0.9;
      const nextPan = clampDocumentPan({
        x: (0.5 - anchorCenter.x) * 684 * targetZoom,
        y: (0.5 - anchorCenter.y) * 1024 * targetZoom,
      }, targetZoom);
      setDocumentZoom(targetZoom);
      documentPanRef.current = nextPan;
      setIsAnchorNavigating(true);
      setDocumentPan(nextPan);
      setPendingAnchorId(null);
      if (anchorNavigationTimerRef.current !== null) {
        window.clearTimeout(anchorNavigationTimerRef.current);
      }
      anchorNavigationTimerRef.current = window.setTimeout(() => {
        setIsAnchorNavigating(false);
        anchorNavigationTimerRef.current = null;
      }, 360);
      return;
    }
    documentPanRef.current = { x: 0, y: 0 };
    setDocumentPan({ x: 0, y: 0 });
  }, [activePageNumber, document.evidence, documentZoom, pendingAnchorId]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateConnectorPath);
    window.addEventListener('resize', updateConnectorPath);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateConnectorPath);
    };
  }, [activeInsightId, activePageNumber, documentPan, documentZoom, isAnchorNavigating]);

  useEffect(() => {
    if (open) {
      if (closeAnimationTimerRef.current !== null) {
        window.clearTimeout(closeAnimationTimerRef.current);
        closeAnimationTimerRef.current = null;
      }
      setIsRendered(true);
      setIsClosing(false);
      return;
    }
    if (!isRendered) return;
    setIsClosing(true);
    closeAnimationTimerRef.current = window.setTimeout(() => {
      setIsRendered(false);
      setIsClosing(false);
      closeAnimationTimerRef.current = null;
    }, 180);
  }, [isRendered, open]);

  useEffect(() => {
    return () => {
      if (documentPanFrameRef.current !== null) {
        window.cancelAnimationFrame(documentPanFrameRef.current);
      }
      if (anchorNavigationTimerRef.current !== null) {
        window.clearTimeout(anchorNavigationTimerRef.current);
      }
      if (closeAnimationTimerRef.current !== null) {
        window.clearTimeout(closeAnimationTimerRef.current);
      }
    };
  }, []);

  if (!isRendered || !activePage) return null;
  const isCompactPanel = panelWidth < 760;
  const isMobileDocLayout = isCompactShell || isCompactPanel;
  const insightColumnWidth = isCompactPanel ? 240 : 320;

  const panelContent = (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {!hideHeader ? (
        <DynamicDocumentHeader
          document={document}
          mobileLayout={isMobileDocLayout}
          onClose={embedded ? undefined : () => onOpenChange(false)}
        />
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col bg-surface-primary">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {isMobileDocLayout ? (
              <DocumentMobileLayout
                actions={document.actions}
                activeHighlightRef={activeHighlightRef}
                activeInsightId={activeInsightId}
                activeInsightRef={activeInsightRef}
                activePage={activePage}
                activePageIndex={activePageIndex}
                activePageNumber={activePage.number}
                document={document}
                documentPan={documentPan}
                documentZoom={documentZoom}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                isAnchorNavigating={isAnchorNavigating}
                isDocumentPanning={isDocumentPanning}
                onInsightChange={onInsightChange}
                onInsightSelect={selectInsight}
                onNextPage={() => setActivePageNumber(document.pages[activePageIndex + 1].number)}
                onPreviousPage={() => setActivePageNumber(document.pages[activePageIndex - 1].number)}
                onPointerCancel={stopDocumentPan}
                onPointerDown={startDocumentPan}
                onPointerMove={moveDocumentPan}
                onPointerUp={stopDocumentPan}
                onReset={resetDocumentView}
                onWheel={handleDocumentWheel}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onPageChange={setActivePageNumber}
                scoringContext={document.scoringContext}
                visibleEvidence={visibleEvidence}
              />
            ) : (
            <div
              ref={connectorRootRef}
              className="relative grid min-h-0 flex-1 bg-white"
              style={{ gridTemplateColumns: `minmax(0, 1fr) ${insightColumnWidth}px` }}
            >
              <DocumentCanvas
                activePage={activePage}
                activePageIndex={activePageIndex}
                activePageNumber={activePage.number}
                activeHighlightRef={activeHighlightRef}
                activeInsightId={activeInsightId}
                document={document}
                documentPan={documentPan}
                documentZoom={documentZoom}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                isAnchorNavigating={isAnchorNavigating}
                isDocumentPanning={isDocumentPanning}
                onInsightChange={onInsightChange}
                onNextPage={() => setActivePageNumber(document.pages[activePageIndex + 1].number)}
                onPreviousPage={() => setActivePageNumber(document.pages[activePageIndex - 1].number)}
                onPointerCancel={stopDocumentPan}
                onPointerDown={startDocumentPan}
                onPointerMove={moveDocumentPan}
                onPointerUp={stopDocumentPan}
                onReset={resetDocumentView}
                onWheel={handleDocumentWheel}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onPageChange={setActivePageNumber}
                visibleEvidence={visibleEvidence}
              />

              <DocumentInsightPanel
                actions={document.actions}
                activeInsightId={activeInsightId}
                activeInsightRef={activeInsightRef}
                document={document}
                onInsightSelect={selectInsight}
                onScroll={updateConnectorPath}
              />
              {connectorPath ? (
                <svg className="pointer-events-none absolute inset-0 z-30 overflow-visible" aria-hidden>
                  <path
                    d={connectorPath.d}
                    fill="none"
                    stroke="#f5a200"
                    strokeLinecap="round"
                    strokeWidth="1.5"
                    opacity="0.7"
                  />
                  <circle cx={connectorPath.endX} cy={connectorPath.endY} r="2.5" fill="#f5a200" opacity="0.75" />
                </svg>
              ) : null}
            </div>
            )}
            {!isMobileDocLayout && document.scoringContext ? (
              <div className="mt-3 rounded-[6px] border border-brand-blue/25 bg-surface-selected p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.35px] text-brand-blue">Scoring impact</p>
                    <p className="mt-1 text-[13px] font-semibold text-text-primary">Net +{document.scoringContext.netScore} · {document.scoringContext.mappedDecision}</p>
                  </div>
                  <Link to={`/cases/${document.scoringContext.caseId}#tab=scoring`} className="shrink-0 rounded-full border border-brand-blue bg-white px-2 py-1 text-[10px] font-semibold text-brand-blue hover:bg-surface-selected">
                    Open
                  </Link>
                </div>
                {document.scoringContext.suggestedAdjustments?.length ? (
                  <ul className="mt-2 space-y-1 text-[11px] text-text-secondary">
                    {document.scoringContext.suggestedAdjustments.slice(0, 3).map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-[6px] size-1 rounded-full bg-brand-blue" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  if (embedded) return panelContent;

  return createPortal(
    <>
    <div
      className="fixed inset-0 z-[180] bg-transparent"
      onMouseDown={() => onOpenChange(false)}
      aria-hidden
    />
    <aside
      role="dialog"
      aria-modal="false"
      aria-label="Evidence preview"
      className="fixed right-0 z-[190] flex flex-col overflow-visible border-l border-t border-border-default bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.08)]"
      style={{
        width: panelWidth,
        top: '48px',
        height: 'calc(100dvh - 48px)',
        transition: isResizing ? 'none' : 'width 0.16s ease',
        animation: isResizing ? undefined : isClosing ? 'dynamicDocPanelOut 180ms ease-in forwards' : 'dynamicDocPanelIn 180ms ease-out',
      }}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div
        className="group absolute bottom-0 left-0 top-0 z-20 w-2.5 -translate-x-1/2 cursor-col-resize bg-transparent"
        onMouseDown={onResizeStart}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize evidence preview panel"
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 transition-colors ${
            isResizing ? 'bg-brand-blue' : 'bg-transparent group-hover:bg-brand-blue'
          }`}
        />
        <span
          aria-hidden
          className={`pointer-events-none absolute left-1/2 top-1/2 flex h-9 w-2 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-colors ${
            isResizing ? 'border-brand-blue' : 'border-border-default group-hover:border-brand-blue'
          }`}
        />
      </div>

      {panelContent}
    </aside>
    </>,
    globalThis.document.body,
  );
}

function DynamicDocumentHeader({
  document,
  mobileLayout = false,
  onClose,
}: {
  document: DynamicDocumentData;
  mobileLayout?: boolean;
  onClose?: () => void;
}) {
  return (
    <div className={`shrink-0 border-b border-border-default bg-white ${mobileLayout ? 'px-4 py-3' : 'px-6 py-4'}`}>
      <div className="relative rounded-t-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-[4px] border border-border-soft bg-surface-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2px] text-text-secondary">
                  {document.category}
                </span>
                <span className="inline-flex items-center gap-1 rounded-[4px] border border-brand-green/35 bg-[#e5f5ea] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2px] text-brand-green">
                  <Check className="size-3.5" />
                  {document.status}
                </span>
              </div>
              <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-2">
                <FileText className="mt-[3px] size-4 shrink-0 self-start text-text-heading" />
                <p className="truncate text-[18px] font-semibold text-text-primary">{document.documentTitle}</p>
                <span className="text-[12px] font-semibold text-text-muted">{formatDocumentFileInfo(document.fileType, document.fileSize)}</span>
              </div>
            </div>
          </div>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-muted"
            aria-label="Close document"
          >
            <X className="size-5" />
          </button>
        ) : null}
      </div>
      <dl
        className={
          mobileLayout
            ? 'mt-3 grid grid-cols-2 divide-x divide-y divide-border-soft overflow-hidden rounded-lg border border-border-soft bg-[#fbfcfd] text-[12px]'
            : 'mt-3 ml-6 grid w-[calc(100%-1.5rem)] overflow-hidden rounded-lg border border-border-soft bg-[#fbfcfd] text-[12px] sm:grid-cols-5'
        }
      >
        <MetaItem mobileGrid={mobileLayout} icon={<ClipboardCheck className="size-3.5" />} label="Requirement" value={<Link to={document.linkedRequirementHref || '/cases'} data-keep-sidepanel="link" className="text-brand-blue underline underline-offset-2 hover:text-brand-blue-hover">{document.linkedRequirement}</Link>} />
        <MetaItem mobileGrid={mobileLayout} icon={<Briefcase className="size-3.5" />} label="Case" value={<Link to={`/cases/${document.caseId}#tab=requirements`} data-keep-sidepanel="link" className="text-brand-blue underline underline-offset-2 hover:text-brand-blue-hover">{document.caseId}</Link>} />
        <MetaItem mobileGrid={mobileLayout} icon={<CalendarDays className="size-3.5" />} label="Uploaded" value={document.received} />
        <MetaItem mobileGrid={mobileLayout} icon={<Database className="size-3.5" />} label="Source" value={document.source} />
        <MetaItem mobileGrid={mobileLayout} icon={<UserRound className="size-3.5" />} label="Claimant" value={<Link to={`/cases/${document.caseId}`} data-keep-sidepanel="link" className="text-brand-blue underline underline-offset-2 hover:text-brand-blue-hover">{document.claimant}</Link>} />
        {mobileLayout ? (
          <MetaItem mobileGrid icon={<FileText className="size-3.5" />} label="Pages" value={`${document.totalPages} page${document.totalPages === 1 ? '' : 's'}`} />
        ) : null}
      </dl>
      </div>
    </div>
  );
}

function MetaItem({
  icon,
  label,
  mobileGrid = false,
  value,
}: {
  icon: ReactNode;
  label: string;
  mobileGrid?: boolean;
  value: ReactNode;
}) {
  return (
    <div
      className={
        mobileGrid
          ? 'min-w-0 px-3 py-2.5'
          : 'min-w-0 border-b border-border-soft px-3 py-2 sm:border-b-0 sm:border-r sm:last:border-r-0'
      }
    >
      <dt className="flex items-center gap-1.5 text-[11px] text-text-muted">
        <span className="text-text-muted">{icon}</span>
        {label}
      </dt>
      <dd className={`mt-0.5 font-semibold text-text-primary ${mobileGrid ? 'break-words leading-snug' : 'truncate'}`}>{value}</dd>
    </div>
  );
}

function DocumentFileUnavailableState({
  compact = false,
  document,
}: {
  compact?: boolean;
  document: DynamicDocumentData;
}) {
  return (
    <div className={`flex h-full w-full flex-col items-center justify-center bg-[#fbfcfd] p-6 text-center ${compact ? 'min-h-[280px]' : ''}`}>
      <FileText className="size-8 text-text-muted" />
      <p className="mt-3 text-sm font-semibold text-text-primary">File not available</p>
      <p className="mt-1 max-w-xs text-xs leading-relaxed text-text-secondary">
        {document.summary.text || 'The dataset includes this document record, but the actual file has not been provided yet.'}
      </p>
    </div>
  );
}

function DocumentCanvas({
  activePage,
  activePageIndex,
  activePageNumber,
  activeHighlightRef,
  activeInsightId,
  document,
  documentPan,
  documentZoom,
  hasNextPage,
  hasPreviousPage,
  isAnchorNavigating,
  isDocumentPanning,
  onInsightChange,
  onNextPage,
  onPointerCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPreviousPage,
  onReset,
  onWheel,
  onZoomIn,
  onZoomOut,
  mobilePreview = false,
  onPageChange,
  visibleEvidence,
}: {
  activePage: DynamicDocumentPage;
  mobilePreview?: boolean;
  activePageIndex: number;
  activePageNumber: number;
  activeHighlightRef: RefObject<HTMLButtonElement | null>;
  activeInsightId: string;
  document: DynamicDocumentData;
  documentPan: { x: number; y: number };
  documentZoom: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isAnchorNavigating: boolean;
  isDocumentPanning: boolean;
  onInsightChange: (id: string) => void;
  onNextPage: () => void;
  onPointerCancel: (event?: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event?: ReactPointerEvent<HTMLDivElement>) => void;
  onPreviousPage: () => void;
  onReset: () => void;
  onWheel: (event: ReactWheelEvent<HTMLDivElement>) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPageChange: (pageNumber: number) => void;
  visibleEvidence: DynamicDocumentInsight[];
}) {
  return (
    <div className={`relative z-10 min-h-0 overflow-visible bg-white ${mobilePreview ? 'h-full' : ''}`}>
      <div
        className={`relative flex h-full min-h-0 items-center justify-center overflow-hidden bg-[#dfe3e8] ${
          mobilePreview ? 'min-h-[min(52vh,480px)] px-3 py-6' : 'px-4 py-20'
        } ${isDocumentPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onLostPointerCapture={() => onPointerCancel()}
      >
        <DocumentToolbar
          activePage={activePage}
          document={document}
          documentZoom={documentZoom}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onNextPage={onNextPage}
          onPreviousPage={onPreviousPage}
          onReset={onReset}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
        />

        <div
          className={`relative shrink-0 bg-white shadow-[0_1px_2px_rgba(27,28,30,0.08)] will-change-transform ${
            mobilePreview ? 'h-[min(420px,50vh)] w-[min(280px,72vw)]' : 'h-[660px] w-[440px]'
          }`}
          style={{
            transform: activePage.image?.trim()
              ? `matrix(${documentZoom}, 0, 0, ${documentZoom}, ${documentPan.x}, ${documentPan.y})`
              : undefined,
            transformOrigin: 'center center',
            transition: isDocumentPanning ? 'none' : isAnchorNavigating ? 'transform 0.34s cubic-bezier(0.22, 1, 0.36, 1)' : 'transform 0.12s ease',
          }}
        >
          {activePage.image?.trim() ? (
          <img
            src={activePage.image}
            alt={`${document.documentTitle}, page ${activePage.number}: ${activePage.label}`}
            className="block h-full w-full select-none object-fill"
            draggable={false}
          />
          ) : (
            <DocumentFileUnavailableState document={document} compact={mobilePreview} />
          )}
          {visibleEvidence.map((item) => {
            const isActive = activeInsightId === item.id;
            return (
              <button
                ref={isActive ? activeHighlightRef : undefined}
                key={item.id}
                type="button"
                onClick={() => onInsightChange(item.id)}
                onMouseDown={(event) => event.stopPropagation()}
                onPointerDown={(event) => event.stopPropagation()}
                className={`group absolute z-10 rounded-[3px] border-0 bg-brand-blue/[0.11] transition-colors hover:bg-brand-blue/[0.15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5a200]/35 ${
                  isActive ? '!z-20 !bg-[#f5a200]/24 outline outline-1 outline-[#f5a200]/40 shadow-[0_0_0_4px_rgba(245,162,0,0.10)]' : ''
                }`}
                style={normalizeDocumentHighlight(item.highlight)}
                aria-label={`${item.severity} flag: ${item.title}`}
              >
                {isActive ? (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[3px] ring-1 ring-inset ring-[#f5a200]/30"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
        <DocumentPageRail
          activePageNumber={activePageNumber}
          pages={document.pages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}

function DocumentToolbar({
  activePage,
  document,
  documentZoom,
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
  onReset,
  onZoomIn,
  onZoomOut,
}: {
  activePage: DynamicDocumentPage;
  document: DynamicDocumentData;
  documentZoom: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-2 top-3 z-20 flex justify-center">
      <div
        className="pointer-events-auto flex max-w-[calc(100%-0.5rem)] flex-col items-center gap-1 rounded-[26px] border border-border-default bg-white/95 px-2.5 py-2 text-[12px] font-semibold text-text-secondary shadow-sm backdrop-blur"
        onMouseDown={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        onWheel={(event) => event.stopPropagation()}
      >
        <div className="flex min-w-0 items-center justify-center gap-1">
          <ToolbarButton disabled={!hasPreviousPage} label="Previous available page" onClick={onPreviousPage}>
            <ChevronLeft className="size-3.5" />
          </ToolbarButton>
          <span className="min-w-0 truncate px-1 text-center">Page {activePage.number} of {document.totalPages}</span>
          <ToolbarButton disabled={!hasNextPage} label="Next available page" onClick={onNextPage}>
            <ChevronRight className="size-3.5" />
          </ToolbarButton>
        </div>
        <div className="flex min-w-0 items-center justify-center gap-1 border-t border-border-soft pt-1">
          <ToolbarButton disabled={documentZoom <= 0.75} label="Zoom out" onClick={onZoomOut}>
            <ZoomOut className="size-3.5" />
          </ToolbarButton>
          <button
            type="button"
            onClick={onReset}
            className="min-w-10 rounded-full px-1.5 py-1 text-center transition-colors hover:bg-surface-muted"
            aria-label="Reset document view"
          >
            {Math.round(documentZoom * 100)}%
          </button>
          <ToolbarButton disabled={documentZoom >= 2.5} label="Zoom in" onClick={onZoomIn}>
            <ZoomIn className="size-3.5" />
          </ToolbarButton>
          <span className="mx-0.5 h-4 w-px bg-border-default" />
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold leading-none transition-colors hover:bg-surface-muted hover:text-brand-blue"
          >
            <Maximize2 className="size-3.5" />
            Fit
          </button>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-full p-1 transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-35"
      aria-label={label}
    >
      {children}
    </button>
  );
}

function DocumentInsightPanel({
  actions,
  activeInsightId,
  activeInsightRef,
  document,
  onInsightSelect,
  onScroll,
}: {
  actions: DynamicDocumentAction[];
  activeInsightId: string;
  activeInsightRef: RefObject<HTMLButtonElement | null>;
  document: DynamicDocumentData;
  onInsightSelect: (insight: DynamicDocumentInsight) => void;
  onScroll: () => void;
}) {
  return (
    <div className="relative z-40 min-h-0 border-l border-border-default bg-white">
      <div className="flex h-full min-h-0 flex-col bg-white">
        <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto p-3" onScroll={onScroll}>
          <CollapsibleDetailSection
            title={document.summary.label}
            defaultOpen
            headerAction={(
              <span className="rounded-full bg-[#fff4e6] px-2 py-0.5 text-[10px] font-semibold text-[#8a5a00]">
                {document.summary.status}
              </span>
            )}
          >
            <AiSummaryBanner meta={document.summary.status} text={document.summary.text} />
            {document.summary.contextTitle || document.summary.contextText ? (
              <div className="mt-3 rounded-[6px] border border-border-soft bg-[#fbfcfd] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">Requirement context</p>
                {document.summary.contextTitle ? (
                  <p className="mt-1 text-[13px] font-semibold text-text-primary">{document.summary.contextTitle}</p>
                ) : null}
                {document.summary.contextText ? (
                  <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">{document.summary.contextText}</p>
                ) : null}
              </div>
            ) : null}
          </CollapsibleDetailSection>

          <CollapsibleDetailSection title="Evidence" subtitle={`${document.evidence.length} anchors`} className="mt-3" defaultOpen>
            <div className="space-y-2">
              {document.evidence.map((insight) => (
                <InsightCard
                  key={insight.id}
                  cardRef={activeInsightId === insight.id ? activeInsightRef : undefined}
                  insight={insight}
                  isActive={activeInsightId === insight.id}
                  onSelect={() => onInsightSelect(insight)}
                />
              ))}
            </div>
          </CollapsibleDetailSection>
        </div>

        <div className="shrink-0 border-t border-border-soft bg-white p-3">
          <div className="space-y-2">
            {actions.map((action) => (
              <button
                key={action.id}
                className={
                  action.variant === 'primary'
                    ? 'inline-flex h-8 w-full items-center justify-center rounded-full bg-brand-blue px-3 text-[12px] font-semibold text-white transition-colors hover:bg-brand-blue-hover'
                    : 'inline-flex h-8 w-full items-center justify-center rounded-full border border-border-default bg-white px-3 text-[12px] font-semibold text-text-secondary transition-colors hover:border-brand-blue hover:text-brand-blue'
                }
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightCard({
  cardRef,
  insight,
  isActive,
  onSelect,
}: {
  cardRef?: RefObject<HTMLButtonElement | null>;
  insight: DynamicDocumentInsight;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      ref={cardRef}
      type="button"
      onClick={onSelect}
      className={`group relative w-full rounded-[8px] border p-3 text-left transition-colors ${
        isActive ? 'border-[#f5a200]/45 bg-[#fffaf2]' : 'border-border-soft bg-white hover:bg-[#fbfcfd]'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border-soft bg-white text-[9px] font-semibold text-text-muted">
          {insight.marker}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[13px] font-semibold leading-snug text-text-primary">{insight.title}</p>
            {isActive ? (
              <span className="shrink-0 rounded-full bg-[#fff4e6] px-2 py-0.5 text-[10px] font-semibold text-[#8a5a00]">
                Viewing source
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">{insight.reasoning}</p>
          <div className="mt-2 flex items-center gap-2 text-[11px]">
            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-[#f5a200]' : insight.tone === 'danger' ? 'bg-brand-red/70' : 'bg-[#f5a200]/80'}`} />
            <span className="font-semibold text-text-secondary">{insight.severity}</span>
            <span className="text-text-muted">·</span>
            <span className="text-text-muted">Anchor {insight.marker}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function AiSummaryBanner({
  meta,
  text,
}: {
  meta?: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-border-soft bg-white px-4 py-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">Summary</span>
        {meta ? (
          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-text-secondary">
            {meta}
          </span>
        ) : null}
      </div>
      <p className="text-[12px] leading-relaxed text-text-primary">{text}</p>
    </div>
  );
}

type DocumentScoringContext = NonNullable<DynamicDocumentData['scoringContext']>;

type DocumentMobileLayoutProps = {
  actions: DynamicDocumentAction[];
  activeHighlightRef: RefObject<HTMLButtonElement | null>;
  activeInsightId: string;
  activeInsightRef: RefObject<HTMLButtonElement | null>;
  activePage: DynamicDocumentPage;
  activePageIndex: number;
  activePageNumber: number;
  document: DynamicDocumentData;
  documentPan: { x: number; y: number };
  documentZoom: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isAnchorNavigating: boolean;
  isDocumentPanning: boolean;
  onInsightChange: (id: string) => void;
  onInsightSelect: (insight: DynamicDocumentInsight) => void;
  onNextPage: () => void;
  onPointerCancel: (event?: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event?: ReactPointerEvent<HTMLDivElement>) => void;
  onPreviousPage: () => void;
  onReset: () => void;
  onWheel: (event: ReactWheelEvent<HTMLDivElement>) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPageChange: (pageNumber: number) => void;
  scoringContext?: DocumentScoringContext;
  visibleEvidence: DynamicDocumentInsight[];
};

function DocumentMobileLayout({
  actions,
  activeHighlightRef,
  activeInsightId,
  activeInsightRef,
  activePage,
  activePageIndex,
  activePageNumber,
  document,
  documentPan,
  documentZoom,
  hasNextPage,
  hasPreviousPage,
  isAnchorNavigating,
  isDocumentPanning,
  onInsightChange,
  onInsightSelect,
  onNextPage,
  onPointerCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPreviousPage,
  onReset,
  onWheel,
  onZoomIn,
  onZoomOut,
  onPageChange,
  scoringContext,
  visibleEvidence,
}: DocumentMobileLayoutProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-4 px-4 py-4">
          <CollapsibleDetailSection
            title={document.summary.label}
            defaultOpen
            headerAction={(
              <span className="rounded-full bg-[#fff4e6] px-2 py-0.5 text-[10px] font-semibold text-[#8a5a00]">
                {document.summary.status}
              </span>
            )}
          >
            <AiSummaryBanner meta={document.summary.status} text={document.summary.text} />
            {document.summary.contextTitle || document.summary.contextText ? (
              <div className="mt-3 rounded-[6px] border border-border-soft bg-[#fbfcfd] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">Requirement context</p>
                {document.summary.contextTitle ? (
                  <p className="mt-1 text-[13px] font-semibold text-text-primary">{document.summary.contextTitle}</p>
                ) : null}
                {document.summary.contextText ? (
                  <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">{document.summary.contextText}</p>
                ) : null}
              </div>
            ) : null}
          </CollapsibleDetailSection>

          <section aria-label="Evidence insights">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-[13px] font-semibold text-text-primary">Evidence</h3>
              <span className="text-[11px] font-medium text-text-muted">{document.evidence.length} anchors</span>
            </div>
            <DocumentInsightsCarousel
              activeInsightId={activeInsightId}
              activeInsightRef={activeInsightRef}
              insights={document.evidence}
              onInsightSelect={onInsightSelect}
            />
          </section>

          <section aria-label="Document preview" className="overflow-hidden rounded-lg border border-border-default bg-white">
              <DocumentCanvas
                activePage={activePage}
                activePageIndex={activePageIndex}
                activePageNumber={activePageNumber}
                activeHighlightRef={activeHighlightRef}
                activeInsightId={activeInsightId}
                document={document}
                documentPan={documentPan}
                documentZoom={documentZoom}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                isAnchorNavigating={isAnchorNavigating}
                isDocumentPanning={isDocumentPanning}
                mobilePreview
                onInsightChange={onInsightChange}
                onNextPage={onNextPage}
                onPreviousPage={onPreviousPage}
                onPointerCancel={onPointerCancel}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onReset={onReset}
                onWheel={onWheel}
                onZoomIn={onZoomIn}
                onZoomOut={onZoomOut}
                onPageChange={onPageChange}
                visibleEvidence={visibleEvidence}
              />
          </section>

          {scoringContext ? <DocumentScoringImpactBlock scoringContext={scoringContext} className="!mt-0" /> : null}
        </div>
      </div>

      <DocumentMobileActions actions={actions} />
    </div>
  );
}

function DocumentInsightsCarousel({
  activeInsightId,
  activeInsightRef,
  insights,
  onInsightSelect,
}: {
  activeInsightId: string;
  activeInsightRef: RefObject<HTMLButtonElement | null>;
  insights: DynamicDocumentInsight[];
  onInsightSelect: (insight: DynamicDocumentInsight) => void;
}) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
      {insights.map((insight) => (
        <div key={insight.id} className="w-[min(88vw,300px)] shrink-0 snap-center">
          <InsightCard
            cardRef={activeInsightId === insight.id ? activeInsightRef : undefined}
            insight={insight}
            isActive={activeInsightId === insight.id}
            onSelect={() => onInsightSelect(insight)}
          />
        </div>
      ))}
    </div>
  );
}

function DocumentMobileActions({ actions }: { actions: DynamicDocumentAction[] }) {
  if (!actions.length) return null;

  return (
    <div className="shrink-0 space-y-2 border-t border-border-soft bg-white p-4">
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          className={
            action.variant === 'primary'
              ? 'inline-flex h-11 w-full items-center justify-center rounded-full bg-brand-blue px-4 text-[13px] font-semibold text-white transition-colors hover:bg-brand-blue-hover'
              : 'inline-flex h-11 w-full items-center justify-center rounded-full border border-border-default bg-white px-4 text-[13px] font-semibold text-text-secondary transition-colors hover:border-brand-blue hover:text-brand-blue'
          }
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

function DocumentScoringImpactBlock({
  className = '',
  scoringContext,
}: {
  className?: string;
  scoringContext: DocumentScoringContext;
}) {
  return (
    <div className={`rounded-[6px] border border-brand-blue/25 bg-surface-selected p-3 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.35px] text-brand-blue">Scoring impact</p>
          <p className="mt-1 text-[13px] font-semibold text-text-primary">
            Net +{scoringContext.netScore} · {scoringContext.mappedDecision}
          </p>
        </div>
        <Link
          to={`/cases/${scoringContext.caseId}#tab=scoring`}
          className="shrink-0 rounded-full border border-brand-blue bg-white px-2 py-1 text-[10px] font-semibold text-brand-blue hover:bg-surface-selected"
        >
          Open
        </Link>
      </div>
      {scoringContext.suggestedAdjustments?.length ? (
        <ul className="mt-2 space-y-1 text-[11px] text-text-secondary">
          {scoringContext.suggestedAdjustments.slice(0, 3).map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-[6px] size-1 rounded-full bg-brand-blue" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function DocumentPageRail({
  activePageNumber,
  onPageChange,
  pages,
}: {
  activePageNumber: number;
  onPageChange: (pageNumber: number) => void;
  pages: DynamicDocumentPage[];
}) {
  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 flex justify-center">
      <div className="pointer-events-auto max-w-full rounded-xl border border-white/60 bg-white/[0.82] px-2 py-2 shadow-[0_8px_24px_rgba(27,28,30,0.12)] backdrop-blur-md">
      <div className="no-scrollbar flex min-w-0 justify-center overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {pages.map((page) => {
            const isSelected = activePageNumber === page.number;
            return (
              <button
                key={page.number}
                type="button"
                onClick={() => onPageChange(page.number)}
                className={`group flex w-[66px] shrink-0 flex-col overflow-hidden rounded-[5px] border bg-white text-left transition-colors ${
                  isSelected ? 'border-brand-blue shadow-[0_0_0_2px_rgba(0,98,150,0.12)]' : 'border-border-soft hover:border-brand-blue/45'
                }`}
                aria-current={isSelected ? 'page' : undefined}
              >
                <span className="block h-[48px] overflow-hidden bg-white">
                  <img src={page.image} alt="" className="h-full w-full object-cover object-top" />
                </span>
                <span className={`flex items-center justify-center border-t px-1.5 py-0.5 text-[10px] ${
                  isSelected ? 'border-brand-blue/20 text-brand-blue' : 'border-border-soft text-text-secondary'
                }`}>
                  Page {page.number}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}
