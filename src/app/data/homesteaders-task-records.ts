import type { DatasetTaskRecord } from './multi-case-dataset';
import { HOMESTEADERS_DEMO_CASE_IDS } from './homesteadersDemoCaseIds';

const PN_MID = HOMESTEADERS_DEMO_CASE_IDS.preneedClaimMid;
const PN_DEC = HOMESTEADERS_DEMO_CASE_IDS.preneedClaimDecision;
const NB = HOMESTEADERS_DEMO_CASE_IDS.nbFullUw;
const NB_S = HOMESTEADERS_DEMO_CASE_IDS.nbSimplified;
const NB_G = HOMESTEADERS_DEMO_CASE_IDS.nbGuaranteed;

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
    caseSubtype: extra.caseSubtype ?? (caseId.startsWith('CLM') ? 'death_benefit' : 'full_underwriting'),
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
    product: extra.product ?? 'Homesteaders Preneed',
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

export const HOMESTEADERS_TASK_RECORDS: DatasetTaskRecord[] = [
  // CLM-PN-2026-0142 (5 tasks)
  task('task_hsl_pn142_001', PN_MID, 'Register preneed death claim', 'Completed', 'Normal', 'fnol_received', {
    aiSummary: 'Claim CLM-PN-2026-0142 registered. Confirmation sent to Sandra Martinez and Oak Grove Funeral Home.',
    evidenceDocuments: [{ id: 'doc_hsl_pn142_fnol', name: 'Preneed death notification', size: 'Metadata', category: 'Claim', aiSummary: 'FNOL 2 May 2026.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_hsl_pn142_001', label: 'FNOL' },
      { kind: 'document', id: 'doc_hsl_pn142_fnol', label: 'FNOL' },
      { kind: 'request', id: 'REQ-HSL-2026-001', label: 'Preneed death notification' },
    ],
  }),
  task('task_hsl_pn142_002', PN_MID, 'Validate certified death certificate', 'Completed', 'Normal', 'initial_triage', {
    aiSummary: 'Death certificate validated — Helen Martinez, 28 Apr 2026.',
    evidenceDocuments: [{ id: 'doc_hsl_pn142_death_cert', name: 'Death certificate', size: 'Metadata', category: 'Vital records', aiSummary: 'Certified copy on file.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_hsl_pn142_002', label: 'Death certificate' },
      { kind: 'requirement', id: 'req_hsl_pn142_005', label: 'Claim form' },
      { kind: 'document', id: 'doc_hsl_pn142_death_cert', label: 'Death certificate' },
    ],
  }),
  task('task_hsl_pn142_003', PN_MID, 'Assign funeral home partner — Oak Grove', 'In Queue', 'High', 'req_gathering', {
    executionMode: 'manual',
    aiSummary: 'Contact Oak Grove Funeral Home — obtain signed assignment letter naming funeral home as $10,000 payee.',
    alert: { type: 'sla', message: 'Assignment overdue 3 days' },
    linkedObjects: [{ kind: 'requirement', id: 'req_hsl_pn142_004', label: 'Funeral home assignment' }],
    actions: [{ type: 'complete', label: 'Chase funeral director', isPrimary: true }],
  }),
  task('task_hsl_pn142_004', PN_MID, 'Verify preneed contract face amount', 'Completed', 'Normal', 'req_gathering', {
    aiSummary: 'Contract POL-HSL-PN-2015-001142 confirms $10,000. No outstanding loans.',
    evidenceDocuments: [{ id: 'doc_hsl_pn142_preneed_contract', name: 'Preneed contract', size: 'Metadata', category: 'Policy', aiSummary: '$10,000 in force.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_hsl_pn142_003', label: 'Contract verification' },
      { kind: 'document', id: 'doc_hsl_pn142_preneed_contract', label: 'Contract' },
    ],
  }),
  task('task_hsl_pn142_005', PN_MID, 'Chase funeral home assignment letter', 'In Queue', 'High', 'req_gathering', {
    aiSummary: 'Follow up with Karen Mitchell at Oak Grove — assignment letter required before benefit payment.',
    evidenceDocuments: [{ id: 'doc_hsl_pn142_claim_form', name: 'Claim form', size: 'Metadata', category: 'Claim', aiSummary: 'Payee field blank.', followUps: 2 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_hsl_pn142_004', label: 'Assignment letter' },
      { kind: 'document', id: 'doc_hsl_pn142_claim_form', label: 'Claim form' },
    ],
  }),

  // CLM-PN-2026-0287 (5 tasks)
  task('task_hsl_pn287_001', PN_DEC, 'Register preneed death claim — funeral home FNOL', 'Completed', 'Urgent', 'fnol_received', {
    aiSummary: 'Riverside Memorial Chapel reported death. Claim CLM-PN-2026-0287 opened.',
    evidenceDocuments: [{ id: 'doc_hsl_pn287_fnol', name: 'FNOL', size: 'Metadata', category: 'Claim', aiSummary: 'Funeral home notification.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_hsl_pn287_001', label: 'FNOL' },
      { kind: 'document', id: 'doc_hsl_pn287_fnol', label: 'FNOL' },
      { kind: 'request', id: 'REQ-HSL-2026-002', label: 'Whitfield notification' },
    ],
  }),
  task('task_hsl_pn287_002', PN_DEC, 'Validate death certificate', 'Completed', 'Normal', 'initial_triage', {
    aiSummary: 'Certified death certificate validated for James Whitfield.',
    evidenceDocuments: [{ id: 'doc_hsl_pn287_death_cert', name: 'Death certificate', size: 'Metadata', category: 'Vital records', aiSummary: '12 Apr 2026.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_hsl_pn287_002', label: 'Death certificate' },
      { kind: 'document', id: 'doc_hsl_pn287_death_cert', label: 'Death certificate' },
    ],
  }),
  task('task_hsl_pn287_003', PN_DEC, 'Confirm Riverside Memorial assignment', 'Completed', 'Normal', 'req_gathering', {
    aiSummary: 'Funeral home assignment letter confirms Riverside Memorial Chapel as $12,500 payee.',
    evidenceDocuments: [{ id: 'doc_hsl_pn287_assignment', name: 'Assignment letter', size: 'Metadata', category: 'Claim', aiSummary: 'Payee confirmed.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_hsl_pn287_003', label: 'Assignment' },
      { kind: 'document', id: 'doc_hsl_pn287_assignment', label: 'Assignment' },
    ],
  }),
  task('task_hsl_pn287_004', PN_DEC, 'Prepare decision — $12,500 to funeral home', 'Completed', 'Urgent', 'decision', {
    hasAI: true,
    executionMode: 'semi_auto',
    aiGenerated: true,
    aiConfidence: 94,
    review: {
      verdict: 'All requirements fulfilled. Recommend full $12,500 payment to Riverside Memorial Chapel.',
      confidence: 94,
      reasoning: ['Death certificate and assignment letter on file', 'Preneed contract amount matches'],
      evidenceIds: ['doc_hsl_pn287_assignment', 'doc_hsl_pn287_preneed_contract'],
    },
    aiSummary: 'Decision-ready — recommend pay $12,500 to Riverside Memorial Chapel per preneed contract.',
    evidenceDocuments: [
      { id: 'doc_hsl_pn287_preneed_contract', name: 'Preneed contract', size: 'Metadata', category: 'Policy', aiSummary: '$12,500.', followUps: 0 },
      { id: 'doc_hsl_pn287_assignment', name: 'Assignment', size: 'Metadata', category: 'Claim', aiSummary: 'Payee confirmed.', followUps: 0 },
    ],
    linkedObjects: [
      { kind: 'requirement', id: 'req_hsl_pn287_004', label: 'Claim form' },
      { kind: 'document', id: 'doc_hsl_pn287_claim_form', label: 'Claim form' },
    ],
    actions: [{ type: 'complete', label: 'Open decision', isPrimary: true }],
  }),
  task('task_hsl_pn287_005', PN_DEC, 'Sign off preneed benefit payment', 'In Queue', 'Urgent', 'decision', {
    aiSummary: 'Senior review for $12,500 funeral home payment to Riverside Memorial Chapel.',
    linkedObjects: [{ kind: 'case', id: PN_DEC, label: PN_DEC }],
    actions: [{ type: 'complete', label: 'Approve payment', isPrimary: true }],
  }),

  // NB-2026-7721 (4 tasks)
  task('task_hsl_nb7721_001', NB, 'Index preneed application — Margaret Chen', 'Completed', 'Normal', 'application', {
    aiSummary: 'APP-7721 indexed. $15,000 preneed via Riverside Memorial Chapel.',
    evidenceDocuments: [{ id: 'doc_hsl_nb7721_app', name: 'Application', size: 'Metadata', category: 'Application', aiSummary: 'Complete.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_hsl_nb7721_001', label: 'Application' },
      { kind: 'request', id: 'REQ-HSL-2026-003', label: 'NB application' },
    ],
  }),
  task('task_hsl_nb7721_002', NB, 'Review health questionnaire and MIB', 'Completed', 'Normal', 'req_gathering', {
    hasAI: true,
    aiSummary: 'MIB clear. Hypertension disclosed — APS recommended.',
    evidenceDocuments: [
      { id: 'doc_hsl_nb7721_health', name: 'Health questionnaire', size: 'Metadata', category: 'Underwriting', aiSummary: 'Hypertension noted.', followUps: 0 },
      { id: 'doc_hsl_nb7721_mib', name: 'MIB', size: 'Metadata', category: 'Underwriting', aiSummary: 'Clear.', followUps: 0 },
    ],
    linkedObjects: [
      { kind: 'requirement', id: 'req_hsl_nb7721_002', label: 'Health questionnaire' },
      { kind: 'requirement', id: 'req_hsl_nb7721_003', label: 'MIB' },
    ],
  }),
  task('task_hsl_nb7721_003', NB, 'Order APS — Dr. Patterson', 'In Queue', 'High', 'req_gathering', {
    aiSummary: 'APS ordered 11 May — overdue. Chase physician office for Margaret Chen.',
    alert: { type: 'sla', message: 'APS overdue 4 days' },
    evidenceDocuments: [{ id: 'doc_hsl_nb7721_aps_request', name: 'APS request', size: 'Metadata', category: 'Medical', aiSummary: 'Outstanding.', followUps: 2 }],
    linkedObjects: [{ kind: 'requirement', id: 'req_hsl_nb7721_004', label: 'APS' }],
  }),
  task('task_hsl_nb7721_004', NB, 'Chase overdue APS', 'In Queue', 'High', 'req_gathering', {
    executionMode: 'manual',
    aiSummary: 'Contact Dr. Patterson clinic — APS required before underwriting decision on $15,000 preneed.',
    linkedObjects: [
      { kind: 'requirement', id: 'req_hsl_nb7721_004', label: 'APS' },
      { kind: 'document', id: 'doc_hsl_nb7721_aps_request', label: 'APS request' },
    ],
  }),

  // NB-2026-8804 (3 tasks)
  task('task_hsl_nb8804_001', NB_S, 'Index funeral home application', 'Completed', 'Normal', 'application', {
    aiSummary: 'Robert Sullivan $8,500 application from Riverside Memorial Chapel.',
    evidenceDocuments: [{ id: 'doc_hsl_nb8804_app', name: 'Application', size: 'Metadata', category: 'Application', aiSummary: 'Funeral director sale.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_hsl_nb8804_001', label: 'Application' },
      { kind: 'request', id: 'REQ-HSL-2026-004', label: 'NB simplified' },
    ],
  }),
  task('task_hsl_nb8804_002', NB_S, 'Review Personal Expressions guide', 'Completed', 'Normal', 'personal-expressions', {
    aiSummary: 'Personal Expressions planning guide complete — service preferences documented with funeral director.',
    evidenceDocuments: [{ id: 'doc_hsl_nb8804_expressions', name: 'Personal Expressions', size: 'Metadata', category: 'Planning', aiSummary: 'Complete.', followUps: 0 }],
    linkedObjects: [{ kind: 'requirement', id: 'req_hsl_nb8804_002', label: 'Personal Expressions' }],
  }),
  task('task_hsl_nb8804_003', NB_S, 'Underwriting review — simplified path', 'In Queue', 'Normal', 'underwriting-review', {
    hasAI: true,
    aiGenerated: true,
    aiConfidence: 88,
    aiSummary: 'Recommend approve standard — simplified evidence complete, no APS required.',
    evidenceDocuments: [{ id: 'doc_hsl_nb8804_attestation', name: 'Health attestation', size: 'Metadata', category: 'Underwriting', aiSummary: 'Signed.', followUps: 0 }],
    linkedObjects: [{ kind: 'requirement', id: 'req_hsl_nb8804_003', label: 'Health attestation' }],
    actions: [{ type: 'complete', label: 'Recommend approve', isPrimary: true }],
  }),

  // NB-2026-9905 (3 tasks)
  task('task_hsl_nb9905_001', NB_G, 'Confirm guaranteed eligibility', 'Completed', 'Normal', 'eligibility-check', {
    aiSummary: 'Dorothy Hayes age 70 — within guaranteed preneed band. No health questions.',
    evidenceDocuments: [{ id: 'doc_hsl_nb9905_app', name: 'Application', size: 'Metadata', category: 'Application', aiSummary: 'GI path.', followUps: 0 }],
    linkedObjects: [
      { kind: 'requirement', id: 'req_hsl_nb9905_001', label: 'Application' },
      { kind: 'request', id: 'REQ-HSL-2026-005', label: 'NB guaranteed' },
    ],
  }),
  task('task_hsl_nb9905_002', NB_G, 'Validate beneficiary designation', 'Completed', 'Normal', 'eligibility-check', {
    aiSummary: 'Beneficiary designation complete and signed.',
    evidenceDocuments: [{ id: 'doc_hsl_nb9905_beneficiary', name: 'Beneficiary form', size: 'Metadata', category: 'Contract', aiSummary: 'Complete.', followUps: 0 }],
    linkedObjects: [{ kind: 'requirement', id: 'req_hsl_nb9905_002', label: 'Beneficiary' }],
  }),
  task('task_hsl_nb9905_003', NB_G, 'Confirm PAD before contract issuance', 'In Queue', 'Normal', 'contract-issuance', {
    aiSummary: 'PAD authorization received — chase bank confirmation before issuing $5,000 preneed contract.',
    evidenceDocuments: [{ id: 'doc_hsl_nb9905_pad', name: 'PAD form', size: 'Metadata', category: 'Billing', aiSummary: 'Pending bank.', followUps: 1 }],
    linkedObjects: [{ kind: 'requirement', id: 'req_hsl_nb9905_003', label: 'PAD' }],
  }),
];
