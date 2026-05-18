import { describe, expect, it } from 'vitest';
import {
  deriveDocumentSummaryTitle,
  documentSummarySubtitle,
  stripSummaryTitleDecorators,
} from './summaryText';

describe('stripSummaryTitleDecorators', () => {
  it('removes leading sparkle and surrounding space', () => {
    expect(stripSummaryTitleDecorators('✦ AI: verify beneficiary')).toBe('AI: verify beneficiary');
  });

  it('leaves text unchanged when no sparkle', () => {
    expect(stripSummaryTitleDecorators('Medical Review Complete')).toBe('Medical Review Complete');
  });
});

describe('deriveDocumentSummaryTitle', () => {
  const file = 'Attending Physician Statement.pdf';

  it('uses em-dash headline when present', () => {
    expect(
      deriveDocumentSummaryTitle(
        file,
        'No discrepancies found — application disclosures match MIB record.',
      ),
    ).toBe('No discrepancies found');
  });

  it('uses first sentence when multiple sentences', () => {
    expect(
      deriveDocumentSummaryTitle(
        file,
        'Right knee replacement documented. 6–9 month recovery precludes manual labour.',
      ),
    ).toBe('Right knee replacement documented');
  });

  it('falls back to file name without summary', () => {
    expect(deriveDocumentSummaryTitle(file)).toBe(file);
  });
});

describe('documentSummarySubtitle', () => {
  it('returns full text when headline is shorter than body', () => {
    expect(
      documentSummarySubtitle(
        'MIB Disclosure Comparison.pdf',
        'No discrepancies found — application disclosures match MIB record.',
      ),
    ).toBe('No discrepancies found — application disclosures match MIB record.');
  });
});
