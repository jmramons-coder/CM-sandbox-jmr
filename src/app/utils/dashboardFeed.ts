import { deriveDocumentSummaryTitle } from './summaryText';
import { listAiActions } from '../data/objectRepository';
import type { DatasetDocumentRecord, SystemDataset } from '../data/multi-case-dataset';

export type DashboardActivityEvent = 'view' | 'edit' | 'task' | 'requirement';

export type DashboardActivityRow = {
  id: string;
  entity: string;
  caseId: string;
  status: string;
  next: string;
  time: string;
  href: string;
  type: string;
  event: DashboardActivityEvent;
  period: 'day' | 'week' | 'older';
  sortKey: number;
};

export type DashboardFollowUpRow = {
  key: string;
  label: string;
  subtitle?: string;
  type: 'Document' | 'Requirement';
  caseId: string;
  documentId?: string;
  requirementId?: string;
  due: string;
  dueSortKey: number;
  tone: 'overdue' | 'review' | 'due';
};

function getLinkedCaseId(refs: { kind: string; id: string }[] = []): string | undefined {
  return refs.find((ref) => ref.kind === 'case')?.id;
}

export function parseDashboardDate(value?: string | null): number {
  if (!value?.trim()) return 0;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return Date.parse(`${trimmed}T12:00:00Z`);
  }
  const parsed = Date.parse(trimmed);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function toIsoFromSortKey(sortKey: number): string {
  return new Date(sortKey).toISOString();
}

export function formatRelativeActivityTime(iso?: string): string {
  if (!iso) return 'Unknown';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso.length > 24 ? `${iso.slice(0, 10)}` : iso;
  const diffMs = Date.now() - t;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 45) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(t).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' });
}

function activityRecency(sortKey: number): DashboardActivityRow['period'] {
  if (!sortKey) return 'older';
  const diffMs = Date.now() - sortKey;
  if (diffMs < 0) return 'day';
  if (diffMs <= 86400000) return 'day';
  if (diffMs <= 7 * 86400000) return 'week';
  return 'older';
}

function inferActivityEventIcon(text?: string): DashboardActivityEvent {
  const lower = (text ?? '').toLowerCase();
  if (lower.includes('edit') || lower.includes('draft') || lower.includes('added') || lower.includes('updated')) return 'edit';
  if (lower.includes('requirement') || lower.includes('aps') || lower.includes('follow-up') || lower.includes('fce')) return 'requirement';
  if (lower.includes('task') || lower.includes('queue')) return 'task';
  if (lower.includes('document') || lower.includes('upload') || lower.includes('received')) return 'view';
  return 'view';
}

function aiSurfaceToCategory(surface: string): string {
  const labels: Record<string, string> = {
    case: 'Case',
    document: 'Document',
    task: 'Task',
    requirement: 'Requirement',
    request: 'Request',
    copilot: 'Insight',
    scoring: 'Insight',
    entity: 'Record',
  };
  return labels[surface] ?? 'Insight';
}

function isOpenRequirementStatus(status: string): boolean {
  const normalized = status.toLowerCase();
  return !['fulfilled', 'waived', 'completed', 'validated', 'done'].includes(normalized);
}

function documentNeedsAttention(doc: DatasetDocumentRecord): boolean {
  const status = (doc.status ?? '').toLowerCase();
  if (status.includes('review') || status.includes('pending') || status.includes('processing') || status.includes('await')) {
    return true;
  }
  if (!doc.fileAvailable) return true;
  if ((doc.followUps ?? 0) > 0) return true;
  return false;
}

function formatRequirementStatus(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === 'overdue') return 'Overdue';
  if (normalized === 'in_review' || normalized === 'pending') return 'Pending';
  if (normalized === 'not_started') return 'In Queue';
  if (normalized === 'scheduled') return 'Ordered';
  return status;
}

const DASHBOARD_FOLLOW_UP_SUBTITLE_MAX = 52;

/** One-line context for dashboard cards — not full AI narrative. */
export function condenseDashboardFollowUpSubtitle(
  text?: string | null,
  maxLen = DASHBOARD_FOLLOW_UP_SUBTITLE_MAX,
): string | undefined {
  const trimmed = text?.trim();
  if (!trimmed) return undefined;
  const firstSentence = (trimmed.split(/(?<=[.!?])\s+/)[0] ?? trimmed).replace(/\s+/g, ' ').trim();
  if (firstSentence.length <= maxLen) return firstSentence.replace(/\.\s*$/, '');
  const slice = firstSentence.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(' ');
  const clipped = (lastSpace > 18 ? slice.slice(0, lastSpace) : slice).trim();
  return `${clipped}…`;
}

function requirementFollowUpSubtitle(requirement: SystemDataset['requirements'][number]): string {
  const fromNotes = condenseDashboardFollowUpSubtitle(requirement.notes);
  if (fromNotes) return fromNotes;
  const category = requirement.category?.trim();
  const status = formatRequirementStatus(requirement.status);
  return category ? `${category} · ${status}` : status;
}

function documentFollowUpSubtitle(doc: DatasetDocumentRecord): string | undefined {
  const status = doc.status?.trim();
  if (status && status.toLowerCase() !== 'received') {
    return condenseDashboardFollowUpSubtitle(status, 40);
  }
  if (doc.linkedRequirement) {
    return `Linked · ${condenseDashboardFollowUpSubtitle(doc.linkedRequirement, 36) ?? doc.linkedRequirement}`;
  }
  if (!doc.fileAvailable) return 'Awaiting upload';
  return undefined;
}

function pushActivityRow(
  rows: DashboardActivityRow[],
  row: Omit<DashboardActivityRow, 'period' | 'time'> & { sortKey: number },
) {
  rows.push({
    ...row,
    time: formatRelativeActivityTime(toIsoFromSortKey(row.sortKey)),
    period: activityRecency(row.sortKey),
  });
}

function synthesizeCaseActivities(
  dataset: SystemDataset,
  caseById: Map<string, { id: string; claimant?: string }>,
): DashboardActivityRow[] {
  const rows: DashboardActivityRow[] = [];

  for (const doc of dataset.documents) {
    const caseId = doc.linkedCaseId ?? getLinkedCaseId(doc.linkedObjects);
    if (!caseId) continue;
    const sortKey = parseDashboardDate(doc.uploadedAt ?? doc.uploaded);
    if (!sortKey) continue;
    const relatedCase = caseById.get(caseId);
    const headline = doc.aiSummary
      ? deriveDocumentSummaryTitle(doc.label, doc.aiSummary)
      : `${doc.label} uploaded`;
    pushActivityRow(rows, {
      id: `doc-${doc.id}-upload`,
      entity: relatedCase?.claimant ?? doc.claimant ?? caseId,
      caseId,
      status: doc.status,
      next: headline,
      href: `/cases/${caseId}#tab=documents`,
      type: 'Document',
      event: 'view',
      sortKey,
    });
  }

  for (const requirement of dataset.requirements) {
    if (!isOpenRequirementStatus(requirement.status)) continue;
    const caseId = getLinkedCaseId(requirement.linkedObjects);
    if (!caseId) continue;
    const sortKey = parseDashboardDate(requirement.followUpDate ?? requirement.dueDate);
    if (!sortKey) continue;
    const relatedCase = caseById.get(caseId);
    const statusLabel = formatRequirementStatus(requirement.status);
    pushActivityRow(rows, {
      id: `req-${requirement.id}-followup`,
      entity: relatedCase?.claimant ?? caseId,
      caseId,
      status: statusLabel,
      next: requirement.aiSummary?.trim() || `${requirement.label} needs follow-up`,
      href: `/cases/${caseId}#tab=requirements&req=${encodeURIComponent(requirement.id)}`,
      type: 'Requirement',
      event: 'requirement',
      sortKey,
    });
  }

  for (const request of dataset.requests) {
    const caseId = request.caseId ?? getLinkedCaseId(request.linkedObjects);
    const timeline = [...(request.aiActions ?? []), ...(request.humanActions ?? [])];
    for (const [index, action] of timeline.entries()) {
      const sortKey = parseDashboardDate(action.ts);
      if (!sortKey) continue;
      pushActivityRow(rows, {
        id: `req-tl-${request.id}-${index}`,
        entity: request.requester ?? request.label,
        caseId: caseId ?? '-',
        status: action.action,
        next: action.detail || action.action,
        href: caseId ? `/cases/${caseId}` : `/requests#request=${encodeURIComponent(request.id)}`,
        type: action.actorType === 'AI Agent' ? 'AI' : 'Request',
        event: inferActivityEventIcon(`${action.action} ${action.detail}`),
        sortKey,
      });
    }
  }

  for (const task of dataset.tasks) {
    const caseId = getLinkedCaseId(task.linkedObjects);
    if (!caseId) continue;
    const sortKey = parseDashboardDate(task.dueDate ?? task.createdDate);
    if (!sortKey) continue;
    if ((task.status ?? '').toLowerCase() === 'completed') continue;
    const relatedCase = caseById.get(caseId);
    pushActivityRow(rows, {
      id: `task-${task.id}-active`,
      entity: relatedCase?.claimant ?? caseId,
      caseId,
      status: task.status,
      next: task.aiSummary?.trim() || task.label,
      href: `/cases/${caseId}#tab=tasks`,
      type: task.hasAI || task.aiGenerated ? 'AI' : 'Task',
      event: 'task',
      sortKey,
    });
  }

  return rows;
}

export function buildDashboardActivityFeed(
  dataset: SystemDataset,
  caseById: Map<string, { id: string; claimant?: string }>,
): DashboardActivityRow[] {
  const rows: DashboardActivityRow[] = [];
  const activityEvents = dataset.activityEvents ?? [];
  const activityEventIds = new Set(activityEvents.map((event) => event.id));

  for (const event of activityEvents) {
    const caseId = getLinkedCaseId(event.linkedObjects);
    const relatedCase = caseId ? caseById.get(caseId) : undefined;
    const sortKey = parseDashboardDate(event.timestamp);
    pushActivityRow(rows, {
      id: `evt-${event.id}`,
      entity: relatedCase?.claimant ?? event.actor,
      caseId: caseId ?? '-',
      status: event.label ?? 'Activity',
      next: event.detail?.trim() || event.label || 'Activity',
      href: caseId ? `/cases/${caseId}` : '/cases',
      type: event.actor === 'ai' ? 'AI' : 'Event',
      event: inferActivityEventIcon(event.label),
      sortKey: sortKey || 0,
    });
  }

  for (const action of listAiActions(dataset)) {
    if (action.relatedActivityEventId && activityEventIds.has(action.relatedActivityEventId)) continue;
    const caseId = getLinkedCaseId(action.linkedObjects);
    const relatedCase = caseId ? caseById.get(caseId) : undefined;
    const sortKey = parseDashboardDate(action.createdAt);
    const headline = String(action.title ?? '').trim();
    const detail = String(action.summary ?? '').trim();
    pushActivityRow(rows, {
      id: `ai-${action.id}`,
      entity: relatedCase?.claimant ?? action.actor,
      caseId: caseId ?? '-',
      status: headline,
      next: detail || headline,
      href: caseId ? `/cases/${caseId}` : '/cases',
      type: aiSurfaceToCategory(action.sourceSurface),
      event: inferActivityEventIcon(`${headline} ${detail}`),
      sortKey: sortKey || 0,
    });
  }

  rows.push(...synthesizeCaseActivities(dataset, caseById));

  const deduped = new Map<string, DashboardActivityRow>();
  for (const row of rows) {
    const existing = deduped.get(row.id);
    if (!existing || row.sortKey > existing.sortKey) {
      deduped.set(row.id, row);
    }
  }

  return [...deduped.values()]
    .filter((row) => row.sortKey > 0)
    .sort((a, b) => b.sortKey - a.sortKey);
}

export function buildDashboardFollowUps(
  dataset: SystemDataset,
  limit = 6,
): DashboardFollowUpRow[] {
  const requirementRows: DashboardFollowUpRow[] = dataset.requirements
    .filter((requirement) => isOpenRequirementStatus(requirement.status))
    .map((requirement) => {
      const caseId = getLinkedCaseId(requirement.linkedObjects);
      if (!caseId) return null;
      const status = requirement.status.toLowerCase();
      const dueSortKey = parseDashboardDate(requirement.followUpDate ?? requirement.dueDate) || Date.now();
      const tone: DashboardFollowUpRow['tone'] =
        status === 'overdue' ? 'overdue' : status === 'in_review' || status === 'pending' ? 'review' : 'due';
      return {
        key: `req-${requirement.id}`,
        label: requirement.label,
        subtitle: requirementFollowUpSubtitle(requirement),
        type: 'Requirement' as const,
        caseId,
        requirementId: requirement.id,
        due: requirement.followUpDate ?? requirement.dueDate ?? formatRequirementStatus(requirement.status),
        dueSortKey,
        tone,
      };
    })
    .filter((row) => row !== null) as DashboardFollowUpRow[];

  const documentRows = dataset.documents
    .filter(documentNeedsAttention)
    .map((doc) => {
      const caseId = doc.linkedCaseId ?? getLinkedCaseId(doc.linkedObjects);
      if (!caseId) return null;
      const status = (doc.status ?? '').toLowerCase();
      const dueSortKey = parseDashboardDate(doc.uploadedAt ?? doc.uploaded) || Date.now();
      const tone: DashboardFollowUpRow['tone'] =
        !doc.fileAvailable ? 'review' : status.includes('review') || status.includes('pending') ? 'review' : 'due';
      const dueLabel = !doc.fileAvailable
        ? 'Awaiting file'
        : doc.uploaded ?? doc.status;
      return {
        key: `doc-${doc.id}`,
        label: doc.aiSummary
          ? deriveDocumentSummaryTitle(doc.label, doc.aiSummary)
          : doc.label,
        subtitle: documentFollowUpSubtitle(doc),
        type: 'Document' as const,
        caseId,
        documentId: doc.id,
        due: dueLabel,
        dueSortKey,
        tone,
      };
    })
    .filter((row) => row !== null) as DashboardFollowUpRow[];

  const toneRank: Record<DashboardFollowUpRow['tone'], number> = { overdue: 0, review: 1, due: 2 };

  return [...requirementRows, ...documentRows]
    .sort((a, b) => {
      const toneDiff = toneRank[a.tone] - toneRank[b.tone];
      if (toneDiff !== 0) return toneDiff;
      return a.dueSortKey - b.dueSortKey;
    })
    .slice(0, limit);
}
