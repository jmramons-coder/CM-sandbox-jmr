import type { ObjectRef } from '../domain/objectRefs';
import { MULTI_CASE_DEMO_DATASET, type AiActionRecord, type SystemDataset } from './multi-case-dataset';

function buildAiAction(
  id: string,
  title: string,
  summary: string,
  sourceSurface: AiActionRecord['sourceSurface'],
  linkedObjects: ObjectRef[],
  patch: Partial<AiActionRecord> = {},
): AiActionRecord {
  return {
    id,
    kind: 'ai_action',
    status: patch.status ?? 'suggested',
    actionType: patch.actionType ?? sourceSurface,
    title,
    summary,
    createdAt: patch.createdAt ?? '2026-05-08T09:00:00Z',
    actor: patch.actor ?? 'ai',
    sourceSurface,
    linkedObjects,
    ...patch,
  };
}

export function deriveAiActionsFromDataset(dataset: SystemDataset = MULTI_CASE_DEMO_DATASET): AiActionRecord[] {
  const actions: AiActionRecord[] = [];

  dataset.activityEvents
    .filter((event) => event.actor === 'ai')
    .forEach((event) => {
      actions.push(buildAiAction(
        `AI-EVENT-${event.id}`,
        event.label,
        `AI activity event linked to ${event.linkedObjects.length} object(s).`,
        'case',
        event.linkedObjects,
        { status: 'completed', actionType: 'activity_event', createdAt: event.timestamp, relatedActivityEventId: event.id },
      ));
    });

  dataset.tasks
    .filter((task) => task.hasAI || task.aiSummary || task.aiAction || task.scoringContext)
    .forEach((task) => {
      actions.push(buildAiAction(
        `AI-TASK-${task.id}`,
        task.aiAction ?? task.label,
        task.aiSummary ?? task.description ?? `AI assisted task ${task.label}.`,
        task.scoringContext ? 'scoring' : 'task',
        [{ kind: 'task', id: task.id, label: task.label }, ...task.linkedObjects],
        {
          status: task.status === 'Completed' ? 'completed' : 'suggested',
          actionType: task.scoringContext ? 'review_scoring' : 'task_suggestion',
          payload: task.scoringContext ? { scoringContext: task.scoringContext } : undefined,
        },
      ));
    });

  dataset.documents
    .filter((document) => document.aiSummary || document.aiAction || document.scoringContext)
    .forEach((document) => {
      actions.push(buildAiAction(
        `AI-DOC-${document.id}`,
        document.aiAction ?? `Review ${document.label}`,
        document.aiSummary ?? `AI reviewed ${document.label}.`,
        document.scoringContext ? 'scoring' : 'document',
        [{ kind: 'document', id: document.id, label: document.label }, ...document.linkedObjects],
        {
          status: document.status === 'Validated' ? 'completed' : 'suggested',
          actionType: document.scoringContext ? 'scoring_evidence' : 'document_review',
          payload: document.scoringContext ? { scoringContext: document.scoringContext } : undefined,
        },
      ));
    });

  dataset.requests.forEach((request) => {
    request.systemSteps?.forEach((step) => {
      actions.push(buildAiAction(
        `AI-REQ-${request.id}-${step.id}`,
        step.title,
        step.description ?? request.aiSummary ?? `System step ${step.title} for request ${request.label}.`,
        'request',
        [{ kind: 'request', id: request.id, label: request.label }, ...request.linkedObjects],
        {
          status: step.status === 'completed' ? 'completed' : step.status === 'blocked' ? 'failed' : 'in_progress',
          actor: step.kind === 'review_required' ? 'system' : 'ai',
          actionType: step.kind,
          steps: [{ id: step.id, label: step.title, status: step.status }],
        },
      ));
    });
  });

  dataset.documentEvidence.forEach((evidence) => {
    evidence.findings.forEach((finding) => {
      actions.push(buildAiAction(
        `AI-EVD-${evidence.id}-${finding.id}`,
        finding.title,
        finding.reasoning,
        'document',
        [{ kind: 'document', id: evidence.documentId, label: evidence.title }, ...evidence.linkedObjects],
        {
          status: finding.severity === 'High' ? 'suggested' : 'completed',
          actionType: 'evidence_finding',
          rationale: finding.impact,
        },
      ));
    });
  });

  dataset.assistantResponses.forEach((response) => {
    actions.push(buildAiAction(
      `AI-COPILOT-${response.id}`,
      response.prompt,
      response.response,
      'copilot',
      response.linkedObjects,
      {
        status: 'completed',
        actionType: 'assistant_response',
        workflowTemplateId: response.workflowTemplateId,
        relatedAssistantResponseId: response.id,
      },
    ));
  });

  return actions;
}
