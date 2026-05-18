import { describe, expect, it } from 'vitest';
import { DEMO_CASE_IDS } from '../data/demoCaseIds';
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

  it('returns SBLI WOP narrative for Billy Bud case', () => {
    const bundle = getInsightBundle(DEMO_CASE_IDS.wopClaim, 'pre-approval', pre, post, 'active', {
      caseKind: 'claim',
      claimSubType: 'waiver_of_premium',
    });
    expect(bundle.sections[0]?.headline).toContain('Waiver of premium');
    expect(bundle.sections[0]?.body).toContain('Billy Bud');
  });

  it('maps legacy IP26 id to SBLI WOP bundle', () => {
    const bundle = getInsightBundle('IP26-5546112', 'pre-approval', pre, post, 'active');
    expect(bundle.sections[0]?.body).toContain('Billy Bud');
  });

  it('returns death claim narrative for CD44', () => {
    const bundle = getInsightBundle(DEMO_CASE_IDS.deathClaim, 'pre-approval', pre, post, 'active');
    expect(bundle.sections.some((s) => s.body.includes('Marie Dupont'))).toBe(true);
  });

  it('returns NB underwriting narrative for Marc Tremblay', () => {
    const bundle = getInsightBundle(DEMO_CASE_IDS.nbFullUw, 'pre-approval', pre, post, 'active');
    const text = bundle.sections.map((s) => `${s.headline} ${s.body}`).join(' ');
    expect(text).toContain('Marc Tremblay');
    expect(text).toContain('MIB');
  });

  it('returns simplified NB narrative for Elena Rossi', () => {
    const bundle = getInsightBundle(DEMO_CASE_IDS.nbSimpleUw, 'pre-approval', pre, post, 'active');
    const text = bundle.sections.map((s) => `${s.headline} ${s.body}`).join(' ');
    expect(text).toContain('Elena Rossi');
    expect(text).toContain('Accelerated');
  });
});
