import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import { MODULE_MODAL_OVERLAY_Z_CLASS } from './WorkspaceSidePanelChrome';

type ModuleModalShellProps = {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  labelledBy?: string;
  panelClassName?: string;
};

/**
 * Portals module modals to `document.body` so the backdrop covers the workspace
 * side panel (z-1110) and the dialog stacks above it.
 */
export function ModuleModalShell({
  open,
  onClose,
  children,
  labelledBy,
  panelClassName = '',
}: ModuleModalShellProps) {
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={`fixed inset-0 ${MODULE_MODAL_OVERLAY_Z_CLASS} flex items-center justify-center bg-black/40 p-4`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={panelClassName}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
