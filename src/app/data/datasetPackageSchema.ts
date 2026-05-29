import type {
  AgentRecord,
  AiActionRecord,
  ActivityEventRecord,
  ApplicationRecord,
  ClientRecord,
  CommunicationRecord,
  DemoAssistantResponse,
  DocumentEvidenceRecord,
  DatasetDocumentRecord,
  DatasetRequestRecord,
  DatasetRequirementRecord,
  DatasetTaskRecord,
  NoteRecord,
  PolicyRecord,
} from './multi-case-dataset';
import type { CaseRecord, ObjectRef, WorkObjectKind } from '../domain/objectRefs';
import type { CatalogObjectKind } from '../domain/dataArchitecture';
import {
  isClaimSubType,
  isSubTypeAllowedForCaseKind,
  NEW_BUSINESS_SUBTYPE_VALUES,
} from '../domain/claimSubTypes';

export type AmplifyDatasetPackageVersion = '1.0';

export type DatasetEnvironmentMetadata = {
  id: string;
  organizationLabel: string;
  market: string;
  businessModel: 'carrier' | 'mga' | 'broker' | 'tpa' | 'bank_owned_insurer' | 'platform_demo';
  historyRange: string;
  documentMode: 'metadata_only' | 'sample_files' | 'imported_files';
};

export type PackageObjectRef = Omit<ObjectRef, 'kind'> & { kind: CatalogObjectKind };

export type EntityRelationshipRecord = {
  id: string;
  source: PackageObjectRef;
  target: PackageObjectRef;
  relationship: string;
};

export type DatasetValidationSummary = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export type AmplifyDatasetPackage = {
  version: AmplifyDatasetPackageVersion;
  environment: DatasetEnvironmentMetadata;
  entities: {
    clients: ClientRecord[];
    policies: PolicyRecord[];
    agents: AgentRecord[];
    applications?: ApplicationRecord[];
    cases: CaseRecord[];
    tasks: DatasetTaskRecord[];
    documents: DatasetDocumentRecord[];
    requests: DatasetRequestRecord[];
    requirements: DatasetRequirementRecord[];
    communications: CommunicationRecord[];
    notes?: NoteRecord[];
    events: ActivityEventRecord[];
    documentEvidence?: DocumentEvidenceRecord[];
    assistantResponses?: DemoAssistantResponse[];
    aiActions?: AiActionRecord[];
  };
  relationships: EntityRelationshipRecord[];
  validation: DatasetValidationSummary;
};

export const DATASET_PACKAGE_REQUIRED_ENTITY_KEYS: WorkObjectKind[] = [
  'client',
  'policy',
  'agent',
  'application',
  'case',
  'task',
  'document',
  'request',
  'requirement',
  'communication',
  'note',
  'event',
];

function getPackageEntityKey(kind: WorkObjectKind): keyof AmplifyDatasetPackage['entities'] | null {
  switch (kind) {
    case 'client':
      return 'clients';
    case 'policy':
      return 'policies';
    case 'agent':
      return 'agents';
    case 'application':
      return 'applications';
    case 'case':
      return 'cases';
    case 'task':
      return 'tasks';
    case 'document':
      return 'documents';
    case 'request':
      return 'requests';
    case 'requirement':
      return 'requirements';
    case 'communication':
      return 'communications';
    case 'note':
      return 'notes';
    case 'event':
      return 'events';
    default:
      return null;
  }
}

export function isAmplifyDatasetPackage(value: unknown): value is AmplifyDatasetPackage {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AmplifyDatasetPackage>;
  return candidate.version === '1.0' && Boolean(candidate.environment) && Boolean(candidate.entities);
}

export function validateDatasetPackage(value: unknown): DatasetValidationSummary {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!isAmplifyDatasetPackage(value)) {
    return {
      valid: false,
      errors: ['Package must be valid AmplifyDatasetPackage JSON with version "1.0", environment, and entities.'],
      warnings,
    };
  }

  const entities = value.entities;
  const entityIndex = new Map<string, Set<string>>();
  const addEntityIds = (kind: CatalogObjectKind, rows: Array<{ id: string }> | undefined) => {
    entityIndex.set(kind, new Set((rows ?? []).map((row) => row.id)));
  };
  const registerDuplicateIds = (kind: string, rows: Array<{ id: string }> | undefined) => {
    const seen = new Set<string>();
    rows?.forEach((row) => {
      if (seen.has(row.id)) {
        errors.push(`Duplicate ${kind} id ${row.id}.`);
      }
      seen.add(row.id);
    });
  };
  const packageSize = JSON.stringify(value).length;
  if (packageSize > 4_000_000) {
    warnings.push('Package is larger than 4 MB; use IndexedDB or a remote adapter instead of localStorage for persistence.');
  }
  addEntityIds('client', entities.clients);
  addEntityIds('policy', entities.policies);
  addEntityIds('agent', entities.agents);
  addEntityIds('application', entities.applications);
  addEntityIds('case', entities.cases);
  addEntityIds('task', entities.tasks);
  addEntityIds('document', entities.documents);
  addEntityIds('request', entities.requests);
  addEntityIds('requirement', entities.requirements);
  addEntityIds('communication', entities.communications);
  addEntityIds('note', entities.notes);
  addEntityIds('event', entities.events);
  addEntityIds('document_evidence', entities.documentEvidence);
  addEntityIds('assistant_response', entities.assistantResponses);
  addEntityIds('ai_action', entities.aiActions);

  registerDuplicateIds('client', entities.clients);
  registerDuplicateIds('policy', entities.policies);
  registerDuplicateIds('agent', entities.agents);
  registerDuplicateIds('application', entities.applications);
  registerDuplicateIds('case', entities.cases);
  registerDuplicateIds('task', entities.tasks);
  registerDuplicateIds('document', entities.documents);
  registerDuplicateIds('request', entities.requests);
  registerDuplicateIds('requirement', entities.requirements);
  registerDuplicateIds('communication', entities.communications);
  registerDuplicateIds('note', entities.notes);
  registerDuplicateIds('event', entities.events);
  registerDuplicateIds('document evidence', entities.documentEvidence);
  registerDuplicateIds('assistant response', entities.assistantResponses);
  registerDuplicateIds('ai action', entities.aiActions);

  const validateRefs = (source: { id: string; kind?: CatalogObjectKind; linkedObjects?: ObjectRef[] }) => {
    source.linkedObjects?.forEach((ref) => {
      if (!entityIndex.get(ref.kind)?.has(ref.id)) {
        errors.push(`${source.kind ?? 'entity'} ${source.id} references missing ${ref.kind} ${ref.id}.`);
      }
    });
  };
  const mirrorRelationshipKeys = new Set<string>();
  const mirror = (source: PackageObjectRef, target: PackageObjectRef) => {
    mirrorRelationshipKeys.add(`${source.kind}:${source.id}->${target.kind}:${target.id}`);
    mirrorRelationshipKeys.add(`${target.kind}:${target.id}->${source.kind}:${source.id}`);
  };
  const mirrorLinkedObjects = (source: PackageObjectRef, refs: ObjectRef[] | undefined) => {
    refs?.forEach((target) => mirror(source, target));
  };

  DATASET_PACKAGE_REQUIRED_ENTITY_KEYS.forEach((kind) => {
    const key = getPackageEntityKey(kind);
    if (!key || !(key in entities) || !Array.isArray(entities[key])) {
      errors.push(`Missing entities.${key} array.`);
    }
  });

  entities.applications?.forEach((application) => {
    if (!entityIndex.get('client')?.has(application.clientId)) {
      errors.push(`Application ${application.id} references missing client ${application.clientId}.`);
    }
    mirror({ kind: 'application', id: application.id, label: application.label }, { kind: 'client', id: application.clientId });
  });

  entities.policies?.forEach((policy) => {
    if (!policy.participants?.length) {
      errors.push(`Policy ${policy.id} must include at least one participant role.`);
    }
    policy.participants?.forEach((participant) => {
      if (!entityIndex.get('client')?.has(participant.clientId)) {
        errors.push(`Policy ${policy.id} participant references missing client ${participant.clientId}.`);
      }
      mirror({ kind: 'policy', id: policy.id, label: policy.label }, { kind: 'client', id: participant.clientId, role: participant.role });
    });
    policy.agents?.forEach((agent) => {
      if (!entityIndex.get('agent')?.has(agent.id)) {
        errors.push(`Policy ${policy.id} agent references missing agent ${agent.id}.`);
      }
    });
    mirrorLinkedObjects({ kind: 'policy', id: policy.id, label: policy.label }, policy.linkedObjects);
    validateRefs(policy);
  });

  entities.agents?.forEach((agent) => {
    if (!agent.linkedObjects?.length) {
      warnings.push(`Agent ${agent.id} has no linked objects.`);
    }
    mirrorLinkedObjects({ kind: 'agent', id: agent.id, label: agent.name }, agent.linkedObjects);
    validateRefs(agent);
  });

  entities.cases?.forEach((caseRecord) => {
    if (caseRecord.caseKind === 'claim') {
      const code = caseRecord.caseTypeCode?.toUpperCase() ?? '';
      const explicit = caseRecord.claimDetails?.claimSubType;
      const topLevel = caseRecord.caseSubType;
      const recognizableCodes = new Set(['DTH', 'IP', 'WP']);

      if (!caseRecord.claimDetails) {
        warnings.push(`Case ${caseRecord.id} is a claim and should include claimDetails (including claimSubType when not implied by caseTypeCode).`);
      }

      if (topLevel && !isClaimSubType(topLevel)) {
        errors.push(`Case ${caseRecord.id} has invalid caseSubType.`);
      }

      if (topLevel && !isSubTypeAllowedForCaseKind('claim', topLevel)) {
        errors.push(`Case ${caseRecord.id}: caseSubType "${topLevel}" is not valid for claim cases.`);
      }

      if (explicit && !isClaimSubType(explicit)) {
        errors.push(`Case ${caseRecord.id} has invalid claimDetails.claimSubType.`);
      }

      if (topLevel && explicit && topLevel !== explicit) {
        errors.push(`Case ${caseRecord.id}: caseSubType and claimDetails.claimSubType must match.`);
      }

      if (!explicit && code && !recognizableCodes.has(code)) {
        warnings.push(
          `Case ${caseRecord.id} is a claim without claimDetails.claimSubType; set it explicitly or use a recognized caseTypeCode (DTH vs IP/WP).`,
        );
      }

      if (explicit === 'disability_benefit' && code === 'DTH') {
        errors.push(`Case ${caseRecord.id}: disability_benefit conflicts with caseTypeCode DTH.`);
      }

      if ((explicit === 'death_benefit' || explicit === 'death') && code && code !== 'DTH') {
        warnings.push(`Case ${caseRecord.id}: death benefit claim should align with caseTypeCode DTH where possible.`);
      }

      if (explicit === 'death' && code && code !== 'DTH') {
        warnings.push(`Case ${caseRecord.id}: death claim should align with caseTypeCode DTH where possible.`);
      }
    }

    if (caseRecord.caseKind === 'new_business') {
      const subType = caseRecord.caseSubType;
      if (subType && !isClaimSubType(subType)) {
        errors.push(`Case ${caseRecord.id} has invalid caseSubType.`);
      }
      if (subType && !isSubTypeAllowedForCaseKind('new_business', subType)) {
        errors.push(`Case ${caseRecord.id}: caseSubType "${subType}" is not valid for new business (expected ${NEW_BUSINESS_SUBTYPE_VALUES.join(' or ')}).`);
      }
      if (!subType) {
        warnings.push(`Case ${caseRecord.id} is new business and should include caseSubType (${NEW_BUSINESS_SUBTYPE_VALUES.join(' or ')}).`);
      }
      if (subType === 'full_underwriting' && caseRecord.caseTypeId && caseRecord.caseTypeId !== 'ct_nb_full_uw') {
        warnings.push(`Case ${caseRecord.id}: full_underwriting should use caseTypeId ct_nb_full_uw when set.`);
      }
      if (subType === 'simplified_underwriting' && caseRecord.caseTypeId && caseRecord.caseTypeId !== 'ct_nb_simplified') {
        warnings.push(`Case ${caseRecord.id}: simplified_underwriting should use caseTypeId ct_nb_simplified when set.`);
      }
      if (subType === 'guaranteed_underwriting' && caseRecord.caseTypeId && caseRecord.caseTypeId !== 'ct_nb_guaranteed') {
        warnings.push(`Case ${caseRecord.id}: guaranteed_underwriting should use caseTypeId ct_nb_guaranteed when set.`);
      }
    }

    const linkedMainEntity = caseRecord.linkedObjects?.some((ref) => ['client', 'policy', 'agent'].includes(ref.kind));
    const selfContainedCaseOnlyParty = caseRecord.primaryParty?.kind === 'case' && caseRecord.primaryParty.id === caseRecord.id;
    if (!linkedMainEntity && caseRecord.primaryParty?.kind !== 'client' && !selfContainedCaseOnlyParty) {
      errors.push(`Case ${caseRecord.id} must link to a client, policy, agent, or valid main entity combination.`);
    }
    if (caseRecord.primaryParty && !selfContainedCaseOnlyParty && !entityIndex.get(caseRecord.primaryParty.kind)?.has(caseRecord.primaryParty.id)) {
      errors.push(`Case ${caseRecord.id} primary party references missing ${caseRecord.primaryParty.kind} ${caseRecord.primaryParty.id}.`);
    }
    if (caseRecord.primaryParty) mirror({ kind: 'case', id: caseRecord.id, label: caseRecord.title }, caseRecord.primaryParty);
    caseRecord.participants?.forEach((participant) => {
      if (!entityIndex.get(participant.kind)?.has(participant.id)) {
        errors.push(`Case ${caseRecord.id} participant references missing ${participant.kind} ${participant.id}.`);
      }
      mirror({ kind: 'case', id: caseRecord.id, label: caseRecord.title }, participant);
    });
    if (!caseRecord.facts?.length || !caseRecord.sections?.length) {
      warnings.push(`Case ${caseRecord.id} should include facts and sections so overview cards render meaningful content.`);
    }
    if (!caseRecord.analysis?.narrative && !caseRecord.decision?.recommendation?.narrative) {
      warnings.push(`Case ${caseRecord.id} should include analysis or decision narrative for AI-driven demo surfaces.`);
    }
    if (caseRecord.workflowMeta) {
      if (caseRecord.workflowMeta.caseId !== caseRecord.id) {
        errors.push(`Case ${caseRecord.id} workflowMeta.caseId must match case id.`);
      }
      if (caseRecord.workflowMeta.contextBar.length !== 4) {
        errors.push(`Case ${caseRecord.id} workflowMeta.contextBar must include exactly 4 slots.`);
      }
      const activeStages = caseRecord.workflowMeta.subwayStages.filter((stage) => stage.state === 'active');
      if (activeStages.length !== 1) {
        errors.push(`Case ${caseRecord.id} workflowMeta.subwayStages must include exactly one active stage.`);
      }
      if (!caseRecord.workflowMeta.tabs.length || !caseRecord.workflowMeta.headerActions.length) {
        errors.push(`Case ${caseRecord.id} workflowMeta must include tabs and headerActions.`);
      }
    }
    if (caseRecord.workflowMeta && caseRecord.generalInformation?.cards?.length) {
      if (!caseRecord.generalInformation.aiSummary?.text) {
        errors.push(`Case ${caseRecord.id} generalInformation.aiSummary.text is required.`);
      }
      if (!caseRecord.generalInformation.collapsibles?.length) {
        errors.push(`Case ${caseRecord.id} generalInformation.collapsibles must not be empty.`);
      }
      caseRecord.generalInformation.cards.forEach((card) => {
        if (card.type === 'key_value_grid' && !card.fields.length) {
          errors.push(`Case ${caseRecord.id} GI card ${card.id} must include fields.`);
        }
        if (card.type === 'scoring_bar_chart' && !card.factors.length) {
          errors.push(`Case ${caseRecord.id} GI scoring card ${card.id} must include factors.`);
        }
        if (card.type === 'status_tile_grid' && !card.tiles.length) {
          errors.push(`Case ${caseRecord.id} GI status card ${card.id} must include tiles.`);
        }
      });
    }
    if (caseRecord.decisionFlow) {
      if (caseRecord.decisionFlow.caseId !== caseRecord.id) {
        errors.push(`Case ${caseRecord.id} decisionFlow.caseId must match case id.`);
      }
      if (!caseRecord.decisionFlow.steps.length || !caseRecord.decisionFlow.keyFacts.length || !caseRecord.decisionFlow.options.length || !caseRecord.decisionFlow.confirmChecks.length) {
        errors.push(`Case ${caseRecord.id} decisionFlow must include steps, keyFacts, options, and confirmChecks.`);
      }
      const optionIds = new Set(caseRecord.decisionFlow.options.map((option) => option.id));
      caseRecord.decisionFlow.options.forEach((option) => {
        if (!caseRecord.decisionFlow?.outcomes[option.id]) {
          errors.push(`Case ${caseRecord.id} decision option ${option.id} is missing an outcome.`);
        }
      });
      if (!optionIds.has(caseRecord.decisionFlow.aiRecommendation.recommendedOptionId)) {
        errors.push(`Case ${caseRecord.id} decisionFlow recommendedOptionId is missing from options.`);
      }
    }
    if (caseRecord.underwritingScoring) {
      if (caseRecord.caseKind !== 'new_business') {
        errors.push(`Case ${caseRecord.id} has scoring but is not a new business case.`);
      }
      const usesRichScoring = caseRecord.underwritingScoring.aiNet != null || Boolean(caseRecord.underwritingScoring.offerControls);
      if (usesRichScoring) {
        if (caseRecord.underwritingScoring.aiNet == null || !caseRecord.underwritingScoring.aiClass) {
          errors.push(`Case ${caseRecord.id} scoring must include aiNet and aiClass.`);
        }
        if (!caseRecord.underwritingScoring.offerControls) {
          errors.push(`Case ${caseRecord.id} scoring must include offerControls.`);
        }
      }
    }
    validateRefs(caseRecord);
    mirrorLinkedObjects({ kind: 'case', id: caseRecord.id, label: caseRecord.title }, caseRecord.linkedObjects);
  });

  entities.requirements?.forEach((requirement) => {
    const usesRequirementArchitecture = Boolean(
      requirement.aiSummary ||
      requirement.fulfillmentCriteria?.length ||
      requirement.linkedDocs?.length ||
      requirement.linkedTasks?.length ||
      requirement.blockingImpact ||
      requirement.context ||
      requirement.history?.length,
    );
    const linkedToCase = requirement.linkedObjects?.some((ref) => ref.kind === 'case');
    if (!linkedToCase) {
      errors.push(`Requirement ${requirement.id} must be linked to a case.`);
    }
    requirement.linkedDocs?.forEach((documentId) => {
      if (!entityIndex.get('document')?.has(documentId)) {
        errors.push(`Requirement ${requirement.id} linkedDocs references missing document ${documentId}.`);
      }
    });
    requirement.linkedTasks?.forEach((taskId) => {
      if (!entityIndex.get('task')?.has(taskId)) {
        errors.push(`Requirement ${requirement.id} linkedTasks references missing task ${taskId}.`);
      }
    });
    if (usesRequirementArchitecture && !requirement.aiSummary) {
      errors.push(`Requirement ${requirement.id} must include aiSummary.`);
    }
    if (usesRequirementArchitecture && !requirement.fulfillmentCriteria?.length) {
      errors.push(`Requirement ${requirement.id} must include fulfillmentCriteria.`);
    }
    if (usesRequirementArchitecture && !requirement.context) {
      errors.push(`Requirement ${requirement.id} must include context.`);
    }
    if (usesRequirementArchitecture && !requirement.history?.length) {
      errors.push(`Requirement ${requirement.id} must include history.`);
    }
    if (requirement.blockingImpact && !['high', 'medium', 'low'].includes(requirement.blockingImpact.severity)) {
      errors.push(`Requirement ${requirement.id} has invalid blockingImpact.severity.`);
    }
    if (requirement.context && !['claim', 'policy', 'person', 'application'].includes(requirement.context.type)) {
      errors.push(`Requirement ${requirement.id} has invalid context.type.`);
    }
    requirement.history?.forEach((event) => {
      if (!['green', 'amber', 'blue'].includes(event.dot)) {
        errors.push(`Requirement ${requirement.id} has invalid history dot ${event.dot}.`);
      }
    });
    mirrorLinkedObjects({ kind: 'requirement', id: requirement.id, label: requirement.label }, requirement.linkedObjects);
    validateRefs(requirement);
  });

  entities.documents?.forEach((document) => {
    if (!document.fileAvailable && !document.placeholderReason) {
      warnings.push(`Document ${document.id} is metadata-only and should include placeholderReason.`);
    }
    if (!document.aiSummary) {
      warnings.push(`Document ${document.id} should include aiSummary for document review panels.`);
    }
    if (document.linkedRequirementId && !entityIndex.get('requirement')?.has(document.linkedRequirementId)) {
      errors.push(`Document ${document.id} references missing linked requirement ${document.linkedRequirementId}.`);
    }
    if (document.linkedCaseId && !entityIndex.get('case')?.has(document.linkedCaseId)) {
      errors.push(`Document ${document.id} references missing linked case ${document.linkedCaseId}.`);
    }
    if (document.linkedRequirementId) {
      mirror({ kind: 'document', id: document.id, label: document.label }, { kind: 'requirement', id: document.linkedRequirementId, label: document.linkedRequirement ?? document.linkedRequirementId });
    }
    if (document.linkedCaseId) {
      mirror({ kind: 'document', id: document.id, label: document.label }, { kind: 'case', id: document.linkedCaseId, label: document.linkedCase ?? document.linkedCaseId });
    }
    mirrorLinkedObjects({ kind: 'document', id: document.id, label: document.label }, document.linkedObjects);
    validateRefs(document);
  });

  entities.tasks?.forEach((task) => {
    if (!task.assignee && !task.owner) {
      errors.push(`Task ${task.id} must include assignee.`);
    }
    const usesTaskArchitecture = Boolean(task.summary || task.actions?.length || task.evidenceDocuments?.length || task.contextCards?.length || task.aiNarrative);
    const simpleServiceTask =
      task.caseType === 'Service' || task.caseSubtype === 'address_change' || task.caseSubtype === 'beneficiary_change';
    const simpleServiceLinks = new Set((task.linkedObjects ?? []).map((ref) => ref.kind));
    const hasSimpleServiceLinks = simpleServiceLinks.has('request') && simpleServiceLinks.has('policy') && simpleServiceLinks.has('client');
    if (!task.linkedObjects?.some((ref) => ref.kind === 'case') && !(simpleServiceTask && hasSimpleServiceLinks)) {
      errors.push(`Task ${task.id} must be linked to a case.`);
    }
    if (usesTaskArchitecture && !task.stage) {
      errors.push(`Task ${task.id} must include stage.`);
    }
    if (usesTaskArchitecture && !task.summary?.description) {
      errors.push(`Task ${task.id} must include summary.description.`);
    }
    if (usesTaskArchitecture && !task.summary?.checklist?.length) {
      errors.push(`Task ${task.id} must include summary.checklist.`);
    }
    if (usesTaskArchitecture && !task.actions?.length) {
      errors.push(`Task ${task.id} must include actions.`);
    }
    task.evidenceDocuments?.forEach((document) => {
      if (!entityIndex.get('document')?.has(document.id)) {
        errors.push(`Task ${task.id} evidenceDocuments references missing document ${document.id}.`);
      }
      mirror({ kind: 'task', id: task.id, label: task.label }, { kind: 'document', id: document.id, label: document.name ?? document.id });
    });
    if (task.aiNarrative && !task.aiNarrative.text) {
      errors.push(`AI task ${task.id} must include aiNarrative.text.`);
    }
    if (!task.panelContext) {
      warnings.push(`Task ${task.id} should include panelContext for contextual side panels.`);
    }
    mirrorLinkedObjects({ kind: 'task', id: task.id, label: task.label }, task.linkedObjects);
    validateRefs(task);
  });

  entities.requests?.forEach((request) => {
    if (!request.systemSteps?.length) {
      warnings.push(`Request ${request.id} should include systemSteps for the intake automation panel.`);
    }
    const simpleServiceRequest = request.category === 'Address Change' || request.category === 'Beneficiary Change';
    const requestLinkKinds = new Set((request.linkedObjects ?? []).map((ref) => ref.kind));
    if (
      !request.linkedObjects?.some((ref) => ref.kind === 'case') &&
      !(simpleServiceRequest && requestLinkKinds.has('policy') && requestLinkKinds.has('client'))
    ) {
      errors.push(`Request ${request.id} must link to a case.`);
    }
    const usesRequestArchitecture = Boolean(request.form || request.aiActions?.length || request.humanActions?.length || request.linkedCase || request.linkedTasks?.length || request.linkedReqs?.length);
    if (usesRequestArchitecture && !request.form?.fields.length) {
      errors.push(`Request ${request.id} must include submitted form fields.`);
    }
    if (usesRequestArchitecture && !request.aiActions?.length) {
      errors.push(`Request ${request.id} must include aiActions.`);
    }
    if (usesRequestArchitecture && !request.humanActions?.length && !simpleServiceRequest) {
      errors.push(`Request ${request.id} must include humanActions.`);
    }
    request.linkedTasks?.forEach((taskId) => {
      if (!entityIndex.get('task')?.has(taskId)) {
        errors.push(`Request ${request.id} linkedTasks references missing task ${taskId}.`);
      }
    });
    request.linkedReqs?.forEach((requirementId) => {
      if (!entityIndex.get('requirement')?.has(requirementId)) {
        errors.push(`Request ${request.id} linkedReqs references missing requirement ${requirementId}.`);
      }
    });
    [...(request.aiActions ?? []), ...(request.humanActions ?? [])].forEach((action) => {
      if (!['AI Agent', 'System', 'Human'].includes(action.actorType)) {
        errors.push(`Request ${request.id} has invalid actorType ${action.actorType}.`);
      }
      if (!['rp-tl-dot-ai', 'rp-tl-dot-system', 'rp-tl-dot-human', 'rp-tl-dot-success', 'rp-tl-dot-warn'].includes(action.dotCls)) {
        errors.push(`Request ${request.id} has invalid dotCls ${action.dotCls}.`);
      }
    });
    mirrorLinkedObjects({ kind: 'request', id: request.id, label: request.label }, request.linkedObjects);
    validateRefs(request);
  });

  entities.communications?.forEach((communication) => {
    mirrorLinkedObjects({ kind: 'communication', id: communication.id, label: communication.subject }, communication.linkedObjects);
    validateRefs(communication);
  });
  entities.notes?.forEach((note) => {
    mirrorLinkedObjects({ kind: 'note', id: note.id, label: note.body.slice(0, 64) }, note.linkedObjects);
    validateRefs(note);
  });
  entities.events?.forEach((event) => {
    mirrorLinkedObjects({ kind: 'event', id: event.id, label: event.label }, event.linkedObjects);
    validateRefs(event);
  });
  entities.documentEvidence?.forEach((evidence) => {
    if (!entityIndex.get('document')?.has(evidence.documentId)) {
      errors.push(`Document evidence ${evidence.id} references missing document ${evidence.documentId}.`);
    }
    mirror({ kind: 'document_evidence', id: evidence.id, label: evidence.title }, { kind: 'document', id: evidence.documentId, label: evidence.title });
    mirrorLinkedObjects({ kind: 'document_evidence', id: evidence.id, label: evidence.title }, evidence.linkedObjects);
    validateRefs(evidence as unknown as { id: string; kind?: CatalogObjectKind; linkedObjects?: ObjectRef[] });
  });
  entities.assistantResponses?.forEach((response) => {
    mirrorLinkedObjects({ kind: 'assistant_response', id: response.id, label: response.prompt }, response.linkedObjects);
    validateRefs({ id: response.id, kind: 'assistant_response', linkedObjects: response.linkedObjects });
  });
  entities.aiActions?.forEach((action) => {
    if (!action.linkedObjects?.length) {
      warnings.push(`AI action ${action.id} should be linked to at least one object.`);
    }
    if (action.confidence && action.confidence >= 85 && action.status === 'suggested') {
      warnings.push(`AI action ${action.id} is high confidence and still needs review.`);
    }
    if ((action.status === 'failed' || action.status === 'rejected') && !action.rationale) {
      warnings.push(`AI action ${action.id} is ${action.status} and should include rationale.`);
    }
    if (action.relatedActivityEventId && !entityIndex.get('event')?.has(action.relatedActivityEventId)) {
      errors.push(`AI action ${action.id} references missing activity event ${action.relatedActivityEventId}.`);
    }
    if (action.relatedAssistantResponseId && !entities.assistantResponses?.some((response) => response.id === action.relatedAssistantResponseId)) {
      errors.push(`AI action ${action.id} references missing assistant response ${action.relatedAssistantResponseId}.`);
    }
    mirrorLinkedObjects({ kind: 'ai_action', id: action.id, label: action.title }, action.linkedObjects);
    validateRefs({ id: action.id, kind: 'ai_action', linkedObjects: action.linkedObjects });
  });

  value.relationships?.forEach((relationship) => {
    if (!entityIndex.get(relationship.source.kind)?.has(relationship.source.id)) {
      errors.push(`Relationship ${relationship.id} source references missing ${relationship.source.kind} ${relationship.source.id}.`);
    }
    if (!entityIndex.get(relationship.target.kind)?.has(relationship.target.id)) {
      errors.push(`Relationship ${relationship.id} target references missing ${relationship.target.kind} ${relationship.target.id}.`);
    }
    const key = `${relationship.source.kind}:${relationship.source.id}->${relationship.target.kind}:${relationship.target.id}`;
    if (!mirrorRelationshipKeys.has(key)) {
      warnings.push(`Relationship ${relationship.id} is not mirrored by entity linkedObjects or typed references.`);
    }
  });

  return { valid: errors.length === 0, errors, warnings };
}
