import { toast as sonnerToast } from 'sonner';
import { Toast, type ToastVariant } from '../components/ds/Toast';
import type { PanelAction, WorkflowActionId } from '../domain/objectWorkflow/types';

const DEFAULT_DURATION_MS: Record<ToastVariant, number> = {
  neutral: 4000,
  success: 4000,
  warning: 4000,
  discovery: 4000,
  alert: 6000,
};

function show(variant: ToastVariant, message: string, durationMs = DEFAULT_DURATION_MS[variant]) {
  sonnerToast.custom(
    (id) => (
      <Toast
        variant={variant}
        message={message}
        onDismiss={() => sonnerToast.dismiss(id)}
      />
    ),
    { duration: durationMs },
  );
}

export const appToast = {
  success: (message: string) => show('success', message),
  error: (message: string) => show('alert', message),
  neutral: (message: string) => show('neutral', message),
  warning: (message: string) => show('warning', message),
  alert: (message: string) => show('alert', message),
  discovery: (message: string) => show('discovery', message),
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
};

const REQUEST_ACTION_MESSAGES: Partial<Record<WorkflowActionId, (requestId: string) => string>> = {
  start_review: (id) => `Review started on ${id}`,
  complete: (id) => `Request ${id} completed`,
  reject: (id) => `Request ${id} rejected`,
  request_info: () => 'Information request sent',
};

export function appToastFromRequestAction(action: PanelAction, requestId: string): void {
  if (action.execution.type === 'mutation' && action.execution.action === 'mark_document_reviewed') {
    appToast.success('Evidence marked as reviewed');
    return;
  }
  if (action.execution.type === 'workflow') {
    const message = REQUEST_ACTION_MESSAGES[action.execution.action]?.(requestId);
    if (message) appToast.success(message);
  }
}

export function appToastFromPanelAction(action: PanelAction, context?: { requestId?: string }): void {
  if (context?.requestId) {
    appToastFromRequestAction(action, context.requestId);
  }
}
