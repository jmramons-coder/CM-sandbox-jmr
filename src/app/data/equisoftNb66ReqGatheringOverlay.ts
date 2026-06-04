import type { SuggestedRequirementProposal } from '../types';
import { DEFAULT_DATASET_ID } from '../domain/objectRefs';
import { getActiveDemoConfigurationId } from './datasetResolutionContext';
import type { DatasetRequirementRecord, DatasetTaskRecord, SystemDataset } from './multi-case-dataset';
import { usesSbliBrandedDemoData } from './sharedDemoDatasetNeutralize';
import { getTaskCrewStepSeed } from './taskCrewReasoningSeeds';

export const NB66_CASE_ID = 'NB66-7622343';
export const TASK_NB4025_ID = 'task_nb4025';

/** Gathering-phase requirements held as proposals until copilot approval (Equisoft NB66 only). */
export const NB66_GATHERING_PROPOSAL_IDS = [
  'req_mt_005',
  'req_mt_006',
  'req_mt_007',
  'req_mt_008',
  'req_mt_009',
  'req_mt_010',
  'req_mt_011',
  'req_mt_012',
] as const;

const CASE_LABEL = 'New Business — Full Underwriting';
const DEFERRED_TASK_IDS = new Set(['task_nb4030', 'task_nb4032', 'task_nb4031']);

/** Legacy requirement ids on NB66 documents/requests that map to gathering proposals. */
const NB66_LEGACY_PROPOSAL_REQUIREMENT_IDS = new Set([
  'req_nb66_7622343_attending_physician_statement_aps',
  'req_nb66_7622343_mib_hit_prior_decline_2022',
]);

function isNb66ProposalRequirementId(requirementId: string): boolean {
  return (
    NB66_GATHERING_PROPOSAL_IDS.includes(requirementId as (typeof NB66_GATHERING_PROPOSAL_IDS)[number])
    || NB66_LEGACY_PROPOSAL_REQUIREMENT_IDS.has(requirementId)
  );
}

function stripProposalRequirementRefs<T extends { kind: string; id: string }>(refs: T[]): T[] {
  return refs.filter((ref) => ref.kind !== 'requirement' || !isNb66ProposalRequirementId(ref.id));
}

function rowLinkedToNb66(row: {
  linkedObjects?: Array<{ kind: string; id: string }>;
  caseId?: string;
  linkedCaseId?: string;
}): boolean {
  if (row.caseId === NB66_CASE_ID || row.linkedCaseId === NB66_CASE_ID) return true;
  return row.linkedObjects?.some((ref) => ref.kind === 'case' && ref.id === NB66_CASE_ID) ?? false;
}

const LINKED_TASK_BY_REQUIREMENT: Record<string, string> = {
  req_mt_005: 'task_nb4030',
  req_mt_006: 'task_nb4031',
  req_mt_007: 'task_nb4032',
};

function caseRef() {
  return { kind: 'case' as const, id: NB66_CASE_ID, label: CASE_LABEL };
}

function buildProposalMeta(): SuggestedRequirementProposal[] {
  return [
    {
      id: 'req_mt_005',
      label: 'Attending Physician Statement (APS)',
      category: 'Medical',
      reasoning:
        'T2 Diabetes (2019) and HbA1c 48 need physician validation. APS from Dr. Kowalski should confirm control, complications, and the 2022 MIB prior-decline context.',
      sourceLabel: 'Initial review · health profile',
      defaultSelected: true,
      blocking: true,
    },
    {
      id: 'req_mt_006',
      label: 'Paramedical exam — blood draw',
      category: 'Medical',
      reasoning:
        'MIB prior-decline flag disqualified accelerated underwriting. Traditional full UW requires paramedical vitals and lab panels (glucose, HbA1c, CBC).',
      sourceLabel: 'Initial review · MIB flag',
      defaultSelected: true,
      blocking: false,
    },
    {
      id: 'req_mt_007',
      label: 'Prior decline explanation letter',
      category: 'Documentation',
      reasoning:
        'MIB returned a 2022 decline with unknown carrier. Applicant disclosed a prior decline — a written explanation is required before underwriting can move forward.',
      sourceLabel: 'Initial review · MIB hit',
      defaultSelected: true,
      blocking: true,
    },
    {
      id: 'req_mt_008',
      label: 'Comprehensive blood profile',
      category: 'Medical',
      reasoning:
        'Blood profile is still outstanding on the case. Labs should confirm HbA1c and metabolic panel beyond self-reported values before UW review.',
      sourceLabel: 'Initial review · pending labs',
      defaultSelected: true,
      blocking: false,
    },
    {
      id: 'req_mt_009',
      label: 'Resting ECG',
      category: 'Medical',
      reasoning: 'BMI 27.4 (overweight) with T2D and family history of MI — resting ECG supports cardiovascular risk assessment.',
      sourceLabel: 'Health profile · BMI + T2D',
      defaultSelected: true,
      blocking: false,
    },
    {
      id: 'req_mt_010',
      label: 'Attending physician phone interview',
      category: 'Medical',
      reasoning: 'Backup path if APS is delayed — physician can clarify diabetes management and MIB-related history by phone.',
      sourceLabel: 'Req. gathering · APS contingency',
      defaultSelected: true,
      blocking: false,
    },
    {
      id: 'req_mt_011',
      label: 'Family history cardiovascular form',
      category: 'Medical',
      reasoning:
        'Father MI at age 58 adds cardiovascular family-history risk. A structured family history form standardizes capture for UW review.',
      sourceLabel: 'Health profile · family history',
      defaultSelected: true,
      blocking: false,
    },
    {
      id: 'req_mt_012',
      label: 'Financial / income verification',
      category: 'Financial',
      reasoning: '$625,000 face amount on traditional UW path — income and financial suitability verification per full underwriting standards.',
      sourceLabel: 'Application · face amount',
      defaultSelected: true,
      blocking: false,
    },
  ];
}

function buildRequirementTemplates(): Record<string, DatasetRequirementRecord> {
  const baseLink = (id: string, taskId?: string): DatasetRequirementRecord['linkedObjects'] => {
    const refs = [caseRef()];
    if (taskId) refs.push({ kind: 'task', id: taskId, label: taskId });
    return refs;
  };

  return {
    req_mt_005: {
      id: 'req_mt_005',
      kind: 'requirement',
      label: 'Attending Physician Statement (APS)',
      category: 'Medical',
      status: 'Pending',
      stage: 'requirement_gathering',
      rag: 'Amber',
      dueDate: '2026-05-18',
      followUpDate: '2026-05-18',
      source: 'medical_provider',
      sourceType: 'medical',
      responsibleParty: 'Dr. Kowalski — Kowalski Family Medicine',
      notes: 'APS to validate T2D management history and contextualize MIB prior decline flag',
      aiSummary:
        'APS request to Dr. Kowalski covering T2D management history, HbA1c trend, medication compliance, and complications. Required to validate preliminary scoring and contextualize the 2022 prior decline.',
      fulfillmentCriteria: [
        'APS on physician letterhead covering T2D management',
        'HbA1c history for minimum 3 years',
        'Any diabetes-related complications documented or denied',
        'Medication compliance confirmed',
        'Physician overall health status assessment',
      ],
      linkedDocs: [],
      linkedTasks: ['task_nb4030'],
      blockingImpact: {
        stage: 'UW review',
        impact: 'UW final scoring cannot be completed without APS. Application decision blocked until received.',
        severity: 'high',
      },
      context: {
        type: 'application',
        label: 'Scoring context',
        description: 'APS will clarify T2D severity and may modify the preliminary +50 T2D debit.',
        kv: [
          { label: 'Physician', value: 'Dr. Kowalski' },
          { label: 'T2D debit (prelim)', value: '+50' },
          { label: 'HbA1c on file', value: '48 mmol/mol' },
        ],
      },
      history: [
        {
          date: '2026-05-16',
          action: 'Requirement created from AI recommendation package',
          user: 'AI Agent',
          dot: 'blue',
        },
      ],
      trigger: 'Scoring context',
      requirementRef: 'req_mt_005',
      phase: 'pre-approval',
      workflowStepId: 'requirement_gathering',
      aiInsight: true,
      aiGenerated: true,
      aiConfidence: 87,
      linkedObjects: baseLink('req_mt_005', 'task_nb4030'),
    },
    req_mt_006: {
      id: 'req_mt_006',
      kind: 'requirement',
      label: 'Paramedical exam — blood draw',
      category: 'Medical',
      status: 'Ordered',
      stage: 'requirement_gathering',
      rag: 'Amber',
      dueDate: '2026-05-19',
      followUpDate: '2026-05-19',
      source: 'paramedical_vendor',
      sourceType: 'medical',
      responsibleParty: 'Quest Diagnostics',
      notes: 'Traditional UW path — MIB flag requires full paramedical',
      aiSummary:
        'Paramedical exam with Quest Diagnostics. Blood draw and vitals required. Results feed final UW scoring alongside APS.',
      fulfillmentCriteria: [
        'Paramedical exam completed at scheduled time',
        'Blood draw processed by accredited lab',
        'Vitals recorded: height, weight, BP, pulse',
        'Lab panels resulted: glucose, cholesterol, HbA1c, CBC',
        'Report signed by certified paramedic',
      ],
      linkedDocs: [],
      linkedTasks: ['task_nb4031'],
      blockingImpact: null,
      context: {
        type: 'application',
        label: 'Exam context',
        description: 'Traditional UW path requires paramedical exam due to MIB flag.',
        kv: [
          { label: 'Provider', value: 'Quest Diagnostics' },
          { label: 'Target date', value: 'May 19, 2026' },
          { label: 'Key panels', value: 'Glucose, HbA1c, CBC' },
        ],
      },
      history: [
        {
          date: '2026-05-16',
          action: 'Requirement created from AI recommendation package',
          user: 'AI Agent',
          dot: 'blue',
        },
      ],
      trigger: 'Exam context',
      requirementRef: 'req_mt_006',
      phase: 'pre-approval',
      workflowStepId: 'requirement_gathering',
      aiInsight: true,
      aiGenerated: true,
      aiConfidence: 90,
      linkedObjects: baseLink('req_mt_006', 'task_nb4031'),
    },
    req_mt_007: {
      id: 'req_mt_007',
      kind: 'requirement',
      label: 'Prior decline explanation letter',
      category: 'Documentation',
      status: 'Pending',
      stage: 'requirement_gathering',
      rag: 'Red',
      dueDate: '2026-05-18',
      followUpDate: '2026-05-18',
      source: 'applicant',
      sourceType: 'external',
      responsibleParty: 'Marc Tremblay (applicant)',
      notes: 'Applicant must explain 2022 MIB prior decline in writing',
      aiSummary:
        'Written explanation from Marc Tremblay regarding 2022 prior decline. Required before final UW scoring and offer generation.',
      fulfillmentCriteria: [
        'Written explanation from applicant (letter or portal statement)',
        'Carrier name identified',
        'Coverage amount applied for stated',
        'Reason for decline explained clearly',
        'Health changes since 2022 described if applicable',
      ],
      linkedDocs: [],
      linkedTasks: ['task_nb4032'],
      blockingImpact: {
        stage: 'UW review',
        impact: 'Final UW scoring and offer recommendation cannot proceed without explanation.',
        severity: 'high',
      },
      context: {
        type: 'application',
        label: 'MIB context',
        description: 'Prior decline in 2022 is the most significant open risk factor.',
        kv: [
          { label: 'MIB year', value: '2022' },
          { label: 'Carrier', value: 'Unknown' },
          { label: 'Debit impact', value: '+50 (unresolved)' },
        ],
      },
      history: [
        {
          date: '2026-05-16',
          action: 'Requirement created from AI recommendation package',
          user: 'AI Agent',
          dot: 'blue',
        },
      ],
      trigger: 'MIB context',
      requirementRef: 'req_mt_007',
      phase: 'pre-approval',
      workflowStepId: 'requirement_gathering',
      aiInsight: true,
      aiGenerated: true,
      aiConfidence: 87,
      linkedObjects: baseLink('req_mt_007', 'task_nb4032'),
    },
    req_mt_008: {
      id: 'req_mt_008',
      kind: 'requirement',
      label: 'Comprehensive blood profile',
      category: 'Medical',
      status: 'Ordered',
      stage: 'requirement_gathering',
      rag: 'Amber',
      dueDate: '2026-05-19',
      followUpDate: '2026-05-19',
      source: 'lab_vendor',
      sourceType: 'medical',
      responsibleParty: 'Quest Diagnostics',
      notes: 'Metabolic panel to confirm HbA1c and scoring inputs',
      aiSummary:
        'Comprehensive blood profile including HbA1c, glucose, and lipid panel to validate self-reported values and AI scoring assumptions.',
      fulfillmentCriteria: [
        'Fasting glucose and HbA1c resulted',
        'Lipid panel completed',
        'Results within 30 days of application',
      ],
      linkedDocs: [],
      linkedTasks: [],
      blockingImpact: null,
      context: {
        type: 'application',
        label: 'Lab context',
        description: 'Supports preliminary scoring pending blood profile note on case.',
        kv: [
          { label: 'HbA1c disclosed', value: '48 mmol/mol' },
          { label: 'BMI', value: '27.4' },
        ],
      },
      history: [
        {
          date: '2026-05-16',
          action: 'Requirement created from AI recommendation package',
          user: 'AI Agent',
          dot: 'blue',
        },
      ],
      trigger: 'Scoring context',
      requirementRef: 'req_mt_008',
      phase: 'pre-approval',
      workflowStepId: 'requirement_gathering',
      aiInsight: true,
      aiGenerated: true,
      aiConfidence: 85,
      linkedObjects: baseLink('req_mt_008'),
    },
    req_mt_009: {
      id: 'req_mt_009',
      kind: 'requirement',
      label: 'Resting ECG',
      category: 'Medical',
      status: 'Pending',
      stage: 'requirement_gathering',
      rag: 'Amber',
      dueDate: '2026-05-20',
      followUpDate: '2026-05-20',
      source: 'medical_provider',
      sourceType: 'medical',
      responsibleParty: 'Ordering physician / vendor',
      notes: 'Cardiovascular screening for overweight diabetic applicant',
      aiSummary: 'Resting ECG to assess cardiovascular risk given BMI 27.4, T2D, and family history of MI.',
      fulfillmentCriteria: ['12-lead resting ECG completed', 'Interpretation by qualified physician', 'No acute abnormality or explained'],
      linkedDocs: [],
      linkedTasks: [],
      blockingImpact: null,
      context: {
        type: 'application',
        label: 'Cardiovascular risk',
        description: 'Supplements paramedical and APS for cardiac risk.',
        kv: [{ label: 'Father MI', value: 'Age 58' }],
      },
      history: [
        {
          date: '2026-05-16',
          action: 'Requirement created from AI recommendation package',
          user: 'AI Agent',
          dot: 'blue',
        },
      ],
      trigger: 'Health profile',
      requirementRef: 'req_mt_009',
      phase: 'pre-approval',
      workflowStepId: 'requirement_gathering',
      aiInsight: true,
      aiGenerated: true,
      aiConfidence: 80,
      linkedObjects: baseLink('req_mt_009'),
    },
    req_mt_010: {
      id: 'req_mt_010',
      kind: 'requirement',
      label: 'Attending physician phone interview',
      category: 'Medical',
      status: 'Pending',
      stage: 'requirement_gathering',
      rag: 'Amber',
      dueDate: '2026-05-20',
      followUpDate: '2026-05-20',
      source: 'medical_provider',
      sourceType: 'medical',
      responsibleParty: 'Dr. Kowalski — Kowalski Family Medicine',
      notes: 'Contingency if APS delayed',
      aiSummary: 'Structured phone interview with treating physician if APS turnaround exceeds SLA.',
      fulfillmentCriteria: [
        'Interview completed with treating physician',
        'Diabetes management discussed',
        'Summary documented in underwriting file',
      ],
      linkedDocs: [],
      linkedTasks: [],
      blockingImpact: null,
      context: {
        type: 'application',
        label: 'APS contingency',
        description: 'Accelerates req. gathering if APS is late.',
        kv: [],
      },
      history: [
        {
          date: '2026-05-16',
          action: 'Requirement created from AI recommendation package',
          user: 'AI Agent',
          dot: 'blue',
        },
      ],
      trigger: 'Req. gathering',
      requirementRef: 'req_mt_010',
      phase: 'pre-approval',
      workflowStepId: 'requirement_gathering',
      aiInsight: true,
      aiGenerated: true,
      aiConfidence: 78,
      linkedObjects: baseLink('req_mt_010'),
    },
    req_mt_011: {
      id: 'req_mt_011',
      kind: 'requirement',
      label: 'Family history cardiovascular form',
      category: 'Medical',
      status: 'Pending',
      stage: 'requirement_gathering',
      rag: 'Amber',
      dueDate: '2026-05-20',
      followUpDate: '2026-05-20',
      source: 'applicant',
      sourceType: 'external',
      responsibleParty: 'Marc Tremblay (applicant)',
      notes: 'Father MI age 58 — +15 debit in preliminary scoring',
      aiSummary: 'Structured family history form to document cardiovascular deaths and age at onset.',
      fulfillmentCriteria: [
        'Form completed by applicant',
        'First-degree relatives documented',
        'Age at diagnosis/death captured',
      ],
      linkedDocs: [],
      linkedTasks: [],
      blockingImpact: null,
      context: {
        type: 'application',
        label: 'Family history',
        description: 'Clarifies +15 family history debit.',
        kv: [{ label: 'Father', value: 'MI age 58' }],
      },
      history: [
        {
          date: '2026-05-16',
          action: 'Requirement created from AI recommendation package',
          user: 'AI Agent',
          dot: 'blue',
        },
      ],
      trigger: 'Health profile',
      requirementRef: 'req_mt_011',
      phase: 'pre-approval',
      workflowStepId: 'requirement_gathering',
      aiInsight: true,
      aiGenerated: true,
      aiConfidence: 82,
      linkedObjects: baseLink('req_mt_011'),
    },
    req_mt_012: {
      id: 'req_mt_012',
      kind: 'requirement',
      label: 'Financial / income verification',
      category: 'Financial',
      status: 'Pending',
      stage: 'requirement_gathering',
      rag: 'Amber',
      dueDate: '2026-05-21',
      followUpDate: '2026-05-21',
      source: 'third_party',
      sourceType: 'financial',
      responsibleParty: 'Applicant / employer',
      notes: '$625,000 face — full UW financial suitability',
      aiSummary: 'Income and financial verification for $625,000 term coverage on traditional underwriting path.',
      fulfillmentCriteria: [
        'Income documentation received',
        'Coverage amount justified vs income',
        'Third-party verification if required by guidelines',
      ],
      linkedDocs: [],
      linkedTasks: [],
      blockingImpact: null,
      context: {
        type: 'application',
        label: 'Financial suitability',
        description: 'Standard for face amounts at this band.',
        kv: [{ label: 'Death benefit', value: '$625,000' }],
      },
      history: [
        {
          date: '2026-05-16',
          action: 'Requirement created from AI recommendation package',
          user: 'AI Agent',
          dot: 'blue',
        },
      ],
      trigger: 'Application intake',
      requirementRef: 'req_mt_012',
      phase: 'pre-approval',
      workflowStepId: 'requirement_gathering',
      aiInsight: true,
      aiGenerated: true,
      aiConfidence: 84,
      linkedObjects: baseLink('req_mt_012'),
    },
  };
}

const REQUIREMENT_TEMPLATES = buildRequirementTemplates();

export function shouldApplyEquisoftNb66Overlay(demoEnvironmentId?: string | null): boolean {
  return !usesSbliBrandedDemoData(demoEnvironmentId ?? getActiveDemoConfigurationId());
}

export function isEquisoftNb66GatheringDemo(
  caseId: string,
  demoEnvironmentId?: string | null,
): boolean {
  return caseId === NB66_CASE_ID && shouldApplyEquisoftNb66Overlay(demoEnvironmentId);
}

export function getNb66SuggestedRequirementProposals(): SuggestedRequirementProposal[] {
  return buildProposalMeta();
}

export function getNb66RequirementTemplate(requirementId: string): DatasetRequirementRecord | undefined {
  return REQUIREMENT_TEMPLATES[requirementId];
}

export function getNb66LinkedTaskIdForRequirement(requirementId: string): string | undefined {
  return LINKED_TASK_BY_REQUIREMENT[requirementId];
}

export function getNb66RequirementTemplates(): Record<string, DatasetRequirementRecord> {
  return REQUIREMENT_TEMPLATES;
}

export function getNb66LinkedTasksByRequirement(): Record<string, string> {
  return { ...LINKED_TASK_BY_REQUIREMENT };
}

function buildTaskNb4025(suggestions: SuggestedRequirementProposal[]): DatasetTaskRecord {
  const crewSteps = getTaskCrewStepSeed(TASK_NB4025_ID) ?? [];
  return {
    id: TASK_NB4025_ID,
    kind: 'task',
    taskId: TASK_NB4025_ID,
    label: 'AI: recommend requirements for req. gathering',
    status: 'In Queue',
    priority: 'High',
    assignee: 'AI Agent',
    assigneeKind: 'team',
    caseType: 'NB',
    caseSubtype: 'full_underwriting',
    hasAI: true,
    aiGenerated: true,
    aiConfidence: 91,
    alert: null,
    summary: {
      contextLabel: 'Task context',
      title: 'AI: recommend requirements for req. gathering',
      description:
        'AI agent reviews the application, health profile, and initial review outcomes (MIB, MVR, Rx) to propose a req. gathering requirement package for underwriter approval.',
      checklist: [
        'Review application and health disclosures',
        'Incorporate MIB / MVR / Rx outcomes from initial review',
        'Match open evidence gaps to gathering requirements',
        'Propose 8 gathering requirements with rationale',
        'Route package to underwriter for selective approval',
      ],
    },
    aiNarrative: {
      text: 'Eight requirements recommended for traditional full UW on Marc Tremblay. Critical items: APS, prior-decline letter, paramedical, and blood profile. Optional: ECG, physician phone interview, family history form, financial verification.',
      confidence: 91,
      generatedBy: 'AI Agent',
      generatedAt: '2026-05-16',
    },
    evidenceDocuments: [],
    contextCards: [
      {
        type: 'application_snapshot',
        contextLabel: 'case context',
        title: `Application — ${NB66_CASE_ID}`,
        description: 'Traditional UW after MIB flag. Req. gathering package ready for approval.',
        kv: [
          { label: 'Applicant', value: 'Marc Tremblay, 42' },
          { label: 'Product', value: 'Term Life 20 — $625k' },
          { label: 'UW path', value: 'Traditional' },
        ],
      },
    ],
    actions: [
      { type: 'complete', label: 'Approve', isPrimary: true },
      { type: 'request_info', label: 'Amend', isPrimary: false },
    ],
    dueDate: '2026-05-16',
    stage: 'requirement_gathering',
    slaRemaining: '2026-05-16',
    slaStatus: 'warning',
    origin: 'Req. gathering',
    sourceContext: 'Equisoft NB66 demo',
    createdDate: '2026-05-16',
    description:
      'AI agent reviews the application, health profile, and initial review outcomes (MIB, MVR, Rx) to propose a req. gathering requirement package for underwriter approval.',
    queue: 'my_tasks',
    requiredAuthorityLevel: 1,
    executionMode: 'semi_auto',
    review: {
      verdict:
        'After reviewing the case file, the agent recommends a req. gathering requirement package. Select which requirements to include below, then approve this task to add them to the case.',
      confidence: 91,
      crewSteps,
      suggestedRequirements: suggestions,
    },
    panelContext: {
      summaryStatus: 'In Queue',
      contextTitle: 'AI: recommend requirements for req. gathering',
      contextSummary:
        'Proposed requirement package for Marc Tremblay — approve task first, then confirm selections in copilot.',
      suggestions: [
        'Review each proposed requirement and rationale',
        'Approve task to add selected requirements to the case',
        'Select requirements to add to the case',
      ],
    },
    linkedObjects: [caseRef()],
  };
}

function taskLinkedToNb66(task: DatasetTaskRecord): boolean {
  return task.linkedObjects.some((ref) => ref.kind === 'case' && ref.id === NB66_CASE_ID);
}

export type Nb66GatheringOverlayOptions = {
  /** Keep gathering requirements already added to NB66 (workspace copies after approve). */
  preserveAddedProposals?: boolean;
};

export function isSharedMultiCaseDemoDatasetId(datasetId: string): boolean {
  return datasetId === DEFAULT_DATASET_ID || datasetId.startsWith(`${DEFAULT_DATASET_ID}-workspace-copy-`);
}

export function applyEquisoftNb66ReqGatheringOverlay(
  dataset: SystemDataset,
  options: Nb66GatheringOverlayOptions = {},
): SystemDataset {
  const suggestions = buildProposalMeta();
  const proposalIdSet = new Set<string>(NB66_GATHERING_PROPOSAL_IDS);
  const preserveAdded = options.preserveAddedProposals === true;

  const requirements = dataset.requirements.filter((row) => {
    const caseId = row.linkedObjects.find((ref) => ref.kind === 'case')?.id;
    if (caseId !== NB66_CASE_ID) return true;
    if (preserveAdded && proposalIdSet.has(row.id)) return true;
    return !proposalIdSet.has(row.id);
  });

  let tasks = dataset.tasks.map((task) => {
    if (!taskLinkedToNb66(task)) return task;
    const linkedObjects = stripProposalRequirementRefs(task.linkedObjects ?? []);
    if (DEFERRED_TASK_IDS.has(task.id)) {
      return { ...task, status: 'Saved', queue: 'team_tasks' as const, linkedObjects };
    }
    return { ...task, linkedObjects };
  });

  const documents = dataset.documents.map((document) => {
    if (!rowLinkedToNb66(document)) return document;
    const linkedObjects = stripProposalRequirementRefs(document.linkedObjects ?? []);
    const linkedRequirementId =
      document.linkedRequirementId && isNb66ProposalRequirementId(document.linkedRequirementId)
        ? undefined
        : document.linkedRequirementId;
    return {
      ...document,
      linkedObjects,
      ...(linkedRequirementId !== document.linkedRequirementId
        ? { linkedRequirementId, linkedRequirement: undefined }
        : {}),
    };
  });

  const requests = dataset.requests.map((request) => {
    if (!rowLinkedToNb66(request)) return request;
    return {
      ...request,
      linkedReqs: (request.linkedReqs ?? []).filter((id) => !isNb66ProposalRequirementId(id)),
      linkedObjects: stripProposalRequirementRefs(request.linkedObjects ?? []),
    };
  });

  const hasRecommendTask = tasks.some((row) => row.id === TASK_NB4025_ID);
  if (!hasRecommendTask) {
    tasks = [buildTaskNb4025(suggestions), ...tasks];
  } else {
    tasks = tasks.map((task) =>
      task.id === TASK_NB4025_ID
        ? {
            ...buildTaskNb4025(suggestions),
            status: task.status === 'Completed' ? task.status : 'In Queue',
          }
        : task,
    );
  }

  return {
    ...dataset,
    requirements,
    tasks,
    documents,
    requests,
  };
}
