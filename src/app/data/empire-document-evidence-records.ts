import type { DocumentEvidenceRecord } from './multi-case-dataset';
import { getEmpireDocumentPreviewUrl } from '../utils/empire-document-assets';
import { EMPIRE_DEMO_CASE_IDS } from './empireDemoCaseIds';

const NB = EMPIRE_DEMO_CASE_IDS.nbFullUw;

type EmpireFinding = DocumentEvidenceRecord['findings'][number];

function empireEvidence(
  id: string,
  documentId: string,
  title: string,
  summary: string,
  pageLabel: string,
  findings: EmpireFinding[],
  linkedRequirementId?: string,
  linkedRequirement?: string,
): DocumentEvidenceRecord {
  const image = getEmpireDocumentPreviewUrl(documentId);
  return {
    id,
    kind: 'document_evidence',
    documentId,
    title,
    summary,
    pages: [{ number: 1, label: pageLabel, image }],
    findings,
    linkedObjects: [
      { kind: 'case', id: NB, label: NB },
      { kind: 'document', id: documentId, label: title },
      ...(linkedRequirementId
        ? [{ kind: 'requirement' as const, id: linkedRequirementId, label: linkedRequirement ?? linkedRequirementId }]
        : []),
    ],
  };
}

export const EMPIRE_DOCUMENT_EVIDENCE_RECORDS: DocumentEvidenceRecord[] = [
  empireEvidence(
    'ev_emp_nb_app',
    'doc_emp_nb_app',
    'Application — Amélie Dubois (Solution 20)',
    'Signed Solution 20 participating application — $500,000 coverage, non-smoker, child term rider for Luc Dubois.',
    'Application — page 1',
    [
      {
        id: 'doc_emp_nb_app_anchor_1',
        severity: 'Medium',
        title: 'Coverage election confirmed',
        quote: 'Solution 20 participating · $500,000 · 20-pay · non-smoker',
        reasoning: 'Face amount and product match advisor needs analysis and case workflow target.',
        impact: 'Establishes baseline for full underwriting and scoring on NB-2026-4401.',
      },
      {
        id: 'doc_emp_nb_app_anchor_2',
        severity: 'Low',
        title: 'Non-smoker attested',
        quote: 'Tobacco/nicotine use: No · BMI 25.0',
        reasoning: 'Section B personal information matches non-smoker rating class on Solution 20 application.',
        impact: 'Supports standard NT scoring path — scuba disclosure captured separately on portal requirement.',
      },
      {
        id: 'doc_emp_nb_app_anchor_3',
        severity: 'Medium',
        title: 'Child term rider elected',
        quote: 'Child term rider — Luc Dubois (DOB ~2014)',
        reasoning: 'Additional insured coverage requested on same application as primary insured.',
        impact: 'Separate underwriting path — decline letter issued for Luc while primary app remains active.',
      },
    ],
  ),
  empireEvidence(
    'ev_emp_nb_needs',
    'doc_emp_nb_needs',
    'Advisor needs analysis — Amélie Dubois',
    'Morin Financial Group needs analysis supporting $500,000 Solution 20 participating whole life.',
    'Financial needs analysis',
    [
      {
        id: 'doc_emp_nb_needs_anchor_1',
        severity: 'Medium',
        title: 'Coverage gap supports $500k',
        quote: 'Estate and family protection gap — recommended coverage $500,000',
        reasoning: 'Advisor documents income, dependents, and debt context for Amélie and Marc Dubois.',
        impact: 'Corroborates face amount on application before underwriting review.',
      },
      {
        id: 'doc_emp_nb_needs_anchor_2',
        severity: 'Low',
        title: 'Solution 20 suitability noted',
        quote: 'Solution 20 participating whole life · 20-pay premium schedule',
        reasoning: 'Product recommendation aligns with long-term estate protection objective.',
        impact: 'Supports suitability file for advisor Jean-Philippe Morin on APP-4401.',
      },
    ],
  ),
  empireEvidence(
    'ev_emp_nb_mib',
    'doc_emp_nb_mib',
    'MIB search results — Amélie Dubois',
    'MIB inquiry clear at submission — no codes returned, no adverse alerts.',
    'MIB inquiry results',
    [
      {
        id: 'doc_emp_nb_mib_anchor_1',
        severity: 'Low',
        title: 'MIB inquiry clear',
        quote: 'Result: CLEAR — no codes / no adverse alerts',
        reasoning: 'Automated MIB search on 8 May 2026 returned no undisclosed impairment codes.',
        impact: 'Satisfies req_emp_nb_003 at submission; no MIB-driven referral at this stage.',
      },
      {
        id: 'doc_emp_nb_mib_anchor_2',
        severity: 'Low',
        title: 'Identity match confirmed',
        quote: 'Amélie Dubois · DOB 19 Jan 1982 · APP-4401',
        reasoning: 'Applicant demographics on inquiry match signed application.',
        impact: 'No MIB/application mismatch to reconcile before medical ordering.',
      },
    ],
    'req_emp_nb_003',
    'MIB search',
  ),
  empireEvidence(
    'ev_emp_nb_lab_req',
    'doc_emp_nb_lab_req',
    'Paramedical lab requisition — Dynacare Ottawa',
    'Dynacare lab requisition for standard paramedical profile — collection pending.',
    'Laboratory requisition',
    [
      {
        id: 'doc_emp_nb_lab_req_anchor_1',
        severity: 'Medium',
        title: 'Standard full-UW panel ordered',
        quote: 'CBC, CMP, lipids, HbA1c, urinalysis — fasting required',
        reasoning: 'Panel matches Empire Life full underwriting guidelines for $500,000 participating case.',
        impact: 'Fulfills req_emp_nb_005 once specimen collected and results returned.',
      },
      {
        id: 'doc_emp_nb_lab_req_anchor_2',
        severity: 'High',
        title: 'Collection still pending',
        quote: 'Status: Requisition issued — collection pending · Dynacare Ottawa',
        reasoning: 'Requisition issued 8 May 2026 but no collection confirmation on file.',
        impact: 'Blocks paramedical completion until applicant completes blood and urine draw.',
      },
    ],
    'req_emp_nb_005',
    'Blood and urine',
  ),
  empireEvidence(
    'ev_emp_nb_rx',
    'doc_emp_nb_rx',
    'Rx report — Amélie Dubois (IntelliScript)',
    'IntelliScript Rx report — lisinopril, amlodipine, and atorvastatin identified; AI recommends APS for treated hypertension.',
    'Prescription history report',
    [
      {
        id: 'doc_emp_nb_rx_anchor_1',
        severity: 'High',
        title: 'Treated hypertension identified',
        quote: 'Lisinopril 10 mg · Amlodipine 5 mg — ongoing antihypertensive therapy',
        reasoning: 'IntelliScript fills show active blood-pressure medications not fully detailed on application health answers.',
        impact: 'Primary driver for APS order to Clinique Médicale du Plateau.',
      },
      {
        id: 'doc_emp_nb_rx_anchor_2',
        severity: 'Medium',
        title: 'Statin therapy on file',
        quote: 'Atorvastatin 20 mg — lipid management',
        reasoning: 'Secondary cardiovascular risk factor noted in pharmacy history.',
        impact: 'Underwriter should confirm control and complications in APS response.',
      },
      {
        id: 'doc_emp_nb_rx_anchor_3',
        severity: 'High',
        title: 'APS recommended before rating',
        quote: 'Summary flag: antihypertensive therapy — physician follow-up recommended',
        reasoning: 'AI agent flagged Rx results against application disclosures on NB-2026-4401.',
        impact: 'Draft APS (req_emp_nb_002) prepared pending underwriter release.',
      },
    ],
    'req_emp_nb_006',
    'RX (prescription medication) report',
  ),
  empireEvidence(
    'ev_emp_nb_scuba_sent',
    'doc_emp_nb_scuba_sent',
    'Scuba questionnaire — advisor portal notification',
    'Advisor portal notification — scuba questionnaire ordered after recreational diving disclosure on application.',
    'Advisor portal notification',
    [
      {
        id: 'doc_emp_nb_scuba_sent_anchor_1',
        severity: 'High',
        title: 'AI flagged recreational diving',
        quote: 'New requirement — Scuba Questionnaire · AI flagged recreational scuba',
        reasoning: 'Portal alert generated from application health disclosure on 8 May 2026.',
        impact: 'Opens req_emp_nb_007 and pauses avocation clearance for primary and rider review.',
      },
      {
        id: 'doc_emp_nb_scuba_sent_anchor_2',
        severity: 'Medium',
        title: 'Assigned to writing advisor',
        quote: 'Assigned to Jean-Philippe Morin — Morin Financial Group',
        reasoning: 'Questionnaire routed to advisor portal for applicant completion.',
        impact: 'Advisor must distribute questionnaire to Amélie Dubois and return signed copy.',
      },
    ],
    'req_emp_nb_007',
    'Scuba Questionnaire',
  ),
  empireEvidence(
    'ev_emp_nb_scuba_reminder',
    'doc_emp_nb_scuba_reminder',
    'Email to advisor — scuba questionnaire reminder',
    'Underwriting reminder to Jean-Philippe Morin — scuba questionnaire still outstanding.',
    'Email reminder',
    [
      {
        id: 'doc_emp_nb_scuba_reminder_anchor_1',
        severity: 'High',
        title: 'Questionnaire still outstanding',
        quote: 'Scuba questionnaire from 8 May 2026 remains outstanding',
        reasoning: 'Four days elapsed since initial portal notification without return.',
        impact: 'Case stalled on req_emp_nb_007 — chase advisor before ordering additional medicals.',
      },
      {
        id: 'doc_emp_nb_scuba_reminder_anchor_2',
        severity: 'Medium',
        title: 'Blocks medical requirements',
        quote: 'Return required before medical requirements can progress',
        reasoning: 'Underwriting policy holds further medical ordering until avocation form received.',
        impact: 'Coordinates with Luc Dubois rider decline pending shared avocation clarification.',
      },
    ],
    'req_emp_nb_007',
    'Scuba Questionnaire',
  ),
  empireEvidence(
    'ev_emp_nb_aps_request',
    'doc_emp_nb_aps_request',
    'APS request — Clinique Médicale du Plateau',
    'Draft APS order to Clinique Médicale du Plateau — pending underwriter release after Rx review.',
    'APS order form',
    [
      {
        id: 'doc_emp_nb_aps_request_anchor_1',
        severity: 'Medium',
        title: 'Draft — not yet transmitted',
        quote: 'AI Agent draft — pending underwriter release · not yet transmitted',
        reasoning: 'APS package prepared automatically after IntelliScript review on 11 May 2026.',
        impact: 'Underwriter must release before req_emp_nb_002 is sent to clinic.',
      },
      {
        id: 'doc_emp_nb_aps_request_anchor_2',
        severity: 'High',
        title: 'Ordered for treated hypertension',
        quote: 'Reason for order: Rx history — treated hypertension verification',
        reasoning: 'Order reason links Rx report findings to attending physician statement.',
        impact: 'APS response will inform debit/credit scoring and final offer on Solution 20.',
      },
      {
        id: 'doc_emp_nb_aps_request_anchor_3',
        severity: 'Low',
        title: 'Primary care clinic identified',
        quote: 'Clinique Médicale du Plateau · Montréal',
        reasoning: 'Applicant primary care site named on draft order form.',
        impact: 'Verify clinic contact details before release to avoid APS turnaround delay.',
      },
    ],
    'req_emp_nb_002',
    'Attending physician statement (APS)',
  ),
  empireEvidence(
    'ev_emp_nb_add_ins_decline',
    'doc_emp_nb_add_ins_decline',
    'Letter to advisor — additional insured decline (Luc Dubois)',
    'Underwriting letter declining child term rider for Luc Dubois — avocation disclosure conflict related to scuba diving.',
    'Decline letter',
    [
      {
        id: 'doc_emp_nb_add_ins_decline_anchor_1',
        severity: 'High',
        title: 'Child term rider declined',
        quote: 'Coverage for Luc Dubois under the child term rider is declined',
        reasoning: 'Additional insured underwriting decision separate from primary applicant review.',
        impact: 'Advisor must communicate decline to Marc and Amélie Dubois; rider removed if proceeding.',
      },
      {
        id: 'doc_emp_nb_add_ins_decline_anchor_2',
        severity: 'High',
        title: 'Scuba avocation conflict',
        quote: 'Avocation disclosure conflict — recreational scuba on primary application',
        reasoning: 'Shared household avocation exposure cited as basis for rider decline.',
        impact: 'Aligns with outstanding scuba questionnaire on primary insured file.',
      },
      {
        id: 'doc_emp_nb_add_ins_decline_anchor_3',
        severity: 'Medium',
        title: 'Primary application still active',
        quote: 'Primary application for Amélie Dubois remains under review',
        reasoning: 'Decline limited to Luc Dubois child term rider — not a declination of base coverage.',
        impact: 'NB-2026-4401 continues in req_gathering pending APS, labs, and scuba form.',
      },
    ],
  ),
];

export const EMPIRE_NB_AMELIE_PREVIEW_DOCUMENT_IDS = EMPIRE_DOCUMENT_EVIDENCE_RECORDS.map((row) => row.documentId);
