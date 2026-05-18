import { useCallback, useEffect, useState } from 'react';
import { MODULE_TABLE_SCROLL_EPSILON } from '../utils/module-table-scroll';

export type TableHorizontalScrollState = {
  showLeftStickyEdge: boolean;
  showRightStickyEdge: boolean;
  /** True when content is wider than the viewport (horizontal scroll is required). */
  hasHorizontalOverflow: boolean;
};

/**
 * Tracks horizontal scroll position for table wrappers so sticky column dividers
 * and shadows show only while scrolled, and horizontal overflow is enabled only when needed.
 */
export function useTableHorizontalScroll(scrollEl: HTMLElement | null): TableHorizontalScrollState {
  const [state, setState] = useState<TableHorizontalScrollState>({
    showLeftStickyEdge: false,
    showRightStickyEdge: false,
    hasHorizontalOverflow: false,
  });

  const update = useCallback(() => {
    if (!scrollEl) {
      setState({ showLeftStickyEdge: false, showRightStickyEdge: false, hasHorizontalOverflow: false });
      return;
    }
    const tableEl = scrollEl.querySelector('table');
    const { scrollLeft, clientWidth } = scrollEl;
    const contentScrollWidth = Math.max(scrollEl.scrollWidth, tableEl?.scrollWidth ?? 0, tableEl?.offsetWidth ?? 0);
    const maxScroll = Math.max(0, contentScrollWidth - clientWidth);
    const epsilon = MODULE_TABLE_SCROLL_EPSILON;
    const hasHorizontalOverflow = maxScroll > epsilon;
    setState({
      showLeftStickyEdge: scrollLeft > epsilon,
      showRightStickyEdge: hasHorizontalOverflow && scrollLeft < maxScroll - epsilon,
      hasHorizontalOverflow,
    });
  }, [scrollEl]);

  useEffect(() => {
    if (!scrollEl) return;
    update();
    const raf = requestAnimationFrame(update);
    scrollEl.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(scrollEl);
    const tableEl = scrollEl.querySelector('table');
    if (tableEl) {
      ro.observe(tableEl);
    } else if (scrollEl.firstElementChild) {
      ro.observe(scrollEl.firstElementChild);
    }
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      scrollEl.removeEventListener('scroll', update);
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [scrollEl, update]);

  return state;
}
