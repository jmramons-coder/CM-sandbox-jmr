/**
 * Default width helpers for right-aligned overlay side panels.
 *
 * All panels (request, document, task, requirement, evidence, AI assistant,
 * case AI activity, …) share the same opening behaviour: they default to 45 %
 * of the viewport, clamped between a min and an optional max so the panel
 * never collapses below a usable width or covers the full page.
 */

export const DEFAULT_SIDE_PANEL_WIDTH_RATIO = 0.45;
export const DOCUMENT_SIDE_PANEL_WIDTH_RATIO = 0.55;
/** Below this width the document panel uses stacked preview + insights (mobile shell only on desktop). */
export const DOCUMENT_SIDE_PANEL_LAYOUT_MIN_WIDTH = 760;
export const COLLAPSED_SIDE_PANEL_WIDTH_RATIO = 0.3;

export function getSidePanelWidthForRatio(
  ratio: number,
  options: { min?: number; max?: number } = {},
): number {
  const { min = 420, max } = options;
  if (typeof window === 'undefined') {
    return min;
  }
  const ratioWidth = Math.round(window.innerWidth * ratio);
  const ceiling = typeof max === 'number' ? Math.min(ratioWidth, max) : ratioWidth;
  return Math.max(min, ceiling);
}

export function getDefaultSidePanelWidth(options: { min?: number; max?: number } = {}): number {
  return getSidePanelWidthForRatio(DEFAULT_SIDE_PANEL_WIDTH_RATIO, options);
}

/** Document / evidence panels — wide enough for canvas + insight column on desktop. */
export function getDocumentSidePanelWidth(options: { min?: number; max?: number } = {}): number {
  return getSidePanelWidthForRatio(DOCUMENT_SIDE_PANEL_WIDTH_RATIO, {
    min: DOCUMENT_SIDE_PANEL_LAYOUT_MIN_WIDTH,
    ...options,
  });
}

export function resolveDocumentSidePanelWidth(currentWidth?: number): number {
  const preferred = getDocumentSidePanelWidth();
  if (!currentWidth || currentWidth < DOCUMENT_SIDE_PANEL_LAYOUT_MIN_WIDTH) return preferred;
  return currentWidth;
}

export function getCollapsedSidePanelWidth(options: { min?: number; max?: number } = {}): number {
  return getSidePanelWidthForRatio(COLLAPSED_SIDE_PANEL_WIDTH_RATIO, { min: 320, ...options });
}
