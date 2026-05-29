import { countDatasetObjects, findRelationshipIssues, validateModuleBoundaryRules } from '../domain/dataArchitecture';
import { CASE_TYPE_ANATOMY_DEFINITIONS } from '../domain/entityAnatomy';
import type { CaseKind, WorkObjectKind } from '../domain/objectRefs';
import type { SystemDataset } from './multi-case-dataset';
import type { DatasetValidationSummary } from './datasetPackageSchema';
import { deriveAiActionsFromDataset } from './aiActionDerivation';
import {
  isSimpleServiceRequestCategory,
  isSimpleServiceTask,
  requestHasSimpleServiceLinks,
  taskHasSimpleServiceLinks,
} from './simpleServiceRules';

export interface DataQualityCheck {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
}

function addDuplicateIdErrors(errors: string[], label: string, rows: Array<{ id: string }>) {
  const seen = new Set<string>();
  rows.forEach((row) => {
    if (seen.has(row.id)) errors.push(`Duplicate ${label} id ${row.id}.`);
    seen.add(row.id);
  });
}

function addGlobalIdWarnings(warnings: string[], groups: Array<{ label: string; rows: Array<{ id: string }> }>) {
  const seen = new Map<string, string>();
  groups.forEach((group) => {
    group.rows.forEach((row) => {
      const existing = seen.get(row.id);
      if (existing && existing !== group.label) {
        warnings.push(`ID ${row.id} appears in both ${existing} and ${group.label}; prefer globally unique IDs for database exports.`);
      }
      seen.set(row.id, group.label);
    });
  });
}

function hasEntity(dataset: SystemDataset, kind: WorkObjectKind, id: string): boolean {
  switch (kind) {
    case 'case':
      return dataset.cases.some((item) => item.id === id);
    case 'client':
      return dataset.clients.some((item) => item.id === id);
    case 'policy':
      return dataset.policies.some((item) => item.id === id);
    case 'agent':
      return dataset.agents.some((item) => item.id === id);
    case 'application':
      return dataset.applications.some((item) => item.id === id);
    case 'task':
      return dataset.tasks.some((item) => item.id === id);
    case 'request':
      return dataset.requests.some((item) => item.id === id);
    case 'requirement':
      return dataset.requirements.some((item) => item.id === id);
    case 'document':
      return dataset.documents.some((item) => item.id === id);
    case 'communication':
      return dataset.communications.some((item) => item.id === id);
    case 'note':
      return dataset.notes.some((item) => item.id === id);
    case 'event':
      return dataset.activityEvents.some((item) => item.id === id);
    default:
      return false;
  }
}

export function validateSystemDataset(dataset: SystemDataset): DatasetValidationSummary {
  const errors: string[] = [];
  const warnings: string[] = [];

  addDuplicateIdErrors(errors, 'user', dataset.users ?? []);
  addDuplicateIdErrors(errors, 'client', dataset.clients);
  addDuplicateIdErrors(errors, 'policy', dataset.policies);
  addDuplicateIdErrors(errors, 'agent', dataset.agents);
  addDuplicateIdErrors(errors, 'application', dataset.applications);
  addDuplicateIdErrors(errors, 'case', dataset.cases);
  addDuplicateIdErrors(errors, 'task', dataset.tasks);
  addDuplicateIdErrors(errors, 'document', dataset.documents);
  addDuplicateIdErrors(errors, 'request', dataset.requests);
  addDuplicateIdErrors(errors, 'requirement', dataset.requirements);
  addDuplicateIdErrors(errors, 'communication', dataset.communications);
  addDuplicateIdErrors(errors, 'note', dataset.notes);
  addDuplicateIdErrors(errors, 'event', dataset.activityEvents);
  addDuplicateIdErrors(errors, 'document evidence', dataset.documentEvidence);
  addDuplicateIdErrors(errors, 'AI action', dataset.aiActions);
  addGlobalIdWarnings(warnings, [
    { label: 'users', rows: dataset.users ?? [] },
    { label: 'clients', rows: dataset.clients },
    { label: 'policies', rows: dataset.policies },
    { label: 'agents', rows: dataset.agents },
    { label: 'applications', rows: dataset.applications },
    { label: 'cases', rows: dataset.cases },
    { label: 'tasks', rows: dataset.tasks },
    { label: 'documents', rows: dataset.documents },
    { label: 'requests', rows: dataset.requests },
    { label: 'requirements', rows: dataset.requirements },
    { label: 'communications', rows: dataset.communications },
    { label: 'notes', rows: dataset.notes },
    { label: 'events', rows: dataset.activityEvents },
    { label: 'documentEvidence', rows: dataset.documentEvidence },
    { label: 'aiActions', rows: dataset.aiActions },
  ]);

  findRelationshipIssues(dataset).forEach((issue) => errors.push(issue.message));
  validateModuleBoundaryRules(dataset).forEach((issue) => warnings.push(issue.message));

  dataset.applications.forEach((application) => {
    if (!hasEntity(dataset, 'client', application.clientId)) {
      errors.push(`Application ${application.id} references missing client ${application.clientId}.`);
    }
  });

  dataset.documents.forEach((document) => {
    if (!document.fileType) {
      warnings.push(`Document ${document.id} should include fileType so previews can show consistent file metadata.`);
    }
    if (document.linkedRequirementId && !hasEntity(dataset, 'requirement', document.linkedRequirementId)) {
      errors.push(`Document ${document.id} references missing linked requirement ${document.linkedRequirementId}.`);
    }
    if (document.linkedCaseId && !hasEntity(dataset, 'case', document.linkedCaseId)) {
      errors.push(`Document ${document.id} references missing linked case ${document.linkedCaseId}.`);
    }
    if (document.linkedRequirementId && !document.linkedObjects.some((ref) => ref.kind === 'requirement' && ref.id === document.linkedRequirementId)) {
      warnings.push(`Document ${document.id} should mirror linkedRequirementId ${document.linkedRequirementId} in linkedObjects.`);
    }
    if (document.linkedCaseId && !document.linkedObjects.some((ref) => ref.kind === 'case' && ref.id === document.linkedCaseId)) {
      warnings.push(`Document ${document.id} should mirror linkedCaseId ${document.linkedCaseId} in linkedObjects.`);
    }
  });

  dataset.requirements.forEach((requirement) => {
    const usesRequirementArchitecture = Boolean(
      requirement.aiSummary ||
      requirement.fulfillmentCriteria?.length ||
      requirement.linkedDocs?.length ||
      requirement.linkedTasks?.length ||
      requirement.blockingImpact ||
      requirement.context ||
      requirement.history?.length,
    );
    if (!requirement.linkedObjects?.some((ref) => ref.kind === 'case')) {
      errors.push(`Requirement ${requirement.id} must link to a case.`);
    }
    requirement.linkedDocs?.forEach((documentId) => {
      if (!hasEntity(dataset, 'document', documentId)) {
        errors.push(`Requirement ${requirement.id} linkedDocs references missing document ${documentId}.`);
      }
    });
    requirement.linkedTasks?.forEach((taskId) => {
      if (!hasEntity(dataset, 'task', taskId)) {
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
  });

  const userIds = new Set((dataset.users ?? []).map((user) => user.id));

  dataset.tasks.forEach((task) => {
    if (!task.assignee && !task.owner) {
      errors.push(`Task ${task.id} must include assignee.`);
    }
    if (
      task.assigneeKind === 'user'
      && task.assigneeId
      && userIds.size > 0
      && !userIds.has(task.assigneeId)
    ) {
      warnings.push(`Task ${task.id} assigneeId ${task.assigneeId} is not in dataset.users.`);
    }
    const usesTaskArchitecture = Boolean(task.summary || task.actions?.length || task.evidenceDocuments?.length || task.contextCards?.length || task.aiNarrative);
    const linkedCaseId = task.linkedObjects.find((ref) => ref.kind === 'case')?.id;
    const simpleServiceTask = isSimpleServiceTask(task);
    if (!linkedCaseId && !(simpleServiceTask && taskHasSimpleServiceLinks(task.linkedObjects))) {
      errors.push(`Task ${task.id} must link to a case.`);
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
      errors.push(`Task ${task.id} must include at least one action.`);
    }
    task.evidenceDocuments?.forEach((document) => {
      if (!dataset.documents.some((row) => row.id === document.id)) {
        errors.push(`Task ${task.id} evidenceDocuments references missing document ${document.id}.`);
      }
      if (!task.linkedObjects.some((ref) => ref.kind === 'document' && ref.id === document.id)) {
        warnings.push(`Task ${task.id} should mirror evidence document ${document.id} in linkedObjects.`);
      }
    });
    if (task.aiNarrative && !task.aiNarrative.text) {
      errors.push(`AI task ${task.id} must include aiNarrative.text.`);
    }
  });

  dataset.documentEvidence.forEach((evidence) => {
    if (!dataset.documents.some((document) => document.id === evidence.documentId)) {
      errors.push(`Document evidence ${evidence.id} references missing document ${evidence.documentId}.`);
    }
    if (!evidence.pages.length) {
      warnings.push(`Document evidence ${evidence.id} should include at least one page marker.`);
    }
    if (!evidence.findings.length) {
      warnings.push(`Document evidence ${evidence.id} should include at least one finding.`);
    }
    evidence.linkedObjects.forEach((ref) => {
      if (!hasEntity(dataset, ref.kind, ref.id)) {
        errors.push(`Document evidence ${evidence.id} references missing ${ref.kind} ${ref.id}.`);
      }
    });
  });

  dataset.assistantResponses.forEach((response) => {
    if (!response.linkedObjects.length) {
      warnings.push(`Assistant response ${response.id} should include linked context objects.`);
    }
    response.linkedObjects.forEach((ref) => {
      if (!hasEntity(dataset, ref.kind, ref.id)) {
        errors.push(`Assistant response ${response.id} references missing ${ref.kind} ${ref.id}.`);
      }
    });
  });

  dataset.requests.forEach((request) => {
    const simpleServiceRequest = isSimpleServiceRequestCategory(request.category);
    if (
      !request.linkedObjects?.some((ref) => ref.kind === 'case') &&
      !(simpleServiceRequest && requestHasSimpleServiceLinks(request.linkedObjects))
    ) {
      errors.push(`Request ${request.id} must link to a case.`);
    }
    request.linkedTasks?.forEach((taskId) => {
      if (!hasEntity(dataset, 'task', taskId)) {
        errors.push(`Request ${request.id} linkedTasks references missing task ${taskId}.`);
      }
    });
    request.linkedReqs?.forEach((requirementId) => {
      if (!hasEntity(dataset, 'requirement', requirementId)) {
        errors.push(`Request ${request.id} linkedReqs references missing requirement ${requirementId}.`);
      }
    });
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
    [...(request.aiActions ?? []), ...(request.humanActions ?? [])].forEach((action) => {
      if (!['AI Agent', 'System', 'Human'].includes(action.actorType)) {
        errors.push(`Request ${request.id} has invalid actorType ${action.actorType}.`);
      }
      if (!['rp-tl-dot-ai', 'rp-tl-dot-system', 'rp-tl-dot-human', 'rp-tl-dot-success', 'rp-tl-dot-warn'].includes(action.dotCls)) {
        errors.push(`Request ${request.id} has invalid dotCls ${action.dotCls}.`);
      }
    });
  });

  dataset.aiActions.forEach((action) => {
    if (!action.linkedObjects.length) {
      warnings.push(`AI action ${action.id} should link to at least one object.`);
    }
    action.linkedObjects.forEach((ref) => {
      if (!hasEntity(dataset, ref.kind, ref.id)) {
        errors.push(`AI action ${action.id} references missing ${ref.kind} ${ref.id}.`);
      }
    });
    if ((action.status === 'failed' || action.status === 'rejected') && !action.rationale) {
      warnings.push(`AI action ${action.id} is ${action.status} and should include rationale.`);
    }
    if ((action.confidence ?? 0) >= 85 && action.status === 'suggested') {
      warnings.push(`AI action ${action.id} is high confidence and still needs human review.`);
    }
    if (action.relatedActivityEventId && !hasEntity(dataset, 'event', action.relatedActivityEventId)) {
      errors.push(`AI action ${action.id} references missing activity event ${action.relatedActivityEventId}.`);
    }
    if (action.relatedAssistantResponseId && !dataset.assistantResponses.some((response) => response.id === action.relatedAssistantResponseId)) {
      errors.push(`AI action ${action.id} references missing assistant response ${action.relatedAssistantResponseId}.`);
    }
  });

  const derivedActions = deriveAiActionsFromDataset(dataset);
  if (!dataset.aiActions.length && derivedActions.length) {
    warnings.push(`${derivedActions.length} AI action(s) are derived from AI fields but not stored explicitly.`);
  }

  dataset.cases.forEach((caseRecord) => {
    const anatomy = CASE_TYPE_ANATOMY_DEFINITIONS.find((item) => item.caseKind === caseRecord.caseKind);
    anatomy?.requiredMainEntityLinks.forEach((kind) => {
      const satisfied =
        caseRecord.primaryParty.kind === kind ||
        caseRecord.participants.some((participant) => participant.kind === kind) ||
        caseRecord.linkedObjects.some((ref) => ref.kind === kind);
      if (!satisfied) {
        warnings.push(`Case ${caseRecord.id} is missing required ${kind} relationship for ${caseRecord.caseKind}.`);
      }
    });
    caseRecord.participants.forEach((participant) => {
      if (!hasEntity(dataset, participant.kind, participant.id)) {
        errors.push(`Case ${caseRecord.id} participant references missing ${participant.kind} ${participant.id}.`);
      }
    });
    if (!dataset.tasks.some((task) => task.linkedObjects.some((ref) => ref.kind === 'case' && ref.id === caseRecord.id))) {
      warnings.push(`Case ${caseRecord.id} has no linked tasks; runtime queues may need legacy fallback.`);
    }
    if (!dataset.communications.some((communication) => communication.linkedObjects.some((ref) => ref.kind === 'case' && ref.id === caseRecord.id))) {
      warnings.push(`Case ${caseRecord.id} has no linked communications for timeline panels.`);
    }
    if (caseRecord.workflowMeta) {
      if (caseRecord.workflowMeta.caseId !== caseRecord.id) {
        errors.push(`Case ${caseRecord.id} workflowMeta.caseId must match case id.`);
      }
      if (caseRecord.workflowMeta.contextBar.length !== 4) {
        errors.push(`Case ${caseRecord.id} workflowMeta.contextBar must include exactly 4 slots.`);
      }
      caseRecord.workflowMeta.contextBar.forEach((slot) => {
        if (slot.subType && !['reference_link', 'descriptor'].includes(slot.subType)) {
          errors.push(`Case ${caseRecord.id} workflowMeta context slot ${slot.slot} has invalid subType.`);
        }
        if (slot.valueColor && !['danger', 'warning'].includes(slot.valueColor)) {
          errors.push(`Case ${caseRecord.id} workflowMeta context slot ${slot.slot} has invalid valueColor.`);
        }
      });
      const activeStages = caseRecord.workflowMeta.subwayStages.filter((stage) => stage.state === 'active');
      if (activeStages.length !== 1) {
        errors.push(`Case ${caseRecord.id} workflowMeta.subwayStages must include exactly one active stage.`);
      }
      caseRecord.workflowMeta.subwayStages.forEach((stage) => {
        if (!['done', 'active', 'next'].includes(stage.state)) {
          errors.push(`Case ${caseRecord.id} workflowMeta stage ${stage.slug} has invalid state.`);
        }
      });
      if (!caseRecord.workflowMeta.tabs.length) {
        errors.push(`Case ${caseRecord.id} workflowMeta.tabs must not be empty.`);
      }
      if (!caseRecord.workflowMeta.headerActions.length) {
        errors.push(`Case ${caseRecord.id} workflowMeta.headerActions must not be empty.`);
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
        if (!['success', 'warning', 'danger', 'info'].includes(option.submitStyle)) {
          errors.push(`Case ${caseRecord.id} decision option ${option.id} has invalid submitStyle.`);
        }
        if (!['pf', 'pp', 'pr', 'po'].includes(option.tagCls)) {
          errors.push(`Case ${caseRecord.id} decision option ${option.id} has invalid tagCls.`);
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
        caseRecord.underwritingScoring.debits.forEach((item) => {
          if (!item.id || !item.category || item.points == null || !item.confidence || item.pending == null || item.aiGenerated == null || !item.condition) {
            errors.push(`Case ${caseRecord.id} scoring debit ${item.id} is missing required fields.`);
          }
        });
        caseRecord.underwritingScoring.credits.forEach((item) => {
          if (!item.id || !item.category || item.points == null || !item.confidence || item.pending == null || item.aiGenerated == null || !item.factor) {
            errors.push(`Case ${caseRecord.id} scoring credit ${item.id} is missing required fields.`);
          }
        });
      }
    }
  });

  dataset.communications.forEach((communication) => {
    if (!communication.createdAt) {
      warnings.push(`Communication ${communication.id} should include createdAt for sortable case timelines.`);
    }
  });

  const applicationCaseIds = new Set(
    dataset.cases
      .filter((caseRecord) => caseRecord.caseKind === 'new_business')
      .map((caseRecord) => caseRecord.id),
  );
  if (applicationCaseIds.size && !dataset.applications.length) {
    warnings.push('New business datasets should include application records for eApp-backed views.');
  }

  const identityKeys = new Map<string, string>();
  dataset.clients.forEach((client) => {
    const key = `${client.name.toLowerCase()}|${client.profile?.dob ?? ''}`;
    if (!client.profile?.dob) return;
    const existing = identityKeys.get(key);
    if (existing && existing !== client.id) {
      warnings.push(`Possible duplicate client identity: ${existing} and ${client.id} share name and DOB.`);
    }
    identityKeys.set(key, client.id);
  });

  return { valid: errors.length === 0, errors, warnings };
}

export function runDatasetQualityChecks(dataset: SystemDataset): DataQualityCheck[] {
  const counts = countDatasetObjects(dataset);
  const relationshipIssues = findRelationshipIssues(dataset);
  const validation = validateSystemDataset(dataset);
  const caseKinds = new Set<CaseKind>(dataset.cases.map((item) => item.caseKind));
  const checks: DataQualityCheck[] = [
    {
      id: 'relationships',
      label: 'Relationship integrity',
      status: relationshipIssues.length ? 'fail' : 'pass',
      message: relationshipIssues.length ? `${relationshipIssues.length} relationship issue(s) found.` : 'No orphan linkedObjects detected.',
    },
    {
      id: 'field-coverage',
      label: 'Field coverage',
      status: dataset.cases.every((item) => item.facts.length && item.sections.length) ? 'pass' : 'warn',
      message: 'Cases should include facts and sections for anatomy-driven overviews.',
    },
    {
      id: 'utility-density',
      label: 'Utility density',
      status: dataset.tasks.length >= dataset.cases.length && dataset.documents.length >= dataset.cases.length ? 'pass' : 'warn',
      message: `${dataset.tasks.length} tasks and ${dataset.documents.length} documents for ${dataset.cases.length} cases.`,
    },
    {
      id: 'business-lines',
      label: 'Business line coverage',
      status: caseKinds.size >= Math.min(2, dataset.enabledBusinessLines?.length ?? 1) ? 'pass' : 'warn',
      message: `${caseKinds.size} case type(s) represented in ${counts.total} records.`,
    },
    {
      id: 'legacy-readiness',
      label: 'Legacy overlay readiness',
      status: dataset.cases.length && dataset.tasks.length && dataset.documents.length && dataset.requests.length ? 'pass' : 'warn',
      message: 'Dataset should remain useful when the legacy overlay is off.',
    },
    {
      id: 'ai-actions',
      label: 'AI actions',
      status: dataset.aiActions.length || deriveAiActionsFromDataset(dataset).length ? 'pass' : 'warn',
      message: `${dataset.aiActions.length} explicit, ${deriveAiActionsFromDataset(dataset).length} derived AI action(s).`,
    },
    {
      id: 'system-validation',
      label: 'System validation',
      status: validation.errors.length ? 'fail' : validation.warnings.length ? 'warn' : 'pass',
      message: validation.errors.length ? `${validation.errors.length} errors found.` : validation.warnings.length ? `${validation.warnings.length} warnings found.` : 'Dataset passes canonical validation.',
    },
  ];
  return checks;
}
