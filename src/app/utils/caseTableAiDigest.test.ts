import { describe, expect, it } from 'vitest';
import { filterDatasetBySettings, getSystemDataset, listCaseSummaries } from '../data/objectRepository';
import { DEMO_CASE_IDS } from '../data/demoCaseIds';
import { resolveCaseTableAiDigest } from './caseTableAiDigest';

describe('resolveCaseTableAiDigest', () => {
  it('builds context and focus lines for WOP case with dataset requirements', () => {
    const dataset = getSystemDataset('sbli');
    const summary = listCaseSummaries(dataset).find((row) => row.id === DEMO_CASE_IDS.wopClaim);
    expect(summary).toBeTruthy();

    const digest = resolveCaseTableAiDigest(summary!, dataset);

    expect(digest.kind).not.toBe('empty');
    expect(digest.context).toMatch(/requirements/i);
    expect(digest.focus?.length).toBeGreaterThan(10);
    expect(digest.full).toContain(digest.context);
  });

  it('falls back to aiSummary when no requirements are loaded', () => {
    const summary = {
      id: 'CD44-6679812',
      claimant: 'Marie Dupont',
      product: 'Term Life',
      benefit: '$500,000',
      status: 'Pending Decision',
      phase: 'pre-approval' as const,
      rag: 'Green' as const,
      aiRecommendation: 'Approve' as const,
      aiSummary: 'All documents validated — recommends approval at 96% confidence',
      priority: 'High' as const,
      sla: '2d',
      created: 'Mar 1, 2026',
    };

    const digest = resolveCaseTableAiDigest(summary);

    expect(digest.context).toContain('All documents validated');
    expect(digest.focusLabel).toBe('Approve');
    expect(digest.focus).toMatch(/decision/i);
  });

  it('marks urgent pending cases as exception tone', () => {
    const dataset = filterDatasetBySettings(getSystemDataset('sbli'), {
      activeDatasetId: 'sbli',
      enabledWorkflows: ['claim', 'new_business', 'customer_service'],
      enabledObjectDomains: ['case', 'task', 'document', 'request'],
      legacyMockOverlayEnabled: false,
    });
    const summary = listCaseSummaries(dataset).find((row) => row.rag === 'Red' || row.priority === 'High');
    expect(summary).toBeTruthy();

    const digest = resolveCaseTableAiDigest(summary!, dataset);
    if (summary!.aiRecommendation === 'Pending') {
      expect(digest.kind).toBe('exception');
    }
  });
});
