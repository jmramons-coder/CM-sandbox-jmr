import { describe, expect, it } from 'vitest';
import { getInsightBundle } from './caseInsightsData';

const pre = ['A', 'B', 'C', 'D', 'E'] as const;
const post = ['P1', 'P2', 'P3', 'P4'] as const;

describe('getInsightBundle', () => {
  it('uses death-specific copy for death claims', () => {
    const bundle = getInsightBundle('DTH26-440091', 'pre-approval', pre, post, 'active', {
      caseKind: 'claim',
      claimSubType: 'death',
    });
    expect(bundle.sections[0]?.body).toContain('beneficiary');
    expect(bundle.sections[0]?.body).toContain('death benefit');
  });

  it('uses disability-specific copy for disability benefit claims', () => {
    const bundle = getInsightBundle('IP26-999999', 'pre-approval', pre, post, 'active', {
      caseKind: 'claim',
      claimSubType: 'disability_benefit',
    });
    expect(bundle.sections[0]?.body).toContain('disability-benefit');
    expect(bundle.sections[0]?.body).toContain('RTW');
    expect(bundle.sections[0]?.body).not.toContain('probate');
  });

  it('keeps Billy IP fixture narrative independent of subtype options', () => {
    const bundle = getInsightBundle('IP26-5546112', 'pre-approval', pre, post, 'active', {
      caseKind: 'claim',
      claimSubType: 'disability_benefit',
    });
    expect(bundle.sections[0]?.headline).toContain('winter morning');
  });
});
