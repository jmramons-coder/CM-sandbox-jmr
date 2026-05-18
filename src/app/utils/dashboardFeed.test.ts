import { describe, expect, it } from 'vitest';
import { SBLI_DATASET } from '../data/sbli-dataset';
import { buildDashboardActivityFeed, buildDashboardFollowUps } from './dashboardFeed';

describe('buildDashboardFollowUps', () => {
  it('includes open requirements and documents needing attention from SBLI dataset', () => {
    const rows = buildDashboardFollowUps(SBLI_DATASET, 10);
    expect(rows.some((row) => row.type === 'Requirement' && row.label.includes('FCE'))).toBe(true);
    expect(rows.some((row) => row.type === 'Document')).toBe(true);
  });

  it('uses short subtitles instead of full AI summaries', () => {
    const rows = buildDashboardFollowUps(SBLI_DATASET, 10);
    for (const row of rows) {
      expect((row.subtitle ?? '').length).toBeLessThanOrEqual(56);
      expect(row.subtitle ?? '').not.toMatch(/Blocking requirement|cannot be triggered/i);
    }
  });
});

describe('buildDashboardActivityFeed', () => {
  it('synthesizes activity when activityEvents are empty', () => {
    const caseById = new Map(
      SBLI_DATASET.cases.map((item) => [item.id, { id: item.id, claimant: item.primaryParty?.label }]),
    );
    const feed = buildDashboardActivityFeed(SBLI_DATASET, caseById);
    expect(feed.length).toBeGreaterThan(0);
    expect(feed.some((row) => row.type === 'Document' || row.type === 'Request')).toBe(true);
  });
});
