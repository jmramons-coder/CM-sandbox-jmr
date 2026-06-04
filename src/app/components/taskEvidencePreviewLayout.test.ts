import { describe, expect, it } from 'vitest';
import {
  TASK_EVIDENCE_PREVIEW_IMAGE_FIT,
  TASK_EVIDENCE_PREVIEW_MIN_HEIGHT_PX,
  TASK_EVIDENCE_PREVIEW_WIDTH_PX,
} from './taskEvidencePreviewLayout';

describe('taskEvidencePreviewLayout', () => {
  it('uses portrait letter proportions taller than the old 68px crop box', () => {
    expect(TASK_EVIDENCE_PREVIEW_WIDTH_PX).toBe(88);
    expect(TASK_EVIDENCE_PREVIEW_MIN_HEIGHT_PX).toBeGreaterThan(68);
    expect(TASK_EVIDENCE_PREVIEW_MIN_HEIGHT_PX).toBe(Math.round(88 * (11 / 8.5)));
  });

  it('fits the full page inside the thumb instead of cover-cropping', () => {
    expect(TASK_EVIDENCE_PREVIEW_IMAGE_FIT).toBe('contain');
  });
});
