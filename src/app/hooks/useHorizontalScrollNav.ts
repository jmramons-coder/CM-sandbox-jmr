import { useCallback, useEffect, useRef, useState } from 'react';

/** Edge detection + chevron scroll for horizontal tab/step rails (matches ModuleTabsBar). */
export function useHorizontalScrollNav(itemCount: number) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const updateScrollEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    const epsilon = 2;
    setHasOverflow(maxScroll > epsilon);
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
    if (el.firstElementChild) {
      resizeObserver.observe(el.firstElementChild);
    }
    window.addEventListener('resize', updateScrollEdges);

    return () => {
      el.removeEventListener('scroll', updateScrollEdges);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScrollEdges);
    };
  }, [itemCount, updateScrollEdges]);

  /** Chevron: scroll to the far left or far right edge. */
  const scrollToEdge = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    el.scrollTo({
      left: direction === 'left' ? 0 : maxScroll,
      behavior: 'smooth',
    });
  };

  /** Bring an item into view only when it is clipped (does not fight manual scroll). */
  const scrollItemIntoViewIfNeeded = useCallback((selector: string) => {
    const container = scrollRef.current;
    if (!container) return;

    const item = container.querySelector(selector);
    if (!item || !(item instanceof HTMLElement)) return;

    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const padding = 4;
    const clippedLeft = itemRect.left < containerRect.left + padding;
    const clippedRight = itemRect.right > containerRect.right - padding;
    if (!clippedLeft && !clippedRight) return;

    item.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
  }, []);

  return {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    hasOverflow,
    scrollToEdge,
    scrollItemIntoViewIfNeeded,
    updateScrollEdges,
  };
}
