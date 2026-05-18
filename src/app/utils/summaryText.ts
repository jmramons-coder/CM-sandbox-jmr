const SUMMARY_TITLE_MAX_LEN = 72;

/** Removes legacy ✦ prefix from summary titles (AI is indicated by the first-column badge). */
export function stripSummaryTitleDecorators(text: string): string {
  return text.replace(/^\s*✦\s*/, '').trim();
}

function truncateAtWord(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const slice = text.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(' ');
  return (lastSpace > 20 ? slice.slice(0, lastSpace) : slice).trim();
}

function normalizeForCompare(text: string): string {
  return text.replace(/\.\s*$/, '').trim().toLowerCase();
}

/**
 * Headline for the Summary column — derived from the AI sub-sentence, not the file name.
 */
export function deriveDocumentSummaryTitle(documentName: string, summary?: string): string {
  const body = summary?.trim();
  if (!body) return stripSummaryTitleDecorators(documentName);

  const cleaned = stripSummaryTitleDecorators(body);

  const dashHeadline = cleaned.split(/\s*—\s*/)[0]?.trim();
  if (dashHeadline && dashHeadline.length >= 8 && dashHeadline.length <= SUMMARY_TITLE_MAX_LEN && cleaned.includes('—')) {
    return dashHeadline.replace(/\.\s*$/, '').trim();
  }

  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length >= 2) {
    return sentences[0].replace(/\.\s*$/, '').trim();
  }

  const andSupports = cleaned.match(/^(.+?)\s+and\s+supports\s+/i);
  if (andSupports?.[1] && andSupports[1].length >= 12) {
    return andSupports[1].replace(/\.\s*$/, '').trim();
  }

  const commaLead = cleaned.split(/\s*,\s*/)[0]?.trim();
  if (commaLead && commaLead.length >= 12 && commaLead.length < cleaned.length) {
    return commaLead.replace(/\.\s*$/, '').trim();
  }

  if (cleaned.length > SUMMARY_TITLE_MAX_LEN) {
    return truncateAtWord(cleaned.replace(/\.\s*$/, ''), SUMMARY_TITLE_MAX_LEN);
  }

  return cleaned.replace(/\.\s*$/, '').trim();
}

/** Full sub-sentence for Summary body; omitted when it would repeat the headline. */
export function documentSummarySubtitle(
  documentName: string,
  summary?: string,
): string | undefined {
  const body = summary?.trim();
  if (!body) return undefined;

  const title = deriveDocumentSummaryTitle(documentName, body);
  const cleaned = stripSummaryTitleDecorators(body);
  if (normalizeForCompare(title) === normalizeForCompare(cleaned)) return undefined;
  return cleaned;
}
