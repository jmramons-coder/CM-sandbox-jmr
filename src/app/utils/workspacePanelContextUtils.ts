import type { WorkspacePanelContext } from '../components/WorkspaceObjectSidePanel';

export const MAX_WORKSPACE_PANEL_CONTEXTS = 10;

/** New or re-focused context is pinned at the far left; list is capped at 10 (oldest dropped). */
export function pushWorkspacePanelContext(
  current: WorkspacePanelContext[],
  context: WorkspacePanelContext,
): WorkspacePanelContext[] {
  const without = current.filter((item) => item.id !== context.id);
  return [context, ...without].slice(0, MAX_WORKSPACE_PANEL_CONTEXTS);
}

export function taskPanelContextId(taskId: string) {
  return `task:${taskId}`;
}

export function documentPanelContextId(documentId: string) {
  return `document:${documentId}`;
}

export function requirementPanelContextId(requirementId: string) {
  return `requirement:${requirementId}`;
}

export function requestPanelContextId(requestId: string) {
  return `request:${requestId}`;
}

export function userPanelContextId(userId: string) {
  return `user:${userId}`;
}

export type WorkspacePanelContextKind = 'task' | 'document' | 'requirement' | 'request' | 'other';

export function workspacePanelContextKind(activeContextId: string): WorkspacePanelContextKind {
  if (activeContextId.startsWith('task:')) return 'task';
  if (activeContextId.startsWith('document:')) return 'document';
  if (activeContextId.startsWith('requirement:')) return 'requirement';
  if (activeContextId.startsWith('request:')) return 'request';
  return 'other';
}

export function parseTaskPanelView(activeContextId: string): 'task' | 'document' | 'assistant' | 'requirement' {
  if (activeContextId.startsWith('document:')) return 'document';
  if (activeContextId.startsWith('requirement:')) return 'requirement';
  if (activeContextId === 'assistant') return 'assistant';
  return 'task';
}

export function documentIdFromPanelContext(activeContextId: string): string | undefined {
  return activeContextId.startsWith('document:') ? activeContextId.slice('document:'.length) : undefined;
}

/** Ensures the task tab exists, then pins the document tab at the far left. */
export function mergeTaskAndDocumentContexts(
  current: WorkspacePanelContext[],
  taskContext: WorkspacePanelContext,
  documentContext: WorkspacePanelContext,
): { contexts: WorkspacePanelContext[]; activeContextId: string } {
  const base = current.filter((item) => item.id !== documentContext.id);
  const withTask = base.some((item) => item.id === taskContext.id)
    ? base
    : [...base, taskContext];
  return {
    contexts: pushWorkspacePanelContext(withTask, documentContext),
    activeContextId: documentContext.id,
  };
}
