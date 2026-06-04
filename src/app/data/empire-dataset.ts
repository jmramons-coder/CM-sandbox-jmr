import type { SystemDataset } from './multi-case-dataset';
import type { CaseRecord, CaseStructuredField, CaseTabConfiguration, CaseWorkflowStepState } from '../domain/objectRefs';
import { EMPIRE_DATASET_ID } from './empireDemoCaseIds';
import { EMPIRE_CASE_RECORDS } from './empire-case-records';
import { EMPIRE_CASE_WORKFLOW_GI_RECORDS } from './empire-case-workflow-gi-records';
import { EMPIRE_DECISION_FLOW_RECORDS } from './empire-decision-records';
import { EMPIRE_SCORING_RECORDS } from './empire-scoring-records';
import {
  EMPIRE_AGENT_RECORDS,
  EMPIRE_APPLICATION_RECORDS,
  EMPIRE_CASE_ENTITY_LINKS,
  EMPIRE_CLIENT_RECORDS,
  EMPIRE_POLICY_RECORDS,
} from './empire-entity-records';
import { EMPIRE_REQUIREMENT_RECORDS } from './empire-requirement-records';
import { EMPIRE_TASK_RECORDS } from './empire-task-records';
import { EMPIRE_DOCUMENT_RECORDS } from './empire-document-records';
import { EMPIRE_DOCUMENT_EVIDENCE_RECORDS } from './empire-document-evidence-records';
import { EMPIRE_REQUEST_RECORDS } from './empire-request-records';
import { EMPIRE_ASSISTANT_RESPONSES } from './empire-assistant-responses';
import { EMPIRE_ACTIVITY_RECORDS } from './empire-activity-records';
import { applyEmpireAddressChangeOverlay } from './empireAddressChangeOverlay';

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
  const linkedObjects = EMPIRE_CASE_ENTITY_LINKS[caseRecord.id];
  if (!linkedObjects?.length) return caseRecord;
  return { ...caseRecord, linkedObjects };
}

function withCaseWorkflowGi(caseRecord: CaseRecord): CaseRecord {
  const rich = EMPIRE_CASE_WORKFLOW_GI_RECORDS[caseRecord.id];
  if (!rich) return caseRecord;
  const activeStage = rich.workflowMeta.subwayStages.find((stage) => stage.state === 'active');
  const decisionFlow = EMPIRE_DECISION_FLOW_RECORDS[caseRecord.id];
  const underwritingScoring = EMPIRE_SCORING_RECORDS[caseRecord.id] ?? caseRecord.underwritingScoring;
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

export const EMPIRE_DATASET: SystemDataset = applyEmpireAddressChangeOverlay({
  id: EMPIRE_DATASET_ID,
  schemaVersion: 2,
  label: 'Empire Life Canada demo',
  organizationLabel: 'Empire Life',
  environmentFit: 'Six Canadian protection cases (DI, CI, death, and three NB underwriting tiers) with tasks, requirements, and document metadata.',
  enabledBusinessLines: ['claim', 'new_business'],
  generationProfileId: 'empire-ca-seed',
  targetRecordCount: 155,
  documentMode: 'metadata_only',
  displayCurrency: 'CAD',
  description: 'Empire Life branded demo dataset. Claims and new-business coverage in CAD; advisor-led distribution via empire.ca/advisor.',
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
  cases: EMPIRE_CASE_RECORDS.map((caseRecord) => withCaseWorkflowGi(withCaseEntityLinks(caseRecord))),
  clients: EMPIRE_CLIENT_RECORDS,
  policies: EMPIRE_POLICY_RECORDS,
  agents: EMPIRE_AGENT_RECORDS,
  applications: EMPIRE_APPLICATION_RECORDS,
  tasks: EMPIRE_TASK_RECORDS,
  requirements: EMPIRE_REQUIREMENT_RECORDS,
  documents: EMPIRE_DOCUMENT_RECORDS,
  requests: EMPIRE_REQUEST_RECORDS,
  communications: [],
  notes: [],
  activityEvents: EMPIRE_ACTIVITY_RECORDS,
  documentEvidence: EMPIRE_DOCUMENT_EVIDENCE_RECORDS,
  assistantResponses: EMPIRE_ASSISTANT_RESPONSES,
  aiActions: [],
  legacyMockOverlayEnabled: false,
});
