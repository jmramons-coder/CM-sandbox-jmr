import { ExternalLink } from 'lucide-react';
import type { ObjectPanelActions, PanelAction } from '../domain/objectWorkflow';
import { isOpenDocumentNavigatePath } from '../domain/objectWorkflow';

function actionButtonClass(variant: PanelAction['variant']) {
  if (variant === 'primary') {
    return 'inline-flex w-full items-center justify-center rounded-full bg-brand-navy px-4 py-2.5 text-sm font-semibold leading-none text-white transition-colors hover:bg-brand-blue-hover';
  }
  if (variant === 'danger') {
    return 'inline-flex w-full items-center justify-center rounded-full border border-brand-red/40 px-4 py-2 text-sm font-semibold leading-none text-brand-red transition-colors hover:bg-[#fde5e4]';
  }
  if (variant === 'nav') {
    return 'inline-flex items-center gap-1.5 rounded-full border border-border-default bg-white px-3 py-1.5 text-[12px] font-semibold text-brand-blue transition-colors hover:border-brand-blue hover:bg-surface-selected';
  }
  return 'inline-flex w-full items-center justify-center rounded-full border border-border-default px-4 py-2 text-sm font-semibold leading-none text-text-secondary transition-colors hover:bg-surface-muted';
}

type ObjectPanelFooterProps = {
  panel: ObjectPanelActions;
  onNavigate: (path: string) => void;
  onOpenDocument?: (documentId: string) => void;
  onAction: (action: PanelAction) => void;
};

export function ObjectPanelFooter({ panel, onNavigate, onOpenDocument, onAction }: ObjectPanelFooterProps) {
  if (!panel.navigation.length && !panel.actions.length) return null;

  return (
    <div className="shrink-0 space-y-3 border-t border-border-default bg-white p-4">
      {panel.navigation.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {panel.navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.execution.type !== 'navigate') return;
                const documentId = isOpenDocumentNavigatePath(item.execution.path);
                if (documentId && onOpenDocument) {
                  onOpenDocument(documentId);
                  return;
                }
                onNavigate(item.execution.path);
              }}
              className={actionButtonClass('nav')}
            >
              {item.label}
              <ExternalLink className="size-3 opacity-70" />
            </button>
          ))}
        </div>
      ) : null}

      {panel.actions.length > 0 ? (
        <div className="space-y-2">
          {panel.actions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onAction(item)}
              className={actionButtonClass(item.variant === 'nav' ? 'secondary' : item.variant)}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
