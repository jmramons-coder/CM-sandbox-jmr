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

export const DEFAULT_DEMO_CASE_ID = DEMO_CASE_IDS.wopClaim;
