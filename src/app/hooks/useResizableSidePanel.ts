import { useEffect, useState } from 'react';
import { MAIN_NAV_WIDTH_PX } from '../components/WorkspaceSidePanelChrome';

export function useResizableSidePanel({
  initialWidth = 300,
  minWidth = 240,
  maxWidth = 420,
  initiallyOpen = true,
}: {
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  initiallyOpen?: boolean;
} = {}) {
  const [panelWidth, setPanelWidth] = useState(initialWidth);
  const [sidePanelOpen, setSidePanelOpen] = useState(initiallyOpen);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!isResizing || !sidePanelOpen) return;
    const onMove = (e: MouseEvent) => {
      const nextWidth = Math.min(maxWidth, Math.max(minWidth, e.clientX - MAIN_NAV_WIDTH_PX));
      setPanelWidth(nextWidth);
    };
    const onUp = () => setIsResizing(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isResizing, maxWidth, minWidth, sidePanelOpen]);

  return {
    panelWidth,
    sidePanelOpen,
    setSidePanelOpen,
    isResizing,
    setIsResizing,
  };
}
