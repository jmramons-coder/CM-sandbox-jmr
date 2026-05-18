import type { CaseKind, CaseRecord, ClaimSubType, ObjectRef, WorkObjectKind } from '../domain/objectRefs';
import { caseTypeCodeForClaimSubType } from '../domain/claimSubTypes';
import type {
  ActivityEventRecord,
  AgentRecord,
  ApplicationRecord,
  ClientRecord,
  CommunicationRecord,
  DatasetDocumentRecord,
  DatasetRequestRecord,
  DatasetRequirementRecord,
  DatasetTaskRecord,
  NoteRecord,
  PolicyRecord,
  SystemDataset,
} from './multi-case-dataset';
import { getScenarioPackForProfile } from './scenarioPacks';
import { deriveAiActionsFromDataset } from './objectRepository';
import { validateSystemDataset } from './dataQualityGuards';
import { workflowTemplateIdForClaim } from '../domain/workflows';

export type DocumentGenerationMode = 'metadata_only' | 'sample_files' | 'imported_files';

export interface DatasetGenerationProfile {
  id: string;
  label: string;
  organizationLabel: string;
  targetRecordCount: number;
  enabledBusinessLines: CaseKind[];
  enabledEntities: WorkObjectKind[];
  enabledModules: Array<'cases' | 'tasks' | 'requests' | 'documents' | 'communications'>;
  distribution: Partial<Record<CaseKind, number>>;
  documentMode: DocumentGenerationMode;
}

export interface DatasetGenerationPreview {
  profileId: string;
  label: string;
  targetRecordCount: number;
  entityCounts: Record<WorkObjectKind, number>;
  businessLineCounts: Record<CaseKind, number>;
  documentMode: DocumentGenerationMode;
}

/** Optional simulation profile for advanced data-context generation (not used in the default demo). */
export const DATASET_GENERATION_PROFILES: DatasetGenerationProfile[] = [
  {
    id: 'custom-simulation',
    label: 'Custom simulation',
    organizationLabel: 'Custom',
    targetRecordCount: 500,
    enabledBusinessLines: ['claim', 'new_business'],
    enabledEntities: ['case', 'client', 'policy', 'agent', 'application', 'requirement', 'task', 'request', 'document', 'communication', 'note', 'event'],
    enabledModules: ['cases', 'tasks', 'requests', 'documents', 'communications'],
    distribution: { claim: 0.5, new_business: 0.5, customer_service: 0, agent_onboarding: 0 },
    documentMode: 'metadata_only',
  },
];

const ENTITY_MULTIPLIERS: Partial<Record<WorkObjectKind, number>> = {
  case: 0.12,
  client: 0.16,
  policy: 0.14,
  agent: 0.04,
  application: 0.08,
  requirement: 0.22,
  task: 0.18,
  request: 0.08,
  document: 0.16,
  communication: 0.18,
  note: 0.12,
  event: 0.22,
};

export function previewDatasetGeneration(profile: DatasetGenerationProfile): DatasetGenerationPreview {
  const entityCounts = profile.enabledEntities.reduce<Record<WorkObjectKind, number>>((counts, entity) => {
    counts[entity] = Math.max(0, Math.round(profile.targetRecordCount * (ENTITY_MULTIPLIERS[entity] ?? 0.05)));
    return counts;
  }, {
    case: 0,
    client: 0,
    policy: 0,
    agent: 0,
    application: 0,
    requirement: 0,
    task: 0,
    request: 0,
    document: 0,
    communication: 0,
    note: 0,
    event: 0,
  });

  const businessLineCounts = profile.enabledBusinessLines.reduce<Record<CaseKind, number>>((counts, kind) => {
    counts[kind] = Math.max(1, Math.round(entityCounts.case * (profile.distribution[kind] ?? 0)));
    return counts;
  }, {
    claim: 0,
    new_business: 0,
    customer_service: 0,
    agent_onboarding: 0,
  });

  return {
    profileId: profile.id,
    label: profile.label,
    targetRecordCount: profile.targetRecordCount,
    entityCounts,
    businessLineCounts,
    documentMode: profile.documentMode,
  };
}

export function generateDatasetFromProfile(profile: DatasetGenerationProfile): SystemDataset {
  const preview = previewDatasetGeneration(profile);
  const pack = getScenarioPackForProfile(profile);
  const clientCount = Math.max(5, preview.entityCounts.client);
  const agentCount = Math.max(2, preview.entityCounts.agent || Math.round(clientCount * 0.2));
  const policyCount = Math.max(3, preview.entityCounts.policy);
  const caseCount = Math.max(profile.enabledBusinessLines.length, preview.entityCounts.case);
  const clients = Array.from({ length: clientCount }, (_, index): ClientRecord => {
    const name = pack.personas[index % pack.personas.length] ?? `Client ${index + 1}`;
    return {
      id: `CLI-GEN-${index + 1}`,
      kind: 'client',
      name: index < pack.personas.length ? name : `${name} ${Math.floor(index / pack.personas.length) + 1}`,
      type: index % 9 === 0 ? 'organization' : 'person',
      status: index % 11 === 0 ? 'inactive' : 'active',
      category: index % 9 === 0 ? 'organization' : index % 5 === 0 ? 'relatedParty' : 'policyholder',
      language: index % 3 === 0 ? 'French' : 'English',
      summary: `${pack.market} ${pack.businessModel} participant generated for ${profile.label}.`,
      profile: {
        gender: index % 2 === 0 ? 'Male' : 'Female',
        dob: `19${70 + (index % 25)}-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}`,
        age: 30 + (index % 35),
        location: pack.market,
        email: `client${index + 1}@example.com`,
        phone: `+1 555 ${String(1000 + index).slice(-4)}`,
        address: `${100 + index} Generated Avenue`,
      },
      linkedObjects: [],
    };
  });
  const agents = Array.from({ length: agentCount }, (_, index): AgentRecord => ({
    id: `AGT-GEN-${index + 1}`,
    kind: 'agent',
    name: pack.personas[(index + 2) % pack.personas.length] ?? `Agent ${index + 1}`,
    status: index % 5 === 0 ? 'onboarding' : 'active',
    producerCode: `PRD-GEN-${1000 + index}`,
    agencyName: pack.agencies[index % pack.agencies.length],
    email: `agent${index + 1}@example.com`,
    phone: `+1 555 ${String(8000 + index).slice(-4)}`,
    licenses: [
      { id: `LIC-GEN-${index + 1}`, jurisdiction: pack.market, status: index % 4 === 0 ? 'pending' : 'active', effectiveDate: '2025-01-01' },
    ],
    contracts: [
      { id: `CON-GEN-${index + 1}`, carrier: profile.organizationLabel, status: index % 4 === 0 ? 'draft' : 'active', effectiveDate: '2025-01-01' },
    ],
    linkedObjects: [],
  }));
  const policies = Array.from({ length: policyCount }, (_, index): PolicyRecord => {
    const client = clients[index % clients.length];
    const agent = agents[index % agents.length];
    return {
      id: `POL-GEN-${index + 1}`,
      kind: 'policy',
      label: `POL-GEN-${index + 1}`,
      status: index % 5 === 0 ? 'Draft' : 'Active',
      product: pack.products[index % pack.products.length],
      policyNumber: `POL-GEN-${index + 1}`,
      productType: pack.products[index % pack.products.length],
      monthlyBenefit: index % 3 === 0 ? `$${(2500 + index * 100).toLocaleString()}` : undefined,
      coverageAmount: `$${(100000 + index * 25000).toLocaleString()}`,
      clientId: client.id,
      participants: [
        { clientId: client.id, role: 'owner', effectiveDate: '2025-01-01' },
        { clientId: client.id, role: 'insured', effectiveDate: '2025-01-01' },
      ],
      agents: [{ kind: 'agent', id: agent.id, label: agent.name, role: 'servicing agent' }],
      linkedObjects: [{ kind: 'client', id: client.id, label: client.name }, { kind: 'agent', id: agent.id, label: agent.name }],
    };
  });
  const cases = Array.from({ length: caseCount }, (_, index): CaseRecord => {
    const caseKind = profile.enabledBusinessLines[index % profile.enabledBusinessLines.length];
    const claimSubType: ClaimSubType | undefined =
      caseKind === 'claim' ? (index % 7 === 0 ? 'death' : 'disability_benefit') : undefined;
    const client = clients[index % clients.length];
    const policy = policies[index % policies.length];
    const agent = agents[index % agents.length];
    const primaryParty: ObjectRef = caseKind === 'agent_onboarding'
      ? { kind: 'agent', id: agent.id, label: agent.name, role: 'agent' }
      : { kind: 'client', id: client.id, label: client.name, role: getPrimaryRole(caseKind), policyRole: 'Insured' };
    return {
      id: `CASE-GEN-${caseKind.toUpperCase().replace('_', '-')}-${index + 1}`,
      kind: 'case',
      caseKind,
      caseTypeCode: caseKind === 'claim' && claimSubType ? caseTypeCodeForClaimSubType(claimSubType) : getCaseTypeCode(caseKind),
      workflowTemplateId: caseKind === 'claim' && claimSubType ? workflowTemplateIdForClaim(claimSubType) : getWorkflowTemplateId(caseKind),
      title: `${getCaseTitle(caseKind)} ${index + 1}`,
      status: getCaseStatus(caseKind, index),
      statusCode: getCaseStatus(caseKind, index).toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      priority: index % 4 === 0 ? 'High' : 'Normal',
      phaseId: getPhaseId(caseKind, claimSubType),
      activeStepId: getActiveStepId(caseKind, claimSubType),
      assignee: { kind: 'client', id: `USR-GEN-${(index % 5) + 1}`, label: index % 2 === 0 ? 'Operations Team' : 'Victor Ramon', role: 'assignee' },
      primaryParty,
      participants: primaryParty.kind === 'client' ? [{ ...primaryParty, kind: 'client', role: primaryParty.role ?? getPrimaryRole(caseKind) }] : [],
      linkedObjects: [
        ...(primaryParty.kind === 'client' ? [{ kind: 'client' as const, id: client.id, label: client.name }] : []),
        ...(caseKind === 'agent_onboarding' ? [] : [{ kind: 'policy' as const, id: policy.id, label: policy.label }]),
        { kind: 'agent', id: agent.id, label: agent.name },
      ],
      moduleSummaries: [
        { module: 'tasks', total: 2, attention: index % 4 === 0 ? 1 : 0 },
        { module: 'documents', total: 2 },
        { module: 'requirements', total: 1, completed: index % 3 === 0 ? 1 : 0 },
      ],
      facts: [
        { id: 'product', label: 'Product', value: policy.product, category: 'application', importance: 'primary' },
        { id: 'coverage', label: 'Coverage', value: policy.coverageAmount ?? 'N/A', category: 'financial', importance: 'primary' },
        { id: 'scenario', label: 'Scenario', value: pack.emphasis[index % pack.emphasis.length], category: 'demo' },
      ],
      sections: [
        {
          id: 'generated-context',
          label: getCaseTitle(caseKind),
          defaultOpen: true,
          fields: [
            { id: 'primary', label: primaryParty.role ?? 'Primary party', value: primaryParty.label ?? primaryParty.id, objectRef: primaryParty },
            ...(caseKind === 'agent_onboarding' ? [] : [{ id: 'policy', label: 'Policy', value: policy.label, objectRef: { kind: 'policy' as const, id: policy.id, label: policy.label } }]),
            { id: 'agent', label: 'Agent', value: agent.name, objectRef: { kind: 'agent', id: agent.id, label: agent.name } },
          ],
        },
      ],
      analysis: {
        confidence: 65 + (index % 30),
        recommendation: getRecommendation(caseKind),
        narrative: `${getCaseTitle(caseKind)} generated for ${pack.label}; ${pack.emphasis[index % pack.emphasis.length]} is the scenario driver.`,
        assessmentLabel: `${getCaseTitle(caseKind)} - Generated`,
        netAssessmentScore: index % 2 === 0 ? -10 : 12,
        factors: [
          { category: 'Scenario', item: pack.emphasis[index % pack.emphasis.length], score: index % 2 === 0 ? -5 : 8, source: 'scenario_generator' },
        ],
      },
      claimDetails: caseKind === 'claim' && claimSubType ? {
        claimSubType,
        claimNumber: `CLM-GEN-${index + 1}`,
        dateOfLoss: `2026-03-${String((index % 20) + 1).padStart(2, '0')}`,
        disabilityOnset: `2026-03-${String((index % 20) + 2).padStart(2, '0')}`,
        cause: pack.emphasis[index % pack.emphasis.length],
        preExistingConditions: index % 3 === 0 ? 'Review required' : 'None captured',
        claimEndDate: index % 3 === 0 ? undefined : `2026-06-${String((index % 20) + 1).padStart(2, '0')}`,
        paidBenefits: [{ date: '2026-04-01', amount: policy.monthlyBenefit ?? '$2,500' }],
        plannedBenefits: [{ date: '2026-05-01', amount: policy.monthlyBenefit ?? '$2,500' }],
        restorationPlan: ['Confirm functional capacity', 'Validate return-to-work milestone'],
      } : undefined,
      underwritingScoring: caseKind === 'new_business' ? buildGeneratedScoring(index) : undefined,
    };
  });
  const applications = cases
    .filter((item) => item.caseKind === 'new_business')
    .map((item, index): ApplicationRecord => {
      const primary = item.primaryParty.kind === 'client' ? item.primaryParty.id : clients[index % clients.length].id;
      return { id: `APP-GEN-${index + 1}`, kind: 'application', label: `Application ${index + 1}`, status: item.status, product: item.facts[0]?.value ?? pack.products[0], clientId: primary };
    });
  const requirements = cases.map((item, index): DatasetRequirementRecord => ({
    id: `REQ-GEN-${index + 1}`,
    kind: 'requirement',
    label: getRequirementLabel(item.caseKind),
    category: 'documentation',
    status: index % 3 === 0 ? 'Fulfilled' : 'Pending',
    rag: index % 3 === 0 ? 'Green' : 'Amber',
    dueDate: `2026-05-${String((index % 20) + 1).padStart(2, '0')}`,
    source: 'scenario_generator',
    trigger: item.activeStepId,
    workflowStepId: item.activeStepId,
    linkedObjects: [{ kind: 'case', id: item.id, label: item.id }],
  }));
  const tasks = cases.flatMap((item, index): DatasetTaskRecord[] => [
    {
      id: `TSK-GEN-${index + 1}`,
      kind: 'task',
      label: getTaskLabel(item.caseKind),
      status: index % 4 === 0 ? 'Escalated' : 'To Do',
      priority: index % 4 === 0 ? 'High' : 'Normal',
      assignee: index % 2 === 0 ? 'Operations Team' : 'Victor Ramon',
      hasAI: true,
      aiSummary: item.analysis?.narrative,
      aiAction: getRecommendation(item.caseKind),
      slaRemaining: index % 4 === 0 ? '4h' : '2d',
      slaStatus: index % 4 === 0 ? 'warning' : 'normal',
      queue: index % 2 === 0 ? 'team_tasks' : 'my_tasks',
      requiredAuthorityLevel: item.priority === 'High' ? 3 : 1,
      scoringContext: item.underwritingScoring ? {
        caseId: item.id,
        netScore: item.underwritingScoring.netScore,
        mappedDecision: item.underwritingScoring.mappedDecision,
        riskClass: item.underwritingScoring.riskClass,
        suggestedAction: 'Review intake scoring impact before completing this task.',
      } : undefined,
      panelContext: {
        summaryStatus: item.status,
        contextTitle: item.title,
        contextSummary: item.analysis?.narrative,
        suggestions: ['Review linked entities', 'Validate next step', 'Update generated task'],
      },
      linkedObjects: [{ kind: 'case', id: item.id, label: item.id }, item.primaryParty],
    },
  ]);
  const documents = cases.map((item, index): DatasetDocumentRecord => ({
    id: `DOC-GEN-${index + 1}`,
    kind: 'document',
    label: `${getDocumentLabel(item.caseKind)} ${index + 1}.pdf`,
    category: 'evidence',
    status: index % 3 === 0 ? 'Validated' : 'Pending Review',
    uploaded: `2026-04-${String((index % 20) + 1).padStart(2, '0')}`,
    source: profile.documentMode === 'metadata_only' ? 'metadata_only' : 'scenario_generator',
    aiSummary: `Generated document evidence for ${item.title}.`,
    aiAction: index % 3 === 0 ? 'Approve' : 'Review',
    linkedRequirement: requirements[index]?.label ?? 'Generated requirement',
    linkedRequirementId: requirements[index]?.id ?? `REQ-GEN-${index + 1}`,
    linkedCase: item.id,
    linkedCaseId: item.id,
    fileSize: `${300 + index} KB`,
    fileType: 'PDF',
    fileAvailable: profile.documentMode !== 'metadata_only',
    placeholderReason: profile.documentMode === 'metadata_only' ? 'Metadata-only generated context; import files later.' : undefined,
    scoringContext: item.underwritingScoring ? {
      caseId: item.id,
      evidenceId: item.underwritingScoring.evidence[0]?.id,
      netScore: item.underwritingScoring.netScore,
      mappedDecision: item.underwritingScoring.mappedDecision,
      suggestedAdjustments: item.underwritingScoring.debits.slice(0, 2).map((debit) => debit.label),
    } : undefined,
    linkedObjects: [
      { kind: 'case', id: item.id, label: item.id },
      { kind: 'requirement', id: requirements[index]?.id ?? `REQ-GEN-${index + 1}`, label: requirements[index]?.label ?? 'Generated requirement' },
    ],
  }));
  const requests = cases
    .filter((item) => item.caseKind === 'customer_service' || item.caseKind === 'new_business')
    .map((item, index): DatasetRequestRecord => ({
      id: `RQS-GEN-${index + 1}`,
      kind: 'request',
      label: item.caseKind === 'customer_service' ? 'Policy service request' : 'Advisor clarification request',
      status: index % 2 === 0 ? 'New' : 'Pending Info',
      source: index % 2 === 0 ? 'Client Portal' : 'Advisor Email',
      category: item.caseKind === 'customer_service' ? 'Address Change' : 'New Business',
      priority: index % 4 === 0 ? 'High' : 'Normal',
      received: `2026-05-${String((index % 20) + 1).padStart(2, '0')}`,
      sourceChannel: index % 2 === 0 ? 'client_portal' : 'email',
      requester: item.primaryParty.label,
      assignedTo: 'Operations queue',
      due: index % 4 === 0 ? 'Today' : '2d',
      aiSummary: `Generated intake request linked to ${item.title}.`,
      nextAction: 'Review request',
      systemSteps: [
        { id: `RQS-GEN-${index + 1}-step`, kind: 'review_required', status: 'awaiting_review', title: 'Review generated request' },
      ],
      linkedObjects: [{ kind: 'case', id: item.id, label: item.id }, item.primaryParty],
    }));
  const communications = cases.map((item, index): CommunicationRecord => ({
    id: `COM-GEN-${index + 1}`,
    kind: 'communication',
    channel: index % 3 === 0 ? 'email' : index % 3 === 1 ? 'portal' : 'phone',
    direction: index % 2 === 0 ? 'outbound' : 'inbound',
    subject: `Generated update for ${item.title}`,
    status: index % 2 === 0 ? 'sent' : 'received',
    createdAt: `2026-05-${String((index % 20) + 1).padStart(2, '0')}T10:30:00Z`,
    linkedObjects: [{ kind: 'case', id: item.id, label: item.id }],
  }));
  const notes = cases.slice(0, Math.max(1, preview.entityCounts.note)).map((item, index): NoteRecord => ({
    id: `NOTE-GEN-${index + 1}`,
    kind: 'note',
    body: `Generated operational note for ${item.title}: ${item.analysis?.recommendation}.`,
    author: index % 2 === 0 ? 'AI crew' : 'Operations Team',
    createdAt: `2026-05-${String((index % 20) + 1).padStart(2, '0')}T12:00:00Z`,
    visibility: 'internal',
    linkedObjects: [{ kind: 'case', id: item.id, label: item.id }],
  }));
  const activityEvents = cases.map((item, index): ActivityEventRecord => ({
    id: `EVT-GEN-${index + 1}`,
    kind: 'event',
    label: `${item.title} generated`,
    actor: index % 3 === 0 ? 'ai' : 'system',
    timestamp: `2026-05-${String((index % 20) + 1).padStart(2, '0')}T09:00:00Z`,
    linkedObjects: [{ kind: 'case', id: item.id, label: item.id }],
  }));

  const dataset: SystemDataset = {
    id: profile.id,
    label: profile.label,
    description: `${profile.label}: deterministic generated dataset with linked entities, utility records, and lifecycle-derived work.`,
    organizationLabel: profile.organizationLabel,
    enabledBusinessLines: profile.enabledBusinessLines,
    objectDomains: profile.enabledEntities,
    environmentFit: `${profile.organizationLabel} simulation with ${preview.targetRecordCount} planned records.`,
    generationProfileId: profile.id,
    targetRecordCount: profile.targetRecordCount,
    documentMode: profile.documentMode,
    cases,
    clients,
    policies,
    agents: agents.map((agent) => ({
      ...agent,
      linkedObjects: [
        ...policies.filter((policy) => policy.agents.some((ref) => ref.id === agent.id)).slice(0, 5).map((policy) => ({ kind: 'policy' as const, id: policy.id, label: policy.label })),
        ...cases.filter((item) => item.linkedObjects.some((ref) => ref.kind === 'agent' && ref.id === agent.id)).slice(0, 5).map((item) => ({ kind: 'case' as const, id: item.id, label: item.id })),
      ],
    })),
    applications,
    tasks,
    requirements,
    documents,
    requests,
    communications,
    notes,
    activityEvents,
    documentEvidence: documents.slice(0, 10).map((document, index) => ({
      id: `EVD-GEN-${index + 1}`,
      kind: 'document_evidence' as const,
      documentId: document.id,
      title: `${document.label} evidence`,
      summary: document.aiSummary ?? `Generated evidence for ${document.label}.`,
      pages: [
        { number: 1, label: 'Generated evidence summary' },
        { number: 2, label: 'Source excerpt and markers' },
      ],
      findings: [
        {
          id: `finding-${index + 1}`,
          severity: index % 4 === 0 ? 'High' : 'Medium',
          title: 'Generated evidence finding',
          quote: `${document.label} contains a generated scenario signal for review.`,
          reasoning: 'Generated from scenario distribution and linked workflow state.',
          impact: 'Provides document panel content without relying on static fixtures.',
        },
      ],
      linkedObjects: [
        { kind: 'document', id: document.id, label: document.label },
        ...document.linkedObjects,
      ],
    })),
    assistantResponses: cases.slice(0, 10).map((item, index) => ({
      id: `AI-GEN-${index + 1}`,
      workflowTemplateId: item.workflowTemplateId,
      prompt: `Summarize ${item.id}`,
      response: item.analysis?.narrative ?? item.title,
      linkedObjects: [{ kind: 'case', id: item.id, label: item.id }],
    })),
    aiActions: [],
  };
  const generatedDataset = {
    ...dataset,
    aiActions: deriveAiActionsFromDataset(dataset).slice(0, Math.max(10, Math.round(caseCount * 0.8))),
  };
  const validation = validateSystemDataset(generatedDataset);
  if (validation.errors.length) {
    return {
      ...generatedDataset,
      environmentFit: `${generatedDataset.environmentFit} Validation warnings require review before production use.`,
    };
  }
  return generatedDataset;
}

function getPrimaryRole(kind: CaseKind): string {
  if (kind === 'claim') return 'claimant';
  if (kind === 'customer_service') return 'customer';
  return 'applicant';
}

function getCaseTypeCode(kind: CaseKind): string {
  return ({ claim: 'CLM', new_business: 'NB', customer_service: 'CS', agent_onboarding: 'AGT' } satisfies Record<CaseKind, string>)[kind];
}

function getWorkflowTemplateId(kind: CaseKind): string {
  return ({
    claim: 'claim-income-protection',
    new_business: 'new-business-application',
    customer_service: 'customer-service-case',
    agent_onboarding: 'agent-onboarding',
  } satisfies Record<CaseKind, string>)[kind];
}

function getCaseTitle(kind: CaseKind): string {
  return ({
    claim: 'Claim decision',
    new_business: 'New business intake',
    customer_service: 'Customer service',
    agent_onboarding: 'Agent onboarding',
  } satisfies Record<CaseKind, string>)[kind];
}

function getCaseStatus(kind: CaseKind, index: number): string {
  if (kind === 'claim') return index % 3 === 0 ? 'Pending Decision' : 'Awaiting Requirements';
  if (kind === 'new_business') return 'Pending Info';
  if (kind === 'agent_onboarding') return 'Contracting';
  return 'Pending Verification';
}

function getPhaseId(kind: CaseKind, claimSubType?: ClaimSubType): string {
  if (kind === 'claim') return 'pre-approval';
  if (kind === 'new_business') return 'pre-approval';
  if (kind === 'agent_onboarding') return 'contracting';
  return 'validation';
}

function getActiveStepId(kind: CaseKind, claimSubType?: ClaimSubType): string {
  if (kind === 'claim' && claimSubType === 'death') return 'requirement-gathering';
  if (kind === 'claim') return 'decision';
  if (kind === 'new_business') return 'requirement-gathering';
  if (kind === 'agent_onboarding') return 'contracting';
  if (kind === 'customer_service') return 'identity-verification';
  return 'advisor-clarification';
}

function getRecommendation(kind: CaseKind): string {
  if (kind === 'claim') return 'Review decision';
  if (kind === 'agent_onboarding') return 'Complete contracting';
  if (kind === 'customer_service') return 'Verify authority';
  return 'Request clarification';
}

function getRequirementLabel(kind: CaseKind): string {
  if (kind === 'agent_onboarding') return 'License verification';
  if (kind === 'customer_service') return 'Identity verification';
  if (kind === 'new_business') return 'Owner signature';
  return 'Medical evidence';
}

function getTaskLabel(kind: CaseKind): string {
  if (kind === 'agent_onboarding') return 'Review contract packet';
  if (kind === 'customer_service') return 'Validate service request';
  if (kind === 'new_business') return 'Clarify application intake';
  return 'Review claim decision';
}

function getDocumentLabel(kind: CaseKind): string {
  if (kind === 'agent_onboarding') return 'Agent contract package';
  if (kind === 'customer_service') return 'Authorization form';
  if (kind === 'new_business') return 'Application package';
  return 'Claim evidence packet';
}

function buildGeneratedScoring(index: number) {
  const debits = [
    { id: `nb-debit-signature-${index}`, label: 'Application completeness issue', category: 'Application completeness', severity: 'Moderate' as const, points: 20 },
    { id: `nb-debit-premium-${index}`, label: 'Premium source pending validation', category: 'Premium', severity: 'Moderate' as const, points: 15 },
  ];
  const credits = [
    { id: `nb-credit-agent-${index}`, label: 'Advisor relationship verified', category: 'Distribution', points: -5 },
  ];
  const debitTotal = debits.reduce((sum, item) => sum + item.points, 0);
  const creditTotal = credits.reduce((sum, item) => sum + item.points, 0);
  const netScore = debitTotal + creditTotal;
  return {
    baseScore: 0,
    debitTotal,
    creditTotal,
    netScore,
    mappedDecision: 'Intake review',
    riskClass: 'Pre-underwriting',
    debits,
    credits,
    flatExtras: [],
    exclusions: [],
    evidence: [
      { id: `application-${index}`, label: 'Application package', status: 'red' as const, issueCount: 2 },
      { id: `identity-${index}`, label: 'Identity Verification', status: 'green' as const, issueCount: 0 },
      { id: `premium-${index}`, label: 'Premium source', status: 'amber' as const, issueCount: 1 },
    ],
    aiComparison: {
      netScore,
      riskClass: 'Pre-underwriting',
      narrative: 'Generated AI intake scoring baseline available before application submission.',
    },
    underwriterNotes: '',
  };
}
