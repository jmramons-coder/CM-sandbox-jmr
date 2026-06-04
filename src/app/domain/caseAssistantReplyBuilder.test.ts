import { describe, expect, it } from 'vitest';
import { EMPIRE_DATASET } from '../data/empire-dataset';
import { EMPIRE_DEMO_CASE_IDS } from '../data/empireDemoCaseIds';
import { listTasks } from '../data/objectRepository';
import { buildCaseCopilotBriefTurn } from './buildCaseCopilotBrief';
import { buildCaseAssistantReply, pickNextOpenCaseTask } from './caseAssistantReplyBuilder';
import { resolveCaseCopilotContext } from './caseCopilotContext';

describe('caseCopilotContext', () => {
  it('focuses the first open semi-auto task on a case', () => {
    const caseId = EMPIRE_DEMO_CASE_IDS.criticalIllnessClaim;
    const task = listTasks(EMPIRE_DATASET, { caseId }).find((row) => row.id === 'task_emp_ci_003');
    expect(task).toBeTruthy();

    const ctx = resolveCaseCopilotContext({
      caseId,
      caseLabel: 'Sophie Chen',
      requirements: [],
      tasks: [{ id: task!.id, label: task!.taskType, status: task!.status }],
      contextualTasks: [{ id: task!.id, task: task!, taskType: task!.taskType, status: task!.status }],
      resolveContextTask: (row) => row.task!,
      selectedTask: null,
      selectedRequirement: null,
      caseBrief: null,
    });

    expect(ctx.focus.kind).toBe('task');
    if (ctx.focus.kind === 'task') {
      expect(ctx.focus.task.id).toBe('task_emp_ci_003');
      expect(ctx.focus.review.verdict).toContain('$125,000');
    }
  });
});

describe('caseAssistantReplyBuilder', () => {
  it('returns approve side effect for approve intent', () => {
    const caseId = EMPIRE_DEMO_CASE_IDS.criticalIllnessClaim;
    const task = listTasks(EMPIRE_DATASET, { caseId }).find((row) => row.id === 'task_emp_ci_003');
    expect(task).toBeTruthy();
    const ctx = resolveCaseCopilotContext({
      caseId,
      requirements: [],
      tasks: [{ id: task!.id, label: task!.taskType, status: task!.status }],
      contextualTasks: [{ id: task!.id, task: task! }],
      resolveContextTask: (row) => row.task!,
    });

    const reply = buildCaseAssistantReply(
      EMPIRE_DATASET,
      'Approve Prepare decision recommendation on case CLM-CI-2026-0156 based on the AI recommendation.',
      ctx,
    );

    expect(reply?.sideEffect).toEqual({
      kind: 'task_action',
      taskId: 'task_emp_ci_003',
      actionType: 'complete',
    });
    expect(reply?.text).toContain('Done');
    expect(reply?.text).not.toContain('What was done');
  });

  it('builds crew reasoning without side effect', () => {
    const caseId = EMPIRE_DEMO_CASE_IDS.criticalIllnessClaim;
    const task = listTasks(EMPIRE_DATASET, { caseId }).find((row) => row.id === 'task_emp_ci_003');
    const ctx = resolveCaseCopilotContext({
      caseId,
      requirements: [],
      tasks: [{ id: task!.id, label: task!.taskType, status: task!.status }],
      contextualTasks: [{ id: task!.id, task: task! }],
      resolveContextTask: (row) => row.task!,
    });

    const reply = buildCaseAssistantReply(
      EMPIRE_DATASET,
      'Walk me through the AI crew reasoning for this task.',
      ctx,
    );

    expect(reply?.sideEffect).toBeUndefined();
    expect(reply?.text).toContain('Intelligence reasoning');
    expect(reply?.artifact?.kind).toBe('action-card');
  });

  it('names the next open task from case workspace focus', () => {
    const caseId = EMPIRE_DEMO_CASE_IDS.criticalIllnessClaim;
    const tasks = listTasks(EMPIRE_DATASET, { caseId });
    const nextTask = pickNextOpenCaseTask(EMPIRE_DATASET, caseId);
    expect(nextTask?.id).toBe('task_emp_ci_003');

    const ctx = resolveCaseCopilotContext({
      caseId,
      requirements: [],
      tasks: tasks.map((row) => ({
        id: row.id,
        label: row.taskType,
        status: row.status,
      })),
      contextualTasks: tasks.map((row) => ({ id: row.id, task: row })),
      resolveContextTask: (row) => row.task!,
    });

    const reply = buildCaseAssistantReply(
      EMPIRE_DATASET,
      'What is the next task on this case?',
      ctx,
    );

    expect(reply?.artifact?.kind).toBe('case-task-queue');
    expect(reply?.text).toContain(nextTask!.taskType);
  });

  it('skips a completed focus task when asking for the next task', () => {
    const caseId = EMPIRE_DEMO_CASE_IDS.criticalIllnessClaim;
    const dataset = {
      ...EMPIRE_DATASET,
      tasks: EMPIRE_DATASET.tasks.map((row) =>
        row.id === 'task_emp_ci_003' ? { ...row, status: 'Completed' } : row,
      ),
    };
    const tasks = listTasks(dataset, { caseId });
    const focusTask = tasks.find((row) => row.id === 'task_emp_ci_003');
    expect(focusTask?.status).toMatch(/completed/i);
    expect(pickNextOpenCaseTask(dataset, caseId, focusTask!.id)).toBeUndefined();

    const ctx = resolveCaseCopilotContext({
      caseId,
      requirements: [{ id: 1, name: 'Decision sign-off', status: 'In Queue' }],
      tasks: tasks.map((row) => ({
        id: row.id,
        label: row.taskType,
        status: row.status,
      })),
      contextualTasks: tasks.map((row) => ({ id: row.id, task: row })),
      resolveContextTask: (row) => row.task!,
      selectedTask: focusTask!,
    });

    const reply = buildCaseAssistantReply(dataset, 'What is the next task on this case?', ctx);

    expect(reply?.artifact?.kind).toBe('case-next-step');
    expect(reply?.text).toContain('No open tasks');
    expect(reply?.followUps).toContain('Which requirements are still open?');
  });

  it('answers short open-requirements follow-up chip', () => {
    const caseId = EMPIRE_DEMO_CASE_IDS.criticalIllnessClaim;
    const ctx = resolveCaseCopilotContext({
      caseId,
      requirements: [
        { id: 1, name: 'Specialist diagnosis', status: 'Fulfilled' },
        { id: 2, name: 'Decision sign-off', status: 'In Queue' },
      ],
      tasks: [],
      contextualTasks: [],
      resolveContextTask: () => {
        throw new Error('not needed');
      },
    });

    const reply = buildCaseAssistantReply(EMPIRE_DATASET, 'Which requirements are still open?', ctx);

    expect(reply?.artifact?.kind).toBe('case-requirements-list');
    expect(reply?.text).toContain('open requirement');
  });

  it('lists open requirements on case', () => {
    const caseId = EMPIRE_DEMO_CASE_IDS.criticalIllnessClaim;
    const ctx = resolveCaseCopilotContext({
      caseId,
      requirements: [
        { id: 1, name: 'Specialist diagnosis', status: 'Fulfilled' },
        { id: 2, name: 'Decision sign-off', status: 'In Queue' },
      ],
      tasks: [],
      contextualTasks: [],
      resolveContextTask: () => {
        throw new Error('not needed');
      },
    });

    const reply = buildCaseAssistantReply(
      EMPIRE_DATASET,
      'Which requirements are still open on this case, and what is blocking progress?',
      ctx,
    );

    if (reply?.artifact?.kind === 'case-requirements-list') {
      expect(reply.artifact.items.some((row) => row.name === 'Decision sign-off')).toBe(true);
    }
  });

  it('builds case briefing artifact turn', () => {
    const caseId = EMPIRE_DEMO_CASE_IDS.criticalIllnessClaim;
    const task = listTasks(EMPIRE_DATASET, { caseId }).find((row) => row.id === 'task_emp_ci_003');
    const ctx = resolveCaseCopilotContext({
      caseId,
      requirements: [{ id: 1, name: 'Decision sign-off', status: 'In Queue' }],
      tasks: [{ id: task!.id, label: task!.taskType, status: task!.status }],
      contextualTasks: [{ id: task!.id, task: task! }],
      resolveContextTask: (row) => row.task!,
    });
    const turn = buildCaseCopilotBriefTurn({
      greetingName: 'Victor Ramon',
      caseId,
      clientHeadline: 'Sophie Chen · Critical Illness',
      requirements: [{ id: 1, name: 'Decision sign-off', status: 'In Queue' }],
      tasks: [{ id: task!.id, label: task!.taskType, status: task!.status }],
      copilotContext: ctx,
    });
    expect(turn.artifact?.kind).toBe('case-brief');
    if (turn.artifact?.kind === 'case-brief') {
      expect(turn.artifact.greetingName).toBe('Victor');
      expect(turn.artifact.focusTask?.semiAuto).toBe(true);
    }
  });
});
