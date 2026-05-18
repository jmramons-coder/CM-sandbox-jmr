/**
 * @deprecated Legacy UK Income Protection overlay fixtures (IP26-*).
 * Canonical demo cases live in sbli-dataset.ts. Used only when legacyMockOverlayEnabled is true
 * or as fallback in getCaseOverview when a case id is missing from the active dataset.
 * See docs/LEGACY_MOCK_INVENTORY.md.
 */
import type { CaseNavItem, CaseOverview, CasePhase, CaseSummary } from '../types';
import { MULTI_CASE_DEMO_DATASET, type SystemDataset } from './multi-case-dataset';
import { getWorkflowDefinition } from '../domain/workflows';
import type { WorkObjectKind } from '../domain/objectRefs';
import { claimSubTypeLabel, resolveClaimSubType } from '../domain/claimSubTypes';
import type { AnatomySettings } from '../contexts/PlatformSettingsContext';
import { resolveCaseAnatomyForSettings } from '../domain/runtimeDataConfig';
import type { EntityAnatomySection } from '../domain/entityAnatomy';

const PRE_APPROVAL_STAGES: string[] = [
  'FNOL Received',
  'Initial Triage',
  'Requirement Gathering',
  'Medical Review',
  'Decision',
];

const POST_APPROVAL_STAGES: string[] = [
  'Restoration Plan',
  'Plan Verification',
  'Recovery Underway',
  'Case Completion',
];

/** Post–pre-approval stages when the workflow has only a 5-step pre pipeline (e.g. new business). */
const NEW_BUSINESS_POST_APPROVAL_STAGES: string[] = [
  'Policy issuance',
  'Delivery & welcome',
  'In-force setup',
  'Case completion',
];

const DEATH_CLAIM_POST_APPROVAL_STAGES: string[] = [
  'Benefit payment',
  'Estate / tax coordination',
  'Policy closure',
  'File archived',
];

export const MOCK_CASES: CaseSummary[] = [
  {
    id: 'IP26-5546112',
    caseKind: 'claim',
    caseTypeCode: 'IP',
    claimSubType: 'disability_benefit',
    claimant: 'Billy Bud',
    product: 'Guardian IP · 8 wk deferred',
    benefit: '£6,250/mo',
    status: 'Pending Decision',
    phase: 'pre-approval',
    rag: 'Green',
    aiRecommendation: 'Approve',
    aiSummary: 'All 7 documents validated, medical review complete — recommends approval at 91% confidence',
    priority: 'High',
    sla: '21h 46m',
    created: 'Feb 12, 2026',
    policyNumber: 'GFS-IP-2024-004821',
  },
  {
    id: 'IP26-0099211',
    caseKind: 'claim',
    caseTypeCode: 'IP',
    claimSubType: 'disability_benefit',
    claimant: 'Billy Bud',
    product: 'Guardian WP · STD bridge',
    benefit: '£4,800/mo',
    status: 'Terminated: Completed',
    phase: 'post-approval',
    rag: 'Green',
    aiRecommendation: 'Close',
    aiSummary: 'Prior short-term bridge claim — closed satisfactorily',
    priority: 'Normal',
    sla: '—',
    created: 'Jul 3, 2024',
    policyNumber: 'GFS-WP-2023-001188',
  },
  {
    id: 'IP44-6679812',
    caseKind: 'claim',
    caseTypeCode: 'IP',
    claimSubType: 'disability_benefit',
    claimant: 'Sarah Dupont',
    product: 'Guardian IP · 13 wk deferred',
    benefit: '£8,400/mo',
    status: 'Active: Awaiting Requirements',
    phase: 'pre-approval',
    rag: 'Red',
    aiRecommendation: 'Pending',
    aiSummary: 'Herniated disc, spinal surgery — surgical report and APS still outstanding',
    priority: 'High',
    sla: '1h 59m',
    created: 'Mar 1, 2026',
    policyNumber: 'GFS-IP-2023-011437',
  },
  {
    id: 'IP66-7622343',
    caseKind: 'claim',
    caseTypeCode: 'IP',
    claimSubType: 'disability_benefit',
    claimant: 'Marc Tremblay',
    product: 'Guardian IP · 4 wk deferred',
    benefit: '£6,200/mo',
    status: 'Active: Recovery Underway',
    phase: 'post-approval',
    rag: 'Amber',
    aiRecommendation: 'Monitor',
    aiSummary: 'Rotator cuff repair, rehab ongoing — monitoring recovery trajectory and PT compliance',
    priority: 'High',
    sla: '1d 4h',
    created: 'Mar 10, 2026',
    policyNumber: 'GFS-IP-2025-007622',
  },
  {
    id: 'WP66-998987',
    caseKind: 'claim',
    caseTypeCode: 'WP',
    claimSubType: 'disability_benefit',
    claimant: 'Elena Rossi',
    product: 'Guardian IP · 13 wk deferred',
    benefit: '£5,100/mo',
    status: 'Active: RTW Planning',
    phase: 'post-approval',
    rag: 'Green',
    aiRecommendation: 'Close',
    aiSummary: 'Full restoration plan completed, physician RTW clearance received — approaching case closure',
    priority: 'Normal',
    sla: '2d 0h',
    created: 'Jan 28, 2026',
    policyNumber: 'GFS-IP-2024-009899',
  },
  {
    id: 'IP26-5546200',
    caseKind: 'claim',
    caseTypeCode: 'IP',
    claimSubType: 'disability_benefit',
    claimant: 'Billy Bud',
    product: 'Guardian IP · 8 wk deferred',
    benefit: '£6,250/mo',
    status: 'Active: Restoration Plan',
    phase: 'post-approval',
    rag: 'Green',
    aiRecommendation: 'Monitor',
    aiSummary: 'Post-approval case created — restoration plan in progress, first client meeting pending',
    priority: 'High',
    sla: '1d 4h',
    created: 'Mar 27, 2026',
    policyNumber: 'GFS-IP-2024-004821',
  },
];

export const DEFAULT_OPEN_CASES: CaseNavItem[] = [
  { caseId: 'IP26-5546112', claimant: 'Billy Bud', rag: 'Green' },
  { caseId: 'IP44-6679812', claimant: 'Sarah Dupont', rag: 'Red' },
  { caseId: 'IP66-7622343', claimant: 'Marc Tremblay', rag: 'Amber' },
  { caseId: 'WP66-998987', claimant: 'Elena Rossi', rag: 'Green' },
];

export const DEFAULT_PINNED_CASES: CaseNavItem[] = [
  { caseId: 'WP66-998987', claimant: 'Elena Rossi', rag: 'Green' },
];

const billyBudAssessmentTrend = [
  { week: 'Feb 12', score: 85, event: 'Claim approved' },
  { week: 'Feb 19', score: 88 },
  { week: 'Feb 26', score: 91, event: 'Restoration plan initiated' },
  { week: 'Mar 5', score: 89, event: 'PT appointment 1 completed' },
  { week: 'Mar 12', score: 82, event: 'Medical setback — knee reinjury detected' },
  { week: 'Mar 19', score: 87 },
  { week: 'Mar 26', score: 91 },
  { week: 'Apr 6', score: 90 },
];

export const CASE_OVERVIEWS: Record<string, CaseOverview> = {
  'IP26-5546112': {
    id: 'IP26-5546112',
    caseKind: 'claim',
    caseTypeCode: 'IP',
    claimSubType: 'disability_benefit',
    claimantName: 'Billy Bud',
    claimantProfile: {
      gender: 'Male',
      dob: 'May 20, 1978 (47)',
      smoker: 'Non-smoker',
      location: 'Manchester, UK',
      email: 'bbudd19@yahoo.com',
      phone: '+44 242 5561 444',
    },
    productName: 'Guardian Income Protection (8 wk deferred)',
    policyNumber: 'GFS-IP-2024-004821',
    productType: 'Stand-alone IP · own occupation · max 65% pre-tax earnings · Premium Waiver included',
    monthlyBenefit: '£6,250',
    caseStatus: 'Pending Decision',
    caseTypeLabel: 'Claim',
    lineOfBusiness: 'Claim',
    phase: 'pre-approval',
    preApprovalStages: PRE_APPROVAL_STAGES,
    postApprovalStages: POST_APPROVAL_STAGES,
    stageLabels: PRE_APPROVAL_STAGES,
    activeStage: 5,
    decisionTabState: 'active',
    headerCallout: 'All requirements complete — the AI crew recommends approval. Review the decision tab to proceed.',
    aiDecisionRecommendation: {
      decision: 'Approve',
      confidence: 91,
      attribution: 'AI crew · Claims analysis · Generated Mar 26, 2026',
      narrative:
        'Billy Bud\'s Guardian Income Protection claim presents strong medical evidence consistent with total disability from his stated occupation (own-job definition). All 7 required documents have been received, validated, and cross-referenced. Eligibility criteria are fully met — policy was active on the disability onset date, the 8-week deferred period is satisfied, and no pre-existing condition exclusions apply. Pre-existing Type 2 Diabetes and obesity are noted but do not affect eligibility. No fraud indicators detected (identity score 98/100). The AI crew recommends approval of the full monthly benefit of £6,250 (within the 65% of pre-tax earnings cap; above the £1,500 Minimum Cover Guarantee).',
      factors: [
        { category: 'Medical Evidence', item: 'Surgical report consistent, no complications', score: -10, source: 'medical_records' },
        { category: 'Documentation', item: 'All 7 documents received and validated', score: -10, source: 'document_engine' },
        { category: 'Compliance', item: 'Medication compliance confirmed', score: -10, source: 'pharmacy_check' },
        { category: 'Pre-existing', item: 'Type 2 Diabetes — managed, monitored', score: 5, source: 'medical_history' },
        { category: 'Pre-existing', item: 'Obesity — complicates rehab but does not affect eligibility', score: 5, source: 'medical_history' },
      ],
      benefitAmount: '£6,250/month',
    },
    aiPlanStatus: 'not_generated',
    aiConfidence: 91,
    aiNarrative:
      'All requirements complete — the AI crew recommends approval at 91% confidence. Review the Decision tab to record a final claim decision. All 7 documents received and validated, medical review complete.',
    aiRecommendation: 'Approve',
    assessmentLabel: 'Income Protection — Decision Pending',
    netAssessmentScore: -35,
    aiDetailedResume: [
      'Billy Bud is a 47-year-old male claimant on Guardian stand-alone Income Protection (8-week deferred period, own-occupation definition) following a motorcycle accident on January 30, 2026. The accident resulted in multiple leg fractures and a right knee replacement. Mr. Bud is employed as a warehouse logistics supervisor and was unable to return to work immediately following the incident.',
      'All 7 required documents have been received, validated, and cross-referenced by the AI document engine. The claimant interview, identity verification, employer confirmation, surgical report, attending physician statement, functional capacity evaluation, and orthopaedic consultant report are all marked as fulfilled. No outstanding requirements remain.',
      'Medical review has been completed. The surgical report from Mr. David Harding confirms a right knee replacement following multiple leg fractures with successful surgical intervention. Post-operative reports indicate good joint alignment and early mobility. The functional capacity evaluation indicates that Mr. Bud cannot perform warehouse supervision duties requiring prolonged standing, heavy lifting, or stair navigation.',
      'The AI crew has analysed all documentation and cross-referenced findings with Guardian policy terms. Eligibility criteria are fully satisfied: the policy was active on the disability onset date, the 8-week deferred period has been met, and no pre-existing condition exclusions apply. Mr. Bud has pre-existing Type 2 Diabetes (2016) and obesity, which complicate rehabilitation but do not affect eligibility. Identity verification returned a 98/100 confidence score with no fraud indicators.',
      'Based on the comprehensive analysis, the AI crew recommends full approval of the monthly benefit of £6,250. The recommendation confidence is 91%. The assessor should review the AI assessment factors and record a final decision in the Decision tab.',
    ],
    assessmentFactors: [
      { category: 'Medical Evidence', item: 'Surgical report and post-op follow-up — consistent, no complications flagged', score: -10, source: 'medical_records' },
      { category: 'Medical Evidence', item: 'Orthopaedic consultant confirms expected recovery trajectory', score: -5, source: 'physician_report' },
      { category: 'Medical Evidence', item: 'FCE confirms inability to perform occupational duties', score: -10, source: 'fce_report' },
      { category: 'Documentation', item: 'All 7 required documents received and validated', score: -10, source: 'document_engine' },
      { category: 'Documentation', item: 'Identity verification score 98/100 — no fraud indicators', score: -10, source: 'id_verification' },
      { category: 'Compliance', item: 'Medication compliance confirmed via pharmacy records', score: -10, source: 'pharmacy_check' },
      { category: 'Pre-existing', item: 'Type 2 Diabetes (2016) — elevated healing risk, managed with insulin/GLP-1', score: 5, source: 'medical_history' },
      { category: 'Pre-existing', item: 'Obesity (7 stone overweight) — complicates mobility and rehabilitation', score: 5, source: 'medical_history' },
      { category: 'Eligibility', item: 'Policy active on disability onset date', score: -10, source: 'policy_engine' },
      { category: 'Eligibility', item: 'Deferred period (8 weeks) satisfied', score: -5, source: 'policy_engine' },
      { category: 'Contradiction', item: 'No discrepancies between self-disclosure and evidence', score: -5, source: 'contradiction_engine' },
    ],
    claimNumber: 'IP26-5546112',
    dateOfLoss: 'Jan 30, 2026',
    disabilityOnset: 'Jan 30, 2026',
    cause: 'Motorcycle accident — multiple leg fractures, right knee replacement',
    preExistingConditions: 'Type 2 Diabetes (2016) · Obesity (7 stone overweight)',
    claimEndDate: 'TBD — pending decision',
    paidBenefits: [],
    plannedBenefits: [
      { date: 'Apr 30, 2026', amount: '£6,250' },
      { date: 'May 31, 2026', amount: '£6,250' },
      { date: 'Jun 30, 2026', amount: '£6,250' },
      { date: '... through TBD', amount: '£6,250' },
    ],
    assessmentTrend: billyBudAssessmentTrend,
    restorationPlan: [],
    requirements: [
      { id: 1, name: 'Claimant Interview', category: 'Documentation', rag: 'Green', status: 'Fulfilled', dueDate: 'Feb 15, 2026', followUpDate: 'Feb 17, 2026', source: 'ai_rule_engine', trigger: 'Intake Process', phase: 'pre-approval' },
      { id: 2, name: 'Identity Verification', category: 'Documentation', rag: 'Green', status: 'Fulfilled', dueDate: 'Feb 16, 2026', followUpDate: 'Feb 18, 2026', source: 'id_verification', trigger: 'Intake Process', phase: 'pre-approval' },
      { id: 3, name: 'Employer Confirmation Letter', category: 'Employment', rag: 'Green', status: 'Fulfilled', dueDate: 'Feb 17, 2026', followUpDate: 'Feb 19, 2026', source: 'employer_portal', trigger: 'Intake Process', phase: 'pre-approval' },
      { id: 4, name: 'Surgical Report', category: 'Medical', rag: 'Green', status: 'Fulfilled', dueDate: 'Feb 19, 2026', followUpDate: 'Feb 21, 2026', source: 'medical_provider', trigger: 'AI Rule Engine', phase: 'pre-approval' },
      { id: 5, name: 'Attending Physician Statement (APS)', category: 'Medical', rag: 'Green', status: 'Fulfilled', dueDate: 'Feb 20, 2026', followUpDate: 'Feb 22, 2026', source: 'medical_provider', trigger: 'AI Rule Engine', phase: 'pre-approval' },
      { id: 6, name: 'Functional Capacity Evaluation (FCE)', category: 'Medical', rag: 'Green', status: 'Fulfilled', dueDate: 'Feb 22, 2026', followUpDate: 'Feb 24, 2026', source: 'rehabilitation_provider', trigger: 'AI Rule Engine', phase: 'pre-approval' },
      { id: 7, name: 'Orthopaedic Consultant Report', category: 'Medical', rag: 'Green', status: 'Fulfilled', dueDate: 'Feb 24, 2026', followUpDate: 'Feb 26, 2026', source: 'specialist_provider', trigger: 'Medical Review', phase: 'pre-approval' },
    ],
  },

  'IP44-6679812': {
    id: 'IP44-6679812',
    caseKind: 'claim',
    caseTypeCode: 'IP',
    claimSubType: 'disability_benefit',
    claimantName: 'Sarah Dupont',
    claimantProfile: {
      gender: 'Female',
      dob: 'Sep 14, 1985 (40)',
      smoker: 'Non-smoker',
      location: 'Lyon, France',
      email: 'sarah.dupont@gmail.com',
      phone: '+33 6 12 34 56 78',
    },
    productName: 'Guardian Income Protection (13 wk deferred)',
    policyNumber: 'GFS-IP-2023-011437',
    productType: 'Stand-alone IP · own occupation · max 65% pre-tax earnings · Premium Waiver included',
    monthlyBenefit: '£8,400',
    caseStatus: 'Active: Awaiting Requirements',
    caseTypeLabel: 'Claim',
    lineOfBusiness: 'Claim',
    phase: 'pre-approval',
    preApprovalStages: PRE_APPROVAL_STAGES,
    postApprovalStages: POST_APPROVAL_STAGES,
    stageLabels: PRE_APPROVAL_STAGES,
    activeStage: 3,
    decisionTabState: 'locked',
    aiPlanStatus: 'not_generated',
    aiConfidence: 62,
    aiNarrative:
      'Income Protection claim for Sarah Dupont, 40, following a herniated disc requiring spinal surgery. FNOL received Mar 1, 2026. Document collection is in progress — surgical report and attending physician statement (APS) are still outstanding. No decision can be made until all required documentation is received and validated.',
    aiRecommendation: 'Pending',
    assessmentLabel: 'Income Protection — Requirement Gathering',
    netAssessmentScore: 0,
    aiDetailedResume: [
      'Sarah Dupont is a 40-year-old female claimant on Guardian stand-alone Income Protection (13-week deferred period, own-occupation definition) following a herniated disc at L4-L5 requiring spinal decompression surgery. Ms. Dupont is employed as a senior software engineer at a Lyon-based technology firm and has been unable to work since February 20, 2026.',
      'FNOL was received on March 1, 2026. Initial triage was completed the same day by the AI intake engine, which flagged the claim as standard complexity. The claim is currently in the Requirement Gathering phase. Of the 5 required documents, 3 have been received and validated: identity verification, employer confirmation letter, and claimant interview transcript.',
      'Two critical documents remain outstanding: the surgical report from Dr. Pierre Moreau at Hôpital Édouard Herriot, and the attending physician statement (APS). Both were ordered on March 3 and have a follow-up date of March 15. The SLA is at risk — the requirement gathering window is approaching its deadline, and failure to receive documents will trigger an escalation.',
      'No medical review or AI assessment can proceed until the surgical report and APS are received. The AI crew is unable to make a recommendation at this time.',
    ],
    assessmentFactors: [
      { category: 'Documentation', item: 'Identity verification complete — score 96/100', score: -10, source: 'id_verification' },
      { category: 'Documentation', item: 'Employer confirmation letter received', score: -5, source: 'employer_portal' },
      { category: 'Documentation', item: 'Surgical report — OUTSTANDING', score: 15, source: 'document_engine' },
      { category: 'Documentation', item: 'Attending physician statement — OUTSTANDING', score: 15, source: 'document_engine' },
      { category: 'SLA Risk', item: 'Requirement deadline approaching — escalation imminent', score: 10, source: 'sla_engine' },
    ],
    claimNumber: 'IP44-6679812',
    dateOfLoss: 'Feb 20, 2026',
    disabilityOnset: 'Feb 20, 2026',
    cause: 'Herniated disc L4-L5 — spinal decompression surgery',
    preExistingConditions: 'None reported',
    claimEndDate: 'TBD',
    paidBenefits: [],
    plannedBenefits: [],
    assessmentTrend: [
      { week: 'Mar 1', score: 50, event: 'FNOL received' },
      { week: 'Mar 8', score: 55 },
      { week: 'Mar 15', score: 52, event: 'Docs overdue — escalation triggered' },
      { week: 'Mar 22', score: 58 },
    ],
    restorationPlan: [],
    requirements: [
      { id: 1, name: 'Identity Verification', category: 'Documentation', rag: 'Green', status: 'Fulfilled', dueDate: 'Mar 3, 2026', followUpDate: 'Mar 5, 2026', source: 'id_verification', trigger: 'Intake Process', phase: 'pre-approval' },
      { id: 2, name: 'Employer Confirmation Letter', category: 'Employment', rag: 'Green', status: 'Fulfilled', dueDate: 'Mar 5, 2026', followUpDate: 'Mar 7, 2026', source: 'employer_portal', trigger: 'Intake Process', phase: 'pre-approval' },
      { id: 3, name: 'Claimant Interview', category: 'Documentation', rag: 'Green', status: 'Fulfilled', dueDate: 'Mar 8, 2026', followUpDate: 'Mar 10, 2026', source: 'ai_rule_engine', trigger: 'Intake Process', phase: 'pre-approval' },
      { id: 4, name: 'Surgical Report', category: 'Medical', rag: 'Red', status: 'Overdue', dueDate: 'Mar 10, 2026', followUpDate: 'Mar 15, 2026', source: 'medical_provider', trigger: 'AI Rule Engine', requiresAcknowledgement: true, phase: 'pre-approval' },
      { id: 5, name: 'Attending Physician Statement (APS)', category: 'Medical', rag: 'Red', status: 'Overdue', dueDate: 'Mar 10, 2026', followUpDate: 'Mar 15, 2026', source: 'medical_provider', trigger: 'AI Rule Engine', requiresAcknowledgement: true, phase: 'pre-approval' },
    ],
  },

  'IP66-7622343': {
    id: 'IP66-7622343',
    caseKind: 'claim',
    caseTypeCode: 'IP',
    claimSubType: 'disability_benefit',
    claimantName: 'Marc Tremblay',
    claimantProfile: {
      gender: 'Male',
      dob: 'Mar 2, 1980 (46)',
      smoker: 'Non-smoker',
      location: 'Montreal, QC',
      email: 'marc.tremblay@outlook.com',
      phone: '+1 514 555 0147',
    },
    productName: 'Guardian Income Protection (4 wk deferred)',
    policyNumber: 'GFS-IP-2025-007622',
    productType: 'Stand-alone IP · own occupation · max 65% pre-tax earnings · Premium Waiver included',
    monthlyBenefit: '£6,200',
    caseStatus: 'Active: Recovery Underway',
    caseTypeLabel: 'Claim',
    lineOfBusiness: 'Claim',
    phase: 'post-approval',
    preApprovalStages: PRE_APPROVAL_STAGES,
    postApprovalStages: POST_APPROVAL_STAGES,
    stageLabels: POST_APPROVAL_STAGES,
    activeStage: 2,
    decisionTabState: 'completed',
    aiPlanStatus: 'in_progress',
    aiPlanProgress: { fulfilled: 3, total: 12 },
    humanDecision: {
      decisionType: 'approve',
      riskClass: 'standard',
      reasonCodes: ['Policy terms satisfied', 'Deferred period (4 weeks) met'],
      notes: 'Approved — all criteria met. Rotator cuff repair recovery on track. Standard risk class.',
      recordedBy: 'Victor Ramon',
      recordedAt: 'Mar 28, 2026',
    },
    aiConfidence: 94,
    aiNarrative:
      'Income Protection claim for Marc Tremblay, 46, following a workplace rotator cuff tear on February 15, 2026. Arthroscopic repair completed successfully. Rehabilitation is ongoing with good progress. All 7 required documents have been received and validated. Restoration plan is active and being monitored. The next best step is to review the upcoming PT and physician appointments and confirm the claimant is adhering to the plan.',
    aiRecommendation: 'Monitor',
    assessmentLabel: 'Income Protection — Recovery Phase',
    netAssessmentScore: -45,
    aiDetailedResume: [
      'Marc Tremblay is a 46-year-old male claimant on Guardian stand-alone Income Protection (4-week deferred period, own-occupation definition) following a workplace injury sustained on February 15, 2026. Mr. Tremblay suffered a severe rotator cuff tear in his right shoulder requiring arthroscopic surgery. He is employed as a construction project manager and was unable to return to work immediately following the incident. His monthly benefit of £6,200 (within the 65% of pre-tax earnings limit) has been active since March 2026.',
      'From a medical perspective, Mr. Tremblay\'s shoulder recovery is progressing well post-surgery. The arthroscopic repair was performed on February 20, 2026 by Dr. Isabelle Fontaine. Post-operative reports indicate successful repair with good range of motion returning. Recovery is complicated by a pre-existing Type 2 Diabetes diagnosis (2019), though impact on shoulder rehabilitation is minimal.',
      'All 7 required documents have been received and validated with a 98/100 identity verification confidence score. The claimant interview was completed on March 14, 2026. Physical therapy sessions are ongoing with two completed and several upcoming. The AI rule engine is monitoring rehabilitation progress and medication compliance.',
      'The restoration plan is active and being monitored. Weekly physical therapy sessions are ongoing with good range of motion progress. Mr. Tremblay\'s medication compliance has been confirmed through pharmacy records. The construction project management role requires overhead lifting and prolonged arm elevation, so full RTW is not expected before mid-2026.',
      'Based on the evidence gathered, the AI crew recommends continued monitoring. The claim is straightforward with consistent medical documentation and no identified fraud indicators or contradictions. The next best step is for the assessor to review the upcoming PT and physician appointments and confirm the claimant is adhering to the restoration plan.',
    ],
    assessmentFactors: [
      { category: 'Medical Evidence', item: 'Surgical report — full-thickness rotator cuff tear, successful repair', score: -10, source: 'medical_records' },
      { category: 'Medical Evidence', item: 'FCE confirms inability to perform occupational duties', score: -10, source: 'fce_report' },
      { category: 'Rehabilitation', item: 'PT session 1 completed on schedule — good range of motion progress', score: -5, source: 'physio_records' },
      { category: 'Rehabilitation', item: 'PT session 2 completed — continued improvement', score: -5, source: 'physio_records' },
      { category: 'Pre-existing', item: 'Type 2 Diabetes (2019) — managed, minimal impact on shoulder', score: 5, source: 'medical_history' },
      { category: 'Documentation', item: 'All 7 required documents received and validated', score: -10, source: 'document_engine' },
      { category: 'Documentation', item: 'Identity verification score 98/100 — no fraud indicators', score: -10, source: 'id_verification' },
      { category: 'Compliance', item: 'Medication compliance confirmed via pharmacy records', score: -10, source: 'pharmacy_check' },
      { category: 'Contradiction', item: 'No discrepancies between self-disclosure and evidence', score: -5, source: 'contradiction_engine' },
    ],
    claimNumber: 'IP66-7622343',
    dateOfLoss: 'Feb 15, 2026',
    disabilityOnset: 'Feb 15, 2026',
    cause: 'Workplace injury — severe rotator cuff tear, arthroscopic surgery',
    preExistingConditions: 'Type 2 Diabetes (2019) — managed, low impact',
    claimEndDate: 'Oct 15, 2026',
    paidBenefits: [
      { date: 'Mar 31, 2026', amount: '£6,200' },
    ],
    plannedBenefits: [
      { date: 'Apr 30, 2026', amount: '£6,200' },
      { date: 'May 31, 2026', amount: '£6,200' },
      { date: 'Jun 30, 2026', amount: '£6,200' },
      { date: '... through Oct 15, 2026', amount: '£6,200' },
    ],
    assessmentTrend: [
      { week: 'Mar 28', score: 85, event: 'Claim approved' },
      { week: 'Apr 2', score: 88, event: 'Restoration plan initiated' },
      { week: 'Apr 9', score: 90 },
      { week: 'Apr 16', score: 92, event: 'PT milestone reached' },
    ],
    restorationPlan: [
      'Monthly physician follow-up appointments',
      'Weekly physical therapy sessions — shoulder rehabilitation',
      'Daily at-home range-of-motion exercises as prescribed',
      'Medication compliance — diabetes management',
      'No overhead lifting or heavy carrying until approved',
      'No return to construction site until approved (not before June 1)',
      'Graduated desk-based duties when feasible',
    ],
    requirements: [
      { id: 1, name: 'Identity Verification', category: 'Documentation', rag: 'Green', status: 'Fulfilled', dueDate: 'Mar 11, 2026', followUpDate: 'Mar 13, 2026', source: 'id_verification', trigger: 'Intake Process', phase: 'pre-approval' },
      { id: 2, name: 'Employer Confirmation Letter', category: 'Employment', rag: 'Green', status: 'Fulfilled', dueDate: 'Mar 12, 2026', followUpDate: 'Mar 14, 2026', source: 'employer_portal', trigger: 'Intake Process', phase: 'pre-approval' },
      { id: 3, name: 'Claimant Interview', category: 'Documentation', rag: 'Green', status: 'Fulfilled', dueDate: 'Mar 14, 2026', followUpDate: 'Mar 16, 2026', source: 'ai_rule_engine', trigger: 'Intake Process', phase: 'pre-approval' },
      { id: 4, name: 'Surgical Report', category: 'Medical', rag: 'Green', status: 'Fulfilled', dueDate: 'Mar 15, 2026', followUpDate: 'Mar 17, 2026', source: 'medical_provider', trigger: 'AI Rule Engine', phase: 'pre-approval' },
      { id: 5, name: 'Attending Physician Statement (APS)', category: 'Medical', rag: 'Green', status: 'Fulfilled', dueDate: 'Mar 16, 2026', followUpDate: 'Mar 18, 2026', source: 'medical_provider', trigger: 'AI Rule Engine', phase: 'pre-approval' },
      { id: 6, name: 'Functional Capacity Evaluation (FCE)', category: 'Medical', rag: 'Green', status: 'Fulfilled', dueDate: 'Mar 18, 2026', followUpDate: 'Mar 20, 2026', source: 'rehabilitation_provider', trigger: 'AI Rule Engine', phase: 'pre-approval' },
      { id: 7, name: 'Specialist Referral Report', category: 'Medical', rag: 'Green', status: 'Fulfilled', dueDate: 'Mar 20, 2026', followUpDate: 'Mar 22, 2026', source: 'specialist_provider', trigger: 'Medical Review', phase: 'pre-approval' },
      { id: 8, name: 'Shoulder PT Appt. (Apr 2)', category: 'Rehabilitation', rag: 'Green', status: 'Fulfilled', dueDate: 'Apr 2, 2026', followUpDate: 'Apr 5, 2026', source: 'ai_rule_engine', trigger: 'AI Restoration Plan', phase: 'post-approval' },
      { id: 9, name: 'Shoulder PT Appt. (Apr 9)', category: 'Rehabilitation', rag: 'Green', status: 'Fulfilled', dueDate: 'Apr 9, 2026', followUpDate: 'Apr 12, 2026', source: 'ai_rule_engine', trigger: 'AI Restoration Plan', phase: 'post-approval' },
      { id: 10, name: 'Shoulder PT Appt. (Apr 16)', category: 'Rehabilitation', rag: 'Green', status: 'Fulfilled', dueDate: 'Apr 16, 2026', followUpDate: 'Apr 19, 2026', source: 'ai_rule_engine', trigger: 'AI Restoration Plan', phase: 'post-approval' },
      { id: 11, name: 'Physician Follow-Up', category: 'Medical', rag: 'Amber', status: 'Pending', dueDate: 'Apr 22, 2026', followUpDate: 'Apr 25, 2026', source: 'ai_rule_engine', trigger: 'AI Restoration Plan', requiresAcknowledgement: true, phase: 'post-approval' },
      { id: 12, name: 'Shoulder PT Appt. (Apr 23)', category: 'Rehabilitation', status: 'Pending', dueDate: 'Apr 23, 2026', followUpDate: 'Apr 26, 2026', source: 'ai_rule_engine', trigger: 'AI Restoration Plan', phase: 'post-approval' },
      { id: 13, name: 'Shoulder PT Appt. (Apr 30)', category: 'Rehabilitation', status: 'Pending', dueDate: 'Apr 30, 2026', followUpDate: 'May 3, 2026', source: 'ai_rule_engine', trigger: 'AI Restoration Plan', phase: 'post-approval' },
      { id: 14, name: 'Medication Compliance Report', category: 'Pharmacy', status: 'Pending', dueDate: 'May 5, 2026', followUpDate: 'May 8, 2026', source: 'pharmacy_check', trigger: 'AI Monitoring', phase: 'post-approval' },
      { id: 15, name: 'Shoulder PT Appt. (May 7)', category: 'Rehabilitation', status: 'Pending', dueDate: 'May 7, 2026', followUpDate: 'May 10, 2026', source: 'ai_rule_engine', trigger: 'AI Restoration Plan', phase: 'post-approval' },
      { id: 16, name: 'Shoulder PT Appt. (May 14)', category: 'Rehabilitation', status: 'Pending', dueDate: 'May 14, 2026', followUpDate: 'May 17, 2026', source: 'ai_rule_engine', trigger: 'AI Restoration Plan', phase: 'post-approval' },
      { id: 17, name: 'Return-to-Work Assessment', category: 'Employment', status: 'Pending', dueDate: 'May 20, 2026', followUpDate: 'May 23, 2026', source: 'ai_rule_engine', trigger: 'AI Restoration Plan', phase: 'post-approval' },
      { id: 18, name: 'Claimant Self-Report', category: 'Self-Disclosure', status: 'Pending', dueDate: 'May 25, 2026', followUpDate: 'May 28, 2026', source: 'ai_rule_engine', trigger: 'AI Monitoring', phase: 'post-approval' },
      { id: 19, name: 'Financial Impact Assessment', category: 'Financial', status: 'Pending', dueDate: 'Jun 1, 2026', followUpDate: 'Jun 4, 2026', source: 'ai_rule_engine', trigger: 'AI Restoration Plan', phase: 'post-approval' },
    ],
  },

  'WP66-998987': {
    id: 'WP66-998987',
    caseKind: 'claim',
    caseTypeCode: 'WP',
    claimSubType: 'disability_benefit',
    claimantName: 'Elena Rossi',
    claimantProfile: {
      gender: 'Female',
      dob: 'Jul 8, 1982 (43)',
      smoker: 'Non-smoker',
      location: 'Milan, Italy',
      email: 'elena.rossi@libero.it',
      phone: '+39 02 1234 5678',
    },
    productName: 'Guardian Income Protection (13 wk deferred)',
    policyNumber: 'GFS-IP-2024-009899',
    productType: 'Stand-alone IP · own occupation · max 65% pre-tax earnings · Premium Waiver included',
    monthlyBenefit: '£5,100',
    caseStatus: 'Active: RTW Planning',
    caseTypeLabel: 'Claim',
    lineOfBusiness: 'Claim',
    phase: 'post-approval',
    preApprovalStages: PRE_APPROVAL_STAGES,
    postApprovalStages: POST_APPROVAL_STAGES,
    stageLabels: POST_APPROVAL_STAGES,
    activeStage: 4,
    decisionTabState: 'completed',
    aiPlanStatus: 'complete',
    aiPlanProgress: { fulfilled: 12, total: 12 },
    humanDecision: {
      decisionType: 'approve',
      riskClass: 'standard',
      reasonCodes: ['Policy terms satisfied', 'Deferred period met', 'Medical evidence consistent'],
      notes: 'Straightforward approval — all criteria met, no complications.',
      recordedBy: 'Sophie Laurent',
      recordedAt: 'Jan 28, 2026',
    },
    aiConfidence: 96,
    aiNarrative:
      'Guardian Income Protection claim for Elena Rossi, 43. Full restoration plan completed. Medical notes indicate RTW readiness. AI has flagged RTW signals and created a planning task. Case is approaching closure.',
    aiRecommendation: 'Close',
    assessmentLabel: 'Income Protection — RTW Planning',
    netAssessmentScore: -60,
    aiDetailedResume: [
      'Elena Rossi is a 43-year-old female claimant on Guardian stand-alone Income Protection (13-week deferred period, own-occupation definition; Premium Waiver included as standard on Guardian IP) following a severe ankle fracture sustained during a skiing accident on January 5, 2026. Ms. Rossi is employed as a senior account manager at a Milan-based consulting firm. The injury required surgical fixation and an extended rehabilitation period.',
      'The claim was approved on January 28, 2026 after a straightforward pre-approval process. All required documents were received promptly and the medical evidence was consistent and unambiguous. The restoration plan was initiated immediately and has progressed exceptionally well.',
      'All 12 restoration plan requirements have been fulfilled. Physical therapy is complete, the surgical site has healed fully, and the attending physician has cleared Ms. Rossi for a graduated return to work. The AI monitoring engine has detected positive RTW signals including resumed driving, partial office attendance, and physician clearance documentation.',
      'The AI crew recommends initiating formal RTW planning and proceeding to case closure. A planning task has been automatically generated for the assessor to confirm the RTW timeline with the claimant and her employer.',
    ],
    assessmentFactors: [
      { category: 'Medical Evidence', item: 'Full surgical recovery confirmed by attending physician', score: -10, source: 'medical_records' },
      { category: 'Rehabilitation', item: 'All 12 PT sessions completed — full range of motion restored', score: -10, source: 'physio_records' },
      { category: 'RTW Signals', item: 'Claimant resumed driving and partial office attendance', score: -10, source: 'ai_monitoring' },
      { category: 'RTW Signals', item: 'Physician clearance for graduated return to work', score: -10, source: 'physician_report' },
      { category: 'Documentation', item: 'All documentation current and validated', score: -10, source: 'document_engine' },
      { category: 'Compliance', item: 'Full compliance with rehabilitation and medication protocols', score: -10, source: 'pharmacy_check' },
    ],
    claimNumber: 'WP66-998987',
    dateOfLoss: 'Jan 5, 2026',
    disabilityOnset: 'Jan 5, 2026',
    cause: 'Skiing accident — severe ankle fracture requiring surgical fixation',
    preExistingConditions: 'None',
    claimEndDate: 'Apr 30, 2026 (estimated)',
    paidBenefits: [
      { date: 'Feb 28, 2026', amount: '£5,100' },
      { date: 'Mar 31, 2026', amount: '£5,100' },
    ],
    plannedBenefits: [
      { date: 'Apr 30, 2026', amount: '£5,100 (final)' },
    ],
    assessmentTrend: [
      { week: 'Jan 28', score: 70, event: 'Claim approved' },
      { week: 'Feb 5', score: 78, event: 'Restoration plan initiated' },
      { week: 'Feb 12', score: 82 },
      { week: 'Feb 19', score: 87 },
      { week: 'Feb 26', score: 90 },
      { week: 'Mar 5', score: 92, event: 'PT milestone reached' },
      { week: 'Mar 12', score: 95 },
      { week: 'Mar 19', score: 96, event: 'Physician RTW clearance' },
    ],
    restorationPlan: [
      'Weekly physical therapy sessions (completed)',
      'Graduated weight-bearing exercises (completed)',
      'Physician follow-up appointments (completed)',
      'Return-to-work readiness assessment (completed)',
      'Employer accommodation discussion (in progress)',
      'Graduated return-to-work schedule (pending)',
    ],
    requirements: [
      { id: 1, name: 'Identity Verification', category: 'Documentation', rag: 'Green', status: 'Fulfilled', dueDate: 'Jan 15, 2026', followUpDate: 'Jan 17, 2026', source: 'id_verification', trigger: 'Intake Process', phase: 'pre-approval' },
      { id: 2, name: 'Employer Confirmation', category: 'Employment', rag: 'Green', status: 'Fulfilled', dueDate: 'Jan 16, 2026', followUpDate: 'Jan 18, 2026', source: 'employer_portal', trigger: 'Intake Process', phase: 'pre-approval' },
      { id: 3, name: 'Surgical Report', category: 'Medical', rag: 'Green', status: 'Fulfilled', dueDate: 'Jan 18, 2026', followUpDate: 'Jan 20, 2026', source: 'medical_provider', trigger: 'AI Rule Engine', phase: 'pre-approval' },
      { id: 4, name: 'Attending Physician Statement', category: 'Medical', rag: 'Green', status: 'Fulfilled', dueDate: 'Jan 20, 2026', followUpDate: 'Jan 22, 2026', source: 'medical_provider', trigger: 'AI Rule Engine', phase: 'pre-approval' },
      { id: 5, name: 'RTW Readiness Assessment', category: 'Employment', rag: 'Green', status: 'Fulfilled', dueDate: 'Mar 15, 2026', followUpDate: 'Mar 17, 2026', source: 'ai_rule_engine', trigger: 'AI Monitoring', phase: 'post-approval' },
    ],
  },

  'IP26-0099211': {
    id: 'IP26-0099211',
    caseKind: 'claim',
    caseTypeCode: 'IP',
    claimSubType: 'disability_benefit',
    claimantName: 'Billy Bud',
    claimantProfile: {
      gender: 'Male',
      dob: 'May 20, 1978 (47)',
      smoker: 'Non-smoker',
      location: 'Manchester, UK',
      email: 'bbudd19@yahoo.com',
      phone: '+44 242 5561 444',
    },
    productName: 'Guardian Waiver of Premium (STD bridge)',
    policyNumber: 'GFS-WP-2023-001188',
    productType: 'Stand-alone WP · own occupation · short-term disability bridge',
    monthlyBenefit: '£4,800',
    caseStatus: 'Terminated: Completed',
    caseTypeLabel: 'Claim',
    lineOfBusiness: 'Claim',
    phase: 'post-approval',
    preApprovalStages: PRE_APPROVAL_STAGES,
    postApprovalStages: POST_APPROVAL_STAGES,
    stageLabels: POST_APPROVAL_STAGES,
    activeStage: 4,
    decisionTabState: 'completed',
    aiPlanStatus: 'complete',
    aiPlanProgress: { fulfilled: 6, total: 6 },
    humanDecision: {
      decisionType: 'approve',
      riskClass: 'standard',
      reasonCodes: ['Policy terms satisfied', 'STD bridge period met'],
      notes: 'Approved and completed — short-term bridge benefit exhausted, claimant returned to work.',
      recordedBy: 'Sophie Laurent',
      recordedAt: 'Jun 15, 2024',
    },
    aiConfidence: 98,
    aiNarrative:
      'Prior short-term disability bridge claim for Billy Bud. Claim was approved, benefits paid through the bridge period, and the case was closed after successful return to work. All requirements fulfilled.',
    aiRecommendation: 'Close',
    assessmentLabel: 'Waiver of Premium — Completed',
    netAssessmentScore: -60,
    aiDetailedResume: [
      'Billy Bud previously filed a short-term disability bridge claim under his Guardian Waiver of Premium policy following a lower back injury in April 2024. The claim was straightforward — all documentation was received promptly and medical evidence supported a temporary disability period.',
      'The claim was approved on May 10, 2024 and benefits were paid through the bridge period ending July 3, 2024. Mr. Bud returned to work on June 28, 2024 following physician clearance. The case was closed satisfactorily with no outstanding items.',
    ],
    assessmentFactors: [
      { category: 'Medical Evidence', item: 'Lower back injury — full recovery confirmed', score: -10, source: 'medical_records' },
      { category: 'Documentation', item: 'All required documents received and validated', score: -10, source: 'document_engine' },
      { category: 'RTW Signals', item: 'Claimant returned to work — physician clearance received', score: -10, source: 'physician_report' },
    ],
    claimNumber: 'IP26-0099211',
    dateOfLoss: 'Apr 8, 2024',
    disabilityOnset: 'Apr 8, 2024',
    cause: 'Lower back injury — muscle strain',
    preExistingConditions: 'Type 2 Diabetes (2016) · Obesity',
    claimEndDate: 'Jul 3, 2024',
    paidBenefits: [
      { date: 'May 31, 2024', amount: '£4,800' },
      { date: 'Jun 30, 2024', amount: '£4,800' },
    ],
    plannedBenefits: [],
    assessmentTrend: [
      { week: 'May 10', score: 80, event: 'Claim approved' },
      { week: 'May 20', score: 85 },
      { week: 'Jun 1', score: 90, event: 'Recovery on track' },
      { week: 'Jun 15', score: 95 },
      { week: 'Jun 28', score: 98, event: 'RTW — physician clearance' },
    ],
    restorationPlan: [
      'Gradual return to light duties (completed)',
      'Weekly physiotherapy sessions (completed)',
      'Physician follow-up appointments (completed)',
    ],
    requirements: [
      { id: 1, name: 'Identity Verification', category: 'Documentation', rag: 'Green', status: 'Fulfilled', dueDate: 'Apr 15, 2024', followUpDate: 'Apr 17, 2024', source: 'id_verification', trigger: 'Intake Process', phase: 'pre-approval' },
      { id: 2, name: 'Employer Confirmation', category: 'Employment', rag: 'Green', status: 'Fulfilled', dueDate: 'Apr 16, 2024', followUpDate: 'Apr 18, 2024', source: 'employer_portal', trigger: 'Intake Process', phase: 'pre-approval' },
      { id: 3, name: 'Medical Report', category: 'Medical', rag: 'Green', status: 'Fulfilled', dueDate: 'Apr 20, 2024', followUpDate: 'Apr 22, 2024', source: 'medical_provider', trigger: 'AI Rule Engine', phase: 'pre-approval' },
      { id: 4, name: 'Physiotherapy Progress Report', category: 'Rehabilitation', rag: 'Green', status: 'Fulfilled', dueDate: 'May 25, 2024', followUpDate: 'May 28, 2024', source: 'rehabilitation_provider', trigger: 'AI Restoration Plan', phase: 'post-approval' },
      { id: 5, name: 'RTW Assessment', category: 'Employment', rag: 'Green', status: 'Fulfilled', dueDate: 'Jun 20, 2024', followUpDate: 'Jun 23, 2024', source: 'ai_rule_engine', trigger: 'AI Monitoring', phase: 'post-approval' },
      { id: 6, name: 'Physician RTW Clearance', category: 'Medical', rag: 'Green', status: 'Fulfilled', dueDate: 'Jun 28, 2024', followUpDate: 'Jul 1, 2024', source: 'physician_report', trigger: 'AI Monitoring', phase: 'post-approval' },
    ],
  },

  'IP26-5546200': {
    id: 'IP26-5546200',
    caseKind: 'claim',
    caseTypeCode: 'IP',
    claimSubType: 'disability_benefit',
    claimantName: 'Billy Bud',
    claimantProfile: {
      gender: 'Male',
      dob: 'May 20, 1978 (47)',
      smoker: 'Non-smoker',
      location: 'Manchester, UK',
      email: 'bbudd19@yahoo.com',
      phone: '+44 242 5561 444',
    },
    productName: 'Guardian Income Protection (8 wk deferred)',
    policyNumber: 'GFS-IP-2024-004821',
    productType: 'Stand-alone IP · own occupation · max 65% pre-tax earnings · Premium Waiver included',
    monthlyBenefit: '£6,250',
    caseStatus: 'Active: Restoration Plan',
    caseTypeLabel: 'Claim',
    lineOfBusiness: 'Claim',
    phase: 'post-approval',
    preApprovalStages: PRE_APPROVAL_STAGES,
    postApprovalStages: POST_APPROVAL_STAGES,
    stageLabels: POST_APPROVAL_STAGES,
    activeStage: 1,
    decisionTabState: 'locked',
    aiPlanStatus: 'in_progress',
    aiPlanProgress: { fulfilled: 0, total: 8 },
    humanDecision: undefined,
    aiConfidence: 91,
    aiNarrative:
      'Post-approval case for Billy Bud\'s Guardian Income Protection claim. The restoration plan is being built and the first client meeting is being scheduled.',
    aiRecommendation: 'Close',
    assessmentLabel: 'Income Protection — Restoration Plan',
    netAssessmentScore: -35,
    aiDetailedResume: [
      'Post-approval journey initiated for Billy Bud following claim approval on March 27, 2026. The AI crew is building the restoration plan and scheduling the first client meeting.',
    ],
    aiDecisionRecommendation: {
      decision: 'Close Case',
      confidence: 94,
      attribution: 'AI crew · Recovery assessment · Generated Apr 13, 2026',
      narrative: 'Billy Bud has met all restoration plan milestones. All 8 requirements are fulfilled — physical therapy targets achieved, employer return-to-work confirmation received, and final medical clearance documented. The claimant has demonstrated sustained functional capacity for 4 consecutive weeks. The AI crew recommends closing this case with the recovery plan fully completed.',
      factors: [
        { category: 'Recovery', item: 'All PT milestones met — mobility 92%, strength 88%', score: -10, source: 'pt_records' },
        { category: 'Employment', item: 'RTW confirmed — employer letter received Apr 10', score: -10, source: 'employer_docs' },
        { category: 'Medical', item: 'Final clearance by Dr. Harding — full duties', score: -10, source: 'medical_records' },
        { category: 'Compliance', item: 'All scheduled reviews completed on time', score: -5, source: 'case_history' },
        { category: 'Pre-existing', item: 'Diabetes stable — no impact on recovery outcome', score: 2, source: 'medical_history' },
      ],
      benefitAmount: '£6,562/month',
    },
    assessmentFactors: [],
    claimNumber: 'IP26-5546200',
    dateOfLoss: 'Jan 30, 2026',
    disabilityOnset: 'Jan 30, 2026',
    cause: 'Motorcycle accident — multiple leg fractures, right knee replacement',
    preExistingConditions: 'Type 2 Diabetes (2016) · Obesity (7 stone overweight)',
    claimEndDate: 'TBD — pending decision',
    paidBenefits: [],
    plannedBenefits: [
      { date: 'Apr 30, 2026', amount: '£6,250' },
      { date: 'May 31, 2026', amount: '£6,250' },
    ],
    assessmentTrend: [
      { week: 'Mar 27', score: 91, event: 'Claim approved' },
    ],
    restorationPlan: [],
    requirements: [],
  },
};

export type CaseOverviewLayoutContext = {
  anatomy: AnatomySettings;
  enabledObjectDomains: WorkObjectKind[];
};

function applyCaseAnatomyToOverview(
  overview: CaseOverview,
  layout: CaseOverviewLayoutContext | undefined,
  record: SystemDataset['cases'][number],
): CaseOverview {
  if (!layout || !record.caseKind || !overview.generalInformation?.sections?.length) {
    return overview;
  }
  const bundle = resolveCaseAnatomyForSettings(record.caseKind, layout.anatomy, layout.enabledObjectDomains);
  if (!bundle) return overview;
  const specSections =
    bundle.tabsResolved.find((tab) => tab.id === 'overview')?.sections ?? bundle.overviewSections;
  if (!specSections.length) return overview;

  const specById = new Map<string, EntityAnatomySection & { enabled?: boolean }>(
    specSections.map((section) => [section.id, section as EntityAnatomySection & { enabled?: boolean }]),
  );
  const nextSections = overview.generalInformation.sections
    .map((section) => {
      const spec = specById.get(section.id);
      if (!spec) return section;
      if (spec.enabled === false) return { ...section, enabled: false };
      const keys = spec.fields;
      if (!keys?.length) return section;
      const matched = section.fields.filter(
        (field) =>
          keys.includes(field.id) ||
          keys.includes(field.label) ||
          keys.some((key) => key.toLowerCase() === field.label.toLowerCase()),
      );
      if (!matched.length) return section;
      return { ...section, fields: matched };
    })
    .filter((section) => section.enabled !== false);

  return { ...overview, generalInformation: { sections: nextSections } };
}

export function getCaseOverview(
  caseId: string,
  dataset: SystemDataset = MULTI_CASE_DEMO_DATASET,
  includeLegacyOverlay = true,
  layout?: CaseOverviewLayoutContext,
): CaseOverview {
  const systemRecord = dataset.cases.find((item) => item.id === caseId);
  if (systemRecord) {
    let overview = createOverviewFromSystemRecord(systemRecord, dataset);
    if (layout) {
      overview = applyCaseAnatomyToOverview(overview, layout, systemRecord);
    }
    return overview;
  }
  const defaultId = MOCK_CASES[0].id;
  const baseCase = CASE_OVERVIEWS[defaultId];
  if (includeLegacyOverlay) {
    const legacyCase = CASE_OVERVIEWS[caseId];
    if (legacyCase) return legacyCase;
  }
  return {
    ...baseCase,
    id: caseId,
    title: `Case ${caseId}`,
    claimantName: 'Unknown primary party',
    primaryPartyName: 'Unknown primary party',
    claimNumber: caseId,
    policyNumber: 'N/A',
    caseStatus: 'Not found',
    aiNarrative: 'No case record exists in the active dataset.',
    aiDetailedResume: ['No case record exists in the active dataset.'],
    assessmentFactors: [],
    requirements: [],
    linkedObjects: [],
    participants: [],
    facts: [],
    sections: [],
  };
}

function createOverviewFromSystemRecord(record: SystemDataset['cases'][number], dataset: SystemDataset): CaseOverview {
  const workflow = getWorkflowDefinition(record.workflowTemplateId);
  const workflowSteps = workflow?.steps ?? record.workflowState?.steps ?? [];
  const claimSubtype =
    record.caseKind === 'claim' ? claimSubTypeLabel(resolveClaimSubType(record)) : '';
  const derivedCaseTypeLabel =
    record.caseTypeLabel ?? record.identification?.caseTypeLabel ?? (claimSubtype || workflow?.caseNoun || workflow?.label || record.caseTypeCode);
  const productFact = record.facts.find((fact) => fact.id === 'product')?.value ?? workflow?.label ?? record.caseTypeCode;
  const financialFact = record.facts.find((fact) => fact.category === 'financial')?.value ?? 'N/A';
  const linkedPolicy = record.linkedObjects.find((ref) => ref.kind === 'policy');
  const policyRecord = dataset.policies.find((policy) => policy.id === linkedPolicy?.id);
  const contextMetrics = record.contextCard?.headlineMetrics ?? [];
  const contextMetric = (id: string) => contextMetrics.find((metric) => metric.id === id);
  const planMetric = contextMetric('plan');
  const financialMetric = contextMetric('monthly-benefit');
  const policyRoles = record.primaryParty.kind === 'client'
    ? policyRecord?.participants
      .filter((participant) => participant.clientId === record.primaryParty.id)
      .map((participant) => participant.role)
    : [];
  const primaryPartyPolicyRole = record.primaryParty.policyRole ??
    (policyRoles?.find((role) => role === 'insured' || role === 'beneficiary') ?? policyRoles?.[0])
      ?.replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  const clientRecord = record.primaryParty.kind === 'client'
    ? dataset.clients.find((client) => client.id === record.primaryParty.id)
    : undefined;
  const steps = workflowSteps.map((step) => step.label);
  const preStages =
    steps.length >= 5
      ? steps.slice(0, 5)
      : steps.length > 0
        ? steps
        : PRE_APPROVAL_STAGES;
  const postStages =
    workflow?.steps && workflow.steps.length > 5 && steps.slice(5).length >= 4
      ? steps.slice(5, 9)
      : record.caseKind === 'new_business'
        ? NEW_BUSINESS_POST_APPROVAL_STAGES
        : record.workflowTemplateId === 'claim-death-benefit' || record.caseTypeCode?.toUpperCase() === 'DTH'
          ? DEATH_CLAIM_POST_APPROVAL_STAGES
          : POST_APPROVAL_STAGES;
  const phase = record.phaseId === 'post-approval' ? 'post-approval' : 'pre-approval';
  const toOverviewRequirementStatus = (status: string): CaseOverview['requirements'][number]['status'] => {
    switch (status) {
      case 'fulfilled':
        return 'Fulfilled';
      case 'overdue':
        return 'Overdue';
      case 'in_review':
      case 'pending':
        return 'Pending';
      case 'scheduled':
        return 'Ordered';
      case 'not_started':
        return 'In Queue';
      default:
        return status as CaseOverview['requirements'][number]['status'];
    }
  };
  const requirements = dataset.requirements
    .filter((requirement) => requirement.linkedObjects.some((ref) => ref.kind === 'case' && ref.id === record.id))
    .map((requirement) => ({
      id: requirement.id,
      datasetRequirementId: requirement.id,
      name: requirement.label,
      category: requirement.category,
      rag: requirement.rag ?? (['Pending', 'Overdue', 'In Queue'].includes(requirement.status) ? 'Amber' as const : 'Green' as const),
      status: toOverviewRequirementStatus(requirement.status),
      stage: requirement.stage,
      dueDate: requirement.dueDate ?? 'TBD',
      followUpDate: requirement.followUpDate ?? 'TBD',
      source: requirement.source ?? 'dataset',
      sourceType: requirement.sourceType,
      responsibleParty: requirement.responsibleParty,
      trigger: requirement.trigger ?? requirement.workflowStepId ?? 'Business line',
      phase: (requirement.phase as CasePhase | undefined) ?? phase,
      notes: requirement.notes ?? 'Generated from the active dataset relationship graph.',
      aiSummary: requirement.aiSummary,
      fulfillmentCriteria: requirement.fulfillmentCriteria,
      linkedDocs: requirement.linkedDocs,
      linkedTasks: requirement.linkedTasks,
      blockingImpact: requirement.blockingImpact,
      context: requirement.context,
      history: requirement.history,
      objectRefs: requirement.linkedObjects,
      workflowStepId: requirement.workflowStepId,
    }));

  return {
    id: record.id,
    caseKind: record.caseKind,
    caseTypeCode: record.caseTypeCode,
    claimSubType: resolveClaimSubType(record),
    workflowTemplateId: record.workflowTemplateId,
    title: record.title,
    primaryParty: record.primaryParty,
    primaryPartyName: record.primaryParty.label ?? record.primaryParty.id,
    primaryPartyLabel: workflow?.primaryPartyLabel ?? 'Primary party',
    primaryPartyPolicyRole,
    participants: record.participants.filter((participant) => participant.kind === 'client'),
    linkedObjects: record.linkedObjects,
    moduleSummaries: record.moduleSummaries,
    facts: record.facts,
    sections: record.sections,
    identification: record.identification
      ? { ...record.identification, caseTypeLabel: derivedCaseTypeLabel }
      : record.identification,
    workflowMeta: record.workflowMeta,
    contextCard: record.contextCard,
    workflowState: record.workflowState,
    tabs: record.tabs,
    generalInformation: record.generalInformation,
    underwritingScoring: record.underwritingScoring,
    decisionFlow: record.decisionFlow,
    claimantName: record.primaryParty.label ?? record.primaryParty.id,
    claimantProfile: {
      gender: clientRecord?.profile?.gender ?? 'Not captured',
      dob: clientRecord?.profile?.dob ?? 'Not captured',
      smoker: clientRecord?.profile?.smoker ?? 'Not captured',
      location: clientRecord?.profile?.location ?? 'Not captured',
      email: clientRecord?.profile?.email ?? 'Not captured',
      phone: clientRecord?.profile?.phone ?? 'Not captured',
    },
    productName: policyRecord?.product ?? planMetric?.value ?? productFact,
    policyNumber: policyRecord?.policyNumber ?? linkedPolicy?.id ?? record.contextCard?.planRef?.id ?? 'N/A',
    productType: policyRecord?.productType ?? workflow?.label ?? record.caseTypeCode,
    monthlyBenefit: policyRecord?.monthlyBenefit ?? financialMetric?.value ?? financialFact,
    caseStatus: record.status,
    caseTypeLabel: derivedCaseTypeLabel,
    lineOfBusiness: workflow?.label ?? record.caseTypeCode,
    phase,
    preApprovalStages: preStages,
    postApprovalStages: postStages,
    stageLabels: phase === 'post-approval' ? postStages : preStages,
    activeStage: Math.max(
      1,
      (workflowSteps.findIndex((step) => step.id === record.activeStepId) ?? 0) + 1,
    ),
    decisionTabState: record.decision?.state ?? (record.caseKind === 'customer_service' ? 'locked' : 'active'),
    aiDecisionRecommendation: record.decision?.recommendation ? {
      decision: record.decision.recommendation.decision,
      confidence: record.decision.recommendation.confidence,
      attribution: record.decision.recommendation.attribution,
      narrative: record.decision.recommendation.narrative,
      factors: record.decision.recommendation.factors ?? [],
      benefitAmount: record.decision.recommendation.benefitAmount ?? policyRecord?.monthlyBenefit ?? financialFact,
    } : undefined,
    headerCallout: record.decision?.headerCallout,
    aiConfidence: record.analysis?.confidence ?? 72,
    aiNarrative: record.analysis?.narrative ?? record.facts.map((fact) => `${fact.label}: ${fact.value}`).join(' · '),
    aiRecommendation: (record.analysis?.recommendation === 'Approve' ? 'Approve' : record.caseKind === 'claim' ? 'Pending' : 'Monitor'),
    aiDetailedResume: record.analysis?.detailedResume ?? [
      `${record.title} is a ${workflow?.caseNoun ?? 'case'} in ${record.status}.`,
      `Primary party: ${record.primaryParty.label ?? record.primaryParty.id}.`,
      'This record is generated from the neutral multi-case dataset contract.',
    ],
    assessmentFactors: record.analysis?.factors ?? record.facts.map((fact, index) => ({
      category: fact.category ?? 'Case fact',
      item: `${fact.label}: ${fact.value}`,
      score: index === 0 ? -5 : 0,
      source: 'multi_case_dataset',
    })),
    assessmentLabel: record.analysis?.assessmentLabel ?? workflow?.label ?? 'Case assessment',
    netAssessmentScore: record.analysis?.netAssessmentScore ?? 0,
    claimNumber: record.claimDetails?.claimNumber ?? record.id,
    dateOfLoss: record.claimDetails?.dateOfLoss ?? 'N/A',
    disabilityOnset: record.claimDetails?.disabilityOnset ?? 'N/A',
    cause: record.claimDetails?.cause ?? 'N/A',
    preExistingConditions: record.claimDetails?.preExistingConditions ?? 'N/A',
    claimEndDate: record.claimDetails?.claimEndDate ?? 'N/A',
    paidBenefits: record.claimDetails?.paidBenefits ?? [],
    plannedBenefits: record.claimDetails?.plannedBenefits ?? [],
    assessmentTrend: record.analysis?.trend ?? [],
    restorationPlan: record.claimDetails?.restorationPlan ?? [],
    requirements,
  };
}
