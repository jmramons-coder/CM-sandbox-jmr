import type { DocumentEvidenceRecord } from './multi-case-dataset';
import { GUARDIAN_DEMO_CASE_IDS } from './guardianDemoCaseIds';

const CI = GUARDIAN_DEMO_CASE_IDS.criticalIllnessClaim;
const IP = GUARDIAN_DEMO_CASE_IDS.incomeProtectionClaim;

export const GUARDIAN_DOCUMENT_EVIDENCE_RECORDS: DocumentEvidenceRecord[] = [
  {
    id: 'ev_gdn_ci_diagnosis',
    kind: 'document_evidence',
    documentId: 'doc_gdn_ci_diagnosis',
    title: 'Consultant diagnosis — evidence review',
    summary:
      'AI review of UK consultant oncology letter for Leana Mitchell. Confirms invasive ductal carcinoma meets Guardian faster-fairer CI definition; recommends full £150,000 payout.',
    pages: [
      { number: 1, label: 'Letterhead & consultant credentials' },
      { number: 2, label: 'Diagnosis & staging' },
      { number: 3, label: 'Treatment plan' },
    ],
    findings: [
      {
        id: 'f1',
        severity: 'High',
        title: 'Listed condition confirmed',
        quote: 'Invasive ductal carcinoma of the right breast, stage IIA',
        reasoning: 'Condition appears on Guardian Critical Illness Protection definition schedule.',
        impact: 'Supports full benefit payment without partial-stage reduction.',
      },
      {
        id: 'f2',
        severity: 'Medium',
        title: 'UK consultant requirement met',
        quote: 'Consultant Medical Oncologist, Bristol Oncology Centre',
        reasoning: 'Letter issued by UK GMC-registered consultant as required for accelerated evidence path.',
        impact: 'Satisfies faster-fairer CI evidence standard.',
      },
    ],
    linkedObjects: [
      { kind: 'case', id: CI, label: CI },
      { kind: 'document', id: 'doc_gdn_ci_diagnosis', label: 'Consultant diagnosis letter' },
      { kind: 'requirement', id: 'req_gdn_ci_002', label: 'UK consultant diagnosis letter' },
    ],
  },
  {
    id: 'ev_gdn_ip_consultant',
    kind: 'document_evidence',
    documentId: 'doc_gdn_ip_consultant',
    title: 'Consultant letter — IP incapacity',
    summary:
      'Orthopaedic consultant letter supports own-occupation incapacity for software engineering; pending employer Fit Note clarification.',
    pages: [
      { number: 1, label: 'Clinical summary' },
      { number: 2, label: 'Work capacity opinion' },
    ],
    findings: [
      {
        id: 'f1',
        severity: 'High',
        title: 'Own-occupation restriction',
        reasoning: 'Letter limits prolonged sedentary work and screen-based duties.',
        impact: 'Supports IP claim once employer evidence aligned.',
      },
    ],
    linkedObjects: [
      { kind: 'case', id: IP, label: IP },
      { kind: 'document', id: 'doc_gdn_ip_consultant', label: 'Consultant letter' },
      { kind: 'requirement', id: 'req_gdn_ip_004', label: 'Consultant letter' },
    ],
  },
];
