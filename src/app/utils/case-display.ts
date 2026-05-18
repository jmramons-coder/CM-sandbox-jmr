import type { CaseRecord } from '../domain/objectRefs';
import type { CaseSummary } from '../types';

/** Human-readable case type line (e.g. "Claim — Waiver of premium"). */
export function formatCaseListSubtitle(record: Pick<CaseRecord, 'title' | 'caseTypeLabel'>): string {
  return (record.caseTypeLabel ?? record.title).trim();
}

/** Case type line from a case list/summary row. */
export function formatCaseSummarySubtitle(summary: Pick<CaseSummary, 'id' | 'title' | 'product'>): string | undefined {
  const line = (summary.title ?? summary.product).trim();
  if (!line || line === summary.id) return undefined;
  return line;
}

/** Global search / header search result shape for a case. */
export function toCaseSummarySearchResult(summary: CaseSummary) {
  return {
    id: `case-${summary.id}`,
    type: 'Case' as const,
    caseId: summary.id,
    caseTypeLine: formatCaseSummarySubtitle(summary),
    status: summary.status,
    href: `/cases/${summary.id}`,
  };
}

/** Options row for `CreationSearchSelect` case pickers. */
export function toCaseSearchSelectOption(record: CaseRecord) {
  const caseTypeLine = formatCaseListSubtitle(record);
  return {
    value: record.id,
    label: record.id,
    subtitle: caseTypeLine === record.id ? undefined : caseTypeLine,
    description: record.title,
    status: record.status,
    statusContext: 'case' as const,
    metadata: [record.caseTypeCode, record.priority, record.title, record.caseTypeLabel].filter(
      Boolean,
    ) as string[],
  };
}
