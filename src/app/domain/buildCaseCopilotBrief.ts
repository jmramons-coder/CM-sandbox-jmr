import type { CaseBriefRequirementRef, CaseBriefTaskRef } from './caseBrief';
import type { CaseCopilotContext } from './caseCopilotContext';
import type { CaseBriefArtifact, CaseBriefFocusSegment } from '../components/AiCopilotFooter';
import type { ChatTurn } from '../components/AiCopilotFooter';
import type { TaskCrewStep } from '../types';
import { buildCaseBrief } from '../data/caseBrief/buildCaseBrief';
import { requirementTone } from './caseCopilotFollowUpArtifacts';
import { isEquisoftNb66GatheringDemo, TASK_NB4025_ID } from '../data/equisoftNb66ReqGatheringOverlay';
import { isSemiAutoTask, isTaskStatusCompleted } from '../utils/taskReviewProjection';

const CLOSED_REQUIREMENT = new Set(['Fulfilled', 'Waived', 'Completed', 'fulfilled']);

function isOpenRequirement(status: string): boolean {
  return !CLOSED_REQUIREMENT.has(status);
}

function requirementRoute(caseId: string, req: CaseBriefRequirementRef): string {
  const reqId = req.datasetRequirementId ?? String(req.id);
  return `/cases/${caseId}#tab=requirements&req=${encodeURIComponent(reqId)}`;
}

function taskRoute(caseId: string, taskId: string): string {
  return `/cases/${caseId}#tab=tasks&task=${encodeURIComponent(taskId)}`;
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

export type BuildCaseCopilotBriefInput = {
  greetingName: string;
  caseId: string;
  clientHeadline: string;
  aiSummary?: { text: string; confidence?: number };
  requirements: CaseBriefRequirementRef[];
  tasks: CaseBriefTaskRef[];
  copilotContext: CaseCopilotContext;
};

export function buildCaseCopilotBriefSnapshot(input: BuildCaseCopilotBriefInput): string {
  const focus =
    input.copilotContext.focus.kind === 'task'
      ? `task:${input.copilotContext.focus.task.id}:${input.copilotContext.focus.task.status}`
      : input.copilotContext.focus.kind === 'requirement'
        ? `req:${input.copilotContext.focus.requirement.id}`
        : 'case';
  return `${input.caseId}|${input.copilotContext.openRequirementCount}|${focus}`;
}

export function buildCaseCopilotBriefArtifact(input: BuildCaseCopilotBriefInput): CaseBriefArtifact {
  const openRequirements = input.requirements
    .filter((row) => isOpenRequirement(row.status))
    .slice(0, 6)
    .map((row) => ({
      id: String(row.datasetRequirementId ?? row.id),
      name: row.name,
      status: row.status,
      blocking: Boolean(row.blockingImpact),
      tone: requirementTone(row.status),
      href: requirementRoute(input.caseId, row),
    }));

  const brief = buildCaseBrief({
    caseId: input.caseId,
    clientHeadline: input.clientHeadline,
    aiSummary: input.aiSummary,
    requirements: input.requirements,
    tasks: input.tasks,
  });

  let focusLine = 'Review open requirements and tasks to keep this case moving.';
  let focusRequirement: CaseBriefArtifact['focusRequirement'];
  let focusTask: CaseBriefArtifact['focusTask'];

  if (input.copilotContext.focus.kind === 'task') {
    const { task, review } = input.copilotContext.focus;
    const linkedReq = input.requirements.find((row) => row.linkedTasks?.includes(task.id));
    focusTask = {
      id: task.id,
      label: task.taskType,
      href: taskRoute(input.caseId, task.id),
      verdict: review.verdict,
      confidence: review.confidence,
      crewSteps: review.crewSteps as TaskCrewStep[] | undefined,
      semiAuto: isSemiAutoTask(task) && !isTaskStatusCompleted(task.status),
    };
    if (linkedReq) {
      focusRequirement = {
        id: String(linkedReq.datasetRequirementId ?? linkedReq.id),
        name: linkedReq.name,
        href: requirementRoute(input.caseId, linkedReq),
      };
      focusLine = `Prioritize **${task.taskType}** to fulfill **${linkedReq.name}**.`;
    } else if (
      isEquisoftNb66GatheringDemo(input.caseId) &&
      task.id === TASK_NB4025_ID &&
      !openRequirements.length
    ) {
      focusLine =
        'Approve the AI recommend-requirements task, then select which gathering requirements to add to the case.';
    } else {
      focusLine = `Prioritize **${task.taskType}** to move this case forward.`;
    }
  } else {
    const closedTask = new Set(['Completed', 'Done', 'Cancelled', 'Closed']);
    const openTaskRow = input.tasks.find((row) => {
      const normalized = row.status.trim().toLowerCase();
      return !closedTask.has(row.status) && normalized !== 'completed' && normalized !== 'cancelled';
    });
    if (openTaskRow) {
      const linkedReq = input.requirements.find((row) => row.linkedTasks?.includes(openTaskRow.id));
      focusTask = {
        id: openTaskRow.id,
        label: openTaskRow.label,
        href: taskRoute(input.caseId, openTaskRow.id),
        verdict: openTaskRow.label,
        semiAuto: Boolean(openTaskRow.aiGenerated) && !isTaskStatusCompleted(openTaskRow.status),
      };
      if (linkedReq) {
        focusRequirement = {
          id: String(linkedReq.datasetRequirementId ?? linkedReq.id),
          name: linkedReq.name,
          href: requirementRoute(input.caseId, linkedReq),
        };
        focusLine = `Prioritize **${openTaskRow.label}** to fulfill **${linkedReq.name}**.`;
      } else {
        focusLine = `Prioritize **${openTaskRow.label}** to move this case forward.`;
      }
    } else if (brief?.text) {
      focusLine = brief.text.split('.').slice(-2).join('.').trim() || focusLine;
    }
  }

  const focusSegments = buildCaseBriefFocusSegments({
    focusLine,
    focusTask,
    focusRequirement,
    caseId: input.caseId,
  });

  return {
    kind: 'case-brief',
    greetingName: firstName(input.greetingName),
    caseId: input.caseId,
    clientHeadline: input.clientHeadline,
    openRequirements,
    focusLine,
    focusSegments,
    focusTask,
    focusRequirement,
  };
}

function buildCaseBriefFocusSegments({
  focusLine,
  focusTask,
  focusRequirement,
  caseId,
}: {
  focusLine: string;
  focusTask?: CaseBriefArtifact['focusTask'];
  focusRequirement?: CaseBriefArtifact['focusRequirement'];
  caseId: string;
}): CaseBriefFocusSegment[] {
  if (focusTask && focusRequirement) {
    return [
      { type: 'text', value: 'Prioritize ' },
      { type: 'link', label: focusTask.label, href: focusTask.href, kind: 'task' },
      { type: 'text', value: ' to fulfill ' },
      { type: 'link', label: focusRequirement.name, href: focusRequirement.href, kind: 'requirement' },
      { type: 'text', value: '.' },
    ];
  }

  if (focusTask) {
    return [
      { type: 'text', value: 'Prioritize ' },
      { type: 'link', label: focusTask.label, href: focusTask.href, kind: 'task' },
      { type: 'text', value: ' to move this case forward.' },
    ];
  }

  if (/Decision tab/i.test(focusLine)) {
    return [
      { type: 'text', value: 'Open the ' },
      {
        type: 'link',
        label: 'Decision tab',
        href: `/cases/${caseId}#tab=decision`,
        kind: 'case',
      },
      { type: 'text', value: ' — requirements are complete.' },
    ];
  }

  return [{ type: 'text', value: focusLine.replace(/\*\*/g, '') }];
}

export function buildCaseCopilotBriefTurn(input: BuildCaseCopilotBriefInput): ChatTurn {
  const artifact = buildCaseCopilotBriefArtifact(input);
  return {
    id: `brief-${input.caseId}-${Date.now()}`,
    role: 'assistant',
    text: '',
    at: Date.now(),
    artifact,
  };
}
