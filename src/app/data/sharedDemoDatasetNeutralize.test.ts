import { describe, expect, it } from 'vitest';
import { SBLI_DATASET } from './sbli-dataset';
import {
  applyNeutralCarrierToText,
  neutralizeSharedDemoDataset,
  SHARED_DEMO_NEUTRAL_CARRIER,
} from './sharedDemoDatasetNeutralize';

describe('sharedDemoDatasetNeutralize', () => {
  it('replaces dataset metadata and carrier strings', () => {
    const neutral = neutralizeSharedDemoDataset(SBLI_DATASET);
    expect(neutral.label).toBe(SHARED_DEMO_NEUTRAL_CARRIER.datasetLabel);
    expect(neutral.organizationLabel).toBe(SHARED_DEMO_NEUTRAL_CARRIER.name);
    expect(neutral.description).not.toContain('SBLI');
    expect(neutral.environmentFit).not.toContain('SBLI');
  });

  it('rewrites policy numbers and product names in requests', () => {
    const neutral = neutralizeSharedDemoDataset(SBLI_DATASET);
    const wopRequest = neutral.requests.find((row) => row.id === 'REQ-2026-001');
    expect(wopRequest?.aiSummary).toContain('HARBOR-TL-');
    expect(wopRequest?.aiSummary).not.toContain('SBLI');
    expect(wopRequest?.form?.channel).toBe('Client portal');
  });

  it('preserves stable ids and rewrites policy numbers on object refs', () => {
    const neutral = neutralizeSharedDemoDataset(SBLI_DATASET);
    expect(neutral.id).toBe('multi-case-demo');
    expect(neutral.cases.map((row) => row.id).sort()).toEqual(
      SBLI_DATASET.cases.map((row) => row.id).sort(),
    );
    expect(neutral.generationProfileId).toBe(SBLI_DATASET.generationProfileId);
    const wopCase = neutral.cases.find((row) => row.id === 'CD26-5546112');
    const policyRef = wopCase?.linkedObjects?.find((ref) => ref.id?.includes('HARBOR-TL'));
    expect(policyRef?.label).toBe('Term Life 20');
    expect(wopCase?.contextCard?.planRef?.id).toBe('HARBOR-TL-2021-004821');
  });

  it('applies ordered replacements for standalone text', () => {
    expect(applyNeutralCarrierToText('SBLI Simple Term Life online at SBLI.com')).toBe(
      'Simple Term Life online at harborlife.com',
    );
  });

  it('uses Harbor Life address change form preview asset', () => {
    const neutral = neutralizeSharedDemoDataset(SBLI_DATASET);
    const doc = neutral.documents.find((row) => row.id === 'doc_addr_change_form');
    const evidence = neutral.documentEvidence.find((row) => row.documentId === 'doc_addr_change_form');
    expect(doc?.fileUrl).toBe('/documents/equisoft/Mailing_address_change_form_whitfield.png');
    expect(evidence?.pages[0]?.image).toBe('/documents/equisoft/Mailing_address_change_form_whitfield.png');
    const sbliDoc = SBLI_DATASET.documents.find((row) => row.id === 'doc_addr_change_form');
    expect(sbliDoc?.fileUrl).toContain('/documents/sbli/');
  });
});
