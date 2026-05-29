import type { DatasetTaskRecord } from './multi-case-dataset';
import { GUARDIAN_DEMO_CASE_IDS } from './guardianDemoCaseIds';

const IP = GUARDIAN_DEMO_CASE_IDS.incomeProtectionClaim;
const CI = GUARDIAN_DEMO_CASE_IDS.criticalIllnessClaim;
const LIFE = GUARDIAN_DEMO_CASE_IDS.lifeDeathClaim;
const NB = GUARDIAN_DEMO_CASE_IDS.nbFullUw;
const NB_S = GUARDIAN_DEMO_CASE_IDS.nbSimplified;

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
    caseSubtype: extra.caseSubtype ?? (caseId.startsWith('CLM-IP') ? 'disability_benefit' : caseId.startsWith('CLM') ? 'death_benefit' : 'full_underwriting'),
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
    product: extra.product ?? 'Guardian protection',
    origin: extra.origin ?? 'Manual',
    dueDate: extra.dueDate ?? '2026-05-20',
    aiSummary: extra.aiSummary,
    description,
    ...extra,
    summary: extra.summary ?? {
      contextLabel: 'Task context',
      title: label,
      description,
      checklist: extra.summary?.checklist ?? [
        `Review ${label.toLowerCase()}`,
        'Update case notes and adviser copy',
        'Confirm requirement status in Amplify',
      ],
    },
    linkedObjects: [
      { kind: 'case', id: caseId, label: caseId },
      ...(extra.linkedObjects ?? []).filter((ref) => ref.kind !== 'case'),
    ],
  };
}

export const GUARDIAN_TASK_RECORDS: DatasetTaskRecord[] = [
  task('task_gdn_ip_001', IP, 'Register claim from phone FNOL', 'Completed', 'Normal', 'fnol_received', {
    aiSummary: 'Claim CLM-IP-2026-0142 registered. Confirmation email sent to James Hartley and Harriet Shaw.',
    evidenceDocuments: [{ id: 'doc_gdn_ip_fnol', name: 'FNOL confirmation email', size: 'Metadata', category: 'Claim', aiSummary: 'FNOL registered 18 Mar 2026.', followUps: 0 }],
    linkedObjects: [{ kind: 'requirement', id: 'req_gdn_ip_001', label: 'FNOL' }],
  }),
  task('task_gdn_ip_002', IP, 'Verify 13-week deferred period', 'Completed', 'Normal', 'initial_triage', {
    aiSummary: 'Deferred period satisfied 10 May 2026 — first benefit month May 2026.',
    linkedObjects: [{ kind: 'requirement', id: 'req_gdn_ip_002', label: 'Deferred period' }],
  }),
  task('task_gdn_ip_003', IP, 'Chase employer Fit Note — own occupation', 'In Queue', 'High', 'req_gathering', {
    aiSummary: 'Contact TechFlow HR — Fit Note must state unable to perform software engineering duties.',
    alert: { type: 'sla', message: 'Overdue 3 days' },
    evidenceDocuments: [{ id: 'doc_gdn_ip_employer', name: 'Employer Fit Note', size: 'Metadata', category: 'Medical', aiSummary: 'Wording gap on own occupation.', followUps: 2 }],
    linkedObjects: [{ kind: 'requirement', id: 'req_gdn_ip_003', label: 'Employer confirmation' }],
  }),
  task('task_gdn_ip_004', IP, 'Review consultant letter — Dr Patel', 'To Do', 'Normal', 'req_gathering', {
    hasAI: true,
    aiSummary: 'Consultant supports incapacity for software work — pair with employer evidence.',
    evidenceDocuments: [{ id: 'doc_gdn_ip_consultant', name: 'Consultant letter', size: 'Metadata', category: 'Medical', aiSummary: 'Own-occupation support documented.', followUps: 0 }],
    linkedObjects: [{ kind: 'requirement', id: 'req_gdn_ip_004', label: 'Consultant letter' }],
  }),
  task('task_gdn_ip_005', IP, 'Introduce HALO specialist', 'Completed', 'Normal', 'initial_triage', {
    linkedObjects: [{ kind: 'requirement', id: 'req_gdn_ip_005', label: 'HALO' }],
  }),

  task('task_gdn_ci_001', CI, 'Register CI claim — adviser phone line', 'Completed', 'Normal', 'fnol_received', {
    aiSummary: 'Leana Mitchell CI claim opened; adviser Harriet Shaw primary contact.',
    linkedObjects: [{ kind: 'request', id: 'REQ-GDN-2026-001', label: 'CI notification' }],
  }),
  task('task_gdn_ci_002', CI, 'Validate consultant diagnosis letter', 'Completed', 'Urgent', 'req_gathering', {
    hasAI: true,
    aiSummary: 'Invasive ductal carcinoma confirmed — meets Guardian CI definition. Recommend full payout.',
    evidenceDocuments: [
      { id: 'doc_gdn_ci_diagnosis', name: 'Consultant diagnosis', size: 'Metadata', category: 'Medical', aiSummary: 'Full £150k recommended.', followUps: 0 },
      { id: 'doc_gdn_ci_pathology', name: 'Histopathology', size: 'Metadata', category: 'Medical', aiSummary: 'Corroborates diagnosis.', followUps: 0 },
    ],
    linkedObjects: [{ kind: 'document', id: 'doc_gdn_ci_diagnosis', label: 'Diagnosis letter' }],
  }),
  task('task_gdn_ci_003', CI, 'Prepare decision recommendation', 'In Queue', 'Urgent', 'decision', {
    hasAI: true,
    aiSummary: 'All requirements fulfilled — recommend approve £150,000. Copy adviser on decision letter.',
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
  task('task_gdn_ci_004', CI, 'HALO — treatment pathway', 'Completed', 'Normal', 'medical_review', {
    linkedObjects: [{ kind: 'requirement', id: 'req_gdn_ci_004', label: 'HALO' }],
  }),

  task('task_gdn_life_001', LIFE, 'Verify death certificate', 'Completed', 'Normal', 'fnol_received', {
    evidenceDocuments: [{ id: 'doc_gdn_life_death_cert', name: 'Death certificate', size: 'Metadata', category: 'Legal', aiSummary: 'Verified.', followUps: 0 }],
  }),
  task('task_gdn_life_002', LIFE, 'Process funeral advance £10,000', 'Completed', 'Normal', 'initial_triage', {
    aiSummary: 'Funeral Payment Pledge advance released to Sarah Clarke.',
    evidenceDocuments: [{ id: 'doc_gdn_life_funeral', name: 'Funeral invoice', size: 'Metadata', category: 'Financial', aiSummary: '£9,850 invoice.', followUps: 0 }],
  }),
  task('task_gdn_life_003', LIFE, 'Track probate — final balance £490,000', 'In Queue', 'Normal', 'req_gathering', {
    aiSummary: 'Weekly chase with solicitor — grant expected June 2026.',
    evidenceDocuments: [{ id: 'doc_gdn_life_probate', name: 'Probate draft', size: 'Metadata', category: 'Legal', aiSummary: 'Grant pending.', followUps: 1 }],
  }),
  task('task_gdn_life_004', LIFE, 'Send adviser update — Northbridge', 'Completed', 'Normal', 'initial_triage', {}),

  task('task_gdn_nb_001', NB, 'Complete application triage', 'Completed', 'Normal', 'application', {
    aiSummary: 'Application and fact find reviewed. MIB clear; GP report ordered.',
    evidenceDocuments: [
      { id: 'doc_gdn_nb_app', name: 'Application — Priya Sharma', size: 'Metadata', category: 'Financial', aiSummary: 'Life & CI application triaged.', followUps: 0 },
      { id: 'doc_gdn_nb_fact_find', name: 'Adviser fact find', size: 'Metadata', category: 'Financial', aiSummary: 'Fact find supports cover amount.', followUps: 0 },
    ],
    linkedObjects: [
      { kind: 'requirement', id: 'req_gdn_nb_001', label: 'Application & fact find' },
      { kind: 'document', id: 'doc_gdn_nb_app', label: 'Application' },
      { kind: 'document', id: 'doc_gdn_nb_fact_find', label: 'Fact find' },
      { kind: 'request', id: 'REQ-GDN-2026-002', label: 'NB application' },
    ],
    actions: [{ type: 'complete', label: 'View application', isPrimary: true }],
  }),
  task('task_gdn_nb_002', NB, 'Order and chase GP report', 'In Queue', 'High', 'req_gathering', {
    aiSummary: 'Reading Medical Centre — GP report overdue since 19 May.',
    alert: { type: 'sla', message: 'GP report overdue' },
    evidenceDocuments: [{ id: 'doc_gdn_nb_gp_request', name: 'GP report request', size: 'Metadata', category: 'Medical', aiSummary: 'Awaiting surgery response.', followUps: 3 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_gdn_nb_002', label: 'GP report' },
      { kind: 'document', id: 'doc_gdn_nb_gp_request', label: 'GP report request' },
    ],
  }),
  task('task_gdn_nb_003', NB, 'Review MIB results', 'Completed', 'Normal', 'application', {
    evidenceDocuments: [{ id: 'doc_gdn_nb_mib', name: 'MIB search', size: 'Metadata', category: 'Financial', aiSummary: 'Clear.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_gdn_nb_003', label: 'MIB search' },
      { kind: 'document', id: 'doc_gdn_nb_mib', label: 'MIB search' },
    ],
    actions: [{ type: 'complete', label: 'View MIB', isPrimary: true }],
  }),
  task('task_gdn_nb_004', NB, 'Validate children’s CI rider', 'Completed', 'Normal', 'application', {
    evidenceDocuments: [{ id: 'doc_gdn_nb_children_ci', name: 'Children CI form', size: 'Metadata', category: 'Financial', aiSummary: 'Two children listed.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_gdn_nb_004', label: 'Children CI rider' },
      { kind: 'document', id: 'doc_gdn_nb_children_ci', label: 'Children CI form' },
    ],
    actions: [{ type: 'complete', label: 'View form', isPrimary: true }],
  }),
  task('task_gdn_nb_006', NB, 'Complete tele-interview', 'Completed', 'Normal', 'application', {
    assignee: 'Richard Daniels',
    aiSummary: 'Tele-interview 14 May — no adverse disclosures; standard lifestyle.',
    evidenceDocuments: [{ id: 'doc_gdn_nb_tele_interview', name: 'Tele-interview notes', size: 'Metadata', category: 'Medical', aiSummary: 'Clean pass.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_gdn_nb_005', label: 'Tele-interview' },
      { kind: 'document', id: 'doc_gdn_nb_tele_interview', label: 'Tele-interview notes' },
    ],
    actions: [{ type: 'complete', label: 'View notes', isPrimary: true }],
  }),

  task('task_gdn_nb_s_001', NB_S, 'Review Life Essentials application', 'Completed', 'Normal', 'application', {
    evidenceDocuments: [{ id: 'doc_gdn_nb_s_app', name: 'Application — Oliver Hughes', size: 'Metadata', category: 'Financial', aiSummary: 'Life Essentials application reviewed.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_gdn_nb_s_001', label: 'Application' },
      { kind: 'document', id: 'doc_gdn_nb_s_app', label: 'Application' },
      { kind: 'request', id: 'REQ-GDN-2026-005', label: 'Life Essentials app' },
    ],
    actions: [{ type: 'complete', label: 'View application', isPrimary: true }],
  }),
  task('task_gdn_nb_s_002', NB_S, 'Conduct tele-interview', 'To Do', 'Normal', 'tele-interview', {
    dueDate: '2026-05-19',
    assignee: 'Richard Daniels',
    aiSummary: 'Tele-interview 19 May 10:00 — Oliver Hughes. Simplified UW questionnaire.',
    evidenceDocuments: [{ id: 'doc_gdn_nb_s_tele_schedule', name: 'Interview schedule', size: 'Metadata', category: 'Financial', aiSummary: 'Scheduled.', followUps: 0 }],
  }),
];
