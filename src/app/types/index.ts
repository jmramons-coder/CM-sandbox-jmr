/**
 * Shared Type Definitions - Amplify Case Management
 */
import type {
  CaseFact,
  CaseDecisionFlow,
  CaseDecisionOutcome,
  CaseWorkflowMeta,
  CaseContextCard,
  CaseGeneralInformation,
  CaseIdentification,
  CaseKind,
  ClaimSubType,
  CaseSection,
  CaseTabConfiguration,
  CaseWorkflowState,
  ModuleSummary,
  ObjectRef,
  ParticipantRef,
  UnderwritingScoring,
} from '../domain/objectRefs';

export type {
  CaseFact,
  CaseDecisionFlow,
  CaseDecisionOutcome,
  CaseWorkflowMeta,
  CaseContextCard,
  CaseGeneralInformation,
  CaseIdentification,
  CaseKind,
  CaseRecord,
  ClaimSubType,
  CaseSection,
  CaseSectionField,
  CaseTabConfiguration,
  CaseWorkflowState,
  DataMode,
  DataSourceConnector,
  DataSourceSettings,
  ModuleSummary,
  ObjectRef,
  ParticipantRef,
  UnderwritingScoring,
  WorkObjectKind,
} from '../domain/objectRefs';

// Task Priority Levels
export type TaskPriority = 'URGENT' | 'HIGH' | 'NORMAL';

// Task Status Types
export type TaskStatus =
  | 'Open'
  | 'To Do'
  | 'In Queue'
  | 'In Progress'
  | 'Saved'
  | 'Pending Approval'
  | 'Escalated'
  | 'Complete'
  | 'Completed'
  | 'Cancelled';

// SLA Status Indicators
export type SLAStatus = 'danger' | 'warning' | 'normal';

// Lozenge Tag Types
export type LozengeType = 'Success' | 'Warning' | 'Alert' | 'Neutral' | 'Discovery' | 'Informative';

// Sort Direction
export type SortDirection = 'asc' | 'desc';

// View Modes
export type ViewMode = 'card' | 'table';

/** Task module list layouts (table + kanban board). */
export type TaskViewMode = 'kanban' | 'table';

// Tab Types
export type TabType = 'all' | 'claims' | 'new_business';
export type TaskTabType = 'all_tasks' | 'my_tasks' | 'team_tasks';
export type TaskQueue = 'my_tasks' | 'team_tasks';
export type TaskLinkedObjectKind =
  | 'case'
  | 'client'
  | 'agent'
  | 'policy'
  | 'application'
  | 'requirement'
  | 'task'
  | 'request'
  | 'document'
  | 'communication';

export interface TaskLinkedObject {
  kind: TaskLinkedObjectKind;
  id: string;
  label: string;
  href?: string;
}

export interface TaskPanelContext {
  summaryStatus?: string;
  contextTitle?: string;
  contextSummary?: string;
  suggestions?: string[];
  evidenceDocumentId?: string;
  scoringContext?: {
    caseId: string;
    netScore: number;
    mappedDecision: string;
    riskClass: string;
    suggestedAction?: string;
  };
}

export type TaskAlertType = 'overdue' | 'blocking' | 'warning' | 'info';

export interface TaskAlert {
  type: TaskAlertType;
  message: string;
}

export interface TaskSummaryBlock {
  contextLabel: string;
  title: string;
  description: string;
  checklist: string[];
}

export interface TaskAiNarrative {
  text: string;
  confidence: number;
  generatedBy?: string;
  generatedAt?: string;
  status?: string;
}

export interface TaskEvidenceDocument {
  id: string;
  name?: string;
  size?: string;
  category?: string;
  aiSummary?: string;
  followUps?: number;
}

export type TaskContextCardType =
  | 'step_readiness'
  | 'person_card'
  | 'policy_card'
  | 'requirement_card'
  | 'scoring_factors'
  | 'claim_snapshot'
  | 'application_snapshot'
  | 'questionnaire_card';

export interface TaskContextCard {
  type: TaskContextCardType;
  contextLabel?: string;
  title?: string;
  stageLabel?: string;
  description?: string;
  claimId?: string;
  applicationId?: string;
  requirementId?: string;
  name?: string;
  category?: string;
  status?: string;
  dueDate?: string;
  policyNumber?: string;
  product?: string;
  summary?: string;
  interviewDate?: string;
  interviewTime?: string;
  actionBtn?: string;
  badge?: string;
  badgeStatus?: string;
  stats?: Record<string, string>;
  kv?: Array<{ label: string; value: string }>;
  listItems?: Array<{ title: string; detail?: string }>;
  factors?: Array<{ name: string; direction: string; pct?: number }>;
  sections?: Array<{ name: string; status: string }>;
}

export type TaskActionType =
  | 'complete'
  | 'complete_return'
  | 'complete_make_owner'
  | 'send_approver'
  | 'add_requirement';

export interface TaskPanelAction {
  type: TaskActionType;
  label: string;
  isPrimary?: boolean;
}

// Task Interface
export interface Task {
  id: string;
  taskId?: string;
  priority: TaskPriority;
  caseType: string;
  caseSubtype?: string;
  taskType: string;
  hasAI: boolean;
  aiSummary?: string;
  aiAction?: string;
  alert?: TaskAlert | null;
  summary?: TaskSummaryBlock;
  aiNarrative?: TaskAiNarrative | null;
  evidenceDocuments?: TaskEvidenceDocument[];
  contextCards?: TaskContextCard[];
  actions?: TaskPanelAction[];
  claimantName: string;
  claimantPolicyRole?: string;
  product: string;
  slaRemaining: string;
  dueDate?: string;
  stage?: string;
  aiGenerated?: boolean;
  aiConfidence?: number;
  slaStatus: SLAStatus;
  status: TaskStatus;
  assignedTo: string;
  assigneeId?: string;
  assigneeKind?: 'user' | 'team';
  origin: string;
  sourceContext?: string;
  createdFrom?: ObjectRef;
  createdDate: string;
  description?: string;
  queue: TaskQueue;
  teamOrigin?: string;
  pickedUpBy?: string;
  pickedUpAt?: string;
  requiredAuthorityLevel: number;
  caseId?: string;
  primaryPartyName?: string;
  primaryPartyLabel?: string;
  linkedObjects?: TaskLinkedObject[];
  objectRefs?: ObjectRef[];
  panelContext?: TaskPanelContext;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

export interface TeamMember {
  name: string;
  authorityLevel: number;
  isManager: boolean;
}

// Filter Options
export interface FilterOptions {
  priority: string;
  dueDate: string;
  slaStatus: string;
}

// Sortable Column Keys
export type SortableColumn = 
  | 'taskId'
  | 'priority'
  | 'caseType'
  | 'taskType'
  | 'claimantName'
  | 'product'
  | 'slaRemaining'
  | 'status'
  | 'assignedTo'
  | 'origin'
  | 'createdDate'
  | 'caseId';

// Case domain types
export type CaseRAGStatus = 'Green' | 'Amber' | 'Red';
export type CasePriority = 'Urgent' | 'High' | 'Normal';
export type CaseAIRecommendation = 'Approve' | 'Pending' | 'Close' | 'Monitor';
export type CasePhase = 'pre-approval' | 'post-approval';
export type DecisionType = 'approve' | 'decline' | 'modified_offer' | 'request_info' | 'close_case';
export type RiskClass = 'standard' | 'substandard' | 'preferred';
export type DecisionTabState = 'locked' | 'active' | 'completed';

export interface AIDecisionRecommendation {
  decision: string;
  confidence: number;
  attribution: string;
  narrative: string;
  factors: AssessmentFactor[];
  benefitAmount: string;
}

export interface ModifiedOfferTerms {
  modifiedBenefit: string;
  benefitPeriod: string;
  exclusions: string;
  additionalConditions: string;
}

export interface HumanDecision {
  decisionType: DecisionType;
  decisionOptionId?: string;
  decisionTitle?: string;
  decisionOutcome?: CaseDecisionOutcome;
  riskClass?: RiskClass;
  reasonCodes: string[];
  notes: string;
  recordedBy: string;
  recordedAt: string;
  modifiedTerms?: ModifiedOfferTerms;
  declineRationale?: string;
}

export interface CaseSummary {
  id: string;
  caseKind?: CaseKind;
  caseTypeCode?: string;
  /** When `caseKind === 'claim'`: death vs disability benefit (and future variants). */
  claimSubType?: ClaimSubType;
  workflowTemplateId?: string;
  title?: string;
  claimant: string;
  primaryPartyName?: string;
  primaryPartyLabel?: string;
  primaryPartyPolicyRole?: string;
  product: string;
  benefit: string;
  status: string;
  phase: CasePhase;
  rag: CaseRAGStatus;
  aiRecommendation: CaseAIRecommendation;
  aiSummary: string;
  priority: CasePriority;
  sla: string;
  created: string;
  policyNumber?: string;
  linkedObjects?: ObjectRef[];
}

export type RequirementStatus =
  | 'Pending'
  | 'Overdue'
  | 'Fulfilled'
  | 'Waived'
  | 'Completed'
  | 'Ordered'
  | 'In Queue'
  | 'fulfilled'
  | 'overdue'
  | 'in_review'
  | 'scheduled'
  | 'not_started'
  | 'pending';

export type RequirementSourceType = 'system' | 'medical' | 'external';
export type RequirementBlockingSeverity = 'high' | 'medium' | 'low';
export type RequirementContextType = 'claim' | 'policy' | 'person' | 'application';
export type RequirementHistoryDot = 'green' | 'amber' | 'blue';

export interface RequirementBlockingImpact {
  stage: string;
  impact: string;
  severity: RequirementBlockingSeverity;
}

export interface RequirementContext {
  type: RequirementContextType;
  label: string;
  description: string;
  kv: Array<{ label: string; value: string }>;
}

export interface RequirementHistoryEvent {
  date: string;
  action: string;
  user: string;
  dot: RequirementHistoryDot;
}

export interface CaseRequirement {
  id: number | string;
  datasetRequirementId?: string;
  name: string;
  category: string;
  rag?: CaseRAGStatus;
  status: RequirementStatus;
  stage?: string;
  dueDate: string;
  followUpDate: string;
  source: string;
  sourceType?: RequirementSourceType;
  responsibleParty?: string;
  trigger: string;
  requiresAcknowledgement?: boolean;
  phase?: 'pre-approval' | 'post-approval';
  /** Deep link to this requirement in OIPA when different from the default pattern. */
  oipaUrl?: string;
  notes?: string;
  aiSummary?: string;
  fulfillmentCriteria?: string[];
  linkedDocs?: string[];
  linkedTasks?: string[];
  blockingImpact?: RequirementBlockingImpact | null;
  context?: RequirementContext;
  history?: RequirementHistoryEvent[];
  objectRefs?: ObjectRef[];
  workflowStepId?: string;
  aiInsight?: boolean;
  aiConfidence?: number;
}

export interface CaseBenefitRow {
  date: string;
  amount: string;
}

export interface AssessmentFactor {
  category: string;
  item: string;
  score: number;
  source: string;
}

export interface CaseOverview {
  id: string;
  caseKind?: CaseKind;
  caseTypeCode?: string;
  claimSubType?: ClaimSubType;
  workflowTemplateId?: string;
  title?: string;
  primaryParty?: ObjectRef;
  primaryPartyName?: string;
  primaryPartyLabel?: string;
  primaryPartyPolicyRole?: string;
  participants?: ParticipantRef[];
  linkedObjects?: ObjectRef[];
  moduleSummaries?: ModuleSummary[];
  facts?: CaseFact[];
  sections?: CaseSection[];
  identification?: CaseIdentification;
  workflowMeta?: CaseWorkflowMeta;
  contextCard?: CaseContextCard;
  workflowState?: CaseWorkflowState;
  tabs?: CaseTabConfiguration[];
  generalInformation?: CaseGeneralInformation;
  underwritingScoring?: UnderwritingScoring;
  decisionFlow?: CaseDecisionFlow;
  claimantName: string;
  claimantProfile: {
    gender: string;
    dob: string;
    smoker: string;
    location: string;
    email: string;
    phone: string;
  };
  productName: string;
  policyNumber: string;
  productType: string;
  monthlyBenefit: string;
  caseStatus: string;
  caseTypeLabel: string;
  lineOfBusiness: string;
  phase: CasePhase;
  preApprovalStages: string[];
  postApprovalStages: string[];
  stageLabels: string[];
  activeStage: number;
  decisionTabState: DecisionTabState;
  aiDecisionRecommendation?: AIDecisionRecommendation;
  humanDecision?: HumanDecision;
  headerCallout?: string;
  aiPlanStatus?: 'not_generated' | 'in_progress' | 'complete';
  aiPlanProgress?: { fulfilled: number; total: number };
  aiConfidence: number;
  aiNarrative: string;
  aiRecommendation: CaseAIRecommendation;
  aiDetailedResume: string[];
  assessmentFactors: AssessmentFactor[];
  assessmentLabel: string;
  netAssessmentScore: number;
  claimNumber: string;
  dateOfLoss: string;
  disabilityOnset: string;
  cause: string;
  preExistingConditions: string;
  claimEndDate: string;
  paidBenefits: CaseBenefitRow[];
  plannedBenefits: CaseBenefitRow[];
  assessmentTrend: Array<{ week: string; score: number; event?: string }>;
  restorationPlan: string[];
  requirements: CaseRequirement[];
}

export interface CaseNavItem {
  caseId: string;
  claimant: string;
  title?: string;
  caseKind?: CaseKind;
  primaryPartyName?: string;
  primaryPartyLabel?: string;
  status?: string;
  alertCount?: number;
  rag: CaseRAGStatus;
}

// Folder domain types
export interface SubCaseSummary {
  id: string;
  label: string;
  phase: CasePhase;
  status: string;
  rag: CaseRAGStatus;
  activeStage: number;
  owner: string;
}

/**
 * High-level folder type used by the type filter on /folders. Existing IP
 * claim folders use 'case'; new entity folders use the entity type slug
 * (policy, agent, client, application, lead, contributor, …).
 */
export type FolderTypeCode =
  | 'case'
  | 'policy'
  | 'application'
  | 'lead'
  | 'client'
  | 'agent'
  | 'contributor'
  | 'carrier'
  | 'commission';

export interface FolderSummary {
  id: string;
  /**
   * Discriminator: 'ip' = the original IP claim folder with sub-cases / phases;
   * 'entity' = the new generic entity folder model (Policy, Application, etc.)
   * driven by mock-entity-folders. Defaults to 'ip' when omitted for back-compat.
   */
  kind?: 'ip' | 'entity';
  /** High-level type for the /folders type filter. Defaults to 'case' when omitted. */
  folderType?: FolderTypeCode;
  claimant: string;
  product: string;
  benefit: string;
  status: string;
  rag: CaseRAGStatus;
  created: string;
  subCases: SubCaseSummary[];
}

export interface FolderNavItem {
  folderId: string;
  claimant: string;
  rag: CaseRAGStatus;
  subCases: { id: string; label: string }[];
}

// Document domain types
export type DocumentStatus = 'Validated' | 'Pending Review' | 'Rejected' | 'Processing';

export interface CaseDocument {
  id: string;
  name: string;
  category: string;
  status: DocumentStatus;
  stage?: string;
  uploaded: string;
  source: string;
  insight?: string;
  aiInsight?: boolean;
  aiConfidence?: number;
  aiSummary: string;
  aiAction?: string;
  linkedRequirement: string;
  linkedRequirementId?: string;
  linkedCase: string;
  caseId?: string;
  filename?: string;
  uploadedAt?: string | null;
  claimant?: string;
  reqContext?: string;
  insights?: Array<{
    anchor: string;
    title: string;
    body: string;
    confidence: 'High' | 'Medium' | 'Low';
  }>;
  followUps?: number;
  claimantName: string;
  primaryPartyName?: string;
  primaryPartyLabel?: string;
  objectRefs?: ObjectRef[];
  facts?: CaseFact[];
  fileSize: string;
  fileType?: string;
  fileAvailable?: boolean;
  fileUrl?: string;
  placeholderReason?: string;
  scoringContext?: {
    caseId: string;
    evidenceId?: string;
    netScore: number;
    mappedDecision: string;
    suggestedAdjustments?: string[];
  };
}

export type DocSortableColumn =
  | 'name' | 'category' | 'status'
  | 'uploaded' | 'source' | 'caseId';

export type DocTabType = 'all' | 'medical' | 'legal' | 'financial';

// Request domain types
export type RequestStatus = 'New' | 'In Review' | 'In progress' | 'Awaiting info' | 'Pending Info' | 'Completed' | 'Cancelled' | 'Rejected';
export type RequestPriority = 'Urgent' | 'High' | 'Normal' | 'Low';
export type RequestCategory = 'Claims' | 'New business' | 'Changes' | 'Completed' | 'Address Change' | 'New Business' | 'Beneficiary Change' | 'Payment' | 'Evidence' | 'General';

/**
 * Channel a request was received through. Drives the icon/copy used in the
 * "System initiated steps" header so reps can immediately see whether the
 * intake was self-serve, written, or verbal.
 */
export type RequestSourceChannel = 'client_portal' | 'email' | 'phone' | 'Claimant portal' | 'Broker portal' | 'SBLI broker portal' | 'SBLI.com' | 'Mail' | 'Fax' | 'Agent portal';

export type RequestSystemStepStatus =
  | 'completed'
  | 'in_progress'
  | 'awaiting_review'
  | 'queued'
  | 'blocked';

export type RequestSystemStepKind =
  | 'review_required'
  | 'create_task'
  | 'create_case'
  | 'link_policy'
  | 'follow_up_client'
  | 'await_acceptance'
  | 'start_claim'
  | 'auto_reject';

export interface RequestSystemStepLink {
  label: string;
  href?: string;
  hint?: string;
}

export interface RequestSystemStep {
  id: string;
  kind: RequestSystemStepKind;
  status: RequestSystemStepStatus;
  title: string;
  description?: string;
  linkedTo?: RequestSystemStepLink;
}

export type RequestActorType = 'AI Agent' | 'System' | 'Human';
export type RequestTimelineDotClass = 'rp-tl-dot-ai' | 'rp-tl-dot-system' | 'rp-tl-dot-human' | 'rp-tl-dot-success' | 'rp-tl-dot-warn';

export interface RequestTimelineAction {
  ts: string;
  actor: string;
  actorType: RequestActorType;
  icon: string;
  dotCls: RequestTimelineDotClass;
  action: string;
  detail: string;
}

export interface RequestSubmittedForm {
  submitted: string;
  channel: string;
  formType: string;
  formVersion: string;
  fields: Array<{ label: string; value: string }>;
}

export interface RequestLinkedCase {
  id: string;
  label: string;
  status: string;
  stage: string;
  statusCls: string;
}

export interface ServiceRequest {
  id: string;
  title: string;
  subtype?: string;
  name?: string;
  category: RequestCategory;
  status: RequestStatus;
  statusCls?: string;
  priority: RequestPriority;
  received: string;
  receivedFull?: string;
  receivedTime?: string;
  source: string;
  channel?: string;
  /** Strict intake channel used by the System initiated steps header. */
  sourceChannel: RequestSourceChannel;
  /** Free-form details about the channel (sender email, caller name, advisor). */
  sourceDetail?: string;
  requester: string;
  requesterRole?: string;
  requesterInitials?: string;
  caseId?: string;
  caseKey?: string;
  clientId?: string;
  policyNumber?: string;
  primaryPartyName?: string;
  primaryPartyLabel?: string;
  objectRefs?: ObjectRef[];
  assignedTo: string;
  assigneeId?: string;
  assigneeKind?: 'user' | 'team';
  due: string;
  notes?: string;
  templateId?: string;
  requestMode?: string;
  aiSummary: string;
  summary?: string;
  nextAction: string;
  form?: RequestSubmittedForm;
  aiActions?: RequestTimelineAction[];
  humanActions?: RequestTimelineAction[];
  linkedCase?: RequestLinkedCase;
  linkedTasks?: string[];
  linkedReqs?: string[];
  linkedObjects: TaskLinkedObject[];
  /** Automated steps the platform queued/executed when the request was received. */
  systemSteps: RequestSystemStep[];
}

export type RequestSortableColumn =
  | 'id'
  | 'title'
  | 'category'
  | 'status'
  | 'priority'
  | 'received'
  | 'requester'
  | 'caseId';

export type RequestTabType = 'all' | 'claims' | 'new_business';
