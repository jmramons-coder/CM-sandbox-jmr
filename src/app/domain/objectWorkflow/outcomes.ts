import type { WorkflowOutcomeId, WorkflowProfile } from './types';
import type { WorkflowActorContext } from '../../data/datasetMutations';
import { applyMailingAddressFromRequest } from '../../data/datasetMutations';

export function applyWorkflowOutcomes(
  datasetId: string,
  requestId: string,
  profile: WorkflowProfile,
  phase: 'task_complete' | 'request_complete',
  actor: WorkflowActorContext,
): string {
  const outcomeKey = phase === 'task_complete' ? 'onTaskComplete' : 'onRequestComplete';
  const outcomes = profile.outcomes[outcomeKey] ?? [];
  let activeId = datasetId;

  for (const outcome of outcomes) {
    activeId = runOutcome(activeId, requestId, outcome, actor);
  }

  return activeId;
}

function runOutcome(
  datasetId: string,
  requestId: string,
  outcome: WorkflowOutcomeId,
  actor: WorkflowActorContext,
): string {
  switch (outcome) {
    case 'apply_mailing_address':
      return applyMailingAddressFromRequest(datasetId, requestId, actor).datasetId;
    default:
      return datasetId;
  }
}
