import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

export type ModuleTabItem<T extends string = string> = {
  id: T;
  label: string;
  /** Optional leading icon (e.g. milestone case tabs). */
  icon?: ReactNode;
  count?: number | null;
  suffix?: ReactNode;
  disabled?: boolean;
  title?: string;
};

type ModuleTabsBarProps<T extends string> = {
  tabs: ModuleTabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  bleed?: boolean;
  className?: string;
};

const tabButtonBase =
  'group/tab relative z-0 px-[17px] pb-2 pt-3 text-sm font-semibold transition-colors rounded-t-md';
const tabHoverBg = 'enabled:hover:bg-surface-muted';

/** Shared module tabs: case overview style, with single-line horizontal overflow. */
export function ModuleTabsBar<T extends string>({
  tabs,
  activeId,
  onChange,
  bleed = true,
  className = '',
}: ModuleTabsBarProps<T>) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    const epsilon = 2;
    setCanScrollLeft(el.scrollLeft > epsilon);
    setCanScrollRight(el.scrollLeft < maxScroll - epsilon);
  }, []);

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
  }, [updateScrollEdges, tabs.length]);

  const scrollTabs = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;

    el.scrollBy({
      left: direction === 'right' ? Math.floor(el.clientWidth * 0.7) : -Math.floor(el.clientWidth * 0.7),
      behavior: 'smooth',
    });
  };

  return (
    <div
      className={`${bleed ? '-mx-6 px-6' : 'w-full'} relative border-b border-border-default`}
    >
      {canScrollLeft ? (
        <button
          type="button"
          aria-label="Scroll tabs left"
          onClick={() => scrollTabs('left')}
          className="absolute bottom-0 left-0 top-0 z-20 flex w-9 items-center justify-center border-r border-border-default bg-surface-primary text-text-secondary transition-colors hover:bg-surface-muted hover:text-brand-blue"
        >
          <ChevronLeft className="size-4" />
        </button>
      ) : null}
      {canScrollRight ? (
        <button
          type="button"
          aria-label="Scroll tabs right"
          onClick={() => scrollTabs('right')}
          className="absolute bottom-0 right-0 top-0 z-20 flex w-9 items-center justify-center border-l border-border-default bg-surface-primary text-text-secondary transition-colors hover:bg-surface-muted hover:text-brand-blue"
        >
          <ChevronRight className="size-4" />
        </button>
      ) : null}
      <div
        ref={scrollRef}
        className={`overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          canScrollLeft ? 'pl-9' : ''
        } ${canScrollRight ? 'pr-9' : ''}`}
        role="tablist"
      >
        <div className={`flex w-max min-w-full flex-nowrap gap-0 ${className}`}>
      {tabs.map((t) => {
        const active = activeId === t.id;
        const disabled = t.disabled;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-disabled={disabled}
            title={t.title}
            disabled={disabled}
            onClick={() => {
              if (!disabled) onChange(t.id);
            }}
            className={`${tabButtonBase} shrink-0 whitespace-nowrap ${disabled ? '' : tabHoverBg} ${
              disabled
                ? 'cursor-not-allowed text-[#b7bbc2]'
                : active
                  ? 'text-text-heading'
                  : 'text-text-secondary'
            }`}
          >
            {active && !disabled ? (
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-0 left-0 z-[1] h-1 w-full max-w-none bg-brand-blue"
              />
            ) : null}
            <span className="relative z-[2] inline-flex items-center gap-1.5 normal-case">
              {t.icon}
              {t.label}
              {t.count != null && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#e8eaed] px-2 py-1 text-[11px] font-bold leading-none tabular-nums text-text-secondary">
                  {t.count}
                </span>
              )}
              {t.suffix}
            </span>
          </button>
        );
      })}
        </div>
      </div>
    </div>
  );
}
