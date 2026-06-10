import type { DatasetDocumentRecord } from './multi-case-dataset';
import { HOMESTEADERS_DEMO_CASE_IDS } from './homesteadersDemoCaseIds';

const PN_MID = HOMESTEADERS_DEMO_CASE_IDS.preneedClaimMid;
const PN_DEC = HOMESTEADERS_DEMO_CASE_IDS.preneedClaimDecision;
const NB = HOMESTEADERS_DEMO_CASE_IDS.nbFullUw;
const NB_S = HOMESTEADERS_DEMO_CASE_IDS.nbSimplified;
const NB_G = HOMESTEADERS_DEMO_CASE_IDS.nbGuaranteed;

function doc(
  id: string,
  caseId: string,
  label: string,
  category: string,
  extra: Partial<DatasetDocumentRecord> = {},
): DatasetDocumentRecord {
  const linkedRequirementId = extra.linkedRequirementId;
  const linkedRequirement = extra.linkedRequirement;
  return {
    id,
    kind: 'document',
    label,
    filename: extra.filename ?? label.replace(/\s+/g, '_').toLowerCase(),
    category,
    status: extra.status ?? 'Validated',
    uploaded: extra.uploaded ?? 'May 12, 2026',
    uploadedAt: extra.uploadedAt ?? '2026-05-12',
    source: extra.source ?? 'Homesteaders Life Company',
    claimant: extra.claimant,
    reqContext: extra.reqContext,
    tableDescription: extra.tableDescription,
    insights: extra.insights,
    followUps: extra.followUps ?? 0,
    insight: extra.insight ?? extra.aiSummary,
    aiInsight: extra.aiInsight ?? true,
    aiConfidence: extra.aiConfidence ?? 0.88,
    aiSummary: extra.aiSummary,
    aiAction: extra.aiAction,
    linkedRequirement,
    linkedRequirementId,
    linkedCase: caseId,
    linkedCaseId: caseId,
    fileType: extra.fileType ?? 'PDF',
    fileSize: extra.fileSize ?? 'Metadata only',
    fileAvailable: false,
    placeholderReason: 'Homesteaders document preview — file to be generated',
    ...extra,
    linkedObjects: [
      { kind: 'case', id: caseId, label: caseId },
      ...(linkedRequirementId
        ? [{ kind: 'requirement' as const, id: linkedRequirementId, label: linkedRequirement ?? linkedRequirementId }]
        : []),
      ...(extra.linkedObjects ?? []).filter((ref) => ref.kind !== 'case' && ref.kind !== 'requirement'),
    ],
  };
}

export const HOMESTEADERS_DOCUMENT_RECORDS: DatasetDocumentRecord[] = [
  // CLM-PN-2026-0142 (4 docs)
  doc('doc_hsl_pn142_fnol', PN_MID, 'Preneed death notification — Helen Martinez.pdf', 'Claim', {
    uploaded: 'May 2, 2026',
    uploadedAt: '2026-05-02',
    source: 'Funeral home / family',
    claimant: 'Sandra Martinez',
    linkedRequirementId: 'req_hsl_pn142_001',
    linkedRequirement: 'FNOL — preneed death notification',
    aiSummary: 'Death reported 2 May 2026 via myHomesteaders portal and Oak Grove Funeral Home. Claim CLM-PN-2026-0142 opened.',
    insights: [
      { anchor: '§1', title: 'Notification channel', body: 'Reported by Sandra Martinez with Oak Grove Funeral Home copied. Policy POL-HSL-PN-2015-001142 matched.', confidence: 'High' },
    ],
  }),
  doc('doc_hsl_pn142_death_cert', PN_MID, 'Certified death certificate — Helen Martinez.pdf', 'Vital records', {
    uploaded: 'May 1, 2026',
    uploadedAt: '2026-05-01',
    source: 'Iowa Department of Health',
    linkedRequirementId: 'req_hsl_pn142_002',
    linkedRequirement: 'Certified death certificate',
    aiSummary: 'Certified death certificate received. Date of death 28 Apr 2026. Cause: heart failure.',
    insights: [
      { anchor: '§1', title: 'Certification', body: 'State-certified copy with registrar seal. Matches policy owner Helen Martinez.', confidence: 'High' },
    ],
  }),
  doc('doc_hsl_pn142_claim_form', PN_MID, 'Preneed claim form — signed.pdf', 'Claim', {
    uploaded: 'May 5, 2026',
    uploadedAt: '2026-05-05',
    source: 'Claimant',
    linkedRequirementId: 'req_hsl_pn142_004',
    linkedRequirement: 'Signed preneed claim form',
    aiSummary: 'Claim form signed by Sandra Martinez. Funeral home payee left blank pending assignment.',
  }),
  doc('doc_hsl_pn142_preneed_contract', PN_MID, 'Preneed contract — POL-HSL-PN-2015-001142.pdf', 'Policy', {
    uploaded: 'May 3, 2026',
    uploadedAt: '2026-05-03',
    source: 'Policy administration',
    linkedRequirementId: 'req_hsl_pn142_003',
    linkedRequirement: 'Preneed contract verification',
    aiSummary: 'Original preneed contract confirms $10,000 face amount. Policy in force, no loans.',
  }),

  // CLM-PN-2026-0287 (5 docs)
  doc('doc_hsl_pn287_fnol', PN_DEC, 'Preneed death notification — James Whitfield.pdf', 'Claim', {
    uploaded: 'Apr 18, 2026',
    uploadedAt: '2026-04-18',
    linkedRequirementId: 'req_hsl_pn287_001',
    linkedRequirement: 'FNOL — preneed death notification',
    aiSummary: 'Riverside Memorial Chapel reported death 12 Apr 2026. Claim CLM-PN-2026-0287 registered same day.',
  }),
  doc('doc_hsl_pn287_death_cert', PN_DEC, 'Certified death certificate — James Whitfield.pdf', 'Vital records', {
    uploaded: 'Apr 20, 2026',
    uploadedAt: '2026-04-20',
    linkedRequirementId: 'req_hsl_pn287_002',
    linkedRequirement: 'Certified death certificate',
    aiSummary: 'Certified death certificate — pneumonia, 12 Apr 2026.',
  }),
  doc('doc_hsl_pn287_assignment', PN_DEC, 'Funeral home assignment — Riverside Memorial.pdf', 'Claim', {
    uploaded: 'Apr 22, 2026',
    uploadedAt: '2026-04-22',
    linkedRequirementId: 'req_hsl_pn287_003',
    linkedRequirement: 'Funeral home assignment letter',
    aiSummary: 'Riverside Memorial Chapel assignment confirmed. Benefit payable to funeral home per preneed contract.',
    insights: [
      { anchor: '§1', title: 'Payee confirmed', body: 'Assignment letter names Riverside Memorial Chapel as funeral home payee for $12,500 benefit.', confidence: 'High' },
    ],
  }),
  doc('doc_hsl_pn287_claim_form', PN_DEC, 'Preneed claim form — signed.pdf', 'Claim', {
    uploaded: 'Apr 21, 2026',
    uploadedAt: '2026-04-21',
    linkedRequirementId: 'req_hsl_pn287_004',
    linkedRequirement: 'Signed preneed claim form',
    aiSummary: 'Signed by Linda Whitfield. Funeral home payee: Riverside Memorial Chapel.',
  }),
  doc('doc_hsl_pn287_preneed_contract', PN_DEC, 'Preneed contract — POL-HSL-PN-2014-002287.pdf', 'Policy', {
    uploaded: 'Apr 19, 2026',
    uploadedAt: '2026-04-19',
    linkedRequirementId: 'req_hsl_pn287_004',
    aiSummary: 'Contract confirms $12,500 preneed benefit. In force since 2014.',
  }),

  // NB-2026-7721 (4 docs)
  doc('doc_hsl_nb7721_app', NB, 'Preneed application — Margaret Chen.pdf', 'Application', {
    uploaded: 'May 6, 2026',
    uploadedAt: '2026-05-06',
    linkedRequirementId: 'req_hsl_nb7721_001',
    linkedRequirement: 'Application — preneed funeral plan',
    aiSummary: '$15,000 preneed application via Riverside Memorial Chapel.',
  }),
  doc('doc_hsl_nb7721_health', NB, 'Health questionnaire — Margaret Chen.pdf', 'Underwriting', {
    uploaded: 'May 8, 2026',
    uploadedAt: '2026-05-08',
    linkedRequirementId: 'req_hsl_nb7721_002',
    linkedRequirement: 'Health questionnaire',
    aiSummary: 'Applicant disclosed treated hypertension. Non-smoker.',
  }),
  doc('doc_hsl_nb7721_mib', NB, 'MIB search results — Margaret Chen.pdf', 'Underwriting', {
    uploaded: 'May 9, 2026',
    uploadedAt: '2026-05-09',
    linkedRequirementId: 'req_hsl_nb7721_003',
    linkedRequirement: 'MIB search',
    aiSummary: 'MIB clear at submission. No adverse codes.',
  }),
  doc('doc_hsl_nb7721_aps_request', NB, 'APS request — Dr. Patterson.pdf', 'Medical', {
    status: 'Pending',
    uploaded: 'May 11, 2026',
    uploadedAt: '2026-05-11',
    linkedRequirementId: 'req_hsl_nb7721_004',
    linkedRequirement: 'Attending physician statement (APS)',
    aiSummary: 'APS ordered to Dr. Patterson — overdue 4 days.',
    followUps: 2,
  }),

  // NB-2026-8804 (3 docs)
  doc('doc_hsl_nb8804_app', NB_S, 'Preneed application — Robert Sullivan.pdf', 'Application', {
    uploaded: 'May 12, 2026',
    uploadedAt: '2026-05-12',
    linkedRequirementId: 'req_hsl_nb8804_001',
    aiSummary: '$8,500 preneed application — funeral director sale.',
  }),
  doc('doc_hsl_nb8804_expressions', NB_S, 'Personal Expressions planning guide — Robert Sullivan.pdf', 'Planning', {
    uploaded: 'May 14, 2026',
    uploadedAt: '2026-05-14',
    linkedRequirementId: 'req_hsl_nb8804_002',
    linkedRequirement: 'Personal Expressions planning guide',
    aiSummary: 'Service preferences and merchandise selections documented with funeral director.',
  }),
  doc('doc_hsl_nb8804_attestation', NB_S, 'Health attestation — Robert Sullivan.pdf', 'Underwriting', {
    uploaded: 'May 13, 2026',
    uploadedAt: '2026-05-13',
    linkedRequirementId: 'req_hsl_nb8804_003',
    aiSummary: 'Simplified health attestation signed. No APS required.',
  }),

  // NB-2026-9905 (3 docs)
  doc('doc_hsl_nb9905_app', NB_G, 'Guaranteed preneed application — Dorothy Hayes.pdf', 'Application', {
    uploaded: 'May 15, 2026',
    uploadedAt: '2026-05-15',
    linkedRequirementId: 'req_hsl_nb9905_001',
    aiSummary: '$5,000 guaranteed preneed — no health questions.',
  }),
  doc('doc_hsl_nb9905_beneficiary', NB_G, 'Beneficiary designation — Dorothy Hayes.pdf', 'Contract', {
    uploaded: 'May 16, 2026',
    uploadedAt: '2026-05-16',
    linkedRequirementId: 'req_hsl_nb9905_002',
    aiSummary: 'Beneficiary designation complete.',
  }),
  doc('doc_hsl_nb9905_pad', NB_G, 'PAD authorization — Dorothy Hayes.pdf', 'Billing', {
    status: 'Pending Review',
    uploaded: 'May 18, 2026',
    uploadedAt: '2026-05-18',
    linkedRequirementId: 'req_hsl_nb9905_003',
    linkedRequirement: 'PAD authorization',
    aiSummary: 'Pre-authorized debit form received — bank confirmation pending.',
    followUps: 1,
  }),
];
