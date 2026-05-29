import type { SystemDataset } from '../data/multi-case-dataset';
import type { WorkObjectKind, CaseKind } from './objectRefs';

export type IntelligenceObjectKind = 'document_evidence' | 'ai_action' | 'assistant_response';
export type CatalogObjectKind = WorkObjectKind | IntelligenceObjectKind;
export type RelationshipCardinality = 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';

export interface ObjectDomainDefinition {
  kind: WorkObjectKind;
  label: string;
  description: string;
  defaultEnabled: boolean;
  keyFields: string[];
}

export type EntitySchemaCategory = 'core' | 'supporting' | 'work' | 'audit';

export interface EntitySchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'object' | 'array' | 'ref';
  required?: boolean;
  ref?: CatalogObjectKind;
  description?: string;
}

export interface EntitySchemaDefinition {
  kind: CatalogObjectKind;
  tableName: string;
  primaryKey: string;
  displayField: string;
  category: EntitySchemaCategory;
  fields: EntitySchemaField[];
}

export interface ObjectRelationshipDefinition {
  id: string;
  source: CatalogObjectKind;
  target: CatalogObjectKind;
  label: string;
  cardinality: RelationshipCardinality;
  description: string;
}

export interface ImportTargetDefinition {
  kind: CatalogObjectKind;
  label: string;
  supportedFormats: Array<'json' | 'csv' | 'xml'>;
  requiredFields: string[];
  relationshipFields: string[];
}

export interface DatasetObjectCounts {
  total: number;
  byKind: Record<WorkObjectKind, number>;
}

export interface RelationshipIssue {
  sourceKind: CatalogObjectKind;
  sourceId: string;
  targetKind: CatalogObjectKind;
  targetId: string;
  message: string;
}

export interface ModuleBoundaryIssue {
  kind: 'requirement_scope' | 'request_scope' | 'document_file' | 'orphan_relationship' | 'policy_roles' | 'agent_relationship';
  entityId: string;
  message: string;
}

export const OBJECT_DOMAIN_DEFINITIONS: ObjectDomainDefinition[] = [
  {
    kind: 'case',
    label: 'Case',
    description: 'Workflow entity that organizes status, participants, work, evidence, and outcomes.',
    defaultEnabled: true,
    keyFields: ['id', 'caseKind', 'claimSubType', 'workflowTemplateId', 'status', 'analysis', 'decision'],
  },
  {
    kind: 'client',
    label: 'Client',
    description: 'Person or organization entity participating in a case, policy, application, or service request.',
    defaultEnabled: true,
    keyFields: ['id', 'name', 'type', 'status', 'category', 'profile', 'linkedObjects'],
  },
  {
    kind: 'policy',
    label: 'Policy',
    description: 'Coverage, draft policy, or in-force contract linked to work entities.',
    defaultEnabled: true,
    keyFields: ['id', 'label', 'status', 'product', 'policyNumber', 'participants'],
  },
  {
    kind: 'agent',
    label: 'Agent',
    description: 'Producer, advisor, or agency entity linked to clients, policies, cases, contracts, and licenses.',
    defaultEnabled: true,
    keyFields: ['id', 'name', 'status', 'producerCode', 'agencyName', 'linkedObjects'],
  },
  {
    kind: 'application',
    label: 'Application',
    description: 'New business application package before issue.',
    defaultEnabled: true,
    keyFields: ['id', 'label', 'status', 'product', 'clientId'],
  },
  {
    kind: 'requirement',
    label: 'Requirement',
    description: 'Evidence, condition, gate, or checklist item needed to progress work.',
    defaultEnabled: true,
    keyFields: ['id', 'label', 'category', 'status', 'stage', 'dueDate', 'source', 'aiSummary', 'linkedDocs', 'linkedTasks', 'linkedObjects'],
  },
  {
    kind: 'task',
    label: 'Task',
    description: 'Assigned work item linked to any entity in the platform graph.',
    defaultEnabled: true,
    keyFields: ['id', 'label', 'status', 'priority', 'assignee', 'slaRemaining', 'panelContext'],
  },
  {
    kind: 'request',
    label: 'Request',
    description: 'Inbound intake item from portal, email, phone, advisor, provider, or integration.',
    defaultEnabled: true,
    keyFields: ['id', 'label', 'status', 'source', 'systemSteps', 'linkedObjects'],
  },
  {
    kind: 'document',
    label: 'Document',
    description: 'File, package, evidence source, or extracted fact set linked to work entities.',
    defaultEnabled: true,
    keyFields: ['id', 'label', 'category', 'status', 'aiSummary', 'linkedRequirementId', 'linkedCaseId', 'fileAvailable'],
  },
  {
    kind: 'communication',
    label: 'Communication',
    description: 'Email, portal message, phone log, letter, note, or AI draft.',
    defaultEnabled: true,
    keyFields: ['id', 'channel', 'direction', 'subject', 'status'],
  },
  {
    kind: 'note',
    label: 'Note',
    description: 'Structured or free-form internal annotation linked to an entity.',
    defaultEnabled: false,
    keyFields: ['id', 'body', 'author', 'linkedObjects'],
  },
  {
    kind: 'event',
    label: 'Activity event',
    description: 'Timeline or audit event generated by users, AI, systems, or integrations.',
    defaultEnabled: true,
    keyFields: ['id', 'label', 'actor', 'timestamp', 'linkedObjects'],
  },
];

export const ENTITY_SCHEMA_DEFINITIONS: EntitySchemaDefinition[] = [
  {
    kind: 'case',
    tableName: 'cases',
    primaryKey: 'id',
    displayField: 'title',
    category: 'core',
    fields: [
      { name: 'id', type: 'string', required: true, description: 'Stable case identifier.' },
      { name: 'caseTypeId', type: 'string', description: 'Carrier/demo case type identifier, e.g. ct_claim_disability.' },
      { name: 'caseTypeLabel', type: 'string', description: 'Carrier/demo case type display label.' },
      { name: 'caseSubType', type: 'enum', description: 'SBLI subtype: waiver_of_premium, death_benefit, full_underwriting, simplified_underwriting.' },
      { name: 'sourceCaseNumber', type: 'string', description: 'External visible case number when different from id.' },
      { name: 'caseKind', type: 'enum', required: true, description: 'Business line discriminator.' },
      {
        name: 'claimSubType',
        type: 'enum',
        description:
          'For claim cases: disability benefit vs death, resolved from claimDetails.claimSubType and caseTypeCode. Projected on catalog rows for reporting; canonical value remains nested under claimDetails.',
      },
      { name: 'caseTypeCode', type: 'string', required: true, description: 'Concrete case type code.' },
      { name: 'workflowTemplateId', type: 'string', required: true, description: 'Business line workflow template.' },
      { name: 'status', type: 'string', required: true },
      { name: 'slaDue', type: 'date' },
      { name: 'slaStatus', type: 'enum' },
      { name: 'assignee', type: 'object', description: 'Person or queue currently responsible for the case.' },
      { name: 'primaryParty', type: 'ref', required: true, ref: 'client', description: 'Initial person or agent for whom the case/request was submitted; may include policyRole for policy context.' },
      { name: 'participants', type: 'array', ref: 'client' },
      { name: 'linkedObjects', type: 'array', description: 'References to policies, applications, evidence, work, and communications.' },
      { name: 'workflowMeta', type: 'object', description: 'Dataset-backed case header, context bar, subway stages, utility tabs, and header actions.' },
      { name: 'generalInformation', type: 'object', description: 'General Information tab sections or typed cards with AI summary and collapsibles.' },
      { name: 'analysis', type: 'object', description: 'AI recommendation, assessment factors, score, and narrative.' },
      { name: 'decision', type: 'object', description: 'Decision tab state, recommendation, callout, and benefit recommendation.' },
      { name: 'claimDetails', type: 'object', description: 'Claim-specific dates, cause, benefits, and restoration plan.' },
      { name: 'applicationFields', type: 'object', description: 'Raw new-business application sub-objects from the seed dataset.' },
    ],
  },
  {
    kind: 'client',
    tableName: 'clients',
    primaryKey: 'id',
    displayField: 'name',
    category: 'core',
    fields: [
      { name: 'id', type: 'string', required: true },
      { name: 'name', type: 'string', required: true },
      { name: 'type', type: 'enum', required: true },
      { name: 'status', type: 'enum' },
      { name: 'category', type: 'enum' },
      { name: 'language', type: 'string' },
      { name: 'taxId', type: 'string' },
      { name: 'summary', type: 'string' },
      { name: 'profile', type: 'object', description: 'Contact, demographic, location, and preference fields used in demo headers.' },
      { name: 'linkedObjects', type: 'array' },
    ],
  },
  {
    kind: 'policy',
    tableName: 'policies',
    primaryKey: 'id',
    displayField: 'label',
    category: 'core',
    fields: [
      { name: 'id', type: 'string', required: true },
      { name: 'label', type: 'string', required: true },
      { name: 'status', type: 'string', required: true },
      { name: 'product', type: 'string', required: true },
      { name: 'policyNumber', type: 'string' },
      { name: 'productType', type: 'string' },
      { name: 'monthlyBenefit', type: 'string' },
      { name: 'coverageAmount', type: 'string' },
      { name: 'participants', type: 'array', required: true, description: 'Client roles such as owner, insured, beneficiary, payer, authorized contact.' },
      { name: 'agents', type: 'array', ref: 'agent' },
      { name: 'linkedObjects', type: 'array' },
    ],
  },
  {
    kind: 'agent',
    tableName: 'agents',
    primaryKey: 'id',
    displayField: 'name',
    category: 'core',
    fields: [
      { name: 'id', type: 'string', required: true },
      { name: 'name', type: 'string', required: true },
      { name: 'status', type: 'enum', required: true },
      { name: 'producerCode', type: 'string' },
      { name: 'agencyName', type: 'string' },
      { name: 'email', type: 'string' },
      { name: 'phone', type: 'string' },
      { name: 'licenses', type: 'array' },
      { name: 'contracts', type: 'array' },
      { name: 'linkedObjects', type: 'array', required: true },
    ],
  },
  {
    kind: 'application',
    tableName: 'applications',
    primaryKey: 'id',
    displayField: 'label',
    category: 'core',
    fields: [
      { name: 'id', type: 'string', required: true },
      { name: 'label', type: 'string', required: true },
      { name: 'status', type: 'string', required: true },
      { name: 'product', type: 'string', required: true },
      { name: 'clientId', type: 'ref', required: true, ref: 'client' },
    ],
  },
  {
    kind: 'requirement',
    tableName: 'requirements',
    primaryKey: 'id',
    displayField: 'label',
    category: 'work',
    fields: [
      { name: 'id', type: 'string', required: true },
      { name: 'label', type: 'string', required: true },
      { name: 'category', type: 'string', required: true },
      { name: 'status', type: 'string', required: true },
      { name: 'stage', type: 'string', description: 'Workflow stage that owns this requirement.' },
      { name: 'rag', type: 'enum' },
      { name: 'dueDate', type: 'date' },
      { name: 'followUpDate', type: 'date' },
      { name: 'source', type: 'string' },
      { name: 'sourceType', type: 'enum', description: 'Origin class: system, medical, or external.' },
      { name: 'responsibleParty', type: 'string', description: 'Party responsible for satisfying the requirement.' },
      { name: 'notes', type: 'string' },
      { name: 'aiSummary', type: 'string', description: 'Dataset-backed AI requirement summary shown in the panel.' },
      { name: 'fulfillmentCriteria', type: 'array', description: 'Checklist of criteria required before the requirement can be fulfilled.' },
      { name: 'linkedDocs', type: 'array', ref: 'document', description: 'Explicit document IDs displayed in the requirement evidence section.' },
      { name: 'linkedTasks', type: 'array', ref: 'task', description: 'Explicit task IDs displayed in the linked tasks section.' },
      { name: 'blockingImpact', type: 'object', description: 'Optional downstream stage impact and severity when this requirement blocks progress.' },
      { name: 'context', type: 'object', description: 'Primary context card rendered directly from the requirement record.' },
      { name: 'history', type: 'array', description: 'Requirement audit trail events.' },
      { name: 'trigger', type: 'string' },
      { name: 'requirementRef', type: 'string', description: 'Original requirement label from imported task/document seeds.' },
      { name: 'phase', type: 'string' },
      { name: 'workflowStepId', type: 'string' },
      { name: 'aiInsight', type: 'boolean' },
      { name: 'aiConfidence', type: 'number' },
      { name: 'linkedObjects', type: 'array', required: true },
    ],
  },
  {
    kind: 'task',
    tableName: 'tasks',
    primaryKey: 'id',
    displayField: 'label',
    category: 'work',
    fields: [
      { name: 'id', type: 'string', required: true },
      { name: 'taskId', type: 'string', description: 'Carrier/workflow visible task identifier.' },
      { name: 'label', type: 'string', required: true },
      { name: 'status', type: 'string', required: true },
      { name: 'priority', type: 'string', required: true },
      { name: 'assignee', type: 'string', required: true },
      { name: 'caseSubtype', type: 'string' },
      { name: 'stage', type: 'string', description: 'Workflow stage that owns this task.' },
      { name: 'dueDate', type: 'date' },
      { name: 'alert', type: 'object', description: 'Conditional alert strip: type and message.' },
      { name: 'summary', type: 'object', required: true, description: 'Task context block with description and checklist.' },
      { name: 'aiNarrative', type: 'object', description: 'AI-generated task narrative and confidence.' },
      { name: 'evidenceDocuments', type: 'array', description: 'Ordered document references shown in the task evidence preview.' },
      { name: 'contextCards', type: 'array', description: 'Typed stage/case context widgets rendered in the task panel.' },
      { name: 'actions', type: 'array', required: true, description: 'Data-driven task completion controls.' },
      { name: 'owner', type: 'string', description: 'Legacy alias retained for older imported task packages; prefer assignee.' },
      { name: 'claimantPolicyRole', type: 'string', description: 'Policy relationship of the initial person tied to the task, such as Insured or Beneficiary.' },
      { name: 'aiSummary', type: 'string' },
      { name: 'aiGenerated', type: 'boolean' },
      { name: 'aiConfidence', type: 'number' },
      { name: 'slaRemaining', type: 'string' },
      { name: 'panelContext', type: 'object' },
      { name: 'linkedObjects', type: 'array', required: true },
    ],
  },
  {
    kind: 'request',
    tableName: 'requests',
    primaryKey: 'id',
    displayField: 'label',
    category: 'work',
    fields: [
      { name: 'id', type: 'string', required: true },
      { name: 'label', type: 'string', required: true },
      { name: 'status', type: 'string', required: true },
      { name: 'source', type: 'string', required: true },
      { name: 'subtype', type: 'string', description: 'Specific request subtype, such as WOP disability claim.' },
      { name: 'requesterRole', type: 'string' },
      { name: 'channel', type: 'string' },
      { name: 'form', type: 'object', description: 'Submitted form metadata and ordered fields.' },
      { name: 'aiActions', type: 'array', description: 'Append-only AI crew audit events.' },
      { name: 'humanActions', type: 'array', description: 'Append-only human/system audit events.' },
      { name: 'linkedCase', type: 'object' },
      { name: 'linkedTasks', type: 'array', ref: 'task' },
      { name: 'linkedReqs', type: 'array', ref: 'requirement' },
      { name: 'category', type: 'string' },
      { name: 'sourceChannel', type: 'enum' },
      { name: 'aiSummary', type: 'string' },
      { name: 'systemSteps', type: 'array' },
      { name: 'linkedObjects', type: 'array', required: true },
    ],
  },
  {
    kind: 'document',
    tableName: 'documents',
    primaryKey: 'id',
    displayField: 'label',
    category: 'supporting',
    fields: [
      { name: 'id', type: 'string', required: true },
      { name: 'label', type: 'string', required: true },
      { name: 'filename', type: 'string' },
      { name: 'category', type: 'string', required: true },
      { name: 'status', type: 'string', required: true },
      { name: 'stage', type: 'string', description: 'Workflow stage that owns this document.' },
      { name: 'uploaded', type: 'date' },
      { name: 'uploadedAt', type: 'date', description: 'Source upload timestamp from task seed.' },
      { name: 'source', type: 'string' },
      { name: 'claimant', type: 'string' },
      { name: 'reqContext', type: 'string', description: 'Narrative explaining why the document matters.' },
      { name: 'insights', type: 'array', description: 'AI evidence anchors from the source seed.' },
      { name: 'followUps', type: 'number' },
      { name: 'insight', type: 'string' },
      { name: 'aiInsight', type: 'boolean' },
      { name: 'aiConfidence', type: 'number' },
      { name: 'aiSummary', type: 'string' },
      { name: 'aiAction', type: 'string' },
      { name: 'linkedRequirementId', type: 'ref', ref: 'requirement', description: 'Structured requirement link used by contextual support cards.' },
      { name: 'linkedCaseId', type: 'ref', ref: 'case', description: 'Structured case link used by contextual support cards.' },
      { name: 'linkedRequirement', type: 'string', description: 'Legacy display label; prefer linkedRequirementId.' },
      { name: 'linkedCase', type: 'string', description: 'Legacy display label; prefer linkedCaseId.' },
      { name: 'scoringContext', type: 'object' },
      { name: 'fileAvailable', type: 'boolean', required: true },
      { name: 'fileType', type: 'string' },
      { name: 'placeholderReason', type: 'string' },
      { name: 'linkedObjects', type: 'array', required: true },
    ],
  },
  {
    kind: 'communication',
    tableName: 'communications',
    primaryKey: 'id',
    displayField: 'subject',
    category: 'supporting',
    fields: [
      { name: 'id', type: 'string', required: true },
      { name: 'channel', type: 'enum', required: true },
      { name: 'direction', type: 'enum', required: true },
      { name: 'subject', type: 'string', required: true },
      { name: 'status', type: 'string', required: true },
      { name: 'createdAt', type: 'date' },
      { name: 'stage', type: 'string', description: 'Workflow stage that owns this communication.' },
      { name: 'contact', type: 'string' },
      { name: 'assignee', type: 'string' },
      { name: 'linkedObjects', type: 'array', required: true },
    ],
  },
  {
    kind: 'note',
    tableName: 'notes',
    primaryKey: 'id',
    displayField: 'body',
    category: 'supporting',
    fields: [
      { name: 'id', type: 'string', required: true },
      { name: 'body', type: 'string', required: true },
      { name: 'author', type: 'string', required: true },
      { name: 'linkedObjects', type: 'array' },
    ],
  },
  {
    kind: 'event',
    tableName: 'activity_events',
    primaryKey: 'id',
    displayField: 'label',
    category: 'audit',
    fields: [
      { name: 'id', type: 'string', required: true },
      { name: 'label', type: 'string', required: true },
      { name: 'actor', type: 'enum', required: true },
      { name: 'timestamp', type: 'date', required: true },
      { name: 'stage', type: 'string', description: 'Workflow stage that owns this activity.' },
      { name: 'detail', type: 'string' },
      { name: 'user', type: 'string' },
      { name: 'linkedObjects', type: 'array', required: true },
    ],
  },
  {
    kind: 'document_evidence',
    tableName: 'document_evidence',
    primaryKey: 'id',
    displayField: 'title',
    category: 'supporting',
    fields: [
      { name: 'id', type: 'string', required: true },
      { name: 'documentId', type: 'ref', required: true, ref: 'document' },
      { name: 'title', type: 'string', required: true },
      { name: 'summary', type: 'string', required: true },
      { name: 'pages', type: 'array', required: true },
      { name: 'findings', type: 'array', required: true },
      { name: 'linkedObjects', type: 'array', required: true },
    ],
  },
  {
    kind: 'assistant_response',
    tableName: 'assistant_responses',
    primaryKey: 'id',
    displayField: 'prompt',
    category: 'audit',
    fields: [
      { name: 'id', type: 'string', required: true },
      { name: 'workflowTemplateId', type: 'string', required: true },
      { name: 'prompt', type: 'string', required: true },
      { name: 'response', type: 'string', required: true },
      { name: 'linkedObjects', type: 'array', required: true },
    ],
  },
  {
    kind: 'ai_action',
    tableName: 'ai_actions',
    primaryKey: 'id',
    displayField: 'title',
    category: 'audit',
    fields: [
      { name: 'id', type: 'string', required: true },
      { name: 'status', type: 'enum', required: true },
      { name: 'actionType', type: 'string', required: true },
      { name: 'title', type: 'string', required: true },
      { name: 'summary', type: 'string', required: true },
      { name: 'createdAt', type: 'date', required: true },
      { name: 'actor', type: 'enum', required: true },
      { name: 'sourceSurface', type: 'enum', required: true },
      { name: 'linkedObjects', type: 'array', required: true },
      { name: 'relatedActivityEventId', type: 'ref', ref: 'event' },
      { name: 'relatedAssistantResponseId', type: 'ref', ref: 'assistant_response' },
    ],
  },
];

export const OBJECT_RELATIONSHIPS: ObjectRelationshipDefinition[] = [
  {
    id: 'case-client',
    source: 'case',
    target: 'client',
    label: 'primary party / participants',
    cardinality: 'many-to-many',
    description: 'Cases are linked to clients through roles such as claimant, applicant, customer, advisor, or representative.',
  },
  {
    id: 'case-policy',
    source: 'case',
    target: 'policy',
    label: 'coverage context',
    cardinality: 'many-to-one',
    description: 'A case can reference an in-force policy, draft policy, or coverage record.',
  },
  {
    id: 'agent-policy',
    source: 'agent',
    target: 'policy',
    label: 'services or sells',
    cardinality: 'many-to-many',
    description: 'Agents can be associated with multiple policies, and policies can have multiple agents over time.',
  },
  {
    id: 'agent-client',
    source: 'agent',
    target: 'client',
    label: 'supports',
    cardinality: 'many-to-many',
    description: 'Agents can support clients directly through advice, service, or onboarding work.',
  },
  {
    id: 'agent-case',
    source: 'agent',
    target: 'case',
    label: 'participates in',
    cardinality: 'many-to-many',
    description: 'Agents can participate in new business, onboarding, service, or claim-related cases.',
  },
  {
    id: 'case-application',
    source: 'case',
    target: 'application',
    label: 'application context',
    cardinality: 'one-to-one',
    description: 'New business cases usually anchor to an application package.',
  },
  {
    id: 'case-requirement',
    source: 'case',
    target: 'requirement',
    label: 'workflow gates',
    cardinality: 'one-to-many',
    description: 'Requirements define what evidence or action is needed before a workflow can progress.',
  },
  {
    id: 'case-task',
    source: 'case',
    target: 'task',
    label: 'assigned work',
    cardinality: 'one-to-many',
    description: 'Tasks operationalize follow-ups, reviews, and manual work around a case.',
  },
  {
    id: 'case-document',
    source: 'case',
    target: 'document',
    label: 'evidence and files',
    cardinality: 'one-to-many',
    description: 'Documents provide evidence and context for case facts, requirements, and decisions.',
  },
  {
    id: 'case-request',
    source: 'case',
    target: 'request',
    label: 'intake and service',
    cardinality: 'one-to-many',
    description: 'Requests can create, update, or attach to cases and their supporting entities.',
  },
  {
    id: 'case-communication',
    source: 'case',
    target: 'communication',
    label: 'interaction history',
    cardinality: 'one-to-many',
    description: 'Communications preserve inbound, outbound, and internal context around a case.',
  },
  {
    id: 'requirement-document',
    source: 'requirement',
    target: 'document',
    label: 'evidence fulfillment',
    cardinality: 'many-to-many',
    description: 'Documents can fulfill, support, or challenge one or more requirements.',
  },
  {
    id: 'request-task',
    source: 'request',
    target: 'task',
    label: 'system initiated work',
    cardinality: 'one-to-many',
    description: 'Intake requests can generate tasks for verification, review, follow-up, or rejection.',
  },
  {
    id: 'request-requirement',
    source: 'request',
    target: 'requirement',
    label: 'created or updated requirements',
    cardinality: 'one-to-many',
    description: 'Requests can create requirements or provide evidence that updates them.',
  },
  {
    id: 'communication-client',
    source: 'communication',
    target: 'client',
    label: 'participant contact',
    cardinality: 'many-to-many',
    description: 'Communications identify who was contacted and which role they played.',
  },
  {
    id: 'event-case',
    source: 'event',
    target: 'case',
    label: 'audit timeline',
    cardinality: 'many-to-one',
    description: 'Events form the timeline and audit trail for workflow activity.',
  },
  {
    id: 'document-evidence-document',
    source: 'document_evidence',
    target: 'document',
    label: 'extracted from',
    cardinality: 'many-to-one',
    description: 'Document evidence rows capture extracted findings, page markers, and reasoning for a source document.',
  },
  {
    id: 'document-evidence-case',
    source: 'document_evidence',
    target: 'case',
    label: 'supports case evidence',
    cardinality: 'many-to-one',
    description: 'Document evidence should retain the case context used by dashboards, case panels, and intelligence views.',
  },
  {
    id: 'assistant-response-object',
    source: 'assistant_response',
    target: 'case',
    label: 'answers within context',
    cardinality: 'many-to-many',
    description: 'Assistant responses are grounded by linked objects such as cases, requirements, documents, requests, and tasks.',
  },
  {
    id: 'ai-action-object',
    source: 'ai_action',
    target: 'case',
    label: 'acts on context',
    cardinality: 'many-to-many',
    description: 'AI actions preserve suggestions, outcomes, and audit status for their linked business objects.',
  },
];

export const IMPORT_TARGETS: ImportTargetDefinition[] = [
  {
    kind: 'case',
    label: 'Cases',
    supportedFormats: ['json', 'csv', 'xml'],
    requiredFields: ['id', 'caseKind', 'workflowTemplateId', 'status', 'primaryParty.id'],
    relationshipFields: ['primaryParty.id', 'participants[].id', 'linkedObjects[].id'],
  },
  {
    kind: 'client',
    label: 'Clients',
    supportedFormats: ['json', 'csv'],
    requiredFields: ['id', 'name', 'type'],
    relationshipFields: [],
  },
  {
    kind: 'policy',
    label: 'Policies',
    supportedFormats: ['json', 'csv'],
    requiredFields: ['id', 'label', 'status', 'product', 'participants'],
    relationshipFields: ['participants[].clientId', 'agents[].id', 'linkedObjects[].id'],
  },
  {
    kind: 'agent',
    label: 'Agents',
    supportedFormats: ['json', 'csv'],
    requiredFields: ['id', 'name', 'status'],
    relationshipFields: ['linkedObjects[].id'],
  },
  {
    kind: 'application',
    label: 'Applications',
    supportedFormats: ['json', 'csv'],
    requiredFields: ['id', 'label', 'status', 'product', 'clientId'],
    relationshipFields: ['clientId'],
  },
  {
    kind: 'requirement',
    label: 'Requirements',
    supportedFormats: ['json', 'csv'],
    requiredFields: ['id', 'label', 'category', 'status'],
    relationshipFields: ['linkedObjects[].id'],
  },
  {
    kind: 'task',
    label: 'Tasks',
    supportedFormats: ['json', 'csv'],
    requiredFields: ['id', 'label', 'status', 'priority', 'assignee'],
    relationshipFields: ['linkedObjects[].id'],
  },
  {
    kind: 'document',
    label: 'Documents',
    supportedFormats: ['json', 'csv'],
    requiredFields: ['id', 'label', 'category', 'status'],
    relationshipFields: ['linkedObjects[].id'],
  },
  {
    kind: 'request',
    label: 'Requests',
    supportedFormats: ['json', 'csv'],
    requiredFields: ['id', 'label', 'status', 'source'],
    relationshipFields: ['linkedObjects[].id'],
  },
  {
    kind: 'communication',
    label: 'Communications',
    supportedFormats: ['json', 'csv'],
    requiredFields: ['id', 'channel', 'direction', 'subject', 'status'],
    relationshipFields: ['linkedObjects[].id'],
  },
  {
    kind: 'note',
    label: 'Notes',
    supportedFormats: ['json', 'csv'],
    requiredFields: ['id', 'body', 'author'],
    relationshipFields: ['linkedObjects[].id'],
  },
  {
    kind: 'event',
    label: 'Activity events',
    supportedFormats: ['json', 'csv'],
    requiredFields: ['id', 'label', 'actor', 'timestamp'],
    relationshipFields: ['linkedObjects[].id'],
  },
  {
    kind: 'document_evidence',
    label: 'Document evidence',
    supportedFormats: ['json'],
    requiredFields: ['id', 'documentId', 'title', 'summary', 'pages', 'findings'],
    relationshipFields: ['documentId', 'linkedObjects[].id'],
  },
  {
    kind: 'assistant_response',
    label: 'Assistant responses',
    supportedFormats: ['json'],
    requiredFields: ['id', 'workflowTemplateId', 'prompt', 'response'],
    relationshipFields: ['linkedObjects[].id'],
  },
  {
    kind: 'ai_action',
    label: 'AI actions',
    supportedFormats: ['json'],
    requiredFields: ['id', 'status', 'actionType', 'title', 'summary', 'createdAt', 'actor', 'sourceSurface'],
    relationshipFields: ['linkedObjects[].id', 'relatedActivityEventId', 'relatedAssistantResponseId'],
  },
];

export function countDatasetObjects(dataset: SystemDataset): DatasetObjectCounts {
  const byKind: Record<WorkObjectKind, number> = {
    case: dataset.cases.length,
    client: dataset.clients.length,
    policy: dataset.policies.length,
    agent: dataset.agents.length,
    application: dataset.applications.length,
    requirement: dataset.requirements.length,
    task: dataset.tasks.length,
    request: dataset.requests.length,
    document: dataset.documents.length,
    communication: dataset.communications.length,
    note: dataset.notes.length,
    event: dataset.activityEvents.length,
  };
  const userCount = dataset.users?.length ?? 0;
  return {
    total: Object.values(byKind).reduce((sum, value) => sum + value, 0) + userCount,
    byKind,
  };
}

export function countCasesByWorkflow(dataset: SystemDataset): Record<CaseKind, number> {
  return dataset.cases.reduce<Record<CaseKind, number>>(
    (counts, item) => {
      counts[item.caseKind] += 1;
      return counts;
    },
    { claim: 0, new_business: 0, customer_service: 0, agent_onboarding: 0 },
  );
}

export function findRelationshipIssues(dataset: SystemDataset): RelationshipIssue[] {
  const objectIds = new Set<string>();
  const add = (kind: WorkObjectKind, id: string) => objectIds.add(`${kind}:${id}`);

  dataset.cases.forEach((item) => add('case', item.id));
  dataset.clients.forEach((item) => add('client', item.id));
  dataset.policies.forEach((item) => add('policy', item.id));
  dataset.agents.forEach((item) => add('agent', item.id));
  dataset.applications.forEach((item) => add('application', item.id));
  dataset.requirements.forEach((item) => add('requirement', item.id));
  dataset.tasks.forEach((item) => add('task', item.id));
  dataset.requests.forEach((item) => add('request', item.id));
  dataset.documents.forEach((item) => add('document', item.id));
  dataset.communications.forEach((item) => add('communication', item.id));
  dataset.notes.forEach((item) => add('note', item.id));
  dataset.activityEvents.forEach((item) => add('event', item.id));

  const issues: RelationshipIssue[] = [];
  const check = (
    sourceKind: RelationshipIssue['sourceKind'],
    sourceId: string,
    refs: Array<{ kind: WorkObjectKind; id: string }>,
  ) => {
    refs.forEach((ref) => {
      if (!objectIds.has(`${ref.kind}:${ref.id}`)) {
        issues.push({
          sourceKind,
          sourceId,
          targetKind: ref.kind,
          targetId: ref.id,
          message: `${sourceKind} ${sourceId} references missing ${ref.kind} ${ref.id}`,
        });
      }
    });
  };

  dataset.cases.forEach((item) => check('case', item.id, [item.primaryParty, ...item.participants, ...item.linkedObjects]));
  dataset.policies.forEach((item) => check('policy', item.id, [...item.linkedObjects, ...item.agents]));
  dataset.policies.forEach((item) => {
    item.participants.forEach((participant) => {
      if (!objectIds.has(`client:${participant.clientId}`)) {
        issues.push({
          sourceKind: 'policy',
          sourceId: item.id,
          targetKind: 'client',
          targetId: participant.clientId,
          message: `policy ${item.id} participant references missing client ${participant.clientId}`,
        });
      }
    });
  });
  dataset.agents.forEach((item) => check('agent', item.id, item.linkedObjects));
  dataset.requirements.forEach((item) => check('requirement', item.id, item.linkedObjects));
  dataset.tasks.forEach((item) => check('task', item.id, item.linkedObjects));
  dataset.requests.forEach((item) => check('request', item.id, item.linkedObjects));
  dataset.documents.forEach((item) => {
    check('document', item.id, item.linkedObjects);
    if (item.linkedRequirementId && !objectIds.has(`requirement:${item.linkedRequirementId}`)) {
      issues.push({
        sourceKind: 'document',
        sourceId: item.id,
        targetKind: 'requirement',
        targetId: item.linkedRequirementId,
        message: `document ${item.id} references missing requirement ${item.linkedRequirementId}`,
      });
    }
    if (item.linkedCaseId && !objectIds.has(`case:${item.linkedCaseId}`)) {
      issues.push({
        sourceKind: 'document',
        sourceId: item.id,
        targetKind: 'case',
        targetId: item.linkedCaseId,
        message: `document ${item.id} references missing case ${item.linkedCaseId}`,
      });
    }
  });
  dataset.communications.forEach((item) => check('communication', item.id, item.linkedObjects));
  dataset.notes.forEach((item) => check('note', item.id, item.linkedObjects));
  dataset.activityEvents.forEach((item) => check('event', item.id, item.linkedObjects));
  dataset.documentEvidence.forEach((item) => {
    if (!objectIds.has(`document:${item.documentId}`)) {
      issues.push({
        sourceKind: 'document_evidence',
        sourceId: item.id,
        targetKind: 'document',
        targetId: item.documentId,
        message: `document evidence ${item.id} references missing document ${item.documentId}`,
      });
    }
    check('document_evidence', item.id, item.linkedObjects);
  });
  dataset.assistantResponses.forEach((item) => check('assistant_response', item.id, item.linkedObjects));
  dataset.aiActions.forEach((item) => {
    check('ai_action', item.id, item.linkedObjects);
    if (item.relatedActivityEventId && !objectIds.has(`event:${item.relatedActivityEventId}`)) {
      issues.push({
        sourceKind: 'ai_action',
        sourceId: item.id,
        targetKind: 'event',
        targetId: item.relatedActivityEventId,
        message: `AI action ${item.id} references missing activity event ${item.relatedActivityEventId}`,
      });
    }
  });

  return issues;
}

export function getSchemaDefinition(kind: CatalogObjectKind): EntitySchemaDefinition | undefined {
  return ENTITY_SCHEMA_DEFINITIONS.find((schema) => schema.kind === kind);
}

export function getOutboundRelationships(kind: CatalogObjectKind): ObjectRelationshipDefinition[] {
  return OBJECT_RELATIONSHIPS.filter((relationship) => relationship.source === kind);
}

export function getInboundRelationships(kind: CatalogObjectKind): ObjectRelationshipDefinition[] {
  return OBJECT_RELATIONSHIPS.filter((relationship) => relationship.target === kind);
}

export function countRelationshipIssuesByKind(
  issues: RelationshipIssue[],
  kind: CatalogObjectKind,
): number {
  return issues.filter((issue) => issue.sourceKind === kind || issue.targetKind === kind).length;
}

export function validateModuleBoundaryRules(dataset: SystemDataset): ModuleBoundaryIssue[] {
  const issues: ModuleBoundaryIssue[] = [];

  dataset.requirements.forEach((requirement) => {
    const linkedToCase = requirement.linkedObjects.some((ref) => ref.kind === 'case');
    if (!linkedToCase) {
      issues.push({
        kind: 'requirement_scope',
        entityId: requirement.id,
        message: 'Requirements must be scoped to a case and should not appear as standalone module records.',
      });
    }
  });

  dataset.requests.forEach((request) => {
    const hasRelatedEntity = request.linkedObjects.length > 0;
    if (!hasRelatedEntity) {
      issues.push({
        kind: 'request_scope',
        entityId: request.id,
        message: 'Requests should remain in the Requests module and link to related entities when applicable.',
      });
    }
  });

  dataset.documents.forEach((document) => {
    if (!document.fileAvailable) {
      issues.push({
        kind: 'document_file',
        entityId: document.id,
        message: document.placeholderReason ?? 'Document metadata exists, but the actual file is not available yet.',
      });
    }
  });

  dataset.policies.forEach((policy) => {
    if (!policy.participants?.length) {
      issues.push({
        kind: 'policy_roles',
        entityId: policy.id,
        message: 'Policies should include participant roles such as owner, insured, beneficiary, payer, or authorized contact.',
      });
    }
  });

  dataset.agents.forEach((agent) => {
    if (!agent.linkedObjects.length) {
      issues.push({
        kind: 'agent_relationship',
        entityId: agent.id,
        message: 'Agents should link to policies, clients, cases, contracts, or utility records.',
      });
    }
  });

  return issues;
}
