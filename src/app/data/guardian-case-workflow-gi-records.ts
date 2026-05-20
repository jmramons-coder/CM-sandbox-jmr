import type { CaseGeneralInformation, CaseWorkflowMeta } from '../domain/objectRefs';
import { GUARDIAN_DEMO_CASE_IDS } from './guardianDemoCaseIds';

export type GuardianCaseWorkflowGiRecord = {
  workflowMeta: CaseWorkflowMeta;
  generalInformation: CaseGeneralInformation;
};

export const GUARDIAN_CASE_WORKFLOW_GI_RECORDS: Record<string, GuardianCaseWorkflowGiRecord> = {
  [GUARDIAN_DEMO_CASE_IDS.incomeProtectionClaim]: {
    workflowMeta: {
      caseId: GUARDIAN_DEMO_CASE_IDS.incomeProtectionClaim,
      type: 'CLM',
      subtype: 'income_protection',
      breadcrumb: 'Claim · Income protection',
      status: 'Requirement gathering',
      statusClass: 'requirement_gathering',
      assignee: 'Victor Ramon',
      contextBar: [
        { slot: 1, label: 'Life assured', value: 'James Hartley', sub: null, valueColor: null },
        { slot: 2, label: 'Policy', value: 'Guardian Income Protection', sub: 'GDN-IP-2023-009871', subType: 'reference_link', valueColor: null },
        { slot: 3, label: 'Monthly benefit', value: '£4,200/month', sub: '13-week deferred period', subType: 'descriptor', valueColor: null },
        { slot: 4, label: 'SLA', value: '22 May 2026', sub: null, valueColor: 'warning' },
      ],
      subwayStages: [
        { order: 1, name: 'FNOL received', slug: 'fnol_received', state: 'done', subLabel: null },
        { order: 2, name: 'Initial triage', slug: 'initial_triage', state: 'done', subLabel: null },
        { order: 3, name: 'Req. gathering', slug: 'req_gathering', state: 'active', subLabel: 'Employer evidence' },
        { order: 4, name: 'Medical review', slug: 'medical_review', state: 'next', subLabel: null },
        { order: 5, name: 'Decision', slug: 'decision', state: 'next', subLabel: null },
      ],
      tabs: ['General information', 'Requirements', 'Tasks', 'Documents', 'Communications', 'Relationships', 'Activities'],
      headerActions: [{ label: 'Decision', type: 'primary' }, { label: 'Create task', type: 'secondary', icon: 'plus' }],
    },
    generalInformation: {
      sections: [],
      aiSummary: {
        text: 'James Hartley notified Guardian by phone on 18 Mar 2026 of incapacity from a lumbar disc injury. Own-occupation cover applies. Deferred period ends 10 May 2026. HALO introduced. Awaiting employer sick note and consultant letter confirming inability to perform software engineering duties.',
        confidence: 78,
        generatedAt: '2026-05-17',
      },
      cards: [
        {
          id: 'insured_policy',
          title: 'Life assured & policy',
          type: 'key_value_grid',
          layout: '2_col',
          fields: [
            { label: 'Life assured', value: 'James Hartley' },
            { label: 'Occupation', value: 'Software engineer' },
            { label: 'Policy number', value: 'GDN-IP-2023-009871' },
            { label: 'Product', value: 'Guardian Income Protection' },
            { label: 'Monthly benefit', value: '£4,200' },
            { label: 'Deferred period', value: '13 weeks' },
            { label: 'Financial adviser', value: 'Harriet Shaw' },
            { label: 'Issuer', value: 'Scottish Friendly (via Guardian)' },
          ],
        },
      ],
      collapsibles: [
        { id: 'coverage', title: 'Cover summary', subtitle: 'Own occupation · HALO' },
        { id: 'employer', title: 'Employer evidence', subtitle: 'Fit note outstanding' },
      ],
    },
  },
  [GUARDIAN_DEMO_CASE_IDS.criticalIllnessClaim]: {
    workflowMeta: {
      caseId: GUARDIAN_DEMO_CASE_IDS.criticalIllnessClaim,
      type: 'CLM',
      subtype: 'critical_illness',
      breadcrumb: 'Claim · Critical illness',
      status: 'Pending decision',
      statusClass: 'pending_decision',
      assignee: 'Victor Ramon',
      contextBar: [
        { slot: 1, label: 'Life assured', value: 'Leana Mitchell', sub: null, valueColor: null },
        { slot: 2, label: 'Policy', value: 'Guardian CI Protection', sub: 'GDN-CI-2021-004455', subType: 'reference_link', valueColor: null },
        { slot: 3, label: 'Sum assured', value: '£150,000', sub: 'Partial payout eligible', subType: 'descriptor', valueColor: null },
        { slot: 4, label: 'SLA', value: '20 May 2026', sub: null, valueColor: 'warning' },
      ],
      subwayStages: [
        { order: 1, name: 'FNOL received', slug: 'fnol_received', state: 'done', subLabel: null },
        { order: 2, name: 'Initial triage', slug: 'initial_triage', state: 'done', subLabel: null },
        { order: 3, name: 'Req. gathering', slug: 'req_gathering', state: 'done', subLabel: null },
        { order: 4, name: 'Medical review', slug: 'medical_review', state: 'done', subLabel: null },
        { order: 5, name: 'Decision', slug: 'decision', state: 'active', subLabel: 'Ready' },
      ],
      tabs: ['General information', 'Requirements', 'Tasks', 'Documents', 'Communications', 'Relationships', 'Activities'],
      headerActions: [{ label: 'Decision', type: 'primary' }, { label: 'Create task', type: 'secondary', icon: 'plus' }],
    },
    generalInformation: {
      sections: [],
      aiSummary: {
        text: 'Leana Mitchell — breast cancer diagnosis confirmed by UK consultant letter received 2 May 2026. Guardian faster-fairer CI path satisfied. HALO active for treatment support. Recommend full £150,000 payout; early-stage partial already considered under definitions.',
        confidence: 92,
        generatedAt: '2026-05-16',
      },
      cards: [
        {
          id: 'life_assured_policy',
          title: 'Life assured & policy',
          type: 'key_value_grid',
          layout: '2_col',
          fields: [
            { label: 'Life assured', value: 'Leana Mitchell' },
            { label: 'Date of diagnosis', value: '15 Mar 2026' },
            { label: 'Policy number', value: 'GDN-CI-2021-004455' },
            { label: 'Product', value: 'Guardian CI Protection' },
            { label: 'Sum assured', value: '£150,000' },
            { label: 'Condition', value: 'Invasive ductal carcinoma' },
            { label: 'Financial adviser', value: 'Harriet Shaw' },
            { label: 'Evidence', value: 'UK consultant letter', valueType: 'pill_success' },
          ],
        },
      ],
      collapsibles: [
        { id: 'halo', title: 'HALO support', subtitle: 'Treatment pathway active' },
        { id: 'definitions', title: 'Policy definitions', subtitle: 'Full payout recommended' },
      ],
    },
  },
  [GUARDIAN_DEMO_CASE_IDS.lifeDeathClaim]: {
    workflowMeta: {
      caseId: GUARDIAN_DEMO_CASE_IDS.lifeDeathClaim,
      type: 'CLM',
      subtype: 'death_benefit',
      breadcrumb: 'Claim · Death benefit',
      status: 'In progress',
      statusClass: 'in_progress',
      assignee: 'Victor Ramon',
      contextBar: [
        { slot: 1, label: 'Beneficiary', value: 'Sarah Clarke', sub: null, valueColor: null },
        { slot: 2, label: 'Policy', value: 'Guardian Life Protection', sub: 'GDN-LP-2022-118902', subType: 'reference_link', valueColor: null },
        { slot: 3, label: 'Sum assured', value: '£500,000', sub: '£10k funeral advance paid', subType: 'descriptor', valueColor: null },
        { slot: 4, label: 'SLA', value: '1 Jun 2026', sub: null, valueColor: null },
      ],
      subwayStages: [
        { order: 1, name: 'FNOL received', slug: 'fnol_received', state: 'done', subLabel: null },
        { order: 2, name: 'Initial triage', slug: 'initial_triage', state: 'done', subLabel: null },
        { order: 3, name: 'Req. gathering', slug: 'req_gathering', state: 'active', subLabel: 'Probate pending' },
        { order: 4, name: 'Decision', slug: 'decision', state: 'next', subLabel: null },
      ],
      tabs: ['General information', 'Requirements', 'Tasks', 'Documents', 'Communications', 'Relationships', 'Activities'],
      headerActions: [{ label: 'Record payment', type: 'primary' }],
    },
    generalInformation: {
      sections: [],
      aiSummary: {
        text: 'David Clarke died 20 Apr 2026. Death certificate and claim form received. Funeral Payment Pledge advance of £10,000 paid to Sarah Clarke 6 May 2026. Balance £490,000 pending grant of probate. Adviser Northbridge copied on all updates.',
        confidence: 88,
        generatedAt: '2026-05-14',
      },
      cards: [],
    },
  },
  [GUARDIAN_DEMO_CASE_IDS.nbFullUw]: {
    workflowMeta: {
      caseId: GUARDIAN_DEMO_CASE_IDS.nbFullUw,
      type: 'NB',
      subtype: 'full_underwriting',
      breadcrumb: 'New business · Full underwriting',
      status: 'Active: Awaiting requirements',
      statusClass: 'awaiting_requirements',
      assignee: 'Victor Ramon',
      contextBar: [
        { slot: 1, label: 'Applicant', value: 'Priya Sharma', sub: null, valueColor: null },
        { slot: 2, label: 'Product', value: 'Life & CI Protection', sub: '£350,000 + children’s CI', subType: 'descriptor', valueColor: null },
        { slot: 3, label: 'MIB', value: 'Clear', sub: null, valueColor: null },
        { slot: 4, label: 'SLA', value: '25 May 2026', sub: null, valueColor: 'warning' },
      ],
      subwayStages: [
        { order: 1, name: 'Application', slug: 'application', state: 'done', subLabel: null },
        { order: 2, name: 'Req. gathering', slug: 'req_gathering', state: 'active', subLabel: 'GP report' },
        { order: 3, name: 'Underwriting', slug: 'underwriting-review', state: 'next', subLabel: null },
        { order: 4, name: 'Decision', slug: 'decision', state: 'next', subLabel: null },
      ],
      tabs: ['General information', 'Requirements', 'Scoring', 'Tasks', 'Documents', 'Communications', 'Relationships', 'Activities'],
      headerActions: [{ label: 'Issue terms', type: 'primary' }],
    },
    generalInformation: {
      sections: [],
      aiSummary: {
        text: 'Priya Sharma applied for £350,000 Life and Critical Illness Protection with optional children’s CI. Non-smoker, BMI 24. GP report ordered 12 May — outstanding. Tele-interview completed. Preliminary standard terms anticipated pending medical.',
        confidence: 74,
        generatedAt: '2026-05-16',
      },
      cards: [
        {
          id: 'application_intake',
          title: 'Application intake',
          type: 'key_value_grid',
          layout: '2_col',
          fields: [
            { label: 'Applicant', value: 'Priya Sharma' },
            { label: 'Date of birth', value: '22 Jul 1984' },
            { label: 'Application date', value: '10 May 2026' },
            { label: 'Channel', value: 'Guardian Adviser Portal' },
            { label: 'Product', value: 'Life & CI Protection' },
            { label: 'Sum assured', value: '£350,000' },
            { label: 'Rider', value: 'Children’s CI (optional)' },
            { label: 'UW path', value: 'Full underwriting', valueType: 'pill_info' },
          ],
        },
        {
          id: 'insured_health_profile',
          title: 'Insured health profile',
          type: 'key_value_grid',
          layout: '2_col',
          fields: [
            { label: 'Smoker status', value: 'Non-smoker', valueType: 'pill_success' },
            { label: 'BMI', value: '24.0 — Normal' },
            { label: 'MIB', value: 'Clear', valueType: 'pill_success' },
            { label: 'Tele-interview', value: 'Completed 14 May 2026' },
            { label: 'GP report', value: 'Outstanding', valueType: 'pill_warning' },
            { label: 'Financial adviser', value: 'Harriet Shaw' },
          ],
        },
        {
          id: 'ai_scoring_summary',
          title: 'AI debit/credit scoring summary',
          type: 'scoring_bar_chart',
          aiGenerated: true,
          summary: 'Provisional standard — pending GP report',
          summaryStatus: 'warning',
          note: 'Final rating subject to medical evidence.',
          factors: [
            { name: 'BMI 26.1 (pending confirm)', direction: 'debit', points: '+15', barPct: 25 },
            { name: 'Non-smoker', direction: 'credit', points: '-10', barPct: 20 },
          ],
        },
      ],
      collapsibles: [
        { id: 'children_ci', title: 'Children’s CI selection', subtitle: 'Rider form validated' },
        { id: 'medicals', title: 'Medicals', subtitle: 'GP report chase if not received by 19 May' },
      ],
    },
  },
  [GUARDIAN_DEMO_CASE_IDS.nbSimplified]: {
    workflowMeta: {
      caseId: GUARDIAN_DEMO_CASE_IDS.nbSimplified,
      type: 'NB',
      subtype: 'simplified_underwriting',
      breadcrumb: 'New business · Simplified',
      status: 'Active: Underwriting',
      statusClass: 'underwriting',
      assignee: 'Victor Ramon',
      contextBar: [
        { slot: 1, label: 'Applicant', value: 'Oliver Hughes', sub: null, valueColor: null },
        { slot: 2, label: 'Product', value: 'Life Essentials', sub: '£100,000', subType: 'descriptor', valueColor: null },
        { slot: 3, label: 'Path', value: 'Simplified UW', sub: 'Tele-interview 19 May', subType: 'descriptor', valueColor: null },
        { slot: 4, label: 'SLA', value: '24 May 2026', sub: null, valueColor: null },
      ],
      subwayStages: [
        { order: 1, name: 'Application', slug: 'application', state: 'done', subLabel: null },
        { order: 2, name: 'Tele-interview', slug: 'tele-interview', state: 'active', subLabel: 'Scheduled' },
        { order: 3, name: 'Decision', slug: 'decision', state: 'next', subLabel: null },
      ],
      tabs: ['General information', 'Requirements', 'Scoring', 'Tasks', 'Documents', 'Communications', 'Relationships', 'Activities'],
      headerActions: [{ label: 'Issue policy', type: 'primary' }],
    },
    generalInformation: {
      sections: [],
      aiSummary: {
        text: 'Oliver Hughes — Life Essentials £100,000, simplified underwriting. Clean disclosures, non-smoker. Tele-interview scheduled 19 May 2026. Standard rates likely on pass.',
        confidence: 91,
        generatedAt: '2026-05-17',
      },
      cards: [
        {
          id: 'application_intake',
          title: 'Application intake',
          type: 'key_value_grid',
          layout: '2_col',
          fields: [
            { label: 'Applicant', value: 'Oliver Hughes' },
            { label: 'Date of birth', value: '8 Feb 1988' },
            { label: 'Application date', value: '15 May 2026' },
            { label: 'Channel', value: 'Direct — adviser' },
            { label: 'Product', value: 'Life Essentials' },
            { label: 'Sum assured', value: '£100,000' },
            { label: 'UW path', value: 'Simplified', valueType: 'pill_info' },
            { label: 'Tele-interview', value: '19 May 2026 10:00' },
          ],
        },
        {
          id: 'accelerated_uw_status',
          title: 'Simplified underwriting status',
          type: 'status_tile_grid',
          tiles: [
            { label: 'Disclosures', status: 'complete' },
            { label: 'MIB', status: 'complete' },
            { label: 'Tele-interview', status: 'pending' },
            { label: 'Issue decision', status: 'pending' },
          ],
        },
      ],
      collapsibles: [
        { id: 'essentials', title: 'Life Essentials criteria', subtitle: 'Simplified path — no GP report required' },
      ],
    },
  },
};
