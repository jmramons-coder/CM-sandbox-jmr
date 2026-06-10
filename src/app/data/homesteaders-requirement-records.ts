import type { DatasetRequirementRecord } from './multi-case-dataset';
import { HOMESTEADERS_DEMO_CASE_IDS } from './homesteadersDemoCaseIds';

const PN_MID = HOMESTEADERS_DEMO_CASE_IDS.preneedClaimMid;
const PN_DEC = HOMESTEADERS_DEMO_CASE_IDS.preneedClaimDecision;
const NB = HOMESTEADERS_DEMO_CASE_IDS.nbFullUw;
const NB_S = HOMESTEADERS_DEMO_CASE_IDS.nbSimplified;
const NB_G = HOMESTEADERS_DEMO_CASE_IDS.nbGuaranteed;

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
    source: extra.source ?? 'homesteaders_claims',
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

export const HOMESTEADERS_REQUIREMENT_RECORDS: DatasetRequirementRecord[] = [
  // CLM-PN-2026-0142
  req('req_hsl_pn142_001', PN_MID, 'FNOL — preneed death notification', 'Fulfilled', 'fnol_received', {
    category: 'FNOL',
    aiSummary: 'Preneed death reported 2 May via myHomesteaders and Oak Grove Funeral Home. Claim CLM-PN-2026-0142 registered.',
    fulfillmentCriteria: ['Death notification captured', 'Policy matched', 'Claim reference issued'],
    linkedDocs: ['doc_hsl_pn142_fnol'],
    linkedTasks: ['task_hsl_pn142_001'],
    context: {
      type: 'claim',
      label: 'Preneed FNOL',
      description: 'Sandra Martinez reported death of Helen Martinez. Homesteaders preneed claims team assigned Victor Ramon.',
      kv: [
        { label: 'Policy', value: 'POL-HSL-PN-2015-001142' },
        { label: 'Benefit', value: '$10,000' },
        { label: 'Channel', value: 'myHomesteaders + funeral home' },
      ],
    },
    history: [
      { date: '2026-05-02', action: 'FNOL registered — preneed death', user: 'Claims team', dot: 'green' },
      { date: '2026-05-02', action: 'Confirmation sent to Sandra Martinez', user: 'System', dot: 'green' },
    ],
  }),
  req('req_hsl_pn142_002', PN_MID, 'Certified death certificate', 'Fulfilled', 'initial_triage', {
    category: 'Vital records',
    aiSummary: 'Certified Iowa death certificate received 1 May. Date of death 28 Apr 2026.',
    linkedDocs: ['doc_hsl_pn142_death_cert'],
    linkedTasks: ['task_hsl_pn142_002'],
    history: [{ date: '2026-05-01', action: 'Death certificate validated', user: 'Victor Ramon', dot: 'green' }],
  }),
  req('req_hsl_pn142_003', PN_MID, 'Preneed contract verification', 'Fulfilled', 'req_gathering', {
    category: 'Policy',
    aiSummary: 'Preneed contract confirms $10,000 face amount. Policy in force, premiums current.',
    linkedDocs: ['doc_hsl_pn142_preneed_contract'],
    linkedTasks: ['task_hsl_pn142_004'],
  }),
  req('req_hsl_pn142_004', PN_MID, 'Funeral home assignment letter', 'Overdue', 'req_gathering', {
    category: 'Funeral home',
    dueDate: '2026-05-18',
    responsibleParty: 'Oak Grove Funeral Home / Sandra Martinez',
    blockingImpact: { severity: 'medium', reason: 'Benefit cannot be paid until funeral home payee is confirmed on assignment letter' },
    linkedDocs: ['doc_hsl_pn142_claim_form'],
    linkedTasks: ['task_hsl_pn142_003', 'task_hsl_pn142_005'],
    aiSummary: 'Oak Grove Funeral Home assignment letter outstanding — chase funeral director for signed payee confirmation.',
    fulfillmentCriteria: ['Signed assignment letter', 'Funeral home payee named', 'Matches preneed contract'],
    context: {
      type: 'person',
      label: 'Funeral home assignment',
      description: 'Oak Grove Funeral Home expected to provide assignment letter naming funeral home as payee for preneed benefit.',
      kv: [{ label: 'Funeral home', value: 'Oak Grove Funeral Home' }, { label: 'Director', value: 'Karen Mitchell' }],
    },
  }),
  req('req_hsl_pn142_005', PN_MID, 'Signed preneed claim form', 'Fulfilled', 'req_gathering', {
    linkedDocs: ['doc_hsl_pn142_claim_form'],
    linkedTasks: ['task_hsl_pn142_002'],
    aiSummary: 'Claim form signed by Sandra Martinez. Funeral home payee field blank pending assignment.',
  }),

  // CLM-PN-2026-0287
  req('req_hsl_pn287_001', PN_DEC, 'FNOL — preneed death notification', 'Fulfilled', 'fnol_received', {
    category: 'FNOL',
    linkedDocs: ['doc_hsl_pn287_fnol'],
    linkedTasks: ['task_hsl_pn287_001'],
    aiSummary: 'Riverside Memorial Chapel reported James Whitfield death 12 Apr 2026.',
    history: [{ date: '2026-04-18', action: 'FNOL from funeral home', user: 'Claims team', dot: 'green' }],
  }),
  req('req_hsl_pn287_002', PN_DEC, 'Certified death certificate', 'Fulfilled', 'initial_triage', {
    category: 'Vital records',
    linkedDocs: ['doc_hsl_pn287_death_cert'],
    linkedTasks: ['task_hsl_pn287_002'],
    aiSummary: 'Certified death certificate on file.',
  }),
  req('req_hsl_pn287_003', PN_DEC, 'Funeral home assignment letter', 'Fulfilled', 'req_gathering', {
    category: 'Funeral home',
    linkedDocs: ['doc_hsl_pn287_assignment'],
    linkedTasks: ['task_hsl_pn287_003'],
    aiSummary: 'Riverside Memorial Chapel assignment confirmed — payee for $12,500 benefit.',
    fulfillmentCriteria: ['Assignment letter signed', 'Payee matches funeral home on contract'],
  }),
  req('req_hsl_pn287_004', PN_DEC, 'Signed preneed claim form', 'Fulfilled', 'req_gathering', {
    linkedDocs: ['doc_hsl_pn287_claim_form', 'doc_hsl_pn287_preneed_contract'],
    linkedTasks: ['task_hsl_pn287_004'],
    aiSummary: 'Claim form and contract verified. All evidence supports full $12,500 payment.',
  }),

  // NB-2026-7721
  req('req_hsl_nb7721_001', NB, 'Application — preneed funeral plan', 'Fulfilled', 'application', {
    category: 'Application',
    linkedDocs: ['doc_hsl_nb7721_app'],
    linkedTasks: ['task_hsl_nb7721_001'],
    aiSummary: 'Application APP-7721 complete. $15,000 face amount via Riverside Memorial Chapel.',
  }),
  req('req_hsl_nb7721_002', NB, 'Health questionnaire', 'Fulfilled', 'req_gathering', {
    category: 'Underwriting',
    linkedDocs: ['doc_hsl_nb7721_health'],
    linkedTasks: ['task_hsl_nb7721_002'],
    aiSummary: 'Health questionnaire complete. Treated hypertension disclosed.',
  }),
  req('req_hsl_nb7721_003', NB, 'MIB search', 'Fulfilled', 'req_gathering', {
    category: 'Underwriting',
    linkedDocs: ['doc_hsl_nb7721_mib'],
    linkedTasks: ['task_hsl_nb7721_002'],
    aiSummary: 'MIB clear — no adverse underwriting codes.',
  }),
  req('req_hsl_nb7721_004', NB, 'Attending physician statement (APS)', 'Overdue', 'req_gathering', {
    category: 'Medical',
    dueDate: '2026-05-20',
    responsibleParty: 'Dr. Patterson / applicant',
    blockingImpact: { severity: 'high', reason: 'APS required before formal underwriting decision on $15,000 preneed plan' },
    linkedDocs: ['doc_hsl_nb7721_aps_request'],
    linkedTasks: ['task_hsl_nb7721_003', 'task_hsl_nb7721_004'],
    aiSummary: 'APS ordered to Dr. Patterson 11 May — overdue. Chase for hypertension treatment history.',
    fulfillmentCriteria: ['APS on physician letterhead', 'Covers last 5 years', 'Addresses disclosed conditions'],
    context: {
      type: 'person',
      label: 'APS — Margaret Chen',
      description: 'Attending physician statement needed following hypertension disclosure on health questionnaire.',
      kv: [{ label: 'Physician', value: 'Dr. James Patterson' }, { label: 'Clinic', value: 'Des Moines Family Medicine' }],
    },
  }),

  // NB-2026-8804
  req('req_hsl_nb8804_001', NB_S, 'Application — preneed funeral plan', 'Fulfilled', 'application', {
    linkedDocs: ['doc_hsl_nb8804_app'],
    linkedTasks: ['task_hsl_nb8804_001'],
    aiSummary: 'Funeral director application for $8,500 preneed plan.',
  }),
  req('req_hsl_nb8804_002', NB_S, 'Personal Expressions planning guide', 'Fulfilled', 'personal-expressions', {
    category: 'Planning',
    linkedDocs: ['doc_hsl_nb8804_expressions'],
    linkedTasks: ['task_hsl_nb8804_002'],
    aiSummary: 'Personal Expressions guide completed with funeral director — service preferences documented.',
  }),
  req('req_hsl_nb8804_003', NB_S, 'Health attestation', 'Fulfilled', 'underwriting-review', {
    category: 'Underwriting',
    linkedDocs: ['doc_hsl_nb8804_attestation'],
    linkedTasks: ['task_hsl_nb8804_003'],
    aiSummary: 'Simplified path health attestation signed. No APS required at $8,500.',
  }),

  // NB-2026-9905
  req('req_hsl_nb9905_001', NB_G, 'Application — guaranteed preneed', 'Fulfilled', 'application', {
    linkedDocs: ['doc_hsl_nb9905_app'],
    linkedTasks: ['task_hsl_nb9905_001'],
    aiSummary: 'Guaranteed preneed application — eligibility confirmed, no health questions.',
  }),
  req('req_hsl_nb9905_002', NB_G, 'Beneficiary designation', 'Fulfilled', 'eligibility-check', {
    linkedDocs: ['doc_hsl_nb9905_beneficiary'],
    linkedTasks: ['task_hsl_nb9905_002'],
    aiSummary: 'Beneficiary designation complete.',
  }),
  req('req_hsl_nb9905_003', NB_G, 'PAD authorization', 'In Queue', 'contract-issuance', {
    category: 'Billing',
    linkedDocs: ['doc_hsl_nb9905_pad'],
    linkedTasks: ['task_hsl_nb9905_003'],
    aiSummary: 'PAD form received — awaiting bank confirmation before contract issuance.',
    dueDate: '2026-05-28',
  }),
];
