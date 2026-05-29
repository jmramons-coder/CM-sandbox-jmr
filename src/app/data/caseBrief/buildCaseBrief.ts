import type { CaseBriefContent, BuildCaseBriefInput } from '../../domain/caseBrief';
import type { DailyBriefLinkKind, DailyBriefSegment } from '../../domain/dailyBrief';
import { briefSegmentsToText } from '../dailyBrief/segmentBuilder';

const CLOSED_REQUIREMENT = new Set(['Fulfilled', 'Waived', 'Completed', 'fulfilled']);
const CLOSED_TASK = new Set(['Completed', 'Done', 'Cancelled', 'Closed']);

function isOpenRequirement(status: string): boolean {
  return !CLOSED_REQUIREMENT.has(status);
}

function isOpenTask(status: string): boolean {
  const normalized = status.trim().toLowerCase();
  return !CLOSED_TASK.has(status) && normalized !== 'completed' && normalized !== 'cancelled';
}

function requirementRoute(caseId: string, requirement: BuildCaseBriefInput['requirements'][number]): string {
  const reqId = requirement.datasetRequirementId ?? String(requirement.id);
  return `/cases/${caseId}#tab=requirements&req=${encodeURIComponent(reqId)}`;
}

function taskRoute(caseId: string, taskId: string): string {
  return `/cases/${caseId}#tab=tasks&task=${encodeURIComponent(taskId)}`;
}

function truncateLabel(value: string, max = 52): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trim()}…`;
}

function firstSentence(text: string): string {
  const match = text.trim().match(/^(.+?[.!?])(?:\s|$)/);
  return (match?.[1] ?? text.trim()).trim();
}

function pushText(segments: DailyBriefSegment[], value: string) {
  segments.push({ type: 'text', value });
}

function pushCue(
  segments: DailyBriefSegment[],
  icon: 'sla' | 'blocker' | 'focus' | 'decision' | 'progress',
  label: string,
  tone: 'neutral' | 'warn' | 'urgent' | 'action' | 'positive',
) {
  segments.push({ type: 'cue', icon, label, tone });
}

function pushLink(
  segments: DailyBriefSegment[],
  label: string,
  route: string,
  kind: DailyBriefLinkKind,
) {
  segments.push({ type: 'link', label, route, kind });
}

function pickFocusRequirement(requirements: BuildCaseBriefInput['requirements']) {
  const open = requirements.filter((row) => isOpenRequirement(row.status));
  const blocking = open.filter((row) => row.blockingImpact);
  if (blocking.length) return blocking[0];
  const overdue = open.find((row) => row.status === 'Overdue');
  if (overdue) return overdue;
  return open[0];
}

function taskPriority(row: BuildCaseBriefInput['tasks'][number]): number {
  if (row.status === 'Overdue') return 0;
  if (row.aiGenerated) return 1;
  if (row.status === 'In Queue' || row.status === 'To Do') return 2;
  return 3;
}

function pickFocusTask(
  tasks: BuildCaseBriefInput['tasks'],
  requirement?: BuildCaseBriefInput['requirements'][number],
) {
  const open = tasks.filter((row) => isOpenTask(row.status));
  if (!open.length) return undefined;

  if (requirement?.linkedTasks?.length) {
    const linked = new Set(requirement.linkedTasks);
    const matched = open
      .filter((row) => linked.has(row.id))
      .sort((a, b) => taskPriority(a) - taskPriority(b));
    if (matched[0]) return matched[0];
  }

  return [...open].sort((a, b) => taskPriority(a) - taskPriority(b))[0];
}

function appendContextBlock(segments: DailyBriefSegment[], input: BuildCaseBriefInput) {
  const narrative =
    input.clientSummary?.trim() ||
    (input.aiSummary?.text ? firstSentence(input.aiSummary.text) : '');

  pushText(segments, `${input.clientHeadline.trim()}`);
  if (narrative) {
    pushText(segments, ` — ${narrative}`);
  }
  pushText(segments, '. ');
}

function appendFocusBlock(
  segments: DailyBriefSegment[],
  input: BuildCaseBriefInput,
  focusRequirement?: BuildCaseBriefInput['requirements'][number],
  focusTask?: BuildCaseBriefInput['tasks'][number],
) {
  pushCue(segments, 'focus', 'Suggested focus', 'action');
  pushText(segments, ' ');

  if (focusTask && focusRequirement) {
    pushText(segments, 'Complete ');
    pushLink(
      segments,
      truncateLabel(focusTask.label),
      taskRoute(input.caseId, focusTask.id),
      'task',
    );
    pushText(segments, ' to fulfill ');
    pushLink(
      segments,
      truncateLabel(focusRequirement.name),
      requirementRoute(input.caseId, focusRequirement),
      'requirement',
    );
    pushText(segments, '.');
    return;
  }

  if (focusTask) {
    pushText(segments, 'Complete ');
    pushLink(
      segments,
      truncateLabel(focusTask.label),
      taskRoute(input.caseId, focusTask.id),
      'task',
    );
    pushText(segments, '.');
    return;
  }

  if (focusRequirement) {
    pushText(segments, 'Fulfill ');
    pushLink(
      segments,
      truncateLabel(focusRequirement.name),
      requirementRoute(input.caseId, focusRequirement),
      'requirement',
    );
    pushText(segments, '.');
    return;
  }

  pushText(segments, 'Open the ');
  pushLink(segments, 'Decision tab', `/cases/${input.caseId}#tab=decision`, 'case');
  pushText(segments, ' — requirements are complete.');
}

export function buildCaseBrief(input: BuildCaseBriefInput): CaseBriefContent | null {
  const headline = input.clientHeadline?.trim();
  const fallbackText = input.clientSummary?.trim() || input.aiSummary?.text?.trim();
  if (!headline && !fallbackText) return null;

  const segments: DailyBriefSegment[] = [];
  const focusRequirement = pickFocusRequirement(input.requirements);
  const focusTask = pickFocusTask(input.tasks, focusRequirement);

  appendContextBlock(segments, {
    ...input,
    clientHeadline: headline || 'This case',
  });
  appendFocusBlock(segments, input, focusRequirement, focusTask);

  return {
    contextId: 'cases',
    title: 'Context',
    segments,
    text: briefSegmentsToText(segments) || fallbackText || '',
    source: focusTask || focusRequirement ? 'dynamic' : 'fallback',
    confidence: input.aiSummary?.confidence,
  };
}
