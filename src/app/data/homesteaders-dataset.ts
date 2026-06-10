import type { SystemDataset } from './multi-case-dataset';
import type { CaseRecord, CaseStructuredField, CaseTabConfiguration, CaseWorkflowStepState } from '../domain/objectRefs';
import { HOMESTEADERS_DATASET_ID } from './homesteadersDemoCaseIds';
import { HOMESTEADERS_CASE_RECORDS } from './homesteaders-case-records';
import { HOMESTEADERS_CASE_WORKFLOW_GI_RECORDS } from './homesteaders-case-workflow-gi-records';
import { HOMESTEADERS_DECISION_FLOW_RECORDS } from './homesteaders-decision-records';
import { HOMESTEADERS_SCORING_RECORDS } from './homesteaders-scoring-records';
import {
  HOMESTEADERS_AGENT_RECORDS,
  HOMESTEADERS_APPLICATION_RECORDS,
  HOMESTEADERS_CASE_ENTITY_LINKS,
  HOMESTEADERS_CLIENT_RECORDS,
  HOMESTEADERS_POLICY_RECORDS,
} from './homesteaders-entity-records';
import { HOMESTEADERS_REQUIREMENT_RECORDS } from './homesteaders-requirement-records';
import { HOMESTEADERS_TASK_RECORDS } from './homesteaders-task-records';
import { HOMESTEADERS_DOCUMENT_RECORDS } from './homesteaders-document-records';
import { HOMESTEADERS_DOCUMENT_EVIDENCE_RECORDS } from './homesteaders-document-evidence-records';
import { HOMESTEADERS_REQUEST_RECORDS } from './homesteaders-request-records';
import { HOMESTEADERS_ASSISTANT_RESPONSES } from './homesteaders-assistant-responses';
import { HOMESTEADERS_ACTIVITY_RECORDS } from './homesteaders-activity-records';

function tabIdFromLabel(label: string): CaseTabConfiguration {
  const normalized = label.toLowerCase();
  const id =
    normalized === 'general information' ? 'overview'
      : normalized === 'relationships' ? 'related_cases'
        : normalized === 'activities' ? 'history'
          : normalized === 'application' ? 'activation'
            : normalized;
  const utilityEntity =
    id === 'requirements' ? 'requirement' as const
      : id === 'tasks' ? 'task' as const
        : id === 'documents' ? 'document' as const
          : id === 'communications' ? 'communication' as const
            : id === 'history' ? 'event' as const
              : undefined;
  return { id, label, enabled: true, utilityEntity };
}

function stepStatusFromState(state: 'done' | 'active' | 'next'): CaseWorkflowStepState['status'] {
  if (state === 'done') return 'completed';
  if (state === 'active') return 'active';
  return 'pending';
}

function fieldFromContextSlot(slot: { slot: number; label: string; value: string; sub?: string | null; valueColor?: string | null }): CaseStructuredField {
  return {
    id: `workflow-slot-${slot.slot}`,
    label: slot.label,
    value: slot.value,
    type: slot.valueColor ? 'status' : 'text',
    enabled: true,
    muted: false,
  };
}

function withCaseEntityLinks(caseRecord: CaseRecord): CaseRecord {
  const linkedObjects = HOMESTEADERS_CASE_ENTITY_LINKS[caseRecord.id];
  if (!linkedObjects?.length) return caseRecord;
  return { ...caseRecord, linkedObjects };
}

function withCaseWorkflowGi(caseRecord: CaseRecord): CaseRecord {
  const rich = HOMESTEADERS_CASE_WORKFLOW_GI_RECORDS[caseRecord.id];
  if (!rich) return caseRecord;
  const activeStage = rich.workflowMeta.subwayStages.find((stage) => stage.state === 'active');
  const decisionFlow = HOMESTEADERS_DECISION_FLOW_RECORDS[caseRecord.id];
  const underwritingScoring = HOMESTEADERS_SCORING_RECORDS[caseRecord.id] ?? caseRecord.underwritingScoring;
  return {
    ...caseRecord,
    status: rich.workflowMeta.status,
    statusCode: rich.workflowMeta.statusClass,
    activeStepId: activeStage?.slug ?? caseRecord.activeStepId,
    assignee: {
      kind: 'case',
      id: caseRecord.id,
      label: rich.workflowMeta.assignee,
      role: 'owner',
    },
    identification: {
      ...(caseRecord.identification ?? {
        caseId: caseRecord.id,
        caseTypeId: caseRecord.workflowTemplateId,
        caseTypeLabel: caseRecord.caseTypeLabel ?? caseRecord.title,
        status: caseRecord.status,
        externalIds: [],
      }),
      caseId: rich.workflowMeta.caseId,
      caseTypeLabel: rich.workflowMeta.breadcrumb,
      status: rich.workflowMeta.status,
      statusCode: rich.workflowMeta.statusClass,
    },
    workflowMeta: rich.workflowMeta,
    contextCard: {
      ...(caseRecord.contextCard ?? {
        primaryPartyRef: caseRecord.primaryParty,
        headlineMetrics: [],
      }),
      headlineMetrics: rich.workflowMeta.contextBar.map(fieldFromContextSlot),
      sla: {
        dueAt: caseRecord.slaDue,
        label: rich.workflowMeta.contextBar.find((slot) => slot.label.toLowerCase() === 'sla')?.value ?? caseRecord.contextCard?.sla?.label ?? 'N/A',
        status: rich.workflowMeta.contextBar.some((slot) => slot.valueColor === 'danger') ? 'breached' : rich.workflowMeta.contextBar.some((slot) => slot.valueColor === 'warning') ? 'warning' : 'normal',
      },
    },
    workflowState: {
      templateId: caseRecord.workflowTemplateId,
      phaseId: caseRecord.phaseId,
      activeStepId: activeStage?.slug ?? caseRecord.activeStepId,
      steps: rich.workflowMeta.subwayStages.map((stage) => ({
        id: stage.slug,
        label: stage.name,
        phaseId: caseRecord.phaseId,
        status: stepStatusFromState(stage.state),
      })),
    },
    tabs: rich.workflowMeta.tabs.map(tabIdFromLabel),
    generalInformation: rich.generalInformation,
    underwritingScoring,
    decisionFlow,
    analysis: {
      ...(caseRecord.analysis ?? {}),
      confidence: rich.generalInformation.aiSummary?.confidence ?? caseRecord.analysis?.confidence,
      narrative: rich.generalInformation.aiSummary?.text ?? caseRecord.analysis?.narrative,
    },
  };
}

export const HOMESTEADERS_DATASET: SystemDataset = {
  id: HOMESTEADERS_DATASET_ID,
  schemaVersion: 2,
  label: 'Homesteaders Life Company US demo',
  organizationLabel: 'Homesteaders Life Company',
  environmentFit: 'Five US preneed cases (two death claims, three NB underwriting tiers) with funeral home partners, tasks, requirements, and document metadata.',
  enabledBusinessLines: ['claim', 'new_business'],
  generationProfileId: 'homesteaders-us-seed',
  targetRecordCount: 120,
  documentMode: 'metadata_only',
  displayCurrency: 'USD',
  description: 'Homesteaders Life Company branded demo dataset. Preneed funeral insurance in USD; funeral home channel via homesteaderslife.com.',
  objectDomains: [
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
  cases: HOMESTEADERS_CASE_RECORDS.map((caseRecord) => withCaseWorkflowGi(withCaseEntityLinks(caseRecord))),
  clients: HOMESTEADERS_CLIENT_RECORDS,
  policies: HOMESTEADERS_POLICY_RECORDS,
  agents: HOMESTEADERS_AGENT_RECORDS,
  applications: HOMESTEADERS_APPLICATION_RECORDS,
  tasks: HOMESTEADERS_TASK_RECORDS,
  requirements: HOMESTEADERS_REQUIREMENT_RECORDS,
  documents: HOMESTEADERS_DOCUMENT_RECORDS,
  requests: HOMESTEADERS_REQUEST_RECORDS,
  communications: [],
  notes: [],
  activityEvents: HOMESTEADERS_ACTIVITY_RECORDS,
  documentEvidence: HOMESTEADERS_DOCUMENT_EVIDENCE_RECORDS,
  assistantResponses: HOMESTEADERS_ASSISTANT_RESPONSES,
  aiActions: [],
  legacyMockOverlayEnabled: false,
};
