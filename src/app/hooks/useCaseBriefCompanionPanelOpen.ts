import { useEffect, useState } from 'react';

const CASE_PANEL_ATTR = 'data-case-copilot-panel-open';
const GLOBAL_PANEL_ATTR = 'data-global-copilot-panel-open';

function readCompanionPanelOpen(): boolean {
  if (typeof document === 'undefined') return false;
  const root = document.documentElement;
  return root.hasAttribute(CASE_PANEL_ATTR) || root.hasAttribute(GLOBAL_PANEL_ATTR);
}

/** True when a case-scoped AI side panel is open (embedded case copilot or global copilot on a case). */
export function useCaseBriefCompanionPanelOpen(): boolean {
  const [open, setOpen] = useState(readCompanionPanelOpen);

  useEffect(() => {
    const sync = () => setOpen(readCompanionPanelOpen());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [CASE_PANEL_ATTR, GLOBAL_PANEL_ATTR],
    });
    return () => observer.disconnect();
  }, []);

  return open;
}

export function setCaseCopilotPanelOpenAttribute(active: boolean): void {
  if (typeof document === 'undefined') return;
  document.documentElement.toggleAttribute(CASE_PANEL_ATTR, active);
}

export function setGlobalCopilotPanelOpenAttribute(active: boolean): void {
  if (typeof document === 'undefined') return;
  document.documentElement.toggleAttribute(GLOBAL_PANEL_ATTR, active);
}
