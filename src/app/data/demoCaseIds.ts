import type { SystemDataset } from './multi-case-dataset';
import { GUARDIAN_DEMO_CASE_IDS, GUARDIAN_DATASET_ID } from './guardianDemoCaseIds';
import { EMPIRE_DEMO_CASE_IDS, EMPIRE_DATASET_ID } from './empireDemoCaseIds';
import { HOMESTEADERS_DEMO_CASE_IDS, HOMESTEADERS_DATASET_ID } from './homesteadersDemoCaseIds';

/** Canonical SBLI demo case IDs — use instead of legacy IP26-* / IP44-* fixtures. */
export const DEMO_CASE_IDS = {
  wopClaim: 'CD26-5546112',
  deathClaim: 'CD44-6679812',
  nbFullUw: 'NB66-7622343',
  nbSimpleUw: 'NB98-9989870',
} as const;

export type DemoCaseId = (typeof DEMO_CASE_IDS)[keyof typeof DEMO_CASE_IDS];

/** Legacy UK IP demo IDs (overlay / migration reference only). */
export const LEGACY_DEMO_CASE_IDS = {
  billyIp: 'IP26-5546112',
  sarahIp: 'IP44-6679812',
  marcIp: 'IP66-7622343',
  elenaWp: 'WP66-998987',
  billyPostApproval: 'IP26-5546200',
} as const;

export const LEGACY_TO_SBLI_CASE_ID: Record<string, DemoCaseId> = {
  [LEGACY_DEMO_CASE_IDS.billyIp]: DEMO_CASE_IDS.wopClaim,
  [LEGACY_DEMO_CASE_IDS.sarahIp]: DEMO_CASE_IDS.deathClaim,
  [LEGACY_DEMO_CASE_IDS.marcIp]: DEMO_CASE_IDS.nbFullUw,
  [LEGACY_DEMO_CASE_IDS.elenaWp]: DEMO_CASE_IDS.nbSimpleUw,
  [LEGACY_DEMO_CASE_IDS.billyPostApproval]: DEMO_CASE_IDS.wopClaim,
};

export function resolveSbliCaseId(caseId: string): string {
  return LEGACY_TO_SBLI_CASE_ID[caseId] ?? caseId;
}

/** Map legacy bookmark URLs (IP26-*, etc.) to canonical ids for the active dataset. */
export function resolveDemoCaseId(caseId: string, activeDatasetId?: string | null): string {
  if (!caseId) return caseId;
  if (activeDatasetId === GUARDIAN_DATASET_ID || activeDatasetId === EMPIRE_DATASET_ID || activeDatasetId === HOMESTEADERS_DATASET_ID) {
    return caseId;
  }
  return resolveSbliCaseId(caseId);
}

export const DEFAULT_DEMO_CASE_ID = DEMO_CASE_IDS.wopClaim;

export function getDefaultCaseIdForDataset(activeDatasetId?: string | null): string {
  if (activeDatasetId === GUARDIAN_DATASET_ID) {
    return GUARDIAN_DEMO_CASE_IDS.incomeProtectionClaim;
  }
  if (activeDatasetId === EMPIRE_DATASET_ID) {
    return EMPIRE_DEMO_CASE_IDS.disabilityClaim;
  }
  if (activeDatasetId === HOMESTEADERS_DATASET_ID) {
    return HOMESTEADERS_DEMO_CASE_IDS.preneedClaimMid;
  }
  return DEFAULT_DEMO_CASE_ID;
}

/** Route-safe case id: legacy remap, then must exist in the active filtered dataset. */
export function resolveCaseRouteId(
  caseId: string | undefined,
  dataset: Pick<SystemDataset, 'id' | 'cases'>,
): string {
  const caseIds = new Set(dataset.cases.map((row) => row.id));
  if (!caseId) {
    return pickExistingCaseId(caseIds, getDefaultCaseIdForDataset(dataset.id));
  }
  const mapped = resolveDemoCaseId(caseId, dataset.id);
  if (caseIds.has(mapped)) return mapped;
  return pickExistingCaseId(caseIds, getDefaultCaseIdForDataset(dataset.id));
}

function pickExistingCaseId(caseIds: Set<string>, preferredId: string): string {
  if (caseIds.has(preferredId)) return preferredId;
  const first = caseIds.values().next().value;
  return first ?? preferredId;
}
