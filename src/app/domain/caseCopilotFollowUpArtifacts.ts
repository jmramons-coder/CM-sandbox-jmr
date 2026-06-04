import type {
  CaseNextStepArtifact,
  CaseRequirementsListArtifact,
  CaseTaskQueueArtifact,
} from '../components/AiCopilotFooter';
import type { SystemDataset } from '../data/multi-case-dataset';
import {
  NB66_CASE_ID,
  TASK_NB4025_ID,
  shouldApplyEquisoftNb66Overlay,
} from '../data/equisoftNb66ReqGatheringOverlay';
import { listTasks } from '../data/objectRepository';
import type { CaseBriefRequirementRef } from './caseBrief';
import type { CaseCopilotContext } from './caseCopilotContext';
import type { Task } from '../types';
import { isSemiAutoTask, isTaskStatusCompleted } from '../utils/taskReviewProjection';

const CLOSED_REQUIREMENT = new Set(['Fulfilled', 'Waived', 'Completed', 'fulfilled']);

function taskPriorityRank(priority: string): number {
  const key = priority.toUpperCase();
  if (key === 'URGENT') return 0;
  if (key === 'HIGH') return 1;
  return 2;
}

function formatTaskPriority(priority: string): 'Urgent' | 'High' | 'Normal' {
  const key = priority.toUpperCase();
  if (key === 'URGENT') return 'Urgent';
  if (key === 'HIGH') return 'High';
  return 'Normal';
}

function requirementRoute(caseId: string, req: CaseBriefRequirementRef): string {
  const reqId = req.datasetRequirementId ?? String(req.id);
  return `/cases/${caseId}#tab=requirements&req=${encodeURIComponent(reqId)}`;
}

function taskRoute(caseId: string, taskId: string): string {
  return `/cases/${caseId}#tab=tasks&task=${encodeURIComponent(taskId)}`;
}

export function requirementTone(status: string): 'neutral' | 'warning' | 'critical' {
  if (status === 'Overdue') return 'critical';
  if (['Pending', 'In Queue', 'In progress'].includes(status)) return 'warning';
  return 'neutral';
}

export function pickNextOpenCaseTask(
  dataset: SystemDataset,
  caseId: string,
  excludeTaskId?: string,
): Task | undefined {
  const open = listTasks(dataset, { caseId }).filter(
    (task) => !isTaskStatusCompleted(task.status) && task.id !== excludeTaskId,
  );
  if (!open.length) return undefined;

  if (caseId === NB66_CASE_ID && shouldApplyEquisoftNb66Overlay()) {
    const recommendTask = open.find((task) => task.id === TASK_NB4025_ID);
    if (recommendTask) return recommendTask;
  }

  const semiAuto = open.filter((task) => isSemiAutoTask(task));
  const pool = semiAuto.length ? semiAuto : open;
  return [...pool].sort((a, b) => taskPriorityRank(a.priority) - taskPriorityRank(b.priority))[0];
}

export function listOpenCaseTasks(
  dataset: SystemDataset,
  caseId: string,
  excludeTaskId?: string,
  limit = 5,
): Task[] {
  return listTasks(dataset, { caseId })
    .filter((task) => !isTaskStatusCompleted(task.status) && task.id !== excludeTaskId)
    .sort((a, b) => taskPriorityRank(a.priority) - taskPriorityRank(b.priority))
    .slice(0, limit);
}

export function listOpenRequirements(ctx: CaseCopilotContext): CaseBriefRequirementRef[] {
  return ctx.requirements.filter((row) => !CLOSED_REQUIREMENT.has(row.status));
}

export function buildCaseTaskQueueArtifact(
  dataset: SystemDataset,
  ctx: CaseCopilotContext,
  options?: { excludeTaskId?: string; title?: string },
): CaseTaskQueueArtifact | null {
  const tasks = listOpenCaseTasks(dataset, ctx.caseId, options?.excludeTaskId);
  if (!tasks.length) return null;

  const nextId = pickNextOpenCaseTask(dataset, ctx.caseId, options?.excludeTaskId)?.id;

  return {
    kind: 'case-task-queue',
    title: options?.title ?? 'Open tasks on this case',
    caseId: ctx.caseId,
    items: tasks.map((task) => ({
      id: task.id,
      label: task.taskType,
      href: taskRoute(ctx.caseId, task.id),
      status: task.status,
      priority: formatTaskPriority(task.priority),
      aiAssisted: isSemiAutoTask(task),
      stage: task.stage,
      isNext: task.id === nextId,
    })),
  };
}

export function buildCaseRequirementsListArtifact(
  ctx: CaseCopilotContext,
  options?: { title?: string; limit?: number },
): CaseRequirementsListArtifact | null {
  const open = listOpenRequirements(ctx);
  if (!open.length) return null;

  const limit = options?.limit ?? 6;
  return {
    kind: 'case-requirements-list',
    title: options?.title ?? 'Open requirements',
    caseId: ctx.caseId,
    items: open.slice(0, limit).map((row) => ({
      id: String(row.datasetRequirementId ?? row.id),
      name: row.name,
      href: requirementRoute(ctx.caseId, row),
      status: row.status,
      blocking: Boolean(row.blockingImpact),
      tone: requirementTone(row.status),
    })),
  };
}

export type CaseNextStepResolution = {
  recommendation: CaseNextStepArtifact['recommendation'];
  headline: string;
  detail: string;
  href: string;
  ctaLabel: string;
  taskItem?: CaseTaskQueueArtifact['items'][number];
  requirementItems?: CaseRequirementsListArtifact['items'];
};

export function resolveCaseNextStep(
  dataset: SystemDataset,
  ctx: CaseCopilotContext,
  excludeTaskId?: string,
): CaseNextStepResolution {
  const caseRecord = dataset.cases.find((row) => row.id === ctx.caseId);
  const nextTask = pickNextOpenCaseTask(dataset, ctx.caseId, excludeTaskId);
  const openReqs = listOpenRequirements(ctx);
  const blockingReqs = openReqs.filter((row) => row.blockingImpact);

  if (nextTask) {
    const aiAssisted = isSemiAutoTask(nextTask);
    const taskItem: CaseTaskQueueArtifact['items'][number] = {
      id: nextTask.id,
      label: nextTask.taskType,
      href: taskRoute(ctx.caseId, nextTask.id),
      status: nextTask.status,
      priority: formatTaskPriority(nextTask.priority),
      aiAssisted,
      stage: nextTask.stage,
      isNext: true,
    };
    return {
      recommendation: 'task',
      headline: aiAssisted ? 'Review the AI recommendation next' : 'Work this task next',
      detail: aiAssisted
        ? `${nextTask.taskType} is ready for your sign-off before the case can advance.`
        : `${nextTask.taskType} is the highest-priority open work on this case.`,
      href: taskItem.href,
      ctaLabel: aiAssisted ? 'Open task review' : 'Open task',
      taskItem,
    };
  }

  if (blockingReqs.length) {
    const items = blockingReqs.slice(0, 3).map((row) => ({
      id: String(row.datasetRequirementId ?? row.id),
      name: row.name,
      href: requirementRoute(ctx.caseId, row),
      status: row.status,
      blocking: true,
      tone: requirementTone(row.status),
    }));
    const first = items[0];
    return {
      recommendation: 'requirements',
      headline: 'Clear blocking requirements first',
      detail: `${blockingReqs.length} requirement${blockingReqs.length === 1 ? '' : 's'} still block progress — start with ${first.name}.`,
      href: first.href,
      ctaLabel: 'Open requirement',
      requirementItems: items,
    };
  }

  if (openReqs.length) {
    const items = openReqs.slice(0, 3).map((row) => ({
      id: String(row.datasetRequirementId ?? row.id),
      name: row.name,
      href: requirementRoute(ctx.caseId, row),
      status: row.status,
      blocking: Boolean(row.blockingImpact),
      tone: requirementTone(row.status),
    }));
    const first = items[0];
    return {
      recommendation: 'requirements',
      headline: 'Finish open requirements',
      detail: `${openReqs.length} requirement${openReqs.length === 1 ? ' is' : 's are'} still open on this case.`,
      href: first.href,
      ctaLabel: 'View requirements',
      requirementItems: items,
    };
  }

  const atDecision =
    caseRecord?.statusCode === 'pending_decision'
    || caseRecord?.activeStepId === 'decision'
    || caseRecord?.status?.toLowerCase().includes('decision');

  if (atDecision || ctx.openRequirementCount === 0) {
    return {
      recommendation: 'decision',
      headline: 'Ready for decision',
      detail:
        'Tasks and requirements look complete. Record the outcome on the Decision tab when you are satisfied with the file.',
      href: `/cases/${ctx.caseId}#tab=decision`,
      ctaLabel: 'Open Decision tab',
    };
  }

  return {
    recommendation: 'decision',
    headline: 'Keep the case moving',
    detail:
      caseRecord?.status
        ? `Case is in ${caseRecord.status} — check Activity for updates or open the current workflow step.`
        : 'No open tasks or requirements right now. Review the case timeline for the latest activity.',
    href: `/cases/${ctx.caseId}`,
    ctaLabel: 'Open case',
  };
}

export function buildCaseNextStepArtifact(
  caseId: string,
  resolution: CaseNextStepResolution,
): CaseNextStepArtifact {
  return {
    kind: 'case-next-step',
    caseId,
    ...resolution,
  };
}
