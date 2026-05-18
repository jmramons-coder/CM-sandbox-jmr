/**
 * Default width helpers for right-aligned overlay side panels.
 *
 * All panels (request, document, task, requirement, evidence, AI assistant,
 * case AI activity, …) share the same opening behaviour: they default to 45 %
 * of the viewport, clamped between a min and an optional max so the panel
 * never collapses below a usable width or covers the full page.
 */

export const DEFAULT_SIDE_PANEL_WIDTH_RATIO = 0.45;
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

export function getCollapsedSidePanelWidth(options: { min?: number; max?: number } = {}): number {
  return getSidePanelWidthForRatio(COLLAPSED_SIDE_PANEL_WIDTH_RATIO, { min: 320, ...options });
}
