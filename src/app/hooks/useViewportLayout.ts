import { useContext, useEffect, useState } from 'react';
import {
  BREAKPOINTS,
  isCompactShellLayout,
  resolveViewportLayout,
  type ViewportLayout,
} from '../constants/breakpoints';
import { ViewportLayoutContext } from '../contexts/ViewportLayoutContext';

export type ViewportLayoutState = {
  layout: ViewportLayout;
  width: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isCompactShell: boolean;
};

function readViewportState(): ViewportLayoutState {
  const width = typeof window !== 'undefined' ? window.innerWidth : BREAKPOINTS.desktopMin;
  const layout = resolveViewportLayout(width);
  return {
    layout,
    width,
    isMobile: layout === 'mobile',
    isTablet: layout === 'tablet',
    isDesktop: layout === 'desktop',
    isCompactShell: isCompactShellLayout(layout),
  };
}

/** Subscribes to viewport resize — mount once inside ViewportLayoutProvider. */
export function useViewportLayoutState(): ViewportLayoutState {
  const [state, setState] = useState<ViewportLayoutState>(readViewportState);

  useEffect(() => {
    const onResize = () => setState(readViewportState());
    window.addEventListener('resize', onResize);
    setState(readViewportState());
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return state;
}

/** Reads shared viewport state from provider when mounted; otherwise uses a local listener. */
export function useViewportLayout(): ViewportLayoutState {
  const ctx = useContext(ViewportLayoutContext);
  const [fallbackState, setFallbackState] = useState<ViewportLayoutState>(readViewportState);

  useEffect(() => {
    if (ctx) return undefined;
    const onResize = () => setFallbackState(readViewportState());
    window.addEventListener('resize', onResize);
    setFallbackState(readViewportState());
    return () => window.removeEventListener('resize', onResize);
  }, [ctx]);

  return ctx ?? fallbackState;
}
