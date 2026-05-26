import { accomplishmentTaskNavLabel } from './accomplishmentTask';
import { mergeLinkedEntities, objectHref } from './relationGraph';
import { isOpenTaskStatus, isTerminalRequestStatus } from './statusCatalog';
import type {
  DocumentActionContext,
  LinkedEntityRef,
  ObjectActionContext,
  ObjectPanelActions,
  PanelAction,
  RequestActionContext,
  TaskActionContext,
  WorkflowActionId,
} from './types';

const OPEN_DOCUMENT_PREFIX = '__open_document__:';

function workflowAction(
  id: string,
  action: WorkflowActionId,
  label: string,
  variant: PanelAction['variant'],
  requestId?: string,
  extras?: Partial<PanelAction['execution']>,
): PanelAction {
  const execution =
    extras ??
    (action === 'complete_task'
      ? { type: 'mutation' as const, action, taskId: '' }
      : action === 'mark_document_reviewed'
        ? { type: 'mutation' as const, action, documentId: '' }
        : { type: 'workflow' as const, action, requestId });

  return { id, label, variant, execution: execution as PanelAction['execution'] };
}

function navLabelForEntity(ctx: RequestActionContext, entity: LinkedEntityRef): string {
  if (entity.kind === 'document') {
    return ctx.documentNeedsReview ? 'Review evidence' : 'View evidence';
  }
  if (entity.kind === 'case') return 'Open case';
  return entity.label ?? entity.kind;
}

function resolveRequestNavigation(ctx: RequestActionContext): PanelAction[] {
  const navigation: PanelAction[] = [];

  if (ctx.primaryTask) {
    navigation.push({
      id: `nav-task-${ctx.primaryTask.id}`,
      label: accomplishmentTaskNavLabel({
        status: ctx.primaryTask.status,
        taskType: ctx.primaryTask.label,
      }),
      variant: 'nav',
      execution: {
        type: 'navigate',
        path: `/tasks#task=${encodeURIComponent(ctx.primaryTask.id)}`,
      },
    });
  }

  const entities = mergeLinkedEntities(ctx.linkedEntities.filter((entity) => entity.kind !== 'task'));

  for (const entity of entities) {
    if (entity.kind === 'document') {
      navigation.push({
        id: `nav-document-${entity.id}`,
        label: navLabelForEntity(ctx, entity),
        variant: 'nav',
        execution: { type: 'navigate', path: `${OPEN_DOCUMENT_PREFIX}${entity.id}` },
      });
      continue;
    }
    const href = entity.href ?? objectHref(entity.kind, entity.id);
    if (!href) continue;
    navigation.push({
      id: `nav-${entity.kind}-${entity.id}`,
      label: navLabelForEntity(ctx, entity),
      variant: 'nav',
      execution: { type: 'navigate', path: href },
    });
  }

  return navigation;
}

function resolveRequestWorkflowActions(ctx: RequestActionContext): PanelAction[] {
  if (isTerminalRequestStatus(ctx.status)) return [];

  const { profile } = ctx;
  const actions: PanelAction[] = [];
  const taskOpen = ctx.primaryTask ? isOpenTaskStatus(ctx.primaryTask.status) : false;

  if (ctx.status === 'New') {
    actions.push(
      workflowAction('wf-start-review', 'start_review', 'Start review', 'primary', ctx.requestId),
    );
    return actions;
  }

  if (ctx.status === 'Pending info') {
    actions.push(
      workflowAction('wf-resume-review', 'start_review', 'Resume review', 'primary', ctx.requestId),
    );
    return actions;
  }

  if (ctx.status === 'In progress') {
    if (profile.pattern === 'task_then_request' && taskOpen && ctx.primaryTask) {
      actions.push(
        workflowAction('wf-request-info', 'request_info', 'Request info', 'secondary', ctx.requestId),
      );
      return actions;
    }

    actions.push(
      workflowAction('wf-complete', 'complete', 'Complete request', 'primary', ctx.requestId),
    );
    actions.push(
      workflowAction('wf-request-info', 'request_info', 'Request info', 'secondary', ctx.requestId),
    );
    if (profile.allowsReject) {
      actions.push(workflowAction('wf-reject', 'reject', 'Reject', 'danger', ctx.requestId));
    }
    return actions;
  }

  return actions;
}

function resolveRequestMutations(ctx: RequestActionContext): PanelAction[] {
  if (isTerminalRequestStatus(ctx.status)) return [];

  const mutations: PanelAction[] = [];
  const taskOpen = ctx.primaryTask ? isOpenTaskStatus(ctx.primaryTask.status) : false;

  if (ctx.documentNeedsReview && ctx.primaryDocument) {
    mutations.push({
      id: 'mut-mark-document',
      label: 'Mark evidence reviewed',
      variant: 'secondary',
      execution: {
        type: 'mutation',
        action: 'mark_document_reviewed',
        documentId: ctx.primaryDocument.id,
      },
    });
  }

  if (ctx.status === 'In progress' && ctx.profile.pattern === 'task_then_request' && taskOpen && ctx.primaryTask) {
    mutations.push({
      id: 'mut-complete-task',
      label: 'Complete task',
      variant: 'primary',
      execution: {
        type: 'mutation',
        action: 'complete_task',
        taskId: ctx.primaryTask.id,
      },
    });
  }

  return mutations;
}

export function resolveRequestPanelActions(ctx: RequestActionContext): ObjectPanelActions {
  const navigation = resolveRequestNavigation(ctx);
  const workflow = resolveRequestWorkflowActions(ctx);
  const mutations = resolveRequestMutations(ctx);

  return {
    navigation,
    actions: [...mutations, ...workflow],
  };
}

export function resolveTaskPanelActions(ctx: TaskActionContext): ObjectPanelActions {
  const navigation: PanelAction[] = ctx.linkedEntities
    .map((entity) => {
      const href = entity.href ?? objectHref(entity.kind, entity.id);
      if (!href) return null;
      return {
        id: `nav-${entity.kind}-${entity.id}`,
        label: entity.label ?? entity.kind,
        variant: 'nav' as const,
        execution: { type: 'navigate' as const, path: href },
      };
    })
    .filter((row): row is PanelAction => Boolean(row));

  const actions: PanelAction[] = [];
  if (!isOpenTaskStatus(ctx.status)) {
    return { navigation, actions };
  }

  if (ctx.linkedRequestId) {
    actions.push({
      id: 'task-request-info',
      label: 'Request info',
      variant: 'secondary',
      execution: { type: 'workflow', action: 'request_info', requestId: ctx.linkedRequestId },
    });
  }
  actions.push({
    id: 'task-complete',
    label: 'Complete',
    variant: 'primary',
    execution: { type: 'mutation', action: 'complete_task', taskId: ctx.taskId },
  });

  return { navigation, actions };
}

export function resolveDocumentPanelActions(ctx: DocumentActionContext): ObjectPanelActions {
  const navigation: PanelAction[] = ctx.linkedRequestId
    ? [
        {
          id: 'nav-request',
          label: 'View request',
          variant: 'nav',
          execution: { type: 'navigate', path: `/requests#request=${encodeURIComponent(ctx.linkedRequestId)}` },
        },
      ]
    : [];

  const actions: PanelAction[] = ctx.needsReview
    ? [
        {
          id: 'mut-mark-document',
          label: 'Mark evidence reviewed',
          variant: 'primary',
          execution: {
            type: 'mutation',
            action: 'mark_document_reviewed',
            documentId: ctx.documentId,
          },
        },
      ]
    : [];

  return { navigation, actions };
}

export function resolveObjectPanelActions(context: ObjectActionContext): ObjectPanelActions {
  switch (context.objectKind) {
    case 'request':
      return resolveRequestPanelActions(context);
    case 'task':
      return resolveTaskPanelActions(context);
    case 'document':
      return resolveDocumentPanelActions(context);
    default:
      return { navigation: [], actions: [] };
  }
}
