import type { WorkObjectKind } from '../objectRefs';

/** Stable action ids used by UI and executors (not display labels). */
export type WorkflowActionId =
  | 'start_review'
  | 'request_info'
  | 'complete'
  | 'reject'
  | 'complete_task'
  | 'pick_up_task'
  | 'release_task'
  | 'mark_document_reviewed';

export type PanelActionVariant = 'primary' | 'secondary' | 'danger' | 'nav';

export type PanelActionExecution =
  | { type: 'navigate'; path: string }
  | { type: 'workflow'; action: WorkflowActionId; requestId?: string }
  | { type: 'mutation'; action: WorkflowActionId; taskId?: string; documentId?: string };

export type PanelAction = {
  id: string;
  label: string;
  variant: PanelActionVariant;
  execution: PanelActionExecution;
};

export type ObjectPanelActions = {
  navigation: PanelAction[];
  actions: PanelAction[];
};

export type WorkflowScope = 'simple_service' | 'case_linked' | 'generic';

/** How work is expected to close for this workflow pattern. */
export type WorkflowCompletionPattern = 'task_then_request' | 'request_direct' | 'case_workflow';

export type WorkflowOutcomeId = 'apply_mailing_address';

export type WorkflowProfile = {
  id: string;
  scope: WorkflowScope;
  pattern: WorkflowCompletionPattern;
  templateId?: string;
  allowsReject: boolean;
  outcomes: {
    onTaskComplete?: WorkflowOutcomeId[];
    onRequestComplete?: WorkflowOutcomeId[];
  };
};

export type LinkedEntityRef = {
  kind: WorkObjectKind;
  id: string;
  label?: string;
  href?: string;
};

export type RequestActionContext = {
  objectKind: 'request';
  requestId: string;
  status: string;
  category?: string;
  templateId?: string;
  caseId?: string;
  profile: WorkflowProfile;
  linkedEntities: LinkedEntityRef[];
  primaryTask?: { id: string; status: string; label?: string };
  primaryDocument?: { id: string; status: string; label?: string };
  documentNeedsReview: boolean;
};

export type TaskActionContext = {
  objectKind: 'task';
  taskId: string;
  status: string;
  profile: WorkflowProfile;
  linkedRequestId?: string;
  linkedEntities: LinkedEntityRef[];
};

export type DocumentActionContext = {
  objectKind: 'document';
  documentId: string;
  status: string;
  profile: WorkflowProfile;
  linkedRequestId?: string;
  needsReview: boolean;
};

export type ObjectActionContext = RequestActionContext | TaskActionContext | DocumentActionContext;
