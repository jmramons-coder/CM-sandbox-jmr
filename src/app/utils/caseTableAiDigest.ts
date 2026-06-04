import { buildCaseBrief } from '../data/caseBrief/buildCaseBrief';
import type { CaseBriefRequirementRef, CaseBriefTaskRef } from '../domain/caseBrief';
import type { SystemDataset } from '../data/multi-case-dataset';
import { listRequirements, listTasks } from '../data/objectRepository';
import type { CaseSummary } from '../types';
import { getStatusShort } from './status-display';

/** Case list column — mirrors task list review summary digest. */
export const CASE_TABLE_WORK_COLUMN_LABEL = 'Review summary';

const CONTEXT_MAX = 92;
const FOCUS_MAX = 92;

const CLOSED_REQUIREMENT = new Set(['Fulfilled', 'Waived', 'Completed', 'fulfilled']);

function compact(text: string, max: number): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trim()}…`;
}

function firstSentence(text: string): string {
  const match = text.trim().match(/^(.+?[.!?—–-])(?:\s|$)/);
  return (match?.[1] ?? text.trim()).trim();
}

function mapRequirements(dataset: SystemDataset, caseId: string): CaseBriefRequirementRef[] {
  return listRequirements(dataset, caseId).map((req) => ({
    id: req.id,
    datasetRequirementId: req.datasetRequirementId,
    name: req.name,
    status: req.status,
    linkedTasks: req.linkedTasks,
    blockingImpact: req.blockingImpact,
  }));
}

function mapTasks(dataset: SystemDataset, caseId: string): CaseBriefTaskRef[] {
  return listTasks(dataset, { caseId }).map((task) => ({
    id: task.id,
    label: task.taskType,
    status: task.status,
    aiGenerated: task.aiGenerated,
  }));
}

function resolveContextLine(summary: CaseSummary, requirements: CaseBriefRequirementRef[]): string {
  if (requirements.length) {
    const open = requirements.filter((row) => !CLOSED_REQUIREMENT.has(row.status));
    const done = requirements.length - open.length;
    if (open.length) {
      const urgent =
        open.find((row) => row.status === 'Overdue')
        ?? open.find((row) => row.blockingImpact);
      if (urgent) {
        return compact(`${done}/${requirements.length} requirements · ${urgent.name}`, CONTEXT_MAX);
      }
      return compact(`${done}/${requirements.length} requirements · ${open.length} open`, CONTEXT_MAX);
    }
    return compact(`${requirements.length}/${requirements.length} requirements complete`, CONTEXT_MAX);
  }

  if (summary.aiSummary?.trim()) {
    return compact(firstSentence(summary.aiSummary), CONTEXT_MAX);
  }

  return compact(getStatusShort(summary.status), CONTEXT_MAX);
}

function resolveFocusFromBriefText(briefText: string): string | undefined {
  const completeBoth = briefText.match(/Complete (.+?) to fulfill (.+?)\./i);
  if (completeBoth) {
    return compact(`Complete ${completeBoth[1]} to fulfill ${completeBoth[2]}`, FOCUS_MAX);
  }

  const completeTask = briefText.match(/Complete (.+?)\./i);
  if (completeTask) {
    return compact(`Prioritize ${completeTask[1]}`, FOCUS_MAX);
  }

  const fulfillReq = briefText.match(/Fulfill (.+?)\./i);
  if (fulfillReq) {
    return compact(`Fulfill ${fulfillReq[1]}`, FOCUS_MAX);
  }

  if (/Decision tab/i.test(briefText)) {
    return 'Requirements complete — review decision recommendation';
  }

  return undefined;
}

function resolveRecommendationFocus(summary: CaseSummary): string {
  switch (summary.aiRecommendation) {
    case 'Approve':
      return 'Review AI recommendation and sign decision';
    case 'Close':
      return 'Confirm closure steps and archive case';
    case 'Monitor':
      return 'Monitor progress and next milestones';
    default:
      break;
  }

  const tail = summary.aiSummary?.split(/[—–-]/).pop()?.trim();
  if (tail) return tail;

  return 'Review open requirements and tasks';
}

function resolveFocusLine(
  summary: CaseSummary,
  briefText: string | undefined,
  requirements: CaseBriefRequirementRef[],
): string | undefined {
  const fromBrief = briefText ? resolveFocusFromBriefText(briefText) : undefined;
  if (fromBrief) return fromBrief;

  if (requirements.length) {
    const open = requirements.filter((row) => !CLOSED_REQUIREMENT.has(row.status));
    const blocking = open.find((row) => row.blockingImpact || row.status === 'Overdue') ?? open[0];
    if (blocking) {
      return compact(`Fulfill ${blocking.name}`, FOCUS_MAX);
    }
  }

  return compact(resolveRecommendationFocus(summary), FOCUS_MAX);
}

function resolveDigestKind(summary: CaseSummary, requirements: CaseBriefRequirementRef[]): CaseTableAiDigest['kind'] {
  if (!summary.aiSummary?.trim() && !requirements.length) return 'empty';

  const hasOverdue = requirements.some((row) => row.status === 'Overdue');
  const hasBlocking = requirements.some((row) => row.blockingImpact && !CLOSED_REQUIREMENT.has(row.status));

  if (
    summary.rag === 'Red'
    || summary.priority === 'High' && summary.aiRecommendation === 'Pending'
    || hasOverdue
    || hasBlocking
  ) {
    return 'exception';
  }

  return 'ai';
}

export type CaseTableAiDigest = {
  context: string;
  focus?: string;
  focusLabel: 'Approve' | 'Focus';
  full: string;
  kind: 'ai' | 'exception' | 'empty';
};

export function resolveCaseTableAiDigest(
  summary: CaseSummary,
  dataset?: SystemDataset,
): CaseTableAiDigest {
  const requirements = dataset ? mapRequirements(dataset, summary.id) : [];
  const tasks = dataset ? mapTasks(dataset, summary.id) : [];

  const brief = buildCaseBrief({
    caseId: summary.id,
    clientHeadline: summary.claimant,
    clientSummary: summary.aiSummary ? firstSentence(summary.aiSummary) : undefined,
    aiSummary: summary.aiSummary ? { text: summary.aiSummary } : undefined,
    requirements,
    tasks,
  });

  const context = resolveContextLine(summary, requirements);
  const focus = resolveFocusLine(summary, brief?.text, requirements);
  const kind = resolveDigestKind(summary, requirements);
  const focusLabel = summary.aiRecommendation === 'Approve' ? 'Approve' : 'Focus';
  const full = [context, focus].filter(Boolean).join('\n');

  if (kind === 'empty' || (!context && !focus)) {
    return { context: '—', full: '', kind: 'empty', focusLabel: 'Focus' };
  }

  return {
    context: context || '—',
    focus,
    focusLabel,
    full: full || context,
    kind,
  };
}
