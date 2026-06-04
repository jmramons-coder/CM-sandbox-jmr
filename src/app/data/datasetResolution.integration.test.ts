import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_DATASET_ID } from '../domain/objectRefs';
import { DEMO_ENV_EQUISOFT_ID, DEMO_ENV_SBLI_ID } from './demo-environment-deploy';
import { setActiveDemoConfigurationId } from './datasetResolutionContext';
import { getSystemDataset } from './objectRepository';

describe('dataset resolution by demo environment', () => {
  afterEach(() => {
    setActiveDemoConfigurationId(DEMO_ENV_EQUISOFT_ID);
  });

  it('neutralizes shared demo dataset for Equisoft default', () => {
    setActiveDemoConfigurationId(DEMO_ENV_EQUISOFT_ID);
    const dataset = getSystemDataset(DEFAULT_DATASET_ID);
    expect(dataset.label).toBe('US demo cases');
    expect(dataset.organizationLabel).toBe('Harbor Life');
    const request = dataset.requests.find((row) => row.id === 'REQ-2026-001');
    expect(request?.aiSummary).toContain('HARBOR-TL-');
    expect(request?.aiSummary).not.toContain('SBLI');
  });

  it('preserves SBLI labels when SBLI demo environment is active', () => {
    setActiveDemoConfigurationId(DEMO_ENV_SBLI_ID);
    const dataset = getSystemDataset(DEFAULT_DATASET_ID);
    expect(dataset.label).toBe('SBLI demo cases');
    expect(dataset.organizationLabel).toBe('SBLI');
    const request = dataset.requests.find((row) => row.id === 'REQ-2026-001');
    expect(request?.aiSummary).toContain('SBLI-TL-');
  });
});
