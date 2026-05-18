import type { CaseKind, ClaimSubType, WorkObjectKind } from './objectRefs';

export type WorkflowTabId =
  | 'overview'
  | 'requirements'
  | 'tasks'
  | 'decision'
  | 'communications'
  | 'documents'
  | 'related_cases'
  | 'history';

export interface WorkflowTabDefinition {
  id: WorkflowTabId;
  label: string;
  optional?: boolean;
}

export interface WorkflowPhaseDefinition {
  id: string;
  label: string;
  description?: string;
}

export interface WorkflowStepDefinition {
  id: string;
  label: string;
  phaseId: string;
  tooltip: string;
}

export interface WorkflowStatusDefinition {
  code: string;
  label: string;
  tone: 'Success' | 'Warning' | 'Alert' | 'Neutral' | 'Discovery' | 'Informative';
  terminal?: boolean;
}

export interface WorkflowRequirementCategory {
  id: string;
  label: string;
  description?: string;
}

export interface WorkflowDecisionOption {
  id: string;
  label: string;
  requiredFields?: string[];
  reasonCodes?: string[];
}

export interface WorkflowActionDefinition {
  id: string;
  label: string;
  kind: 'primary' | 'secondary' | 'ghost';
  targetTab?: WorkflowTabId;
  promptTemplate?: string;
}

export interface WorkflowIntegrationDefinition {
  key: string;
  label: string;
  urlTemplate: string;
}

export interface WorkflowDefinition {
  id: string;
  caseKind: CaseKind;
  label: string;
  shortLabel: string;
  caseNoun: string;
  listTitle: string;
  primaryPartyLabel: string;
  participantLabels: Record<string, string>;
  searchableObjectKinds: WorkObjectKind[];
  tabs: WorkflowTabDefinition[];
  phases: WorkflowPhaseDefinition[];
  steps: WorkflowStepDefinition[];
  statuses: WorkflowStatusDefinition[];
  requirementCategories: WorkflowRequirementCategory[];
  decisionOptions: WorkflowDecisionOption[];
  actions: WorkflowActionDefinition[];
  integrations: WorkflowIntegrationDefinition[];
}

const COMMON_TABS: WorkflowTabDefinition[] = [
  { id: 'overview', label: 'General information' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'communications', label: 'Communications' },
  { id: 'documents', label: 'Documents' },
  { id: 'history', label: 'Activities' },
];

export const WORKFLOW_DEFINITIONS: WorkflowDefinition[] = [
  {
    id: 'claim-income-protection',
    caseKind: 'claim',
    label: 'Claim',
    shortLabel: 'Claim',
    caseNoun: 'Disability benefit',
    listTitle: 'Claims',
    primaryPartyLabel: 'Claimant',
    participantLabels: {
      claimant: 'Claimant',
      insured: 'Insured',
      policyholder: 'Policyholder',
      employer: 'Employer',
      provider: 'Provider',
    },
    searchableObjectKinds: ['case', 'client', 'policy', 'requirement', 'task', 'document', 'communication'],
    tabs: [
      COMMON_TABS[0],
      COMMON_TABS[1],
      COMMON_TABS[2],
      { id: 'decision', label: 'Decision' },
      COMMON_TABS[3],
      COMMON_TABS[4],
      { id: 'related_cases', label: 'Relationships' },
      COMMON_TABS[5],
    ],
    phases: [
      { id: 'intake', label: 'Intake' },
      { id: 'pre-approval', label: 'Pre-approval' },
      { id: 'post-approval', label: 'Post-approval' },
      { id: 'closure', label: 'Closure' },
    ],
    steps: [
      { id: 'fnol', label: 'FNOL Received', phaseId: 'intake', tooltip: 'First notice received and claim opened.' },
      { id: 'triage', label: 'Initial Triage', phaseId: 'pre-approval', tooltip: 'Validate intake, assign owner, and route complexity.' },
      { id: 'requirements', label: 'Requirement Gathering', phaseId: 'pre-approval', tooltip: 'Collect medical, employment, identity, and policy requirements.' },
      { id: 'medical-review', label: 'Medical Review', phaseId: 'pre-approval', tooltip: 'Review clinical evidence and occupational impact.' },
      { id: 'decision', label: 'Decision', phaseId: 'pre-approval', tooltip: 'Record approve, decline, modified offer, or request for information.' },
      { id: 'restoration', label: 'Restoration Plan', phaseId: 'post-approval', tooltip: 'Agree recovery, provider, and return-to-work plan.' },
      { id: 'monitoring', label: 'Recovery Monitoring', phaseId: 'post-approval', tooltip: 'Monitor adherence, payments, milestones, and risk signals.' },
      { id: 'closure', label: 'Case Closure', phaseId: 'closure', tooltip: 'Confirm final communications, benefits, and audit trail.' },
    ],
    statuses: [
      { code: 'pending_decision', label: 'Pending Decision', tone: 'Warning' },
      { code: 'awaiting_requirements', label: 'Awaiting Requirements', tone: 'Warning' },
      { code: 'recovery_underway', label: 'Recovery Underway', tone: 'Informative' },
      { code: 'completed', label: 'Completed', tone: 'Success', terminal: true },
    ],
    requirementCategories: [
      { id: 'medical', label: 'Medical' },
      { id: 'employment', label: 'Employment' },
      { id: 'identity', label: 'Identity' },
      { id: 'rehabilitation', label: 'Rehabilitation' },
      { id: 'payment', label: 'Payment' },
    ],
    decisionOptions: [
      { id: 'approve', label: 'Approve', reasonCodes: ['Policy terms satisfied', 'Medical evidence consistent', 'No fraud indicators'] },
      { id: 'decline', label: 'Decline', requiredFields: ['declineRationale'], reasonCodes: ['Insufficient evidence', 'Policy exclusion applies'] },
      { id: 'modified_offer', label: 'Modified Offer', requiredFields: ['modifiedBenefit'], reasonCodes: ['Partial disability supported', 'Benefit adjustment required'] },
      { id: 'request_info', label: 'Request Additional Information', reasonCodes: ['Evidence gap', 'Clarification required'] },
    ],
    actions: [
      { id: 'record-decision', label: 'Record decision', kind: 'primary', targetTab: 'decision' },
      { id: 'open-assistant', label: 'Open Assistant', kind: 'secondary' },
    ],
    integrations: [
      { key: 'claims_admin', label: 'Claims admin', urlTemplate: 'https://oipa.example.com/claims/{caseId}' },
      { key: 'requirement_source', label: 'Requirement source', urlTemplate: 'https://oipa.example.com/claims/{caseId}/requirements/{requirementId}' },
    ],
  },
  {
    id: 'claim-death-benefit',
    caseKind: 'claim',
    label: 'Claim',
    shortLabel: 'Death',
    caseNoun: 'Death',
    listTitle: 'Claims',
    primaryPartyLabel: 'Claimant',
    participantLabels: {
      claimant: 'Claimant',
      insured: 'Insured',
      policyholder: 'Policyholder',
      beneficiary: 'Beneficiary',
      employer: 'Employer',
      provider: 'Provider',
    },
    searchableObjectKinds: ['case', 'client', 'policy', 'requirement', 'task', 'document', 'communication'],
    tabs: [
      COMMON_TABS[0],
      COMMON_TABS[1],
      COMMON_TABS[2],
      { id: 'decision', label: 'Decision' },
      COMMON_TABS[3],
      COMMON_TABS[4],
      { id: 'related_cases', label: 'Relationships' },
      COMMON_TABS[5],
    ],
    phases: [
      { id: 'intake', label: 'Intake' },
      { id: 'pre-approval', label: 'Pre-approval' },
      { id: 'post-approval', label: 'Post-approval' },
      { id: 'closure', label: 'Closure' },
    ],
    steps: [
      { id: 'fnol', label: 'FNOL Received', phaseId: 'intake', tooltip: 'Death notification received; claim opened and parties identified.' },
      { id: 'initial-review', label: 'Initial Review', phaseId: 'pre-approval', tooltip: 'Validate policy coverage, beneficiary designation, and intake completeness.' },
      { id: 'requirement-gathering', label: 'Requirement Gathering', phaseId: 'pre-approval', tooltip: 'Collect death certificate, proof of identity, beneficiary evidence, and payout prerequisites.' },
      { id: 'decision', label: 'Decision', phaseId: 'pre-approval', tooltip: 'Record benefit approval, pend, decline, or request for information.' },
    ],
    statuses: [
      { code: 'pending_decision', label: 'Pending Decision', tone: 'Warning' },
      { code: 'awaiting_requirements', label: 'Awaiting Requirements', tone: 'Warning' },
      { code: 'recovery_underway', label: 'Payment in progress', tone: 'Informative' },
      { code: 'completed', label: 'Completed', tone: 'Success', terminal: true },
    ],
    requirementCategories: [
      { id: 'identity', label: 'Identity' },
      { id: 'legal', label: 'Legal / beneficiary' },
      { id: 'medical', label: 'Medical / examiner' },
      { id: 'payment', label: 'Payment' },
    ],
    decisionOptions: [
      { id: 'approve', label: 'Approve benefit', reasonCodes: ['Policy terms satisfied', 'Beneficiary verified', 'No contest period issues'] },
      { id: 'decline', label: 'Decline', requiredFields: ['declineRationale'], reasonCodes: ['Exclusion applies', 'Evidence insufficient'] },
      { id: 'request_info', label: 'Request Additional Information', reasonCodes: ['Missing certificate', 'Beneficiary clarification'] },
    ],
    actions: [
      { id: 'record-decision', label: 'Record decision', kind: 'primary', targetTab: 'decision' },
      { id: 'open-assistant', label: 'Open Assistant', kind: 'secondary' },
    ],
    integrations: [
      { key: 'claims_admin', label: 'Claims admin', urlTemplate: 'https://oipa.example.com/claims/{caseId}' },
      { key: 'requirement_source', label: 'Requirement source', urlTemplate: 'https://oipa.example.com/claims/{caseId}/requirements/{requirementId}' },
    ],
  },
  {
    id: 'new-business-application',
    caseKind: 'new_business',
    label: 'New Business',
    shortLabel: 'New business',
    caseNoun: 'Application',
    listTitle: 'New business',
    primaryPartyLabel: 'Applicant',
    participantLabels: {
      applicant: 'Applicant',
      advisor: 'Advisor',
      owner: 'Owner',
      payer: 'Payer',
      beneficiary: 'Beneficiary',
    },
    searchableObjectKinds: ['case', 'client', 'policy', 'application', 'requirement', 'task', 'document', 'communication'],
    tabs: COMMON_TABS,
    phases: [
      { id: 'intake', label: 'Application intake' },
      { id: 'pre-approval', label: 'Processing' },
      { id: 'closure', label: 'Completion' },
    ],
    steps: [
      { id: 'application-received', label: 'Application Received', phaseId: 'intake', tooltip: 'Application package received from advisor or portal; onboarding record opened.' },
      { id: 'initial-review', label: 'Initial Review', phaseId: 'pre-approval', tooltip: 'First-pass review of application data, product fit, and obvious gaps.' },
      { id: 'requirement-gathering', label: 'Requirement Gathering', phaseId: 'pre-approval', tooltip: 'Collect signatures, evidence, premium source, and underwriting prerequisites.' },
      { id: 'underwriting-review', label: 'Underwriting Review', phaseId: 'pre-approval', tooltip: 'Underwriter assessment of risk, scoring, and conditions before a decision.' },
      { id: 'decision', label: 'Decision', phaseId: 'pre-approval', tooltip: 'Record accept, pend, decline, or return with conditions aligned with underwriting.' },
    ],
    statuses: [
      { code: 'new', label: 'New', tone: 'Discovery' },
      { code: 'pending_info', label: 'Pending Info', tone: 'Warning' },
      { code: 'ready_for_underwriting', label: 'Ready for Underwriting', tone: 'Success' },
      { code: 'completed', label: 'Completed', tone: 'Success', terminal: true },
    ],
    requirementCategories: [
      { id: 'application', label: 'Application' },
      { id: 'signature', label: 'Signature' },
      { id: 'premium', label: 'Premium' },
      { id: 'advisor', label: 'Advisor' },
    ],
    decisionOptions: [
      { id: 'submit', label: 'Submit to underwriting', reasonCodes: ['Application complete', 'Payment method verified'] },
      { id: 'return_to_advisor', label: 'Return to advisor', requiredFields: ['notes'], reasonCodes: ['Missing signature', 'Product mismatch'] },
    ],
    actions: [
      { id: 'request-clarification', label: 'Request clarification', kind: 'primary', targetTab: 'communications' },
      { id: 'submit-underwriting', label: 'Submit to underwriting', kind: 'secondary' },
    ],
    integrations: [
      { key: 'application_admin', label: 'Application admin', urlTemplate: 'https://oipa.example.com/applications/{caseId}' },
    ],
  },
  {
    id: 'customer-service-case',
    caseKind: 'customer_service',
    label: 'Customer Service',
    shortLabel: 'Service',
    caseNoun: 'Service',
    listTitle: 'Customer service',
    primaryPartyLabel: 'Customer',
    participantLabels: {
      customer: 'Customer',
      caller: 'Caller',
      policyholder: 'Policyholder',
      representative: 'Authorized representative',
      serviceRep: 'Service rep',
    },
    searchableObjectKinds: ['case', 'client', 'policy', 'request', 'task', 'document', 'communication'],
    tabs: COMMON_TABS,
    phases: [
      { id: 'intake', label: 'Intake' },
      { id: 'verification', label: 'Verification' },
      { id: 'resolution', label: 'Resolution' },
      { id: 'closure', label: 'Closure' },
    ],
    steps: [
      { id: 'request-received', label: 'Request Received', phaseId: 'intake', tooltip: 'Inbound service request captured and categorized.' },
      { id: 'identity-verification', label: 'Identity Verification', phaseId: 'verification', tooltip: 'Validate customer authority and policy relationship.' },
      { id: 'update-processing', label: 'Update Processing', phaseId: 'resolution', tooltip: 'Apply or queue the requested policy/customer update.' },
      { id: 'confirmation', label: 'Confirmation', phaseId: 'closure', tooltip: 'Send confirmation and close the service audit trail.' },
    ],
    statuses: [
      { code: 'new', label: 'New', tone: 'Discovery' },
      { code: 'pending_verification', label: 'Pending Verification', tone: 'Warning' },
      { code: 'in_progress', label: 'In Progress', tone: 'Informative' },
      { code: 'completed', label: 'Completed', tone: 'Success', terminal: true },
    ],
    requirementCategories: [
      { id: 'identity', label: 'Identity' },
      { id: 'consent', label: 'Consent' },
      { id: 'form', label: 'Form' },
      { id: 'policy_validation', label: 'Policy validation' },
    ],
    decisionOptions: [
      { id: 'complete', label: 'Complete request', reasonCodes: ['Verified', 'Update accepted'] },
      { id: 'reject', label: 'Reject request', requiredFields: ['reason'], reasonCodes: ['Verification failed', 'Not authorized'] },
      { id: 'request_info', label: 'Request more information', reasonCodes: ['Missing evidence', 'Conflicting information'] },
    ],
    actions: [
      { id: 'verify-customer', label: 'Verify customer', kind: 'primary', targetTab: 'requirements' },
      { id: 'send-confirmation', label: 'Send confirmation', kind: 'secondary', targetTab: 'communications' },
    ],
    integrations: [
      { key: 'crm', label: 'CRM', urlTemplate: 'https://crm.example.com/service-cases/{caseId}' },
    ],
  },
  {
    id: 'agent-onboarding',
    caseKind: 'agent_onboarding',
    label: 'Agent Onboarding',
    shortLabel: 'Agent',
    caseNoun: 'Onboarding',
    listTitle: 'Agent onboarding',
    primaryPartyLabel: 'Agent',
    participantLabels: {
      agent: 'Agent',
      recruiter: 'Recruiter',
      compliance: 'Compliance officer',
      licensing: 'Licensing specialist',
      manager: 'Agency manager',
    },
    searchableObjectKinds: ['case', 'client', 'application', 'requirement', 'task', 'document', 'communication'],
    tabs: COMMON_TABS,
    phases: [
      { id: 'invite', label: 'Invite' },
      { id: 'profile', label: 'Profile setup' },
      { id: 'licensing', label: 'Licensing' },
      { id: 'activation', label: 'Activation' },
    ],
    steps: [
      { id: 'invite-agent', label: 'Invite Agent', phaseId: 'invite', tooltip: 'Open onboarding and send the agent invitation.' },
      { id: 'collect-profile', label: 'Collect Profile', phaseId: 'profile', tooltip: 'Capture personal, agency, tax, and banking profile information.' },
      { id: 'license-check', label: 'License Check', phaseId: 'licensing', tooltip: 'Validate license, jurisdiction, appointments, and compliance requirements.' },
      { id: 'contracting', label: 'Contracting', phaseId: 'licensing', tooltip: 'Prepare contracting documents and track signatures.' },
      { id: 'activate-agent', label: 'Activate Agent', phaseId: 'activation', tooltip: 'Activate producer code, portal access, and readiness notifications.' },
    ],
    statuses: [
      { code: 'invited', label: 'Invited', tone: 'Discovery' },
      { code: 'profile_pending', label: 'Profile Pending', tone: 'Warning' },
      { code: 'licensing_review', label: 'Licensing Review', tone: 'Informative' },
      { code: 'active', label: 'Active', tone: 'Success', terminal: true },
    ],
    requirementCategories: [
      { id: 'identity', label: 'Identity' },
      { id: 'license', label: 'License' },
      { id: 'contract', label: 'Contract' },
      { id: 'banking', label: 'Banking' },
      { id: 'compliance', label: 'Compliance' },
    ],
    decisionOptions: [
      { id: 'activate', label: 'Activate agent', reasonCodes: ['License verified', 'Contract complete', 'Compliance clear'] },
      { id: 'request_info', label: 'Request more information', reasonCodes: ['Missing license', 'Incomplete profile'] },
      { id: 'reject', label: 'Reject onboarding', requiredFields: ['reason'], reasonCodes: ['License invalid', 'Compliance issue'] },
    ],
    actions: [
      { id: 'send-invite', label: 'Send invite', kind: 'primary', targetTab: 'communications' },
      { id: 'create-license-requirements', label: 'Create licensing requirements', kind: 'secondary', targetTab: 'requirements' },
    ],
    integrations: [
      { key: 'agent_admin', label: 'Agent admin', urlTemplate: 'https://crm.example.com/agents/{caseId}' },
    ],
  },
];

/** One canonical workflow per business line for Data settings / default anatomy (not variant templates). */
export const PRIMARY_WORKFLOW_ID_BY_CASE_KIND: Record<CaseKind, string> = {
  claim: 'claim-income-protection',
  new_business: 'new-business-application',
  customer_service: 'customer-service-case',
  agent_onboarding: 'agent-onboarding',
};

export function getPrimaryWorkflowDefinition(caseKind: CaseKind): WorkflowDefinition {
  const id = PRIMARY_WORKFLOW_ID_BY_CASE_KIND[caseKind];
  return getWorkflowDefinition(id) ?? WORKFLOW_DEFINITIONS[0];
}

export function workflowTemplateIdForClaim(claimSubType?: ClaimSubType | null): string {
  if (claimSubType === 'death' || claimSubType === 'death_benefit') return 'claim-death-benefit';
  return 'claim-income-protection';
}

export function getWorkflowDefinition(id: string | undefined | null): WorkflowDefinition | undefined {
  if (!id) return undefined;
  return WORKFLOW_DEFINITIONS.find((workflow) => workflow.id === id);
}

export function getWorkflowByKind(caseKind: CaseKind): WorkflowDefinition {
  return WORKFLOW_DEFINITIONS.find((workflow) => workflow.caseKind === caseKind) ?? WORKFLOW_DEFINITIONS[0];
}

export function resolveWorkflowStatus(workflow: WorkflowDefinition | undefined, statusCodeOrLabel: string) {
  const normalized = statusCodeOrLabel.trim().toLowerCase();
  return workflow?.statuses.find(
    (status) => status.code.toLowerCase() === normalized || status.label.toLowerCase() === normalized,
  );
}
