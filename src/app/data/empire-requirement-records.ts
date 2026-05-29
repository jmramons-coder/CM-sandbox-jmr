import type { DatasetRequirementRecord } from './multi-case-dataset';
import { EMPIRE_DEMO_CASE_IDS } from './empireDemoCaseIds';

const DI = EMPIRE_DEMO_CASE_IDS.disabilityClaim;
const CI = EMPIRE_DEMO_CASE_IDS.criticalIllnessClaim;
const LIFE = EMPIRE_DEMO_CASE_IDS.lifeDeathClaim;
const NB = EMPIRE_DEMO_CASE_IDS.nbFullUw;
const NB_S = EMPIRE_DEMO_CASE_IDS.nbSimplified;
const NB_G = EMPIRE_DEMO_CASE_IDS.nbGuaranteed;

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
    dueDate: extra.dueDate ?? '2026-05-22',
    followUpDate: extra.followUpDate ?? extra.dueDate ?? '2026-05-22',
    source: extra.source ?? 'empire_claims',
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

export const EMPIRE_REQUIREMENT_RECORDS: DatasetRequirementRecord[] = [
  req('req_emp_di_001', DI, 'FNOL — advisor notification', 'Fulfilled', 'fnol_received', {
    category: 'FNOL',
    aiSummary: 'Claim registered via Empire Life advisor channel. Confirmation email sent to Marc Tremblay and advisor Jean-Philippe Morin.',
    fulfillmentCriteria: ['Advisor FNOL captured', 'Confirmation email issued', 'Claim reference CLM-DI-2026-0214'],
    linkedDocs: ['doc_emp_di_fnol'],
    linkedTasks: ['task_emp_di_001'],
    context: {
      type: 'claim',
      label: 'Disability FNOL',
      description: 'Empire Life claims team registered disability following rotator cuff injury. Named handler assigned per service standards.',
      kv: [
        { label: 'Policy', value: 'POL-EMP-DI-2023-004521' },
        { label: 'Monthly benefit', value: '$3,800' },
        { label: 'Waiting period', value: '90 days (satisfied 18 May 2026)' },
      ],
    },
    history: [
      { date: '2026-03-22', action: 'FNOL registered by advisor — life insured', user: 'Claims team', dot: 'green' },
      { date: '2026-03-22', action: 'Confirmation email sent', user: 'System', dot: 'green' },
    ],
  }),
  req('req_emp_di_002', DI, 'Waiting period verification', 'Fulfilled', 'initial_triage', {
    aiSummary: '90-day waiting period ended 18 May 2026. First monthly payment eligible from May benefit period.',
    linkedTasks: ['task_emp_di_002'],
    history: [{ date: '2026-05-18', action: 'Waiting period satisfied', user: 'System', dot: 'green' }],
  }),
  req('req_emp_di_003', DI, 'Employer physician statement', 'Overdue', 'req_gathering', {
    category: 'Medical',
    dueDate: '2026-05-20',
    responsibleParty: 'Marc Tremblay / Maple Tech Solutions HR',
    blockingImpact: { severity: 'medium', reason: 'Own-occupation wording required on physician statement before benefit decision' },
    linkedDocs: ['doc_emp_di_employer'],
    linkedTasks: ['task_emp_di_003'],
    aiSummary: 'Physician statement received but lacks explicit own-occupation language for software development — chase employer HR.',
    fulfillmentCriteria: ['Employer physician statement on letterhead', 'Dates cover disability period', 'States unable to perform own occupation'],
    context: {
      type: 'person',
      label: 'Employer evidence',
      description: 'Maple Tech Solutions must confirm Marc Tremblay cannot perform duties as Software Developer.',
      kv: [{ label: 'Employer', value: 'Maple Tech Solutions' }, { label: 'Occupation', value: 'Software developer' }],
    },
  }),
  req('req_emp_di_004', DI, 'Specialist letter — orthopaedic', 'In Queue', 'req_gathering', {
    category: 'Medical',
    linkedDocs: ['doc_emp_di_specialist'],
    linkedTasks: ['task_emp_di_003'],
    aiSummary: 'Dr. Nguyen letter supports disability; review against own-occupation definition with employer statement.',
  }),

  req('req_emp_ci_001', CI, 'FNOL — advisor notification', 'Fulfilled', 'fnol_received', {
    linkedDocs: ['doc_emp_ci_fnol'],
    linkedTasks: ['task_emp_ci_001'],
    aiSummary: 'Advisor Pacific Wealth Advisors reported diagnosis; claim opened CLM-CI-2026-0156 same day.',
    history: [{ date: '2026-04-08', action: 'CI claim registered', user: 'Claims team', dot: 'green' }],
  }),
  req('req_emp_ci_002', CI, 'Specialist diagnosis letter', 'Fulfilled', 'req_gathering', {
    category: 'Medical',
    aiSummary: 'Oncology specialist letter satisfies Empire Life CI evidence — invasive ductal carcinoma.',
    fulfillmentCriteria: ['Canadian specialist written diagnosis', 'Condition on definition schedule', 'Pathology corroboration'],
    linkedDocs: ['doc_emp_ci_diagnosis', 'doc_emp_ci_pathology'],
    linkedTasks: ['task_emp_ci_002'],
    context: {
      type: 'claim',
      label: 'Critical illness evidence',
      description: 'Full $125,000 coverage amount on policy POL-EMP-CI-2021-008734.',
      kv: [{ label: 'Coverage amount', value: '$125,000' }, { label: 'Product', value: 'Empire Critical Illness Insurance' }],
    },
    history: [{ date: '2026-05-05', action: 'Specialist letter validated', user: 'Victor Ramon', dot: 'green' }],
  }),
  req('req_emp_ci_003', CI, 'Policy definitions review', 'Fulfilled', 'medical_review', {
    linkedTasks: ['task_emp_ci_002'],
    aiSummary: 'Definitions review complete — no exclusions apply; contestability not triggered.',
    history: [{ date: '2026-05-12', action: 'Definitions sign-off', user: 'Medical reviewer', dot: 'green' }],
  }),
  req('req_emp_ci_004', CI, 'Advisor support plan', 'Fulfilled', 'medical_review', {
    linkedDocs: ['doc_emp_ci_support'],
    linkedTasks: ['task_emp_ci_003'],
    aiSummary: 'Advisor support active — treatment pathway and client updates scheduled.',
  }),

  req('req_emp_life_001', LIFE, 'Death certificate', 'Fulfilled', 'fnol_received', {
    linkedDocs: ['doc_emp_life_death_cert'],
    linkedTasks: ['task_emp_life_001'],
    history: [{ date: '2026-04-30', action: 'Death certificate verified', user: 'System', dot: 'green' }],
  }),
  req('req_emp_life_002', LIFE, 'Compassionate advance ($15,000)', 'Fulfilled', 'initial_triage', {
    aiSummary: '$15,000 compassionate advance paid to Margaret MacDonald 8 May 2026.',
    linkedDocs: ['doc_emp_life_funeral'],
    linkedTasks: ['task_emp_life_002'],
    history: [{ date: '2026-05-08', action: 'Advance payment released', user: 'Finance', dot: 'green' }],
  }),
  req('req_emp_life_003', LIFE, 'Estate documentation — probate certificate', 'In Queue', 'req_gathering', {
    dueDate: '2026-06-20',
    blockingImpact: { severity: 'high', reason: 'Final $385,000 balance requires probate certificate' },
    linkedDocs: ['doc_emp_life_probate'],
    linkedTasks: ['task_emp_life_003'],
    aiSummary: 'Estate lawyer draft received; probate certificate not yet issued — monitor weekly.',
  }),
  req('req_emp_life_004', LIFE, 'Beneficiary bank details', 'Fulfilled', 'initial_triage', {
    linkedDocs: ['doc_emp_life_bank'],
    linkedTasks: ['task_emp_life_001'],
  }),

  req('req_emp_nb_001', NB, 'Application & advisor needs analysis', 'Fulfilled', 'application', {
    context: { type: 'application', label: 'New business intake', description: 'APP-4401 via Empire Life Advisor Portal.', kv: [{ label: 'Coverage amount', value: '$500,000' }] },
    linkedDocs: ['doc_emp_nb_app', 'doc_emp_nb_needs'],
    linkedTasks: ['task_emp_nb_001'],
    history: [{ date: '2026-05-08', action: 'Application received', user: 'System', dot: 'green' }],
  }),
  req('req_emp_nb_002', NB, 'Attending physician statement (APS)', 'Overdue', 'req_gathering', {
    category: 'Medical',
    dueDate: '2026-05-22',
    linkedDocs: ['doc_emp_nb_aps_request'],
    linkedTasks: ['task_emp_nb_002'],
    blockingImpact: { severity: 'medium', reason: 'Final underwriting rating held pending APS' },
    aiSummary: 'APS ordered 12 May from Clinique Médicale du Plateau — chase overdue.',
    context: { type: 'application', label: 'Medicals', description: 'Full underwriting requires APS for health confirmation.', kv: [] },
  }),
  req('req_emp_nb_003', NB, 'MIB search', 'Fulfilled', 'application', {
    linkedDocs: ['doc_emp_nb_mib'],
    linkedTasks: ['task_emp_nb_001'],
    history: [{ date: '2026-05-09', action: 'MIB clear', user: 'System', dot: 'green' }],
  }),
  req('req_emp_nb_004', NB, 'Financial questionnaire', 'Fulfilled', 'application', {
    linkedDocs: ['doc_emp_nb_financial'],
    linkedTasks: ['task_emp_nb_003'],
    history: [{ date: '2026-05-09', action: 'Financial questionnaire complete', user: 'System', dot: 'green' }],
  }),

  req('req_emp_nb_s_001', NB_S, 'Application — Solution 10 term', 'Fulfilled', 'application', {
    linkedDocs: ['doc_emp_nb_s_app'],
    linkedTasks: ['task_emp_nb_s_001'],
    context: { type: 'application', label: 'Accelerated underwriting', description: 'Solution 10 term $250,000 — Adult-Short + PHI — APP-5512.', kv: [] },
  }),
  req('req_emp_nb_s_002', NB_S, 'Adult-Short health questionnaire', 'Fulfilled', 'simplified-questionnaire', {
    linkedDocs: ['doc_emp_nb_s_questionnaire'],
    linkedTasks: ['task_emp_nb_s_001'],
    aiSummary: 'Adult-Short questionnaire completed — no adverse disclosures.',
    history: [{ date: '2026-05-15', action: 'Questionnaire validated', user: 'System', dot: 'green' }],
  }),
  req('req_emp_nb_s_003', NB_S, 'Personal History Tele-Interview (PHI)', 'In Queue', 'tele-interview', {
    dueDate: '2026-05-22',
    linkedDocs: ['doc_emp_nb_s_tele_schedule'],
    linkedTasks: ['task_emp_nb_s_002'],
    aiSummary: 'Tele-interview scheduled 22 May 14:00 MT — Liam O\'Brien.',
  }),

  req('req_emp_nb_g_001', NB_G, 'Application — Guaranteed Life Protect', 'Fulfilled', 'application', {
    linkedDocs: ['doc_emp_nb_g_app'],
    linkedTasks: ['task_emp_nb_g_001'],
    context: { type: 'application', label: 'Guaranteed issue', description: 'Guaranteed Life Protect $50,000 — APP-6623.', kv: [] },
  }),
  req('req_emp_nb_g_002', NB_G, 'Eligibility check — age band', 'Fulfilled', 'eligibility-check', {
    linkedTasks: ['task_emp_nb_g_001'],
    aiSummary: 'Applicant age 67 — within eligible band (40–75, age nearest). No medical or lifestyle questions.',
    fulfillmentCriteria: ['Age within product band', 'Coverage within $50,000 maximum', 'Canadian resident confirmed'],
    history: [{ date: '2026-05-18', action: 'Eligibility confirmed', user: 'System', dot: 'green' }],
  }),
  req('req_emp_nb_g_003', NB_G, 'Pre-authorized debit authorization', 'In Queue', 'contract-issuance', {
    category: 'Financial',
    linkedDocs: ['doc_emp_nb_g_pad'],
    linkedTasks: ['task_emp_nb_g_002'],
    aiSummary: 'PAD form received — pending bank confirmation before policy issue.',
    blockingImpact: { severity: 'low', reason: 'First premium collection requires validated PAD' },
  }),
];
