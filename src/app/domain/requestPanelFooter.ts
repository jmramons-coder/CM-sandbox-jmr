/**
 * @deprecated Import from `domain/objectWorkflow` instead.
 * Kept for backward compatibility with existing imports and tests.
 */
import type { DynamicDocumentData } from '../components/DynamicDocumentSidePanel';
import type { ServiceRequest, Task } from '../types';
import { buildRequestActionContext, resolveRequestPanelActions } from './objectWorkflow';
import type { PanelAction, WorkflowActionId } from './objectWorkflow';

export type RequestWorkflowAction = Extract<
  WorkflowActionId,
  'start_review' | 'request_info' | 'complete' | 'reject'
>;

export type RequestPanelNavItem = {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
};

export type RequestPanelWorkflowButton = {
  action: RequestWorkflowAction;
  label: string;
  variant: 'primary' | 'secondary' | 'danger';
};

/** Legacy shape used by older panel code paths during migration. */
export type RequestPanelFooterModel = {
  nav: RequestPanelNavItem[];
  workflow: RequestPanelWorkflowButton[];
  completeTaskId?: string;
  markEvidenceReviewed?: boolean;
};

function toLegacyFooter(
  panel: ReturnType<typeof resolveRequestPanelActions>,
  openDocumentPaths: Map<string, () => void>,
): RequestPanelFooterModel {
  const nav: RequestPanelNavItem[] = panel.navigation.map((item) => {
    if (item.execution.type === 'navigate' && item.execution.path.startsWith('__open_document__:')) {
      const docId = item.execution.path.slice('__open_document__:'.length);
      return {
        id: item.id,
        label: item.label,
        onClick: openDocumentPaths.get(docId),
      };
    }
    return {
      id: item.id,
      label: item.label,
      href: item.execution.type === 'navigate' ? item.execution.path : undefined,
    };
  });

  let completeTaskId: string | undefined;
  let markEvidenceReviewed = false;
  const workflow: RequestPanelWorkflowButton[] = [];

  for (const item of panel.actions) {
    if (item.execution.type === 'mutation' && item.execution.action === 'complete_task') {
      completeTaskId = item.execution.taskId;
      continue;
    }
    if (item.execution.type === 'mutation' && item.execution.action === 'mark_document_reviewed') {
      markEvidenceReviewed = true;
      continue;
    }
    if (item.execution.type === 'workflow') {
      workflow.push({
        action: item.execution.action as RequestWorkflowAction,
        label: item.label,
        variant: item.variant === 'danger' ? 'danger' : item.variant === 'primary' ? 'primary' : 'secondary',
      });
    }
  }

  return { nav, workflow, completeTaskId, markEvidenceReviewed };
}

export function resolveRequestPanelFooter(
  request: ServiceRequest,
  linkedTasks: Task[],
  evidenceDocument: DynamicDocumentData | null | undefined,
  handlers: {
    onOpenEvidence: () => void;
    taskPath: (taskId: string) => string;
    folderPath: (id: string) => string;
  },
): RequestPanelFooterModel {
  const openDocumentPaths = new Map<string, () => void>();
  if (evidenceDocument) {
    openDocumentPaths.set(evidenceDocument.documentId, handlers.onOpenEvidence);
  }

  const ctx = buildRequestActionContext(request, linkedTasks, evidenceDocument);
  const panel = resolveRequestPanelActions(ctx);

  const legacy = toLegacyFooter(panel, openDocumentPaths);

  return {
    ...legacy,
    nav: legacy.nav.map((item) => {
      if (item.id.startsWith('nav-task-') && !item.href) {
        const taskId = item.id.replace('nav-task-', '');
        return { ...item, href: handlers.taskPath(taskId) };
      }
      if ((item.id.startsWith('nav-client-') || item.id.startsWith('nav-policy-')) && !item.href) {
        const id = item.id.split('-').slice(2).join('-');
        return { ...item, href: handlers.folderPath(id) };
      }
      return item;
    }),
  };
}

export function resolveRequestPanelActionsFromServiceRequest(
  request: ServiceRequest,
  linkedTasks: Task[],
  evidenceDocument: DynamicDocumentData | null | undefined,
) {
  const ctx = buildRequestActionContext(request, linkedTasks, evidenceDocument);
  return resolveRequestPanelActions(ctx);
}

export type { PanelAction };
