import type { ActionCardArtifact } from '../components/AiCopilotFooter';
import { isEquisoftNb66GatheringDemo, TASK_NB4025_ID } from '../data/equisoftNb66ReqGatheringOverlay';
import type { SystemDataset } from '../data/multi-case-dataset';
import { listTasks } from '../data/objectRepository';
import { buildAssistantReply, type AssistantReply } from './assistantReplyBuilder';
import {
  buildCaseNextStepArtifact,
  buildCaseRequirementsListArtifact,
  buildCaseTaskQueueArtifact,
  resolveCaseNextStep,
} from './caseCopilotFollowUpArtifacts';
import type { CaseCopilotContext, CaseCopilotTaskFocus } from './caseCopilotContext';
import {
  isSemiAutoTask,
  isTaskStatusCompleted,
  resolveTaskPanelActions,
  resolveTaskReviewFromTask,
} from '../utils/taskReviewProjection';

export { pickNextOpenCaseTask } from './caseCopilotFollowUpArtifacts';

export type CopilotTaskSideEffect = {
  kind: 'task_action';
  taskId: string;
  actionType: 'complete' | 'request_info';
};

export type CaseAssistantReply = AssistantReply & {
  sideEffect?: CopilotTaskSideEffect;
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function truncate(text: string, max: number): string {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trim()}…`;
}

function taskSubject(focus: CaseCopilotTaskFocus): string {
  return focus.task.taskType?.trim() || focus.task.id;
}

function isApproveIntent(prompt: string): boolean {
  const needle = normalize(prompt);
  if (needle === 'approve' || needle === 'yes' || needle === 'approved') return true;
  if (needle.startsWith('approve ') && !needle.includes('amend')) return true;
  return needle.includes('approve') && needle.includes('based on the ai recommendation');
}

function isAmendIntent(prompt: string): boolean {
  const needle = normalize(prompt);
  return (
    needle.includes('amend')
    || needle.includes('change before approving')
    || needle === 'no'
    || needle.startsWith('reject')
  );
}

function isReasoningIntent(prompt: string): boolean {
  const needle = normalize(prompt);
  return (
    needle.includes('reasoning')
    || needle.includes('walk me through')
    || needle.includes('crew')
    || needle.includes('explain the ai')
  );
}

function isRequirementsIntent(prompt: string): boolean {
  const needle = normalize(prompt);
  return (
    (needle.includes('requirement') || needle.includes('requirements'))
    && (needle.includes('open') || needle.includes('blocking') || needle.includes('outstanding') || needle.includes('still'))
  );
}

function isNextTaskIntent(prompt: string): boolean {
  const needle = normalize(prompt);
  return (
    needle.includes('next task')
    || (needle.includes('next') && needle.includes('task'))
    || needle.includes('what task should')
    || needle.includes('what is the next')
    || needle.includes('which task should')
  );
}

function isNextStepsIntent(prompt: string): boolean {
  const needle = normalize(prompt);
  return needle.includes('next steps') || needle.includes('best next');
}

function buildNextTaskReply(
  dataset: SystemDataset,
  ctx: CaseCopilotContext,
  excludeTaskId?: string,
): CaseAssistantReply {
  const queue = buildCaseTaskQueueArtifact(dataset, ctx, {
    excludeTaskId,
    title: 'What to work next',
  });

  if (!queue) {
    const step = resolveCaseNextStep(dataset, ctx, excludeTaskId);
    return {
      text: 'No open tasks remain on this case.',
      artifact: buildCaseNextStepArtifact(ctx.caseId, step),
      followUps:
        step.recommendation === 'requirements'
          ? ['Which requirements are still open?', 'What are the best next steps on this case?']
          : ['Which requirements are still open?'],
    };
  }

  const nextItem = queue.items.find((row) => row.isNext) ?? queue.items[0];
  const linkedReq = ctx.requirements.find((row) => row.linkedTasks?.includes(nextItem.id));

  let text = `**${queue.items.length}** open task${queue.items.length === 1 ? '' : 's'} — start with **${nextItem.label}**.`;
  if (linkedReq) {
    text += ` It supports **${linkedReq.name}** (${linkedReq.status}).`;
  }

  return {
    text,
    artifact: queue,
    followUps: ['Which requirements are still open?', 'What are the best next steps on this case?'],
  };
}

function buildNextStepsReply(
  dataset: SystemDataset,
  ctx: CaseCopilotContext,
  excludeTaskId?: string,
): CaseAssistantReply {
  const resolution = resolveCaseNextStep(dataset, ctx, excludeTaskId);
  const followUps =
    resolution.recommendation === 'task'
      ? ['Which requirements are still open?', 'What is the next task on this case?']
      : resolution.recommendation === 'requirements'
        ? ['What is the next task on this case?', 'What are the best next steps on this case?']
        : ['What is the next task on this case?', 'Which requirements are still open?'];

  return {
    text: resolution.headline,
    artifact: buildCaseNextStepArtifact(ctx.caseId, resolution),
    followUps,
  };
}

function isSummarizeIntent(prompt: string): boolean {
  const needle = normalize(prompt);
  return needle.includes('summarize') || needle.includes('summary for handoff');
}

function buildTaskActionCard(
  focus: CaseCopilotTaskFocus,
  caseId: string,
  description: string,
): ActionCardArtifact {
  return {
    kind: 'action-card',
    title: taskSubject(focus),
    description,
    actions: [
      {
        id: 'approve',
        label: 'Approve',
        variant: 'primary',
        execute: { kind: 'task', taskId: focus.task.id, actionType: 'complete' },
      },
      {
        id: 'amend',
        label: 'Amend',
        variant: 'secondary',
        execute: { kind: 'task', taskId: focus.task.id, actionType: 'request_info' },
      },
    ],
  };
}

function buildReasoningReply(focus: CaseCopilotTaskFocus, caseId: string): CaseAssistantReply {
  const { review, task } = focus;
  const steps = review.crewSteps ?? [];
  const lines: string[] = [
    `**Intelligence reasoning — ${taskSubject(focus)}**`,
    '',
    `**What was done:** ${review.verdict}`,
  ];

  if (typeof review.confidence === 'number') {
    lines.push(`Confidence: **${Math.round(review.confidence)}%**`);
  }

  if (steps.length) {
    lines.push('', '**Crew steps**');
    steps.forEach((step, index) => {
      lines.push(`${index + 1}. **${step.title}** — ${step.rationale}`);
      const finding = step.findings[0]?.text;
      if (finding) lines.push(`   • ${finding}`);
    });
  } else if (review.reasoning?.length) {
    lines.push('', '**Key points**');
    review.reasoning.forEach((item) => lines.push(`• ${item}`));
  }

  if (review.evidenceIds?.length) {
    lines.push('', `Evidence reviewed: ${review.evidenceIds.join(', ')}`);
  }

  lines.push('', 'Would you like to **approve** this recommendation or **amend** it?');

  return {
    text: lines.join('\n'),
    artifact: buildTaskActionCard(
      focus,
      caseId,
      'You can approve from here or tell me what to change.',
    ),
    followUps: ['Approve this task', 'I want to amend this task'],
  };
}

function buildNb66TaskPanelApproveReply(caseId: string): CaseAssistantReply {
  return {
    text:
      `Open the **AI: recommend requirements** task on **${caseId}**.\n\n` +
      'In **Suggested requirements**, adjust checkboxes, then click **Approve** to complete the task and add them to the case.',
    followUps: ['Which requirements are still open?'],
  };
}

function buildApproveReply(focus: CaseCopilotTaskFocus, caseId: string): CaseAssistantReply {
  const taskId = focus.task.id;
  if (isEquisoftNb66GatheringDemo(caseId) && taskId === TASK_NB4025_ID) {
    return buildNb66TaskPanelApproveReply(caseId);
  }
  const label = taskSubject(focus);
  return {
    text: `**Done** — **${label}** is marked complete on **${caseId}**.`,
    sideEffect: {
      kind: 'task_action',
      taskId,
      actionType: 'complete',
    },
    followUps: ['What is the next task on this case?', 'Which requirements are still open?'],
  };
}

function buildAmendReply(focus: CaseCopilotTaskFocus, caseId: string): CaseAssistantReply {
  const label = taskSubject(focus);
  return {
    text:
      `**Amend recorded** — ${label} on case **${caseId}**.\n\n` +
      'I flagged this for follow-up before approval. Tell me what should change, or open the task panel to add notes.',
    sideEffect: {
      kind: 'task_action',
      taskId: focus.task.id,
      actionType: 'request_info',
    },
    followUps: ['Explain the AI reasoning again', 'Which requirements are still open?'],
  };
}

function buildOpenRequirementsReply(ctx: CaseCopilotContext): CaseAssistantReply {
  const list = buildCaseRequirementsListArtifact(ctx);

  if (!list) {
    return {
      text: `All requirements on **${ctx.caseId}** are fulfilled or waived.`,
      artifact: buildCaseNextStepArtifact(ctx.caseId, {
        recommendation: 'decision',
        headline: 'Ready for decision',
        detail: 'Nothing left in the requirements grid — open the Decision tab when you are ready to record the outcome.',
        href: `/cases/${ctx.caseId}#tab=decision`,
        ctaLabel: 'Open Decision tab',
      }),
      followUps: ['What is the next task on this case?', 'What are the best next steps on this case?'],
    };
  }

  const blockingCount = list.items.filter((row) => row.blocking).length;
  let text = `**${list.items.length}** open requirement${list.items.length === 1 ? '' : 's'} on this case.`;
  if (blockingCount) {
    text += ` **${blockingCount}** ${blockingCount === 1 ? 'is' : 'are'} blocking progress.`;
  }

  const nextTaskFollowUp =
    ctx.openTaskCount > 0 ? 'What is the next task on this case?' : 'What are the best next steps on this case?';

  return {
    text,
    artifact: list,
    followUps: [nextTaskFollowUp, 'What are the best next steps on this case?'],
  };
}

function buildCaseWorkspaceReply(ctx: CaseCopilotContext): CaseAssistantReply | null {
  if (ctx.focus.kind !== 'case') return null;
  const headline = ctx.caseLabel ? `**${ctx.caseId} · ${ctx.caseLabel}**` : `**${ctx.caseId}**`;
  const brief = ctx.focus.briefText?.trim();
  const workload =
    ctx.openTaskCount || ctx.openRequirementCount
      ? `\n\nOpen work: **${ctx.openTaskCount}** task${ctx.openTaskCount === 1 ? '' : 's'}, **${ctx.openRequirementCount}** requirement${ctx.openRequirementCount === 1 ? '' : 's'}.`
      : '';

  return {
    text: `${headline}${brief ? `\n\n${brief}` : ''}${workload}`,
    followUps: [
      'Which requirements are still open on this case, and what is blocking progress?',
      'What are the best next steps on this case?',
    ],
  };
}

function buildRequirementFocusReply(ctx: CaseCopilotContext): CaseAssistantReply {
  if (ctx.focus.kind !== 'requirement') {
    return { text: 'No requirement is selected in this case workspace.' };
  }

  const req = ctx.focus.requirement;
  const blocking = req.blockingImpact
    ? `\n\nBlocking: **${req.blockingImpact.impact}** (${req.blockingImpact.stage}).`
    : '';

  return {
    text:
      `**${req.name}** on case **${ctx.caseId}** is **${req.status}**.${blocking}\n\n` +
      'Ask about linked tasks, documents, or what is needed to fulfill this requirement.',
    followUps: [
      'Which requirements are still open on this case, and what is blocking progress?',
      'What are the best next steps on this case?',
    ],
  };
}

function resolveExcludeCompletedFocusTaskId(
  dataset: SystemDataset,
  ctx: CaseCopilotContext,
): string | undefined {
  if (ctx.focus.kind !== 'task') return undefined;
  const live = listTasks(dataset, { caseId: ctx.caseId }).find((row) => row.id === ctx.focus.task.id);
  if (live && isTaskStatusCompleted(live.status)) return live.id;
  return undefined;
}

export function buildCaseAssistantReply(
  dataset: SystemDataset,
  prompt: string,
  ctx: CaseCopilotContext,
): CaseAssistantReply | null {
  const excludeTaskId = resolveExcludeCompletedFocusTaskId(dataset, ctx);

  if (isNextTaskIntent(prompt)) {
    return buildNextTaskReply(dataset, ctx, excludeTaskId);
  }

  if (isRequirementsIntent(prompt)) {
    return buildOpenRequirementsReply(ctx);
  }

  if (ctx.focus.kind === 'task') {
    if (isApproveIntent(prompt)) return buildApproveReply(ctx.focus, ctx.caseId);
    if (isAmendIntent(prompt)) return buildAmendReply(ctx.focus, ctx.caseId);
    if (isReasoningIntent(prompt)) return buildReasoningReply(ctx.focus, ctx.caseId);
  }

  if (isNextStepsIntent(prompt)) {
    return buildNextStepsReply(dataset, ctx, excludeTaskId);
  }

  if (isSummarizeIntent(prompt)) {
    const datasetReply = buildAssistantReply(dataset, prompt, `case:${ctx.caseId}`);
    if (datasetReply) return datasetReply;
    return buildCaseWorkspaceReply(ctx);
  }

  if (ctx.focus.kind === 'requirement' && normalize(prompt).includes('requirement')) {
    return buildRequirementFocusReply(ctx);
  }

  const datasetReply = buildAssistantReply(dataset, prompt, `case:${ctx.caseId}`);
  if (datasetReply) return datasetReply;

  if (ctx.focus.kind === 'task') {
    const focus = ctx.focus;
    return {
      text:
        `You're reviewing **${taskSubject(focus)}** on case **${ctx.caseId}**.\n\n` +
        `**What was done:** ${truncate(focus.review.verdict, 200)}\n\n` +
        'Say **approve**, **amend**, or ask me to **explain the reasoning**.',
      artifact: buildTaskActionCard(
        focus,
        ctx.caseId,
        'Approve the AI recommendation or amend before sign-off.',
      ),
      followUps: ['Explain the AI crew reasoning', 'Approve this task'],
    };
  }

  if (ctx.focus.kind === 'requirement') {
    return buildRequirementFocusReply(ctx);
  }

  return buildCaseWorkspaceReply(ctx);
}

export function buildCaseAssistantReplyForExecute(
  ctx: CaseCopilotContext,
  actionType: 'complete' | 'request_info',
  taskId?: string,
): CaseAssistantReply | null {
  if (ctx.focus.kind === 'task') {
    const focusMatches =
      !taskId || ctx.focus.task.id === taskId || ctx.focus.task.taskId === taskId;
    if (focusMatches) {
      return actionType === 'complete'
        ? buildApproveReply(ctx.focus, ctx.caseId)
        : buildAmendReply(ctx.focus, ctx.caseId);
    }
  }

  if (!taskId) return null;

  const label = ctx.tasks.find((row) => row.id === taskId)?.label ?? taskId;

  if (actionType === 'complete') {
    if (isEquisoftNb66GatheringDemo(ctx.caseId) && taskId === TASK_NB4025_ID) {
      return buildNb66TaskPanelApproveReply(ctx.caseId);
    }
    return {
      text: `**Done** — **${label}** is marked complete on **${ctx.caseId}**.`,
      followUps: ['What is the next task on this case?', 'Which requirements are still open?'],
    };
  }

  return {
    text:
      `**Amend recorded** — ${label} on case **${ctx.caseId}**.\n\n` +
      'I flagged this for follow-up before approval. Tell me what should change, or open the task panel to add notes.',
    followUps: ['Explain the AI reasoning again', 'Which requirements are still open?'],
  };
}
