const EMBEDDED_CONFIDENCE_PATTERN = /\s*AI confidence:\s*(\d+(?:\.\d+)?)\s*%\.?\s*$/i;

function normalizeConfidence(value: number): number {
  const scaled = value > 0 && value <= 1 ? value * 100 : value;
  return Math.max(0, Math.min(100, Math.round(scaled)));
}

/** Strip trailing "AI confidence: N%" from summary copy for side-panel display. */
export function resolveAiSummaryPresentation(
  text: string | undefined | null,
  confidence?: number | null,
): { text: string; confidence?: number } {
  const source = (text ?? '').trim();
  if (!source) return { text: '' };

  let resolvedText = source;
  let resolvedConfidence = confidence ?? undefined;

  const match = source.match(EMBEDDED_CONFIDENCE_PATTERN);
  if (match) {
    if (resolvedConfidence == null) {
      resolvedConfidence = normalizeConfidence(Number(match[1]));
    }
    resolvedText = source.slice(0, match.index).trim();
  }

  if (resolvedConfidence != null) {
    resolvedConfidence = normalizeConfidence(resolvedConfidence);
  }

  return { text: resolvedText, confidence: resolvedConfidence };
}
