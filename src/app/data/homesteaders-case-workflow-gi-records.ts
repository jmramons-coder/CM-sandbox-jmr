import type { CaseGeneralInformation, CaseWorkflowMeta } from '../domain/objectRefs';
import { HOMESTEADERS_DEMO_CASE_IDS } from './homesteadersDemoCaseIds';

export type HomesteadersCaseWorkflowGiRecord = {
  workflowMeta: CaseWorkflowMeta;
  generalInformation: CaseGeneralInformation;
};

const PN_MID = HOMESTEADERS_DEMO_CASE_IDS.preneedClaimMid;
const PN_DEC = HOMESTEADERS_DEMO_CASE_IDS.preneedClaimDecision;
const NB = HOMESTEADERS_DEMO_CASE_IDS.nbFullUw;
const NB_S = HOMESTEADERS_DEMO_CASE_IDS.nbSimplified;
const NB_G = HOMESTEADERS_DEMO_CASE_IDS.nbGuaranteed;

export const HOMESTEADERS_CASE_WORKFLOW_GI_RECORDS: Record<string, HomesteadersCaseWorkflowGiRecord> = {
  [PN_MID]: {
    workflowMeta: {
      caseId: PN_MID,
      type: 'CLM',
      subtype: 'death_benefit',
      breadcrumb: 'Claim · Preneed death benefit',
      status: 'Requirement gathering',
      statusClass: 'requirement_gathering',
      assignee: 'Victor Ramon',
      contextBar: [
        { slot: 1, label: 'Deceased', value: 'Helen Martinez', sub: null, valueColor: null },
        { slot: 2, label: 'Policy', value: 'Preneed funeral plan', sub: 'POL-HSL-PN-2015-001142', subType: 'reference_link', valueColor: null },
        { slot: 3, label: 'Preneed benefit', value: '$10,000', sub: 'Funeral home TBD', subType: 'descriptor', valueColor: null },
        { slot: 4, label: 'SLA', value: '2 Jun 2026', sub: null, valueColor: 'warning' },
      ],
      subwayStages: [
        { order: 1, name: 'FNOL received', slug: 'fnol_received', state: 'done', subLabel: null },
        { order: 2, name: 'Initial triage', slug: 'initial_triage', state: 'done', subLabel: null },
        { order: 3, name: 'Req. gathering', slug: 'req_gathering', state: 'active', subLabel: 'Funeral home assignment' },
        { order: 4, name: 'Decision', slug: 'decision', state: 'next', subLabel: null },
      ],
      tabs: ['General information', 'Requirements', 'Tasks', 'Documents', 'Communications', 'Relationships', 'Activities'],
      headerActions: [{ label: 'Record payment', type: 'primary' }, { label: 'Create task', type: 'secondary', icon: 'plus' }],
    },
    generalInformation: {
      sections: [],
      aiSummary: {
        text: 'Helen Martinez passed 28 Apr 2026. Certified death certificate received 1 May. Preneed contract POL-HSL-PN-2015-001142 in force at $10,000. Funeral home assignment to Oak Grove Funeral Home still pending — Sandra Martinez coordinating arrangements. Helping people design a better farewell starts with confirming the funeral director partner.',
        confidence: 82,
        generatedAt: '2026-05-10',
      },
      cards: [
        {
          id: 'preneed_policy',
          title: 'Preneed contract & parties',
          type: 'key_value_grid',
          layout: '2_col',
          fields: [
            { label: 'Deceased', value: 'Helen Martinez' },
            { label: 'Contact', value: 'Sandra Martinez (spouse)' },
            { label: 'Policy number', value: 'POL-HSL-PN-2015-001142' },
            { label: 'Product', value: 'Homesteaders Preneed Funeral Plan' },
            { label: 'Contract amount', value: '$10,000' },
            { label: 'Funeral home', value: 'Oak Grove — assignment pending' },
            { label: 'Funeral director', value: 'Oak Grove Funeral Home' },
            { label: 'State', value: 'Iowa' },
          ],
        },
      ],
      collapsibles: [
        { id: 'death_cert', title: 'Death certificate', subtitle: 'Certified copy received' },
        { id: 'funeral_home', title: 'Funeral home assignment', subtitle: 'Oak Grove confirmation outstanding' },
      ],
    },
  },
  [PN_DEC]: {
    workflowMeta: {
      caseId: PN_DEC,
      type: 'CLM',
      subtype: 'death_benefit',
      breadcrumb: 'Claim · Preneed death benefit',
      status: 'Pending decision',
      statusClass: 'pending_decision',
      assignee: 'Victor Ramon',
      contextBar: [
        { slot: 1, label: 'Deceased', value: 'James Whitfield', sub: null, valueColor: null },
        { slot: 2, label: 'Policy', value: 'Preneed funeral plan', sub: 'POL-HSL-PN-2014-002287', subType: 'reference_link', valueColor: null },
        { slot: 3, label: 'Payee', value: '$12,500', sub: 'Riverside Memorial Chapel', subType: 'descriptor', valueColor: null },
        { slot: 4, label: 'SLA', value: '28 May 2026', sub: null, valueColor: 'warning' },
      ],
      subwayStages: [
        { order: 1, name: 'FNOL received', slug: 'fnol_received', state: 'done', subLabel: null },
        { order: 2, name: 'Initial triage', slug: 'initial_triage', state: 'done', subLabel: null },
        { order: 3, name: 'Req. gathering', slug: 'req_gathering', state: 'done', subLabel: null },
        { order: 4, name: 'Decision', slug: 'decision', state: 'active', subLabel: 'Ready' },
      ],
      tabs: ['General information', 'Requirements', 'Tasks', 'Documents', 'Communications', 'Relationships', 'Activities'],
      headerActions: [{ label: 'Decision', type: 'primary' }, { label: 'Create task', type: 'secondary', icon: 'plus' }],
    },
    generalInformation: {
      sections: [],
      aiSummary: {
        text: 'James Whitfield preneed claim CLM-PN-2026-0287 is decision-ready. All requirements satisfied including certified death certificate and Riverside Memorial Chapel assignment letter. Recommend full $12,500 payment to funeral home payee per preneed contract. Copy funeral director and Linda Whitfield on decision notice.',
        confidence: 94,
        generatedAt: '2026-05-20',
      },
      cards: [
        {
          id: 'payee_ready',
          title: 'Funeral home payee',
          type: 'key_value_grid',
          layout: '2_col',
          fields: [
            { label: 'Deceased', value: 'James Whitfield' },
            { label: 'Date of death', value: '12 Apr 2026' },
            { label: 'Policy number', value: 'POL-HSL-PN-2014-002287' },
            { label: 'Contract amount', value: '$12,500' },
            { label: 'Funeral home payee', value: 'Riverside Memorial Chapel' },
            { label: 'Assignment status', value: 'Confirmed', valueType: 'pill_success' },
            { label: 'Funeral director', value: 'Thomas Reed' },
            { label: 'Requirements', value: 'All fulfilled', valueType: 'pill_success' },
          ],
        },
      ],
      collapsibles: [
        { id: 'arrangements', title: 'Funeral arrangements', subtitle: 'Riverside Memorial coordinating service' },
        { id: 'payment', title: 'Benefit payment', subtitle: '$12,500 to funeral home' },
      ],
    },
  },
  [NB]: {
    workflowMeta: {
      caseId: NB,
      type: 'NB',
      subtype: 'full_underwriting',
      breadcrumb: 'New business · Full underwriting',
      status: 'Active: Awaiting requirements',
      statusClass: 'awaiting_requirements',
      assignee: 'Victor Ramon',
      contextBar: [
        { slot: 1, label: 'Applicant', value: 'Margaret Chen', sub: null, valueColor: null },
        { slot: 2, label: 'Product', value: 'Preneed funeral plan', sub: '$15,000', subType: 'descriptor', valueColor: null },
        { slot: 3, label: 'Scoring', value: 'Standard · Non-smoker', sub: '+5 pts', subType: 'descriptor', valueColor: null },
        { slot: 4, label: 'SLA', value: '26 May 2026', sub: null, valueColor: 'warning' },
      ],
      subwayStages: [
        { order: 1, name: 'Application', slug: 'application', state: 'done', subLabel: null },
        { order: 2, name: 'Req. gathering', slug: 'req_gathering', state: 'active', subLabel: 'APS overdue' },
        { order: 3, name: 'Underwriting', slug: 'underwriting-review', state: 'next', subLabel: null },
        { order: 4, name: 'Decision', slug: 'decision', state: 'next', subLabel: null },
      ],
      tabs: ['General information', 'Requirements', 'Tasks', 'Documents', 'Communications', 'Relationships', 'Activities'],
      headerActions: [{ label: 'Decision', type: 'primary' }],
    },
    generalInformation: {
      sections: [],
      aiSummary: {
        text: 'Margaret Chen applied for a $15,000 Homesteaders preneed funeral plan through Riverside Memorial Chapel. Health questionnaire and MIB complete. APS from primary care physician overdue — applicant disclosed treated hypertension. AI scoring provisional standard pending medical evidence.',
        confidence: 74,
        generatedAt: '2026-05-18',
      },
      cards: [
        {
          id: 'scoring',
          title: 'Underwriting scoring',
          type: 'scoring',
          layout: 'full',
          factors: [
            { label: 'MIB', value: 'Clear', status: 'success' },
            { label: 'Health questionnaire', value: 'Complete', status: 'success' },
            { label: 'APS', value: 'Overdue', status: 'warning' },
            { label: 'Provisional class', value: 'Standard NT', status: 'neutral' },
          ],
        },
        {
          id: 'applicant',
          title: 'Applicant & funeral home',
          type: 'key_value_grid',
          layout: '2_col',
          fields: [
            { label: 'Applicant', value: 'Margaret Chen' },
            { label: 'Age', value: '63' },
            { label: 'Application', value: 'APP-7721' },
            { label: 'Face amount', value: '$15,000' },
            { label: 'Funeral home', value: 'Riverside Memorial Chapel' },
            { label: 'Channel', value: 'Funeral director sale' },
          ],
        },
      ],
      collapsibles: [
        { id: 'medical', title: 'Medical evidence', subtitle: 'APS outstanding' },
        { id: 'planning', title: 'Preneed planning', subtitle: 'Funeral preferences captured' },
      ],
    },
  },
  [NB_S]: {
    workflowMeta: {
      caseId: NB_S,
      type: 'NB',
      subtype: 'simplified_underwriting',
      breadcrumb: 'New business · Simplified underwriting',
      status: 'Active: Underwriting',
      statusClass: 'underwriting',
      assignee: 'Victor Ramon',
      contextBar: [
        { slot: 1, label: 'Applicant', value: 'Robert Sullivan', sub: null, valueColor: null },
        { slot: 2, label: 'Product', value: 'Preneed funeral plan', sub: '$8,500', subType: 'descriptor', valueColor: null },
        { slot: 3, label: 'Channel', value: 'Funeral home sale', sub: 'Personal Expressions done', subType: 'descriptor', valueColor: null },
        { slot: 4, label: 'SLA', value: '27 May 2026', sub: null, valueColor: null },
      ],
      subwayStages: [
        { order: 1, name: 'Application', slug: 'application', state: 'done', subLabel: null },
        { order: 2, name: 'Personal Expressions', slug: 'personal-expressions', state: 'done', subLabel: null },
        { order: 3, name: 'Underwriting', slug: 'underwriting-review', state: 'active', subLabel: 'Review' },
        { order: 4, name: 'Decision', slug: 'decision', state: 'next', subLabel: null },
      ],
      tabs: ['General information', 'Requirements', 'Tasks', 'Documents', 'Communications', 'Relationships', 'Activities'],
      headerActions: [{ label: 'Decision', type: 'primary' }],
    },
    generalInformation: {
      sections: [],
      aiSummary: {
        text: 'Robert Sullivan — $8,500 preneed plan sold by Riverside Memorial Chapel funeral director. Personal Expressions planning guide completed 14 May. Simplified evidence path: application and health attestation only. Recommend approve standard — no APS required at this face amount.',
        confidence: 88,
        generatedAt: '2026-05-19',
      },
      cards: [
        {
          id: 'simplified_status',
          title: 'Simplified path status',
          type: 'key_value_grid',
          layout: '2_col',
          fields: [
            { label: 'Applicant', value: 'Robert Sullivan' },
            { label: 'Face amount', value: '$8,500' },
            { label: 'Personal Expressions', value: 'Complete', valueType: 'pill_success' },
            { label: 'Funeral director', value: 'Riverside Memorial Chapel' },
            { label: 'Health attestation', value: 'Signed', valueType: 'pill_success' },
            { label: 'MIB', value: 'Clear', valueType: 'pill_success' },
          ],
        },
      ],
      collapsibles: [
        { id: 'expressions', title: 'Personal Expressions guide', subtitle: 'Service preferences documented' },
        { id: 'funeral_home', title: 'Funeral home partner', subtitle: 'Riverside Memorial Chapel' },
      ],
    },
  },
  [NB_G]: {
    workflowMeta: {
      caseId: NB_G,
      type: 'NB',
      subtype: 'guaranteed_underwriting',
      breadcrumb: 'New business · Guaranteed issue',
      status: 'Active: Contract issuance',
      statusClass: 'contract_issuance',
      assignee: 'Victor Ramon',
      contextBar: [
        { slot: 1, label: 'Applicant', value: 'Dorothy Hayes', sub: null, valueColor: null },
        { slot: 2, label: 'Product', value: 'Guaranteed preneed', sub: '$5,000', subType: 'descriptor', valueColor: null },
        { slot: 3, label: 'Eligibility', value: 'Confirmed', sub: 'No health questions', subType: 'descriptor', valueColor: null },
        { slot: 4, label: 'SLA', value: '30 May 2026', sub: null, valueColor: null },
      ],
      subwayStages: [
        { order: 1, name: 'Application', slug: 'application', state: 'done', subLabel: null },
        { order: 2, name: 'Eligibility check', slug: 'eligibility-check', state: 'done', subLabel: null },
        { order: 3, name: 'Contract issuance', slug: 'contract-issuance', state: 'active', subLabel: 'PAD pending' },
        { order: 4, name: 'Policy delivery', slug: 'policy-delivery', state: 'next', subLabel: null },
      ],
      tabs: ['General information', 'Requirements', 'Tasks', 'Documents', 'Communications', 'Relationships', 'Activities'],
      headerActions: [{ label: 'Issue contract', type: 'primary' }],
    },
    generalInformation: {
      sections: [],
      aiSummary: {
        text: 'Dorothy Hayes — $5,000 guaranteed preneed contract through Oak Grove Funeral Home. Age 70 within product band; eligibility confirmed with no health questions. Beneficiary designation complete. PAD authorization received — bank confirmation pending before contract issuance.',
        confidence: 91,
        generatedAt: '2026-05-20',
      },
      cards: [
        {
          id: 'gi_status',
          title: 'Guaranteed issue status',
          type: 'key_value_grid',
          layout: '2_col',
          fields: [
            { label: 'Applicant', value: 'Dorothy Hayes' },
            { label: 'Face amount', value: '$5,000' },
            { label: 'Eligibility', value: 'Confirmed', valueType: 'pill_success' },
            { label: 'Funeral home', value: 'Oak Grove Funeral Home' },
            { label: 'PAD status', value: 'Pending bank confirm', valueType: 'pill_warning' },
            { label: 'Beneficiary', value: 'Designated', valueType: 'pill_success' },
          ],
        },
      ],
      collapsibles: [
        { id: 'pad', title: 'Premium payment (PAD)', subtitle: 'Bank confirmation outstanding' },
        { id: 'contract', title: 'Contract issuance', subtitle: 'Policy delivery next' },
      ],
    },
  },
};
