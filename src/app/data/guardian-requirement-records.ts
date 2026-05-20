import type { DatasetRequirementRecord } from './multi-case-dataset';
import { GUARDIAN_DEMO_CASE_IDS } from './guardianDemoCaseIds';

const IP = GUARDIAN_DEMO_CASE_IDS.incomeProtectionClaim;
const CI = GUARDIAN_DEMO_CASE_IDS.criticalIllnessClaim;
const LIFE = GUARDIAN_DEMO_CASE_IDS.lifeDeathClaim;
const NB = GUARDIAN_DEMO_CASE_IDS.nbFullUw;
const NB_S = GUARDIAN_DEMO_CASE_IDS.nbSimplified;

function req(
  id: string,
  caseId: string,
  label: string,
  status: string,
  stage: string,
  extra: Partial<DatasetRequirementRecord> = {},
): DatasetRequirementRecord {
  const fulfilled = status === 'fulfilled' || status === 'Fulfilled';
  return {
    id,
    kind: 'requirement',
    label,
    category: extra.category ?? 'Documentation',
    status,
    stage,
    rag: fulfilled ? 'Green' : status === 'Overdue' ? 'Red' : 'Amber',
    dueDate: extra.dueDate ?? '2026-05-20',
    followUpDate: extra.followUpDate ?? extra.dueDate ?? '2026-05-20',
    source: extra.source ?? 'guardian_claims',
    sourceType: extra.sourceType ?? 'system',
    responsibleParty: extra.responsibleParty ?? 'Claims team',
    notes: extra.notes ?? '',
    aiSummary: extra.aiSummary ?? `${label} — ${status}.`,
    fulfillmentCriteria: extra.fulfillmentCriteria ?? [`${label} completed`],
    linkedDocs: extra.linkedDocs ?? [],
    linkedTasks: extra.linkedTasks ?? [],
    blockingImpact: extra.blockingImpact ?? null,
    context: extra.context ?? {
      type: 'claim',
      label: 'Requirement context',
      description: `${label} for case ${caseId}.`,
      kv: [{ label: 'Case', value: caseId }],
    },
    history: extra.history ?? [
      { date: '2026-05-12', action: `Requirement created — ${label}`, user: 'System', dot: 'blue' },
      { date: '2026-05-15', action: `In progress — ${label}`, user: 'Victor Ramon', dot: 'amber' },
    ],
    phase: 'pre-approval',
    workflowStepId: stage,
    ...extra,
    linkedObjects: [
      { kind: 'case', id: caseId, label: caseId },
      ...(extra.linkedDocs ?? []).map((docId) => ({ kind: 'document' as const, id: docId, label: docId })),
      ...(extra.linkedTasks ?? []).map((taskId) => ({ kind: 'task' as const, id: taskId, label: taskId })),
      ...(extra.linkedObjects ?? []).filter((ref) => ref.kind !== 'case'),
    ],
  };
}

export const GUARDIAN_REQUIREMENT_RECORDS: DatasetRequirementRecord[] = [
  req('req_gdn_ip_001', IP, 'FNOL — phone registration', 'Fulfilled', 'fnol_received', {
    category: 'FNOL',
    aiSummary: 'Claim registered via 0808 173 1821. Confirmation email sent to James Hartley and adviser Harriet Shaw.',
    fulfillmentCriteria: ['Phone FNOL captured', 'Confirmation email issued', 'Claim reference CLM-IP-2026-0142'],
    linkedDocs: ['doc_gdn_ip_fnol'],
    linkedTasks: ['task_gdn_ip_001'],
    context: {
      type: 'claim',
      label: 'Income protection FNOL',
      description: 'Guardian claims team registered incapacity following lumbar disc injury. PDG Claims Charter: named handler assigned.',
      kv: [
        { label: 'Policy', value: 'GDN-IP-2023-009871' },
        { label: 'Monthly benefit', value: '£4,200' },
        { label: 'Deferred period', value: '13 weeks (satisfied 10 May 2026)' },
      ],
    },
    history: [
      { date: '2026-03-18', action: 'FNOL registered by phone — life assured', user: 'Claims team', dot: 'green' },
      { date: '2026-03-18', action: 'Confirmation email sent', user: 'System', dot: 'green' },
    ],
  }),
  req('req_gdn_ip_002', IP, 'Deferred period verification', 'Fulfilled', 'initial_triage', {
    aiSummary: '13-week deferred period ended 10 May 2026. First monthly payment eligible from May benefit period.',
    linkedTasks: ['task_gdn_ip_002'],
    history: [{ date: '2026-05-10', action: 'Deferred period satisfied', user: 'System', dot: 'green' }],
  }),
  req('req_gdn_ip_003', IP, 'Employer incapacity confirmation', 'Overdue', 'req_gathering', {
    category: 'Medical',
    dueDate: '2026-05-18',
    responsibleParty: 'James Hartley / TechFlow Ltd HR',
    blockingImpact: { severity: 'medium', reason: 'Own-occupation wording required on Fit Note before benefit decision' },
    linkedDocs: ['doc_gdn_ip_employer'],
    linkedTasks: ['task_gdn_ip_003'],
    aiSummary: 'Fit Note received but lacks explicit own-occupation language for software engineering — chase employer HR.',
    fulfillmentCriteria: ['Employer Fit Note on letterhead', 'Dates cover incapacity period', 'States unable to perform own occupation'],
    context: {
      type: 'person',
      label: 'Employer evidence',
      description: 'TechFlow Ltd must confirm James Hartley cannot perform duties as Software Engineer.',
      kv: [{ label: 'Employer', value: 'TechFlow Ltd' }, { label: 'Occupation', value: 'Software engineer' }],
    },
  }),
  req('req_gdn_ip_004', IP, 'Consultant letter — unable to work', 'In Queue', 'req_gathering', {
    category: 'Medical',
    linkedDocs: ['doc_gdn_ip_consultant'],
    linkedTasks: ['task_gdn_ip_004'],
    aiSummary: 'Dr Patel letter supports incapacity; review against own-occupation definition with employer note.',
  }),
  req('req_gdn_ip_005', IP, 'HALO consent & handoff', 'Fulfilled', 'initial_triage', {
    category: 'Support',
    linkedDocs: ['doc_gdn_ip_halo'],
    linkedTasks: ['task_gdn_ip_005'],
    history: [{ date: '2026-03-20', action: 'HALO specialist introduced', user: 'Victor Ramon', dot: 'green' }],
  }),
  req('req_gdn_ip_006', IP, 'IP incapacity questionnaire', 'Fulfilled', 'fnol_received', {
    linkedDocs: ['doc_gdn_ip_questionnaire'],
    linkedTasks: ['task_gdn_ip_001'],
    history: [{ date: '2026-03-19', action: 'Questionnaire completed by life assured', user: 'System', dot: 'green' }],
  }),

  req('req_gdn_ci_001', CI, 'FNOL — phone registration', 'Fulfilled', 'fnol_received', {
    linkedDocs: ['doc_gdn_ci_fnol'],
    linkedTasks: ['task_gdn_ci_001'],
    aiSummary: 'Adviser Harriet Shaw reported diagnosis; claim opened CLM-CI-2026-0089 same day.',
    history: [{ date: '2026-04-02', action: 'CI claim registered', user: 'Claims team', dot: 'green' }],
  }),
  req('req_gdn_ci_002', CI, 'UK consultant diagnosis letter', 'Fulfilled', 'req_gathering', {
    category: 'Medical',
    aiSummary: 'Consultant oncology letter satisfies Guardian faster-fairer CI evidence — invasive ductal carcinoma.',
    fulfillmentCriteria: ['UK consultant written diagnosis', 'Condition on definition schedule', 'Histopathology corroboration'],
    linkedDocs: ['doc_gdn_ci_diagnosis', 'doc_gdn_ci_pathology'],
    linkedTasks: ['task_gdn_ci_002'],
    context: {
      type: 'claim',
      label: 'Critical illness evidence',
      description: 'Full £150,000 sum assured on policy GDN-CI-2021-004455.',
      kv: [{ label: 'Sum assured', value: '£150,000' }, { label: 'Product', value: 'Guardian CI Protection' }],
    },
    history: [{ date: '2026-05-02', action: 'Consultant letter validated', user: 'Victor Ramon', dot: 'green' }],
  }),
  req('req_gdn_ci_003', CI, 'Policy definitions review', 'Fulfilled', 'medical_review', {
    linkedTasks: ['task_gdn_ci_003'],
    aiSummary: 'Definitions review complete — no exclusions apply; contestability not triggered.',
    history: [{ date: '2026-05-10', action: 'Definitions sign-off', user: 'Medical reviewer', dot: 'green' }],
  }),
  req('req_gdn_ci_004', CI, 'HALO support plan', 'Fulfilled', 'medical_review', {
    linkedDocs: ['doc_gdn_ci_halo_plan'],
    linkedTasks: ['task_gdn_ci_004'],
    aiSummary: 'HALO active — treatment pathway and adviser updates scheduled.',
  }),

  req('req_gdn_life_001', LIFE, 'Death certificate', 'Fulfilled', 'fnol_received', {
    linkedDocs: ['doc_gdn_life_death_cert'],
    linkedTasks: ['task_gdn_life_001'],
    history: [{ date: '2026-04-28', action: 'Death certificate verified', user: 'System', dot: 'green' }],
  }),
  req('req_gdn_life_002', LIFE, 'Funeral Payment Pledge advance (£10,000)', 'Fulfilled', 'initial_triage', {
    aiSummary: '£10,000 funeral advance paid to Sarah Clarke 6 May 2026 under PDG Funeral Payment Pledge.',
    linkedDocs: ['doc_gdn_life_funeral'],
    linkedTasks: ['task_gdn_life_002'],
    history: [{ date: '2026-05-06', action: 'Advance payment released', user: 'Finance', dot: 'green' }],
  }),
  req('req_gdn_life_003', LIFE, 'Grant of probate', 'In Queue', 'req_gathering', {
    dueDate: '2026-06-15',
    blockingImpact: { severity: 'high', reason: 'Final £490,000 balance requires grant of probate' },
    linkedDocs: ['doc_gdn_life_probate'],
    linkedTasks: ['task_gdn_life_003'],
    aiSummary: 'Solicitor draft received; grant not yet issued — monitor weekly.',
  }),
  req('req_gdn_life_004', LIFE, 'Beneficiary bank details', 'Fulfilled', 'initial_triage', {
    linkedDocs: ['doc_gdn_life_bank'],
    linkedTasks: ['task_gdn_life_004'],
  }),
  req('req_gdn_life_005', LIFE, 'Life claim form', 'Fulfilled', 'fnol_received', {
    linkedDocs: ['doc_gdn_life_claim_form'],
    linkedTasks: ['task_gdn_life_001'],
    history: [{ date: '2026-04-29', action: 'Claim form received from beneficiary', user: 'System', dot: 'green' }],
  }),

  req('req_gdn_nb_001', NB, 'Application & adviser fact find', 'Fulfilled', 'application', {
    context: { type: 'application', label: 'New business intake', description: 'APP-7721 via Guardian Adviser Portal.', kv: [{ label: 'Sum assured', value: '£350,000' }] },
    linkedDocs: ['doc_gdn_nb_app', 'doc_gdn_nb_fact_find'],
    linkedTasks: ['task_gdn_nb_001'],
    history: [{ date: '2026-05-10', action: 'Application received', user: 'System', dot: 'green' }],
  }),
  req('req_gdn_nb_002', NB, 'GP report (Medicals)', 'Overdue', 'req_gathering', {
    category: 'Medical',
    dueDate: '2026-05-19',
    linkedDocs: ['doc_gdn_nb_gp_request'],
    linkedTasks: ['task_gdn_nb_002'],
    blockingImpact: { severity: 'medium', reason: 'Final underwriting rating held pending GP report' },
    aiSummary: 'GP report ordered 12 May from Reading Medical Centre — chase overdue.',
    context: { type: 'application', label: 'Medicals', description: 'Full underwriting requires GP report for BMI and general health confirmation.', kv: [] },
  }),
  req('req_gdn_nb_003', NB, 'MIB search', 'Fulfilled', 'application', {
    linkedDocs: ['doc_gdn_nb_mib'],
    linkedTasks: ['task_gdn_nb_003'],
    history: [{ date: '2026-05-11', action: 'MIB clear', user: 'System', dot: 'green' }],
  }),
  req('req_gdn_nb_004', NB, 'Children’s CI selection form', 'Fulfilled', 'application', {
    linkedDocs: ['doc_gdn_nb_children_ci'],
    linkedTasks: ['task_gdn_nb_004'],
  }),
  req('req_gdn_nb_005', NB, 'Tele-interview (full UW)', 'Fulfilled', 'application', {
    category: 'Underwriting',
    linkedDocs: ['doc_gdn_nb_tele_interview'],
    linkedTasks: ['task_gdn_nb_006'],
    history: [{ date: '2026-05-14', action: 'Tele-interview completed — no adverse disclosures', user: 'Richard Daniels', dot: 'green' }],
  }),

  req('req_gdn_nb_s_001', NB_S, 'Application — Life Essentials', 'Fulfilled', 'application', {
    linkedDocs: ['doc_gdn_nb_s_app'],
    linkedTasks: ['task_gdn_nb_s_001'],
    context: { type: 'application', label: 'Simplified UW', description: 'Life Essentials £100,000 — APP-8804.', kv: [] },
  }),
  req('req_gdn_nb_s_002', NB_S, 'Tele-interview', 'In Queue', 'tele-interview', {
    dueDate: '2026-05-19',
    linkedDocs: ['doc_gdn_nb_s_tele_schedule'],
    linkedTasks: ['task_gdn_nb_s_002'],
    aiSummary: 'Tele-interview scheduled 19 May 10:00 — Oliver Hughes.',
  }),
];
