import type { DatasetTaskRecord } from '../data/multi-case-dataset';
import { getTaskCrewStepSeed } from '../data/taskCrewReasoningSeeds';
import { resolveAiSummaryPresentation } from './aiSummaryPresentation';
import type {
  Task,
  TaskCrewStep,
  TaskExecutionMode,
  TaskPanelAction,
  TaskReviewPayload,
  TaskStatus,
} from '../types';

const MANUAL_LABEL_PATTERN =
  /\b(chase|follow-up|follow up|schedule|interview|contact|order and chase|track )\b/i;

const GENERIC_CHECKLIST_PATTERN =
  /^(review linked entities|confirm ownership|update task status|review case context|take the next action|document the outcome|confirm requirement status)/i;

function isCompletedStatus(status: string): boolean {
  const key = status.toLowerCase();
  return key === 'completed' || key === 'complete' || key === 'done';
}

function isGenericChecklistItem(item: string, label: string): boolean {
  const normalized = item.trim().toLowerCase();
  if (GENERIC_CHECKLIST_PATTERN.test(normalized)) return true;
  if (normalized === `review ${label.trim().toLowerCase()}`) return true;
  if (/update case notes|advisor copy|adviser copy/.test(normalized)) return true;
  return false;
}

function collectChecklist(row: Pick<DatasetTaskRecord, 'summary' | 'panelContext'>): string[] {
  const fromSummary = row.summary?.checklist ?? [];
  const fromPanel = row.panelContext?.suggestions ?? [];
  const merged = [...fromSummary, ...fromPanel];
  const seen = new Set<string>();
  return merged.filter((item) => {
    const key = item.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function inferTaskExecutionMode(
  row: Pick<
    DatasetTaskRecord,
    'label' | 'status' | 'alert' | 'aiGenerated' | 'assignee' | 'hasAI' | 'aiSummary' | 'executionMode'
  >,
): TaskExecutionMode {
  if (row.executionMode) return row.executionMode;

  const status = String(row.status);
  const alertType = row.alert?.type;

  if (
    !isCompletedStatus(status)
    && alertType
    && (alertType === 'overdue' || alertType === 'blocking' || alertType === 'sla')
  ) {
    return 'exception';
  }

  if (MANUAL_LABEL_PATTERN.test(row.label)) {
    return 'manual';
  }

  if (row.aiGenerated || row.assignee === 'AI Agent') {
    return 'semi_auto';
  }

  if (row.hasAI && row.aiSummary?.trim()) {
    return 'semi_auto';
  }

  if (row.aiSummary?.trim() && !MANUAL_LABEL_PATTERN.test(row.label)) {
    return 'semi_auto';
  }

  return 'manual';
}

function buildFallbackCrewSteps(
  taskId: string,
  reasoning: string[] | undefined,
  row: Pick<DatasetTaskRecord, 'aiNarrative' | 'createdDate' | 'label'>,
): TaskCrewStep[] | undefined {
  const seed = getTaskCrewStepSeed(taskId);
  if (seed?.length) return seed;

  if (!reasoning?.length) return undefined;
  if (!row.aiNarrative?.text?.trim()) return undefined;

  const agent = row.aiNarrative?.generatedBy ?? 'AI Agent';
  const completedAt = row.aiNarrative?.generatedAt ?? row.createdDate;

  return [
    {
      id: `${taskId}-summary`,
      title: 'AI crew analysis',
      agent,
      completedAt,
      status: 'completed',
      findings: reasoning.map((text) => ({ text, tone: 'success' as const })),
      rationale: 'Automated review consolidated linked evidence and workflow checks before this task was assigned for human approval.',
    },
  ];
}

function attachCrewSteps(
  taskId: string,
  payload: TaskReviewPayload,
  row: Pick<DatasetTaskRecord, 'aiNarrative' | 'createdDate' | 'label'>,
): TaskReviewPayload {
  const crewSteps =
    payload.crewSteps?.length
      ? payload.crewSteps
      : buildFallbackCrewSteps(taskId, payload.reasoning, row);

  if (!crewSteps?.length) return payload;
  return { ...payload, crewSteps };
}

export function resolveTaskReview(row: DatasetTaskRecord): TaskReviewPayload {
  if (row.review?.verdict?.trim()) {
    const payload = attachCrewSteps(row.id, {
      verdict: row.review.verdict.trim(),
      reasoning: row.review.reasoning,
      crewSteps: row.review.crewSteps,
      confidence: row.review.confidence,
      evidenceIds: row.review.evidenceIds ?? row.evidenceDocuments?.map((doc) => doc.id),
    }, row);
    return {
      ...payload,
      suggestedRequirements: row.review.suggestedRequirements,
      addressDecision: row.review.addressDecision,
      addressPolicyScope: row.review.addressPolicyScope,
    };
  }

  const verdict =
    row.aiNarrative?.text?.trim()
    || row.aiSummary?.trim()
    || row.summary?.description?.trim()
    || row.panelContext?.contextSummary?.trim()
    || row.description?.trim()
    || row.label;

  const confidence = row.aiNarrative?.confidence ?? row.aiConfidence ?? undefined;
  const checklist = collectChecklist(row);
  const reasoning = checklist
    .filter((item) => !isGenericChecklistItem(item, row.label))
    .slice(0, 4);

  return attachCrewSteps(row.id, {
    verdict,
    confidence,
    reasoning: reasoning.length ? reasoning : undefined,
    evidenceIds: row.evidenceDocuments?.map((doc) => doc.id),
  }, row);
}

export function resolveTaskReviewFromTask(task: Task): TaskReviewPayload {
  if (task.review?.verdict?.trim()) {
    const base = task.review.crewSteps?.length
      ? task.review
      : attachCrewSteps(task.id, task.review, {
          aiNarrative: task.aiNarrative ?? undefined,
          createdDate: task.createdDate,
          label: task.taskType,
        });
    return base;
  }
  const verdict =
    task.aiNarrative?.text?.trim()
    || task.aiSummary?.trim()
    || task.summary?.description?.trim()
    || task.panelContext?.contextSummary?.trim()
    || task.description?.trim()
    || task.taskType;

  const checklist = [
    ...(task.summary?.checklist ?? []),
    ...(task.panelContext?.suggestions ?? []),
  ];
  const reasoning = checklist
    .filter((item) => !isGenericChecklistItem(item, task.taskType))
    .slice(0, 4);

  return attachCrewSteps(task.id, {
    verdict,
    confidence: task.aiNarrative?.confidence ?? task.aiConfidence,
    reasoning: reasoning.length ? reasoning : undefined,
    evidenceIds: task.evidenceDocuments?.map((doc) => doc.id),
  }, {
    aiNarrative: task.aiNarrative ?? undefined,
    createdDate: task.createdDate,
    label: task.taskType,
  });
}

export function isSemiAutoTask(task: Pick<Task, 'executionMode'>): boolean {
  return task.executionMode === 'semi_auto' || task.executionMode === 'exception';
}

export function resolveTaskPanelActions(
  task: Task,
  options: { isCompleted: boolean; hasEvidence: boolean },
): TaskPanelAction[] {
  const { isCompleted, hasEvidence } = options;
  const datasetActions = task.actions ?? [];
  const viewAction = datasetActions.find(
    (action) => action.label.toLowerCase().includes('view') || action.type === 'complete',
  );

  if (isCompleted && hasEvidence && viewAction) {
    return [{ ...viewAction, isPrimary: true }];
  }

  if (isSemiAutoTask(task) && !isCompleted) {
    return [
      { type: 'complete', label: 'Approve', isPrimary: true },
      { type: 'request_info', label: 'Amend', isPrimary: false },
    ];
  }

  if (task.executionMode === 'manual' && !isCompleted) {
    return [
      { type: 'complete', label: 'Complete', isPrimary: true },
      { type: 'request_info', label: 'Request info', isPrimary: false },
    ];
  }

  if (datasetActions.length) {
    return datasetActions;
  }

  return [{ type: 'complete', label: isCompleted ? 'View' : 'Complete', isPrimary: true }];
}

export function formatTaskStage(stage?: string): string {
  if (!stage?.trim()) return '—';
  return stage.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Task list column — AI checks completed and the recommendation headline. */
export const TASK_TABLE_WORK_COLUMN_LABEL = 'Review summary';

const TASK_TABLE_WORK_ITEM_MAX = 36;
const TASK_TABLE_APPROVAL_HINT_MAX = 92;
const TASK_TABLE_WORK_ITEMS_MAX = 4;
const TASK_TABLE_WORK_DISPLAY_ITEMS_MAX = 3;
const GENERIC_CREW_ANALYSIS_TITLE = 'ai crew analysis';

function compactTaskTableWorkItem(text: string, max = TASK_TABLE_WORK_ITEM_MAX): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trim()}…`;
}

function isGenericCrewAnalysisStep(title: string): boolean {
  return title.trim().toLowerCase() === GENERIC_CREW_ANALYSIS_TITLE;
}

function workItemsFromCrewStep(step: TaskCrewStep): string[] {
  const title = compactTaskTableWorkItem(step.title);
  const fromFindings = (step.findings ?? [])
    .map((finding) => compactTaskTableWorkItem(finding.text))
    .filter(Boolean);

  if (isGenericCrewAnalysisStep(step.title) && fromFindings.length) {
    return fromFindings.slice(0, TASK_TABLE_WORK_ITEMS_MAX);
  }

  if (!fromFindings.length) {
    return title ? [title] : [];
  }

  const merged = [title, ...fromFindings].filter(Boolean);
  const seen = new Set<string>();
  return merged
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, TASK_TABLE_WORK_ITEMS_MAX);
}

function collectTaskTableWorkItems(task: Task): string[] {
  const review = resolveTaskReviewFromTask(task);
  const crew = review.crewSteps ?? [];

  if (crew.length === 1) {
    return workItemsFromCrewStep(crew[0]);
  }

  if (crew.length > 1) {
    return crew
      .map((step) => compactTaskTableWorkItem(step.title))
      .filter(Boolean)
      .slice(0, TASK_TABLE_WORK_ITEMS_MAX);
  }

  const fromReasoning = (review.reasoning ?? [])
    .map((item) => compactTaskTableWorkItem(item))
    .filter(Boolean);
  if (fromReasoning.length) return fromReasoning.slice(0, TASK_TABLE_WORK_ITEMS_MAX);

  return [];
}

function resolveTaskTableApprovalHint(
  task: Pick<Task, 'aiConfidence' | 'aiNarrative' | 'aiSummary'>,
  review: TaskReviewPayload,
): string | undefined {
  const { text } = resolveAiSummaryPresentation(review.verdict, review.confidence ?? task.aiConfidence);
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return undefined;

  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const pick =
    sentences.find((sentence) => /\b(recommend|recommendation|approve|payout)\b/i.test(sentence))
    ?? sentences.find((sentence) =>
      /\b(ready for|suggest|advance|fulfilled|largely complete)\b/i.test(sentence),
    )
    ?? sentences[0];

  return compactTaskTableWorkItem(pick, TASK_TABLE_APPROVAL_HINT_MAX);
}

function formatTaskTableChecksLine(items: string[]): string {
  if (!items.length) return '';
  if (items.length <= TASK_TABLE_WORK_DISPLAY_ITEMS_MAX) {
    return items.join(' · ');
  }
  const shown = items.slice(0, TASK_TABLE_WORK_DISPLAY_ITEMS_MAX);
  return `${shown.join(' · ')} +${items.length - TASK_TABLE_WORK_DISPLAY_ITEMS_MAX}`;
}

function buildTaskTableDigestFull(
  items: string[],
  recommendation: string | undefined,
  verdict?: string,
): string {
  const lines: string[] = [];
  if (items.length) lines.push(`Done: ${items.join(' · ')}`);
  if (recommendation) lines.push(`Approve: ${recommendation}`);
  const verdictTrimmed = verdict?.replace(/\s+/g, ' ').trim();
  if (verdictTrimmed && verdictTrimmed !== recommendation) {
    lines.push(verdictTrimmed);
  }
  return lines.join('\n');
}

export type TaskTableAiDigest = {
  /** High-level checks or findings completed by AI. */
  items: string[];
  /** What the assignee is being asked to approve (verdict headline). */
  recommendation?: string;
  /** Checks line for compact single-line fallbacks. */
  display: string;
  full: string;
  kind: 'ai' | 'manual' | 'exception' | 'empty';
};

/** Checks completed + approval headline for task tables. */
export function resolveTaskTableAiDigest(
  task: Pick<
    Task,
    | 'taskType'
    | 'status'
    | 'alert'
    | 'aiGenerated'
    | 'assignedTo'
    | 'hasAI'
    | 'aiSummary'
    | 'aiConfidence'
    | 'aiNarrative'
    | 'description'
    | 'executionMode'
    | 'review'
    | 'summary'
    | 'panelContext'
    | 'evidenceDocuments'
    | 'id'
    | 'createdDate'
  >,
): TaskTableAiDigest {
  const mode = inferTaskExecutionModeFromTask(task);
  const empty: TaskTableAiDigest = { items: [], display: '—', full: '', kind: 'empty' };

  if (mode === 'manual') {
    return { ...empty, kind: 'manual' };
  }

  const review = resolveTaskReviewFromTask(task as Task);
  const items = collectTaskTableWorkItems(task as Task);
  const recommendation =
    mode === 'exception' && task.alert?.message?.trim()
      ? compactTaskTableWorkItem(task.alert.message, TASK_TABLE_APPROVAL_HINT_MAX)
      : resolveTaskTableApprovalHint(task, review);

  const display = formatTaskTableChecksLine(items);
  const full = buildTaskTableDigestFull(items, recommendation, review.verdict);

  if (items.length || recommendation) {
    return {
      items,
      recommendation,
      display: display || recommendation || '—',
      full: full || recommendation || '—',
      kind: mode === 'exception' ? 'exception' : 'ai',
    };
  }

  if (mode === 'semi_auto') {
    const fallback = compactTaskTableWorkItem(task.taskType);
    if (fallback) {
      return {
        items: [fallback],
        recommendation,
        display: fallback,
        full: buildTaskTableDigestFull([fallback], recommendation, review.verdict) || fallback,
        kind: 'ai',
      };
    }
  }

  return empty;
}

export function taskExecutionModeLabel(
  mode: TaskExecutionMode | undefined,
  assignee?: string,
): string | null {
  if (mode === 'automated') return 'Automated';
  if (mode === 'semi_auto') return 'AI-assisted';
  if (mode === 'exception') return 'Needs review';
  if (mode === 'manual') {
    if (assignee === 'System') return 'Automated';
    if (assignee === 'AI Agent') return 'AI-assisted';
    return 'Human';
  }
  return null;
}

export function projectTaskReviewFields(row: DatasetTaskRecord): {
  executionMode: TaskExecutionMode;
  review: TaskReviewPayload;
} {
  const executionMode = inferTaskExecutionMode(row);
  const review = resolveTaskReview(row);
  return { executionMode, review };
}

export function inferTaskExecutionModeFromTask(
  task: Pick<
    Task,
    'taskType' | 'status' | 'alert' | 'aiGenerated' | 'assignedTo' | 'hasAI' | 'aiSummary' | 'executionMode'
  >,
): TaskExecutionMode {
  if (task.executionMode) return task.executionMode;
  return inferTaskExecutionMode({
    label: task.taskType,
    status: task.status,
    alert: task.alert,
    aiGenerated: task.aiGenerated,
    assignee: task.assignedTo,
    hasAI: task.hasAI,
    aiSummary: task.aiSummary,
    executionMode: undefined,
  });
}

export function isTaskStatusCompleted(status: TaskStatus | string): boolean {
  return isCompletedStatus(String(status));
}
