import { createContext, useContext, type ReactNode } from 'react';
import { useViewportLayoutState, type ViewportLayoutState } from '../hooks/useViewportLayout';

export const ViewportLayoutContext = createContext<ViewportLayoutState | null>(null);

export function ViewportLayoutProvider({ children }: { children: ReactNode }) {
  const value = useViewportLayoutState();
  return (
    <ViewportLayoutContext.Provider value={value}>{children}</ViewportLayoutContext.Provider>
  );
}

export function useViewportLayoutContext(): ViewportLayoutState {
  const ctx = useContext(ViewportLayoutContext);
  if (!ctx) {
    throw new Error('useViewportLayoutContext must be used within ViewportLayoutProvider');
  }
  return ctx;
}

/** Safe when provider is absent (e.g. tests) — falls back to desktop. */
export function useViewportLayoutOptional(): ViewportLayoutState {
  const ctx = useContext(ViewportLayoutContext);
  return ctx ?? {
    layout: 'desktop',
    width: 1280,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isCompactShell: false,
  };
}
