import { Maximize2, Pencil, Plus } from 'lucide-react';
import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';
import { AiCopilotDock } from './AiCopilotFooter';
import { MiniAiSourceBadge } from './ModuleCellHelpers';
import { Dialog, DialogContent } from './ui/dialog';
import type { ChatTurn } from './AiCopilotFooter';

type MobileGlobalAiSheetProps = {
  open: boolean;
  onClose: () => void;
  renamingConversation: boolean;
  setRenamingConversation: (editing: boolean) => void;
  onCreateSession: () => void;
  onOpenFullPage: () => void;
  globalContextId: string;
  activeMessages: ChatTurn[];
  onSendMessage: (text: string) => void;
  t: TFunction<'nav'>;
  titleEditor: ReactNode;
};

export function MobileGlobalAiSheet({
  open,
  onClose,
  renamingConversation,
  setRenamingConversation,
  onCreateSession,
  onOpenFullPage,
  globalContextId,
  activeMessages,
  onSendMessage,
  t,
  titleEditor,
}: MobileGlobalAiSheetProps) {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent layout="below-header" showCloseButton className="flex flex-col gap-0 overflow-hidden p-0">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
          <AiCopilotDock
            layout="panel"
            data={{ id: globalContextId }}
            messages={activeMessages}
            onSendMessage={onSendMessage}
            aiPanelTab="workspace"
            panelHeader={
              <div className="flex items-center justify-between gap-2 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <MiniAiSourceBadge size="compact" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                      {t('aiPanel.eyebrow')}
                    </span>
                  </div>
                  <div className="mt-1 flex min-w-0 items-center gap-1.5">
                    {titleEditor}
                    {renamingConversation ? null : (
                      <button
                        type="button"
                        onClick={() => setRenamingConversation(true)}
                        className="shrink-0 rounded-md p-1 text-[#a9aeb5] hover:bg-surface-muted hover:text-text-secondary"
                        aria-label={t('aiPanel.renameConversation')}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={onCreateSession}
                    className="inline-flex items-center gap-1 rounded-full border border-border-default bg-white px-2 py-1 text-[11px] font-semibold text-text-secondary"
                    aria-label={t('aiPanel.newConversation')}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t('aiPanel.newChat')}
                  </button>
                  <button
                    type="button"
                    onClick={onOpenFullPage}
                    className="rounded-full p-1.5 text-text-secondary hover:bg-surface-muted"
                    aria-label={t('aiPanel.openFullPage')}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
