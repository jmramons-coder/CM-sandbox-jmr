import { useCallback, useState } from 'react';
import type { WorkspacePanelContext } from '../components/WorkspaceObjectSidePanel';
import { pushWorkspacePanelContext } from '../utils/workspacePanelContextUtils';

export function useWorkspacePanelNavigation() {
  const [contexts, setContexts] = useState<WorkspacePanelContext[]>([]);
  const [activeContextId, setActiveContextId] = useState('');

  const openContext = useCallback((context: WorkspacePanelContext) => {
    setContexts((current) => pushWorkspacePanelContext(current, context));
    setActiveContextId(context.id);
  }, []);

  const activateContext = useCallback((contextId: string) => {
    setActiveContextId(contextId);
  }, []);

  const clearContext = useCallback((contextId: string) => {
    let nextContextId: string | undefined;
    setContexts((current) => {
      const index = current.findIndex((context) => context.id === contextId);
      const next = index >= 0 ? current[index + 1] ?? current[index - 1] : undefined;
      nextContextId = next?.id;
      return current.filter((context) => context.id !== contextId);
    });
    setActiveContextId((current) => (current === contextId ? (nextContextId ?? '') : current));
    return nextContextId;
  }, []);

  const closePanel = useCallback(() => {
    setContexts([]);
    setActiveContextId('');
  }, []);

  const syncNavigation = useCallback((nextContexts: WorkspacePanelContext[], nextActiveId: string) => {
    setContexts(nextContexts);
    setActiveContextId(nextActiveId);
  }, []);

  const isOpen = contexts.length > 0;

  return {
    contexts,
    activeContextId,
    isOpen,
    openContext,
    activateContext,
    clearContext,
    closePanel,
    syncNavigation,
    setContexts,
    setActiveContextId,
  };
}
