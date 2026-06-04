import type { CaseOverview, CaseRequirement, Task } from '../types';
import type { SystemDataset } from '../data/multi-case-dataset';
import type { CaseAnatomySettings } from '../domain/dataArchitecture';
import { getCaseOverview } from '../data/mock-cases';
import { listTasks } from '../data/objectRepository';
import { buildCaseBrief } from '../data/caseBrief/buildCaseBrief';
import { buildWopOverlayContextualTasks } from '../data/wopClaimDemoOverlay';
import { DEMO_CASE_IDS } from '../data/demoCaseIds';
import { resolveCaseCopilotContext } from './caseCopilotContext';
import type { BuildCaseCopilotBriefInput } from './buildCaseCopilotBrief';
import { resolveTaskForCaseContextRow } from '../utils/caseContextualTask';

export type ContextualTaskRow = {
  id: string;
  task?: Task;
  taskType?: string;
  status?: string;
  aiGenerated?: boolean;
};

export type ResolveCaseCopilotBriefOptions = {
  greetingName: string;
  dataset: SystemDataset;
  anatomy?: CaseAnatomySettings;
  enabledObjectDomains?: string[];
  legacyMockOverlayEnabled?: boolean;
  selectedTaskId?: string | null;
  selectedRequirementId?: string | null;
};

function buildClientHeadline(data: CaseOverview): string {
  const primarySlot = data.workflowMeta?.contextBar?.[0];
  return [
    primarySlot?.value ?? data.primaryPartyName ?? data.claimantName,
    data.workflowMeta?.breadcrumb?.replace(/^Claim ·\s*/i, '') ?? data.caseTypeLabel,
  ]
    .filter(Boolean)
    .join(' · ');
}

function mapRequirements(data: CaseOverview) {
  return data.requirements.map((req) => ({
    id: req.id,
    datasetRequirementId: req.datasetRequirementId,
    name: req.name,
    status: req.status,
    linkedTasks: req.linkedTasks,
    blockingImpact: req.blockingImpact,
  }));
}

function buildContextualTasks(
  data: CaseOverview,
  dataset: SystemDataset,
  legacyMockOverlayEnabled: boolean,
): ContextualTaskRow[] {
  const datasetRows = listTasks(dataset, { caseId: data.id }).map((task) => ({
    id: task.id,
    taskType: task.taskType,
    priority: task.priority === 'URGENT' ? 'Urgent' : task.priority === 'HIGH' ? 'High' : 'Normal',
    status: task.status,
    dueDate: task.slaRemaining,
    stage: task.stage,
    aiGenerated: task.aiGenerated,
    aiConfidence: task.aiConfidence,
    assignee: task.assignedTo || 'Unassigned',
    task,
  }));

  const canUseLegacyCaseFallbacks =
    legacyMockOverlayEnabled && data.id === DEMO_CASE_IDS.wopClaim;

  if (!canUseLegacyCaseFallbacks) return datasetRows;

  if (data.id === DEMO_CASE_IDS.wopClaim) {
    return buildWopOverlayContextualTasks({
      data,
      datasetRows,
      overdueTaskReady: true,
      overdueTaskCompleted: false,
      newCaseTaskReady: false,
      prioritizeCreatedTask: (rows) => rows,
    });
  }

  return datasetRows;
}

function resolveSelectedTask(
  contextualTasks: ContextualTaskRow[],
  data: CaseOverview,
  selectedTaskId?: string | null,
): Task | null {
  if (!selectedTaskId) return null;
  const row = contextualTasks.find((item) => item.id === selectedTaskId);
  if (!row) return null;
  return row.task ?? resolveTaskForCaseContextRow(row, data);
}

function resolveSelectedRequirement(
  data: CaseOverview,
  selectedRequirementId?: string | null,
): CaseRequirement | null {
  if (!selectedRequirementId) return null;
  const match = data.requirements.find(
    (req) =>
      String(req.datasetRequirementId ?? req.id) === selectedRequirementId
      || String(req.id) === selectedRequirementId,
  );
  return match ?? null;
}

export function resolveCaseCopilotBriefInput(
  caseId: string,
  options: ResolveCaseCopilotBriefOptions,
): BuildCaseCopilotBriefInput | null {
  if (!options.dataset.cases.some((row) => row.id === caseId)) {
    if (!(options.legacyMockOverlayEnabled ?? false)) return null;
  }

  const overview = getCaseOverview(caseId, options.dataset, options.legacyMockOverlayEnabled ?? false, {
    anatomy: options.anatomy,
    enabledObjectDomains: options.enabledObjectDomains,
  });

  if (!overview || overview.claimantName === 'Unknown') {
    return null;
  }

  const contextualTasks = buildContextualTasks(
    overview,
    options.dataset,
    options.legacyMockOverlayEnabled ?? false,
  );

  const requirements = mapRequirements(overview);
  const tasks = contextualTasks.map((row) => ({
    id: row.id,
    label: row.task?.taskType ?? row.taskType ?? row.id,
    status: row.status ?? 'Open',
    aiGenerated: row.aiGenerated ?? row.task?.aiGenerated,
  }));

  const caseBrief = buildCaseBrief({
    caseId: overview.id,
    clientHeadline: buildClientHeadline(overview),
    aiSummary: overview.generalInformation?.aiSummary,
    requirements,
    tasks,
  });

  const copilotContext = resolveCaseCopilotContext({
    caseId: overview.id,
    caseLabel: overview.claimantName ?? overview.primaryPartyName,
    requirements,
    tasks,
    contextualTasks,
    resolveContextTask: (row) => resolveTaskForCaseContextRow(row, overview),
    selectedTask: resolveSelectedTask(contextualTasks, overview, options.selectedTaskId),
    selectedRequirement: resolveSelectedRequirement(overview, options.selectedRequirementId),
    caseBrief,
  });

  return {
    greetingName: options.greetingName,
    caseId: overview.id,
    clientHeadline: buildClientHeadline(overview),
    aiSummary: overview.generalInformation?.aiSummary,
    requirements,
    tasks,
    copilotContext,
  };
}

export function resolveCaseCopilotContextFromCaseId(
  caseId: string,
  options: ResolveCaseCopilotBriefOptions,
) {
  return resolveCaseCopilotBriefInput(caseId, options)?.copilotContext ?? null;
}
