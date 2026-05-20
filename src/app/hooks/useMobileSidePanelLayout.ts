import { useCallback, useEffect, useRef, useState } from 'react';
import { useViewportLayout } from './useViewportLayout';

const MOBILE_PEEK_WIDTH_RATIO = 0.05;
const MOBILE_OPEN_WIDTH_RATIO = 0.75;
const MOBILE_OPEN_WIDTH_MIN = 260;
const MOBILE_PEEK_WIDTH_MIN = 20;

/** Slim rail when the workspace side panel is collapsed on desktop. */
export const DESKTOP_SIDE_PANEL_PEEK_WIDTH_PX = 18;

export function useMobileSidePanelLayout(panelWidth: number, sidePanelOpen: boolean) {
  const { isCompactShell } = useViewportLayout();
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [workspaceWidth, setWorkspaceWidth] = useState(0);

  const measureWorkspace = useCallback(() => {
    setWorkspaceWidth(workspaceRef.current?.getBoundingClientRect().width ?? 0);
  }, []);

  useEffect(() => {
    measureWorkspace();
    const el = workspaceRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => measureWorkspace());
    observer.observe(el);
    return () => observer.disconnect();
  }, [measureWorkspace]);

  const layoutWidth =
    workspaceWidth > 0
      ? workspaceWidth
      : typeof window !== 'undefined'
        ? window.innerWidth
        : 0;
  const peekWidth = isCompactShell
    ? Math.max(
        12,
        Math.round(
          Math.max(MOBILE_PEEK_WIDTH_MIN, Math.round(layoutWidth * MOBILE_PEEK_WIDTH_RATIO)) * 0.25,
        ) + 6,
      )
    : DESKTOP_SIDE_PANEL_PEEK_WIDTH_PX;
  const mobileOpenWidth = isCompactShell
    ? Math.min(
        Math.max(MOBILE_OPEN_WIDTH_MIN, Math.round(layoutWidth * MOBILE_OPEN_WIDTH_RATIO)),
        Math.max(layoutWidth - peekWidth, MOBILE_OPEN_WIDTH_MIN),
      )
    : panelWidth;
  const effectivePanelWidth = sidePanelOpen
    ? (isCompactShell ? mobileOpenWidth : panelWidth)
    : peekWidth;
  const showPanelContent = sidePanelOpen;
  const mobileContentWidth = isCompactShell ? Math.max(0, layoutWidth - peekWidth) : 0;
  const mobileContentPush =
    isCompactShell && sidePanelOpen ? mobileOpenWidth - peekWidth : 0;

  return {
    workspaceRef,
    isCompactShell,
    effectivePanelWidth,
    showPanelContent,
    peekWidth,
    /** @deprecated Use `peekWidth` */
    mobilePeekWidth: peekWidth,
    mobileContentWidth,
    mobileContentPush,
  };
}
