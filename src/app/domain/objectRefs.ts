export type WorkObjectKind =
  | 'case'
  | 'client'
  | 'policy'
  | 'agent'
  | 'application'
  | 'requirement'
  | 'task'
  | 'request'
  | 'document'
  | 'communication'
  | 'note'
  | 'event';

export type CaseKind = 'claim' | 'new_business' | 'customer_service' | 'agent_onboarding';

/** Nature of claim when `caseKind === 'claim'` (orthogonal to product / `caseTypeCode`). */
export type ClaimSubType = 'death' | 'disability_benefit' | 'waiver_of_premium' | 'death_benefit' | 'full_underwriting' | 'simplified_underwriting' | 'guaranteed_underwriting';

export type DataMode = 'mock' | 'scenario' | 'local_database' | 'remote_database';

export type DataSourceConnector = 'mock_json' | 'local_indexeddb' | 'rest_api' | 'mcp' | 'database';

export interface ObjectRef {
  kind: WorkObjectKind;
  id: string;
  label?: string;
  href?: string;
  role?: string;
  policyRole?: string;
  summary?: string;
}

export interface ParticipantRef extends ObjectRef {
  kind: 'client';
  role: string;
}

export interface AgentParticipantRef extends ObjectRef {
  kind: 'agent';
  role: string;
}

export type CaseParticipantRef = ParticipantRef | AgentParticipantRef;

export type ObjectRelationshipScope = 'main_entity' | 'utility' | 'audit' | 'derived';

export interface ObjectRelationshipRow {
  id: string;
  source: ObjectRef;
  target: ObjectRef;
  relationship: string;
  scope: ObjectRelationshipScope;
  status?: string;
  effectiveDate?: string;
  expirationDate?: string;
}

export interface CaseFact {
  id: string;
  label: string;
  value: string;
  category?: string;
  sourceObject?: ObjectRef;
  importance?: 'primary' | 'secondary' | 'supporting';
}

export interface CaseSectionField {
  id: string;
  label: string;
  value: string;
  objectRef?: ObjectRef;
  muted?: boolean;
}

export interface CaseSection {
  id: string;
  label: string;
  description?: string;
  defaultOpen?: boolean;
  fields: CaseSectionField[];
}

export interface CaseExternalIdentifier {
  system: string;
  value: string;
  label?: string;
}

export interface CaseIdentification {
  caseId: string;
  caseTypeId: string;
  caseTypeLabel: string;
  status: string;
  statusCode?: string;
  externalIds: CaseExternalIdentifier[];
}

export interface CaseStructuredField {
  id: string;
  label: string;
  value: string;
  type?: 'text' | 'date' | 'currency' | 'reference' | 'status' | 'number';
  source?: ObjectRef;
  enabled?: boolean;
  muted?: boolean;
}

export type CaseWorkflowContextSubType = 'reference_link' | 'descriptor';
export type CaseWorkflowValueColor = 'danger' | 'warning';
export type CaseWorkflowStageState = 'done' | 'active' | 'next';
export type CaseWorkflowStatusClass = 'pending_decision' | 'active' | 'terminated' | 'closed';

export interface CaseWorkflowContextSlot {
  slot: number;
  label: string;
  value: string;
  sub?: string | null;
  subType?: CaseWorkflowContextSubType | null;
  valueColor?: CaseWorkflowValueColor | null;
  rationale?: string;
}

export interface CaseWorkflowSubwayStage {
  order: number;
  name: string;
  slug: string;
  state: CaseWorkflowStageState;
  subLabel?: string | null;
}

export interface CaseHeaderAction {
  label: string;
  type: 'primary' | 'secondary';
  icon?: string | null;
}

export interface CaseWorkflowMeta {
  caseId: string;
  type: 'CD' | 'NB';
  subtype: 'disability_benefit' | 'death_benefit' | 'full_underwriting' | 'simplified_underwriting';
  breadcrumb: string;
  status: string;
  statusClass: CaseWorkflowStatusClass;
  assignee: string;
  contextBar: CaseWorkflowContextSlot[];
  subwayStages: CaseWorkflowSubwayStage[];
  tabs: string[];
  headerActions: CaseHeaderAction[];
}

export interface CaseInformationSubsection {
  id: string;
  label: string;
  enabled?: boolean;
  fields: CaseStructuredField[];
}

export interface CaseInformationSection {
  id: string;
  label: string;
  description?: string;
  enabled?: boolean;
  fields: CaseStructuredField[];
  subsections?: CaseInformationSubsection[];
}

export type CaseGeneralInfoValueType = 'pill_success' | 'pill_warning' | 'pill_info' | 'pill_neutral';
export type CaseGeneralInfoValueHighlight = 'warning' | 'danger';
export type CaseGeneralInfoBadgeType = 'success' | 'warning';

export interface CaseGeneralInformationAiSummary {
  text: string;
  confidence: number;
  generatedAt: string;
}

export interface CaseGeneralInformationField {
  label: string;
  value: string;
  valueType?: CaseGeneralInfoValueType | null;
  valueHighlight?: CaseGeneralInfoValueHighlight | null;
  badge?: string | null;
  badgeType?: CaseGeneralInfoBadgeType | null;
}

export interface CaseGeneralInformationScoringFactor {
  name: string;
  direction: 'debit' | 'credit';
  points: string;
  barPct: number;
}

export interface CaseGeneralInformationStatusTile {
  label: string;
  status: 'pending' | 'complete' | 'flagged';
}

export type CaseGeneralInformationCard =
  | {
      id: string;
      title: string;
      type: 'key_value_grid';
      layout: '2_col' | '4_col';
      fields: CaseGeneralInformationField[];
    }
  | {
      id: string;
      title: string;
      type: 'scoring_bar_chart';
      aiGenerated?: boolean;
      summary: string;
      summaryStatus: 'warning' | 'danger' | 'success';
      note?: string;
      factors: CaseGeneralInformationScoringFactor[];
    }
  | {
      id: string;
      title: string;
      type: 'status_tile_grid';
      layout: '4_col';
      note?: string;
      tiles: CaseGeneralInformationStatusTile[];
    };

export interface CaseGeneralInformationCollapsible {
  id: string;
  title: string;
  subtitle: string;
}

export interface CaseSla {
  dueAt?: string;
  label: string;
  status: 'normal' | 'warning' | 'breached';
}

export interface CaseContextCard {
  primaryPartyRef: ObjectRef;
  planRef?: ObjectRef;
  policyRef?: ObjectRef;
  applicationRef?: ObjectRef;
  headlineMetrics: CaseStructuredField[];
  sla?: CaseSla;
}

export interface CaseWorkflowStepState {
  id: string;
  label: string;
  phaseId?: string;
  status: 'pending' | 'active' | 'completed' | 'blocked';
}

export interface CaseWorkflowState {
  templateId: string;
  phaseId?: string;
  activeStepId?: string;
  steps: CaseWorkflowStepState[];
}

export interface CaseTabConfiguration {
  id: string;
  label: string;
  enabled: boolean;
  utilityEntity?: WorkObjectKind;
}

export interface CaseGeneralInformation {
  sections: CaseInformationSection[];
  aiSummary?: CaseGeneralInformationAiSummary;
  cards?: CaseGeneralInformationCard[];
  collapsibles?: CaseGeneralInformationCollapsible[];
}

export interface ModuleSummary {
  module:
    | 'tasks'
    | 'requirements'
    | 'requests'
    | 'documents'
    | 'communications'
    | 'decisions'
    | 'activity';
  total: number;
  attention?: number;
  completed?: number;
  label?: string;
}

export type UnderwritingScoringItem = {
  id: string;
  label: string;
  category: string;
  points: number;
  direction?: 'debit' | 'credit';
  condition?: string;
  factor?: string;
  confidence?: 'high' | 'medium' | 'low';
  pending?: boolean;
  aiGenerated?: boolean;
  icd?: string;
  severity?: 'Low' | 'Moderate' | 'High';
  code?: string;
  source?: ObjectRef;
  notes?: string;
};

export type UnderwritingScoringEvidence = {
  id: string;
  label: string;
  status: 'green' | 'amber' | 'red';
  issueCount: number;
  linkedDocumentIds?: string[];
  linkedRequirementIds?: string[];
};

export interface UnderwritingScoring {
  caseKey?: string;
  caseId?: string;
  baseScore: number;
  debitTotal: number;
  creditTotal: number;
  netScore: number;
  mappedDecision: string;
  riskClass: string;
  aiNet?: number;
  aiClass?: string;
  humanNet?: number | null;
  humanClass?: string | null;
  pending?: string[];
  offerControls?: { tableRating: string; riskClass: string; uwNotes: string };
  tableRating?: string;
  debits: UnderwritingScoringItem[];
  credits: UnderwritingScoringItem[];
  flatExtras: UnderwritingScoringItem[];
  exclusions: UnderwritingScoringItem[];
  evidence: UnderwritingScoringEvidence[];
  aiComparison?: {
    netScore: number;
    riskClass: string;
    narrative?: string;
  };
  underwriterNotes?: string;
}

export type CaseDecisionOptionTagClass = 'pf' | 'pp' | 'pr' | 'po';
export type CaseDecisionSubmitStyle = 'success' | 'warning' | 'danger' | 'info';

export interface CaseDecisionKeyFact {
  label: string;
  value: string;
}

export interface CaseDecisionWarning {
  text: string;
}

export interface CaseDecisionAiRecommendation {
  text: string;
  confidence: number;
  recommendedOptionId: string;
  _note?: string;
}

export interface CaseDecisionOption {
  id: string;
  title: string;
  description: string;
  tag: string;
  tagCls: CaseDecisionOptionTagClass;
  submitLabel: string;
  submitStyle: CaseDecisionSubmitStyle;
}

export interface CaseDecisionOutcome {
  optionId: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  nextSteps: string[];
}

export interface CaseDecisionFlow {
  caseId: string;
  caseType: string;
  caseSubtype: string;
  title: string;
  subtitle: string;
  steps: string[];
  keyFacts: CaseDecisionKeyFact[];
  aiRecommendation: CaseDecisionAiRecommendation;
  warnings: CaseDecisionWarning[];
  options: CaseDecisionOption[];
  confirmChecks: string[];
  outcomes: Record<string, CaseDecisionOutcome>;
  _note?: string;
  _note_steps?: string;
}

export interface CaseRecord {
  id: string;
  kind: 'case';
  caseKind: CaseKind;
  caseTypeId?: string;
  caseTypeLabel?: string;
  caseSubType?: string;
  sourceCaseNumber?: string;
  caseTypeCode: string;
  workflowTemplateId: string;
  title: string;
  status: string;
  statusCode?: string;
  createdAt?: string;
  priority?: string;
  phaseId?: string;
  activeStepId?: string;
  slaDue?: string;
  slaStatus?: 'ok' | 'warning' | 'breached';
  assignee?: ObjectRef;
  assigneeId?: string;
  assigneeKind?: 'user' | 'team';
  owner?: ObjectRef;
  identification?: CaseIdentification;
  workflowMeta?: CaseWorkflowMeta;
  contextCard?: CaseContextCard;
  workflowState?: CaseWorkflowState;
  tabs?: CaseTabConfiguration[];
  generalInformation?: CaseGeneralInformation;
  decisionFlow?: CaseDecisionFlow;
  primaryParty: ObjectRef;
  participants: CaseParticipantRef[];
  linkedObjects: ObjectRef[];
  moduleSummaries: ModuleSummary[];
  facts: CaseFact[];
  sections: CaseSection[];
  analysis?: {
    confidence?: number;
    recommendation?: string;
    narrative?: string;
    detailedResume?: string[];
    assessmentLabel?: string;
    netAssessmentScore?: number;
    factors?: Array<{ category: string; item: string; score: number; source: string }>;
    trend?: Array<{ week: string; score: number; event?: string }>;
  };
  decision?: {
    state?: 'locked' | 'active' | 'completed';
    recommendation?: {
      decision: string;
      confidence: number;
      attribution: string;
      narrative: string;
      benefitAmount?: string;
      factors?: Array<{ category: string; item: string; score: number; source: string }>;
    };
    headerCallout?: string;
  };
  claimDetails?: {
    claimSubType?: ClaimSubType;
    claimNumber?: string;
    dateOfLoss?: string;
    disabilityOnset?: string;
    cause?: string;
    preExistingConditions?: string;
    claimEndDate?: string;
    paidBenefits?: Array<{ date: string; amount: string }>;
    plannedBenefits?: Array<{ date: string; amount: string }>;
    restorationPlan?: string[];
  };
  underwritingScoring?: UnderwritingScoring;
  applicationFields?: Record<string, unknown>;
}

export type DisplayCurrency = 'GBP' | 'USD';

export interface DataSourceSettings {
  mode: DataMode;
  activeDatasetId: string;
  connector: DataSourceConnector;
  /** Display currency for amounts across the workspace (dataset values are converted at render time). */
  displayCurrency: DisplayCurrency;
  enabledObjectDomains: WorkObjectKind[];
  enabledWorkflows: CaseKind[];
  legacyMockOverlayEnabled: boolean;
  resetBehavior: 'ui_only' | 'dataset' | 'all';
}

export const DEFAULT_DATASET_ID = 'multi-case-demo';

export const DEFAULT_DATA_SOURCE_SETTINGS: DataSourceSettings = {
  mode: 'mock',
  activeDatasetId: DEFAULT_DATASET_ID,
  connector: 'mock_json',
  displayCurrency: 'GBP',
  legacyMockOverlayEnabled: false,
  enabledObjectDomains: [
    'case',
    'client',
    'policy',
    'agent',
    'application',
    'task',
    'requirement',
    'document',
    'request',
  ],
  enabledWorkflows: ['claim', 'new_business'],
  resetBehavior: 'ui_only',
};

export function createObjectRef(ref: ObjectRef): ObjectRef {
  return {
    ...ref,
    label: ref.label ?? ref.id,
  };
}

export function resolveObjectLabel(ref: ObjectRef | undefined | null): string {
  if (!ref) return '';
  return ref.label || ref.id;
}

export function resolveCaseLocation(caseId: string, options: { tab?: string; objectId?: string } = {}): string {
  const params = new URLSearchParams();
  if (options.tab) params.set('tab', options.tab);
  if (options.objectId) params.set('object', options.objectId);
  const query = params.toString();
  return query ? `/cases/${encodeURIComponent(caseId)}?${query}` : `/cases/${encodeURIComponent(caseId)}`;
}

export function resolveObjectLocation(ref: ObjectRef): string | undefined {
  if (ref.href) return ref.href;
  switch (ref.kind) {
    case 'case':
      return resolveCaseLocation(ref.id);
    case 'task':
      return `/tasks?object=${encodeURIComponent(ref.id)}`;
    case 'request':
      return `/requests#request=${encodeURIComponent(ref.id)}`;
    case 'document':
      return `/documents?object=${encodeURIComponent(ref.id)}`;
    case 'client':
    case 'policy':
    case 'agent':
    case 'application':
      return `/folders/${encodeURIComponent(ref.id)}`;
    case 'event':
      return `/cases?event=${encodeURIComponent(ref.id)}`;
    case 'note':
      return `/cases?note=${encodeURIComponent(ref.id)}`;
    default:
      return undefined;
  }
}

export function resolvePrimaryPartyLabel(caseRecord: Pick<CaseRecord, 'primaryParty'>): string {
  return resolveObjectLabel(caseRecord.primaryParty);
}
