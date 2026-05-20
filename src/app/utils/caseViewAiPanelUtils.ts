export const AI_PANEL_MIN_WIDTH = 420;
/** Left chrome (nav + minimum case strip); used with 0.7 factor for max drawable width. */
export const AI_PANEL_VIEWPORT_RESERVE = 160;

export function maxAiPanelWidth(innerWidth: number): number {
  return Math.max(
    AI_PANEL_MIN_WIDTH,
    Math.floor((innerWidth - AI_PANEL_VIEWPORT_RESERVE) * 0.7),
  );
}

export function clampAiPanelWidth(innerWidth: number, width: number): number {
  return Math.max(AI_PANEL_MIN_WIDTH, Math.min(width, maxAiPanelWidth(innerWidth)));
}

/** Default open width: 60% of viewport, clamped to min/max. */
export function defaultAiPanelWidth(innerWidth: number): number {
  return clampAiPanelWidth(innerWidth, Math.round(innerWidth * 0.6));
}
