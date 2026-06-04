/** Task evidence card preview column — portrait letter ratio at fixed width. */
export const TASK_EVIDENCE_PREVIEW_WIDTH_PX = 88;

/** Minimum thumb height (US letter ~8.5×11 at preview width). */
export const TASK_EVIDENCE_PREVIEW_MIN_HEIGHT_PX = Math.round(
  TASK_EVIDENCE_PREVIEW_WIDTH_PX * (11 / 8.5),
);

export const TASK_EVIDENCE_PREVIEW_IMAGE_FIT = 'contain' as const;
