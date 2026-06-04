import type { TaskCrewStep } from '../types';

/** Rich AI crew step trails keyed by task id — mirrors Agentic Workflows detail cards. */
export const TASK_CREW_STEP_SEEDS: Record<string, TaskCrewStep[]> = {
  task_emp_nb_001: [
    {
      id: 'nb-review',
      title: 'Application initial review',
      agent: 'Victor Ramon',
      completedAt: '2026-05-08T13:00:00',
      status: 'completed',
      findings: [
        { text: 'Application and needs analysis validated — mandatory fields and beneficiary designation present.', tone: 'success' },
        { text: 'Non-smoker, age 42 — standard build table applies.', tone: 'success' },
        { text: 'Submission requirements released — system ordered MIB, blood/urine, and Rx at intake.', tone: 'success' },
      ],
      rationale:
        'Human underwriter completed initial review the day of submission. Application structurally complete; traditional full underwriting path confirmed.',
    },
  ],
  task_emp_nb_015: [
    {
      id: 'aps-rx-review',
      title: 'Rx report analysis',
      agent: 'AI Agent',
      completedAt: '2026-05-11T10:05:00',
      status: 'completed',
      findings: [
        { text: 'IntelliScript results ingested — lisinopril 10 mg and amlodipine 5 mg on continuous fill.', tone: 'warning' },
        { text: 'Medication pattern consistent with treated hypertension not documented on the application.', tone: 'warning' },
        { text: 'No other undisclosed high-risk medications identified.', tone: 'success' },
      ],
      rationale:
        'Cross-referenced Rx history against application disclosures. Antihypertensive therapy warrants physician verification before rating.',
    },
    {
      id: 'aps-recommend',
      title: 'APS order recommendation',
      agent: 'AI Agent',
      completedAt: '2026-05-11T10:06:00',
      status: 'completed',
      findings: [
        { text: 'Recommend APS to Clinique Médicale du Plateau — primary care for applicant.', tone: 'neutral' },
        { text: 'APS should confirm diagnosis date, blood-pressure control, and any related cardiac workup.', tone: 'neutral' },
        { text: 'Awaiting underwriter approval to release order.', tone: 'neutral' },
      ],
      rationale:
        'Planned APS order based on treated high blood pressure surfaced in Rx results. Underwriter can approve or amend before the order is placed.',
    },
  ],
  task_emp_ci_002: [
    {
      id: 'ci-evidence',
      title: 'Medical evidence retrieval',
      agent: 'AI Agent',
      completedAt: '2026-05-18T10:12:00',
      status: 'completed',
      findings: [
        { text: 'Specialist diagnosis letter received — invasive ductal carcinoma documented.', tone: 'success' },
        { text: 'Pathology report corroborates histology and staging language.', tone: 'success' },
        { text: 'Advisor notification thread linked to case timeline.', tone: 'success' },
      ],
      rationale:
        'Pulled specialist and pathology artifacts from the requirement bundle and verified document integrity before definition matching.',
    },
    {
      id: 'ci-definition',
      title: 'Critical illness definition matching',
      agent: 'AI Agent',
      completedAt: '2026-05-18T10:13:00',
      status: 'completed',
      findings: [
        { text: 'Diagnosis meets Empire Life CI product definition for life-threatening cancer.', tone: 'success' },
        { text: 'No applicable exclusion riders on policy CLM-CI-2026-0156.', tone: 'success' },
      ],
      rationale:
        'Cross-referenced diagnostic wording against the published CI definition schedule. Confidence is high that the claim satisfies the accelerated evidence path.',
    },
    {
      id: 'ci-payout',
      title: 'Benefit calculation',
      agent: 'AI Agent',
      completedAt: '2026-05-18T10:14:00',
      status: 'completed',
      findings: [
        { text: 'Face amount $125,000 — full benefit recommended.', tone: 'success' },
        { text: 'Advisor copy required on decision letter per distribution agreement.', tone: 'info' },
      ],
      rationale:
        'Validated coverage amount against in-force policy snapshot. No partial-pay modifiers apply; recommend full payout pending human sign-off.',
    },
  ],
  task_emp_ci_003: [
    {
      id: 'dec-req',
      title: 'Requirement fulfillment check',
      agent: 'AI Agent',
      completedAt: '2026-05-20T14:30:00',
      status: 'completed',
      findings: [
        { text: '4 of 4 pre-decision requirements fulfilled or waived.', tone: 'success' },
        { text: 'Specialist diagnosis requirement closed with validated evidence.', tone: 'success' },
        { text: 'Advisor support plan on file — Pacific Wealth Advisors.', tone: 'success' },
      ],
      rationale:
        'Audited requirement grid against workflow stage gates. No blocking items remain before decision recording.',
    },
    {
      id: 'dec-medical',
      title: 'Medical & definition review',
      agent: 'AI Agent',
      completedAt: '2026-05-20T14:31:00',
      status: 'completed',
      findings: [
        { text: 'CI definition match confirmed at 94% confidence.', tone: 'success' },
        { text: 'Pathology and specialist letter consistent — no contradictions.', tone: 'success' },
      ],
      rationale:
        'Consolidated prior AI validation outputs. Medical narrative supports approve at full face amount without modified offer.',
    },
    {
      id: 'dec-rec',
      title: 'Decision recommendation',
      agent: 'AI Agent',
      completedAt: '2026-05-20T14:32:00',
      status: 'completed',
      findings: [
        { text: 'Recommend approve $125,000 lump-sum CI benefit.', tone: 'success' },
        { text: 'Copy advisor on outbound decision letter.', tone: 'info' },
      ],
      rationale:
        'All automated checks passed. Human approver should confirm payout instructions and record formal decision in the case Decision tab.',
    },
  ],
  task_cd5211: [
    {
      id: 'cd-med-retrieval',
      title: 'Medical evidence retrieval',
      agent: 'AI Agent',
      completedAt: '2026-03-09T08:40:00',
      status: 'completed',
      findings: [
        { text: 'APS from Dr. Chen indexed — functional limitation documented.', tone: 'success' },
        { text: "Surgical report from St. Luke's received and parsed.", tone: 'success' },
        { text: 'Employer confirmation on file — own-occupation duties listed.', tone: 'success' },
      ],
      rationale:
        'Retrieved all medical artifacts linked to the disability requirement bundle and verified OCR quality before analysis.',
    },
    {
      id: 'cd-definition',
      title: 'Disability definition analysis',
      agent: 'AI Agent',
      completedAt: '2026-03-09T08:42:00',
      status: 'completed',
      findings: [
        { text: 'Right knee replacement — 6–9 month recovery precludes motorcycle courier duties.', tone: 'success' },
        { text: 'Own-occupation and unable-to-work definitions both satisfied.', tone: 'success' },
        { text: 'Pre-existing T2D (2016) noted — managed, no exclusion applies.', tone: 'warning' },
      ],
      rationale:
        'Mapped clinical restrictions to occupational duties from employer statement. Pre-existing condition documented but does not block WOP eligibility.',
    },
    {
      id: 'cd-narrative',
      title: 'Assessment narrative generation',
      agent: 'AI Agent',
      completedAt: '2026-03-09T08:44:00',
      status: 'completed',
      findings: [
        { text: 'Total disability conclusion generated at 91% confidence.', tone: 'success' },
        { text: 'WOP rider conditions met — policy in force at disability onset.', tone: 'success' },
      ],
      rationale:
        'Synthesized cross-document findings into decision-ready narrative. Recommend human review before advancing to approval stage.',
    },
  ],
  task_nb4025: [
    {
      id: 'nb4025-intake',
      title: 'Application & health synthesis',
      agent: 'AI Agent',
      completedAt: '2026-05-16T09:00:00',
      status: 'completed',
      findings: [
        { text: 'Marc Tremblay, 42 — Term Life 20, $625,000, non-smoker, BMI 27.4.', tone: 'success' },
        { text: 'T2 Diabetes (2019), HbA1c 48, Metformin 500mg — consistent with disclosures.', tone: 'success' },
      ],
      rationale:
        'Consolidated application intake and insured health profile cards into a single underwriting picture for req. gathering.',
    },
    {
      id: 'nb4025-initial-review',
      title: 'Initial review outcomes',
      agent: 'AI Agent',
      completedAt: '2026-05-16T09:05:00',
      status: 'completed',
      findings: [
        { text: 'MIB: prior decline 2022 — accelerated UW disqualified, traditional path required.', tone: 'warning' },
        { text: 'MVR clean; Rx confirms Metformin since 2019.', tone: 'success' },
      ],
      rationale:
        'Mapped completed initial-review requirements (MIB, MVR, Rx) to evidence still needed in req. gathering.',
    },
    {
      id: 'nb4025-evidence-gaps',
      title: 'Evidence gaps',
      agent: 'AI Agent',
      completedAt: '2026-05-16T09:10:00',
      status: 'completed',
      findings: [
        { text: 'Outstanding: APS, paramedical, blood profile, and prior-decline explanation.', tone: 'info' },
        { text: 'T2D, MIB prior decline, BMI, and family history shape the medical workup.', tone: 'warning' },
      ],
      rationale:
        'Mapped remaining evidence needs to proposed gathering requirements for underwriter approval.',
    },
    {
      id: 'nb4025-package',
      title: 'Requirement package',
      agent: 'AI Agent',
      completedAt: '2026-05-16T09:12:00',
      status: 'completed',
      findings: [
        { text: '8 requirements proposed — 4 critical/high-priority pre-selected for approval.', tone: 'success' },
      ],
      rationale:
        'Packaged APS, paramedical, prior-decline letter, blood profile, and optional cardiovascular and financial items for underwriter selection.',
    },
  ],
  task_ps_addr_001: [
    {
      id: 'addr-intake',
      title: 'Portal request intake',
      agent: 'AI Agent',
      completedAt: '2026-05-14T11:09:00',
      status: 'completed',
      findings: [
        { text: 'Policy SBLI-TL-2022-007316 confirmed in force for Nora Whitfield.', tone: 'success' },
        { text: 'Signed change form received with effective date May 14, 2026.', tone: 'success' },
      ],
      rationale:
        'Parsed the client portal submission and matched the requester to the insured on the active term policy.',
    },
    {
      id: 'addr-verify',
      title: 'Registry verification',
      agent: 'AI Agent',
      completedAt: '2026-05-14T11:10:00',
      status: 'completed',
      findings: [
        { text: 'National Address Registry match at 9 Willow Court, Cambridge MA 02139.', tone: 'success' },
        { text: 'Registry lists Apt 2 while the form shows Suite 2 — one-label variance.', tone: 'warning' },
        { text: 'In-state move — government ID not required.', tone: 'info' },
      ],
      rationale:
        'Queried the National Address Registry against the signed change form. Registry canonical format differs only on unit label.',
    },
    {
      id: 'addr-route',
      title: 'Route for review',
      agent: 'System',
      completedAt: '2026-05-14T11:11:00',
      status: 'completed',
      findings: [
        { text: 'Simple policy-service task created — no claim case opened.', tone: 'success' },
      ],
      rationale:
        'Packaged registry match and unit-label variance for Victor Ramon to confirm address formatting before policy admin update.',
    },
  ],
  task_emp_addr_001: [
    {
      id: 'emp-addr-intake',
      title: 'Portal request intake',
      agent: 'AI Agent',
      completedAt: '2026-05-14T11:09:00',
      status: 'completed',
      findings: [
        { text: 'Policy POL-EMP-TL-2020-008905 confirmed in force for Eleanor Whitfield.', tone: 'success' },
        { text: 'Signed change form received with effective date May 14, 2026.', tone: 'success' },
      ],
      rationale:
        'Parsed the Empire Life client portal submission and matched the requester to the insured on the active term policy.',
    },
    {
      id: 'emp-addr-verify',
      title: 'Registry verification',
      agent: 'AI Agent',
      completedAt: '2026-05-14T11:10:00',
      status: 'completed',
      findings: [
        { text: 'National Address Registry match at 15 Laurier Avenue West, Ottawa ON K1P 5J9.', tone: 'success' },
        { text: 'Registry lists Apt 204 while the form shows Unit 204 — one-label variance.', tone: 'warning' },
        { text: 'In-province move within Ontario — government ID not required.', tone: 'info' },
      ],
      rationale:
        'Queried the National Address Registry against the signed change form. Registry canonical format differs only on unit label.',
    },
    {
      id: 'emp-addr-ofac',
      title: 'OFAC screening',
      agent: 'AI Agent',
      completedAt: '2026-05-14T11:10:30',
      status: 'completed',
      findings: [
        { text: 'LexisNexis Bridger Insight XG — clear for Eleanor Whitfield.', tone: 'success' },
        { text: 'Ottawa mailing address screened — 0 SDN / consolidated list hits.', tone: 'success' },
        { text: 'Permanent change on selected policy only — Solution 10 whole life excluded.', tone: 'info' },
      ],
      rationale:
        'Automated sanctions screening on client name and requested address at intake. No compliance hold required before policy admin update.',
    },
    {
      id: 'emp-addr-route',
      title: 'Route for review',
      agent: 'System',
      completedAt: '2026-05-14T11:11:00',
      status: 'completed',
      findings: [
        { text: 'Simple policy-service task created — no claim case opened.', tone: 'success' },
      ],
      rationale:
        'Packaged registry match and unit-label variance for Victor Ramon to confirm address formatting before policy admin update.',
    },
  ],
};

export function getTaskCrewStepSeed(taskId: string): TaskCrewStep[] | undefined {
  return TASK_CREW_STEP_SEEDS[taskId];
}
