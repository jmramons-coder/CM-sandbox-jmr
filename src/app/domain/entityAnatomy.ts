import type { WorkObjectKind } from './objectRefs';
import type { WorkflowTabId } from './workflows';

export type EntityAnatomyTab = {
  id: string;
  label: string;
  utilityEntity?: WorkObjectKind;
  defaultEnabled: boolean;
  sections?: EntityAnatomySection[];
};

export type EntityAnatomySection = {
  id: string;
  label: string;
  fields: string[];
  defaultEnabled?: boolean;
  subsections?: EntityAnatomySubsection[];
};

export type EntityAnatomySubsection = {
  id: string;
  label: string;
  fields: string[];
  defaultEnabled?: boolean;
};

export type EntityAnatomyDefinition = {
  kind: WorkObjectKind;
  label: string;
  mainEntity: boolean;
  headerFields: string[];
  identificationFields?: string[];
  tabs: EntityAnatomyTab[];
  overviewSections: EntityAnatomySection[];
  actions: string[];
};

export type CaseTypeAnatomyDefinition = {
  caseKind: string;
  requiredMainEntityLinks: WorkObjectKind[];
  headerFields: string[];
  identificationFields?: string[];
  overviewSections: EntityAnatomySection[];
  tabs: Array<EntityAnatomyTab & { caseTabId?: WorkflowTabId | 'scoring' | 'application' | 'submission' | 'licensing' | 'contracts' | 'activation' }>;
  lifecycleOutputs: Array<'task' | 'requirement' | 'request' | 'document' | 'communication'>;
  actions: string[];
};

export type EffectiveEntityAnatomy = Omit<EntityAnatomyDefinition, 'headerFields' | 'overviewSections' | 'tabs'> & {
  identificationFields: string[];
  tabs: EntityAnatomyTab[];
};

export type EffectiveCaseTypeAnatomy = Omit<CaseTypeAnatomyDefinition, 'headerFields' | 'tabs'> & {
  identificationFields: string[];
  tabs: CaseTypeAnatomyDefinition['tabs'];
};

export function attachOverviewSectionsToOverviewTab<T extends { tabs: EntityAnatomyTab[]; overviewSections: EntityAnatomySection[] }>(definition: T): T {
  return {
    ...definition,
    tabs: definition.tabs.map((tab) =>
      tab.id === 'overview'
        ? { ...tab, sections: tab.sections ?? definition.overviewSections }
        : tab,
    ),
  };
}

const UTILITY_TABS: EntityAnatomyTab[] = [
  { id: 'tasks', label: 'Tasks', utilityEntity: 'task', defaultEnabled: true },
  { id: 'documents', label: 'Documents', utilityEntity: 'document', defaultEnabled: true },
  { id: 'requests', label: 'Requests', utilityEntity: 'request', defaultEnabled: false },
  { id: 'communications', label: 'Communications', utilityEntity: 'communication', defaultEnabled: true },
  { id: 'history', label: 'Activities', utilityEntity: 'event', defaultEnabled: true },
];

export const ENTITY_ANATOMY_DEFINITIONS: EntityAnatomyDefinition[] = [
  {
    kind: 'client',
    label: 'Client',
    mainEntity: true,
    headerFields: ['name', 'type', 'status', 'primaryContact'],
    tabs: [
      { id: 'overview', label: 'Overview', defaultEnabled: true },
      { id: 'policies', label: 'Policies', utilityEntity: 'policy', defaultEnabled: true },
      { id: 'cases', label: 'Claims', utilityEntity: 'case', defaultEnabled: true },
      ...UTILITY_TABS,
    ],
    overviewSections: [
      { id: 'profile', label: 'Profile', fields: ['name', 'dob', 'language', 'market'] },
      { id: 'contact', label: 'Contact', fields: ['email', 'phone', 'address'] },
      { id: 'relationships', label: 'Relationships', fields: ['policies', 'agents', 'cases'] },
    ],
    actions: ['create-task', 'create-request', 'send-message'],
  },
  {
    kind: 'policy',
    label: 'Policy',
    mainEntity: true,
    headerFields: ['policyNumber', 'product', 'status', 'owner', 'servicingAgent'],
    tabs: [
      { id: 'overview', label: 'Overview', defaultEnabled: true },
      { id: 'participants', label: 'Participants', utilityEntity: 'client', defaultEnabled: true },
      { id: 'agents', label: 'Agents', utilityEntity: 'agent', defaultEnabled: true },
      { id: 'coverages', label: 'Coverages', defaultEnabled: true },
      { id: 'cases', label: 'Claims', utilityEntity: 'case', defaultEnabled: true },
      ...UTILITY_TABS,
    ],
    overviewSections: [
      { id: 'identification', label: 'Identification', fields: ['carrier', 'product', 'plan', 'jurisdiction'] },
      { id: 'participants', label: 'Policy participants', fields: ['owner', 'insured', 'beneficiaries', 'payer'] },
      { id: 'premium', label: 'Premium', fields: ['mode', 'paidToDate', 'nextAmount'] },
    ],
    actions: ['create-case', 'create-task', 'create-request', 'send-message'],
  },
  {
    kind: 'case',
    label: 'Case',
    mainEntity: true,
    headerFields: ['caseId', 'caseType', 'status', 'primaryParty', 'policy'],
    tabs: [
      { id: 'overview', label: 'General information', defaultEnabled: true },
      { id: 'requirements', label: 'Requirements', utilityEntity: 'requirement', defaultEnabled: true },
      { id: 'tasks', label: 'Tasks', utilityEntity: 'task', defaultEnabled: true },
      { id: 'documents', label: 'Documents', utilityEntity: 'document', defaultEnabled: true },
      { id: 'communications', label: 'Communications', utilityEntity: 'communication', defaultEnabled: true },
      { id: 'history', label: 'Activities', utilityEntity: 'event', defaultEnabled: true },
    ],
    overviewSections: [
      { id: 'summary', label: 'Summary', fields: ['caseId', 'businessLine', 'status', 'priority'] },
      { id: 'linked-main-entities', label: 'Linked main entities', fields: ['client', 'policy', 'agent'] },
    ],
    actions: ['create-task', 'create-requirement', 'create-document-request', 'send-message'],
  },
  {
    kind: 'agent',
    label: 'Agent',
    mainEntity: true,
    headerFields: ['name', 'status', 'agencyName', 'primaryLicense'],
    tabs: [
      { id: 'overview', label: 'Overview', defaultEnabled: true },
      { id: 'licenses', label: 'Agent licenses', defaultEnabled: true },
      { id: 'eo-policies', label: 'E&O Policies', utilityEntity: 'policy', defaultEnabled: true },
      { id: 'contracts', label: 'Agent contracts', defaultEnabled: true },
      { id: 'policies', label: 'Related policies', utilityEntity: 'policy', defaultEnabled: true },
      { id: 'cases', label: 'Relationships', utilityEntity: 'case', defaultEnabled: true },
      ...UTILITY_TABS,
    ],
    overviewSections: [
      { id: 'identity', label: 'Identity', fields: ['name', 'language', 'status', 'agencyName'] },
      { id: 'timeline', label: 'Timeline', fields: ['hiringDate', 'effectiveDate', 'activationDate', 'terminationDate'] },
      { id: 'contracts', label: 'Contracts and licenses', fields: ['licenses', 'contracts', 'eoPolicies'] },
    ],
    actions: ['create-onboarding-case', 'create-task', 'request-document', 'send-message'],
  },
];

export const CASE_TYPE_ANATOMY_DEFINITIONS: CaseTypeAnatomyDefinition[] = [
  {
    caseKind: 'claim',
    requiredMainEntityLinks: ['client', 'policy'],
    headerFields: ['claimNumber', 'claimant', 'policy', 'status', 'benefit'],
    overviewSections: [
      { id: 'claimant-plan', label: 'Claimant & Plan', fields: ['claimant', 'policy', 'coverage', 'benefit'] },
      { id: 'claim-info', label: 'Claim information', fields: ['dateOfLoss', 'onset', 'cause', 'conditions'] },
    ],
    tabs: [
      { id: 'requirements', label: 'Requirements', utilityEntity: 'requirement', defaultEnabled: true },
      { id: 'decision', label: 'Decision', defaultEnabled: true, caseTabId: 'decision' },
    ],
    lifecycleOutputs: ['task', 'requirement', 'document', 'communication'],
    actions: ['record-decision', 'request-evidence', 'create-task'],
  },
  {
    caseKind: 'new_business',
    requiredMainEntityLinks: ['client', 'policy', 'application', 'agent'],
    headerFields: ['applicant', 'policy', 'product', 'status', 'advisor'],
    overviewSections: [
      { id: 'application-intake', label: 'Application intake', fields: ['applicant', 'advisor', 'policy', 'product'] },
      { id: 'readiness', label: 'Readiness', fields: ['missingItem', 'premiumSource', 'evidenceStatus'] },
    ],
    tabs: [
      { id: 'requirements', label: 'Requirements', utilityEntity: 'requirement', defaultEnabled: true },
      { id: 'scoring', label: 'Scoring', defaultEnabled: false, caseTabId: 'scoring' },
      { id: 'decision', label: 'Decision', defaultEnabled: true, caseTabId: 'decision' },
    ],
    lifecycleOutputs: ['task', 'requirement', 'request', 'document', 'communication'],
    actions: ['validate-application', 'request-clarification', 'review-scoring', 'submit-to-underwriting'],
  },
  {
    caseKind: 'customer_service',
    requiredMainEntityLinks: ['client', 'policy'],
    headerFields: ['customer', 'policy', 'requestType', 'status', 'verification'],
    overviewSections: [
      { id: 'service-request', label: 'Service request', fields: ['customer', 'policy', 'requestType', 'pending'] },
      { id: 'verification', label: 'Verification', fields: ['verification', 'authority', 'nextAction'] },
    ],
    tabs: [
      { id: 'requirements', label: 'Requirements', utilityEntity: 'requirement', defaultEnabled: true },
      { id: 'requests', label: 'Requests', utilityEntity: 'request', defaultEnabled: true },
      { id: 'decision', label: 'Resolution', defaultEnabled: true, caseTabId: 'decision' },
    ],
    lifecycleOutputs: ['task', 'requirement', 'request', 'document', 'communication'],
    actions: ['verify-identity', 'apply-update', 'send-confirmation', 'create-task'],
  },
  {
    caseKind: 'agent_onboarding',
    requiredMainEntityLinks: ['agent'],
    headerFields: ['agent', 'agencyName', 'status', 'activationDate'],
    overviewSections: [
      { id: 'agent-profile', label: 'Agent profile', fields: ['agent', 'agencyName', 'language', 'contact'] },
      { id: 'licensing', label: 'Licensing', fields: ['licenses', 'jurisdictions', 'eoPolicy'] },
      { id: 'contracts', label: 'Contracts', fields: ['contracts', 'effectiveDates', 'carrierAppointments'] },
    ],
    tabs: [
      { id: 'requirements', label: 'Requirements', utilityEntity: 'requirement', defaultEnabled: true },
      { id: 'licensing', label: 'Licensing', defaultEnabled: true, caseTabId: 'licensing' },
      { id: 'contracts', label: 'Contracts', defaultEnabled: true, caseTabId: 'contracts' },
      { id: 'activation', label: 'Activation', defaultEnabled: true, caseTabId: 'activation' },
    ],
    lifecycleOutputs: ['task', 'requirement', 'document', 'communication'],
    actions: ['send-invite', 'create-license-requirements', 'activate-agent'],
  },
];
