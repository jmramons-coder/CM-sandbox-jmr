import type { LiveContext } from '../contexts/LiveContextProvider';

const CASE_CONTEXT_KINDS = new Set([
  'caseDetail',
  'caseTab',
  'caseRequirement',
  'caseTask',
  'folderCase',
]);

export function extractCaseIdFromHref(href: string): string | undefined {
  const match = href.match(/\/cases\/([^/?#]+)/i);
  return match?.[1]?.toUpperCase();
}

export function extractCaseIdFromLiveContext(context?: LiveContext | null): string | undefined {
  if (!context) return undefined;
  if (CASE_CONTEXT_KINDS.has(context.kind)) {
    return extractCaseIdFromHref(context.href);
  }
  return undefined;
}

export function extractCaseIdFromPath(pathname: string): string | undefined {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 'cases' && parts[1]) return parts[1].toUpperCase();
  if (parts[0] === 'folders' && parts[2]) return parts[2].toUpperCase();
  return undefined;
}

export function isCaseLiveContext(context?: LiveContext | null): boolean {
  return extractCaseIdFromLiveContext(context) !== undefined;
}
