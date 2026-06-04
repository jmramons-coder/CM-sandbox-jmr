import type { CaseGeneralInformation, CaseWorkflowMeta } from '../domain/objectRefs';
import { EMPIRE_DEMO_CASE_IDS } from './empireDemoCaseIds';

export type EmpireCaseWorkflowGiRecord = {
  workflowMeta: CaseWorkflowMeta;
  generalInformation: CaseGeneralInformation;
};

export const EMPIRE_CASE_WORKFLOW_GI_RECORDS: Record<string, EmpireCaseWorkflowGiRecord> = {
  [EMPIRE_DEMO_CASE_IDS.disabilityClaim]: {
    workflowMeta: {
      caseId: EMPIRE_DEMO_CASE_IDS.disabilityClaim,
      type: 'CLM',
      subtype: 'disability_benefit',
      breadcrumb: 'Claim · Disability insurance',
      status: 'Requirement gathering',
      statusClass: 'requirement_gathering',
      assignee: 'Victor Ramon',
      contextBar: [
        { slot: 1, label: 'Life insured', value: 'Marc Tremblay', sub: null, valueColor: null },
        { slot: 2, label: 'Policy', value: 'Empire Disability Insurance', sub: 'POL-EMP-DI-2023-004521', subType: 'reference_link', valueColor: null },
        { slot: 3, label: 'Monthly benefit', value: '$3,800/month', sub: '90-day waiting period', subType: 'descriptor', valueColor: null },
        { slot: 4, label: 'SLA', value: '28 May 2026', sub: null, valueColor: 'warning' },
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
        text: 'Marc Tremblay notified Empire Life on 22 Mar 2026 of disability from a rotator cuff tear. Own-occupation cover applies. Waiting period satisfied 18 May 2026. Awaiting employer confirmation and specialist letter confirming inability to perform software development duties.',
        confidence: 76,
        generatedAt: '2026-05-18',
      },
      cards: [
        {
          id: 'insured_policy',
          title: 'Life insured & policy',
          type: 'key_value_grid',
          layout: '2_col',
          fields: [
            { label: 'Life insured', value: 'Marc Tremblay' },
            { label: 'Occupation', value: 'Software developer' },
            { label: 'Policy number', value: 'POL-EMP-DI-2023-004521' },
            { label: 'Product', value: 'Empire Disability Insurance' },
            { label: 'Monthly benefit', value: '$3,800' },
            { label: 'Waiting period', value: '90 days' },
            { label: 'Financial advisor', value: 'Jean-Philippe Morin' },
            { label: 'Province', value: 'Ontario' },
          ],
        },
      ],
      collapsibles: [
        { id: 'coverage', title: 'Cover summary', subtitle: 'Own occupation · advisor-led' },
        { id: 'employer', title: 'Employer evidence', subtitle: 'Physician statement outstanding' },
      ],
    },
  },
  [EMPIRE_DEMO_CASE_IDS.criticalIllnessClaim]: {
    workflowMeta: {
      caseId: EMPIRE_DEMO_CASE_IDS.criticalIllnessClaim,
      type: 'CLM',
      subtype: 'critical_illness',
      breadcrumb: 'Claim · Critical illness',
      status: 'Pending decision',
      statusClass: 'pending_decision',
      assignee: 'Victor Ramon',
      contextBar: [
        { slot: 1, label: 'Life insured', value: 'Sophie Chen', sub: null, valueColor: null },
        { slot: 2, label: 'Policy', value: 'Empire Critical Illness', sub: 'POL-EMP-CI-2021-008734', subType: 'reference_link', valueColor: null },
        { slot: 3, label: 'Coverage amount', value: '$125,000', sub: 'Full benefit eligible', subType: 'descriptor', valueColor: null },
        { slot: 4, label: 'SLA', value: '25 May 2026', sub: null, valueColor: 'warning' },
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
        text: 'Sophie Chen — breast cancer diagnosis confirmed by specialist letter received 5 May 2026. Empire Life critical illness definition satisfied. Recommend full $125,000 payout; copy financial advisor Pacific Wealth Advisors.',
        confidence: 91,
        generatedAt: '2026-05-17',
      },
      cards: [
        {
          id: 'life_assured_policy',
          title: 'Life insured & policy',
          type: 'key_value_grid',
          layout: '2_col',
          fields: [
            { label: 'Life insured', value: 'Sophie Chen' },
            { label: 'Date of diagnosis', value: '20 Mar 2026' },
            { label: 'Policy number', value: 'POL-EMP-CI-2021-008734' },
            { label: 'Product', value: 'Empire Critical Illness Insurance' },
            { label: 'Coverage amount', value: '$125,000' },
            { label: 'Condition', value: 'Invasive ductal carcinoma' },
            { label: 'Financial advisor', value: 'Pacific Wealth Advisors' },
            { label: 'Evidence', value: 'Specialist diagnosis letter', valueType: 'pill_success' },
          ],
        },
      ],
      collapsibles: [
        { id: 'support', title: 'Advisor support', subtitle: 'Treatment pathway updates scheduled' },
        { id: 'definitions', title: 'Policy definitions', subtitle: 'Full payout recommended' },
      ],
    },
  },
  [EMPIRE_DEMO_CASE_IDS.lifeDeathClaim]: {
    workflowMeta: {
      caseId: EMPIRE_DEMO_CASE_IDS.lifeDeathClaim,
      type: 'CLM',
      subtype: 'death_benefit',
      breadcrumb: 'Claim · Death benefit',
      status: 'In progress',
      statusClass: 'in_progress',
      assignee: 'Victor Ramon',
      contextBar: [
        { slot: 1, label: 'Beneficiary', value: 'Margaret MacDonald', sub: null, valueColor: null },
        { slot: 2, label: 'Policy', value: 'Empire Term Life 20', sub: 'POL-EMP-LIFE-2022-003912', subType: 'reference_link', valueColor: null },
        { slot: 3, label: 'Coverage amount', value: '$400,000', sub: '$15k compassionate advance paid', subType: 'descriptor', valueColor: null },
        { slot: 4, label: 'SLA', value: '5 Jun 2026', sub: null, valueColor: null },
      ],
      subwayStages: [
        { order: 1, name: 'FNOL received', slug: 'fnol_received', state: 'done', subLabel: null },
        { order: 2, name: 'Initial triage', slug: 'initial_triage', state: 'done', subLabel: null },
        { order: 3, name: 'Req. gathering', slug: 'req_gathering', state: 'active', subLabel: 'Estate documentation' },
        { order: 4, name: 'Decision', slug: 'decision', state: 'next', subLabel: null },
      ],
      tabs: ['General information', 'Requirements', 'Tasks', 'Documents', 'Communications', 'Relationships', 'Activities'],
      headerActions: [{ label: 'Record payment', type: 'primary' }],
    },
    generalInformation: {
      sections: [],
      aiSummary: {
        text: 'Robert MacDonald died 22 Apr 2026. Death certificate and claim form received. Compassionate advance of $15,000 paid to Margaret MacDonald 8 May 2026. Balance $385,000 pending estate documentation. Advisor Jean-Philippe Morin copied on all updates.',
        confidence: 87,
        generatedAt: '2026-05-16',
      },
      cards: [
        {
          id: 'beneficiary_policy',
          title: 'Beneficiary & policy',
          type: 'key_value_grid',
          layout: '2_col',
          fields: [
            { label: 'Deceased', value: 'Robert MacDonald' },
            { label: 'Beneficiary', value: 'Margaret MacDonald (100%)' },
            { label: 'Policy number', value: 'POL-EMP-LIFE-2022-003912' },
            { label: 'Product', value: 'Empire Term Life 20' },
            { label: 'Coverage amount', value: '$400,000' },
            { label: 'Compassionate advance', value: '$15,000 paid' },
            { label: 'Remaining balance', value: '$385,000' },
            { label: 'Financial advisor', value: 'Jean-Philippe Morin' },
          ],
        },
      ],
      collapsibles: [
        { id: 'estate', title: 'Estate documentation', subtitle: 'Probate certificate pending' },
        { id: 'advance', title: 'Compassionate advance', subtitle: 'Paid 8 May 2026' },
      ],
    },
  },
  [EMPIRE_DEMO_CASE_IDS.nbFullUw]: {
    workflowMeta: {
      caseId: EMPIRE_DEMO_CASE_IDS.nbFullUw,
      type: 'NB',
      subtype: 'full_underwriting',
      breadcrumb: 'New business · Full underwriting',
      status: 'Active: Awaiting requirements',
      statusClass: 'awaiting_requirements',
      assignee: 'Victor Ramon',
      contextBar: [
        { slot: 1, label: 'Applicant', value: 'Amélie Dubois', sub: null, valueColor: null },
        { slot: 2, label: 'Product', value: 'Solution 20 participating', sub: '$500,000', subType: 'descriptor', valueColor: null },
        { slot: 3, label: 'MIB', value: 'Clear', sub: null, valueColor: null },
        { slot: 4, label: 'SLA', value: '27 May 2026', sub: null, valueColor: 'warning' },
      ],
      subwayStages: [
        { order: 1, name: 'Application', slug: 'application', state: 'done', subLabel: null },
        { order: 2, name: 'Req. gathering', slug: 'req_gathering', state: 'active', subLabel: 'Attending physician statement' },
        { order: 3, name: 'Underwriting', slug: 'underwriting-review', state: 'next', subLabel: null },
        { order: 4, name: 'Decision', slug: 'decision', state: 'next', subLabel: null },
      ],
      tabs: ['General information', 'Requirements', 'Tasks', 'Documents', 'Communications', 'Relationships', 'Activities'],
      headerActions: [{ label: 'Issue terms', type: 'primary' }],
    },
    generalInformation: {
      sections: [],
      aiSummary: {
        text: 'Amélie Dubois applied for $500,000 Solution 20 participating whole life via Empire Life advisor portal. Non-smoker, BMI 25. Application initial review completed 8 May; MIB, blood/urine, and Rx ordered by system at submission. Rx received 11 May — AI recommends APS for lisinopril and amlodipine (treated hypertension); underwriter approval pending. Scuba questionnaire still outstanding. Preliminary standard terms anticipated pending medical evidence.',
        confidence: 73,
        generatedAt: '2026-05-17',
      },
      cards: [
        {
          id: 'application_intake',
          title: 'Application intake',
          type: 'key_value_grid',
          layout: '2_col',
          fields: [
            { label: 'Applicant', value: 'Amélie Dubois' },
            { label: 'Date of birth', value: '19 Jan 1982' },
            { label: 'Age', value: '44 (nearest age)' },
            { label: 'Application date', value: '8 May 2026' },
            { label: 'Channel', value: 'Empire Life Advisor Portal' },
            { label: 'Product', value: 'Solution 20 participating' },
            { label: 'Coverage amount', value: '$500,000' },
            { label: 'Plan', value: '20-pay participating whole life' },
            {
              label: 'Beneficiaries',
              value: 'Marc Dubois (spouse, 100%) · Children of the insured per stirpes (contingent)',
            },
            { label: 'Riders', value: 'Waiver of premium · Guaranteed insurability · Accidental death benefit' },
          ],
        },
        {
          id: 'distribution',
          title: 'Agent & agency',
          type: 'key_value_grid',
          layout: '2_col',
          fields: [
            { label: 'Managing general agent', value: 'Empire Life Insurance Company' },
            { label: 'Financial group', value: 'Morin Financial Group' },
            { label: 'Office', value: 'Morin Financial Group — Montréal' },
            { label: 'Agency', value: 'Morin Financial Group' },
            { label: 'Address', value: '1250 boulevard René-Lévesque O, bureau 2200, Montréal QC H3B 4W8' },
            { label: 'Writing agent', value: 'Jean-Philippe Morin · EMP-JPM-014' },
          ],
        },
        {
          id: 'insured_health_profile',
          title: 'Insured health profile',
          type: 'key_value_grid',
          layout: '2_col',
          fields: [
            { label: 'Smoker status', value: 'Non-smoker', valueType: 'pill_success' },
            { label: 'BMI', value: '25.0 — Normal' },
          ],
        },
      ],
      collapsibles: [],
    },
  },
  [EMPIRE_DEMO_CASE_IDS.nbSimplified]: {
    workflowMeta: {
      caseId: EMPIRE_DEMO_CASE_IDS.nbSimplified,
      type: 'NB',
      subtype: 'simplified_underwriting',
      breadcrumb: 'New business · Accelerated underwriting',
      status: 'Active: Underwriting',
      statusClass: 'underwriting',
      assignee: 'Victor Ramon',
      contextBar: [
        { slot: 1, label: 'Applicant', value: 'Liam O\'Brien', sub: null, valueColor: null },
        { slot: 2, label: 'Product', value: 'Solution 10 term', sub: '$250,000', subType: 'descriptor', valueColor: null },
        { slot: 3, label: 'Path', value: 'Adult-Short + PHI', sub: 'Tele-interview 22 May', subType: 'descriptor', valueColor: null },
        { slot: 4, label: 'SLA', value: '26 May 2026', sub: null, valueColor: null },
      ],
      subwayStages: [
        { order: 1, name: 'Application', slug: 'application', state: 'done', subLabel: null },
        { order: 2, name: 'Adult-Short questionnaire', slug: 'simplified-questionnaire', state: 'done', subLabel: null },
        { order: 3, name: 'Personal history interview', slug: 'tele-interview', state: 'active', subLabel: 'Scheduled' },
        { order: 4, name: 'Decision', slug: 'decision', state: 'next', subLabel: null },
      ],
      tabs: ['General information', 'Requirements', 'Tasks', 'Documents', 'Communications', 'Relationships', 'Activities'],
      headerActions: [{ label: 'Issue policy', type: 'primary' }],
    },
    generalInformation: {
      sections: [],
      aiSummary: {
        text: 'Liam O\'Brien — Solution 10 term $250,000 via Fast & Full with Adult-Short questionnaire (no APS at this face amount). Clean disclosures, non-smoker. Personal History Tele-Interview scheduled 22 May 2026. Standard non-smoker rates likely on pass.',
        confidence: 89,
        generatedAt: '2026-05-18',
      },
      cards: [
        {
          id: 'application_intake',
          title: 'Application intake',
          type: 'key_value_grid',
          layout: '2_col',
          fields: [
            { label: 'Applicant', value: 'Liam O\'Brien' },
            { label: 'Date of birth', value: '4 Jul 1990' },
            { label: 'Application date', value: '14 May 2026' },
            { label: 'Channel', value: 'Advisor — Pacific Wealth' },
            { label: 'Product', value: 'Solution 10 term life' },
            { label: 'Coverage amount', value: '$250,000' },
            { label: 'UW path', value: 'Adult-Short + PHI', valueType: 'pill_info' },
            { label: 'PHI scheduled', value: '22 May 2026 14:00 MT' },
          ],
        },
        {
          id: 'simplified_uw_status',
          title: 'Accelerated underwriting status',
          type: 'status_tile_grid',
          tiles: [
            { label: 'Application', status: 'complete' },
            { label: 'Adult-Short', status: 'complete' },
            { label: 'PHI', status: 'pending' },
            { label: 'Issue decision', status: 'pending' },
          ],
        },
      ],
      collapsibles: [
        { id: 'solution10', title: 'Solution 10 criteria', subtitle: 'Adult-Short path — PHI replaces paramed at this amount' },
      ],
    },
  },
  [EMPIRE_DEMO_CASE_IDS.nbGuaranteed]: {
    workflowMeta: {
      caseId: EMPIRE_DEMO_CASE_IDS.nbGuaranteed,
      type: 'NB',
      subtype: 'guaranteed_underwriting',
      breadcrumb: 'New business · Guaranteed issue',
      status: 'Active: Contract issuance',
      statusClass: 'contract_issuance',
      assignee: 'Victor Ramon',
      contextBar: [
        { slot: 1, label: 'Applicant', value: 'Patricia Singh', sub: null, valueColor: null },
        { slot: 2, label: 'Product', value: 'Guaranteed Life Protect', sub: '$50,000 max', subType: 'descriptor', valueColor: null },
        { slot: 3, label: 'Eligibility', value: 'Confirmed', sub: 'Age 40–75', subType: 'descriptor', valueColor: null },
        { slot: 4, label: 'SLA', value: '29 May 2026', sub: null, valueColor: null },
      ],
      subwayStages: [
        { order: 1, name: 'Application', slug: 'application', state: 'done', subLabel: null },
        { order: 2, name: 'Eligibility check', slug: 'eligibility-check', state: 'done', subLabel: null },
        { order: 3, name: 'Contract issuance', slug: 'contract-issuance', state: 'active', subLabel: 'PAD pending' },
        { order: 4, name: 'Policy delivery', slug: 'issue', state: 'next', subLabel: null },
      ],
      tabs: ['General information', 'Requirements', 'Tasks', 'Documents', 'Communications', 'Relationships', 'Activities'],
      headerActions: [{ label: 'Issue policy', type: 'primary' }],
    },
    generalInformation: {
      sections: [],
      aiSummary: {
        text: 'Patricia Singh — Guaranteed Life Protect $50,000, guaranteed issue path. Age 67, within eligible band (40–75). No medical or lifestyle questions. Eligibility confirmed; contract issuance in progress for PAD authorization and beneficiary designation. Graded benefit applies in first 24 months.',
        confidence: 94,
        generatedAt: '2026-05-19',
      },
      cards: [
        {
          id: 'application_intake',
          title: 'Application intake',
          type: 'key_value_grid',
          layout: '2_col',
          fields: [
            { label: 'Applicant', value: 'Patricia Singh' },
            { label: 'Date of birth', value: '21 Dec 1958' },
            { label: 'Application date', value: '18 May 2026' },
            { label: 'Channel', value: 'Empire Life Advisor Portal' },
            { label: 'Product', value: 'Guaranteed Life Protect' },
            { label: 'Coverage amount', value: '$50,000' },
            { label: 'UW path', value: 'Guaranteed issue — no questions', valueType: 'pill_info' },
            { label: 'Financial advisor', value: 'Jean-Philippe Morin' },
          ],
        },
        {
          id: 'guaranteed_uw_status',
          title: 'Guaranteed issue status',
          type: 'status_tile_grid',
          tiles: [
            { label: 'Application', status: 'complete' },
            { label: 'Eligibility', status: 'complete' },
            { label: 'Contract issuance', status: 'pending' },
            { label: 'Policy delivery', status: 'pending' },
          ],
        },
      ],
      collapsibles: [
        { id: 'glp_features', title: 'Guaranteed Life Protect features', subtitle: 'No health questions — 24-month graded benefit on natural causes' },
        { id: 'payment', title: 'Payment authorization', subtitle: 'Pre-authorized debit pending confirmation' },
      ],
    },
  },
};
