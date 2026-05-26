import type { WorkflowActorContext } from '../../data/datasetMutations';
import { updateDocumentStatus } from '../../data/datasetMutations';
import { executeRequestAction, executeTaskAction } from '../../data/workflowActions';
import type { PanelAction, WorkflowActionId } from './types';

export type PanelActionResult = {
  datasetId: string;
  requestId?: string;
  taskId?: string;
  documentId?: string;
};

const REQUEST_WORKFLOW_ACTIONS = new Set<WorkflowActionId>([
  'start_review',
  'request_info',
  'complete',
  'reject',
]);

export function executePanelAction(
  datasetId: string,
  action: PanelAction,
  actor: WorkflowActorContext,
): PanelActionResult {
  const { execution } = action;

  if (execution.type === 'mutation') {
    if (execution.action === 'complete_task' && execution.taskId) {
      const result = executeTaskAction(datasetId, execution.taskId, 'complete', actor);
      return {
        datasetId: result.datasetId,
        taskId: execution.taskId,
        requestId: result.record.request?.id,
      };
    }
    if (execution.action === 'mark_document_reviewed' && execution.documentId) {
      const result = updateDocumentStatus(datasetId, execution.documentId, 'Validated', actor);
      return { datasetId: result.datasetId, documentId: execution.documentId };
    }
  }

  if (execution.type === 'workflow' && REQUEST_WORKFLOW_ACTIONS.has(execution.action)) {
    const requestId = execution.requestId;
    if (!requestId) {
      return { datasetId };
    }
    const result = executeRequestAction(
      datasetId,
      requestId,
      execution.action as 'start_review' | 'request_info' | 'complete' | 'reject',
      actor,
    );
    return { datasetId: result.datasetId, requestId };
  }

  if (execution.type === 'workflow' && execution.action === 'request_info' && execution.requestId) {
    const result = executeRequestAction(datasetId, execution.requestId, 'request_info', actor);
    return { datasetId: result.datasetId, requestId: execution.requestId };
  }

  return { datasetId };
}

export function isOpenDocumentNavigatePath(path: string): string | null {
  if (!path.startsWith('__open_document__:')) return null;
  return path.slice('__open_document__:'.length);
}
