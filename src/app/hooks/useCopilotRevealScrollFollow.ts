import { useEffect, useRef, type RefObject } from 'react';
import {
  findScrollableAncestor,
  isNearScrollBottom,
  scrollContainerToBottom,
} from '../utils/copilotScrollFollow';

/**
 * Keeps the copilot message list pinned to the bottom while staged content grows,
 * unless the user has scrolled up to read earlier turns.
 */
export function useCopilotRevealScrollFollow(options: {
  active: boolean;
  /** Changes whenever reveal layout may have grown (phase, typed length, visible rows, etc.). */
  followKey: string | number;
  anchorRef: RefObject<HTMLElement | null>;
  /** Distance from bottom (px) still counts as "following" the reveal. */
  pinThreshold?: number;
}) {
  const { active, followKey, anchorRef, pinThreshold = 100 } = options;
  const pinnedRef = useRef(true);
  const resizeRafRef = useRef(0);

  useEffect(() => {
    if (active) pinnedRef.current = true;
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const anchor = anchorRef.current;
    const container = findScrollableAncestor(anchor);
    if (!container) return;

    const onScroll = () => {
      pinnedRef.current = isNearScrollBottom(container, pinThreshold);
    };
    onScroll();
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [active, anchorRef, pinThreshold]);

  useEffect(() => {
    if (!active) return;
    const anchor = anchorRef.current;
    const container = findScrollableAncestor(anchor);
    if (!container || !pinnedRef.current) return;

    let cancelled = false;
    const run = () => {
      if (cancelled || !pinnedRef.current) return;
      scrollContainerToBottom(container, 'auto');
    };

    const id = requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [active, followKey, anchorRef]);

  useEffect(() => {
    if (!active) return;
    const anchor = anchorRef.current;
    if (!anchor) return;
    const container = findScrollableAncestor(anchor);
    if (!container) return;

    const turnEl = anchor.closest('[data-message-id]') as HTMLElement | null;
    const observeTarget = turnEl ?? anchor;

    const ro = new ResizeObserver(() => {
      if (!pinnedRef.current) return;
      cancelAnimationFrame(resizeRafRef.current);
      resizeRafRef.current = requestAnimationFrame(() => {
        if (!pinnedRef.current) return;
        scrollContainerToBottom(container, 'auto');
      });
    });

    ro.observe(observeTarget);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(resizeRafRef.current);
    };
  }, [active, anchorRef]);
}
