import type { Task, TaskLinkedObject } from '../types';
import type { DatasetDocumentRecord, DatasetRequirementRecord, SystemDataset } from '../data/multi-case-dataset';
import type { CaseRecord, ObjectRef } from './objectRefs';
import { resolveObjectLocation } from './objectRefs';
import { getWorkflowDefinition } from './workflows';
import { stripSummaryTitleDecorators } from '../utils/summaryText';

export type ContextSupportCardKind =
  | 'case_step_context'
  | 'case_step_readiness_context'
  | 'requirement_or_evidence_gate'
  | 'requirement_status_context'
  | 'requirement_fulfillment_context'
  | 'related_entity_context'
  | 'request_intake_context'
  | 'request_authority_context'
  | 'claim_snapshot_context'
  | 'claim_benefit_context'
  | 'application_pre_submission_context'
  | 'application_pricing_context'
  | 'underwriting_debit_credit_context'
  | 'customer_verification_context'
  | 'customer_address_context'
  | 'agent_license_context'
  | 'agent_contracting_context'
  | 'agent_training_context'
  | 'risk_or_scoring_context'
  | 'interaction_or_request_context'
  | 'document_provenance_context';

export type ContextSupportCardTone = 'neutral' | 'warning' | 'danger' | 'success' | 'info';

export type ContextSupportMetric = {
  label: string;
  value: string;
};

export type ContextSupportLink = {
  label: string;
  href: string;
};

export type ContextSupportCard = {
  id: string;
  kind: ContextSupportCardKind;
  title: string;
  subtitle?: string;
  body: string;
  tone: ContextSupportCardTone;
  metrics?: ContextSupportMetric[];
  links?: ContextSupportLink[];
  priority: number;
  sourceEntity?: ObjectRef;
  layout?: 'standard' | 'summary';
};

export type TaskContextCardKind = ContextSupportCardKind;
export type TaskContextCardTone = ContextSupportCardTone;
export type TaskContextMetric = ContextSupportMetric;
export type TaskContextLink = ContextSupportLink;
export type TaskContextCard = ContextSupportCard;

export type BuildTaskContextCardsInput = {
  task: Task;
  dataset: SystemDataset;
  caseRecord?: CaseRecord;
};

export type BuildRequirementContextCardsInput = {
  requirement: DatasetRequirementRecord;
  dataset: SystemDataset;
  caseRecord?: CaseRecord;
  sourceTask?: Task;
};

export type BuildDocumentContextCardsInput = {
  document: DatasetDocumentRecord;
  dataset: SystemDataset;
  caseRecord?: CaseRecord;
  requirement?: DatasetRequirementRecord;
};

export type BuildRequestContextCardsInput = {
  request: SystemDataset['requests'][number];
  dataset: SystemDataset;
  caseRecord?: CaseRecord;
};

export type ContextAnchor =
  | { kind: 'task'; id: string; task?: Task }
  | { kind: 'requirement'; id: string; sourceTaskId?: string }
  | { kind: 'request'; id: string }
  | { kind: 'document'; id: string };

export type ResolveContextSupportCardsInput = {
  anchor: ContextAnchor;
  dataset: SystemDataset;
  caseId?: string;
  caseRecord?: CaseRecord;
};

function toObjectRefs(task: Task): ObjectRef[] {
  if (task.objectRefs?.length) return task.objectRefs;
  return (task.linkedObjects ?? []).map((ref) => ({
    kind: ref.kind,
    id: ref.id,
    label: ref.label,
    href: ref.href,
  }));
}

function touchesCase(refs: ObjectRef[], caseId?: string) {
  return Boolean(caseId && refs.some((ref) => ref.kind === 'case' && ref.id === caseId));
}

function formatRole(role?: string) {
  return role?.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function firstLink(ref?: ObjectRef): ContextSupportLink[] | undefined {
  if (!ref) return undefined;
  const href = resolveObjectLocation(ref);
  return href ? [{ label: `Open ${ref.label ?? ref.id}`, href }] : undefined;
}

function uniqueCards(cards: ContextSupportCard[]) {
  const seen = new Set<string>();
  return cards
    .sort((a, b) => b.priority - a.priority)
    .filter((card) => {
      const key = `${card.kind}:${card.sourceEntity?.kind ?? 'context'}:${card.sourceEntity?.id ?? card.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3);
}

function taskFromDatasetRecord(row: SystemDataset['tasks'][number], dataset: SystemDataset): Task {
  const caseId = row.linkedObjects.find((ref) => ref.kind === 'case')?.id;
  const caseRecord = dataset.cases.find((item) => item.id === caseId);
  return {
    id: row.id,
    taskId: row.taskId,
    priority: row.priority === 'Urgent' ? 'URGENT' : row.priority === 'High' ? 'HIGH' : 'NORMAL',
    caseType: row.caseType ?? caseRecord?.caseTypeCode ?? 'Dataset',
    caseSubtype: row.caseSubtype,
    taskType: stripSummaryTitleDecorators(row.label),
    hasAI: row.hasAI ?? Boolean(row.aiSummary),
    aiSummary: row.aiSummary,
    aiAction: row.aiAction,
    alert: row.alert,
    summary: row.summary,
    aiNarrative: row.aiNarrative,
    evidenceDocuments: row.evidenceDocuments,
    contextCards: row.contextCards,
    actions: row.actions,
    claimantName: caseRecord?.primaryParty.label ?? row.linkedObjects.find((ref) => ref.kind === 'client')?.label ?? 'N/A',
    product: row.product ?? caseRecord?.facts.find((fact) => fact.id === 'product')?.value ?? 'N/A',
    slaRemaining: row.slaRemaining ?? '2d',
    dueDate: row.dueDate,
    stage: row.stage,
    aiGenerated: row.aiGenerated,
    aiConfidence: row.aiConfidence,
    slaStatus: row.slaStatus ?? 'normal',
    status: row.status as Task['status'],
    assignedTo: row.assignee ?? row.owner ?? 'Unassigned',
    origin: row.origin ?? 'Dataset',
    createdDate: row.createdDate ?? 'Dataset',
    description: row.description,
    queue: row.queue ?? 'my_tasks',
    teamOrigin: row.teamOrigin,
    requiredAuthorityLevel: row.requiredAuthorityLevel ?? 1,
    caseId,
    linkedObjects: row.linkedObjects
      .filter((ref) => ['case', 'client', 'policy', 'agent', 'application', 'requirement', 'task', 'request', 'document', 'communication'].includes(ref.kind))
      .map((ref) => ({ kind: ref.kind as TaskLinkedObject['kind'], id: ref.id, label: ref.label ?? ref.id, href: ref.href })),
    objectRefs: row.linkedObjects,
    panelContext: {
      ...(row.panelContext ?? {
        summaryStatus: row.status,
        contextTitle: stripSummaryTitleDecorators(row.label),
        contextSummary: row.aiSummary ?? `Dataset task linked to ${caseRecord?.title ?? caseId ?? 'the active environment'}.`,
        suggestions: ['Review linked entities', 'Confirm next action', 'Update task status'],
      }),
      scoringContext: row.scoringContext ?? row.panelContext?.scoringContext,
    },
  };
}

function resolveCaseContext(dataset: SystemDataset, caseRecord?: CaseRecord, refs: ObjectRef[] = [], caseId?: string) {
  const resolvedCaseId = caseRecord?.id ?? caseId ?? refs.find((ref) => ref.kind === 'case')?.id;
  const resolvedCase = caseRecord ?? dataset.cases.find((item) => item.id === resolvedCaseId);
  const workflow = getWorkflowDefinition(resolvedCase?.workflowTemplateId);
  const activeStep = workflow?.steps.find((step) => step.id === resolvedCase?.activeStepId);
  const activePhase = workflow?.phases.find((phase) => phase.id === activeStep?.phaseId || phase.id === resolvedCase?.phaseId);
  return { caseId: resolvedCaseId, caseRecord: resolvedCase, workflow, activeStep, activePhase };
}

function resolveRelatedContext(dataset: SystemDataset, refs: ObjectRef[], caseRecord?: CaseRecord, caseId?: string) {
  const linkedRequirementIds = new Set(refs.filter((ref) => ref.kind === 'requirement').map((ref) => ref.id));
  const linkedDocumentIds = new Set(refs.filter((ref) => ref.kind === 'document').map((ref) => ref.id));
  const linkedRequestIds = new Set(refs.filter((ref) => ref.kind === 'request').map((ref) => ref.id));
  const linkedAgentIds = new Set(refs.filter((ref) => ref.kind === 'agent').map((ref) => ref.id));
  const requirements = dataset.requirements.filter((requirement) =>
    linkedRequirementIds.has(requirement.id) ||
    touchesCase(requirement.linkedObjects, caseId),
  );
  const documents = dataset.documents.filter((document) =>
    linkedDocumentIds.has(document.id) ||
    touchesCase(document.linkedObjects, caseId) ||
    requirements.some((requirement) => document.linkedRequirementId === requirement.id || document.linkedObjects.some((ref) => ref.kind === 'requirement' && ref.id === requirement.id)),
  );
  const evidenceRows = dataset.documentEvidence.filter((evidence) =>
    linkedDocumentIds.has(evidence.documentId) ||
    documents.some((document) => document.id === evidence.documentId) ||
    touchesCase(evidence.linkedObjects, caseId),
  );
  const policyRef = caseRecord?.linkedObjects.find((ref) => ref.kind === 'policy') ?? refs.find((ref) => ref.kind === 'policy');
  const applicationRef = caseRecord?.linkedObjects.find((ref) => ref.kind === 'application') ?? refs.find((ref) => ref.kind === 'application');
  const policy = dataset.policies.find((row) => row.id === policyRef?.id);
  const application = dataset.applications.find((row) => row.id === applicationRef?.id);
  const agent = dataset.agents.find((row) => linkedAgentIds.has(row.id) || caseRecord?.primaryParty.id === row.id || caseRecord?.linkedObjects.some((ref) => ref.kind === 'agent' && ref.id === row.id));
  const request = dataset.requests.find((row) =>
    linkedRequestIds.has(row.id) ||
    touchesCase(row.linkedObjects, caseId),
  );
  const clientRef = refs.find((ref) => ref.kind === 'client') ?? caseRecord?.linkedObjects.find((ref) => ref.kind === 'client') ?? (caseRecord?.primaryParty.kind === 'client' ? caseRecord.primaryParty : undefined);
  const client = dataset.clients.find((row) => row.id === clientRef?.id);
  const communication = dataset.communications.find((row) => touchesCase(row.linkedObjects, caseId));
  return { requirements, documents, evidenceRows, policy, application, agent, request, communication, client };
}

function buildWorkflowCard({
  caseRecord,
  activeStep,
  activePhase,
  fallbackStep,
  priority = 65,
}: ReturnType<typeof resolveCaseContext> & { fallbackStep?: string; priority?: number }): ContextSupportCard | undefined {
  if (!caseRecord || (!activeStep && !fallbackStep)) return undefined;
  return {
    id: 'case-step-context',
    kind: 'case_step_context',
    title: 'Workflow position',
    subtitle: activeStep?.label ?? activePhase?.label ?? fallbackStep,
    body: activeStep?.tooltip || `This work supports ${activePhase?.label ?? fallbackStep ?? 'the current workflow step'}.`,
    tone: caseRecord.priority === 'High' ? 'warning' : 'info',
    priority,
    metrics: [
      { label: 'Phase', value: activePhase?.label ?? caseRecord.phaseId ?? 'Current' },
      { label: 'Status', value: caseRecord.status },
    ],
    links: [{ label: 'Open case', href: `/cases/${caseRecord.id}` }],
  };
}

function buildRequirementGateCard({
  requirements,
  documents,
  evidenceRows,
  activeStepLabel,
  caseId,
  priority = 90,
}: {
  requirements: DatasetRequirementRecord[];
  documents: DatasetDocumentRecord[];
  evidenceRows: SystemDataset['documentEvidence'];
  activeStepLabel?: string;
  caseId?: string;
  priority?: number;
}): ContextSupportCard | undefined {
  const openRequirements = requirements.filter((requirement) => ['Pending', 'Overdue', 'In Queue'].includes(requirement.status));
  const evidenceFindings = evidenceRows.flatMap((evidence) => evidence.findings);
  if (!requirements.length && !documents.length && !evidenceFindings.length) return undefined;
  const focusRequirement = openRequirements[0] ?? requirements[0];
  const focusDocument = documents[0];
  return {
    id: 'requirement-or-evidence-gate',
    kind: 'requirement_or_evidence_gate',
    title: focusRequirement ? 'Requirement gate' : 'Evidence gate',
    subtitle: focusRequirement?.label ?? focusDocument?.label ?? 'Linked evidence',
    body: focusRequirement
      ? `${focusRequirement.status} requirement tied to ${focusRequirement.workflowStepId ?? activeStepLabel ?? 'the current step'}.`
      : `${evidenceFindings.length} evidence finding(s) need review before this work can be completed.`,
    tone: openRequirements.length || evidenceFindings.some((finding) => finding.severity === 'High') ? 'warning' : 'info',
    priority,
    metrics: [
      { label: 'Open reqs', value: String(openRequirements.length) },
      { label: 'Documents', value: String(documents.length) },
      { label: 'Findings', value: String(evidenceFindings.length) },
    ],
    links: focusRequirement && caseId
      ? [{ label: 'Open requirements', href: `/cases/${caseId}#tab=requirements` }]
      : firstLink(focusDocument ? { kind: 'document', id: focusDocument.id, label: focusDocument.label } : undefined),
  };
}

function buildStepReadinessCard({
  caseId,
  caseRecord,
  activeStep,
  activePhase,
  requirements,
  documents,
  evidenceRows,
  fallbackStep,
  priority = 100,
}: ReturnType<typeof resolveCaseContext> & {
  requirements: DatasetRequirementRecord[];
  documents: DatasetDocumentRecord[];
  evidenceRows: SystemDataset['documentEvidence'];
  fallbackStep?: string;
  priority?: number;
}): ContextSupportCard | undefined {
  if (!caseRecord && !fallbackStep) return undefined;
  const totalRequirements = requirements.length;
  const openRequirements = requirements.filter((requirement) => ['Pending', 'Overdue', 'In Queue'].includes(requirement.status));
  const fulfilledRequirements = requirements.filter((requirement) => ['Fulfilled', 'Waived', 'Completed'].includes(requirement.status));
  const blocker = openRequirements[0];
  const stepLabel = activeStep?.label ?? fallbackStep ?? activePhase?.label ?? 'Current step';
  const requirementProgress = totalRequirements
    ? `${fulfilledRequirements.length}/${totalRequirements} fulfilled`
    : 'No linked requirements';
  return {
    id: `case-step-readiness-${caseRecord?.id ?? stepLabel}`,
    kind: 'case_step_readiness_context',
    title: 'Step readiness',
    subtitle: stepLabel,
    body: blocker
      ? `${blocker.label} is blocking this step. Complete the requirement before moving forward.`
      : `${requirementProgress}; ${documents.length} document(s) and ${evidenceRows.flatMap((evidence) => evidence.findings).length} finding(s) are linked to this step.`,
    tone: openRequirements.length ? 'warning' : 'success',
    priority,
    layout: 'summary',
    sourceEntity: caseRecord ? { kind: 'case', id: caseRecord.id, label: caseRecord.title } : undefined,
    metrics: [
      { label: 'Status', value: caseRecord?.status ?? 'Current' },
      { label: 'Requirements', value: totalRequirements ? `${fulfilledRequirements.length}/${totalRequirements}` : '0' },
      { label: 'Open', value: String(openRequirements.length) },
      { label: 'Docs', value: String(documents.length) },
    ],
    links: caseId ? [{ label: openRequirements.length ? 'Open requirements' : 'Open case', href: openRequirements.length ? `/cases/${caseId}#tab=requirements` : `/cases/${caseId}` }] : undefined,
  };
}

function primaryPartyRole(dataset: SystemDataset, caseRecord?: CaseRecord, policy?: SystemDataset['policies'][number], task?: Task) {
  void dataset;
  const roles = caseRecord?.primaryParty.kind === 'client'
    ? policy?.participants
      .filter((participant) => participant.clientId === caseRecord.primaryParty.id)
      .map((participant) => formatRole(participant.role))
      .filter((role): role is string => Boolean(role))
    : [];
  return task?.claimantPolicyRole ?? caseRecord?.primaryParty.policyRole ?? roles?.find((role) => role === 'Insured' || role === 'Beneficiary') ?? roles?.[0];
}

function buildRelatedEntityCard({
  dataset,
  task,
  caseRecord,
  policy,
  application,
  agent,
  request,
  priority = 85,
}: {
  dataset: SystemDataset;
  task?: Task;
  caseRecord?: CaseRecord;
  policy?: SystemDataset['policies'][number];
  application?: SystemDataset['applications'][number];
  agent?: SystemDataset['agents'][number];
  request?: SystemDataset['requests'][number];
  priority?: number;
}): ContextSupportCard | undefined {
  if (!policy && !application && !agent && !request) return undefined;
  const role = primaryPartyRole(dataset, caseRecord, policy, task);
  const isAgentContext = Boolean(agent) && (caseRecord?.caseKind === 'agent_onboarding' || task?.taskType.toLowerCase().includes('contract'));
  const title = isAgentContext ? 'Agent readiness' : request ? 'Request and policy context' : application ? 'Application context' : 'Policy context';
  const body = isAgentContext
    ? `${agent?.licenses.filter((license) => license.status === 'active').length ?? 0} active license(s), ${agent?.licenses.filter((license) => license.status === 'pending').length ?? 0} pending, and ${agent?.contracts.length ?? 0} contract(s) on file.`
    : request
      ? `${request.label} is ${request.status}; confirm authority and linked policy context before acting.`
      : application
        ? `${application.label} is ${application.status} for ${application.product}.`
        : `${policy?.product ?? task?.product ?? 'Policy'} context for ${caseRecord?.primaryParty.label ?? task?.claimantName ?? 'the primary party'}${role ? ` (${role})` : ''}.`;
  return {
    id: 'related-entity-context',
    kind: 'related_entity_context',
    title,
    subtitle: agent?.name ?? request?.label ?? application?.label ?? policy?.label,
    body,
    tone: isAgentContext || request?.status.includes('Pending') || application?.status.includes('Incomplete') ? 'warning' : 'neutral',
    priority,
    metrics: [
      ...(role ? [{ label: 'Role', value: role }] : []),
      ...(policy?.coverageAmount || policy?.monthlyBenefit ? [{ label: 'Value', value: policy.coverageAmount ?? policy.monthlyBenefit ?? '' }] : []),
      ...(application?.status ? [{ label: 'App status', value: application.status }] : []),
    ],
    links: firstLink(agent ? { kind: 'agent', id: agent.id, label: agent.name } : request ? { kind: 'request', id: request.id, label: request.label } : application ? { kind: 'application', id: application.id, label: application.label } : policy ? { kind: 'policy', id: policy.id, label: policy.label } : undefined),
  };
}

function buildInteractionCard(request?: SystemDataset['requests'][number], communication?: SystemDataset['communications'][number], priority = 60): ContextSupportCard | undefined {
  if (!request && !communication) return undefined;
  return {
    id: 'interaction-or-request-context',
    kind: 'interaction_or_request_context',
    title: request ? 'Request trail' : 'Interaction trail',
    subtitle: request?.source ?? communication?.channel,
    body: request?.aiSummary ?? communication?.subject ?? 'Review the latest interaction before taking action.',
    tone: request?.priority === 'High' ? 'warning' : 'neutral',
    priority,
    metrics: [
      ...(request?.status ? [{ label: 'Status', value: request.status }] : []),
      ...(communication?.status ? [{ label: 'Comms', value: communication.status }] : []),
    ],
    links: request ? firstLink({ kind: 'request', id: request.id, label: request.label }) : undefined,
  };
}

type RelatedContext = ReturnType<typeof resolveRelatedContext>;

function firstFact(caseRecord: CaseRecord | undefined, ids: string[], fallbackCategory?: string) {
  return caseRecord?.facts.find((fact) => ids.includes(fact.id)) ?? caseRecord?.facts.find((fact) => fact.category === fallbackCategory);
}

function buildClaimContextCards(caseRecord: CaseRecord, related: RelatedContext): ContextSupportCard[] {
  const cards: ContextSupportCard[] = [];
  const claimDetails = caseRecord.claimDetails;
  if (claimDetails) {
    cards.push({
      id: `claim-snapshot-${caseRecord.id}`,
      kind: 'claim_snapshot_context',
      title: 'Claim snapshot',
      subtitle: claimDetails.claimNumber ?? caseRecord.id,
      body: `${claimDetails.cause ?? 'Claim'} with disability onset ${claimDetails.disabilityOnset ?? claimDetails.dateOfLoss ?? 'not captured'}.`,
      tone: 'info',
      priority: 88,
      sourceEntity: { kind: 'case', id: caseRecord.id, label: caseRecord.title },
      metrics: [
        { label: 'Onset', value: claimDetails.disabilityOnset ?? claimDetails.dateOfLoss ?? 'N/A' },
        { label: 'Cause', value: claimDetails.cause ?? 'N/A' },
        { label: 'Claim end', value: claimDetails.claimEndDate ?? 'Open' },
      ],
      links: [{ label: 'Open claim', href: `/cases/${caseRecord.id}` }],
    });
    cards.push({
      id: `claim-benefit-${caseRecord.id}`,
      kind: 'claim_benefit_context',
      title: 'Benefit context',
      subtitle: related.policy?.label ?? related.policy?.policyNumber,
      body: `Use the payment trajectory before recording a decision: ${claimDetails.paidBenefits?.length ?? 0} paid item(s), ${claimDetails.plannedBenefits?.length ?? 0} planned.`,
      tone: 'neutral',
      priority: 82,
      sourceEntity: { kind: 'case', id: caseRecord.id, label: caseRecord.title },
      metrics: [
        { label: 'Benefit', value: related.policy?.monthlyBenefit ?? related.policy?.coverageAmount ?? 'N/A' },
        { label: 'Paid', value: String(claimDetails.paidBenefits?.length ?? 0) },
        { label: 'Planned', value: String(claimDetails.plannedBenefits?.length ?? 0) },
      ],
      links: firstLink(related.policy ? { kind: 'policy', id: related.policy.id, label: related.policy.label } : undefined),
    });
  }
  return cards;
}

function buildApplicationContextCards(caseRecord: CaseRecord, related: RelatedContext): ContextSupportCard[] {
  const cards: ContextSupportCard[] = [];
  if (related.application) {
    cards.push({
      id: `application-pre-submission-${related.application.id}`,
      kind: 'application_pre_submission_context',
      title: 'Application readiness',
      subtitle: related.application.label,
      body: `${related.application.status} application for ${related.application.product}; resolve intake requirements before submission.`,
      tone: related.application.status.toLowerCase().includes('incomplete') ? 'warning' : 'info',
      priority: 88,
      sourceEntity: { kind: 'application', id: related.application.id, label: related.application.label },
      metrics: [
        { label: 'Status', value: related.application.status },
        { label: 'Product', value: related.application.product },
        { label: 'Advisor', value: related.agent?.name ?? 'N/A' },
      ],
      links: firstLink({ kind: 'application', id: related.application.id, label: related.application.label }),
    });
  }
  if (caseRecord.underwritingScoring) {
    cards.push({
      id: `application-pricing-${caseRecord.id}`,
      kind: 'application_pricing_context',
      title: 'Pricing readiness',
      subtitle: caseRecord.underwritingScoring.mappedDecision,
      body: caseRecord.underwritingScoring.aiComparison?.narrative ?? 'Review intake debits and credits before submission.',
      tone: caseRecord.underwritingScoring.netScore >= 100 ? 'warning' : 'info',
      priority: 86,
      sourceEntity: { kind: 'case', id: caseRecord.id, label: caseRecord.title },
      metrics: [
        { label: 'Net', value: `+${caseRecord.underwritingScoring.netScore}` },
        { label: 'Debits', value: String(caseRecord.underwritingScoring.debits.length) },
        { label: 'Credits', value: String(caseRecord.underwritingScoring.credits.length) },
      ],
      links: [{ label: 'Open scoring', href: `/cases/${caseRecord.id}#tab=scoring` }],
    });
  }
  return cards;
}

function buildCustomerServiceContextCards(caseRecord: CaseRecord, related: RelatedContext): ContextSupportCard[] {
  const cards: ContextSupportCard[] = [];
  const verificationFact = firstFact(caseRecord, ['verification', 'authority', 'identity'], 'verification');
  if (related.request || verificationFact) {
    cards.push({
      id: `customer-verification-${caseRecord.id}`,
      kind: 'customer_verification_context',
      title: 'Verification context',
      subtitle: related.request?.category ?? verificationFact?.label,
      body: related.request?.nextAction ?? verificationFact?.value ?? 'Confirm authority before applying service updates.',
      tone: related.request?.status.includes('Pending') ? 'warning' : 'info',
      priority: 90,
      sourceEntity: related.request ? { kind: 'request', id: related.request.id, label: related.request.label } : { kind: 'case', id: caseRecord.id, label: caseRecord.title },
      metrics: [
        ...(related.request?.status ? [{ label: 'Request', value: related.request.status }] : []),
        ...(related.request?.requester ? [{ label: 'Requester', value: related.request.requester }] : []),
        { label: 'Priority', value: related.request?.priority ?? caseRecord.priority ?? 'Normal' },
      ],
      links: related.request ? firstLink({ kind: 'request', id: related.request.id, label: related.request.label }) : [{ label: 'Open case', href: `/cases/${caseRecord.id}` }],
    });
  }
  const address = related.client?.profile?.address ?? related.client?.profile?.location;
  if (related.request?.category?.toLowerCase().includes('address') || address) {
    cards.push({
      id: `customer-address-${caseRecord.id}`,
      kind: 'customer_address_context',
      title: 'Address context',
      subtitle: related.client?.name ?? caseRecord.primaryParty.label,
      body: address ? `Current client address on file: ${address}. Confirm requested change before writing back.` : 'Address change requested; confirm current and requested locations before applying updates.',
      tone: 'neutral',
      priority: 84,
      sourceEntity: related.client ? { kind: 'client', id: related.client.id, label: related.client.name } : { kind: 'case', id: caseRecord.id, label: caseRecord.title },
      metrics: [
        { label: 'Client', value: related.client?.name ?? caseRecord.primaryParty.label ?? 'N/A' },
        { label: 'Location', value: related.client?.profile?.location ?? 'N/A' },
      ],
      links: firstLink(related.client ? { kind: 'client', id: related.client.id, label: related.client.name } : undefined),
    });
  }
  return cards;
}

function buildAgentOnboardingContextCards(caseRecord: CaseRecord, related: RelatedContext): ContextSupportCard[] {
  const agent = related.agent;
  if (!agent) return [];
  const pendingLicenses = agent.licenses.filter((license) => license.status === 'pending');
  const activeLicenses = agent.licenses.filter((license) => license.status === 'active');
  const draftContracts = agent.contracts.filter((contract) => contract.status === 'draft');
  return [
    {
      id: `agent-license-${agent.id}`,
      kind: 'agent_license_context',
      title: 'License readiness',
      subtitle: agent.jurisdictionSummary ?? agent.name,
      body: pendingLicenses.length ? `${pendingLicenses.length} jurisdiction(s) still pending before appointment activation.` : 'Licenses are active for the onboarding context.',
      tone: pendingLicenses.length ? 'warning' : 'success',
      priority: 90,
      sourceEntity: { kind: 'agent', id: agent.id, label: agent.name },
      metrics: [
        { label: 'Active', value: String(activeLicenses.length) },
        { label: 'Pending', value: String(pendingLicenses.length) },
        { label: 'Status', value: agent.status },
      ],
      links: firstLink({ kind: 'agent', id: agent.id, label: agent.name }),
    },
    {
      id: `agent-contracting-${agent.id}`,
      kind: 'agent_contracting_context',
      title: 'Contracting context',
      subtitle: agent.agencyName,
      body: draftContracts.length ? 'Draft carrier contract needs review before appointment activation.' : 'Carrier contracts are available for onboarding review.',
      tone: draftContracts.length ? 'warning' : 'neutral',
      priority: 86,
      sourceEntity: { kind: 'agent', id: agent.id, label: agent.name },
      metrics: [
        { label: 'Contracts', value: String(agent.contracts.length) },
        { label: 'Draft', value: String(draftContracts.length) },
      ],
      links: firstLink({ kind: 'agent', id: agent.id, label: agent.name }),
    },
  ];
}

function buildCaseTypeContextCards({
  caseRecord,
  related,
}: {
  caseRecord?: CaseRecord;
  related: RelatedContext;
}): ContextSupportCard[] {
  if (!caseRecord) return [];
  if (caseRecord.caseKind === 'claim') return buildClaimContextCards(caseRecord, related);
  if (caseRecord.caseKind === 'new_business') return buildApplicationContextCards(caseRecord, related);
  if (caseRecord.caseKind === 'customer_service') return buildCustomerServiceContextCards(caseRecord, related);
  if (caseRecord.caseKind === 'agent_onboarding') return buildAgentOnboardingContextCards(caseRecord, related);
  return [];
}

export function buildTaskContextCards({ task, dataset, caseRecord }: BuildTaskContextCardsInput): ContextSupportCard[] {
  const refs = toObjectRefs(task);
  const { caseId, caseRecord: resolvedCase, workflow, activeStep, activePhase } = resolveCaseContext(dataset, caseRecord, refs, task.caseId);
  const { requirements, documents, evidenceRows, policy, application, agent, request, communication, client } = resolveRelatedContext(dataset, refs, resolvedCase, caseId);
  const cards: ContextSupportCard[] = [];

  const stepReadinessCard = buildStepReadinessCard({
    caseId,
    caseRecord: resolvedCase,
    workflow,
    activeStep,
    activePhase,
    requirements,
    documents,
    evidenceRows,
    fallbackStep: task.origin,
    priority: 100,
  });
  if (stepReadinessCard) cards.push(stepReadinessCard);

  const domainCards = buildCaseTypeContextCards({
    caseRecord: resolvedCase,
    related: { requirements, documents, evidenceRows, policy, application, agent, request, communication, client },
  });
  cards.push(...domainCards.filter((card) => card.kind !== 'claim_snapshot_context' && card.kind !== 'claim_benefit_context'));

  const relatedCard = domainCards.length ? undefined : buildRelatedEntityCard({ dataset, task, caseRecord: resolvedCase, policy, application, agent, request, priority: agent || request || application ? 85 : 75 });
  if (relatedCard) cards.push(relatedCard);

  const interactionCard = buildInteractionCard(request, communication, resolvedCase?.caseKind === 'customer_service' || resolvedCase?.caseKind === 'new_business' ? 80 : 60);
  if (interactionCard) cards.push(interactionCard);

  return uniqueCards(cards);
}

export function buildRequirementContextCards({ requirement, dataset, caseRecord, sourceTask }: BuildRequirementContextCardsInput): ContextSupportCard[] {
  const { caseId, caseRecord: resolvedCase, workflow, activeStep, activePhase } = resolveCaseContext(dataset, caseRecord, requirement.linkedObjects);
  const documents = dataset.documents.filter((document) =>
    document.linkedRequirementId === requirement.id ||
    document.linkedObjects.some((ref) => ref.kind === 'requirement' && ref.id === requirement.id) ||
    touchesCase(document.linkedObjects, caseId),
  );
  const evidenceRows = dataset.documentEvidence.filter((evidence) =>
    documents.some((document) => document.id === evidence.documentId) ||
    evidence.linkedObjects.some((ref) => ref.kind === 'requirement' && ref.id === requirement.id),
  );
  const related = resolveRelatedContext(dataset, requirement.linkedObjects, resolvedCase, caseId);
  const cards: ContextSupportCard[] = [];
  const stepReadinessCard = buildStepReadinessCard({
    caseId,
    caseRecord: resolvedCase,
    workflow,
    activeStep,
    activePhase,
    requirements: [requirement],
    documents,
    evidenceRows,
    fallbackStep: requirement.workflowStepId ?? requirement.phase,
    priority: 100,
  });
  if (stepReadinessCard) cards.push(stepReadinessCard);
  cards.push({
    id: `requirement-status-${requirement.id}`,
    kind: 'requirement_status_context',
    title: 'Requirement status',
    subtitle: requirement.label,
    body: `${requirement.status} ${requirement.category} requirement${requirement.dueDate ? ` due ${requirement.dueDate}` : ''}.`,
    tone: ['Overdue', 'Pending', 'In Queue'].includes(requirement.status) ? 'warning' : 'success',
    priority: 96,
    sourceEntity: { kind: 'requirement', id: requirement.id, label: requirement.label },
    metrics: [
      { label: 'Status', value: requirement.status },
      { label: 'RAG', value: requirement.rag ?? 'N/A' },
      { label: 'Follow-up', value: requirement.followUpDate ?? 'N/A' },
    ],
    links: caseId ? [{ label: 'Open requirement', href: `/cases/${caseId}#tab=requirements&req=${encodeURIComponent(requirement.id)}` }] : undefined,
  });
  cards.push({
    id: `requirement-fulfillment-${requirement.id}`,
    kind: 'requirement_fulfillment_context',
    title: 'Fulfillment context',
    subtitle: requirement.source ?? requirement.trigger,
    body: requirement.trigger
      ? `${requirement.trigger} is the reason this requirement is needed before the case can progress.`
      : 'Review source evidence and mark fulfilled only when the supporting record is complete.',
    tone: requirement.status === 'Fulfilled' || requirement.status === 'Waived' ? 'success' : 'info',
    priority: 72,
    sourceEntity: { kind: 'requirement', id: requirement.id, label: requirement.label },
    metrics: [
      { label: 'Source', value: requirement.source ?? 'Dataset' },
      { label: 'Step', value: requirement.workflowStepId ?? requirement.phase ?? 'Current' },
    ],
  });
  const domainCards = buildCaseTypeContextCards({ caseRecord: resolvedCase, related })
    .filter((card) => card.kind !== 'claim_snapshot_context' && card.kind !== 'claim_benefit_context');
  cards.push(...domainCards);
  const relatedCard = domainCards.length ? undefined : buildRelatedEntityCard({ dataset, task: sourceTask, caseRecord: resolvedCase, policy: related.policy, application: related.application, agent: related.agent, request: related.request, priority: 85 });
  if (relatedCard) cards.push(relatedCard);
  const interactionCard = buildInteractionCard(related.request, related.communication, 60);
  if (interactionCard) cards.push(interactionCard);
  return uniqueCards(cards);
}

export function buildDocumentContextCards({ document, dataset, caseRecord, requirement }: BuildDocumentContextCardsInput): ContextSupportCard[] {
  const refs = document.linkedObjects;
  const { caseId, caseRecord: resolvedCase, workflow, activeStep, activePhase } = resolveCaseContext(dataset, caseRecord, refs, document.linkedCaseId);
  const linkedRequirement = requirement ?? dataset.requirements.find((row) =>
    row.id === document.linkedRequirementId ||
    refs.some((ref) => ref.kind === 'requirement' && ref.id === row.id) ||
    document.linkedRequirement === row.label,
  );
  const evidenceRows = dataset.documentEvidence.filter((evidence) => evidence.documentId === document.id);
  const related = resolveRelatedContext(dataset, refs, resolvedCase, caseId);
  const cards: ContextSupportCard[] = [];

  const stepReadinessCard = buildStepReadinessCard({
    caseId,
    caseRecord: resolvedCase,
    workflow,
    activeStep,
    activePhase,
    requirements: linkedRequirement ? [linkedRequirement] : [],
    documents: [document],
    evidenceRows,
    fallbackStep: linkedRequirement?.workflowStepId,
    priority: 90,
  });
  if (stepReadinessCard) cards.push(stepReadinessCard);

  if (document.scoringContext) {
    cards.push({
      id: 'risk-or-scoring-context',
      kind: 'risk_or_scoring_context',
      title: 'Scoring impact',
      subtitle: document.scoringContext.mappedDecision,
      body: document.scoringContext.suggestedAdjustments?.[0] ?? 'Review the extracted scoring impact before using this evidence.',
      tone: document.scoringContext.netScore >= 100 ? 'danger' : 'warning',
      priority: 88,
      metrics: [
        { label: 'Net', value: `+${document.scoringContext.netScore}` },
        { label: 'Decision', value: document.scoringContext.mappedDecision },
      ],
      links: [{ label: 'Open scoring', href: `/cases/${document.scoringContext.caseId}#tab=scoring` }],
    });
  }

  if (!document.fileAvailable || document.placeholderReason || document.source) {
    cards.push({
      id: 'document-provenance-context',
      kind: 'document_provenance_context',
      title: 'Document provenance',
      subtitle: document.source ?? 'Source not provided',
      body: document.fileAvailable
        ? document.aiAction ?? 'File is available for evidence review.'
        : document.placeholderReason ?? 'Only document metadata is available; import the file before completing evidence review.',
      tone: document.fileAvailable ? 'info' : 'warning',
      priority: 80,
      metrics: [
        { label: 'Status', value: document.status },
        { label: 'File', value: document.fileAvailable ? 'Available' : 'Metadata only' },
      ],
      links: caseId ? [{ label: 'Open case documents', href: `/cases/${caseId}#tab=documents` }] : undefined,
    });
  }

  const domainCards = buildCaseTypeContextCards({ caseRecord: resolvedCase, related });
  cards.push(...domainCards);
  const relatedCard = domainCards.length ? undefined : buildRelatedEntityCard({ dataset, caseRecord: resolvedCase, policy: related.policy, application: related.application, agent: related.agent, request: related.request, priority: 65 });
  if (relatedCard) cards.push(relatedCard);

  return uniqueCards(cards);
}

export function buildRequestContextCards({ request, dataset, caseRecord }: BuildRequestContextCardsInput): ContextSupportCard[] {
  const { caseId, caseRecord: resolvedCase, workflow, activeStep, activePhase } = resolveCaseContext(dataset, caseRecord, request.linkedObjects);
  const related = resolveRelatedContext(dataset, request.linkedObjects, resolvedCase, caseId);
  const cards: ContextSupportCard[] = [];
  const stepReadinessCard = buildStepReadinessCard({
    caseId,
    caseRecord: resolvedCase,
    workflow,
    activeStep,
    activePhase,
    requirements: related.requirements,
    documents: related.documents,
    evidenceRows: related.evidenceRows,
    fallbackStep: request.nextAction ?? request.category,
    priority: 100,
  });
  if (stepReadinessCard) cards.push(stepReadinessCard);
  cards.push({
    id: `request-intake-${request.id}`,
    kind: 'request_intake_context',
    title: 'Request intake',
    subtitle: request.sourceChannel ?? request.source,
    body: request.aiSummary ?? `Review ${request.label} from ${request.source} before completing the request.`,
    tone: request.priority === 'High' || request.priority === 'Urgent' ? 'warning' : 'info',
    priority: 96,
    sourceEntity: { kind: 'request', id: request.id, label: request.label },
    metrics: [
      { label: 'Status', value: request.status },
      { label: 'Priority', value: request.priority ?? 'Normal' },
      { label: 'Due', value: request.due ?? 'N/A' },
    ],
    links: [{ label: 'Open request', href: `/requests#request=${encodeURIComponent(request.id)}` }],
  });
  if (request.requester || request.policyNumber || related.policy) {
    cards.push({
      id: `request-authority-${request.id}`,
      kind: 'request_authority_context',
      title: 'Requester authority',
      subtitle: request.requester ?? related.policy?.label,
      body: request.nextAction ?? 'Confirm the requester, policy relationship, and authority before applying updates.',
      tone: request.status.includes('Pending') ? 'warning' : 'neutral',
      priority: resolvedCase?.caseKind === 'customer_service' ? 82 : 94,
      sourceEntity: { kind: 'request', id: request.id, label: request.label },
      metrics: [
        ...(request.requester ? [{ label: 'Requester', value: request.requester }] : []),
        ...(request.policyNumber ? [{ label: 'Policy', value: request.policyNumber }] : []),
        ...(related.policy?.status ? [{ label: 'Policy status', value: related.policy.status }] : []),
      ],
      links: related.policy ? firstLink({ kind: 'policy', id: related.policy.id, label: related.policy.label }) : undefined,
    });
  }

  const interactionCard = buildInteractionCard(request, related.communication, resolvedCase?.caseKind === 'customer_service' ? 78 : 95);
  if (interactionCard) cards.push(interactionCard);

  const domainCards = buildCaseTypeContextCards({ caseRecord: resolvedCase, related });
  cards.push(...domainCards);

  const relatedCard = domainCards.length ? undefined : buildRelatedEntityCard({
    dataset,
    caseRecord: resolvedCase,
    policy: related.policy,
    application: related.application,
    agent: related.agent,
    request,
    priority: 90,
  });
  if (relatedCard) cards.push(relatedCard);

  return uniqueCards(cards);
}

export function resolveContextSupportCards({ anchor, dataset, caseId, caseRecord }: ResolveContextSupportCardsInput): ContextSupportCard[] {
  const resolvedCase = caseRecord ?? (caseId ? dataset.cases.find((item) => item.id === caseId) : undefined);
  if (anchor.kind === 'task') {
    const task = anchor.task ?? dataset.tasks.find((row) => row.id === anchor.id && (!caseId || touchesCase(row.linkedObjects, caseId)));
    if (!task) return [];
    return buildTaskContextCards({
      task: 'kind' in task ? taskFromDatasetRecord(task, dataset) : task,
      dataset,
      caseRecord: resolvedCase,
    });
  }
  if (anchor.kind === 'requirement') {
    const requirement = dataset.requirements.find((row) => row.id === anchor.id && (!caseId || touchesCase(row.linkedObjects, caseId)));
    if (!requirement) return [];
    const sourceTaskRecord = anchor.sourceTaskId ? dataset.tasks.find((row) => row.id === anchor.sourceTaskId) : undefined;
    const sourceTask = sourceTaskRecord ? taskFromDatasetRecord(sourceTaskRecord, dataset) : undefined;
    return buildRequirementContextCards({ requirement, dataset, caseRecord: resolvedCase, sourceTask });
  }
  if (anchor.kind === 'request') {
    const request = dataset.requests.find((row) => row.id === anchor.id && (!caseId || touchesCase(row.linkedObjects, caseId)));
    if (!request) return [];
    return buildRequestContextCards({ request, dataset, caseRecord: resolvedCase });
  }
  const document = dataset.documents.find((row) => row.id === anchor.id && (!caseId || row.linkedCaseId === caseId || touchesCase(row.linkedObjects, caseId)));
  if (!document) return [];
  const requirement = dataset.requirements.find((row) => row.id === document.linkedRequirementId || document.linkedObjects.some((ref) => ref.kind === 'requirement' && ref.id === row.id));
  return buildDocumentContextCards({ document, dataset, caseRecord: resolvedCase, requirement });
}
