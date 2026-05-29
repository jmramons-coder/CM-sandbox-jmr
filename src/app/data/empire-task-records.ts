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
    summary: extra.summary ?? {
      contextLabel: 'Task context',
      title: label,
      description,
      checklist: extra.summary?.checklist ?? [
        `Review ${label.toLowerCase()}`,
        'Update case notes and advisor copy',
        'Confirm requirement status',
      ],
    },
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
      { kind: 'request', id: 'REQ-EMP-2026-004', label: 'DI FNOL' },
    ],
  }),
  task('task_emp_di_002', DI, 'Verify 90-day waiting period', 'Completed', 'Normal', 'initial_triage', {
    aiSummary: 'Waiting period satisfied 18 May 2026 — first benefit month May 2026.',
    linkedObjects: [{ kind: 'requirement', id: 'req_emp_di_002', label: 'Waiting period' }],
  }),
  task('task_emp_di_003', DI, 'Chase employer physician statement — own occupation', 'In Queue', 'High', 'req_gathering', {
    aiSummary: 'Contact Maple Tech HR — statement must state unable to perform software development duties.',
    alert: { type: 'sla', message: 'Overdue 2 days' },
    evidenceDocuments: [{ id: 'doc_emp_di_employer', name: 'Employer physician statement', size: 'Metadata', category: 'Medical', aiSummary: 'Wording gap on own occupation.', followUps: 2 }],
    linkedObjects: [{ kind: 'requirement', id: 'req_emp_di_003', label: 'Employer statement' }],
  }),

  task('task_emp_ci_001', CI, 'Register CI claim — advisor notification', 'Completed', 'Normal', 'fnol_received', {
    aiSummary: 'Sophie Chen CI claim opened; advisor Pacific Wealth Advisors primary contact.',
    linkedObjects: [{ kind: 'request', id: 'REQ-EMP-2026-001', label: 'CI notification' }],
  }),
  task('task_emp_ci_002', CI, 'Validate specialist diagnosis letter', 'Completed', 'Urgent', 'req_gathering', {
    hasAI: true,
    aiSummary: 'Invasive ductal carcinoma confirmed — meets Empire Life CI definition. Recommend full payout.',
    evidenceDocuments: [
      { id: 'doc_emp_ci_diagnosis', name: 'Specialist diagnosis', size: 'Metadata', category: 'Medical', aiSummary: 'Full $125k recommended.', followUps: 0 },
      { id: 'doc_emp_ci_pathology', name: 'Pathology report', size: 'Metadata', category: 'Medical', aiSummary: 'Corroborates diagnosis.', followUps: 0 },
    ],
    linkedObjects: [{ kind: 'document', id: 'doc_emp_ci_diagnosis', label: 'Diagnosis letter' }],
  }),
  task('task_emp_ci_003', CI, 'Prepare decision recommendation', 'In Queue', 'Urgent', 'decision', {
    hasAI: true,
    aiSummary: 'All requirements fulfilled — recommend approve $125,000. Copy advisor on decision letter.',
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
      { kind: 'request', id: 'REQ-EMP-2026-005', label: 'Death notification' },
    ],
  }),
  task('task_emp_life_002', LIFE, 'Process compassionate advance $15,000', 'Completed', 'Normal', 'initial_triage', {
    aiSummary: 'Compassionate advance released to Margaret MacDonald.',
    evidenceDocuments: [{ id: 'doc_emp_life_funeral', name: 'Funeral invoice', size: 'Metadata', category: 'Financial', aiSummary: '$14,200 invoice.', followUps: 0 }],
    linkedObjects: [{ kind: 'requirement', id: 'req_emp_life_002', label: 'Compassionate advance' }],
  }),
  task('task_emp_life_003', LIFE, 'Track estate documentation — final balance $385,000', 'In Queue', 'Normal', 'req_gathering', {
    aiSummary: 'Weekly chase with estate lawyer — probate certificate expected June 2026.',
    evidenceDocuments: [{ id: 'doc_emp_life_probate', name: 'Probate application draft', size: 'Metadata', category: 'Legal', aiSummary: 'Certificate pending.', followUps: 1 }],
    linkedObjects: [{ kind: 'requirement', id: 'req_emp_life_003', label: 'Estate documentation' }],
  }),

  task('task_emp_nb_001', NB, 'Complete application triage', 'Completed', 'Normal', 'application', {
    linkedObjects: [{ kind: 'request', id: 'REQ-EMP-2026-002', label: 'NB application' }],
  }),
  task('task_emp_nb_002', NB, 'Order and chase APS', 'In Queue', 'High', 'req_gathering', {
    aiSummary: 'Clinique Médicale du Plateau — APS overdue since 20 May.',
    alert: { type: 'sla', message: 'APS overdue' },
    evidenceDocuments: [{ id: 'doc_emp_nb_aps_request', name: 'APS request', size: 'Metadata', category: 'Medical', aiSummary: 'Awaiting clinic response.', followUps: 2 }],
    linkedObjects: [{ kind: 'requirement', id: 'req_emp_nb_002', label: 'APS' }],
  }),
  task('task_emp_nb_003', NB, 'Review financial questionnaire', 'Completed', 'Normal', 'application', {
    evidenceDocuments: [{ id: 'doc_emp_nb_financial', name: 'Financial questionnaire', size: 'Metadata', category: 'Financial', aiSummary: 'Affordability confirmed.', followUps: 0 }],
    linkedObjects: [{ kind: 'requirement', id: 'req_emp_nb_004', label: 'Financial questionnaire' }],
  }),

  task('task_emp_nb_s_001', NB_S, 'Review Solution 10 application & questionnaire', 'Completed', 'Normal', 'application', {
    linkedObjects: [{ kind: 'request', id: 'REQ-EMP-2026-003', label: 'Solution 10 app' }],
  }),
  task('task_emp_nb_s_002', NB_S, 'Conduct tele-interview', 'To Do', 'Normal', 'tele-interview', {
    dueDate: '2026-05-22',
    aiSummary: 'Personal History Tele-Interview 22 May 14:00 MT — Liam O\'Brien. Adult-Short questionnaire complete.',
    evidenceDocuments: [{ id: 'doc_emp_nb_s_tele_schedule', name: 'Interview schedule', size: 'Metadata', category: 'Financial', aiSummary: 'Scheduled.', followUps: 0 }],
    linkedObjects: [{ kind: 'requirement', id: 'req_emp_nb_s_003', label: 'Tele-interview' }],
  }),
  task('task_emp_nb_s_003', NB_S, 'Validate Adult-Short questionnaire responses', 'Completed', 'Normal', 'simplified-questionnaire', {
    linkedObjects: [{ kind: 'requirement', id: 'req_emp_nb_s_002', label: 'Questionnaire' }],
  }),

  task('task_emp_nb_g_001', NB_G, 'Confirm guaranteed issue eligibility', 'Completed', 'Normal', 'eligibility-check', {
    aiSummary: 'Patricia Singh age 67 — eligible for Guaranteed Life Protect up to $50,000.',
    linkedObjects: [
      { kind: 'requirement', id: 'req_emp_nb_g_002', label: 'Eligibility check' },
      { kind: 'request', id: 'REQ-EMP-2026-006', label: 'GLP application' },
    ],
  }),
  task('task_emp_nb_g_002', NB_G, 'Validate PAD authorization', 'In Queue', 'Normal', 'contract-issuance', {
    aiSummary: 'Pre-authorized debit form received — pending bank confirmation.',
    evidenceDocuments: [{ id: 'doc_emp_nb_g_pad', name: 'PAD authorization', size: 'Metadata', category: 'Financial', aiSummary: 'Awaiting bank validation.', followUps: 0 }],
    linkedObjects: [{ kind: 'requirement', id: 'req_emp_nb_g_003', label: 'PAD authorization' }],
  }),
  task('task_emp_nb_g_003', NB_G, 'Review beneficiary designation', 'Completed', 'Normal', 'contract-issuance', {
    linkedObjects: [{ kind: 'requirement', id: 'req_emp_nb_g_001', label: 'Application' }],
  }),
];
