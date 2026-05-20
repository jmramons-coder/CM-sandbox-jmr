import type { SystemDataset } from './multi-case-dataset';
import type { CaseRecord, CaseStructuredField, CaseTabConfiguration, CaseWorkflowStepState } from '../domain/objectRefs';
import { GUARDIAN_DATASET_ID } from './guardianDemoCaseIds';
import { GUARDIAN_CASE_RECORDS } from './guardian-case-records';
import { GUARDIAN_CASE_WORKFLOW_GI_RECORDS } from './guardian-case-workflow-gi-records';
import { GUARDIAN_DECISION_FLOW_RECORDS } from './guardian-decision-records';
import { GUARDIAN_SCORING_RECORDS } from './guardian-scoring-records';
import {
  GUARDIAN_AGENT_RECORDS,
  GUARDIAN_APPLICATION_RECORDS,
  GUARDIAN_CASE_ENTITY_LINKS,
  GUARDIAN_CLIENT_RECORDS,
  GUARDIAN_POLICY_RECORDS,
} from './guardian-entity-records';
import { GUARDIAN_REQUIREMENT_RECORDS } from './guardian-requirement-records';
import { GUARDIAN_TASK_RECORDS } from './guardian-task-records';
import { GUARDIAN_DOCUMENT_RECORDS } from './guardian-document-records';
import { GUARDIAN_DOCUMENT_EVIDENCE_RECORDS } from './guardian-document-evidence-records';
import { GUARDIAN_REQUEST_RECORDS } from './guardian-request-records';
import { GUARDIAN_ASSISTANT_RESPONSES } from './guardian-assistant-responses';
import { GUARDIAN_ACTIVITY_RECORDS } from './guardian-activity-records';

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
  const linkedObjects = GUARDIAN_CASE_ENTITY_LINKS[caseRecord.id];
  if (!linkedObjects?.length) return caseRecord;
  return { ...caseRecord, linkedObjects };
}

function withCaseWorkflowGi(caseRecord: CaseRecord): CaseRecord {
  const rich = GUARDIAN_CASE_WORKFLOW_GI_RECORDS[caseRecord.id];
  if (!rich) return caseRecord;
  const activeStage = rich.workflowMeta.subwayStages.find((stage) => stage.state === 'active');
  const decisionFlow = GUARDIAN_DECISION_FLOW_RECORDS[caseRecord.id];
  const underwritingScoring = GUARDIAN_SCORING_RECORDS[caseRecord.id] ?? caseRecord.underwritingScoring;
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

export const GUARDIAN_DATASET: SystemDataset = {
  id: GUARDIAN_DATASET_ID,
  schemaVersion: 2,
  label: 'Guardian 1821 UK demo',
  organizationLabel: 'Guardian',
  environmentFit: 'Five UK protection cases (IP, CI, death, and new business) with tasks, requirements, and document metadata.',
  enabledBusinessLines: ['claim', 'new_business'],
  generationProfileId: 'guardian-uk-seed',
  targetRecordCount: 135,
  documentMode: 'metadata_only',
  displayCurrency: 'GBP',
  description: 'Guardian 1821 branded demo dataset. Claims and new-business coverage in GBP; document files added later.',
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
  cases: GUARDIAN_CASE_RECORDS.map((caseRecord) => withCaseWorkflowGi(withCaseEntityLinks(caseRecord))),
  clients: GUARDIAN_CLIENT_RECORDS,
  policies: GUARDIAN_POLICY_RECORDS,
  agents: GUARDIAN_AGENT_RECORDS,
  applications: GUARDIAN_APPLICATION_RECORDS,
  tasks: GUARDIAN_TASK_RECORDS,
  requirements: GUARDIAN_REQUIREMENT_RECORDS,
  documents: GUARDIAN_DOCUMENT_RECORDS,
  requests: GUARDIAN_REQUEST_RECORDS,
  communications: [],
  notes: [],
  activityEvents: GUARDIAN_ACTIVITY_RECORDS,
  documentEvidence: GUARDIAN_DOCUMENT_EVIDENCE_RECORDS,
  assistantResponses: GUARDIAN_ASSISTANT_RESPONSES,
  aiActions: [],
  legacyMockOverlayEnabled: false,
};
