import { describe, expect, it } from 'vitest';
import { getSystemDataset } from './objectRepository';
import { filterDatasetBySettings } from './objectRepository';
import { DEFAULT_DATA_SOURCE_SETTINGS } from '../domain/objectRefs';
import {
  DEFAULT_DEMO_CASE_ID,
  DEMO_CASE_IDS,
  resolveCaseRouteId,
} from './demoCaseIds';
import { GUARDIAN_DEMO_CASE_IDS, GUARDIAN_DATASET_ID } from './guardianDemoCaseIds';
import { EMPIRE_DEMO_CASE_IDS, EMPIRE_DATASET_ID } from './empireDemoCaseIds';

describe('resolveCaseRouteId', () => {
  const sbliDataset = filterDatasetBySettings(
    getSystemDataset('multi-case-demo'),
    { ...DEFAULT_DATA_SOURCE_SETTINGS, activeDatasetId: 'multi-case-demo' },
  );
  const guardianDataset = filterDatasetBySettings(
    getSystemDataset(GUARDIAN_DATASET_ID),
    { ...DEFAULT_DATA_SOURCE_SETTINGS, activeDatasetId: GUARDIAN_DATASET_ID },
  );
  const empireDataset = filterDatasetBySettings(
    getSystemDataset(EMPIRE_DATASET_ID),
    { ...DEFAULT_DATA_SOURCE_SETTINGS, activeDatasetId: EMPIRE_DATASET_ID },
  );

  it('keeps a valid SBLI case id', () => {
    expect(resolveCaseRouteId(DEMO_CASE_IDS.wopClaim, sbliDataset)).toBe(DEMO_CASE_IDS.wopClaim);
  });

  it('remaps legacy IP26 to SBLI default case', () => {
    expect(resolveCaseRouteId('IP26-5546112', sbliDataset)).toBe(DEMO_CASE_IDS.wopClaim);
  });

  it('redirects Guardian bookmark to SBLI default when SBLI dataset is active', () => {
    expect(resolveCaseRouteId(GUARDIAN_DEMO_CASE_IDS.criticalIllnessClaim, sbliDataset)).toBe(
      DEFAULT_DEMO_CASE_ID,
    );
  });

  it('keeps a valid Guardian case id', () => {
    expect(resolveCaseRouteId(GUARDIAN_DEMO_CASE_IDS.criticalIllnessClaim, guardianDataset)).toBe(
      GUARDIAN_DEMO_CASE_IDS.criticalIllnessClaim,
    );
  });

  it('redirects SBLI bookmark to Guardian default when Guardian dataset is active', () => {
    expect(resolveCaseRouteId(DEMO_CASE_IDS.wopClaim, guardianDataset)).toBe(
      GUARDIAN_DEMO_CASE_IDS.incomeProtectionClaim,
    );
  });

  it('keeps a valid Empire case id', () => {
    expect(resolveCaseRouteId(EMPIRE_DEMO_CASE_IDS.disabilityClaim, empireDataset)).toBe(
      EMPIRE_DEMO_CASE_IDS.disabilityClaim,
    );
  });

  it('redirects SBLI bookmark to Empire default when Empire dataset is active', () => {
    expect(resolveCaseRouteId(DEMO_CASE_IDS.wopClaim, empireDataset)).toBe(
      EMPIRE_DEMO_CASE_IDS.disabilityClaim,
    );
  });
});
