import type { DynamicDocumentData } from '../components/DynamicDocumentSidePanel';
import type { SystemDataset } from '../data/multi-case-dataset';
import { getDocumentEvidence } from '../data/mock-document-evidence';
import type { CaseSummary, Task } from '../types';

export const DASHBOARD_TASK_CASE_LINK_CLASS =
  'text-[11px] font-medium text-brand-blue underline underline-offset-2 hover:text-brand-blue-hover';

/** Tasks listed first on the dashboard critical-path widget (higher index = later). */
export const DASHBOARD_CRITICAL_PATH_PINNED_TASK_IDS = ['task_cd5221'] as const;

export function compareDashboardCriticalPathTasks(
  taskIdA: string,
  taskIdB: string,
  rankScoreA: number,
  rankScoreB: number,
): number {
  const pinA = DASHBOARD_CRITICAL_PATH_PINNED_TASK_IDS.indexOf(
    taskIdA as (typeof DASHBOARD_CRITICAL_PATH_PINNED_TASK_IDS)[number],
  );
  const pinB = DASHBOARD_CRITICAL_PATH_PINNED_TASK_IDS.indexOf(
    taskIdB as (typeof DASHBOARD_CRITICAL_PATH_PINNED_TASK_IDS)[number],
  );
  if (pinA !== -1 || pinB !== -1) {
    if (pinA === -1) return 1;
    if (pinB === -1) return -1;
    return pinA - pinB;
  }
  return rankScoreB - rankScoreA;
}

export type DashboardTaskMetric = {
  show: boolean;
  value: string;
  label: string;
};

export type DashboardTaskAction = {
  label: string;
};

export function buildDashboardTaskReason(task: Task): string {
  return (
    task.aiSummary?.trim()
    ?? task.panelContext?.contextSummary?.trim()
    ?? task.description?.trim()
    ?? task.panelContext?.contextTitle?.trim()
    ?? `${task.taskType}. ${task.slaRemaining} remaining.`
  );
}

function taskTextBlob(task: Task): string {
  return [
    task.taskType,
    task.stage,
    task.aiSummary,
    task.panelContext?.contextSummary,
    task.panelContext?.contextTitle,
    task.description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function parseMoneyFromText(text: string): number | null {
  const match = text.match(/\$([\d,]+(?:\.\d+)?)\s*(k|m)?/i);
  if (!match) return null;
  let amount = Number.parseFloat(match[1].replace(/,/g, ''));
  if (match[2]?.toLowerCase() === 'k') amount *= 1000;
  if (match[2]?.toLowerCase() === 'm') amount *= 1_000_000;
  return Number.isFinite(amount) ? amount : null;
}

export function resolveDashboardTaskMetric(
  task: Task,
  relatedCase: CaseSummary | undefined,
  formatAmount: (value: number, options?: { compact?: boolean }) => string,
  parseBenefit: (value?: string) => number,
): DashboardTaskMetric {
  const blob = taskTextBlob(task);
  const caseBenefit = parseBenefit(relatedCase?.benefit);
  const explicitAmount = parseMoneyFromText(blob);
  const deathBenefit =
    explicitAmount ?? (blob.includes('death') && caseBenefit > 0 ? caseBenefit : 0);

  if (blob.includes('death benefit') || blob.includes('payout') || (blob.includes('death') && deathBenefit > 0)) {
    const value = deathBenefit || caseBenefit;
    if (value > 0) {
      return { show: true, value: formatAmount(value, { compact: true }), label: 'Death benefit' };
    }
  }

  if (blob.includes('wop') || blob.includes('premium waiver') || blob.includes('waiver rider')) {
    if (caseBenefit > 0) {
      return { show: true, value: formatAmount(caseBenefit, { compact: true }), label: 'Monthly waiver' };
    }
  }

  if (task.stage === 'decision' || blob.includes('decision') || blob.includes('clear for decision')) {
    if (caseBenefit > 0) {
      return { show: true, value: formatAmount(caseBenefit, { compact: true }), label: 'Benefit at stake' };
    }
    return { show: true, value: task.slaRemaining, label: 'Due' };
  }

  if (
    blob.includes('chase')
    || blob.includes('verify')
    || blob.includes('fce')
    || blob.includes('aps')
    || blob.includes('requirement')
    || blob.includes('earnings')
  ) {
    return {
      show: true,
      value: task.slaRemaining,
      label: task.slaStatus === 'danger' ? 'Overdue' : 'SLA left',
    };
  }

  if (blob.includes('narrative') || blob.includes('medical') || blob.includes('contestability')) {
    return { show: true, value: task.slaRemaining, label: 'SLA left' };
  }

  if (caseBenefit > 0 && (blob.includes('disabilit') || relatedCase?.claimSubType === 'disability')) {
    return { show: true, value: formatAmount(caseBenefit, { compact: true }), label: 'Case reserve' };
  }

  return { show: true, value: task.slaRemaining, label: 'SLA left' };
}

export function resolveDashboardTaskPrimaryAction(task: Task, roleView?: 'assessor' | 'manager'): DashboardTaskAction {
  if (roleView === 'manager') return { label: 'Review & countersign' };
  const type = task.taskType.toLowerCase();
  if (type.includes('decision')) return { label: 'View task' };
  if (type.includes('requirement')) return { label: 'View requirements' };
  if (type.includes('review') || type.includes('file')) return { label: 'Review file' };
  return { label: 'View task' };
}

export function resolveDashboardTaskPrimaryRoute(task: Task): string {
  return `/tasks#task=${encodeURIComponent(task.id)}`;
}

export function resolveDashboardTaskEvidenceRoute(task: Task, dataset: SystemDataset): string | undefined {
  const documentId = resolveTaskEvidenceDocumentId(task, dataset);
  const caseId = task.caseId;
  if (!documentId || !caseId) return undefined;
  return `/cases/${caseId}#tab=documents&doc=${encodeURIComponent(documentId)}`;
}

export function resolveTaskEvidenceDocumentIds(task: Task, dataset: SystemDataset): string[] {
  const ids = new Set<string>();
  if (task.panelContext?.evidenceDocumentId) ids.add(task.panelContext.evidenceDocumentId);
  task.evidenceDocuments?.forEach((document) => ids.add(document.id));
  task.linkedObjects?.forEach((object) => {
    if (object.kind === 'document') ids.add(object.id);
  });
  task.objectRefs?.forEach((object) => {
    if (object.kind === 'document') ids.add(object.id);
  });

  const linkedRequirementIds = [
    ...(task.linkedObjects?.filter((object) => object.kind === 'requirement').map((object) => object.id) ?? []),
    ...(task.objectRefs?.filter((object) => object.kind === 'requirement').map((object) => object.id) ?? []),
  ];
  linkedRequirementIds.forEach((requirementId) => {
    const requirement = dataset.requirements.find((row) => row.id === requirementId);
    requirement?.linkedDocs?.forEach((documentId) => ids.add(documentId));
  });

  return Array.from(ids);
}

export function resolveTaskEvidenceDocumentId(task: Task, dataset: SystemDataset): string | undefined {
  return resolveTaskEvidenceDocumentIds(task, dataset)[0];
}

export function resolveTaskEvidencePreview(
  task: Task,
  dataset: SystemDataset,
): DynamicDocumentData | null {
  const documentId = resolveTaskEvidenceDocumentId(task, dataset);
  if (!documentId) return null;
  return getDocumentEvidence(documentId, dataset) ?? null;
}

export function resolveTaskEvidenceButtonLabel(
  task: Task,
  evidence?: DynamicDocumentData | null,
): string {
  const name = (evidence?.documentTitle ?? task.evidenceDocuments?.[0]?.name ?? 'document').toLowerCase();
  if (name.includes('application')) return 'View application';
  if (name.includes('questionnaire') || name.includes('needs analysis')) return 'View questionnaire';
  if (name.includes('fnol') || name.includes('registration')) return 'View FNOL';
  if (name.includes('aps') || name.includes('physician')) return 'View APS';
  if (name.includes('fce') || name.includes('capacity')) return 'View FCE';
  if (name.includes('death certificate')) return 'View death certificate';
  if (name.includes('report') || name.includes('medical') || name.includes('diagnosis')) return 'View report';
  return 'View evidence';
}
