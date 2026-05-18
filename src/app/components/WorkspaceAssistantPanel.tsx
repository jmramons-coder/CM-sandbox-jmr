import { AiCueSparkle } from './AiCueSparkle';
import { AiCopilotDock } from './AiCopilotFooter';
import { useCopilot } from '../contexts/CopilotContext';

export function WorkspaceAssistantPanel({ contextId = 'workspace' }: { contextId?: string }) {
  const { activeMessages, sendMessage } = useCopilot();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="shrink-0 border-b border-border-default px-5 py-4">
        <div className="flex items-center gap-2">
          <AiCueSparkle size={16} className="!text-brand-accent" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">Amplify Assistant</span>
        </div>
        <p className="mt-1 pl-6 text-[14px] font-semibold text-text-primary">Assistant for current context</p>
      </div>
      <AiCopilotDock
        layout="panel"
        data={{ id: contextId }}
        messages={activeMessages}
        onSendMessage={sendMessage}
        aiPanelTab="workspace"
      />
    </div>
  );
}
