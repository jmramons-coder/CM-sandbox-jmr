import { describe, expect, it } from 'vitest';
import { SBLI_DATASET } from '../sbli-dataset';
import { getUserProfile } from '../userProfiles';
import { buildDailyBrief } from './buildDailyBrief';

describe('dailyBrief', () => {
  const profile = getUserProfile('assessor');

  it.each(['home', 'cases', 'tasks', 'requests', 'documents', 'ai-actions'] as const)(
    'builds dynamic segments for %s context',
    (contextId) => {
      const brief = buildDailyBrief(SBLI_DATASET, profile, { contextId, roleView: 'assessor' });
      expect(brief.segments.length).toBeGreaterThan(0);
      expect(brief.text.length).toBeGreaterThan(12);
      expect(brief.source).toBe('dynamic');
    },
  );
});
