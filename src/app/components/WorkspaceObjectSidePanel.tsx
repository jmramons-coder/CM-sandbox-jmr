import { useCallback, useEffect, useRef, useState, type ComponentType, type MouseEvent as ReactMouseEvent, type ReactNode, type SVGProps } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, MessageSquare, X } from 'lucide-react';
import { getCollapsedSidePanelWidth } from '../utils/sidepanel-width';
import { APP_EVENTS } from '../constants/storage-keys';

type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

const PANEL_CONTEXT_BAR_BG = '#f7f8fa';

export type WorkspacePanelContext = {
  id: string;
  label: string;
  icon: IconType;
  clearable?: boolean;
};

type WorkspaceObjectSidePanelProps = {
  contexts: WorkspacePanelContext[];
  activeContextId: string;
  onChangeContext: (id: string) => void;
  onClearContext?: (id: string) => void;
  onClose: () => void;
  panelWidth: number;
  isResizing?: boolean;
  onResizeStart: () => void;
  children: ReactNode;
  actions?: ReactNode;
  onAssistantRequest?: () => void;
  assistantContent?: ReactNode;
  assistantLabel?: string;
  onPanelWidthChange?: (width: number) => void;
  zIndexClassName?: string;
  portal?: boolean;
  /** When false, hides the left-edge resize handle (mobile full-width panels). */
  showResizeHandle?: boolean;
  /**
   * When true (default), clicking outside the panel closes it.
   * Clicks on elements marked with `data-keep-sidepanel` (typically table
   * rows that swap the active context) are ignored so the row's own
   * onClick handler can switch the active item without flicker.
   */
  closeOnOutsideClick?: boolean;
  /** When true, outside clicks matching this case keep the panel open (global AI + case file). */
  preserveOnOutsideClick?: (target: Element) => boolean;
  /** Marks portaled case workspace panels so outside-click logic can recognize them. */
  caseWorkspaceId?: string;
};

export function WorkspaceObjectSidePanel({
  actions,
  activeContextId,
  assistantContent,
  assistantLabel = 'Assistant',
  children,
  caseWorkspaceId,
  closeOnOutsideClick = true,
  contexts,
  preserveOnOutsideClick,
  isResizing = false,
  onChangeContext,
  onClearContext,
  onClose,
  onPanelWidthChange,
  onResizeStart,
  onAssistantRequest,
  panelWidth,
  portal = true,
  showResizeHandle = true,
  zIndexClassName = 'z-[190]',
}: WorkspaceObjectSidePanelProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const contextButtonRefs = useRef(new Map<string, HTMLSpanElement>());
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantActive, setAssistantActive] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const assistantContext: WorkspacePanelContext | null = assistantContent
    ? { id: '__assistant__', label: assistantLabel, icon: MessageSquare, clearable: true }
    : null;
  const effectiveContexts = assistantOpen && assistantContext ? [...contexts, assistantContext] : contexts;
  const effectiveActiveContextId = assistantOpen && assistantActive ? '__assistant__' : activeContextId;
  const visibleContexts = effectiveContexts.slice(0, 10);

  const updateScrollEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    const epsilon = 2;
    setCanScrollLeft(el.scrollLeft > epsilon);
    setCanScrollRight(el.scrollLeft < maxScroll - epsilon);
  }, []);

  const scrollContextIntoView = useCallback((id: string) => {
    window.requestAnimationFrame(() => {
      const item = contextButtonRefs.current.get(id);
      item?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
      window.requestAnimationFrame(updateScrollEdges);
    });
  }, [updateScrollEdges]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollEdges();
    el.addEventListener('scroll', updateScrollEdges, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollEdges);
    resizeObserver.observe(el);
    window.addEventListener('resize', updateScrollEdges);
    return () => {
      el.removeEventListener('scroll', updateScrollEdges);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScrollEdges);
    };
  }, [visibleContexts.length, updateScrollEdges]);

  useEffect(() => {
    scrollContextIntoView(effectiveActiveContextId);
  }, [effectiveActiveContextId, scrollContextIntoView, visibleContexts.length]);

  useEffect(() => {
    const onOpenAssistantContext = (event: Event) => {
      const customEvent = event as CustomEvent<{ handled?: boolean }>;
      if (assistantContent) {
        if (customEvent.detail) customEvent.detail.handled = true;
        setAssistantOpen(true);
        setAssistantActive(true);
        return;
      }
      if (onAssistantRequest) {
        if (customEvent.detail) customEvent.detail.handled = true;
        onAssistantRequest();
      }
    };
    window.addEventListener(APP_EVENTS.openSidePanelContext, onOpenAssistantContext);
    return () => window.removeEventListener(APP_EVENTS.openSidePanelContext, onOpenAssistantContext);
  }, [assistantContent, onAssistantRequest]);

  useEffect(() => {
    if (!closeOnOutsideClick) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      // Inside the panel itself
      if (panelRef.current && panelRef.current.contains(target)) return;
      // Element only meaningful for HTMLElement traversal
      if (!(target instanceof Element)) return;
      // Row/card explicitly opted out (it owns context-switching)
      if (target.closest('[data-keep-sidepanel]')) return;
      if (preserveOnOutsideClick?.(target)) return;
      // Radix portals (Select / Popover / Dropdown / Dialog content)
      if (
        target.closest(
          '[data-radix-popper-content-wrapper], [role="dialog"], [data-state="open"][data-radix-menu-content]',
        )
      ) {
        return;
      }
      onClose();
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [closeOnOutsideClick, onClose, preserveOnOutsideClick]);

  const scrollContexts = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === 'right' ? Math.floor(el.clientWidth * 0.7) : -Math.floor(el.clientWidth * 0.7),
      behavior: 'smooth',
    });
  };

  const activateContext = (context: WorkspacePanelContext) => {
    if (context.id === '__assistant__') {
      setAssistantOpen(true);
      setAssistantActive(true);
      return;
    }
    setAssistantActive(false);
    onChangeContext(context.id);
    scrollContextIntoView(context.id);
  };

  const handlePanelClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (!target.closest('[data-keep-sidepanel="link"], [data-sidepanel-main-nav]')) return;
    onPanelWidthChange?.(getCollapsedSidePanelWidth());
  };

  const panel = (
    <div
      ref={panelRef}
      onClick={handlePanelClick}
      data-case-workspace={caseWorkspaceId}
      className={`fixed right-0 ${zIndexClassName} flex flex-col overflow-visible border-l border-t border-border-default bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.08)]`}
      style={{
        width: `${panelWidth}px`,
        top: '48px',
        height: 'calc(100dvh - 48px)',
      }}
    >
      {showResizeHandle ? (
        <div
          className="group absolute bottom-0 left-0 top-0 z-[100] w-5 -translate-x-1/2 cursor-col-resize bg-transparent"
          onMouseDown={() => onResizeStart()}
        >
          <span className={`pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 transition-colors ${isResizing ? 'bg-brand-blue' : 'bg-border-default group-hover:bg-brand-blue'}`} />
          <span className={`pointer-events-none absolute left-1/2 top-1/2 flex h-9 w-2 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-colors ${isResizing ? 'border-brand-blue' : 'border-border-default group-hover:border-brand-blue'}`} />
        </div>
      ) : null}

      <div
        className="relative shrink-0 border-b border-border-soft px-4 py-2"
        style={{ backgroundColor: PANEL_CONTEXT_BAR_BG }}
      >
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            {canScrollLeft ? (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10"
                style={{
                  background: `linear-gradient(to right, ${PANEL_CONTEXT_BAR_BG} 0%, color-mix(in srgb, ${PANEL_CONTEXT_BAR_BG} 88%, transparent) 55%, transparent 100%)`,
                }}
              />
            ) : null}
            {canScrollRight ? (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12"
                style={{
                  background: `linear-gradient(to left, ${PANEL_CONTEXT_BAR_BG} 0%, color-mix(in srgb, ${PANEL_CONTEXT_BAR_BG} 88%, transparent) 55%, transparent 100%)`,
                }}
              />
            ) : null}
            <div
              ref={scrollRef}
              className="no-scrollbar overflow-x-auto overflow-y-hidden overscroll-x-contain"
            >
            <div className="flex w-max min-w-full items-center gap-2">
              {visibleContexts.map((context) => {
                const Icon = context.icon;
                const active = effectiveActiveContextId === context.id;
                return (
                  <span
                    key={context.id}
                    ref={(node) => {
                      if (node) contextButtonRefs.current.set(context.id, node);
                      else contextButtonRefs.current.delete(context.id);
                    }}
                    className={`inline-flex h-7 shrink-0 items-center gap-1 rounded-full border pl-2.5 text-[12px] font-semibold transition-colors ${
                      active
                        ? 'border-brand-blue bg-surface-selected text-brand-blue'
                        : 'border-border-default bg-[#fbfcfd] text-text-secondary hover:border-brand-blue hover:text-brand-blue'
                    } ${context.clearable ? 'pr-1' : 'pr-2.5'}`}
                  >
                    <button
                      type="button"
                      onClick={() => activateContext(context)}
                      className="inline-flex max-w-[210px] items-center gap-1.5 truncate"
                    >
                      <Icon className="size-3.5 shrink-0" />
                      {context.label}
                    </button>
                    {context.clearable ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (context.id === '__assistant__') {
                            setAssistantOpen(false);
                            setAssistantActive(false);
                            return;
                          }
                          onClearContext?.(context.id);
                        }}
                        className="inline-flex size-5 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-white hover:text-text-primary"
                        aria-label={`Clear ${context.label}`}
                      >
                        <X className="size-3" />
                      </button>
                    ) : null}
                  </span>
                );
              })}
              </div>
            </div>
          </div>
          {actions}
          <div className="flex shrink-0 items-center gap-1 pl-1">
            <button
              type="button"
              aria-label="Scroll recent panels left"
              disabled={!canScrollLeft}
              onClick={() => scrollContexts('left')}
              className="inline-flex size-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-muted hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Scroll recent panels right"
              disabled={!canScrollRight}
              onClick={() => scrollContexts('right')}
              className="inline-flex size-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-muted hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronRight className="size-4" />
            </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
            aria-label="Close side panel"
          >
            <X className="size-4" />
          </button>
          </div>
        </div>
      </div>

      {assistantOpen && assistantActive && assistantContent ? assistantContent : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );

  return portal ? createPortal(panel, globalThis.document.body) : panel;
}
