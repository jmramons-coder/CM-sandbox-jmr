import type { CaseKind, CaseRecord, ClaimSubType } from './objectRefs';

/**
 * Canonical case sub-type enum — aligned with `dataArchitecture` cases.caseSubType
 * and SBLI seed records (claim + new business).
 */
export const CASE_SUBTYPE_SCHEMA_VALUES: readonly ClaimSubType[] = [
  'waiver_of_premium',
  'death_benefit',
  'disability_benefit',
  'full_underwriting',
  'simplified_underwriting',
  'death',
] as const;

/** SBLI carrier case type + workflow ids per sub-type (create + seed fidelity). */
export const CASE_TYPE_METADATA_BY_SUBTYPE: Record<
  ClaimSubType,
  { caseTypeId: string; workflowTemplateId: string; caseTypeLabel: string }
> = {
  disability_benefit: {
    caseTypeId: 'ct_claim_disability',
    workflowTemplateId: 'ct_claim_disability',
    caseTypeLabel: 'Claim — Disability benefit',
  },
  waiver_of_premium: {
    caseTypeId: 'ct_claim_disability',
    workflowTemplateId: 'ct_claim_disability',
    caseTypeLabel: 'Claim — Waiver of premium',
  },
  death_benefit: {
    caseTypeId: 'ct_claim_death',
    workflowTemplateId: 'ct_claim_death',
    caseTypeLabel: 'Claim — Whole life death benefit',
  },
  death: {
    caseTypeId: 'ct_claim_death',
    workflowTemplateId: 'ct_claim_death',
    caseTypeLabel: 'Claim — Death benefit',
  },
  full_underwriting: {
    caseTypeId: 'ct_nb_full_uw',
    workflowTemplateId: 'ct_nb_full_uw',
    caseTypeLabel: 'New business — Full underwriting',
  },
  simplified_underwriting: {
    caseTypeId: 'ct_nb_simplified',
    workflowTemplateId: 'ct_nb_simplified',
    caseTypeLabel: 'New business — Simplified underwriting',
  },
};

/** Claim cases only — shown in create-case when case kind is Claim. */
export const CLAIM_CASE_SUBTYPE_VALUES: readonly ClaimSubType[] = [
  'death_benefit',
  'disability_benefit',
  'waiver_of_premium',
] as const;

/** New business cases only — shown when case kind is New business. */
export const NEW_BUSINESS_SUBTYPE_VALUES: readonly ClaimSubType[] = [
  'full_underwriting',
  'simplified_underwriting',
] as const;

/** All sub-types (catalog / validation). */
export const CLAIM_SUBTYPE_VALUES: readonly ClaimSubType[] = [
  ...CLAIM_CASE_SUBTYPE_VALUES,
  'death',
  ...NEW_BUSINESS_SUBTYPE_VALUES,
] as const;

export const CLAIM_SUBTYPE_LABELS: Record<ClaimSubType, string> = {
  disability_benefit: 'Disability benefit',
  death: 'Death',
  waiver_of_premium: 'Waiver of premium',
  death_benefit: 'Whole life death benefit',
  full_underwriting: 'Full underwriting',
  simplified_underwriting: 'Simplified underwriting',
};

export function subTypesForCaseKind(caseKind: CaseKind): readonly ClaimSubType[] {
  if (caseKind === 'claim') return CLAIM_CASE_SUBTYPE_VALUES;
  if (caseKind === 'new_business') return NEW_BUSINESS_SUBTYPE_VALUES;
  return [];
}

export function defaultSubTypeForCaseKind(caseKind: CaseKind): ClaimSubType | undefined {
  if (caseKind === 'claim') return 'disability_benefit';
  if (caseKind === 'new_business') return 'full_underwriting';
  return undefined;
}

export function isSubTypeAllowedForCaseKind(caseKind: CaseKind, subType: ClaimSubType): boolean {
  return (subTypesForCaseKind(caseKind) as readonly string[]).includes(subType);
}

export function subTypeSectionLabel(caseKind: CaseKind): string {
  if (caseKind === 'claim') return 'Claim sub-type';
  if (caseKind === 'new_business') return 'Underwriting type';
  return 'Sub-type';
}

export function claimSubTypeLabel(sub: ClaimSubType | undefined | null): string {
  if (!sub) return '';
  return CLAIM_SUBTYPE_LABELS[sub] ?? sub;
}

export function isClaimSubType(value: string): value is ClaimSubType {
  return (CLAIM_SUBTYPE_VALUES as readonly string[]).includes(value);
}

/** Alias for schema field `caseSubType` (same enum as claimSubType on catalog rows). */
export const isCaseSubType = isClaimSubType;

export function caseTypeMetadataForSubType(caseKind: CaseKind, subType: ClaimSubType | undefined) {
  if (!subType || !isSubTypeAllowedForCaseKind(caseKind, subType)) return undefined;
  return CASE_TYPE_METADATA_BY_SUBTYPE[subType];
}

/** Validates and returns the sub-type to persist for a case kind (create flows). */
export function normalizeCaseSubTypeForStorage(
  caseKind: CaseKind,
  subType: ClaimSubType | undefined,
): ClaimSubType | undefined {
  const fallback = defaultSubTypeForCaseKind(caseKind);
  const candidate = subType ?? fallback;
  if (!candidate) return undefined;
  if (!isSubTypeAllowedForCaseKind(caseKind, candidate)) {
    throw new Error(`Sub-type "${candidate}" is not valid for case kind "${caseKind}".`);
  }
  return candidate;
}

/** Resolved sub-type for any case kind (claim or new business). */
export function resolveStoredSubType(
  record: Pick<CaseRecord, 'caseKind' | 'caseSubType' | 'caseTypeCode' | 'claimDetails'>,
): ClaimSubType | undefined {
  if (record.caseKind === 'new_business') {
    const top = record.caseSubType;
    return top && isClaimSubType(top) && isSubTypeAllowedForCaseKind('new_business', top) ? top : undefined;
  }
  return resolveClaimSubType(record);
}

/** Canonical sub-type for claim cases; defaults legacy rows without the field. */
export function resolveClaimSubType(
  record: Pick<CaseRecord, 'caseKind' | 'caseSubType' | 'caseTypeCode' | 'claimDetails'>,
): ClaimSubType | undefined {
  if (record.caseKind !== 'claim') return undefined;
  const topLevel = record.caseSubType;
  if (topLevel && isClaimSubType(topLevel)) return topLevel;
  const explicit = record.claimDetails?.claimSubType;
  if (explicit && isClaimSubType(explicit)) return explicit;
  const code = record.caseTypeCode?.toUpperCase();
  if (code === 'DTH') return 'death';
  if (code === 'CD' && record.claimDetails?.claimSubType === 'death_benefit') return 'death_benefit';
  if (code === 'CD' && record.claimDetails?.claimSubType === 'waiver_of_premium') return 'waiver_of_premium';
  return 'disability_benefit';
}

export function caseTypeCodeForClaimSubType(sub: ClaimSubType): string {
  if (sub === 'death' || sub === 'death_benefit') return 'DTH';
  if (sub === 'waiver_of_premium' || sub === 'disability_benefit') return 'IP';
  if (sub === 'full_underwriting' || sub === 'simplified_underwriting') return 'NB';
  return 'IP';
}

/** Flat row for schema / Data → Records: projects sub-types for reporting. */
export function projectCaseRecordForCatalogRow(record: CaseRecord): Record<string, unknown> {
  const base = record as unknown as Record<string, unknown>;
  const resolved = resolveStoredSubType(record);
  if (record.caseKind === 'claim') {
    return {
      ...base,
      caseSubType: record.caseSubType ?? resolved,
      claimSubType: resolved ?? record.claimDetails?.claimSubType,
    };
  }
  if (record.caseKind === 'new_business' && resolved) {
    return { ...base, caseSubType: record.caseSubType ?? resolved };
  }
  return { ...base };
}
