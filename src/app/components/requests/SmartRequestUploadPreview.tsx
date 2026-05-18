import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import { FileText, Maximize2, Plus, X, ZoomIn, ZoomOut } from 'lucide-react';

export type SmartRequestUploadedFile = {
  id: string;
  name: string;
  mimeType: string;
  previewUrl: string | null;
  kind: 'image' | 'pdf' | 'other';
};

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 2.5;
const DEFAULT_ZOOM = 1.25;
const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 460;

function clampPan(pan: { x: number; y: number }, zoom: number) {
  const maxX = 72 + CANVAS_WIDTH * 0.35 * Math.max(0, zoom - 1);
  const maxY = 96 + CANVAS_HEIGHT * 0.35 * Math.max(0, zoom - 1);
  return {
    x: Math.max(-maxX, Math.min(maxX, pan.x)),
    y: Math.max(-maxY, Math.min(maxY, pan.y)),
  };
}

function PreviewToolbarButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: import('react').ReactNode;
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

function DocumentZoomCanvas({
  file,
}: {
  file: SmartRequestUploadedFile;
}) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panRef = useRef(pan);
  const panFrameRef = useRef<number | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; panX: number; panY: number } | null>(null);

  const scrollViewportToTop = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTop = 0;
    viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2);
  }, []);

  useEffect(() => {
    setZoom(DEFAULT_ZOOM);
    panRef.current = { x: 0, y: 0 };
    setPan({ x: 0, y: 0 });
    const frame = window.requestAnimationFrame(scrollViewportToTop);
    return () => window.cancelAnimationFrame(frame);
  }, [file.id, scrollViewportToTop]);

  const applyZoom = useCallback((nextZoom: number, focalPoint?: { x: number; y: number }) => {
    const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Number(nextZoom.toFixed(2))));
    setZoom((previousZoom) => {
      setPan((current) => {
        const basePan = panRef.current ?? current;
        const nextPan = focalPoint && previousZoom > 0
          ? clampPan({
              x: focalPoint.x - (clampedZoom / previousZoom) * (focalPoint.x - basePan.x),
              y: focalPoint.y - (clampedZoom / previousZoom) * (focalPoint.y - basePan.y),
            }, clampedZoom)
          : clampPan(current, clampedZoom);
        panRef.current = nextPan;
        return nextPan;
      });
      return clampedZoom;
    });
  }, []);

  const updatePan = useCallback((nextPan: { x: number; y: number }) => {
    panRef.current = clampPan(nextPan, zoom);
    if (panFrameRef.current !== null) return;
    panFrameRef.current = window.requestAnimationFrame(() => {
      panFrameRef.current = null;
      setPan(panRef.current);
    });
  }, [zoom]);

  const resetView = () => {
    setZoom(DEFAULT_ZOOM);
    panRef.current = { x: 0, y: 0 };
    setPan({ x: 0, y: 0 });
    scrollViewportToTop();
  };

  const onWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    applyZoom(zoom + (event.deltaY > 0 ? -0.1 : 0.1), {
      x: event.clientX - rect.left - rect.width / 2,
      y: event.clientY - rect.top,
    });
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (file.kind === 'other') return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
    };
    setIsPanning(true);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    updatePan({
      x: drag.panX + event.clientX - drag.startX,
      y: drag.panY + event.clientY - drag.startY,
    });
  };

  const stopPan = (event?: ReactPointerEvent<HTMLDivElement>) => {
    if (event && dragRef.current?.pointerId === event.pointerId && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setIsPanning(false);
  };

  const canPanZoom = file.kind === 'image' || file.kind === 'pdf';

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-lg border border-border-default border-b-0 bg-[#dfe3e8]">
      {canPanZoom ? (
        <div className="pointer-events-none absolute inset-x-2 top-3 z-20 flex justify-center">
          <div
            className="pointer-events-auto flex items-center gap-1 rounded-full border border-border-default bg-white/95 px-2.5 py-1.5 text-[12px] font-semibold text-text-secondary shadow-sm backdrop-blur"
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            onWheel={(event) => event.stopPropagation()}
          >
            <PreviewToolbarButton disabled={zoom <= MIN_ZOOM} label="Zoom out" onClick={() => applyZoom(zoom - 0.25)}>
              <ZoomOut className="size-3.5" />
            </PreviewToolbarButton>
            <button
              type="button"
              onClick={resetView}
              className="min-w-10 rounded-full px-1.5 py-1 text-center transition-colors hover:bg-surface-muted"
              aria-label="Reset document view"
            >
              {Math.round(zoom * 100)}%
            </button>
            <PreviewToolbarButton disabled={zoom >= MAX_ZOOM} label="Zoom in" onClick={() => applyZoom(zoom + 0.25)}>
              <ZoomIn className="size-3.5" />
            </PreviewToolbarButton>
            <span className="mx-0.5 h-4 w-px bg-border-default" />
            <button
              type="button"
              onClick={resetView}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold transition-colors hover:bg-surface-muted hover:text-brand-blue"
            >
              <Maximize2 className="size-3.5" />
              Fit
            </button>
          </div>
        </div>
      ) : null}

      <div
        ref={viewportRef}
        className={`app-scrollbar relative flex min-h-[420px] flex-1 justify-center overflow-auto px-4 pb-4 pt-14 ${
          canPanZoom
            ? `items-start ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`
            : 'items-center'
        }`}
        onWheel={canPanZoom ? onWheel : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopPan}
        onPointerCancel={stopPan}
        onPointerLeave={stopPan}
      >
        {file.kind === 'other' ? (
          <div className="flex max-w-sm flex-col items-center gap-3 self-center px-6 py-10 text-center">
            <FileText className="size-10 text-text-muted" />
            <p className="text-[13px] font-semibold text-text-primary">Preview not available for this file type</p>
            <p className="text-[11px] leading-relaxed text-text-secondary">
              {file.name} will still be included in the analysis. Upload a PDF or image to pan and zoom in the viewer.
            </p>
          </div>
        ) : (
          <div
            className="relative shrink-0 bg-white shadow-[0_1px_2px_rgba(27,28,30,0.08)]"
            style={{
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              transform: `matrix(${zoom}, 0, 0, ${zoom}, ${pan.x}, ${pan.y})`,
              transformOrigin: 'top center',
              transition: isPanning ? 'none' : 'transform 0.12s ease',
            }}
          >
            {file.kind === 'image' && file.previewUrl ? (
              <img
                src={file.previewUrl}
                alt={file.name}
                className="block h-full w-full select-none object-contain object-top"
                draggable={false}
              />
            ) : null}
            {file.kind === 'pdf' && file.previewUrl ? (
              <iframe
                title={file.name}
                src={file.previewUrl}
                className="pointer-events-none h-full w-full border-0 bg-white"
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function UploadFileRail({
  activeFileId,
  files,
  onAddMore,
  onRemove,
  onSelect,
}: {
  activeFileId: string | null;
  files: SmartRequestUploadedFile[];
  onAddMore: () => void;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mt-auto shrink-0 border-t border-border-default bg-white px-3 pb-2.5 pt-2">
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {files.map((file) => {
          const selected = activeFileId === file.id;
          return (
            <div
              key={file.id}
              className={`flex w-[72px] shrink-0 flex-col overflow-hidden rounded-[6px] border bg-white transition-colors ${
                selected ? 'border-brand-blue shadow-[0_0_0_2px_rgba(0,98,150,0.12)]' : 'border-border-soft'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(file.id)}
                className="group relative block w-full text-left"
                aria-current={selected ? 'true' : undefined}
              >
                <span className="flex h-[52px] items-center justify-center overflow-hidden bg-surface-muted">
                  {file.kind === 'image' && file.previewUrl ? (
                    <img src={file.previewUrl} alt="" className="h-full w-full object-cover object-top" />
                  ) : (
                    <FileText className="size-5 text-text-muted" />
                  )}
                </span>
                <span
                  className={`block truncate border-t px-1 py-0.5 text-[9px] font-medium ${
                    selected ? 'border-brand-blue/20 text-brand-blue' : 'border-border-soft text-text-secondary'
                  }`}
                  title={file.name}
                >
                  {file.name}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onRemove(file.id)}
                className="flex items-center justify-center gap-0.5 border-t border-border-soft py-1 text-[9px] font-semibold text-text-secondary transition-colors hover:bg-[#fde5e4] hover:text-[#7a1d1a]"
                title={`Remove ${file.name}`}
              >
                <X className="size-3" />
                Remove
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={onAddMore}
          className="flex w-[72px] shrink-0 flex-col items-center justify-center rounded-[6px] border border-dashed border-border-default bg-surface-primary text-text-secondary transition-colors hover:border-brand-blue/45 hover:bg-surface-selected hover:text-brand-blue"
        >
          <span className="flex h-[52px] w-full items-center justify-center">
            <Plus className="size-5" />
          </span>
          <span className="w-full border-t border-border-soft py-1 text-[9px] font-semibold">Add file</span>
        </button>
      </div>
    </div>
  );
}

export function SmartRequestUploadPreview({
  activeFileId,
  files,
  onAddMore,
  onRemove,
  onSelect,
}: {
  activeFileId: string | null;
  files: SmartRequestUploadedFile[];
  onAddMore: () => void;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const activeFile = files.find((file) => file.id === activeFileId) ?? files[0] ?? null;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-0 overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pt-4 pb-0">
        {activeFile ? <DocumentZoomCanvas file={activeFile} /> : null}
      </div>
      <UploadFileRail
        activeFileId={activeFile?.id ?? null}
        files={files}
        onAddMore={onAddMore}
        onRemove={onRemove}
        onSelect={onSelect}
      />
    </div>
  );
}
