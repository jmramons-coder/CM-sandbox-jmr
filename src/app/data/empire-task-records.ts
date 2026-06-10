import type { DatasetTaskRecord } from './multi-case-dataset';
import { EMPIRE_DEMO_CASE_IDS } from './empireDemoCaseIds';

const DI = EMPIRE_DEMO_CASE_IDS.disabilityClaim;
const CI = EMPIRE_DEMO_CASE_IDS.criticalIllnessClaim;
const LIFE = EMPIRE_DEMO_CASE_IDS.lifeDeathClaim;
const NB = EMPIRE_DEMO_CASE_IDS.nbFullUw;
const NB_S = EMPIRE_DEMO_CASE_IDS.nbSimplified;
const NB_G = EMPIRE_DEMO_CASE_IDS.nbGuaranteed;

function task(
  id: string,
  caseId: string,
  label: string,
  status: string,
  priority: string,
  stage: string,
  extra: Partial<DatasetTaskRecord> = {},
): DatasetTaskRecord {
  const description = extra.description ?? extra.aiSummary ?? label;
  const summary = extra.summary ?? {
    description,
    checklist: [`Review ${label}`, 'Update case notes when complete'],
  };
  return {
    id,
    kind: 'task',
    taskId: id,
    label,
    status,
    priority,
    assignee: extra.assignee ?? 'Victor Ramon',
    assigneeKind: 'user',
    caseType: caseId.startsWith('CLM') ? 'CLM' : 'NB',
    caseSubtype: extra.caseSubtype ?? (caseId.startsWith('CLM-DI') ? 'disability_benefit' : caseId.startsWith('CLM') ? 'death_benefit' : 'full_underwriting'),
    hasAI: extra.hasAI ?? Boolean(extra.aiSummary),
    aiGenerated: extra.aiGenerated ?? false,
    alert: extra.alert ?? null,
    stage,
    actions: extra.actions ?? [{ type: 'complete', label: status === 'Completed' ? 'View' : 'Complete', isPrimary: true }],
    aiNarrative: extra.aiNarrative ?? null,
    evidenceDocuments: extra.evidenceDocuments ?? [],
    contextCards: extra.contextCards ?? [],
    queue: extra.queue ?? 'my_tasks',
    caseId,
    product: extra.product ?? 'Empire Life',
    origin: extra.origin ?? 'Manual',
    dueDate: extra.dueDate ?? '2026-05-22',
    aiSummary: extra.aiSummary,
    description,
    ...extra,
    summary,
    linkedObjects: [
      { kind: 'case', id: caseId, label: caseId },
      ...(extra.linkedObjects ?? []).filter((ref) => ref.kind !== 'case'),
    ],
  };
}

export const EMPIRE_TASK_RECORDS: DatasetTaskRecord[] = [
  task('task_emp_di_001', DI, 'Register claim from advisor FNOL', 'Completed', 'Normal', 'fnol_received', {
    aiSummary: 'Claim CLM-DI-2026-0214 registered. Confirmation email sent to Marc Tremblay and Jean-Philippe Morin.',
    evidenceDocuments: [{ id: 'doc_emp_di_fnol', name: 'FNOL confirmation email', size: 'Metadata', category: 'Claim', aiSummary: 'FNOL registered 22 Mar 2026.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_emp_di_001', label: 'FNOL' },
      { kind: 'document', id: 'doc_emp_di_fnol', label: 'FNOL confirmation' },
      { kind: 'request', id: 'REQ-EMP-2026-004', label: 'DI FNOL' },
    ],
    actions: [{ type: 'complete', label: 'View FNOL', isPrimary: true }],
  }),
  task('task_emp_di_002', DI, 'Verify 90-day waiting period', 'Completed', 'Normal', 'initial_triage', {
    aiSummary: 'Waiting period satisfied 18 May 2026 — first benefit month May 2026.',
    evidenceDocuments: [{ id: 'doc_emp_di_fnol', name: 'FNOL confirmation email', size: 'Metadata', category: 'Claim', aiSummary: 'FNOL registered 22 Mar 2026; waiting period anchor.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_emp_di_002', label: 'Waiting period' },
      { kind: 'document', id: 'doc_emp_di_fnol', label: 'FNOL confirmation' },
    ],
    actions: [{ type: 'complete', label: 'View FNOL', isPrimary: true }],
  }),
  task('task_emp_di_003', DI, 'Chase employer physician statement — own occupation', 'In Queue', 'High', 'req_gathering', {
    executionMode: 'manual',
    aiSummary: 'Contact Maple Tech HR — statement must state unable to perform software development duties.',
    review: {
      verdict: 'Contact Maple Tech HR — statement must state unable to perform software development duties.',
      reasoning: ['Reference requirement req_emp_di_003', 'Confirm own-occupation wording on physician statement'],
    },
    alert: { type: 'sla', message: 'Overdue 2 days' },
    evidenceDocuments: [{ id: 'doc_emp_di_employer', name: 'Employer physician statement', size: 'Metadata', category: 'Medical', aiSummary: 'Wording gap on own occupation.', followUps: 2 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_emp_di_003', label: 'Employer statement' },
      { kind: 'document', id: 'doc_emp_di_employer', label: 'Employer physician statement' },
    ],
  }),

  task('task_emp_ci_001', CI, 'Register CI claim — advisor notification', 'Completed', 'Normal', 'fnol_received', {
    aiSummary: 'Sophie Chen CI claim opened; advisor Pacific Wealth Advisors primary contact.',
    evidenceDocuments: [{ id: 'doc_emp_ci_fnol', name: 'CI claim registration', size: 'Metadata', category: 'Claim', aiSummary: 'Claim CLM-CI-2026-0156 registered same day.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_emp_ci_001', label: 'FNOL' },
      { kind: 'document', id: 'doc_emp_ci_fnol', label: 'CI registration' },
      { kind: 'request', id: 'REQ-EMP-2026-001', label: 'CI notification' },
    ],
    actions: [{ type: 'complete', label: 'View FNOL', isPrimary: true }],
  }),
  task('task_emp_ci_002', CI, 'Validate specialist diagnosis letter', 'Completed', 'Urgent', 'req_gathering', {
    hasAI: true,
    executionMode: 'semi_auto',
    aiGenerated: true,
    aiConfidence: 94,
    review: {
      verdict: 'Invasive ductal carcinoma confirmed — meets Empire Life CI definition. Recommend full $125,000 payout.',
      confidence: 94,
      reasoning: [
        'Specialist letter and pathology report corroborate diagnosis.',
        'No exclusions apply under product definition.',
      ],
      evidenceIds: ['doc_emp_ci_diagnosis', 'doc_emp_ci_pathology'],
    },
    aiSummary: 'Invasive ductal carcinoma confirmed — meets Empire Life CI definition. Recommend full payout.',
    evidenceDocuments: [
      { id: 'doc_emp_ci_diagnosis', name: 'Specialist diagnosis', size: 'Metadata', category: 'Medical', aiSummary: 'Full $125k recommended.', followUps: 0 },
      { id: 'doc_emp_ci_pathology', name: 'Pathology report', size: 'Metadata', category: 'Medical', aiSummary: 'Corroborates diagnosis.', followUps: 0 },
    ],
    linkedObjects: [
      { kind: 'requirement', id: 'req_emp_ci_002', label: 'Specialist diagnosis' },
      { kind: 'document', id: 'doc_emp_ci_diagnosis', label: 'Diagnosis letter' },
      { kind: 'document', id: 'doc_emp_ci_pathology', label: 'Pathology report' },
    ],
    actions: [{ type: 'complete', label: 'View report', isPrimary: true }],
  }),
  task('task_emp_ci_003', CI, 'Prepare decision recommendation', 'In Queue', 'Urgent', 'decision', {
    hasAI: true,
    executionMode: 'semi_auto',
    aiGenerated: true,
    review: {
      verdict: 'All requirements fulfilled — recommend approve $125,000. Copy advisor on decision letter.',
      reasoning: ['Medical and definitions complete — ready for human sign-off.'],
      evidenceIds: ['doc_emp_ci_diagnosis', 'doc_emp_ci_pathology', 'doc_emp_ci_support'],
    },
    aiSummary: 'All requirements fulfilled — recommend approve $125,000. Copy advisor on decision letter.',
    evidenceDocuments: [
      { id: 'doc_emp_ci_diagnosis', name: 'Specialist diagnosis', size: 'Metadata', category: 'Medical', aiSummary: 'Full $125k recommended.', followUps: 0 },
      { id: 'doc_emp_ci_pathology', name: 'Pathology report', size: 'Metadata', category: 'Medical', aiSummary: 'Corroborates diagnosis.', followUps: 0 },
      { id: 'doc_emp_ci_support', name: 'Advisor support plan', size: 'Metadata', category: 'Claim', aiSummary: 'Advisor support active.', followUps: 0 },
    ],
    linkedObjects: [
      { kind: 'requirement', id: 'req_emp_ci_002', label: 'Specialist diagnosis' },
      { kind: 'requirement', id: 'req_emp_ci_004', label: 'Advisor support plan' },
      { kind: 'document', id: 'doc_emp_ci_diagnosis', label: 'Diagnosis letter' },
      { kind: 'document', id: 'doc_emp_ci_pathology', label: 'Pathology report' },
      { kind: 'document', id: 'doc_emp_ci_support', label: 'Advisor support plan' },
    ],
    contextCards: [
      {
        type: 'step_readiness',
        stageLabel: 'DECISION',
        description: 'Medical and definitions complete — ready for human sign-off.',
        stats: { status: 'Ready', requirements: '4/4', open: '1', docs: '4' },
        actionBtn: 'Open decision',
      },
    ],
  }),

  task('task_emp_life_001', LIFE, 'Verify death certificate', 'Completed', 'Normal', 'fnol_received', {
    evidenceDocuments: [{ id: 'doc_emp_life_death_cert', name: 'Death certificate', size: 'Metadata', category: 'Legal', aiSummary: 'Verified.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_emp_life_001', label: 'Death certificate' },
      { kind: 'document', id: 'doc_emp_life_death_cert', label: 'Death certificate' },
      { kind: 'request', id: 'REQ-EMP-2026-005', label: 'Death notification' },
    ],
    actions: [{ type: 'complete', label: 'View death certificate', isPrimary: true }],
  }),
  task('task_emp_life_002', LIFE, 'Process compassionate advance $15,000', 'Completed', 'Normal', 'initial_triage', {
    aiSummary: 'Compassionate advance released to Margaret MacDonald.',
    evidenceDocuments: [{ id: 'doc_emp_life_funeral', name: 'Funeral invoice', size: 'Metadata', category: 'Financial', aiSummary: '$14,200 invoice.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_emp_life_002', label: 'Compassionate advance' },
      { kind: 'document', id: 'doc_emp_life_funeral', label: 'Funeral invoice' },
    ],
    actions: [{ type: 'complete', label: 'View invoice', isPrimary: true }],
  }),
  task('task_emp_life_003', LIFE, 'Track estate documentation — final balance $385,000', 'In Queue', 'Normal', 'req_gathering', {
    aiSummary: 'Weekly chase with estate lawyer — probate certificate expected June 2026.',
    evidenceDocuments: [{ id: 'doc_emp_life_probate', name: 'Probate application draft', size: 'Metadata', category: 'Legal', aiSummary: 'Certificate pending.', followUps: 1 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_emp_life_003', label: 'Estate documentation' },
      { kind: 'document', id: 'doc_emp_life_probate', label: 'Probate application draft' },
    ],
  }),

  task('task_emp_nb_001', NB, 'Application Initial Review', 'Completed', 'Normal', 'application', {
    assignee: 'Victor Ramon',
    assigneeKind: 'user',
    executionMode: 'manual',
    aiGenerated: false,
    hasAI: false,
    createdDate: '2026-05-08',
    dueDate: '2026-05-08',
    completedDate: '2026-05-08',
    aiSummary: 'Initial review completed 8 May — application and needs analysis validated; submission requirements released.',
    evidenceDocuments: [
      { id: 'doc_emp_nb_app', name: 'Application — Amélie Dubois (Solution 20)', size: 'Metadata', category: 'Financial', aiSummary: '$500,000 Solution 20 participating; non-smoker.', followUps: 0 },
      { id: 'doc_emp_nb_needs', name: 'Advisor needs analysis — Amélie Dubois', size: 'Metadata', category: 'Financial', aiSummary: 'Needs analysis supports participating whole life coverage.', followUps: 0 },
    ],
    linkedObjects: [
      { kind: 'document', id: 'doc_emp_nb_app', label: 'Application' },
      { kind: 'document', id: 'doc_emp_nb_needs', label: 'Needs analysis' },
      { kind: 'request', id: 'REQ-EMP-2026-002', label: 'NB application' },
    ],
    actions: [{ type: 'complete', label: 'View application', isPrimary: true }],
  }),
  task('task_emp_nb_010', NB, 'Order MIB search', 'Completed', 'Normal', 'application', {
    assignee: 'System',
    assigneeKind: 'team',
    executionMode: 'automated',
    aiGenerated: false,
    hasAI: false,
    origin: 'System',
    createdDate: '2026-05-08',
    dueDate: '2026-05-08',
    completedDate: '2026-05-08',
    aiSummary: 'MIB inquiry ordered automatically at submission — clear, no alerts.',
    evidenceDocuments: [{ id: 'doc_emp_nb_mib', name: 'MIB search results', size: 'Metadata', category: 'Medical', aiSummary: 'Clear at submission.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_emp_nb_003', label: 'MIB search' },
      { kind: 'document', id: 'doc_emp_nb_mib', label: 'MIB results' },
    ],
    actions: [{ type: 'complete', label: 'View MIB', isPrimary: true }],
  }),
  task('task_emp_nb_011', NB, 'Order blood and urine', 'Completed', 'Normal', 'application', {
    assignee: 'System',
    assigneeKind: 'team',
    executionMode: 'automated',
    aiGenerated: false,
    hasAI: false,
    origin: 'System',
    createdDate: '2026-05-08',
    dueDate: '2026-05-08',
    completedDate: '2026-05-08',
    aiSummary: 'Paramedical lab requisition sent to Dynacare Ottawa at submission.',
    linkedObjects: [{ kind: 'requirement', id: 'req_emp_nb_005', label: 'Blood and urine' }],
    actions: [{ type: 'complete', label: 'View', isPrimary: true }],
  }),
  task('task_emp_nb_012', NB, 'Order Rx report', 'Completed', 'Normal', 'application', {
    assignee: 'System',
    assigneeKind: 'team',
    executionMode: 'automated',
    aiGenerated: false,
    hasAI: false,
    origin: 'System',
    createdDate: '2026-05-08',
    dueDate: '2026-05-08',
    completedDate: '2026-05-08',
    aiSummary: 'Milliman IntelliScript prescription history check ordered at submission.',
    evidenceDocuments: [{ id: 'doc_emp_nb_rx', name: 'Rx report — IntelliScript', size: 'Metadata', category: 'Medical', aiSummary: 'Received 11 May.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_emp_nb_006', label: 'RX report' },
      { kind: 'document', id: 'doc_emp_nb_rx', label: 'Rx report' },
    ],
    actions: [{ type: 'complete', label: 'View Rx report', isPrimary: true }],
  }),
  task('task_emp_nb_013', NB, 'Send scuba questionnaire', 'Completed', 'Normal', 'application', {
    assignee: 'AI Agent',
    assigneeKind: 'team',
    executionMode: 'semi_auto',
    aiGenerated: true,
    hasAI: true,
    createdDate: '2026-05-08',
    dueDate: '2026-05-08',
    completedDate: '2026-05-08',
    aiSummary: 'AI flagged recreational scuba diving on application — questionnaire sent to advisor portal at submission.',
    review: {
      verdict: 'AI flagged recreational scuba diving on application — questionnaire sent to advisor portal at submission.',
      confidence: 92,
      reasoning: [
        'Application hobbies section lists recreational scuba diving to 30 m.',
        'Empire underwriting requires scuba questionnaire for depth and certification disclosure.',
        'Questionnaire released to advisor portal same day as submission.',
      ],
    },
    linkedObjects: [{ kind: 'requirement', id: 'req_emp_nb_007', label: 'Scuba Questionnaire' }],
    actions: [{ type: 'complete', label: 'View', isPrimary: true }],
  }),
  task('task_emp_nb_014', NB, 'Chase scuba questionnaire', 'In Queue', 'Normal', 'application', {
    assignee: 'System',
    assigneeKind: 'team',
    executionMode: 'automated',
    aiGenerated: false,
    hasAI: false,
    origin: 'System',
    createdDate: '2026-05-12',
    dueDate: '2026-05-15',
    aiSummary: 'Automated follow-up — scuba questionnaire still outstanding; reminder sent to advisor 12 May.',
    linkedObjects: [
      { kind: 'requirement', id: 'req_emp_nb_007', label: 'Scuba Questionnaire' },
      { kind: 'document', id: 'doc_emp_nb_scuba_reminder', label: 'Scuba reminder email' },
    ],
    actions: [{ type: 'complete', label: 'View chase log', isPrimary: true }],
  }),
  task('task_emp_nb_015', NB, 'Review Rx report — recommend APS', 'Completed', 'High', 'req_gathering', {
    assignee: 'AI Agent',
    assigneeKind: 'team',
    executionMode: 'semi_auto',
    aiGenerated: true,
    hasAI: true,
    aiConfidence: 88,
    createdDate: '2026-05-11',
    dueDate: '2026-05-11',
    completedDate: '2026-05-11',
    aiSummary:
      'IntelliScript shows lisinopril 10 mg and amlodipine 5 mg — treated hypertension not on application. Recommended APS to Clinique Médicale du Plateau.',
    review: {
      verdict:
        'Recommended attending physician statement to Clinique Médicale du Plateau. IntelliScript shows lisinopril 10 mg and amlodipine 5 mg — treated hypertension not fully characterized on the application; APS needed to confirm control, duration, and underwriting impact.',
      confidence: 88,
      reasoning: [
        'IntelliScript Rx report received 11 May — two antihypertensive medications on continuous fill.',
        'Application lists non-smoker and BMI 25 but does not document treated high blood pressure.',
        'APS from primary care will clarify diagnosis date, blood-pressure control, and related cardiac workup.',
      ],
      evidenceIds: ['doc_emp_nb_rx'],
    },
    aiNarrative: {
      text: 'After Rx ingestion, the agent matched lisinopril and amlodipine to treated hypertension and recommended APS to verify disclosure alignment before final rating.',
      confidence: 88,
      generatedBy: 'AI Agent',
      generatedAt: '2026-05-11',
    },
    evidenceDocuments: [
      { id: 'doc_emp_nb_rx', name: 'Rx report — IntelliScript', size: 'Metadata', category: 'Medical', aiSummary: 'Lisinopril and amlodipine on file — treated hypertension.', followUps: 0 },
    ],
    linkedObjects: [
      { kind: 'requirement', id: 'req_emp_nb_002', label: 'APS' },
      { kind: 'requirement', id: 'req_emp_nb_006', label: 'RX report' },
      { kind: 'document', id: 'doc_emp_nb_rx', label: 'Rx report' },
      { kind: 'task', id: 'task_emp_nb_016', label: 'Approve APS order' },
    ],
    actions: [{ type: 'complete', label: 'View recommendation', isPrimary: true }],
  }),
  task('task_emp_nb_016', NB, 'Approve APS order', 'Completed', 'High', 'req_gathering', {
    assignee: 'Victor Ramon',
    assigneeKind: 'user',
    executionMode: 'manual',
    aiGenerated: false,
    hasAI: false,
    createdDate: '2026-05-11',
    dueDate: '2026-05-11',
    completedDate: '2026-05-11',
    aiSummary: 'Underwriter approved AI-recommended APS after Rx review — lisinopril and amlodipine for treated hypertension.',
    review: {
      verdict:
        'Underwriter approved AI-recommended APS after Rx review — lisinopril and amlodipine for treated hypertension.',
      reasoning: [
        'Reviewed AI recommendation from Review Rx report — treated hypertension disclosure gap is credible.',
        'Authorized APS order to Clinique Médicale du Plateau for same-day release.',
      ],
    },
    evidenceDocuments: [
      { id: 'doc_emp_nb_rx', name: 'Rx report — IntelliScript', size: 'Metadata', category: 'Medical', aiSummary: 'Rx trigger for APS approval.', followUps: 0 },
    ],
    linkedObjects: [
      { kind: 'requirement', id: 'req_emp_nb_002', label: 'APS' },
      { kind: 'requirement', id: 'req_emp_nb_006', label: 'RX report' },
      { kind: 'task', id: 'task_emp_nb_015', label: 'Review Rx — recommend APS' },
      { kind: 'task', id: 'task_emp_nb_017', label: 'Order APS' },
    ],
    actions: [{ type: 'complete', label: 'View approval', isPrimary: true }],
  }),
  task('task_emp_nb_017', NB, 'Order APS — Clinique Médicale du Plateau', 'Completed', 'High', 'req_gathering', {
    assignee: 'Victor Ramon',
    assigneeKind: 'user',
    executionMode: 'manual',
    aiGenerated: false,
    hasAI: false,
    createdDate: '2026-05-11',
    dueDate: '2026-05-11',
    completedDate: '2026-05-11',
    aiSummary: 'APS request sent to Clinique Médicale du Plateau same day as Rx return and underwriter approval.',
    review: {
      verdict: 'APS request sent to Clinique Médicale du Plateau same day as Rx return and underwriter approval.',
      reasoning: [
        'APS request form generated with physician contact from the application.',
        'Requirement due 22 May — automated follow-up scheduled if not received.',
      ],
    },
    evidenceDocuments: [
      { id: 'doc_emp_nb_aps_request', name: 'APS request — Clinique Médicale du Plateau', size: 'Metadata', category: 'Medical', aiSummary: 'APS order released to physician.', followUps: 0 },
    ],
    linkedObjects: [
      { kind: 'requirement', id: 'req_emp_nb_002', label: 'APS' },
      { kind: 'document', id: 'doc_emp_nb_aps_request', label: 'APS request' },
      { kind: 'task', id: 'task_emp_nb_016', label: 'Approve APS order' },
      { kind: 'task', id: 'task_emp_nb_018', label: 'APS follow-up' },
    ],
    actions: [{ type: 'complete', label: 'View APS request', isPrimary: true }],
  }),
  task('task_emp_nb_018', NB, 'APS follow-up — physician chase', 'In Queue', 'Normal', 'req_gathering', {
    assignee: 'System',
    assigneeKind: 'team',
    executionMode: 'automated',
    aiGenerated: false,
    hasAI: false,
    origin: 'System',
    createdDate: '2026-05-11',
    dueDate: '2026-05-22',
    aiSummary: 'Automated chase schedule active — APS ordered 11 May; first physician follow-up due if not received.',
    review: {
      verdict: 'Automated chase schedule active — APS ordered 11 May; first physician follow-up due if not received.',
      reasoning: [
        'Chase cadence: reminder 15 May, second notice 19 May, escalation 22 May if still outstanding.',
        'Monitoring Clinique Médicale du Plateau for APS return.',
      ],
    },
    linkedObjects: [
      { kind: 'requirement', id: 'req_emp_nb_002', label: 'APS' },
      { kind: 'document', id: 'doc_emp_nb_aps_request', label: 'APS request' },
      { kind: 'task', id: 'task_emp_nb_017', label: 'Order APS' },
    ],
    actions: [{ type: 'complete', label: 'View follow-up schedule', isPrimary: true }],
  }),

  task('task_emp_nb_s_001', NB_S, 'Review Solution 10 application & questionnaire', 'Completed', 'Normal', 'application', {
    aiSummary: 'Solution 10 application and Adult-Short questionnaire validated — tele-interview scheduled.',
    evidenceDocuments: [
      { id: 'doc_emp_nb_s_app', name: 'Application — Liam O\'Brien (Solution 10)', size: 'Metadata', category: 'Financial', aiSummary: 'Solution 10 term $250,000.', followUps: 0 },
      { id: 'doc_emp_nb_s_questionnaire', name: 'Adult-Short health questionnaire', size: 'Metadata', category: 'Financial', aiSummary: 'No adverse disclosures.', followUps: 0 },
    ],
    linkedObjects: [
      { kind: 'requirement', id: 'req_emp_nb_s_001', label: 'Application' },
      { kind: 'requirement', id: 'req_emp_nb_s_002', label: 'Questionnaire' },
      { kind: 'document', id: 'doc_emp_nb_s_app', label: 'Application' },
      { kind: 'document', id: 'doc_emp_nb_s_questionnaire', label: 'Questionnaire' },
      { kind: 'request', id: 'REQ-EMP-2026-003', label: 'Solution 10 app' },
    ],
    actions: [{ type: 'complete', label: 'View application', isPrimary: true }],
  }),
  task('task_emp_nb_s_002', NB_S, 'Conduct tele-interview', 'To Do', 'Normal', 'tele-interview', {
    dueDate: '2026-05-22',
    aiSummary: 'Personal History Tele-Interview 22 May 14:00 MT — Liam O\'Brien. Adult-Short questionnaire complete.',
    evidenceDocuments: [{ id: 'doc_emp_nb_s_tele_schedule', name: 'Interview schedule', size: 'Metadata', category: 'Financial', aiSummary: 'Scheduled.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_emp_nb_s_003', label: 'Tele-interview' },
      { kind: 'document', id: 'doc_emp_nb_s_tele_schedule', label: 'Interview schedule' },
    ],
  }),
  task('task_emp_nb_s_003', NB_S, 'Validate Adult-Short questionnaire responses', 'Completed', 'Normal', 'simplified-questionnaire', {
    evidenceDocuments: [{ id: 'doc_emp_nb_s_questionnaire', name: 'Adult-Short health questionnaire', size: 'Metadata', category: 'Financial', aiSummary: 'No adverse disclosures.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_emp_nb_s_002', label: 'Questionnaire' },
      { kind: 'document', id: 'doc_emp_nb_s_questionnaire', label: 'Questionnaire' },
    ],
    actions: [{ type: 'complete', label: 'View questionnaire', isPrimary: true }],
  }),

  task('task_emp_nb_g_001', NB_G, 'Confirm guaranteed issue eligibility', 'Completed', 'Normal', 'eligibility-check', {
    aiSummary: 'Patricia Singh age 67 — eligible for Guaranteed Life Protect up to $50,000.',
    evidenceDocuments: [{ id: 'doc_emp_nb_g_app', name: 'Application — Patricia Singh', size: 'Metadata', category: 'Financial', aiSummary: 'Guaranteed Life Protect $50,000.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_emp_nb_g_002', label: 'Eligibility check' },
      { kind: 'requirement', id: 'req_emp_nb_g_001', label: 'Application' },
      { kind: 'document', id: 'doc_emp_nb_g_app', label: 'Application' },
      { kind: 'request', id: 'REQ-EMP-2026-006', label: 'GLP application' },
    ],
    actions: [{ type: 'complete', label: 'View application', isPrimary: true }],
  }),
  task('task_emp_nb_g_002', NB_G, 'Validate PAD authorization', 'In Queue', 'Normal', 'contract-issuance', {
    aiSummary: 'Pre-authorized debit form received — pending bank confirmation.',
    evidenceDocuments: [{ id: 'doc_emp_nb_g_pad', name: 'PAD authorization', size: 'Metadata', category: 'Financial', aiSummary: 'Awaiting bank validation.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_emp_nb_g_003', label: 'PAD authorization' },
      { kind: 'document', id: 'doc_emp_nb_g_pad', label: 'PAD authorization' },
    ],
  }),
  task('task_emp_nb_g_003', NB_G, 'Review beneficiary designation', 'Completed', 'Normal', 'contract-issuance', {
    aiSummary: 'Beneficiary designation on application reviewed — spouse primary, children contingent.',
    evidenceDocuments: [{ id: 'doc_emp_nb_g_app', name: 'Application — Patricia Singh', size: 'Metadata', category: 'Financial', aiSummary: 'Beneficiary section complete.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_emp_nb_g_001', label: 'Application' },
      { kind: 'document', id: 'doc_emp_nb_g_app', label: 'Application' },
    ],
    actions: [{ type: 'complete', label: 'View application', isPrimary: true }],
  }),
];
