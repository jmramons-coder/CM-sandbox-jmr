export type DocumentHighlightRect = {
  top: string;
  left: string;
  width: string;
  height: string;
};

/** Body-text highlights align to the document's left margin (Riverside / APS layout). */
const BODY_TEXT_LEFT = 2.4;
const BODY_TEXT_WIDTH = 93;

const FINDING_HIGHLIGHT_BY_ID: Record<string, DocumentHighlightRect> = {
  // Attending Physician Statement — page 1 (Riverside specialist report)
  doc_aps_cd26_anchor_1: { top: '37.8%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '5.8%' },
  doc_aps_cd26_anchor_2: { top: '52.4%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '13.5%' },
  doc_aps_cd26_anchor_3: { top: '71.6%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '8.2%' },
  // Surgical report (same page asset)
  doc_surgical_cd26_anchor_1: { top: '37.8%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '5.8%' },
  doc_surgical_cd26_anchor_2: { top: '58.2%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '10.5%' },
  // Address change verification package
  'missing-government-id': { top: '52.0%', left: `${BODY_TEXT_LEFT}%`, width: '68%', height: '3.4%' },
  'client-statement-scope': { top: '27.1%', left: '58%', width: '36%', height: '10%' },
  'unit-format-variance': { top: '61.6%', left: '28%', width: '48%', height: '11.2%' },
};

const DEFAULT_BODY_HIGHLIGHTS: DocumentHighlightRect[] = [
  { top: '37.8%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '5.8%' },
  { top: '52.4%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '12%' },
  { top: '71.6%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '8%' },
];

/**
 * Nudge margin-aligned highlights further left so wrapped body copy is fully covered.
 * Skips column-positioned regions (e.g. right-side form fields) where left is already far right.
 */
export function normalizeDocumentHighlight(rect: DocumentHighlightRect): DocumentHighlightRect {
  const leftPct = Number.parseFloat(rect.left);
  const widthPct = Number.parseFloat(rect.width);

  if (leftPct >= 18) {
    return rect;
  }

  const targetLeft = Math.min(leftPct, BODY_TEXT_LEFT);
  const leftDelta = leftPct - targetLeft;
  const nextWidth = Math.min(98 - targetLeft, widthPct + leftDelta + 1.5);

  return {
    top: rect.top,
    left: `${targetLeft}%`,
    width: `${nextWidth}%`,
    height: rect.height,
  };
}

export function resolveDocumentFindingHighlight(
  findingId: string,
  fallbackIndex = 0,
): DocumentHighlightRect {
  const preset = FINDING_HIGHLIGHT_BY_ID[findingId];
  const rect = preset ?? DEFAULT_BODY_HIGHLIGHTS[fallbackIndex % DEFAULT_BODY_HIGHLIGHTS.length];
  return normalizeDocumentHighlight(rect);
}
