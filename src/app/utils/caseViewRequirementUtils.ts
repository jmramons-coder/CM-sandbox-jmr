import type { CaseRequirement } from '../types';

/** External source host for requirements (replace with env-driven URL in production). */
export const EXTERNAL_SOURCE_ORIGIN = 'https://oipa.example.com';

export function requirementExternalHref(caseId: string, row: CaseRequirement): string {
  return row.oipaUrl ?? `${EXTERNAL_SOURCE_ORIGIN}/claims/${encodeURIComponent(caseId)}/requirements/${row.id}`;
}

/** Short reference shown in the requirements table (links to external source). */
export function requirementExternalCode(row: CaseRequirement): string {
  return `R-${row.id}`;
}
