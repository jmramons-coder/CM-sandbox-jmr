import type { CaseKind, CaseRecord, ObjectRef, WorkObjectKind, DisplayCurrency } from '../domain/objectRefs';
import { GUARDIAN_DATASET } from './guardian-dataset';
import { EMPIRE_DATASET } from './empire-dataset';
import { SBLI_DATASET } from './sbli-dataset';
import type {
  PlatformUserRole,
  PlatformUserStatus,
  TrainingRecord,
} from '../domain/access/platformUser';
import type {
  RequestCategory,
  RequestLinkedCase,
  RequestPriority,
  RequestSourceChannel,
  RequestSubmittedForm,
  RequestSystemStep,
  RequestTimelineAction,
  RequirementBlockingImpact,
  RequirementContext,
  RequirementHistoryEvent,
  RequirementSourceType,
  TaskActionType,
  TaskAiNarrative,
  TaskAlert,
  TaskContextCard,
  TaskEvidenceDocument,
  TaskExecutionMode,
  TaskPanelContext,
  TaskQueue,
  TaskReviewPayload,
  TaskSummaryBlock,
  SLAStatus,
} from '../types';

export interface ClientRecord {
  id: string;
  kind: 'client';
  name: string;
  type: 'person' | 'organization';
  status?: 'active' | 'inactive' | 'pending';
  category?: 'policyholder' | 'dependent' | 'relatedParty' | 'organization';
  language?: string;
  taxId?: string;
  summary?: string;
  profile?: {
    gender?: string;
    dob?: string;
    age?: number;
    smoker?: string;
    location?: string;
    email?: string;
    phone?: string;
    address?: string;
    parish?: string;
  };
  linkedObjects?: ObjectRef[];
}

export interface PolicyRecord {
  id: string;
  kind: 'policy';
  label: string;
  status: string;
  product: string;
  policyNumber?: string;
  productType?: string;
  monthlyBenefit?: string;
  coverageAmount?: string;
  effectiveDate?: string;
  issueDate?: string;
  clientId?: string;
  participants: PolicyParticipantRef[];
  agents: ObjectRef[];
  linkedObjects: ObjectRef[];
}

export type PolicyParticipantRole = 'owner' | 'insured' | 'beneficiary' | 'payer' | 'authorized_contact';

export interface PolicyParticipantRef {
  clientId: string;
  role: PolicyParticipantRole;
  effectiveDate?: string;
  allocationPct?: number;
}

export interface AgentLicense {
  id: string;
  jurisdiction: string;
  status: 'active' | 'pending' | 'expired';
  effectiveDate?: string;
}

export interface AgentContract {
  id: string;
  carrier: string;
  status: 'draft' | 'active' | 'terminated';
  effectiveDate?: string;
}

export interface PlatformUserRecord {
  id: string;
  kind: 'user';
  name: string;
  initials: string;
  email: string;
  role: PlatformUserRole;
  status: PlatformUserStatus;
  band: number;
  maxAuthority: number | null;
  teamIds: string[];
  teamLabels: string[];
  managerId?: string;
  maxConcurrentTasks: number;
  training: TrainingRecord[];
}

export interface AgentRecord {
  id: string;
  kind: 'agent';
  name: string;
  status: 'onboarding' | 'active' | 'inactive' | 'terminated';
  producerCode?: string;
  agencyName?: string;
  email?: string;
  phone?: string;
  jurisdictionSummary?: string;
  licenses: AgentLicense[];
  contracts: AgentContract[];
  linkedObjects: ObjectRef[];
}

export interface ApplicationRecord {
  id: string;
  kind: 'application';
  label: string;
  status: string;
  product: string;
  clientId: string;
  /** Submission date shown in creation/search flows. */
  submitted?: string;
}

export interface CommunicationRecord {
  id: string;
  kind: 'communication';
  channel: 'email' | 'portal' | 'phone' | 'sms' | 'fax' | 'mail' | 'letter' | 'internal_note';
  direction: 'inbound' | 'outbound' | 'internal';
  subject: string;
  status: 'draft' | 'sent' | 'received' | 'failed' | 'archived';
  createdAt?: string;
  stage?: string;
  contact?: string;
  assignee?: string;
  linkedObjects: ObjectRef[];
}

export interface NoteRecord {
  id: string;
  kind: 'note';
  body: string;
  author: string;
  createdAt: string;
  visibility: 'internal' | 'shared' | 'system';
  linkedObjects: ObjectRef[];
}

export interface DocumentEvidenceRecord {
  id: string;
  kind: 'document_evidence';
  documentId: string;
  title: string;
  summary: string;
  pages: Array<{ number: number; image?: string; label: string }>;
  findings: Array<{
    id: string;
    severity: 'Low' | 'Medium' | 'High';
    title: string;
    quote?: string;
    reasoning: string;
    impact: string;
  }>;
  linkedObjects: ObjectRef[];
}

export interface DatasetTaskRecord {
  id: string;
  kind: 'task';
  taskId?: string;
  label: string;
  status: string;
  priority: string;
  assignee: string;
  assigneeId?: string;
  assigneeKind?: 'user' | 'team';
  owner?: string;
  caseType?: string;
  caseSubtype?: string;
  hasAI?: boolean;
  aiSummary?: string;
  aiAction?: string;
  alert?: TaskAlert | null;
  summary?: TaskSummaryBlock;
  aiNarrative?: TaskAiNarrative | null;
  evidenceDocuments?: TaskEvidenceDocument[];
  contextCards?: TaskContextCard[];
  actions?: Array<{ type: TaskActionType; label: string; isPrimary?: boolean }>;
  product?: string;
  slaRemaining?: string;
  slaStatus?: SLAStatus;
  origin?: string;
  sourceContext?: string;
  createdFrom?: ObjectRef;
  createdDate?: string;
  dueDate?: string;
  stage?: string;
  aiGenerated?: boolean;
  aiConfidence?: number;
  description?: string;
  queue?: TaskQueue;
  teamOrigin?: string;
  requiredAuthorityLevel?: number;
  panelContext?: TaskPanelContext;
  scoringContext?: {
    caseId: string;
    netScore: number;
    mappedDecision: string;
    riskClass: string;
    suggestedAction?: string;
  };
  executionMode?: TaskExecutionMode;
  review?: TaskReviewPayload;
  linkedObjects: ObjectRef[];
}

export interface DatasetRequirementRecord {
  id: string;
  kind: 'requirement';
  label: string;
  category: string;
  status: string;
  stage?: string;
  rag?: 'Green' | 'Amber' | 'Red';
  dueDate?: string;
  followUpDate?: string;
  source?: string;
  sourceType?: RequirementSourceType;
  responsibleParty?: string;
  notes?: string;
  aiSummary?: string;
  fulfillmentCriteria?: string[];
  linkedDocs?: string[];
  linkedTasks?: string[];
  blockingImpact?: RequirementBlockingImpact | null;
  context?: RequirementContext;
  history?: RequirementHistoryEvent[];
  trigger?: string;
  requirementRef?: string;
  phase?: string;
  workflowStepId?: string;
  aiInsight?: boolean;
  aiConfidence?: number;
  aiGenerated?: boolean;
  linkedObjects: ObjectRef[];
}

export interface DatasetDocumentRecord {
  id: string;
  kind: 'document';
  label: string;
  filename?: string;
  category: string;
  status: string;
  stage?: string;
  uploaded?: string;
  uploadedAt?: string | null;
  source?: string;
  claimant?: string;
  reqContext?: string;
  tableDescription?: string;
  insights?: Array<{
    anchor: string;
    title: string;
    body: string;
    confidence: 'High' | 'Medium' | 'Low';
  }>;
  followUps?: number;
  insight?: string;
  aiInsight?: boolean;
  aiConfidence?: number;
  aiSummary?: string;
  aiAction?: string;
  linkedRequirement?: string;
  linkedRequirementId?: string;
  linkedCase?: string;
  linkedCaseId?: string;
  fileSize?: string;
  fileType?: string;
  fileAvailable: boolean;
  fileUrl?: string;
  placeholderReason?: string;
  scoringContext?: {
    caseId: string;
    evidenceId?: string;
    netScore: number;
    mappedDecision: string;
    suggestedAdjustments?: string[];
  };
  linkedObjects: ObjectRef[];
}

export interface DatasetRequestRecord {
  id: string;
  kind: 'request';
  label: string;
  status: string;
  source: string;
  caseId?: string;
  caseKey?: string;
  subtype?: string;
  name?: string;
  requesterRole?: string;
  requesterInitials?: string;
  channel?: string;
  receivedFull?: string;
  receivedTime?: string;
  statusCls?: string;
  assignee?: string;
  summary?: string;
  form?: RequestSubmittedForm;
  aiActions?: RequestTimelineAction[];
  humanActions?: RequestTimelineAction[];
  linkedCase?: RequestLinkedCase;
  linkedTasks?: string[];
  linkedReqs?: string[];
  category?: RequestCategory;
  priority?: RequestPriority;
  received?: string;
  sourceChannel?: RequestSourceChannel;
  sourceDetail?: string;
  requester?: string;
  clientId?: string;
  policyNumber?: string;
  assignedTo?: string;
  assigneeId?: string;
  assigneeKind?: 'user' | 'team';
  due?: string;
  notes?: string;
  templateId?: string;
  requestMode?: string;
  aiSummary?: string;
  nextAction?: string;
  systemSteps?: RequestSystemStep[];
  linkedObjects: ObjectRef[];
}

export interface ActivityEventRecord {
  id: string;
  kind: 'event';
  label: string;
  actor: 'user' | 'system' | 'ai' | 'integration';
  timestamp: string;
  stage?: string;
  detail?: string;
  user?: string;
  linkedObjects: ObjectRef[];
}

export interface DemoAssistantResponse {
  id: string;
  workflowTemplateId: string;
  prompt: string;
  response: string;
  linkedObjects: ObjectRef[];
}

export type AiActionStatus = 'suggested' | 'in_progress' | 'completed' | 'accepted' | 'rejected' | 'failed' | 'superseded';

export type AiActionSourceSurface =
  | 'case'
  | 'task'
  | 'document'
  | 'request'
  | 'requirement'
  | 'copilot'
  | 'scoring'
  | 'entity';

export interface AiActionRecord {
  id: string;
  kind: 'ai_action';
  status: AiActionStatus;
  actionType: string;
  title: string;
  summary: string;
  rationale?: string;
  confidence?: number;
  createdAt: string;
  updatedAt?: string;
  actor: 'ai' | 'system' | 'integration';
  sourceSurface: AiActionSourceSurface;
  workflowTemplateId?: string;
  linkedObjects: ObjectRef[];
  steps?: Array<{ id: string; label: string; status: string; completedAt?: string }>;
  relatedAssistantResponseId?: string;
  relatedActivityEventId?: string;
  payload?: Record<string, unknown>;
}

export interface SystemDataset {
  id: string;
  schemaVersion?: number;
  label: string;
  description: string;
  organizationLabel?: string;
  environmentFit?: string;
  enabledBusinessLines?: CaseKind[];
  generationProfileId?: string;
  targetRecordCount?: number;
  documentMode?: 'metadata_only' | 'sample_files' | 'imported_files';
  /** Display currency for this environment (amounts convert at render time). */
  displayCurrency?: DisplayCurrency;
  objectDomains: WorkObjectKind[];
  cases: CaseRecord[];
  clients: ClientRecord[];
  policies: PolicyRecord[];
  agents: AgentRecord[];
  /** Platform users (assessors, managers) — roster for assignees, Team module, and workload. */
  users?: PlatformUserRecord[];
  applications: ApplicationRecord[];
  tasks: DatasetTaskRecord[];
  requirements: DatasetRequirementRecord[];
  documents: DatasetDocumentRecord[];
  requests: DatasetRequestRecord[];
  communications: CommunicationRecord[];
  notes: NoteRecord[];
  activityEvents: ActivityEventRecord[];
  documentEvidence: DocumentEvidenceRecord[];
  assistantResponses: DemoAssistantResponse[];
  aiActions: AiActionRecord[];
  legacyMockOverlayEnabled?: boolean;
}

export const MULTI_CASE_DEMO_DATASET: SystemDataset = SBLI_DATASET;

export const SYSTEM_DATASETS: SystemDataset[] = [
  MULTI_CASE_DEMO_DATASET,
  GUARDIAN_DATASET,
  EMPIRE_DATASET,
];
