import { extractCaseIdFromHref, extractCaseIdFromPath } from '../domain/extractCaseIdFromContext';

function normalizeCaseId(id: string): string {
  return id.trim().toUpperCase();
}

export function caseWorkspaceIdsMatch(a: string, b: string): boolean {
  return normalizeCaseId(a) === normalizeCaseId(b);
}

/**
 * True when the click should not dismiss the global AI panel — same-case workspace
 * (case file main area, case object side panel, or an in-app link to that case).
 */
export function matchesCaseWorkspaceInteraction(target: Element, caseId: string): boolean {
  const expected = normalizeCaseId(caseId);

  const surface = target.closest('[data-case-workspace]');
  if (surface) {
    const surfaceId = surface.getAttribute('data-case-workspace');
    if (surfaceId && caseWorkspaceIdsMatch(surfaceId, expected)) return true;
  }

  const link = target.closest('a[href]');
  if (link) {
    const href = link.getAttribute('href');
    if (href) {
      const linkCaseId = extractCaseIdFromHref(href);
      if (linkCaseId && linkCaseId === expected) return true;
    }
  }

  const pathCaseId = extractCaseIdFromPath(window.location.pathname);
  if (pathCaseId === expected && target.closest('main')) {
    return true;
  }

  return false;
}
