import { resolveSimpleServiceWorkflow } from '../workflows/simpleServiceWorkflows';
import type { WorkflowCompletionPattern, WorkflowOutcomeId, WorkflowProfile, WorkflowScope } from './types';

export type WorkflowProfileInput = {
  category?: string;
  templateId?: string;
  caseSubtype?: string;
  caseType?: string;
  caseId?: string;
};

const GENERIC_REQUEST_PROFILE: WorkflowProfile = {
  id: 'generic_request',
  scope: 'generic',
  pattern: 'request_direct',
  allowsReject: true,
  outcomes: {},
};

const CASE_LINKED_REQUEST_PROFILE: WorkflowProfile = {
  id: 'case_linked_request',
  scope: 'case_linked',
  pattern: 'case_workflow',
  allowsReject: true,
  outcomes: {},
};

function simpleServiceProfile(
  workflowId: string,
  templateId: string,
  outcomes: { onTaskComplete?: WorkflowOutcomeId[]; onRequestComplete?: WorkflowOutcomeId[] },
): WorkflowProfile {
  return {
    id: `simple_service_${workflowId}`,
    scope: 'simple_service',
    pattern: 'task_then_request',
    templateId,
    allowsReject: false,
    outcomes,
  };
}

export function resolveWorkflowProfile(input: WorkflowProfileInput): WorkflowProfile {
  const simple = resolveSimpleServiceWorkflow(input.category, input.templateId, input.caseSubtype);
  if (simple) {
    const outcomes: WorkflowProfile['outcomes'] = {};
    if (simple.id === 'address_change') {
      outcomes.onTaskComplete = ['apply_mailing_address'];
      outcomes.onRequestComplete = ['apply_mailing_address'];
    }
    return simpleServiceProfile(simple.id, simple.templateId, outcomes);
  }

  if (input.caseId || input.caseType === 'claim' || input.caseType === 'Claim') {
    return CASE_LINKED_REQUEST_PROFILE;
  }

  return GENERIC_REQUEST_PROFILE;
}

export function isSimpleServiceProfile(profile: WorkflowProfile): boolean {
  return profile.scope === 'simple_service';
}

export function completionPatternForProfile(profile: WorkflowProfile): WorkflowCompletionPattern {
  return profile.pattern;
}
