import type { CaseBriefContent, CaseBriefRequirementRef, CaseBriefTaskRef } from './caseBrief';
import type { CopilotContextHints } from '../components/copilot/copilotEmptyState';
import type { CaseRequirement, Task, TaskPanelAction, TaskReviewPayload } from '../types';
import {
  isEquisoftNb66GatheringDemo,
  TASK_NB4025_ID,
} from '../data/equisoftNb66ReqGatheringOverlay';
import { TASK_EMP_ADDR_001_ID } from '../data/empireAddressChangeOverlay';
import {
  isSemiAutoTask,
  isTaskStatusCompleted,
  resolveTaskPanelActions,
  resolveTaskReviewFromTask,
} from '../utils/taskReviewProjection';

export type CaseCopilotTaskFocus = {
  kind: 'task';
  task: Task;
  review: TaskReviewPayload;
  panelActions: TaskPanelAction[];
};

export type CaseCopilotRequirementFocus = {
  kind: 'requirement';
  requirement: Pick<CaseRequirement, 'id' | 'name' | 'status' | 'datasetRequirementId' | 'blockingImpact'>;
};

export type CaseCopilotCaseFocus = {
  kind: 'case';
  briefText?: string;
};

export type CaseCopilotFocus =
  | CaseCopilotTaskFocus
  | CaseCopilotRequirementFocus
  | CaseCopilotCaseFocus;

export type CaseCopilotContext = {
  caseId: string;
  caseLabel?: string;
  focus: CaseCopilotFocus;
  requirements: CaseBriefRequirementRef[];
  tasks: CaseBriefTaskRef[];
  openRequirementCount: number;
  openTaskCount: number;
};

export type ResolveCaseCopilotContextInput = {
  caseId: string;
  caseLabel?: string;
  requirements: CaseBriefRequirementRef[];
  tasks: CaseBriefTaskRef[];
  contextualTasks: Array<{ id: string; task?: Task; taskType?: string; status?: string }>;
  resolveContextTask: (row: ResolveCaseCopilotContextInput['contextualTasks'][number]) => Task;
  selectedTask?: Task | null;
  selectedRequirement?: CaseRequirement | null;
  caseBrief?: CaseBriefContent | null;
};

function pickReviewTask(input: ResolveCaseCopilotContextInput): Task | undefined {
  const { selectedTask, contextualTasks, resolveContextTask, caseId } = input;

  if (isEquisoftNb66GatheringDemo(caseId)) {
    for (const row of contextualTasks) {
      const task = row.task ?? resolveContextTask(row);
      if (
        task.id === TASK_NB4025_ID &&
        isSemiAutoTask(task) &&
        !isTaskStatusCompleted(task.status)
      ) {
        return task;
      }
    }
  }

  for (const row of contextualTasks) {
    const task = row.task ?? resolveContextTask(row);
    if (
      task.id === TASK_EMP_ADDR_001_ID &&
      isSemiAutoTask(task) &&
      !isTaskStatusCompleted(task.status)
    ) {
      return task;
    }
  }

  if (selectedTask && isSemiAutoTask(selectedTask) && !isTaskStatusCompleted(selectedTask.status)) {
    return selectedTask;
  }

  for (const row of contextualTasks) {
    const task = row.task ?? resolveContextTask(row);
    if (isSemiAutoTask(task) && !isTaskStatusCompleted(task.status)) {
      return task;
    }
  }

  return undefined;
}

function countOpenRequirements(requirements: CaseBriefRequirementRef[]): number {
  const closed = new Set(['Fulfilled', 'Waived', 'Completed', 'fulfilled']);
  return requirements.filter((row) => !closed.has(row.status)).length;
}

function countOpenTasks(tasks: CaseBriefTaskRef[]): number {
  const closed = new Set(['Completed', 'Done', 'Cancelled', 'Closed']);
  return tasks.filter((row) => {
    const normalized = row.status.trim().toLowerCase();
    return !closed.has(row.status) && normalized !== 'completed' && normalized !== 'cancelled';
  }).length;
}

export function resolveCaseCopilotContext(input: ResolveCaseCopilotContextInput): CaseCopilotContext {
  const openRequirementCount = countOpenRequirements(input.requirements);
  const openTaskCount = countOpenTasks(input.tasks);
  const base = {
    caseId: input.caseId,
    caseLabel: input.caseLabel,
    requirements: input.requirements,
    tasks: input.tasks,
    openRequirementCount,
    openTaskCount,
  };

  const reviewTask = pickReviewTask(input);
  if (reviewTask) {
    const review = resolveTaskReviewFromTask(reviewTask);
    const hasEvidence = Boolean(reviewTask.evidenceDocuments?.length);
    return {
      ...base,
      focus: {
        kind: 'task',
        task: reviewTask,
        review,
        panelActions: resolveTaskPanelActions(reviewTask, {
          isCompleted: isTaskStatusCompleted(reviewTask.status),
          hasEvidence,
        }),
      },
    };
  }

  if (input.selectedRequirement) {
    return {
      ...base,
      focus: {
        kind: 'requirement',
        requirement: {
          id: input.selectedRequirement.id,
          name: input.selectedRequirement.name,
          status: input.selectedRequirement.status,
          datasetRequirementId: input.selectedRequirement.datasetRequirementId,
          blockingImpact: input.selectedRequirement.blockingImpact,
        },
      },
    };
  }

  return {
    ...base,
    focus: {
      kind: 'case',
      briefText: input.caseBrief?.text,
    },
  };
}

export function caseCopilotContextToHints(ctx: CaseCopilotContext): CopilotContextHints {
  if (ctx.focus.kind === 'task') {
    const { task, review } = ctx.focus;
    return {
      variant: 'taskReview',
      caseId: ctx.caseId,
      caseLabel: ctx.caseLabel,
      taskId: task.id,
      taskLabel: task.taskType,
      taskVerdict: review.verdict,
      taskConfidence: review.confidence,
    };
  }

  if (ctx.focus.kind === 'requirement') {
    return {
      variant: 'requirementReview',
      caseId: ctx.caseId,
      caseLabel: ctx.caseLabel,
      requirementId: String(ctx.focus.requirement.datasetRequirementId ?? ctx.focus.requirement.id),
      requirementName: ctx.focus.requirement.name,
      requirementStatus: ctx.focus.requirement.status,
    };
  }

  return {
    variant: 'caseWorkspace',
    caseId: ctx.caseId,
    caseLabel: ctx.caseLabel,
  };
}
